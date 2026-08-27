"use client";

import { useState, type FormEvent } from "react";
import { useApi, ApiError } from "@/lib/api";
import type { Project } from "@/lib/types";
import { Spinner, XMark, Zap } from "./icons";

export default function NewProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (p: Project) => void;
}) {
  const api = useApi();
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!prompt.trim()) {
      setError("Describe the product you want to build.");
      return;
    }
    setBusy(true);
    try {
      const project = await api<Project>("/projects", {
        body: { title: title.trim() || "Untitled Product", prompt: prompt.trim() },
      });
      onCreated(project);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create project.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-md border border-line2 bg-surface shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line2 bg-ink2 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2 font-mono text-[0.7rem] tracking-[0.1em] text-fg3">// new product</span>
          </div>
          <button onClick={onClose} className="rounded p-1 text-fg3 transition hover:bg-white/5 hover:text-fg">
            <XMark className="size-4" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6">
          <h2 className="font-display text-base font-bold text-fg">Feed the pipeline</h2>
          <p className="mt-1 font-mono text-[0.7rem] leading-relaxed text-fg3">
            describe the product and the crew takes it from there, you approve every gate
          </p>

          <label className="mt-5 block">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-fg2">title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. InvoicePilot"
              className="input mt-1.5"
            />
          </label>

          <label className="mt-4 block">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-fg2">brief</span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder="A SaaS that lets freelancers create, send and track invoices. Stripe payments, PDF export, email reminders…"
              className="input mt-1.5 resize-none leading-relaxed"
              required
            />
          </label>

          {error && <p className="mt-3 font-mono text-xs text-rose-300">{error}</p>}

          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              cancel
            </button>
            <button type="submit" disabled={busy} className="btn btn-primary">
              {busy ? <Spinner className="size-4" /> : <Zap className="size-4" />}
              create project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
