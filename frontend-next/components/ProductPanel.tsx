"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { API_URL, ApiError, useApi } from "@/lib/api";
import { Download, Eye, Refresh, Spinner, Zap } from "./icons";

const REVISE_STAGES = [
  "sending your brief to the editor agent",
  "editor agent is rewriting index.html",
  "applying the changes to your product",
  "refreshing the preview",
];

/**
 * Right-side panel shown once the pipeline finishes: live preview of the
 * generated product, Editor-agent revisions, and a ZIP download.
 */
export default function ProductPanel({ projectId, title }: { projectId: number; title: string }) {
  const api = useApi();
  const { getToken } = useAuth();
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [instruction, setInstruction] = useState("");
  const [revising, setRevising] = useState(false);
  const [stage, setStage] = useState(0);
  const [notice, setNotice] = useState("");
  const [downloading, setDownloading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ html: string }>(`/projects/${projectId}/preview`);
      setHtml(res.html);
      setError("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load preview.");
    } finally {
      setLoading(false);
    }
  }, [projectId, api]);

  useEffect(() => {
    void load();
  }, [load]);

  // Cycle the visible stage text while the Editor agent works.
  useEffect(() => {
    if (!revising) return;
    setStage(0);
    const t = setInterval(() => setStage((s) => Math.min(s + 1, REVISE_STAGES.length - 1)), 6000);
    return () => clearInterval(t);
  }, [revising]);

  async function revise(e: FormEvent) {
    e.preventDefault();
    if (!instruction.trim() || revising) return;
    setRevising(true);
    setNotice("");
    setError("");
    try {
      const res = await api<{ html: string }>(`/projects/${projectId}/revise`, {
        method: "POST",
        body: { instruction: instruction.trim() },
      });
      setHtml(res.html);
      setInstruction("");
      setNotice("editor agent updated your product");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Revision failed.");
    } finally {
      setRevising(false);
    }
  }

  async function download() {
    setDownloading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/projects/${projectId}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "product"}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Download failed.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold text-fg">
          <Eye className="size-4 text-ember" />
          Live preview
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void load()}
            disabled={loading || revising}
            className="btn btn-ghost !px-3 !py-1.5 !text-[0.65rem]"
          >
            {loading ? <Spinner className="size-3.5" /> : <Refresh className="size-3.5" />}
            refresh
          </button>
          <button
            onClick={() => void download()}
            disabled={downloading || revising}
            className="btn btn-secondary !px-3 !py-1.5 !text-[0.65rem]"
          >
            {downloading ? <Spinner className="size-3.5" /> : <Download className="size-3.5" />}
            download .zip
          </button>
        </div>
      </div>

      <div className="relative">
        {loading ? (
          <div className="grid h-72 place-items-center text-fg3">
            <Spinner className="size-6" />
          </div>
        ) : html ? (
          <iframe
            title="Product preview"
            srcDoc={html}
            sandbox="allow-scripts allow-forms allow-popups"
            className="h-[480px] w-full border-0 bg-white"
          />
        ) : (
          <div className="px-5 py-10 text-center font-mono text-xs leading-relaxed text-rose-200">
            {error || "No preview available."}
          </div>
        )}

        {/* Editor agent progress overlay */}
        {revising && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-ink/85 backdrop-blur-sm">
            <div className="w-full max-w-xs px-6 text-center">
              <span className="mx-auto flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ember-bright">
                <Spinner className="size-4" />
                editor agent
              </span>
              <p className="mt-4 text-sm font-medium leading-relaxed text-fg">
                {REVISE_STAGES[stage]}
              </p>
              <div className="progress-anim mt-5 h-1.5 w-full rounded-full bg-white/10" />
              <p className="mt-3 font-mono text-[0.6rem] text-fg3">
                this can take up to a minute, keep this tab open
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Inline error notice (never replaces the preview) */}
      {error && html && (
        <div className="border-t border-line bg-danger/[0.06] px-5 py-2.5 font-mono text-[0.65rem] leading-relaxed text-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={revise} className="border-t border-line px-5 py-4">
        <label className="block">
          <span className="flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-fg2">
            <Zap className="size-3.5 text-ember" />
            ask the editor agent to make changes
          </span>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            rows={2}
            placeholder="e.g. make the header dark blue and add a footer with contact links"
            className="input mt-1.5 resize-none leading-relaxed"
          />
        </label>
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <p className="font-mono text-[0.62rem] leading-relaxed text-fg3">
            {notice ? (
              <span className="text-mint">{notice}</span>
            ) : (
              "the editor agent rewrites index.html and the preview refreshes"
            )}
          </p>
          <button
            type="submit"
            disabled={revising || !instruction.trim()}
            className="btn btn-primary shrink-0"
          >
            {revising ? <Spinner className="size-4" /> : <Zap className="size-4" />}
            {revising ? "applying…" : "apply change"}
          </button>
        </div>
      </form>
    </section>
  );
}