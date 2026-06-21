import { useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, ChevronRight, CheckCircle2, RefreshCw, AlertTriangle, Loader2,
  Crosshair, Target, Sparkles, Linkedin,
} from "lucide-react";
import { toast } from "sonner";
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRun } from "@/lib/RunContext";
import { api } from "@/lib/api";
import { getStrategyView, getContentView, hasStrategy, hasPhaseA } from "@/lib/transforms";

export default function StrategyIdeation() {
  const navigate = useNavigate();
  const { run, mutate } = useRun();
  const result = run?.result;
  const strategy = useMemo(() => (result ? getStrategyView(result) : null), [result]);
  const content = useMemo(() => (result ? getContentView(result) : null), [result]);
  const status = run?.status;

  const awaitingStrategy = status === "awaiting_strategy_approval" || status === "awaiting_strategy_and_phase_a_approval";
  const awaitingPhaseA = status === "awaiting_phase_a_approval" || status === "awaiting_strategy_and_phase_a_approval";
  const stage2Running = status === "running" && run?.stage === "parallel";

  if (!run) {
    return <Shell><EmptyState title="No active run" desc="Start a research pass first." cta="Start Research" onClick={() => navigate("/research")} /></Shell>;
  }

  if (status === "running" && run.stage === "research") {
    return <Shell><EmptyState title="Research still running" desc="Once research completes you can approve it to launch the strategy and Phase A content agents." cta="View Research" onClick={() => navigate("/research")} /></Shell>;
  }

  if (status === "awaiting_research_approval") {
    return <Shell><EmptyState title="Approve research first" desc="The strategy and content agents only run after you approve the research." cta="Review research" onClick={() => navigate("/research")} /></Shell>;
  }

  return (
    <Shell>
      <div className="flex items-end justify-between mb-6">
        <div>
          <Badge variant="outline" className="border-brand-accent/40 text-brand-accent bg-brand-accent/10 mb-3"><Sparkles className="w-3 h-3 mr-1" /> Strategy + Content (Phase A)</Badge>
          <h1 className="font-heading text-4xl font-semibold tracking-tight">Strategy & Content review</h1>
          <p className="text-ink-muted mt-1.5">Approve each artefact to advance the pipeline.</p>
        </div>
      </div>

      {stage2Running && <StageBanner kind="running" title="Strategy + Phase A running in parallel…" desc="Both agents will surface here for approval as soon as they complete." />}
      {status === "failed" && <StageBanner kind="failed" title="Pipeline failed" desc={run.error || "Try regenerating from Research."} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Strategy card */}
        <div className="rounded-xl border border-ink-border bg-ink-surface p-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-brand-primary" />
            <h2 className="font-heading text-lg font-semibold">GTM Strategy</h2>
            {hasStrategy(result) ? <Badge className="ml-auto bg-brand-success/15 text-brand-success border border-brand-success/40">Generated</Badge> : <Badge className="ml-auto bg-ink-elevated text-ink-muted border border-ink-border">Pending</Badge>}
          </div>
          {strategy ? (
            <>
              <div className="text-[10px] uppercase tracking-wider text-ink-muted">North Star</div>
              <p className="text-base text-ink-text leading-snug mb-3">{strategy.northStar || "—"}</p>
              <div className="text-[10px] uppercase tracking-wider text-ink-muted">Positioning</div>
              <p className="text-sm text-ink-text/90 leading-relaxed line-clamp-4 mb-3">{strategy.foundation.positioning || "—"}</p>
              <div className="text-[10px] uppercase tracking-wider text-ink-muted">Primary motion</div>
              <p className="text-sm text-ink-text/90 leading-relaxed line-clamp-3">{strategy.activation.motion?.primary || "—"}</p>

              <div className="mt-5 flex flex-col sm:flex-row gap-2">
                <Button onClick={() => navigate("/command-center")} variant="outline" data-testid="open-command-center" className="border-ink-border text-ink-text hover:bg-ink-surface">
                  Open Command Center <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                {awaitingStrategy && (
                  <>
                    <Button onClick={async () => { try { await mutate(() => api.regenerateStrategy(run.id)); toast.success("Regenerating strategy…"); } catch (e) { toast.error(e.message); } }} variant="outline" data-testid="regenerate-strategy" className="border-ink-border text-ink-text hover:bg-ink-surface">
                      <RefreshCw className="w-4 h-4 mr-1.5" /> Regenerate
                    </Button>
                    <Button onClick={async () => { try { await mutate(() => api.approveStrategy(run.id)); toast.success("Strategy approved"); } catch (e) { toast.error(e.message); } }} data-testid="approve-strategy" className="bg-brand-success hover:bg-[#0EA371] text-white">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve strategy
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : stage2Running ? (
            <Skeleton lines={4} />
          ) : (
            <div className="text-sm text-ink-muted">Strategy was not requested for this run.</div>
          )}
        </div>

        {/* Phase A card */}
        <div className="rounded-xl border border-ink-border bg-ink-surface p-6">
          <div className="flex items-center gap-2 mb-3">
            <Linkedin className="w-4 h-4 text-brand-primary" />
            <h2 className="font-heading text-lg font-semibold">Phase A · LinkedIn drafts</h2>
            {hasPhaseA(result) ? <Badge className="ml-auto bg-brand-success/15 text-brand-success border border-brand-success/40">Generated</Badge> : <Badge className="ml-auto bg-ink-elevated text-ink-muted border border-ink-border">Pending</Badge>}
          </div>
          {content && content.linkedin.length > 0 ? (
            <>
              <div className="text-[10px] uppercase tracking-wider text-ink-muted">Positioning line</div>
              <p className="text-sm text-ink-text/90 leading-relaxed mb-3 line-clamp-2">{content.positioning_line || "—"}</p>
              <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-2">{content.linkedin.length} LinkedIn drafts</div>
              <ul className="space-y-1.5">
                {content.linkedin.slice(0, 3).map((p, i) => (
                  <li key={`li-${i}-${(p.hook || "").slice(0, 12)}`} className="text-sm text-ink-text/90 truncate">
                    <span className="text-ink-muted text-xs mr-2">[{p.kind}]</span>{p.hook}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-col sm:flex-row gap-2">
                <Button onClick={() => navigate("/studio")} variant="outline" data-testid="open-studio" className="border-ink-border text-ink-text hover:bg-ink-surface">
                  Open Content Studio <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                {awaitingPhaseA && (
                  <>
                    <Button onClick={async () => { try { await mutate(() => api.regeneratePhaseA(run.id)); toast.success("Regenerating Phase A…"); } catch (e) { toast.error(e.message); } }} variant="outline" data-testid="regenerate-phase-a" className="border-ink-border text-ink-text hover:bg-ink-surface">
                      <RefreshCw className="w-4 h-4 mr-1.5" /> Regenerate
                    </Button>
                    <Button onClick={async () => { try { await mutate(() => api.approvePhaseA(run.id)); toast.success("Phase A approved"); } catch (e) { toast.error(e.message); } }} data-testid="approve-phase-a" className="bg-brand-success hover:bg-[#0EA371] text-white">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Phase A
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : stage2Running ? (
            <Skeleton lines={4} />
          ) : (
            <div className="text-sm text-ink-muted">Content was not requested for this run.</div>
          )}
        </div>
      </div>

      {(status === "ready_for_phase_b" || status === "awaiting_phase_b_approval" || status === "complete") && (
        <div className="mt-10 rounded-xl border border-brand-primary/40 bg-brand-primary/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-heading text-lg text-ink-text">Both artefacts approved</div>
            <div className="text-sm text-ink-muted">Open the Content Studio to launch Phase B and export your deliverables.</div>
          </div>
          <Button onClick={() => navigate("/studio")} className="bg-brand-primary hover:bg-[#9333EA] text-white" data-testid="go-studio">
            Open Studio <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-ink-bg">
      <TopNav />
      <main className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8">
        <div className="flex items-center gap-2 text-xs text-ink-muted mb-6">
          <Link to="/" className="hover:text-ink-text transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/research" className="hover:text-ink-text transition-colors">Research</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-ink-text">Strategy & Content</span>
        </div>
        {children}
      </main>
    </div>
  );
}

function EmptyState({ title, desc, cta, onClick }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-border bg-ink-surface/30 p-10 text-center">
      <Sparkles className="w-8 h-8 mx-auto mb-3 text-brand-accent" />
      <div className="font-heading text-lg text-ink-text">{title}</div>
      <p className="text-sm text-ink-muted mt-1 mb-4">{desc}</p>
      <Button onClick={onClick} data-testid="empty-cta" className="bg-brand-primary hover:bg-[#9333EA] text-white">{cta} <ArrowRight className="ml-2 w-4 h-4" /></Button>
    </div>
  );
}

function StageBanner({ kind, title, desc }) {
  const Icon = kind === "running" ? Loader2 : AlertTriangle;
  const tone = kind === "running" ? "border-brand-accent/40 bg-brand-accent/5 text-brand-accent" : "border-red-400/40 bg-red-400/5 text-red-400";
  return (
    <div className={`rounded-xl border p-5 mb-6 ${tone}`} data-testid={`stage-${kind}`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${kind === "running" ? "animate-spin" : ""}`} />
        <div><div className="font-medium text-ink-text">{title}</div><div className="text-xs text-ink-muted">{desc}</div></div>
      </div>
    </div>
  );
}

function Skeleton({ lines = 3 }) {
  return (
    <div className="space-y-2 animate-pulse">
      {[...Array(lines)].map((_, i) => <div key={`skeleton-line-${i}`} className="h-3 rounded bg-ink-elevated" style={{ width: `${100 - i * 8}%` }} />)}
    </div>
  );
}
