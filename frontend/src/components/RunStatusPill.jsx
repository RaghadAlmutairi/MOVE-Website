import { Link } from "react-router-dom";
import { History, ChevronDown, Loader2, CheckCircle2, AlertTriangle, Sparkles, Clock } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRun } from "@/lib/RunContext";

const LABEL = {
  running: "Running",
  awaiting_research_approval: "Awaiting research approval",
  awaiting_strategy_approval: "Awaiting strategy approval",
  awaiting_phase_a_approval: "Awaiting content approval",
  awaiting_strategy_and_phase_a_approval: "Awaiting approvals",
  ready_for_phase_b: "Ready for Phase B",
  awaiting_phase_b_approval: "Awaiting Phase B approval",
  complete: "Complete",
  failed: "Failed",
};

const HISTORY_DOT = {
  complete: "bg-brand-success",
  failed:   "bg-red-400",
};
const HISTORY_DOT_DEFAULT = "bg-brand-accent animate-pulse";

function dotClassFor(status) {
  return HISTORY_DOT[status] || HISTORY_DOT_DEFAULT;
}

export default function RunStatusPill() {
  const { run, runId, history, setRunId } = useRun();
  const active = run || (runId && history.find((h) => h.id === runId)) || null;
  const status = active?.status || "idle";

  let Icon = Sparkles;
  let tone = "text-ink-muted";
  let dot = "bg-ink-muted";
  let label = "No active run";

  if (status === "running") {
    Icon = Loader2; tone = "text-brand-accent"; dot = "bg-brand-accent animate-pulse";
    label = `${LABEL.running} · ${active?.stage || ""}`;
  } else if (status === "complete") {
    Icon = CheckCircle2; tone = "text-brand-success"; dot = "bg-brand-success";
    label = active?.query ? `${truncate(active.query, 28)} · complete` : "Complete";
  } else if (status === "failed") {
    Icon = AlertTriangle; tone = "text-red-400"; dot = "bg-red-400";
    label = "Failed";
  } else if (LABEL[status]) {
    Icon = Clock; tone = "text-brand-warning"; dot = "bg-brand-warning";
    label = LABEL[status];
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button data-testid="run-status-pill" className="hidden md:flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full border border-ink-border bg-ink-surface hover:bg-ink-elevated transition-colors text-xs text-ink-muted">
          <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
          <Icon className={`w-3.5 h-3.5 ${tone} ${status === "running" ? "animate-spin" : ""}`} />
          <span className={`max-w-[220px] truncate ${tone}`}>{label}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-ink-surface border-ink-border text-ink-text w-80" align="end">
        <DropdownMenuLabel className="text-ink-muted text-xs uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-3 h-3" /> Run history
        </DropdownMenuLabel>
        {history.length === 0 && (
          <div className="px-3 py-4 text-xs text-ink-muted">No runs yet. Start one from <Link to="/research" className="text-brand-primary hover:underline">Research</Link>.</div>
        )}
        {history.slice(0, 10).map((h) => (
          <DropdownMenuItem key={h.id} onClick={() => setRunId(h.id)} data-testid={`history-item-${h.id}`} className={`cursor-pointer focus:bg-ink-elevated flex-col items-start gap-0.5 py-2 ${h.id === runId ? "bg-ink-elevated" : ""}`}>
            <div className="flex items-center gap-2 w-full">
              <span className={`w-1.5 h-1.5 rounded-full ${dotClassFor(h.status)}`} />
              <span className="text-sm flex-1 truncate text-ink-text">{truncate(h.query, 36)}</span>
              <span className="text-[10px] text-ink-muted">{LABEL[h.status] || h.status}</span>
            </div>
            {h.url && <div className="text-[10px] text-ink-muted truncate w-full pl-3.5">{h.url}</div>}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-ink-border" />
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-ink-elevated">
          <Link to="/research" className="text-brand-secondary">+ Start new run</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function truncate(s, n) { return (s || "").length > n ? (s.slice(0, n - 1) + "…") : (s || ""); }
