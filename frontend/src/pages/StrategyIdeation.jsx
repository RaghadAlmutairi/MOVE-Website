import { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, ChevronRight, CheckCircle2, RefreshCw, AlertTriangle, Loader2,
  Sparkles, Target, Lightbulb, Send, Wand2,
} from "lucide-react";
import { toast } from "sonner";
import TopNav from "@/components/TopNav";
import ChatPanel from "@/components/ChatPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useRun } from "@/lib/RunContext";
import { api } from "@/lib/api";
import { getStrategyView, getReportView, hasStrategy } from "@/lib/transforms";

// Derive "idea cards" from the real research output — no fabricated content.
function getStrategicIdeas(result) {
  if (!result) return [];
  const rv = getReportView(result);
  // Combine real recommendations + opportunities → at most 4 actionable cards
  const items = [];
  rv.recommendations.slice(0, 3).forEach((text, i) => items.push({
    id: `rec-${i}`, kind: "recommendation", text, impact: i === 0 ? "HIGH" : i === 1 ? "HIGH" : "MEDIUM",
  }));
  rv.opportunities.slice(0, 3).forEach((text, i) => items.push({
    id: `opp-${i}`, kind: "opportunity", text, impact: i === 0 ? "HIGH" : "MEDIUM",
  }));
  return items.slice(0, 4);
}

export default function StrategyIdeation() {
  const navigate = useNavigate();
  const { run, mutate } = useRun();
  const result = run?.result;
  const strategy = useMemo(() => (result ? getStrategyView(result) : null), [result]);
  const ideas = useMemo(() => getStrategicIdeas(result), [result]);
  const status = run?.status;

  const [selectedId, setSelectedId] = useState(null);
  const [customIdea, setCustomIdea] = useState("");

  const awaitingStrategy = status === "awaiting_strategy_approval" || status === "awaiting_strategy_and_phase_a_approval";
  const stage2Running = status === "running" && run?.stage === "parallel";

  // Auto-approve Phase A in the background — content drafts live in the backend only.
  useEffect(() => {
    const needsPhaseA = status === "awaiting_phase_a_approval" || status === "awaiting_strategy_and_phase_a_approval";
    if (needsPhaseA && run?.id) {
      api.approvePhaseA(run.id).catch(() => { /* surface errors via the run doc polling */ });
    }
  }, [status, run?.id]);

  if (!run) {
    return <Shell><EmptyState title="No active run" desc="Run research first." cta="Start Research" onClick={() => navigate("/research")} /></Shell>;
  }
  if (status === "running" && run.stage === "research") {
    return <Shell><EmptyState title="Research still running" desc="Approve research to launch the strategy agent." cta="View Research" onClick={() => navigate("/research")} /></Shell>;
  }
  if (status === "awaiting_research_approval") {
    return <Shell><EmptyState title="Approve research first" desc="The strategy agent only runs after you approve the research." cta="Review research" onClick={() => navigate("/research")} /></Shell>;
  }

  return (
    <Shell>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <Badge variant="outline" className="border-brand-accent/40 text-brand-accent bg-brand-accent/10 mb-3"><Sparkles className="w-3 h-3 mr-1" /> Strategy</Badge>
          <h1 className="font-heading text-5xl font-bold tracking-tight">GTM Strategy</h1>
          <p className="text-ink-muted mt-2 text-lg">Pick a strategic direction or describe your own — then approve.</p>
        </div>
        {awaitingStrategy && hasStrategy(result) && (
          <Button onClick={async () => { try { await mutate(() => api.approveStrategy(run.id)); toast.success("Strategy approved"); navigate("/command-center"); } catch (e) { toast.error(e.message); } }} data-testid="quick-approve" size="lg" className="bg-brand-success hover:bg-[#0EA371] text-white text-base shadow-lg shadow-brand-success/30">
            <CheckCircle2 className="w-5 h-5 mr-2" /> Approve & continue
          </Button>
        )}
      </div>

      {stage2Running && <Banner kind="running" title="Strategy agent running…" desc="Composing positioning, ICP, channels and roadmap." />}
      {status === "failed" && <Banner kind="failed" title="Pipeline failed" desc={run.error || "Try regenerating from Research."} />}

      {/* Section 1 — AI strategic ideas */}
      {ideas.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Lightbulb className="w-5 h-5 text-brand-primary" />
            <h2 className="text-xl font-bold">AI-recommended directions</h2>
            <div className="ml-3 h-px flex-1 bg-ink-border" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.map((it, i) => {
              const selected = selectedId === it.id;
              return (
                <motion.button key={it.id} onClick={() => setSelectedId(it.id)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} data-testid={`idea-${it.id}`}
                  className={`text-left rounded-xl border p-6 bg-ink-surface transition-all ${selected ? "border-brand-primary/60 glow-primary" : "border-ink-border hover:border-brand-primary/40"}`}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <Badge variant="outline" className="border-ink-border text-ink-muted text-[10px] uppercase tracking-wider">{it.kind}</Badge>
                    <ImpactBadge impact={it.impact} />
                  </div>
                  <p className="text-base text-ink-text leading-relaxed line-clamp-4">{it.text}</p>
                  {selected && (
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-brand-primary">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Selected — discussion below will reference this idea
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 2 — Custom idea */}
      <section className="mb-10">
        <div className="rounded-2xl border border-ink-border bg-gradient-to-br from-ink-surface to-ink-bg p-7">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent to-brand-secondary flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold">Or describe your own product / GTM idea</h2>
          </div>
          <p className="text-sm text-ink-muted mb-4">Use this as a discussion prompt for the agent below. Strategy generation itself is automated from research — picking a card or writing an idea here helps focus your chat.</p>
          <Textarea data-testid="custom-strategy-input" value={customIdea} onChange={(e) => setCustomIdea(e.target.value)} placeholder="e.g., 'Win mid-market via a 14-day pilot focused on RevOps consolidation'" rows={3} className="text-base bg-ink-bg border-ink-border text-ink-text" />
        </div>
      </section>

      {/* Section 3 — Strategy summary card */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-5">
          <Target className="w-5 h-5 text-brand-primary" />
          <h2 className="text-xl font-bold">Generated strategy summary</h2>
          {strategy ? <Badge className="ml-3 bg-brand-success/15 text-brand-success border border-brand-success/40">Ready</Badge> : <Badge className="ml-3 bg-ink-elevated text-ink-muted border border-ink-border">Pending</Badge>}
          <div className="ml-3 h-px flex-1 bg-ink-border" />
        </div>
        {!strategy && !stage2Running && (
          <div className="rounded-xl border border-dashed border-ink-border bg-ink-surface/30 p-6 text-sm text-ink-muted">Strategy was not generated for this run.</div>
        )}
        {!strategy && stage2Running && <SkeletonCard />}
        {strategy && (
          <div className="rounded-2xl border border-ink-border bg-ink-surface p-7">
            <div className="text-xs uppercase tracking-wider text-ink-muted mb-2">North star</div>
            <p className="text-2xl font-bold text-ink-text leading-snug mb-5">{strategy.northStar || "—"}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Mini label="Positioning" text={strategy.foundation.positioning} />
              <Mini label="Primary motion" text={strategy.activation.motion?.primary} />
              <Mini label="Beachhead" text={strategy.foundation.beachhead?.segment} />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={() => navigate("/command-center")} variant="outline" data-testid="open-command-center" className="border-ink-border text-ink-text hover:bg-ink-surface">
                See full strategy <ArrowRight className="ml-2 w-4 h-4" />
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
          </div>
        )}
      </section>

      {/* Section 4 — Grounded chat */}
      <section className="mb-12">
        <ChatPanel scope={strategy ? "strategy" : "research"} />
      </section>

      {(status === "ready_for_phase_b" || status === "awaiting_phase_b_approval" || status === "complete") && (
        <div className="rounded-xl border border-brand-primary/40 bg-brand-primary/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-ink-text">Strategy is locked in</div>
            <div className="text-sm text-ink-muted">Open the Content Page to generate social posts and reports.</div>
          </div>
          <Button onClick={() => navigate("/studio")} className="bg-brand-primary hover:bg-[#9333EA] text-white" data-testid="go-studio">
            Open Studio <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}
    </Shell>
  );
}

function ImpactBadge({ impact }) {
  const map = { HIGH: { c: "bg-brand-success/15 text-brand-success border-brand-success/40", l: "High impact" },
                MEDIUM: { c: "bg-brand-warning/15 text-brand-warning border-brand-warning/40", l: "Medium impact" },
                LOW: { c: "bg-ink-elevated text-ink-muted border-ink-border", l: "Low impact" } };
  const { c, l } = map[impact] || map.MEDIUM;
  return <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${c}`}>{l}</span>;
}

function Mini({ label, text }) {
  return (
    <div className="rounded-lg border border-ink-border bg-ink-bg/40 p-4">
      <div className="text-[11px] uppercase tracking-wider text-ink-muted mb-1.5">{label}</div>
      <div className="text-base text-ink-text leading-snug line-clamp-3">{text || "—"}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-ink-border bg-ink-surface p-7 animate-pulse space-y-3">
      <div className="h-4 w-1/4 bg-ink-elevated rounded" />
      <div className="h-6 w-3/4 bg-ink-elevated rounded" />
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[0,1,2].map((i) => <div key={i} className="h-20 bg-ink-elevated rounded" />)}
      </div>
    </div>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-ink-bg">
      <TopNav />
      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        <div className="flex items-center gap-2 text-sm text-ink-muted mb-6">
          <Link to="/" className="hover:text-ink-text transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/research" className="hover:text-ink-text transition-colors">Research</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-ink-text">Strategy</span>
        </div>
        {children}
      </main>
    </div>
  );
}

function EmptyState({ title, desc, cta, onClick }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-border bg-ink-surface/30 p-12 text-center">
      <Sparkles className="w-10 h-10 mx-auto mb-3 text-brand-accent" />
      <div className="text-xl font-bold text-ink-text">{title}</div>
      <p className="text-base text-ink-muted mt-2 mb-5">{desc}</p>
      <Button onClick={onClick} data-testid="empty-cta" className="bg-brand-primary hover:bg-[#9333EA] text-white">{cta} <ArrowRight className="ml-2 w-4 h-4" /></Button>
    </div>
  );
}

function Banner({ kind, title, desc }) {
  const Icon = kind === "running" ? Loader2 : AlertTriangle;
  const tone = kind === "running" ? "border-brand-accent/40 bg-brand-accent/5 text-brand-accent" : "border-red-400/40 bg-red-400/5 text-red-400";
  return (
    <div className={`rounded-xl border p-5 mb-6 ${tone}`} data-testid={`stage-${kind}`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${kind === "running" ? "animate-spin" : ""}`} />
        <div><div className="font-medium text-ink-text">{title}</div><div className="text-sm text-ink-muted">{desc}</div></div>
      </div>
    </div>
  );
}
