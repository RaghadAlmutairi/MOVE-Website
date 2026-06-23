import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Copy, Download, Linkedin, FileText, Sparkles, ChevronRight, Loader2,
  Presentation, FileSpreadsheet, ArrowRight, ExternalLink, Globe, Send,
  Search, Package, CheckCircle2, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import TopNav from "@/components/TopNav";
import ProgressTracker from "@/components/ProgressTracker";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatPanel from "@/components/ChatPanel";
import { useRun } from "@/lib/RunContext";
import { api } from "@/lib/api";
import { getContentView, hasStrategy, hasContent } from "@/lib/transforms";

// Sequential pipeline export catalogue.
//   PDF  × 3 scopes  · DOCX × 3 scopes  · PPTX (strategy) · ZIP (kit)
const PDF_DOCX_SCOPES = [
  { scope: "research", label: "Research only",         desc: "Market analysis, SWOT, competitors, personas" },
  { scope: "strategy", label: "Strategy only",         desc: "GTM playbook: positioning, ICP, motion, roadmap" },
  { scope: "combined", label: "Research + Strategy",   desc: "Full briefing: research insights with the GTM plan" },
];

export default function ContentStudio() {
  const navigate = useNavigate();
  const { run, mutate } = useRun();
  const result = run?.result;
  const content = useMemo(() => (result ? getContentView(result) : null), [result]);
  const [busy, setBusy] = useState(null);
  const [zipBusy, setZipBusy] = useState(false);

  if (!run) return <Shell><Empty title="No active run" desc="Start research first." cta="Start Research" onClick={() => navigate("/research")} /></Shell>;

  const status = run.status;
  const stage  = run.stage;
  const contentRunning = status === "running" && stage === "content";
  const awaitingContent = status === "awaiting_content_approval";
  const isComplete = status === "complete";
  const isFailed = status === "failed";

  // If strategy hasn't been generated yet, redirect the user to the right step.
  if (!hasStrategy(result)) {
    const desc = status === "awaiting_research_approval"
      ? "Approve the research first; strategy and content come next."
      : status === "awaiting_strategy_approval"
        ? "Approve the strategy and the content suite will be generated here."
        : "Strategy hasn't been generated for this run.";
    const target = status === "awaiting_research_approval" ? "/research" : "/ideation";
    return <Shell><Empty title="Content not ready" desc={desc} cta="Open previous step" onClick={() => navigate(target)} /></Shell>;
  }

  const exportFile = async (format, scope = null) => {
    const id = scope ? `${format}-${scope}` : format;
    setBusy(id);
    try {
      const rec = await api.exportFile(run.id, format, scope);
      toast.success(`${rec.filename} ready`);
      window.open(api.fileUrl(run.id, rec.filename), "_blank");
      await mutate(() => api.getRun(run.id));
    } catch (e) { toast.error("Export failed", { description: e.message }); }
    finally { setBusy(null); }
  };

  const exportZip = async () => {
    setZipBusy(true);
    try {
      const rec = await api.exportZip(run.id);
      toast.success(`${rec.filename} ready`, { description: "Downloading bundle…" });
      window.open(api.fileUrl(run.id, rec.filename), "_blank");
      await mutate(() => api.getRun(run.id));
    } catch (e) { toast.error("ZIP build failed", { description: e.message }); }
    finally { setZipBusy(false); }
  };

  // Find the most recent matching export record (for "open" link).
  const findExport = (format, scope = null) => {
    const list = (run.exports || []).filter((e) => e.format === format && (scope ? e.scope === scope : !e.scope));
    return list.length ? list[list.length - 1] : null;
  };

  return (
    <Shell>
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <Badge>Content & exports</Badge>
          <h1 className="font-heading text-5xl font-medium tracking-tight mt-3 text-move-ink" style={{ fontWeight: 500 }}>Content</h1>
          <p className="text-move-body mt-2 text-lg max-w-2xl">Agent-generated content suite plus every export the strategy needs — separately or as a single ZIP kit.</p>
        </div>
        <div className="flex items-center gap-3">
          {contentRunning && <span className="flex items-center gap-2 text-sm text-move-grad-2"><Loader2 className="w-4 h-4 animate-spin" /> Generating content…</span>}
          {awaitingContent && (
            <>
              <Button onClick={async () => { try { await mutate(() => api.regenerateContent(run.id)); toast.success("Regenerating content…"); } catch (e) { toast.error(e.message); } }} variant="outline" data-testid="regenerate-content" className="border-move-border-ghost text-move-ink hover:bg-move-bg-subtle">
                <RefreshCw className="w-4 h-4 mr-1.5" /> Regenerate
              </Button>
              <Button onClick={async () => { try { await mutate(() => api.approveContent(run.id)); toast.success("Run complete"); } catch (e) { toast.error(e.message); } }} data-testid="approve-content" className="bg-move-success hover:opacity-90 text-white">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve content
              </Button>
            </>
          )}
          {isComplete && (
            <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-move-success-bg text-move-success border border-move-success/40">
              <CheckCircle2 className="w-3.5 h-3.5" /> Run complete
            </span>
          )}
        </div>
      </header>

      {isFailed && (
        <div className="mb-6 rounded-xl border border-move-error/40 bg-move-error-bg p-4 text-sm text-move-error">
          Pipeline failed: {run.error || "unknown error"}
        </div>
      )}

      {/* Big call-to-action: download everything */}
      <div className="rounded-[16px] border border-move-border bg-gradient-to-br from-move-grad-1-tint via-move-grad-2-tint to-move-grad-3-tint p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-move-ink/90 text-white flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-medium text-move-ink" style={{ fontWeight: 500 }}>Download the full GTM kit</div>
            <p className="text-sm text-move-body">All 3 PDFs, 3 Word docs and the strategy deck — bundled into one zip.</p>
          </div>
        </div>
        <Button onClick={exportZip} disabled={zipBusy} data-testid="export-zip" className="bg-move-ink hover:bg-move-ink-hover text-white h-11 px-5 rounded-[12px] font-medium">
          {zipBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-1.5" /> Download .zip</>}
        </Button>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="bg-move-surface border border-move-border p-1 h-auto rounded-[12px]">
          <TabsTrigger data-testid="tab-reports" value="reports" className="data-[state=active]:bg-move-bg-subtle data-[state=active]:text-move-ink text-move-muted px-6 text-base rounded-[8px]">Reports & Exports</TabsTrigger>
          <TabsTrigger data-testid="tab-social" value="social" className="data-[state=active]:bg-move-bg-subtle data-[state=active]:text-move-ink text-move-muted px-6 text-base rounded-[8px]">Social & Marketing</TabsTrigger>
          <TabsTrigger data-testid="tab-chat" value="chat" className="data-[state=active]:bg-move-bg-subtle data-[state=active]:text-move-ink text-move-muted px-6 text-base rounded-[8px]">Ask the agent</TabsTrigger>
        </TabsList>

        {/* ── REPORTS ─────────────────────────────────────────────────── */}
        <TabsContent value="reports" className="mt-6 space-y-8">
          <ExportSection
            title="PDF reports"
            Icon={FileText}
            color="#B5544A"
            scopes={PDF_DOCX_SCOPES}
            findExport={(scope) => findExport("pdf", scope)}
            onExport={(scope) => exportFile("pdf", scope)}
            busyKeyOf={(scope) => `pdf-${scope}`}
            busy={busy}
            runId={run.id}
          />

          <ExportSection
            title="Word documents"
            Icon={FileSpreadsheet}
            color="#3B6FA8"
            scopes={PDF_DOCX_SCOPES}
            findExport={(scope) => findExport("docx", scope)}
            onExport={(scope) => exportFile("docx", scope)}
            busyKeyOf={(scope) => `docx-${scope}`}
            busy={busy}
            runId={run.id}
          />

          <div>
            <SectionHeader Icon={Presentation} title="Strategy presentation" />
            <SingleExportCard
              label="Strategy deck (.pptx)"
              desc="Boardroom-ready slide deck for the GTM strategy."
              accent="#C08B3E"
              existing={findExport("pptx")}
              busy={busy === "pptx"}
              onClick={() => exportFile("pptx")}
              testId="export-pptx"
              runId={run.id}
            />
          </div>
        </TabsContent>

        {/* ── SOCIAL / MARKETING ─────────────────────────────────────── */}
        <TabsContent value="social" className="mt-6 space-y-8">
          {!hasContent(result) && contentRunning && (
            <div className="rounded-[16px] border border-dashed border-move-border bg-move-bg-subtle p-8 text-center text-move-body flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Generating LinkedIn, blog, SEO and email drafts…
            </div>
          )}
          {!hasContent(result) && !contentRunning && (
            <div className="rounded-[16px] border border-dashed border-move-border bg-move-bg-subtle p-8 text-center text-move-body">
              No content was produced for this run. Try regenerating from the strategy step.
            </div>
          )}

          {content?.positioning_line && (
            <div className="rounded-[16px] border border-move-border bg-move-surface p-6">
              <div className="text-xs uppercase tracking-wider text-move-muted mb-1.5 font-medium" style={{ fontWeight: 500 }}>Positioning line</div>
              <p className="text-xl font-medium text-move-ink leading-snug" style={{ fontWeight: 500 }}>{content.positioning_line}</p>
              {content.messaging_pillars?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {content.messaging_pillars.map((p) => <span key={p} className="text-sm px-3 py-1 rounded-full bg-move-bg-subtle border border-move-border">{p}</span>)}
                </div>
              )}
            </div>
          )}

          <ContentGroup title="LinkedIn posts" Icon={Linkedin} testIdPrefix="linkedin" items={(content?.linkedin || []).map((p, i) => ({
            id: `li-${i}`,
            heading: `${p.kind ? `[${p.kind}] ` : ""}${p.hook || "LinkedIn post"}`,
            body: p.body,
            footer: [p.engagement_question, p.cta, (p.hashtags || []).join(" ")].filter(Boolean).join(" · "),
          }))} />

          <ContentGroup title="Blog posts" Icon={Globe} testIdPrefix="blog" items={(content?.blogs || []).map((p, i) => ({
            id: `bl-${i}`,
            heading: `${p.kind ? `[${p.kind}] ` : ""}${p.title}`,
            meta: p.target_keyword ? `Target keyword: ${p.target_keyword}` : "",
            body: p.body,
            footer: p.cta,
          }))} />

          <ContentGroup title="SEO articles" Icon={Search} testIdPrefix="seo" items={(content?.seo || []).map((p, i) => ({
            id: `seo-${i}`,
            heading: p.title || `SEO article ${i + 1}`,
            meta: [p.target_keyword && `Target keyword: ${p.target_keyword}`, p.meta_description && `Meta: ${p.meta_description}`].filter(Boolean).join(" · "),
            body: p.body,
            footer: (p.secondary_keywords || []).join(", "),
          }))} />

          <ContentGroup title="Email campaigns" Icon={Send} testIdPrefix="email" items={(content?.emails || []).map((p, i) => ({
            id: `em-${i}`,
            heading: `${p.kind ? `[${p.kind}] ` : ""}${p.subject}`,
            meta: p.preview ? `Preview: ${p.preview}` : "",
            body: p.body,
            footer: p.cta,
          }))} />
        </TabsContent>

        {/* ── CHAT ────────────────────────────────────────────────────── */}
        <TabsContent value="chat" className="mt-6">
          <ChatPanel scope="content" />
        </TabsContent>
      </Tabs>
    </Shell>
  );
}

// ── UI building blocks ───────────────────────────────────────────────────────

function Badge({ children }) {
  return <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-move-grad-2/40 bg-move-grad-2-tint text-move-grad-2"><Sparkles className="w-3 h-3" /> {children}</span>;
}

function SectionHeader({ Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-move-ink" />
      <h2 className="text-xl font-medium text-move-ink" style={{ fontWeight: 500 }}>{title}</h2>
      <div className="ml-3 h-px flex-1 bg-move-border" />
    </div>
  );
}

function ExportSection({ title, Icon, color, scopes, findExport, onExport, busyKeyOf, busy, runId }) {
  return (
    <div>
      <SectionHeader Icon={Icon} title={title} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scopes.map((s) => {
          const existing = findExport(s.scope);
          const isBusy = busy === busyKeyOf(s.scope);
          return (
            <div key={s.scope} className="rounded-[16px] border border-move-border bg-move-surface p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-medium text-move-ink" style={{ fontWeight: 500 }}>{s.label}</div>
                  <div className="text-sm text-move-body mt-0.5">{s.desc}</div>
                </div>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}1A`, color, border: `1px solid ${color}40` }}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <Button onClick={() => onExport(s.scope)} disabled={isBusy} data-testid={`export-${busyKeyOf(s.scope)}`} className="flex-1 bg-move-ink hover:bg-move-ink-hover text-white h-10 rounded-[10px] font-medium">
                  {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-1.5" /> {existing ? "Regenerate" : "Generate"}</>}
                </Button>
                {existing && (
                  <a href={api.fileUrl(runId, existing.filename)} target="_blank" rel="noreferrer" data-testid={`open-${busyKeyOf(s.scope)}`} className="text-sm text-move-grad-3 hover:text-move-ink flex items-center gap-1 px-2">
                    <ExternalLink className="w-4 h-4" /> open
                  </a>
                )}
              </div>
              {existing && (
                <div className="text-xs text-move-muted">Last build: {Math.round((existing.size || 0) / 1024)} KB</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SingleExportCard({ label, desc, accent, existing, busy, onClick, testId, runId }) {
  return (
    <div className="rounded-[16px] border border-move-border bg-move-surface p-6 flex flex-col md:flex-row md:items-center gap-5">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}1A`, color: accent, border: `1px solid ${accent}40` }}>
        <Presentation className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-base font-medium text-move-ink" style={{ fontWeight: 500 }}>{label}</div>
        <div className="text-sm text-move-body">{desc}</div>
        {existing && <div className="text-xs text-move-muted mt-1">Last build: {Math.round((existing.size || 0) / 1024)} KB</div>}
      </div>
      <div className="flex items-center gap-2">
        {existing && (
          <a href={api.fileUrl(runId, existing.filename)} target="_blank" rel="noreferrer" data-testid={`open-${testId}`} className="text-sm text-move-grad-3 hover:text-move-ink flex items-center gap-1 px-2">
            <ExternalLink className="w-4 h-4" /> open
          </a>
        )}
        <Button onClick={onClick} disabled={busy} data-testid={testId} className="bg-move-ink hover:bg-move-ink-hover text-white h-10 rounded-[10px] font-medium">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-1.5" /> {existing ? "Regenerate" : "Generate"}</>}
        </Button>
      </div>
    </div>
  );
}

function Shell({ children }) {
  const { run } = useRun();
  const status = run?.status;
  const completed = ['research'];
  if (status === 'awaiting_content_approval' || status === 'complete') completed.push('strategy');
  if (status === 'complete') completed.push('content');
  const currentStage = status === 'running' && run?.stage === 'content'
    ? 'content'
    : status === 'awaiting_content_approval' ? 'content'
    : status === 'complete' ? 'export' : null;

  return (
    <div className="min-h-screen bg-move-bg">
      <TopNav />
      <ProgressTracker currentStage={currentStage} completedStages={completed} />
      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        <div className="flex items-center gap-2 text-sm text-move-muted mb-6">
          <Link to="/" className="hover:text-move-ink transition-colors">Home</Link>
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

function ContentGroup({ title, Icon, items, testIdPrefix }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-move-ink" />
        <h3 className="text-lg font-medium" style={{ fontWeight: 500 }}>{title}</h3>
        <span className="text-sm text-move-muted">({items.length})</span>
      </div>
      <div className="space-y-3">
        {items.map((it) => (
          <motion.div key={it.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-[16px] border border-move-border bg-move-surface overflow-hidden" data-testid={`${testIdPrefix}-card-${it.id}`}>
            <div className="px-6 py-4 border-b border-move-border bg-move-bg-subtle flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-base text-move-ink" style={{ fontWeight: 500 }}>{it.heading}</div>
                {it.meta && <div className="text-sm text-move-muted">{it.meta}</div>}
              </div>
              <Button onClick={() => { navigator.clipboard?.writeText(it.body || ""); toast.success("Copied to clipboard"); }} data-testid={`copy-${it.id}`} variant="ghost" size="sm" className="text-move-muted hover:text-move-ink hover:bg-move-bg-subtle h-9 shrink-0 rounded-[8px]">
                <Copy className="w-4 h-4 mr-1.5" /> Copy
              </Button>
            </div>
            <div className="px-6 py-5">
              <pre className="text-base text-move-ink leading-relaxed whitespace-pre-wrap font-sans">{it.body}</pre>
              {it.footer && <div className="mt-4 pt-4 border-t border-move-border text-sm text-move-muted">{it.footer}</div>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
