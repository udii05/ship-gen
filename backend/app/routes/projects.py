import io
import os
import re
import shutil
import zipfile
from datetime import datetime, timezone
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..config import settings
from ..db import get_db
from ..models import Project, Approval, AgentRun
from ..schemas import ProjectCreate, ProjectOut, RunOut, StepOut, ApprovalOut, ReviseIn
from ..deps import get_current_user
from ..models import User
from ..agents.orchestrator import run_pipeline
from ..agents.core import revision_agent

router = APIRouter(prefix="/projects", tags=["projects"])


def _safe_product_dir(project: Project) -> str:
    """Resolve and validate the generated product directory (guards path traversal)."""
    if not project.repo_path:
        raise HTTPException(status_code=404, detail="Product not generated yet")
    root = os.path.abspath(project.repo_path)
    workspace = os.path.abspath(settings.workspace_root)
    if not root.startswith(workspace):
        raise HTTPException(status_code=400, detail="Invalid product path")
    return root


def _index_html_path(project: Project) -> str:
    root = _safe_product_dir(project)
    path = os.path.join(root, "index.html")
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="index.html not found in workspace")
    return path


def _clean_html(html: str) -> str:
    html = html.strip()
    if html.startswith("```"):
        html = re.sub(r"^```[a-zA-Z]*\n?", "", html)
        html = re.sub(r"\n?```$", "", html)
    if "<!DOCTYPE html>" not in html and "<html" not in html:
        html = "<!DOCTYPE html>\n" + html
    return html


def _serialize(p: Project) -> ProjectOut:
    return ProjectOut(
        id=p.id, title=p.title, prompt=p.prompt, product_type=p.product_type,
        status=p.status, current_phase=p.current_phase, prd=p.prd,
        competitive_analysis=p.competitive_analysis, architecture=p.architecture,
        design=p.design, code_summary=p.code_summary, repo_path=p.repo_path,
        deploy_status=p.deploy_status, deploy_url=p.deploy_url,
        created_at=p.created_at.isoformat() if p.created_at else "",
    )


@router.post("", response_model=ProjectOut)
def create_project(payload: ProjectCreate, user: User = Depends(get_current_user),
                   db: Session = Depends(get_db)):
    p = Project(user_id=user.id, title=payload.title or "Untitled Product",
                prompt=payload.prompt, status="draft")
    db.add(p)
    db.commit()
    db.refresh(p)
    return _serialize(p)


@router.get("", response_model=list[ProjectOut])
def list_projects(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(Project).filter(Project.user_id == user.id).order_by(Project.id.desc()).all()
    return [_serialize(p) for p in items]


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, user: User = Depends(get_current_user),
                db: Session = Depends(get_db)):
    p = db.get(Project, project_id)
    if not p or p.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return _serialize(p)


@router.get("/{project_id}/approvals", response_model=list[ApprovalOut])
def get_approvals(project_id: int, user: User = Depends(get_current_user),
                  db: Session = Depends(get_db)):
    p = db.get(Project, project_id)
    if not p or p.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    return [ApprovalOut(gate=a.gate, status=a.status) for a in p.approvals]


@router.post("/{project_id}/start")
async def start_pipeline(project_id: int, background_tasks: BackgroundTasks,
                         user: User = Depends(get_current_user),
                         db: Session = Depends(get_db)):
    p = db.get(Project, project_id)
    if not p or p.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    # Invalidate stale runs from previous attempts so the retry starts clean.
    db.query(AgentRun).filter(AgentRun.project_id == project_id,
                              AgentRun.status.in_(["queued", "running"])).update(
        {"status": "failed", "phase": "stale"}, synchronize_session=False)
    db.commit()
    background_tasks.add_task(run_pipeline, project_id)
    return {"status": "started", "project_id": project_id}


@router.post("/{project_id}/approve/{gate}")
async def approve_gate(project_id: int, gate: str, background_tasks: BackgroundTasks,
                       user: User = Depends(get_current_user),
                       db: Session = Depends(get_db)):
    p = db.get(Project, project_id)
    if not p or p.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    if gate not in ("prd", "design"):
        raise HTTPException(status_code=400, detail="Unknown gate")
    a = db.query(Approval).filter(Approval.project_id == project_id,
                                  Approval.gate == gate).first()
    if not a:
        raise HTTPException(status_code=404, detail="No pending approval for this gate")
    a.status = "approved"
    a.decided_by = user.id
    a.decided_at = datetime.now(timezone.utc)
    db.commit()
    # Resume the pipeline after approval (runs in background; UI polls progress).
    background_tasks.add_task(run_pipeline, project_id)
    return {"status": "approved", "gate": gate}


@router.get("/{project_id}/run", response_model=RunOut)
def get_run(project_id: int, user: User = Depends(get_current_user),
            db: Session = Depends(get_db)):
    p = db.get(Project, project_id)
    if not p or p.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    run = db.query(AgentRun).filter(AgentRun.project_id == project_id).order_by(
        AgentRun.id.desc()).first()
    if not run:
        raise HTTPException(status_code=404, detail="No run yet")
    steps = [StepOut(agent=s.agent, status=s.status, detail=s.detail,
                     tokens_in=s.tokens_in, tokens_out=s.tokens_out) for s in run.steps]
    return RunOut(id=run.id, status=run.status, phase=run.phase, steps=steps)


@router.delete("/{project_id}")
def delete_project(project_id: int, user: User = Depends(get_current_user),
                   db: Session = Depends(get_db)):
    """Permanently delete a project: DB rows (runs, steps, approvals cascade),
    generated workspace files. No trace remains."""
    p = db.get(Project, project_id)
    if not p or p.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    # Remove generated files from the workspace (path-guarded, best-effort).
    if p.repo_path:
        root = os.path.abspath(p.repo_path)
        workspace = os.path.abspath(settings.workspace_root)
        if root.startswith(workspace) and os.path.isdir(root):
            shutil.rmtree(root, ignore_errors=True)
    db.delete(p)  # cascades to runs -> steps and approvals
    db.commit()
    return {"status": "deleted", "project_id": project_id}


@router.get("/{project_id}/preview")
def preview_product(project_id: int, user: User = Depends(get_current_user),
                    db: Session = Depends(get_db)):
    """Return the generated index.html for the live preview panel."""
    p = db.get(Project, project_id)
    if not p or p.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    path = _index_html_path(p)
    with open(path, "r", encoding="utf-8") as f:
        return {"html": f.read()}


@router.get("/{project_id}/download")
def download_product(project_id: int, user: User = Depends(get_current_user),
                     db: Session = Depends(get_db)):
    """Zip the generated product directory and return it as a file download."""
    p = db.get(Project, project_id)
    if not p or p.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    root = _safe_product_dir(p)
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for fname in sorted(os.listdir(root)):
            fpath = os.path.join(root, fname)
            if os.path.isfile(fpath):
                z.write(fpath, arcname=fname)
    buf.seek(0)
    slug = re.sub(r"[^a-z0-9]+", "-", p.title.lower()).strip("-") or f"project-{p.id}"
    return Response(
        content=buf.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{slug}.zip"'},
    )


@router.post("/{project_id}/revise")
async def revise_product(project_id: int, payload: ReviseIn,
                         user: User = Depends(get_current_user),
                         db: Session = Depends(get_db)):
    """Ask the agent to apply a change to the generated product; returns the updated HTML."""
    p = db.get(Project, project_id)
    if not p or p.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    if not payload.instruction.strip():
        raise HTTPException(status_code=400, detail="Instruction is required")
    path = _index_html_path(p)
    with open(path, "r", encoding="utf-8") as f:
        current = f.read()
    try:
        html = await revision_agent(user, current, payload.instruction.strip())
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Revision failed: {e}")
    html = _clean_html(html)
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    return {"html": html}
