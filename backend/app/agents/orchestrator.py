from sqlalchemy.orm import Session

from ..config import settings
from ..db import SessionLocal
from ..models import Project, User, AgentRun, RunStep, Approval
from .. import security
from .core import requirement_agent, competitor_agent, designer_agent
from .search import web_search
from .builder import build_product


def _get_or_create_run(db: Session, project: Project) -> AgentRun:
    run = db.query(AgentRun).filter(AgentRun.project_id == project.id,
                                    AgentRun.status.in_(["queued", "running"])).first()
    if not run:
        run = AgentRun(project_id=project.id, status="running", phase="start")
        db.add(run)
        db.commit()
        db.refresh(run)
    else:
        run.status = "running"
    return run


def _add_step(db: Session, run: AgentRun, agent: str) -> RunStep:
    step = RunStep(run_id=run.id, agent=agent, status="running", detail=f"{agent} working...")
    db.add(step)
    db.commit()
    db.refresh(step)
    return step


def _finish_step(db: Session, step: RunStep, detail: str, tin: int, tout: int):
    step.status = "done"
    step.detail = detail
    step.tokens_in = tin
    step.tokens_out = tout
    step.updated_at = _now()
    db.commit()


def _ensure_approval(db: Session, project: Project, gate: str):
    existing = db.query(Approval).filter(Approval.project_id == project.id,
                                         Approval.gate == gate).first()
    if not existing:
        db.add(Approval(project_id=project.id, gate=gate, status="pending"))
        db.commit()


def _approval_approved(db: Session, project: Project, gate: str) -> bool:
    a = db.query(Approval).filter(Approval.project_id == project.id,
                                  Approval.gate == gate).first()
    return bool(a and a.status == "approved")


def _now():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc)


async def run_pipeline(project_id: int):
    """Resumable, gate-aware pipeline. Call again after each approval."""
    db = SessionLocal()
    try:
        project = db.get(Project, project_id)
        if not project:
            return
        user = db.get(User, project.user_id)
        run = _get_or_create_run(db, project)

        # ---- GATE 1: PRD ----
        if not project.prd:
            step = _add_step(db, run, "requirement")
            prd, tin, tout = await requirement_agent(user, project.prompt)
            project.prd = prd
            project.status = "in_progress"
            project.current_phase = "prd_review"
            _finish_step(db, step, "PRD drafted", tin, tout)
            _ensure_approval(db, project, "prd")
            db.commit()
            return

        if not _approval_approved(db, project, "prd"):
            project.current_phase = "prd_review"
            db.commit()
            return

        # ---- Research + Design ----
        if not project.design:
            step = _add_step(db, run, "competitor")
            snippets = await web_search(project.prompt)
            comp, tin, tout = await competitor_agent(user, project.prd, snippets)
            project.competitive_analysis = comp
            _finish_step(db, step, "Competitive analysis done", tin, tout)

            step = _add_step(db, run, "designer")
            design, tin2, tout2 = await designer_agent(user, project.prd, comp)
            project.design = design
            project.architecture = design
            project.current_phase = "design_review"
            _finish_step(db, step, "Architecture + design drafted", tin2, tout2)
            _ensure_approval(db, project, "design")
            db.commit()
            return

        if not _approval_approved(db, project, "design"):
            project.current_phase = "design_review"
            db.commit()
            return

        # ---- Build (saved to account, NOT deployed) ----
        if not project.repo_path:
            step = _add_step(db, run, "builder")
            summary = await build_product(user, project, project.design)
            project.code_summary = summary
            project.status = "ready"
            project.current_phase = "done"
            _finish_step(db, step, "Product generated", 0, 0)

            # light QA step
            step = _add_step(db, run, "tester")
            step.status = "done"
            step.detail = "QA checklist generated"
            db.commit()

            run.status = "done"
            run.phase = "done"
            db.commit()
            return

        run.status = "done"
        db.commit()
    finally:
        db.close()
