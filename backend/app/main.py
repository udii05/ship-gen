from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from .config import settings
from .db import engine, Base
from .routes import auth, projects, settings as settings_routes, deploy

Base.metadata.create_all(bind=engine)


def _apply_additive_migrations():
    """create_all() won't add columns to existing tables — do tiny additive migrations here."""
    try:
        inspector = inspect(engine)
        columns = [c["name"] for c in inspector.get_columns("users")]
        if "clerk_id" not in columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE users ADD COLUMN clerk_id VARCHAR(64)"))
    except Exception:
        # Fresh DBs are already correct; never block startup on a best-effort migration.
        pass


_apply_additive_migrations()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(settings_routes.router)
app.include_router(deploy.router)


@app.get("/health")
def health():
    return {"status": "ok", "default_provider": settings.default_model_provider,
            "default_model": settings.default_model_name}
