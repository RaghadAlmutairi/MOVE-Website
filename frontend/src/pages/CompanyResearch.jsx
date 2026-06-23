import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Globe, MessageSquare, Loader2, ArrowRight, Sparkles, ChevronRight, CheckCircle2, RefreshCw,
  AlertTriangle, ShieldAlert, BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import TopNav from "@/components/TopNav";
import ProgressTracker from "@/components/ProgressTracker";
import ResearchSourcesDrawer from "@/components/ResearchSourcesDrawer";
import StageNav from "@/components/StageNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExecutiveSummary, IndustrySnapshot, ICPCards, CompetitorMatrix, MarketLandscape,
} from "@/components/visuals/Visuals";
import { useRun } from "@/lib/RunContext";
import { api } from "@/lib/api";
import { getReportView } from "@/lib/transforms";

export default function CompanyResearch() {
  const navigate = useNavigate();
  const { run, startRun, mutate } = useRun();
  const [query, setQuery] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const status = run?.status;
  const stage = run?.stage;
  const result = run?.result;
  const view = useMemo(() => (result ? getReportView(result) : null), [result]);

  const isResearchRunning = status === "running" && stage === "research";
  const isAwaiting = status === "awaiting_research_approval";
  const isFailed = status === "failed";

  // Determine progress tracker state
  const completedStages = [];
  if (status && status !== 'awaiting_research_approval' && status !== 'running' && status !== 'failed') {
    completedStages.push('research');
  }
  if (status === 'awaiting_content_approval' || status === 'complete') {
    completedStages.push('strategy');
  }
  if (status === 'complete') {
    completedStages.push('content');
  }

  const currentStage = isResearchRunning ? 'research' :
                       (status === 'awaiting_research_approval' ? 'research' : null);

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
      
      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        <Breadcrumb crumbs={[{ to: "/", label: "Home" }, { label: "Research" }]} />

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-5xl font-medium tracking-tight text-move-ink" style={{ fontWeight: 500 }}>Research</h1>
            <p className="text-move-body mt-2 text-lg">Enter a company name to launch the multi-agent research pipeline.</p>
          </div>
          <div className="flex items-center gap-3">
            {view && (
              <Button
                variant="outline"
                onClick={() => setSourcesOpen(true)}
                className="border-move-border-ghost text-move-ink hover:bg-move-bg-subtle"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Sources
              </Button>
            )}
            <Badge variant="outline" className="border-move-success/40 text-move-success bg-move-success-bg w-fit text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-move-success mr-2 animate-pulse" /> Engine online
            </Badge>
          </div>
        </div>

        <ResearchSourcesDrawer
          open={sourcesOpen}
          onOpenChange={setSourcesOpen}
          sources={view?.sources || []}
        />

        {/* Query form */}
        <div className="rounded-[16px] border border-move-border bg-move-surface p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-7">
              <label className="text-sm font-medium text-move-ink mb-2 block" style={{ fontWeight: 500 }}>Company name</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-move-muted" />
                <Input data-testid="research-query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g., Stripe, OpenAI, your own brand…" className="pl-10 h-12 text-base bg-move-bg border-move-border-ghost text-move-ink" />
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

        {/* States */}
        {isResearchRunning && <StageBanner kind="running" title="Research agent is working…" desc="Routing tools, gathering evidence, synthesising the report." />}
        {isFailed && <StageBanner kind="failed" title="Research failed" desc={run.error || "Try again or refine your query."} />}

        {/* Empty state */}
        {!run && !submitting && <EmptyState />}

        {/* Result */}
        {view && (
          <>
            <ReportHeader view={view} />

            {/* Industry snapshot — quick-glance metrics */}
            <div className="mt-5">
              <IndustrySnapshot report={{
                industry: view.industry,
                geography: view.geography,
                growth_signal: view.trends?.[0] || "",
                stage: view.confidence ? `Confidence: ${view.confidence}` : "",
              }} />
            </div>

            {/* Executive summary at the top — readable in 30 seconds */}
            <div className="mt-6">
              <ExecutiveSummary
                kind="research"
                insights={view.executiveSummary ? [view.executiveSummary] : (view.trends || []).slice(0, 4)}
                opportunities={view.opportunities}
                risks={view.risks}
                recommendations={view.recommendations}
              />
            </div>

            <Tabs defaultValue="landscape" className="mt-2">
              <TabsList className="bg-move-surface border border-move-border p-1 h-auto rounded-[12px]">
                <TabsTrigger data-testid="tab-landscape" value="landscape" className="data-[state=active]:bg-move-bg-subtle data-[state=active]:text-move-ink text-move-muted px-6 text-sm rounded-[8px]">Market landscape</TabsTrigger>
                <TabsTrigger data-testid="tab-competitors" value="competitors" className="data-[state=active]:bg-move-bg-subtle data-[state=active]:text-move-ink text-move-muted px-6 text-sm rounded-[8px]">Competitors</TabsTrigger>
                <TabsTrigger data-testid="tab-personas" value="personas" className="data-[state=active]:bg-move-bg-subtle data-[state=active]:text-move-ink text-move-muted px-6 text-sm rounded-[8px]">Personas</TabsTrigger>
              </TabsList>

              <TabsContent value="landscape" className="mt-6 space-y-6">
                <MarketLandscape swot={view.swot} opportunities={view.opportunities} />
              </TabsContent>
              <TabsContent value="competitors" className="mt-6">
                {(view.companyCompetitors.length + view.productCompetitors.length + view.alternatives.length) === 0
                  ? <EmptyText text="No competitors were surfaced." />
                  : <CompetitorMatrix competitors={[
                      ...view.companyCompetitors.map((c) => ({
                        name: c.name, url: c.official_website,
                        strengths: c.differentiators_usp, weaknesses: [], positioning: c.value_proposition,
                      })),
                      ...view.productCompetitors.map((c) => ({
                        name: c.name, url: c.official_website,
                        strengths: c.key_features, weaknesses: [], positioning: c.target_audience,
                      })),
                    ]} />
                }
              </TabsContent>
              <TabsContent value="personas" className="mt-6">
                {view.personas.length === 0
                  ? <EmptyText text="No buyer personas were surfaced." />
                  : <ICPCards personas={view.personas.map((p) => ({
                      name: p.persona_name, role: p.role_title, firmographic: p.segment,
                      pains: (p.pain_points || []).map((x) => x.pain || x), goals: p.goals, triggers: p.triggers,
                    }))} />
                }
              </TabsContent>
            </Tabs>

            {/* HITL gate */}
            {isAwaiting && (
              <ApprovalBar onApprove={onApprove} onRegenerate={onRegenerate} />
            )}

            {/* After approval, allow user to navigate forward */}
            {!isAwaiting && status && status !== "running" && status !== "failed" && (
              <div className="mt-10 rounded-[16px] border border-move-grad-3/40 bg-move-grad-3-tint p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-medium text-move-ink" style={{ fontWeight: 500 }}>Research approved · {labelForStatus(status)}</div>
                  <div className="text-sm text-move-body">Move to Strategy & Content to monitor the next stages.</div>
                </div>
                <Button onClick={() => navigate("/ideation")} className="bg-move-ink hover:bg-move-ink-hover text-white" data-testid="research-go-ideation">
                  Open Strategy <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}

            <StageNav stage="research" nextDisabled={isAwaiting} onNext={isAwaiting ? onApprove : undefined} nextLabel={isAwaiting ? "Approve & continue" : undefined} />
          </>
        )}
      </main>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function Breadcrumb({ crumbs }) {
  return (
    <div className="flex items-center gap-2 text-xs text-ink-muted mb-6">
      {crumbs.map((c, i) => (
        <span key={c.label} className="flex items-center gap-2">
          {c.to ? <Link to={c.to} className="hover:text-ink-text transition-colors">{c.label}</Link> : <span className="text-ink-text">{c.label}</span>}
          {i < crumbs.length - 1 && <ChevronRight className="w-3 h-3" />}
        </span>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-ink-border bg-ink-surface/30 p-10 text-center text-ink-muted" data-testid="empty-state">
      <Sparkles className="w-8 h-8 mx-auto mb-3 text-brand-accent" />
      <div className="font-heading text-lg text-ink-text">Ready when you are</div>
      <p className="text-sm mt-1">Submit a research query above to kick off the multi-agent pipeline.</p>
    </div>
  );
}

const STAGE_BANNER_STYLE = {
  running: { Icon: Loader2,        tone: "border-brand-accent/40 bg-brand-accent/5 text-brand-accent" },
  failed:  { Icon: AlertTriangle,  tone: "border-red-400/40 bg-red-400/5 text-red-400" },
  success: { Icon: CheckCircle2,   tone: "border-brand-success/40 bg-brand-success/5 text-brand-success" },
};

function StageBanner({ kind, title, desc }) {
  const { Icon, tone } = STAGE_BANNER_STYLE[kind] || STAGE_BANNER_STYLE.success;
  return (
    <div className={`rounded-xl border p-5 mb-6 ${tone}`} data-testid={`stage-${kind}`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${kind === "running" ? "animate-spin" : ""}`} />
        <div>
          <div className="font-medium text-ink-text">{title}</div>
          <div className="text-xs text-ink-muted">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function ReportHeader({ view }) {
  return (
    <div className="rounded-xl border border-ink-border bg-ink-surface p-7 mb-2">
      <Badge variant="outline" className="border-brand-accent/40 text-brand-accent bg-brand-accent/10 mb-3 text-xs">
        <Sparkles className="w-3 h-3 mr-1" /> Research report
      </Badge>
      <h2 className="font-heading text-3xl font-bold text-ink-text leading-tight">{view.title || "Untitled"}</h2>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted mt-2">
        {view.industry && <span>{view.industry}</span>}
        {view.geography && <span>· {view.geography}</span>}
      </div>
      {view.evidenceLimitation && (
        <div className="mt-4 rounded-md border border-brand-warning/30 bg-brand-warning/5 px-3 py-2 text-sm text-brand-warning flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{view.evidenceLimitation}</span>
        </div>
      )}
    </div>
  );
}

function EmptyText({ text }) { return <div className="rounded-xl border border-dashed border-ink-border p-6 text-sm text-ink-muted text-center">{text}</div>; }

function ApprovalBar({ onApprove, onRegenerate }) {
  return (
    <div className="mt-8 rounded-2xl border border-move-grad-3/40 bg-gradient-to-r from-move-grad-1-tint via-move-grad-2-tint to-move-grad-3-tint p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="font-heading text-lg text-move-ink">Approve research and continue?</div>
          <p className="text-sm text-move-body mt-1">When you approve, the GTM strategy agent runs next, then content is generated automatically — sequential pipeline, you stay in control at every gate.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onRegenerate} data-testid="regenerate-research" className="border-move-border-ghost text-move-ink hover:bg-move-bg-subtle">
            <RefreshCw className="w-4 h-4 mr-1.5" /> Regenerate
          </Button>
          <Button onClick={onApprove} data-testid="approve-research" className="bg-move-success hover:opacity-90 text-white shadow-lg">
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
