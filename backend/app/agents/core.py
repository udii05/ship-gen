from ..models import User
from ..llm import complete
from .prompts import (
    REQUIREMENT_SYSTEM, COMPETITOR_SYSTEM, DESIGNER_SYSTEM, BUILDER_SYSTEM, TESTER_SYSTEM,
    REVISION_SYSTEM,
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
    text, _, _ = await complete(BUILDER_SYSTEM, design, user=user)
    return text


async def tester_agent(user: User, code_summary: str) -> str:
    text, _, _ = await complete(TESTER_SYSTEM, code_summary, user=user)
    return text


async def revision_agent(user: User, current_html: str, instruction: str) -> str:
    prompt = (
        f"Current index.html:\n\n{current_html}\n\n"
        f"Requested change: {instruction}\n\n"
        "Return the complete updated index.html now."
    )
    text, _, _ = await complete(REVISION_SYSTEM, prompt, user=user)
    return text
