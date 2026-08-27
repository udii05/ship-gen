import os
import re
import subprocess

from ..models import Project


def deploy_project(project: Project, vercel_token: str) -> tuple[str, str]:
    """On-demand deploy using the USER's own Vercel token. Not triggered automatically.
    Returns (status, message)."""
    root = project.repo_path or ""
    if not root or not os.path.isdir(root):
        return "failed", "No built project found in workspace."

    vercel_bin = _which("vercel")
    if not vercel_bin:
        return (
            "requested",
            "Vercel CLI not installed in this environment. Project saved to your account at "
            f"'{root}'. Install the Vercel CLI and run `vercel deploy --prod` from that folder, "
            "or provide a hosted CI token. (Production path: project deploy API.)",
        )

    try:
        env = dict(os.environ, VERCEL_TOKEN=vercel_token, VERCEL_ORG_ID="", VERCEL_PROJECT_ID="")
        proc = subprocess.run(
            [vercel_bin, "deploy", "--prod", "--yes", "--token", vercel_token],
            cwd=root, capture_output=True, text=True, timeout=240, env=env,
        )
        out = proc.stdout + proc.stderr
        m = re.search(r"https://[a-z0-9-]+\.vercel\.app", out)
        if m:
            return "done", m.group(0)
        if proc.returncode == 0:
            return "done", out.strip().splitlines()[-1] if out.strip() else "deployed"
        return "failed", out.strip()[:500]
    except subprocess.TimeoutExpired:
        return "failed", "Deploy timed out (free environment limit)."
    except Exception as e:  # noqa: BLE001
        return "failed", str(e)


def _which(name: str) -> str:
    from shutil import which
    return which(name) or ""
