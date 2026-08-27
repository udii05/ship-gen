"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApi, ApiError } from "@/lib/api";
import type { Approval, Project, Run } from "@/lib/types";
import Pipeline from "@/components/Pipeline";
import Markdown from "@/components/Markdown";
import StatusPill from "@/components/StatusPill";
import ProductPanel from "@/components/ProductPanel";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Doc,
  ExternalLink,
  Eye,
  Key,
  Play,
  Refresh,
  Rocket,
  ShieldCheck,
  Spinner,
  Trash,
  Zap,
} from "@/components/icons";

interface Artifact {
  key: string;
  label: string;
  content: string;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = Number(params.id);
  const router = useRouter();
  const api = useApi();

  const [project, setProject] = useState<Project | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("");
  const [vercelToken, setVercelToken] = useState("");
  const [justStarted, setJustStarted] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, a] = await Promise.all([
        api<Project>(`/projects/${projectId}`),
        api<Approval[]>(`/projects/${projectId}/approvals`),
      ]);
      setProject(p);
      setApprovals(a);
      try {
        setRun(await api<Run>(`/projects/${projectId}/run`));
      } catch {
        setRun(null); // 404 = no run yet
      }
      setError("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load project.");
    }
  }, [projectId, api]);

  useEffect(() => {
    void load();
  }, [load]);

  // Poll while the pipeline (or a deploy) is in flight. `justStarted` keeps polling
  // alive right after "start" until the background run appears in the DB.
  const active = useMemo(() => {
    if (!project) return false;
    if (project.status === "in_progress") return true;
    if (run && (run.status === "running" || run.status === "queued")) return true;
    if (project.deploy_status === "requested") return true;
    if (justStarted) return true;
    return false;
  }, [project, run, justStarted]);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => void load(), 3000);
    return () => clearInterval(t);
  }, [active, load]);

  const artifacts = useMemo<Artifact[]>(() => {
    if (!project) return [];
    return [
      { key: "prd", label: "PRD", content: project.prd },
      { key: "competitive_analysis", label: "market research", content: project.competitive_analysis },
      { key: "design", label: "architecture & design", content: project.design || project.architecture },
      { key: "code_summary", label: "build summary", content: project.code_summary },
    ].filter((a) => a.content.trim().length > 0);
  }, [project]);

  // Keep the selected tab valid as artifacts appear.
  useEffect(() => {
    if (artifacts.length === 0) {
      setTab("");
      return;
    }
    if (!artifacts.some((a) => a.key === tab)) setTab(artifacts[0].key);
  }, [artifacts, tab]);

  const pendingGate = useMemo(() => {
    if (!project) return null;
    const pending = approvals.find((a) => a.status === "pending");
    if (!pending) return null;
    return project.current_phase === `${pending.gate}_review` ? pending.gate : null;
  }, [approvals, project]);

  async function deleteProject() {
    if (!project) return;
    if (
      !window.confirm(
        `Delete "${project.title}" permanently? This removes the project, its pipeline runs and all generated files. This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      await api(`/projects/${projectId}`, { method: "DELETE" });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete project.");
      setDeleting(false);
    }
  }

  async function startPipeline() {
    setBusy(true);
    setNotice("");
    try {
      await api(`/projects/${projectId}/start`, { body: {} });
      setNotice("Pipeline started, the Planner is drafting your PRD.");
      setJustStarted(true);
      setTimeout(() => setJustStarted(false), 90000);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to start pipeline.");
    } finally {
      setBusy(false);
    }
  }

  async function approveGate(gate: string) {
    setBusy(true);
    setNotice("");
    try {
      await api(`/projects/${projectId}/approve/${gate}`, { body: {} });
      setNotice(`${gate.toUpperCase()} approved, pipeline resumed.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to approve.");
    } finally {
      setBusy(false);
    }
  }

  async function deploy() {
    if (!vercelToken.trim()) {
      setError("Add your Vercel token to deploy.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api(`/projects/${projectId}/deploy`, {
        body: { vercel_token: vercelToken.trim(), render_token: "" },
      });
      setNotice("Deploy requested, this can take a minute.");
      setVercelToken("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Deploy failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!project && !error) {
    return (
      <div className="mt-24 grid place-items-center text-fg3">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!project) {
    return (
      <div>
        <Link href="/dashboard" className="font-mono text-xs text-fg3 transition hover:text-ember-bright">
          ← back to projects
        </Link>
        <div className="mt-8 rounded border border-danger/30 bg-danger/10 px-4 py-3 font-mono text-sm text-rose-200">
          {error}
        </div>
      </div>
    );
  }

  const deployDone = project.deploy_status === "done" && project.deploy_url;
  const canDeploy = Boolean(project.repo_path);
  const gateArtifact = pendingGate === "prd" ? project.prd : pendingGate === "design" ? project.design : "";
  const isReady = project.status === "ready";

  return (
    <div>
      <Link href="/dashboard" className="font-mono text-xs text-fg3 transition hover:text-ember-bright">
        ← back to projects
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="heading-lux max-w-xl truncate text-3xl sm:text-4xl">
              {project.title}
            </h1>
            <StatusPill status={project.status === "ready" && deployDone ? "deployed" : project.status} />
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.7rem] text-fg3">
            <span>created {formatDate(project.created_at)}</span>
            {project.current_phase && (
              <>
                <span className="text-line2">|</span>
                <span>
                  phase: <span className="text-fg2">{project.current_phase.replace(/_/g, " ")}</span>
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(() => {
            const stepRunning = run?.steps.some((s) => s.status === "running") ?? false;
            const pipelineDone = project.status === "ready" || project.current_phase === "done";
            if (stepRunning || pipelineDone) return null;
            const label =
              run?.status === "failed"
                ? "retry pipeline"
                : project.status === "draft"
                  ? "start pipeline"
                  : "resume pipeline";
            return (
              <button onClick={() => void startPipeline()} disabled={busy} className="btn btn-primary">
                {busy ? (
                  <Spinner className="size-4" />
                ) : run?.status === "failed" || project.status !== "draft" ? (
                  <Refresh className="size-4" />
                ) : (
                  <Play className="size-4" />
                )}
                {label}
              </button>
            );
          })()}
          <button
            onClick={() => void deleteProject()}
            disabled={deleting}
            title="Delete project"
            className="btn btn-ghost !text-danger hover:!bg-danger/10"
          >
            {deleting ? <Spinner className="size-4" /> : <Trash className="size-4" />}
            delete
          </button>
        </div>
      </div>

      {/* Brief */}
      <div className="card mt-5 px-4 py-3">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-fg3">brief</p>
        <p className="mt-1.5 text-sm font-light leading-relaxed text-fg2">{project.prompt}</p>
      </div>

      {/* Notices */}
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded border border-danger/30 bg-danger/10 px-4 py-3 font-mono text-xs text-rose-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}
      {notice && !error && (
        <div className="mt-4 flex items-start gap-2 rounded border border-mint/30 bg-mint/10 px-4 py-3 font-mono text-xs text-emerald-200">
          <Check className="mt-0.5 size-4 shrink-0" />
          {notice}
        </div>
      )}

      {/* Approval gate banner */}
      {pendingGate && (
        <div className="mt-6 overflow-hidden rounded-md border border-ember/35 bg-ember-dim">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded border border-ember/40 bg-ink text-ember">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-sm font-bold text-[#c8e6ff]">
                  Human gate: approve the {pendingGate === "prd" ? "PRD" : "design"} to continue
                </h2>
                <p className="mt-1 max-w-xl font-mono text-[0.7rem] leading-relaxed text-[#a8d8ff]/70">
                  the pipeline is paused, no more tokens are spent until you approve. review the{" "}
                  {pendingGate === "prd" ? "PRD" : "architecture & design"} below, then approve to resume.
                </p>
              </div>
            </div>
            <button
              onClick={() => void approveGate(pendingGate)}
              disabled={busy}
              className="btn btn-primary"
            >
              {busy ? <Spinner className="size-4" /> : <Check className="size-4" />}
              approve {pendingGate}
            </button>
          </div>
          {gateArtifact && (
            <div className="max-h-72 overflow-y-auto border-t border-ember/20 bg-black/30 px-5 py-4">
              <Markdown>{gateArtifact}</Markdown>
            </div>
          )}
        </div>
      )}

      {/* Main grid — when the product is ready, the right panel widens for the live preview */}
      <div className={`mt-8 grid gap-6 ${isReady ? "lg:grid-cols-5" : "lg:grid-cols-3"}`}>
        {/* Left: pipeline + artifacts */}
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-sm font-bold text-fg">
                <Zap className="size-4 text-ember" />
                Agent pipeline
              </h2>
              {run && (
                <span className="flex items-center gap-2 font-mono text-[0.68rem] text-fg3">
                  run #{run.id} <StatusPill status={run.status} />
                </span>
              )}
            </div>
            {run || project.status !== "draft" ? (
              <Pipeline run={run} />
            ) : (
              <div className="rounded border border-dashed border-line2 px-5 py-10 text-center">
                <p className="text-sm text-fg2">This product hasn't entered the pipeline yet.</p>
                <p className="mt-1.5 font-mono text-[0.7rem] text-fg3">
                  hit <span className="text-ember-bright">start pipeline</span> and the planner will draft a PRD for
                  your review
                </p>
              </div>
            )}
          </section>

          {artifacts.length > 0 && (
            <section className="card overflow-hidden">
              <div className="flex flex-wrap items-center gap-1 border-b border-line px-4 pt-3">
                {artifacts.map((a) => (
                  <button
                    key={a.key}
                    onClick={() => setTab(a.key)}
                    className={`rounded-t-sm px-3.5 py-2 font-mono text-[0.65rem] uppercase tracking-[0.08em] transition ${
                      tab === a.key
                        ? "border-b-2 border-ember bg-white/[0.03] text-ember-bright"
                        : "text-fg3 hover:bg-white/[0.02] hover:text-fg2"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <div className="max-h-[560px] overflow-y-auto p-6">
                <Markdown>{artifacts.find((a) => a.key === tab)?.content ?? ""}</Markdown>
              </div>
            </section>
          )}
        </div>

        {/* Right rail */}
        <div className={`space-y-6 ${isReady ? "lg:col-span-3" : ""}`}>
          {/* Live product panel (preview + revisions + download) */}
          {isReady && <ProductPanel projectId={project.id} title={project.title} />}

          {/* Human gates */}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-fg">
              <ShieldCheck className="size-4 text-mint" />
              Human gates
            </h2>
            <p className="mt-1 font-mono text-[0.68rem] text-fg3">agents pause here until you approve</p>
            <ul className="mt-4 space-y-2.5">
              {["prd", "design"].map((gate) => {
                const a = approvals.find((x) => x.gate === gate);
                const status = a?.status ?? (pendingGate === gate ? "pending" : "waiting");
                return (
                  <li key={gate} className="flex items-center justify-between rounded border border-line bg-ink2 px-3 py-2.5">
                    <span className="flex items-center gap-2 font-mono text-[0.65rem] text-fg2">
                      <Doc className="size-3.5 text-fg3" />
                      {gate === "prd" ? "PRD review" : "Design review"}
                    </span>
                    <StatusPill status={status} />
                  </li>
                );
              })}
              <li className="flex items-center justify-between rounded border border-line bg-ink2 px-3 py-2.5">
                <span className="flex items-center gap-2 font-mono text-[0.65rem] text-fg2">
                  <Rocket className="size-3.5 text-fg3" />
                  Deploy (manual)
                </span>
                <StatusPill status={project.deploy_status === "none" ? "queued" : project.deploy_status} />
              </li>
            </ul>
          </section>

          {/* Deploy */}
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-fg">
              <Rocket className="size-4 text-ember" />
              Deploy
            </h2>

            {deployDone ? (
              <div className="mt-4">
                <a
                  href={project.deploy_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-2 rounded border border-cyan-400/30 bg-cyan-400/10 px-3 py-3 font-mono text-xs text-cyan-200 transition hover:bg-cyan-400/[0.14]"
                >
                  <span className="truncate">{project.deploy_url}</span>
                  <ExternalLink className="size-4 shrink-0" />
                </a>
                <p className="mt-2 font-mono text-[0.68rem] text-fg3">live on Vercel, redeploy anytime with a new token</p>
              </div>
            ) : !canDeploy ? (
              <p className="mt-4 rounded border border-dashed border-line2 px-3 py-4 text-center font-mono text-[0.7rem] text-fg3">
                run the pipeline to unlock deployment
              </p>
            ) : (
              <div className="mt-4">
                <label className="block">
                  <span className="flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-fg2">
                    <Key className="size-3.5" /> vercel token
                  </span>
                  <input
                    type="password"
                    value={vercelToken}
                    onChange={(e) => setVercelToken(e.target.value)}
                    placeholder="Your own Vercel API token"
                    autoComplete="off"
                    className="input mt-1.5 font-mono text-xs"
                  />
                </label>
                <button
                  onClick={() => void deploy()}
                  disabled={busy || project.deploy_status === "requested"}
                  className="btn btn-primary mt-3 w-full"
                >
                  {project.deploy_status === "requested" ? (
                    <>
                      <Spinner className="size-4" /> deploying…
                    </>
                  ) : (
                    <>
                      <Rocket className="size-4" /> deploy to Vercel
                    </>
                  )}
                </button>
                <p className="mt-2 font-mono text-[0.65rem] leading-relaxed text-fg3">
                  uses your token only, never stored server-side beyond the deploy call
                </p>
              </div>
            )}
          </section>

          {/* Workspace */}
          {project.repo_path && (
            <section className="card p-5">
              <h2 className="flex items-center gap-2 font-display text-sm font-bold text-fg">
                <Eye className="size-4 text-fg3" />
                Workspace
              </h2>
              <p className="mt-3 break-all rounded border border-line bg-black/30 px-3 py-2.5 font-mono text-[0.7rem] text-fg3">
                {project.repo_path}
              </p>
              <p className="mt-2 flex items-center gap-1.5 font-mono text-[0.65rem] text-fg3">
                <ChevronRight className="size-3" /> generated code lives in this directory on the server
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
