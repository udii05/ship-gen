"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi, ApiError } from "@/lib/api";
import type { Project } from "@/lib/types";
import StatusPill from "@/components/StatusPill";
import NewProjectModal from "@/components/NewProjectModal";
import { ChevronRight, Clock, Folder, Plus, Spinner } from "@/components/icons";

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Mini stage-progress dots, same as the landing page mockup. */
function StageDots({ status }: { status: string }) {
  const done =
    status === "ready" || status === "deployed" ? 5 : status === "in_progress" ? 2 : 0;
  return (
    <span className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={
            i < done
              ? "size-1.5 rounded-full bg-mint"
              : "size-1.5 rounded-full bg-white/12"
          }
        />
      ))}
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const api = useApi();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      setProjects(await api<Project[]>("/projects"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load projects.");
      setProjects([]);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="sec-label !mb-2">// your products</div>
          <h1 className="heading-lux text-4xl sm:text-5xl">
            Your <em>projects</em>
          </h1>
          <p className="mt-4 font-mono text-[0.65rem] leading-relaxed text-fg3">
            each project runs planner → researcher → architect → builder → qa, gated by your approvals
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus className="size-4" />
          new product
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded border border-danger/30 bg-danger/10 px-4 py-3 font-mono text-xs text-rose-200">
          {error}
        </div>
      )}

      {projects === null ? (
        <div className="mt-24 grid place-items-center text-fg3">
          <Spinner className="size-6" />
        </div>
      ) : projects.length === 0 ? (
        <div className="mt-14 rounded-md border border-dashed border-line2 bg-surface/50 px-6 py-16 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded border border-line2 bg-ink2 text-ember">
            <Folder className="size-5" />
          </div>
          <h2 className="mt-5 font-display text-base font-bold text-fg">No products yet</h2>
          <p className="mx-auto mt-2 max-w-sm font-mono text-[0.68rem] leading-relaxed text-fg3">
            describe a product and let the crew plan, design and build it — you stay in control at every gate.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary mt-7">
            <Plus className="size-4" />
            create your first product
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => router.push(`/projects/${p.id}`)}
              className="card card-hover group flex flex-col p-5 text-left transition duration-200 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 truncate font-display text-sm font-bold text-fg">{p.title}</h3>
                <StatusPill status={p.status === "ready" && p.deploy_status === "done" ? "deployed" : p.status} />
              </div>
              <p className="mt-2.5 line-clamp-2 flex-1 text-xs font-light leading-relaxed text-fg2">{p.prompt}</p>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 font-mono text-[0.6rem] text-fg3">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3" />
                  {formatDate(p.created_at)}
                </span>
                <span className="flex items-center gap-2">
                  <StageDots status={p.status} />
                  <span className="flex items-center gap-1 text-ember-bright transition-all group-hover:gap-2">
                    open <ChevronRight className="size-3" />
                  </span>
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {modalOpen && (
        <NewProjectModal
          onClose={() => setModalOpen(false)}
          onCreated={(p) => {
            setModalOpen(false);
            router.push(`/projects/${p.id}`);
          }}
        />
      )}
    </div>
  );
}
