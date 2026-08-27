"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useUser } from "@clerk/nextjs";
import { useApi, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";
import { Check, Gear, Key, ShieldCheck, Spinner } from "@/components/icons";

export default function SettingsPage() {
  const { user: clerkUser } = useUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress;
  const api = useApi();
  const [provider, setProvider] = useState("");
  const [modelName, setModelName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const s = await api<User>("/settings");
        setProvider(s.model_provider || "");
        setModelName(s.model_name || "");
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load settings.");
      }
    }
    void load();
  }, [api]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await api<User>("/settings", {
        method: "PUT",
        body: { provider, model_name: modelName.trim(), api_key: apiKey.trim() },
      });
      setApiKey("");
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save settings.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="sec-label !mb-2">// settings</div>
      <h1 className="heading-lux text-3xl sm:text-4xl">
        Model <em>configuration</em>
      </h1>
      <p className="mt-4 font-mono text-[0.65rem] text-fg3">
        signed in as <span className="text-fg2">{email}</span>
      </p>

      <form onSubmit={save} className="card mt-8 p-6">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold text-fg">
          <Gear className="size-4 text-ember" />
          LLM provider
        </h2>
        <p className="mt-1.5 font-mono text-[0.7rem] leading-relaxed text-fg3">
          by default the pipeline runs on the operator's shared Gemini key (free tier). connect your own key for
          higher rate limits or a different provider.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-fg2">provider</span>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="input mt-1.5 appearance-none"
            >
              <option value="">System default (shared)</option>
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
            </select>
          </label>

          <label className="block">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-fg2">model name</span>
            <input
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder={provider === "openai" ? "gpt-4o" : "gemini-3.6-flash"}
              className="input mt-1.5"
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-fg2">
            <Key className="size-3.5" /> api key
          </span>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Leave blank to keep the current key"
            autoComplete="off"
            className="input mt-1.5 font-mono text-sm"
          />
        </label>

        <p className="mt-3 flex items-start gap-2 rounded border border-line bg-ink2 px-3 py-2.5 font-mono text-[0.65rem] leading-relaxed text-fg3">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-mint" />
          keys are encrypted at rest (Fernet) and only used to call the model provider on your behalf
        </p>

        {error && (
          <div className="mt-4 rounded border border-danger/30 bg-danger/10 px-3 py-2.5 font-mono text-xs text-rose-200">
            {error}
          </div>
        )}
        {saved && !error && (
          <div className="mt-4 flex items-center gap-2 rounded border border-mint/30 bg-mint/10 px-3 py-2.5 font-mono text-xs text-emerald-200">
            <Check className="size-3.5" /> settings saved
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={busy} className="btn btn-primary">
            {busy && <Spinner className="size-4" />}
            save settings
          </button>
        </div>
      </form>
    </div>
  );
}
