from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    model_provider: str
    model_name: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ModelConfigIn(BaseModel):
    provider: str  # gemini | openai | ""
    model_name: str = ""
    api_key: str = ""  # optional; stored encrypted


class ProjectCreate(BaseModel):
    title: str = "Untitled Product"
    prompt: str


class ProjectOut(BaseModel):
    id: int
    title: str
    prompt: str
    product_type: str
    status: str
    current_phase: str
    prd: str
    competitive_analysis: str
    architecture: str
    design: str
    code_summary: str
    repo_path: str
    deploy_status: str
    deploy_url: str
    created_at: str


class StepOut(BaseModel):
    agent: str
    status: str
    detail: str
    tokens_in: int
    tokens_out: int


class RunOut(BaseModel):
    id: int
    status: str
    phase: str
    steps: list[StepOut]


class ApprovalOut(BaseModel):
    gate: str
    status: str


class DeployIn(BaseModel):
    vercel_token: str
    render_token: str = ""
