import asyncio
import time
import os
from typing import Optional

from .config import settings
from .models import User
from . import security


class LLMRateLimitError(Exception):
    pass


# Global pacing: serialize calls and enforce a minimum interval to respect
# Gemini free-tier RPM (typically ~15 RPM). One in-flight call at a time.
_pace_lock = asyncio.Lock()
_last_call = 0.0
_concurrency = asyncio.Semaphore(settings.llm_concurrency)


class ModelConfig:
    def __init__(self, provider: str, model: str, api_key: str):
        self.provider = provider
        self.model = model
        self.api_key = api_key


def resolve_config(user: Optional[User]) -> ModelConfig:
    """Use the user's configured key/model if present, else the system free tier."""
    if user and user.model_provider and user.encrypted_api_key:
        return ModelConfig(
            provider=user.model_provider,
            model=user.model_name or settings.default_model_name,
            api_key=security.decrypt_secret(user.encrypted_api_key),
        )
    return ModelConfig(
        provider=settings.default_model_provider,
        model=settings.default_model_name,
        api_key=settings.gemini_api_key,
    )


def _gemini_complete(cfg: ModelConfig, system: str, prompt: str) -> tuple[str, int, int]:
    from google import genai
    client = genai.Client(api_key=cfg.api_key)
    contents = []
    if system:
        contents.append(system)
    contents.append(prompt)
    resp = client.models.generate_content(model=cfg.model, contents=contents)
    text = resp.text or ""
    usage = resp.usage_metadata
    tin = int(getattr(usage, "prompt_token_count", 0) or 0)
    tout = int(getattr(usage, "candidates_token_count", 0) or 0)
    return text, tin, tout


def _openai_complete(cfg: ModelConfig, system: str, prompt: str) -> tuple[str, int, int]:
    from openai import OpenAI
    client = OpenAI(api_key=cfg.api_key)
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    resp = client.chat.completions.create(model=cfg.model, messages=messages)
    text = resp.choices[0].message.content or ""
    u = resp.usage
    tin = int(getattr(u, "prompt_tokens", 0) or 0)
    tout = int(getattr(u, "completion_tokens", 0) or 0)
    return text, tin, tout


async def complete(
    system: str,
    prompt: str,
    user: Optional[User] = None,
    model: Optional[str] = None,
    provider: Optional[str] = None,
) -> tuple[str, int, int]:
    """Returns (text, tokens_in, tokens_out) with pacing + retry/backoff."""
    cfg = resolve_config(user)
    if model:
        cfg.model = model
    if provider:
        cfg.provider = provider

    if not cfg.api_key:
        raise LLMRateLimitError(
            "No model provider configured. Set a system key or add your API key in Settings."
        )

    last_err = None
    for attempt in range(settings.llm_max_retries):
        async with _concurrency:
            # Enforce minimum spacing between calls to avoid RPM limits.
            global _last_call
            async with _pace_lock:
                wait = settings.llm_min_interval_seconds - (time.monotonic() - _last_call)
                if wait > 0:
                    await asyncio.sleep(wait)
                _last_call = time.monotonic()
            try:
                if cfg.provider == "openai":
                    return await asyncio.to_thread(_openai_complete, cfg, system, prompt)
                return await asyncio.to_thread(_gemini_complete, cfg, system, prompt)
            except Exception as e:  # noqa: BLE001
                msg = str(e).lower()
                last_err = e
                if "429" in msg or "rate" in msg or "quota" in msg or "resource_exhausted" in msg:
                    backoff = min(30, (2 ** attempt) * settings.llm_min_interval_seconds)
                    await asyncio.sleep(backoff)
                    continue
                if attempt < settings.llm_max_retries - 1:
                    await asyncio.sleep(settings.llm_min_interval_seconds)
                    continue
                raise
    raise LLMRateLimitError(f"LLM call failed: {last_err}")
