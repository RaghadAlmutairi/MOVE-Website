import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Trash2, Loader2, ArrowRight, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import TopNav from "@/components/TopNav";
import ProgressTracker from "@/components/ProgressTracker";
import { Button } from "@/components/ui/button";
import { api, activeRun } from "@/lib/api";
import { useRun } from "@/lib/RunContext";

const STATUS_LABEL = {
  running: "Running",
  awaiting_research_approval: "Awaiting research approval",
  awaiting_strategy_approval: "Awaiting strategy approval",
  awaiting_content_approval: "Awaiting content approval",
  complete: "Complete",
  failed: "Failed",
};

export default function Projects() {
  const navigate = useNavigate();
  const { runId, mutate } = useRun();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try { setItems(await api.listRuns(50)); }
    catch (e) { toast.error("Could not load runs", { description: e.message }); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const open = (r) => {
    activeRun.set(r.id);
    mutate(() => api.getRun(r.id));
    if (r.status === "complete") navigate("/export");
    else if (r.status === "awaiting_content_approval") navigate("/studio");
    else if (r.status === "awaiting_strategy_approval") navigate("/ideation");
    else navigate("/research");
  };

  const remove = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.deleteRun(id);
      if (id === runId) activeRun.clear();
      toast.success("Project deleted");
      refresh();
    } catch (err) { toast.error("Delete failed", { description: err.message }); }
  };

  return (
    <div className="min-h-screen bg-move-bg">
      <TopNav />
      <ProgressTracker />
      <main className="max-w-[1200px] mx-auto px-6 lg:px-10 py-8">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-move-grad-2/40 bg-move-grad-2-tint text-move-grad-2 mb-3">
              <FolderKanban className="w-3 h-3" /> Projects
            </div>
            <h1 className="font-heading text-5xl font-medium tracking-tight text-move-ink" style={{ fontWeight: 500 }}>Your projects</h1>
            <p className="text-move-body mt-2 text-lg">Every GTM run lives here. Pick one to resume or start a fresh research.</p>
          </div>
          <Button onClick={() => navigate("/research")} data-testid="new-project" className="bg-move-ink hover:bg-move-ink-hover text-white rounded-[12px] h-11 px-5 font-medium">
            <Plus className="w-4 h-4 mr-1.5" /> New project
          </Button>
        </header>

        {loading && (
          <div className="rounded-[16px] border border-dashed border-move-border bg-move-bg-subtle p-12 text-center text-move-muted flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="rounded-[16px] border border-dashed border-move-border bg-move-bg-subtle p-12 text-center" data-testid="projects-empty">
            <h2 className="text-xl font-medium text-move-ink mb-2" style={{ fontWeight: 500 }}>No projects yet</h2>
            <p className="text-move-body mb-5">Start a new research run and your project will appear here.</p>
            <Button onClick={() => navigate("/research")} className="bg-move-ink hover:bg-move-ink-hover text-white rounded-[12px] h-11 px-5 font-medium">
              <Plus className="w-4 h-4 mr-1.5" /> Start research
            </Button>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((r) => (
              <button
                key={r.id}
                onClick={() => open(r)}
                data-testid={`project-card-${r.id}`}
                className="text-left rounded-[16px] border border-move-border bg-move-surface hover:border-move-grad-2 hover:shadow-md transition-all p-5 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-base font-medium text-move-ink line-clamp-2" style={{ fontWeight: 500 }}>
                    {r.query || "Untitled"}
                  </div>
                  <button onClick={(e) => remove(r.id, e)} aria-label="Delete"
                          className="text-move-muted hover:text-move-error w-8 h-8 rounded-md hover:bg-move-bg-subtle flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {r.url && <div className="text-sm text-move-muted truncate mt-1">{r.url}</div>}
                <div className="flex items-center justify-between mt-4">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                    r.status === "complete" ? "bg-move-success-bg text-move-success border-move-success/40" :
                    r.status === "failed"   ? "bg-move-error-bg text-move-error border-move-error/40" :
                                              "bg-move-bg-subtle text-move-muted border-move-border"
                  }`}>{STATUS_LABEL[r.status] || r.status}</span>
                  <ArrowRight className="w-4 h-4 text-move-muted group-hover:text-move-ink transition-colors" />
                </div>
                <div className="text-[11px] text-move-muted mt-2">{relTime(r.updated_at || r.created_at)}</div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Link to="/" className="text-sm text-move-muted hover:text-move-ink">← Home</Link>
        </div>
      </main>
    </div>
  );
}

function relTime(iso) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  const d = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return new Date(iso).toLocaleString();
}
