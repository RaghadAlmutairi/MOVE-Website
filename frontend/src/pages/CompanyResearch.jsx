import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe, MessageSquare, Loader2, ArrowRight, Sparkles, ChevronRight, CheckCircle2, RefreshCw,
  AlertTriangle, TrendingUp, Lightbulb, ShieldAlert, Users, ExternalLink, BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import TopNav from "@/components/TopNav";
import ProgressTracker from "@/components/ProgressTracker";
import ResearchSourcesDrawer from "@/components/ResearchSourcesDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatPanel from "@/components/ChatPanel";
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
  if (status && status !== 'awaiting_research_approval' && status !== 'running') {
    completedStages.push('research');
  }
  if (status && ['awaiting_phase_b_approval', 'complete', 'ready_for_phase_b'].includes(status)) {
    completedStages.push('strategy', 'content');
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

  const onApprove = async (runStrategy, runContent) => {
    if (!run) return;
    try {
      await mutate(() => api.approveResearch(run.id, runStrategy, runContent));
      toast.success("Research approved", { description: "Strategy + Phase A starting in parallel." });
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
    <div className="min-h-screen bg-move-bg">
      <TopNav />
      <ProgressTracker currentStage={currentStage} completedStages={completedStages} />
      
      <main className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8">
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

            <Tabs defaultValue="report" className="mt-8">
              <TabsList className="bg-ink-surface border border-ink-border p-1 h-auto">
                <TabsTrigger data-testid="tab-report" value="report" className="data-[state=active]:bg-ink-elevated data-[state=active]:text-ink-text text-ink-muted px-6 text-sm">Report</TabsTrigger>
                <TabsTrigger data-testid="tab-competitors" value="competitors" className="data-[state=active]:bg-ink-elevated data-[state=active]:text-ink-text text-ink-muted px-6 text-sm">Competitors</TabsTrigger>
                <TabsTrigger data-testid="tab-personas" value="personas" className="data-[state=active]:bg-ink-elevated data-[state=active]:text-ink-text text-ink-muted px-6 text-sm">Personas</TabsTrigger>
              </TabsList>

              <TabsContent value="report" className="mt-6">
                <ReportTab view={view} />
              </TabsContent>
              <TabsContent value="competitors" className="mt-6">
                <CompetitorsTab view={view} />
              </TabsContent>
              <TabsContent value="personas" className="mt-6">
                <PersonasTab view={view} />
              </TabsContent>
            </Tabs>

            {/* Grounded chat about the research */}
            <div className="mt-8">
              <ChatPanel scope="research" />
            </div>

            {/* HITL gate */}
            {isAwaiting && (
              <ApprovalBar onApprove={onApprove} onRegenerate={onRegenerate} />
            )}

            {/* After approval, allow user to navigate forward */}
            {!isAwaiting && status && status !== "running" && status !== "failed" && (
              <div className="mt-10 rounded-xl border border-brand-primary/40 bg-brand-primary/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="font-heading text-lg text-ink-text">Research approved · {labelForStatus(status)}</div>
                  <div className="text-sm text-ink-muted">Move to Strategy & Content to monitor the next stages.</div>
                </div>
                <Button onClick={() => navigate("/ideation")} className="bg-brand-primary hover:bg-[#9333EA] text-white" data-testid="research-go-ideation">
                  Open Strategy & Content <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}
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

function ReportTab({ view }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div className="lg:col-span-7 space-y-5">
        {view.executiveSummary && (
          <Section title="Executive Summary">
            <p className="text-sm text-ink-text/90 leading-relaxed whitespace-pre-wrap">{view.executiveSummary}</p>
          </Section>
        )}
        <Section title="SWOT">
          <div className="grid grid-cols-2 gap-3">
            <SwotBox title="Strengths" items={view.swot.strengths} tone="success" />
            <SwotBox title="Weaknesses" items={view.swot.weaknesses} tone="warning" />
            <SwotBox title="Opportunities" items={view.swot.opportunities} tone="primary" />
            <SwotBox title="Threats" items={view.swot.threats} tone="danger" />
          </div>
        </Section>
      </div>
      <div className="lg:col-span-5 space-y-5">
        {view.trends.length > 0 && <ListSection title="Market Trends" items={view.trends} icon={TrendingUp} />}
        {view.opportunities.length > 0 && <ListSection title="Opportunities" items={view.opportunities} icon={Lightbulb} tone="success" />}
        {view.risks.length > 0 && <ListSection title="Risks" items={view.risks} icon={AlertTriangle} tone="warning" />}
        {view.recommendations.length > 0 && <ListSection title="Recommendations" items={view.recommendations} icon={CheckCircle2} tone="primary" />}
      </div>
    </div>
  );
}

function CompetitorsTab({ view }) {
  const groups = [
    { title: "Company competitors", items: view.companyCompetitors },
    { title: "Product competitors", items: view.productCompetitors },
    { title: "Alternative solutions", items: view.alternatives },
  ].filter((g) => g.items.length > 0);
  if (groups.length === 0) return <EmptyText text="No competitors were surfaced." />;
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.title}>
          <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">{g.title}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {g.items.map((c) => <CompetitorCard key={c.name} c={c} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function CompetitorCard({ c }) {
  return (
    <div className="rounded-xl border border-ink-border bg-ink-surface p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="font-heading font-semibold text-ink-text">{c.name}</div>
          <div className="text-xs text-ink-muted">{c.entity_type}{c.parent_company ? ` · ${c.parent_company}` : ""}{c.directness ? ` · ${c.directness}` : ""}</div>
        </div>
        {c.official_website && (
          <a href={c.official_website} target="_blank" rel="noreferrer" className="text-brand-secondary hover:text-brand-primary text-xs flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> site
          </a>
        )}
      </div>
      {c.value_proposition && <p className="text-sm text-ink-text/90 leading-relaxed mt-1 line-clamp-4">{c.value_proposition}</p>}
      {c.target_audience && <p className="text-xs text-ink-muted mt-2"><span className="text-ink-text/80">Audience:</span> {c.target_audience}</p>}
      {c.key_features?.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1.5">Key features</div>
          <div className="flex flex-wrap gap-1.5">
            {c.key_features.map((f) => <span key={f} className="text-[11px] px-2 py-0.5 rounded-full bg-ink-elevated border border-ink-border">{f}</span>)}
          </div>
        </div>
      )}
      {c.differentiators_usp?.length > 0 && (
        <div className="mt-3 text-xs">
          <span className="text-ink-muted">USP:</span> <span className="text-ink-text/90">{c.differentiators_usp.join(" · ")}</span>
        </div>
      )}
    </div>
  );
}

function PersonasTab({ view }) {
  if (view.personas.length === 0) return <EmptyText text="No buyer personas were surfaced." />;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {view.personas.map((p) => (
        <div key={p.persona_name} className="rounded-xl border border-ink-border bg-ink-surface p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center"><Users className="w-5 h-5 text-brand-primary" /></div>
            <div className="flex-1 min-w-0">
              <div className="font-heading font-semibold text-ink-text">{p.persona_name}</div>
              <div className="text-xs text-ink-muted">{p.role_title}{p.segment ? ` · ${p.segment}` : ""}{p.decision_power && p.decision_power !== "UNKNOWN" ? ` · ${p.decision_power} decision power` : ""}</div>
            </div>
          </div>
          {p.goals?.length > 0 && <MiniList label="Goals" items={p.goals} />}
          {p.pain_points?.length > 0 && <MiniList label="Pain points" items={p.pain_points} />}
          {p.buying_triggers?.length > 0 && <MiniList label="Buying triggers" items={p.buying_triggers} />}
          {p.channels?.length > 0 && (
            <div className="mt-3"><div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1.5">Channels</div><div className="flex flex-wrap gap-1.5">{p.channels.map((c) => <span key={c} className="text-[11px] px-2 py-0.5 rounded-full bg-ink-elevated border border-ink-border">{c}</span>)}</div></div>
          )}
          {p.messaging_angle && <div className="mt-3 text-xs text-ink-text/90 border-t border-ink-border pt-3"><span className="text-ink-muted">Angle:</span> {p.messaging_angle}</div>}
        </div>
      ))}
    </div>
  );
}

function MiniList({ label, items }) {
  return (
    <div className="mt-2">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1">{label}</div>
      <ul className="text-xs text-ink-text/90 space-y-1">
        {items.map((i) => <li key={i} className="flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-brand-primary mt-1.5 shrink-0" />{i}</li>)}
      </ul>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-ink-border bg-ink-surface p-5">
      <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">{title}</div>
      {children}
    </div>
  );
}

function SwotBox({ title, items, tone }) {
  const toneMap = { success: "text-brand-success", warning: "text-brand-warning", primary: "text-brand-primary", danger: "text-red-400" };
  return (
    <div className="rounded-md border border-ink-border bg-ink-bg/40 p-3">
      <div className={`text-[10px] uppercase tracking-wider mb-1.5 ${toneMap[tone]}`}>{title}</div>
      <ul className="space-y-1">
        {items.length === 0 && <li className="text-xs text-ink-muted">—</li>}
        {items.map((i) => <li key={i.point || JSON.stringify(i)} className="text-xs text-ink-text/90 leading-snug">• {i.point || ""}</li>)}
      </ul>
    </div>
  );
}

function ListSection({ title, items, icon: Icon, tone = "muted" }) {
  const toneMap = { success: "text-brand-success", warning: "text-brand-warning", primary: "text-brand-primary", muted: "text-ink-muted" };
  return (
    <div className="rounded-xl border border-ink-border bg-ink-surface p-5">
      <div className={`flex items-center gap-2 text-xs uppercase tracking-wider mb-3 ${toneMap[tone]}`}>{Icon && <Icon className="w-3.5 h-3.5" />}{title}</div>
      <ul className="space-y-2">
        {items.map((i) => <li key={i} className="flex items-start gap-2 text-sm text-ink-text/90"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0" />{i}</li>)}
      </ul>
    </div>
  );
}

function EmptyText({ text }) { return <div className="rounded-xl border border-dashed border-ink-border p-6 text-sm text-ink-muted text-center">{text}</div>; }

function ApprovalBar({ onApprove, onRegenerate }) {
  const [runStrategy, setRunStrategy] = useState(true);
  const [runContent, setRunContent] = useState(true);
  return (
    <div className="mt-8 rounded-2xl border border-brand-primary/40 bg-gradient-to-r from-brand-primary/15 via-brand-accent/10 to-brand-secondary/15 p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="font-heading text-lg text-ink-text">Approve research and continue?</div>
          <p className="text-sm text-ink-muted mt-1">When you approve, the strategy agent and Phase A content agent start in parallel — matching the agent system&apos;s documented flow.</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input data-testid="opt-strategy" type="checkbox" checked={runStrategy} onChange={(e) => setRunStrategy(e.target.checked)} className="accent-brand-primary" />
              <span>Generate GTM strategy</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input data-testid="opt-content" type="checkbox" checked={runContent} onChange={(e) => setRunContent(e.target.checked)} className="accent-brand-primary" />
              <span>Generate marketing content (Phase A)</span>
            </label>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onRegenerate} data-testid="regenerate-research" className="border-ink-border text-ink-text hover:bg-ink-surface">
            <RefreshCw className="w-4 h-4 mr-1.5" /> Regenerate
          </Button>
          <Button onClick={() => onApprove(runStrategy, runContent)} data-testid="approve-research" className="bg-brand-success hover:bg-[#0EA371] text-white shadow-lg shadow-brand-success/30" disabled={!runStrategy && !runContent}>
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
    awaiting_phase_a_approval: "Phase A ready for review",
    awaiting_strategy_and_phase_a_approval: "strategy + Phase A ready",
    ready_for_phase_b: "ready for Phase B",
    complete: "complete",
  }[s]) || s;
}
