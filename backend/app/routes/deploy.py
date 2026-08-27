from datetime import datetime, timezone
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import SessionLocal, get_db
from ..models import Project, User
from ..schemas import DeployIn
from ..deps import get_current_user
from ..agents.deployer import deploy_project

router = APIRouter(prefix="/projects", tags=["deploy"])


def _do_deploy(project_id: int, vercel_token: str):
    # Runs in background. Uses the USER's own token; never auto-triggered.
    db = SessionLocal()
    try:
        p = db.get(Project, project_id)
        if not p:
            return
        p.deploy_status = "requested"
        db.commit()
        status, message = deploy_project(p, vercel_token)
        p.deploy_status = status
        if status == "done":
            p.deploy_url = message
        p.updated_at = datetime.now(timezone.utc)
        db.commit()
    finally:
        db.close()


@router.post("/{project_id}/deploy")
def deploy(project_id: int, payload: DeployIn,
           user: User = Depends(get_current_user), db: Session = Depends(get_db),
           background_tasks: BackgroundTasks = None):
    p = db.get(Project, project_id)
    if not p or p.user_id != user.id:
        raise HTTPException(status_code=404, detail="Project not found")
    if not p.repo_path:
        raise HTTPException(status_code=400, detail="Build the product before deploying")
    if not payload.vercel_token:
        raise HTTPException(status_code=400, detail="Provide your own Vercel token to deploy")
    background_tasks.add_task(_do_deploy, project_id, payload.vercel_token)
    return {"status": "deploy requested", "project_id": project_id}
