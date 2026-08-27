from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- Core ---
    app_name: str = "Product Factory"
    db_url: str = "sqlite:///./data/app.db"
    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7

    # --- Default (free) LLM ---
    # Operator-provided Gemini key used as the system free tier.
    gemini_api_key: str = ""
    default_model_provider: str = "gemini"
    default_model_name: str = "gemini-3.6-flash"

    # --- Rate-limit safety (Gemini free tier ~15 RPM) ---
    llm_min_interval_seconds: float = 4.0
    llm_max_retries: int = 5
    llm_concurrency: int = 1

    # --- Workspace where generated projects live (per user/account) ---
    workspace_root: str = "./workspace"

    # --- Clerk (frontend auth provider) ---
    # Your Clerk frontend API origin, e.g. https://example.clerk.accounts.dev
    # Leave empty to disable Clerk token verification (legacy JWT auth still works).
    clerk_issuer: str = ""

    # --- CORS (frontend origin) ---
    cors_origins: str = "http://localhost:3000"


settings = Settings()
