import os
import re
import httpx

from ..config import settings


async def web_search(query: str, max_results: int = 5) -> str:
    """Best-effort free search via DuckDuckGo HTML. Returns concatenated snippets."""
    try:
        url = "https://html.duckduckgo.com/html/"
        async with httpx.AsyncClient(timeout=15, headers={"User-Agent": "Mozilla/5.0"}) as client:
            resp = await client.post(url, data={"q": query, "kl": "us-en"})
            html = resp.text
        # Extract result snippets (rough parse of DuckDuckGo HTML)
        snippets = re.findall(r'class="result__snippet"[^>]*>(.*?)</a>', html, re.S)
        titles = re.findall(r'class="result__a"[^>]*>(.*?)</a>', html, re.S)
        clean = lambda s: re.sub(r"<[^>]+>", "", s).strip()
        out = []
        for i in range(min(max_results, len(titles))):
            t = clean(titles[i])
            s = clean(snippets[i]) if i < len(snippets) else ""
            out.append(f"- {t}: {s}")
        return "\n".join(out) if out else "(no search results returned)"
    except Exception as e:  # noqa: BLE001
        return f"(search unavailable: {e})"
