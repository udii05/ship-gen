from ..models import User
from ..llm import complete
from .prompts import (
    REQUIREMENT_SYSTEM, COMPETITOR_SYSTEM, DESIGNER_SYSTEM, BUILDER_SYSTEM, TESTER_SYSTEM,
)


async def requirement_agent(user: User, user_prompt: str) -> str:
    return await complete(REQUIREMENT_SYSTEM, user_prompt, user=user)


async def competitor_agent(user: User, prd: str, search_snippets: str) -> str:
    prompt = f"PRD:\n{prd}\n\nWeb search snippets:\n{search_snippets}\n\nNow write the competitive analysis."
    return await complete(COMPETITOR_SYSTEM, prompt, user=user)


async def designer_agent(user: User, prd: str, competitive: str) -> str:
    prompt = f"PRD:\n{prd}\n\nCompetitive Analysis:\n{competitive}\n\nNow write Architecture + Design."
    return await complete(DESIGNER_SYSTEM, prompt, user=user)


async def builder_agent(user: User, design: str) -> str:
    return await complete(BUILDER_SYSTEM, design, user=user)


async def tester_agent(user: User, code_summary: str) -> str:
    return await complete(TESTER_SYSTEM, code_summary, user=user)
