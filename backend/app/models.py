from datetime import datetime, timezone

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, JSON,
)
from sqlalchemy.orm import relationship

from .db import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(320), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False, default="")
    # Clerk identity (set for users who sign in via Clerk — Google/GitHub/email+password)
    clerk_id = Column(String(64), unique=True, index=True, nullable=True)
    # Per-user model config (used instead of system free tier when set)
    model_provider = Column(String(32), default="")  # gemini | openai | ""
    model_name = Column(String(128), default="")
    encrypted_api_key = Column(Text, default="")  # Fernet-encrypted user key
    created_at = Column(DateTime, default=utcnow)

    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), default="Untitled Product")
    prompt = Column(Text, default="")
    product_type = Column(String(64), default="")  # web | saas | chatbot | landing | other

    # Generated artifacts (text)
    prd = Column(Text, default="")
    competitive_analysis = Column(Text, default="")
    architecture = Column(Text, default="")
    design = Column(Text, default="")
    code_summary = Column(Text, default="")

    status = Column(String(32), default="draft")  # draft | in_progress | ready | deployed
    current_phase = Column(String(32), default="")
    repo_path = Column(String(512), default="")  # workspace dir
    deploy_status = Column(String(32), default="none")  # none | requested | done | failed
    deploy_url = Column(String(512), default="")
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    owner = relationship("User", back_populates="projects")
    runs = relationship("AgentRun", back_populates="project", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="project", cascade="all, delete-orphan")


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    status = Column(String(32), default="queued")  # queued | running | done | failed
    phase = Column(String(32), default="")
    tokens_in = Column(Integer, default=0)
    tokens_out = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    project = relationship("Project", back_populates="runs")
    steps = relationship("RunStep", back_populates="run", cascade="all, delete-orphan")


class RunStep(Base):
    __tablename__ = "run_steps"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("agent_runs.id"), nullable=False, index=True)
    agent = Column(String(32), nullable=False)  # requirement|competitor|designer|coder|tester|deploy
    status = Column(String(32), default="pending")  # pending | running | done | failed | skipped
    detail = Column(Text, default="")  # short human-readable summary
    output = Column(Text, default="")  # longer captured output / artifact path
    tokens_in = Column(Integer, default=0)
    tokens_out = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    run = relationship("AgentRun", back_populates="steps")


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    gate = Column(String(32), nullable=False)  # prd | design | deploy
    status = Column(String(32), default="pending")  # pending | approved | rejected
    decided_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    note = Column(Text, default="")
    created_at = Column(DateTime, default=utcnow)
    decided_at = Column(DateTime, default=None)

    project = relationship("Project", back_populates="approvals")
