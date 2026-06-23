import { useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight, ChevronRight, CheckCircle2, RefreshCw, AlertTriangle, Loader2, Sparkles, Target,
} from "lucide-react";
import { toast } from "sonner";
import TopNav from "@/components/TopNav";
import ProgressTracker from "@/components/ProgressTracker";
import StageNav from "@/components/StageNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExecutiveSummary, SWOTGrid, PositioningCanvas, MessagingPyramid, StrategicPriorities,
} from "@/components/visuals/Visuals";
import { useRun } from "@/lib/RunContext";
import { api } from "@/lib/api";
import { getStrategyView, getReportView, hasStrategy } from "@/lib/transforms";

export default function StrategyIdeation() {
  const navigate = useNavigate();
  const { run, mutate } = useRun();
  const result = run?.result;
  const strategy = useMemo(() => (result ? getStrategyView(result) : null), [result]);
  const report = useMemo(() => (result ? getReportView(result) : null), [result]);
  const status = run?.status;

  const awaitingStrategy = status === "awaiting_strategy_approval";
  const strategyRunning = status === "running" && (run?.stage === "strategy" || run?.stage === "parallel");

  if (!run) return <Shell><EmptyState title="No active run" desc="Run research first." cta="Start Research" onClick={() => navigate("/research")} /></Shell>;
  if (status === "running" && run.stage === "research")
    return <Shell><EmptyState title="Research still running" desc="Approve research to launch the strategy agent." cta="View Research" onClick={() => navigate("/research")} /></Shell>;
  if (status === "awaiting_research_approval")
    return <Shell><EmptyState title="Approve research first" desc="The strategy agent only runs after you approve the research." cta="Review research" onClick={() => navigate("/research")} /></Shell>;

  const positioning = strategy && {
    statement: strategy.foundation.positioning,
    for_audience: strategy.foundation.icp?.title || strategy.foundation.icp?.segment,
    who_need: (strategy.foundation.topPains || [])[0],
    our_product: report?.title || run?.query,
    provides: strategy.foundation.slot?.value,
    unlike: (strategy.foundation.competitiveEdges || [])[0]?.against || (strategy.foundation.competitiveEdges || [])[0],
    differentiator: strategy.foundation.slot?.differentiator,
  };

  const messaging = strategy && {
    value_prop: strategy.northStar,
    pillars: (strategy.activation.messagingByPersona || []).slice(0, 3).map((p) => ({
      label: p.persona || p.name || "Persona",
      description: p.headline || p.message || "",
    })),
    proofs: strategy.foundation.competitiveEdges?.map((e) => (typeof e === "string" ? e : (e.label || e.edge || ""))) || [],
  };

  const priorities = (strategy?.execution?.roadmap || []).map((r, i) => ({
    label: r.theme || r.title || `Sprint ${i + 1}`,
    description: r.summary || r.description || (Array.isArray(r.actions) ? r.actions.join(" · ") : ""),
    kpis: r.kpis || r.metrics,
    owner: r.owner,
  }));

  return (
    <Shell>
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <Badge variant="outline" className="border-move-grad-2/40 text-move-grad-2 bg-move-grad-2-tint mb-3">
            <Sparkles className="w-3 h-3 mr-1" /> Strategy
          </Badge>
          <h1 className="font-heading text-5xl font-medium tracking-tight text-move-ink" style={{ fontWeight: 500 }}>GTM Strategy</h1>
          <p className="text-move-body mt-2 text-lg max-w-2xl">Positioning, messaging, and a 90-day plan — visualised so you can scan it in under a minute.</p>
        </div>
        {awaitingStrategy && hasStrategy(result) && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={async () => { try { await mutate(() => api.regenerateStrategy(run.id)); toast.success("Regenerating strategy…"); } catch (e) { toast.error(e.message); } }} variant="outline" data-testid="regenerate-strategy" className="border-move-border-ghost text-move-ink hover:bg-move-bg-subtle">
              <RefreshCw className="w-4 h-4 mr-1.5" /> Regenerate
            </Button>
            <Button onClick={async () => { try { await mutate(() => api.approveStrategy(run.id)); toast.success("Strategy approved", { description: "Generating content suite…" }); navigate("/studio"); } catch (e) { toast.error(e.message); } }} data-testid="approve-strategy" size="lg" className="bg-move-success hover:opacity-90 text-white shadow-lg">
              <CheckCircle2 className="w-5 h-5 mr-2" /> Approve & continue
            </Button>
          </div>
        )}
      </header>

      {strategyRunning && <Banner kind="running" title="Strategy agent running…" desc="Composing positioning, ICP, channels and roadmap." />}
      {status === "failed" && <Banner kind="failed" title="Pipeline failed" desc={run.error || "Try regenerating from Research."} />}

      {!strategy && !strategyRunning && (
        <div className="rounded-[16px] border border-dashed border-move-border bg-move-bg-subtle p-8 text-center text-move-body">Strategy was not generated for this run.</div>
      )}
      {!strategy && strategyRunning && <SkeletonCard />}

      {strategy && (
        <>
          {/* Executive summary at top — 30-second read */}
          <ExecutiveSummary
            kind="strategy"
            insights={strategy.northStar ? [strategy.northStar] : []}
            opportunities={(strategy.foundation.topPains || []).slice(0, 4).map((p) => `Address: ${p}`)}
            risks={strategy.execution.risks || []}
            recommendations={priorities.slice(0, 4).map((p) => p.label)}
          />

          {/* North star */}
          <section className="mb-8 rounded-[16px] border border-move-border bg-move-surface p-6">
            <div className="text-xs uppercase tracking-wider text-move-grad-2 font-medium mb-2" style={{ fontWeight: 500 }}>North star</div>
            <p className="text-2xl font-medium text-move-ink leading-snug" style={{ fontWeight: 500 }}>{strategy.northStar || "—"}</p>
          </section>

          {/* Positioning canvas */}
          <Section icon={Target} title="Positioning canvas">
            <PositioningCanvas positioning={positioning} />
          </Section>

          {/* SWOT */}
          {(report?.swot && (report.swot.strengths.length || report.swot.weaknesses.length)) > 0 && (
            <Section icon={AlertTriangle} title="SWOT">
              <SWOTGrid swot={{
                strengths:     report.swot.strengths.map((s) => s.point || s),
                weaknesses:    report.swot.weaknesses.map((s) => s.point || s),
                opportunities: report.swot.opportunities.map((s) => s.point || s),
                threats:       report.swot.threats.map((s) => s.point || s),
              }} />
            </Section>
          )}

          {/* Messaging pyramid */}
          <Section icon={Sparkles} title="Messaging pyramid">
            <MessagingPyramid messaging={messaging} />
          </Section>

          {/* Strategic priorities */}
          {priorities.length > 0 && (
            <Section icon={CheckCircle2} title="Strategic priorities (90-day plan)">
              <StrategicPriorities priorities={priorities} />
            </Section>
          )}

          {(status === "awaiting_content_approval" || status === "complete") && (
            <div className="mt-8 rounded-[16px] border border-move-grad-3/40 bg-move-grad-3-tint p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-lg font-medium text-move-ink" style={{ fontWeight: 500 }}>Strategy is locked in</div>
                <div className="text-sm text-move-body">Open the Content page to review the generated suite and download reports.</div>
              </div>
              <Button onClick={() => navigate("/studio")} className="bg-move-ink hover:bg-move-ink-hover text-white" data-testid="go-studio">
                Open Content <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <StageNav
        stage="strategy"
        nextDisabled={awaitingStrategy && !!strategy}
        onNext={awaitingStrategy && strategy
          ? async () => { try { await mutate(() => api.approveStrategy(run.id)); toast.success("Strategy approved", { description: "Generating content suite…" }); navigate("/studio"); } catch (e) { toast.error(e.message); } }
          : undefined}
        nextLabel={awaitingStrategy && strategy ? "Approve & continue" : undefined}
      />
    </Shell>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────
function Section({ icon: Icon, title, children }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-move-ink" />
        <h2 className="text-xl font-medium text-move-ink" style={{ fontWeight: 500 }}>{title}</h2>
        <div className="ml-3 h-px flex-1 bg-move-border" />
      </div>
      {children}
    </section>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-[16px] border border-move-border bg-move-surface p-7 animate-pulse space-y-3">
      <div className="h-4 w-1/4 bg-move-bg-subtle rounded" />
      <div className="h-6 w-3/4 bg-move-bg-subtle rounded" />
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[0, 1, 2].map((i) => <div key={i} className="h-20 bg-move-bg-subtle rounded" />)}
      </div>
    </div>
  );
}

function Shell({ children }) {
  const { run } = useRun();
  const status = run?.status;
  const completed = [];
  if (status && status !== "awaiting_research_approval" && status !== "running" && status !== "failed") completed.push("research");
  if (status === "awaiting_content_approval" || status === "complete") completed.push("strategy");
  if (status === "complete") completed.push("content");
  const currentStage = status === "awaiting_strategy_approval" || (status === "running" && run?.stage === "strategy") ? "strategy" : null;
  return (
    <div className="min-h-screen bg-move-bg pb-32 lg:pr-[420px]">
      <TopNav />
      <ProgressTracker currentStage={currentStage} completedStages={completed} />
      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        <div className="flex items-center gap-2 text-sm text-move-muted mb-6">
          <Link to="/" className="hover:text-move-ink transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/projects" className="hover:text-move-ink transition-colors">Projects</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/research" className="hover:text-move-ink transition-colors">Research</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-move-ink">Strategy</span>
        </div>
        {children}
      </main>
    </div>
  );
}

function EmptyState({ title, desc, cta, onClick }) {
  return (
    <div className="rounded-[16px] border border-dashed border-move-border bg-move-bg-subtle p-12 text-center">
      <Sparkles className="w-10 h-10 mx-auto mb-3 text-move-grad-2" />
      <div className="text-xl font-medium text-move-ink" style={{ fontWeight: 500 }}>{title}</div>
      <p className="text-base text-move-body mt-2 mb-5">{desc}</p>
      <Button onClick={onClick} data-testid="empty-cta" className="bg-move-ink hover:bg-move-ink-hover text-white rounded-[12px] font-medium">{cta} <ArrowRight className="ml-2 w-4 h-4" /></Button>
    </div>
  );
}

function Banner({ kind, title, desc }) {
  const Icon = kind === "running" ? Loader2 : AlertTriangle;
  const tone = kind === "running"
    ? "border-move-grad-2/40 bg-move-grad-2-tint text-move-grad-2"
    : "border-move-error/40 bg-move-error-bg text-move-error";
  return (
    <div className={`rounded-[16px] border p-5 mb-6 ${tone}`} data-testid={`stage-${kind}`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${kind === "running" ? "animate-spin" : ""}`} />
        <div>
          <div className="font-medium text-move-ink">{title}</div>
          <div className="text-sm text-move-body">{desc}</div>
        </div>
      </div>
    </div>
  );
}
