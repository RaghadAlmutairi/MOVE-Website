import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Linkedin, Sparkles, ChevronRight, Loader2, ArrowRight,
  Globe, Send, Search, CheckCircle2, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import TopNav from "@/components/TopNav";
import ProgressTracker from "@/components/ProgressTracker";
import StageNav from "@/components/StageNav";
import { Button } from "@/components/ui/button";
import { ExpandableContentCard } from "@/components/visuals/Visuals";
import { useRun } from "@/lib/RunContext";
import { api } from "@/lib/api";
import { getContentView, hasStrategy, hasContent } from "@/lib/transforms";

export default function ContentStudio() {
  const navigate = useNavigate();
  const { run, mutate } = useRun();
  const result = run?.result;
  const content = useMemo(() => (result ? getContentView(result) : null), [result]);
  const [busy, setBusy] = useState(null);

  if (!run) return <Shell><Empty title="No active run" desc="Start research first." cta="Start Research" onClick={() => navigate("/research")} /></Shell>;

  const status = run.status;
  const stage  = run.stage;
  const contentRunning = status === "running" && stage === "content";
  const awaitingContent = status === "awaiting_content_approval";

  if (!hasStrategy(result)) {
    const desc = status === "awaiting_research_approval"
      ? "Approve the research first; strategy and content come next."
      : status === "awaiting_strategy_approval"
        ? "Approve the strategy and the content suite will be generated here."
        : "Strategy hasn't been generated for this run.";
    const target = status === "awaiting_research_approval" ? "/research" : "/ideation";
    return <Shell><Empty title="Content not ready" desc={desc} cta="Open previous step" onClick={() => navigate(target)} /></Shell>;
  }

  const onApprove = async () => {
    setBusy("approve");
    try { await mutate(() => api.approveContent(run.id)); toast.success("Run complete"); navigate("/export"); }
    catch (e) { toast.error(e.message); }
    finally { setBusy(null); }
  };
  const onRegenerate = async () => {
    setBusy("regen");
    try { await mutate(() => api.regenerateContent(run.id)); toast.success("Regenerating content…"); }
    catch (e) { toast.error(e.message); }
    finally { setBusy(null); }
  };

  const groups = [
    { key: "linkedin", label: "LinkedIn posts",   Icon: Linkedin, items: (content?.linkedin || []).map((p, i) => ({
        id: `li-${i}`,
        heading: `${p.kind ? `[${p.kind}] ` : ""}${p.hook || "LinkedIn post"}`,
        body: p.body,
        footer: [p.engagement_question, p.cta, (p.hashtags || []).join(" ")].filter(Boolean).join(" · "),
      })) },
    { key: "blog",  label: "Blog posts",  Icon: Globe,  items: (content?.blogs || []).map((p, i) => ({
        id: `bl-${i}`,
        heading: `${p.kind ? `[${p.kind}] ` : ""}${p.title}`,
        meta: p.target_keyword ? `Target keyword: ${p.target_keyword}` : "",
        body: p.body,
        footer: p.cta,
      })) },
    { key: "seo",   label: "SEO articles", Icon: Search, items: (content?.seo || []).map((p, i) => ({
        id: `seo-${i}`,
        heading: p.title || `SEO article ${i + 1}`,
        meta: [p.target_keyword && `Target keyword: ${p.target_keyword}`, p.meta_description && `Meta: ${p.meta_description}`].filter(Boolean).join(" · "),
        body: p.body,
        footer: (p.secondary_keywords || []).join(", "),
      })) },
    { key: "email", label: "Email campaigns", Icon: Send, items: (content?.emails || []).map((p, i) => ({
        id: `em-${i}`,
        heading: `${p.kind ? `[${p.kind}] ` : ""}${p.subject}`,
        meta: p.preview ? `Preview: ${p.preview}` : "",
        body: p.body,
        footer: p.cta,
      })) },
  ];

  // Asset cards summary at top — counts of generated content per channel
  const counts = groups.map((g) => ({ key: g.key, label: g.label, count: g.items.length, Icon: g.Icon }));

  return (
    <Shell>
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-move-grad-2/40 bg-move-grad-2-tint text-move-grad-2 mb-3">
            <Sparkles className="w-3 h-3" /> Content
          </span>
          <h1 className="font-heading text-5xl font-medium tracking-tight text-move-ink" style={{ fontWeight: 500 }}>Content suite</h1>
          <p className="text-move-body mt-2 text-lg max-w-2xl">Every asset the agent generated, grouped by channel — preview, expand, copy, or move on to exports.</p>
        </div>
        <div className="flex items-center gap-2">
          {contentRunning && <span className="flex items-center gap-2 text-sm text-move-grad-2"><Loader2 className="w-4 h-4 animate-spin" /> Generating content…</span>}
          {awaitingContent && (
            <>
              <Button onClick={onRegenerate} disabled={busy === "regen"} variant="outline" data-testid="regenerate-content" className="border-move-border-ghost text-move-ink hover:bg-move-bg-subtle">
                {busy === "regen" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RefreshCw className="w-4 h-4 mr-1.5" /> Regenerate</>}
              </Button>
              <Button onClick={onApprove} disabled={busy === "approve"} data-testid="approve-content" className="bg-move-success hover:opacity-90 text-white">
                {busy === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve & finish</>}
              </Button>
            </>
          )}
          {status === "complete" && (
            <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-move-success-bg text-move-success border border-move-success/40">
              <CheckCircle2 className="w-3.5 h-3.5" /> Run complete
            </span>
          )}
        </div>
      </header>

      {/* Asset cards summary */}
      {hasContent(result) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8" data-testid="asset-cards">
          {counts.map(({ key, label, count, Icon }) => (
            <div key={key} className="rounded-[16px] border border-move-border bg-move-surface p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-move-grad-1-tint to-move-grad-3-tint flex items-center justify-center text-move-grad-2">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-3xl font-medium text-move-ink leading-none" style={{ fontWeight: 500 }}>{count}</span>
              </div>
              <div className="text-sm text-move-body">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Positioning line + pillars */}
      {content?.positioning_line && (
        <div className="rounded-[16px] border border-move-border bg-move-surface p-6 mb-8">
          <div className="text-xs uppercase tracking-wider text-move-muted mb-1.5 font-medium" style={{ fontWeight: 500 }}>Positioning line</div>
          <p className="text-xl font-medium text-move-ink leading-snug" style={{ fontWeight: 500 }}>{content.positioning_line}</p>
          {content.messaging_pillars?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {content.messaging_pillars.map((p) => (
                <span key={p} className="text-sm px-3 py-1 rounded-full bg-move-bg-subtle border border-move-border">{p}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {!hasContent(result) && contentRunning && (
        <div className="rounded-[16px] border border-dashed border-move-border bg-move-bg-subtle p-8 text-center text-move-body flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Generating LinkedIn, blog, SEO and email drafts…
        </div>
      )}

      {/* Groups — always render all 4 channels so testids stay stable. */}
      {groups.map((g) => (
        <section key={g.key} className="mb-8" data-testid={`content-group-${g.key}`}>
          <div className="flex items-center gap-2 mb-3">
            <g.Icon className="w-5 h-5 text-move-ink" />
            <h3 className="text-xl font-medium text-move-ink" style={{ fontWeight: 500 }}>{g.label}</h3>
            <span className="text-sm text-move-muted">({g.items.length})</span>
            <div className="ml-3 h-px flex-1 bg-move-border" />
          </div>
          {g.items.length > 0 ? (
            <div className="space-y-3">
              {g.items.map((it) => (
                <ExpandableContentCard
                  key={it.id}
                  heading={it.heading}
                  meta={it.meta}
                  body={it.body}
                  footer={it.footer}
                  testId={`${g.key}-card-${it.id}`}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[16px] border border-dashed border-move-border bg-move-bg-subtle/60 p-5 text-sm text-move-muted text-center" data-testid={`content-empty-${g.key}`}>
              No {g.label.toLowerCase()} were generated for this run.
            </div>
          )}
        </section>
      ))}

      <StageNav stage="content" />
    </Shell>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────

function Shell({ children }) {
  const { run } = useRun();
  const status = run?.status;
  const completed = ["research"];
  if (status === "awaiting_content_approval" || status === "complete") completed.push("strategy");
  if (status === "complete") completed.push("content");
  const currentStage = status === "running" && run?.stage === "content"
    ? "content"
    : status === "awaiting_content_approval" ? "content"
    : status === "complete" ? "export" : null;

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
          <Link to="/ideation" className="hover:text-move-ink transition-colors">Strategy</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-move-ink">Content</span>
        </div>
        {children}
      </main>
    </div>
  );
}

function Empty({ title, desc, cta, onClick }) {
  return (
    <div className="rounded-[16px] border border-dashed border-move-border bg-move-bg-subtle p-12 text-center" data-testid="studio-empty">
      <Sparkles className="w-10 h-10 mx-auto mb-3 text-move-grad-2" />
      <div className="text-xl font-medium text-move-ink" style={{ fontWeight: 500 }}>{title}</div>
      <p className="text-base text-move-body mt-2 mb-5">{desc}</p>
      <Button onClick={onClick} className="bg-move-ink hover:bg-move-ink-hover text-white rounded-[12px] font-medium" style={{ fontWeight: 500 }}>{cta} <ArrowRight className="ml-2 w-4 h-4" /></Button>
    </div>
  );
}
