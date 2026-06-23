import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Globe, MessageSquare, Loader2, Sparkles, ChevronRight, CheckCircle2, RefreshCw,
  AlertTriangle, ShieldAlert, BookOpen, TrendingUp, Compass, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import TopNav from "@/components/TopNav";
import ProgressTracker from "@/components/ProgressTracker";
import ResearchSourcesDrawer from "@/components/ResearchSourcesDrawer";
import ResearchTOC from "@/components/ResearchTOC";
import StageNav from "@/components/StageNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ResearchExecutiveSummary, SWOTMatrix, InsightCardList,
  CompetitorsTable, PersonaCards, TrendList, Section,
} from "@/components/visuals/ResearchVisuals";
import { useRun } from "@/lib/RunContext";
import { api } from "@/lib/api";
import { getReportView, getSources } from "@/lib/transforms";

/**
 * Research results page — pure visualisation layer.
 *
 * RULES (per spec):
 *   • Every UI element maps DIRECTLY to a field in result.report.
 *   • No invented scores, rankings, confidence metrics, growth rates,
 *     market sizes, executive verdicts, or synthetic summaries.
 *   • If a section's data is empty, the section is HIDDEN (not stubbed).
 *   • Inline citation markers like "[6][48]" are stripped from any
 *     rendered text — citations live in the Sources drawer ONLY.
 */
export default function CompanyResearch() {
  const navigate = useNavigate();
  const { run, startRun, mutate } = useRun();
  const [query, setQuery] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const status = run?.status;
  const stage  = run?.stage;
  const result = run?.result;
  const view    = useMemo(() => (result ? getReportView(result) : null), [result]);
  const sources = useMemo(() => (result ? getSources(result) : []), [result]);

  const isResearchRunning = status === "running" && stage === "research";
  const isAwaiting        = status === "awaiting_research_approval";
  const isFailed          = status === "failed";

  // ProgressTracker driving values.
  const completedStages = [];
  if (status && status !== "awaiting_research_approval" && status !== "running" && status !== "failed") {
    completedStages.push("research");
  }
  if (status === "awaiting_content_approval" || status === "complete") completedStages.push("strategy");
  if (status === "complete") completedStages.push("content");
  const currentStage = isResearchRunning || isAwaiting ? "research" : null;

  // Sections present in this run — drives the sticky TOC AND determines
  // which Section components are mounted below.
  const sectionsPresent = useMemo(() => ({
    "executive-summary": !!view?.executiveSummary,
    "swot":              !!view && (view.swot.strengths.length || view.swot.weaknesses.length
                                  || view.swot.opportunities.length || view.swot.threats.length),
    "opportunities":     !!view && view.opportunities.length > 0,
    "risks":             !!view && view.risks.length > 0,
    "recommendations":   !!view && view.recommendations.length > 0,
    "trends":            !!view && view.trends.length > 0,
    "competitors":       !!view && (view.companyCompetitors.length + view.productCompetitors.length + view.alternatives.length) > 0,
    "personas":          !!view && view.personas.length > 0,
  }), [view]);

  // Actions.
  const onAnalyze = async () => {
    if (!query.trim()) { toast.error("Please enter a company name"); return; }
    setSubmitting(true);
    try {
      await startRun(query.trim(), url.trim());
      toast.success("Research started", { description: "This typically takes 60–120 seconds." });
    } catch (e) { toast.error("Could not start", { description: e.message }); }
    finally { setSubmitting(false); }
  };
  const onApprove = async () => {
    if (!run) return;
    try {
      await mutate(() => api.approveResearch(run.id));
      toast.success("Research approved", { description: "Generating GTM strategy…" });
      navigate("/ideation");
    } catch (e) { toast.error("Approval failed", { description: e.message }); }
  };
  const onRegenerate = async () => {
    if (!run) return;
    try {
      await mutate(() => api.regenerateResearch(run.id));
      toast.success("Regenerating research…");
    } catch (e) { toast.error("Regenerate failed", { description: e.message }); }
  };

  return (
    <div className="min-h-screen bg-move-bg pb-32 lg:pr-[420px]">
      <TopNav />
      <ProgressTracker currentStage={currentStage} completedStages={completedStages} />

      <ResearchSourcesDrawer open={sourcesOpen} onOpenChange={setSourcesOpen} sources={sources} />

      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
        <Crumbs />

        {/* ── Page header ───────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="font-heading text-5xl md:text-6xl font-medium tracking-tight text-move-ink" style={{ fontWeight: 500 }}>
              {view?.title || "Research"}
            </h1>
            {view ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-move-body mt-3">
                {view.industry && <span data-testid="report-industry">{view.industry}</span>}
                {view.geography && <span>· {view.geography}</span>}
              </div>
            ) : (
              <p className="text-move-body mt-3 text-lg max-w-2xl">Enter a company name to launch the multi-agent research pipeline.</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {sources.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setSourcesOpen(true)}
                data-testid="open-sources"
                className="border-move-border-ghost text-move-ink hover:bg-move-bg-subtle rounded-[12px] h-10"
              >
                <BookOpen className="w-4 h-4 mr-2" /> Sources <span className="ml-1 text-move-muted">({sources.length})</span>
              </Button>
            )}
            <Badge variant="outline" className="border-move-success/40 text-move-success bg-move-success-bg w-fit text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-move-success mr-2 animate-pulse" /> Engine online
            </Badge>
          </div>
        </header>

        {/* ── New-run form (always available so user can start another) ─ */}
        {(!view || isAwaiting) && (
          <div className="rounded-[16px] border border-move-border bg-move-surface p-6 mb-10" data-testid="research-form">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-7">
                <label className="text-sm font-medium text-move-ink mb-2 block" style={{ fontWeight: 500 }}>Company name</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-move-muted" />
                  <Input data-testid="research-query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. Stripe, OpenAI, your own brand…" className="pl-10 h-12 text-base bg-move-bg border-move-border-ghost text-move-ink" />
                </div>
              </div>
              <div className="md:col-span-3">
                <label className="text-sm font-medium text-move-ink mb-2 block" style={{ fontWeight: 500 }}>Company URL <span className="text-move-muted font-normal">(optional)</span></label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 w-4 h-4 text-move-muted" />
                  <Input data-testid="research-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="pl-10 h-12 text-base bg-move-bg border-move-border-ghost text-move-ink" />
                </div>
              </div>
              <div className="md:col-span-2">
                <Button onClick={onAnalyze} disabled={submitting || isResearchRunning} data-testid="research-analyze-btn" className="w-full h-12 text-base bg-move-ink hover:bg-move-ink-hover text-white rounded-[12px] font-medium" style={{ fontWeight: 500 }}>
                  {submitting || isResearchRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-1.5" />Research</>}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* States */}
        {isResearchRunning && <StageBanner kind="running" title="Research agent is working…" desc="Routing tools, gathering evidence, synthesising the report." />}
        {isFailed && <StageBanner kind="failed" title="Research failed" desc={run?.error || "Try again or refine your query."} />}
        {!run && !submitting && <EmptyHero />}

        {/* ── Body: sidebar TOC + content column ────────────────────── */}
        {view && (
          <div className="flex gap-10 items-start mt-4">
            <ResearchTOC
              sections={sectionsPresent}
              onOpenSources={() => setSourcesOpen(true)}
              sourcesCount={sources.length}
            />

            <div className="flex-1 min-w-0">
              {view.evidenceLimitation && (
                <div className="mb-8 rounded-[12px] border border-move-warning/40 bg-move-warning-bg p-4 text-sm text-move-ink flex items-start gap-3" data-testid="evidence-limitation">
                  <ShieldAlert className="w-4 h-4 text-move-warning shrink-0 mt-0.5" />
                  <span>{view.evidenceLimitation}</span>
                </div>
              )}

              <ResearchExecutiveSummary text={view.executiveSummary} />

              <SWOTMatrix swot={view.swot} />

              {sectionsPresent.opportunities && (
                <Section id="opportunities" title="Opportunities" icon={TrendingUp}>
                  <InsightCardList items={view.opportunities} tone="success" testIdPrefix="opportunity" />
                </Section>
              )}

              {sectionsPresent.risks && (
                <Section id="risks" title="Risks" icon={AlertTriangle}>
                  <InsightCardList items={view.risks} tone="error" testIdPrefix="risk" />
                </Section>
              )}

              {sectionsPresent.recommendations && (
                <Section id="recommendations" title="Recommendations" icon={Compass}>
                  <InsightCardList items={view.recommendations} tone="grad" testIdPrefix="recommendation" />
                </Section>
              )}

              <TrendList items={view.trends} />

              <CompetitorsTable
                companyCompetitors={view.companyCompetitors}
                productCompetitors={view.productCompetitors}
                alternatives={view.alternatives}
              />

              <PersonaCards personas={view.personas} />

              {/* HITL gate */}
              {isAwaiting && <ApprovalBar onApprove={onApprove} onRegenerate={onRegenerate} />}

              {!isAwaiting && status && status !== "running" && status !== "failed" && (
                <div className="mt-10 rounded-[16px] border border-move-grad-3/40 bg-move-grad-3-tint p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-medium text-move-ink" style={{ fontWeight: 500 }}>Research approved · {labelForStatus(status)}</div>
                    <div className="text-sm text-move-body">Move to Strategy to monitor the next stage.</div>
                  </div>
                  <Button onClick={() => navigate("/ideation")} className="bg-move-ink hover:bg-move-ink-hover text-white" data-testid="research-go-ideation">
                    Open Strategy <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              )}

              <StageNav
                stage="research"
                nextDisabled={isAwaiting}
                onNext={isAwaiting ? onApprove : undefined}
                nextLabel={isAwaiting ? "Approve & continue" : undefined}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────
function Crumbs() {
  return (
    <div className="flex items-center gap-2 text-sm text-move-muted mb-6">
      <Link to="/" className="hover:text-move-ink transition-colors">Home</Link>
      <ChevronRight className="w-3 h-3" />
      <Link to="/projects" className="hover:text-move-ink transition-colors">Projects</Link>
      <ChevronRight className="w-3 h-3" />
      <span className="text-move-ink">Research</span>
    </div>
  );
}

function StageBanner({ kind, title, desc }) {
  const Icon = kind === "running" ? Loader2 : AlertTriangle;
  const tone = kind === "running"
    ? "border-move-grad-2/40 bg-move-grad-2-tint text-move-grad-2"
    : "border-move-error/40 bg-move-error-bg text-move-error";
  return (
    <div className={`rounded-[16px] border p-5 mb-8 ${tone}`} data-testid={`stage-${kind}`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${kind === "running" ? "animate-spin" : ""}`} />
        <div>
          <div className="font-medium text-move-ink" style={{ fontWeight: 500 }}>{title}</div>
          <div className="text-sm text-move-body">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function EmptyHero() {
  return (
    <div className="rounded-[16px] border border-dashed border-move-border bg-move-bg-subtle p-12 text-center" data-testid="research-empty">
      <Sparkles className="w-10 h-10 mx-auto mb-3 text-move-grad-2" />
      <div className="text-xl font-medium text-move-ink" style={{ fontWeight: 500 }}>Ready when you are</div>
      <p className="text-move-body mt-2 max-w-md mx-auto">Type a company name above to launch the research pipeline. Approve the report when it's ready and we'll generate the GTM strategy and content suite next.</p>
    </div>
  );
}

function ApprovalBar({ onApprove, onRegenerate }) {
  return (
    <div className="mt-12 rounded-[20px] border border-move-grad-3/40 bg-gradient-to-r from-move-grad-1-tint via-move-grad-2-tint to-move-grad-3-tint p-7">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="text-xl font-medium text-move-ink" style={{ fontWeight: 500 }}>Approve research and continue?</div>
          <p className="text-sm text-move-body mt-1">Approve to generate the GTM strategy next. Regenerate to re-run the research agent.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onRegenerate} data-testid="regenerate-research" className="border-move-border-ghost text-move-ink hover:bg-move-bg-subtle rounded-[10px]">
            <RefreshCw className="w-4 h-4 mr-1.5" /> Regenerate
          </Button>
          <Button onClick={onApprove} data-testid="approve-research" className="bg-move-success hover:opacity-90 text-white shadow-lg rounded-[10px]">
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve & continue
          </Button>
        </div>
      </div>
    </div>
  );
}

function labelForStatus(s) {
  return ({
    awaiting_strategy_approval: "strategy ready for review",
    awaiting_content_approval: "content ready for review",
    complete: "complete",
  }[s]) || s;
}
