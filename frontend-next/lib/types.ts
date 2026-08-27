// Shapes mirror backend/app/schemas.py

export interface User {
  id: number;
  email: string;
  model_provider: string;
  model_name: string;
}

export type ProjectStatus = "draft" | "in_progress" | "ready" | "deployed" | (string & {});

export interface Project {
  id: number;
  title: string;
  prompt: string;
  product_type: string;
  status: ProjectStatus;
  current_phase: string;
  prd: string;
  competitive_analysis: string;
  architecture: string;
  design: string;
  code_summary: string;
  repo_path: string;
  deploy_status: string; // none | requested | done | failed
  deploy_url: string;
  created_at: string;
}

export type AgentKey =
  | "requirement"
  | "competitor"
  | "designer"
  | "builder"
  | "tester"
  | "deploy"
  | (string & {});

export interface RunStep {
  agent: AgentKey;
  status: string; // pending | running | done | failed | skipped
  detail: string;
  tokens_in: number;
  tokens_out: number;
}

export interface Run {
  id: number;
  status: string; // queued | running | done | failed
  phase: string;
  steps: RunStep[];
}

export interface Approval {
  gate: string; // prd | design
  status: string; // pending | approved | rejected
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}
