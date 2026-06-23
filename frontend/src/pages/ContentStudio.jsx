import { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Copy, Download, Linkedin, Mail, FileText, Sparkles, ChevronRight, Loader2,
  Presentation, FileSpreadsheet, ArrowRight, ExternalLink, Globe, Send,
} from "lucide-react";
import { toast } from "sonner";
import TopNav from "@/components/TopNav";
import ProgressTracker from "@/components/ProgressTracker";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRun } from "@/lib/RunContext";
import { api } from "@/lib/api";
import { getContentView, hasPhaseB } from "@/lib/transforms";

// Real export formats supported by gtm_v4_fixed — no others.
const FORMATS = [
  { key: "strategy_pdf", label: "Strategy PDF",     Icon: FileSpreadsheet, color: "#A855F7", filename: "gtm_strategy.pdf" },
  { key: "pdf",          label: "Combined PDF",     Icon: FileText,        color: "#EF4444", filename: "report.pdf" },
  { key: "word",         label: "Combined Word",    Icon: FileText,        color: "#3B82F6", filename: "report.docx" },
  { key: "pptx",         label: "PowerPoint deck",  Icon: Presentation,    color: "#F97316", filename: "presentation.pptx" },
];

const DEFAULT_CHANNELS = ["linkedin", "blog", "email"];

export default function ContentStudio() {
  const navigate = useNavigate();
  const { run, mutate } = useRun();
  const result = run?.result;
  const content = useMemo(() => (result ? getContentView(result) : null), [result]);
  const [busyFmt, setBusyFmt] = useState(null);

  // Silently kick off Phase B in the background when the run is ready,
  // and silently approve it when it returns.
  useEffect(() => {
    if (!run?.id) return;
    if (run.status === "ready_for_phase_b") {
      api.startPhaseB(run.id, DEFAULT_CHANNELS).catch(() => {});
    }
    if (run.status === "awaiting_phase_b_approval") {
      api.approvePhaseB(run.id).catch(() => {});
    }
  }, [run?.id, run?.status]);

  if (!run) return <Shell><Empty title="No active run" desc="Start research first." cta="Start Research" onClick={() => navigate("/research")} /></Shell>;
  if (!content || (content.linkedin.length === 0 && content.blogs.length === 0 && content.emails.length === 0)) {
    return <Shell><Empty title="Content not ready" desc="Approve the strategy and the content agent will produce drafts here." cta="Open Strategy" onClick={() => navigate("/ideation")} /></Shell>;
  }

  const phaseBRunning = run.status === "running" && run.stage === "content_phase_b";

  const exportFile = async (fmt) => {
    setBusyFmt(fmt);
    try {
      const rec = await api.exportFile(run.id, fmt);
      toast.success(`${rec.filename} ready`);
      window.open(api.fileUrl(run.id, rec.filename), "_blank");
      await mutate(() => api.getRun(run.id));
    } catch (e) { toast.error("Export failed", { description: e.message }); }
    finally { setBusyFmt(null); }
  };

  const completedExports = (run.exports || []).reduce((m, e) => { m[e.format] = e; return m; }, {});

  // Progress tracker state
  const completedStages = ['research', 'strategy', 'content'];
  const currentStage = phaseBRunning ? 'content' : 'export';

  return (
    <Shell>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <Badge>Content & exports</Badge>
          <h1 className="text-5xl font-medium tracking-tight mt-3 text-move-ink" style={{ fontWeight: 500 }}>Content Page</h1>
          <p className="text-move-body mt-2 text-lg">Agent-generated social posts and downloadable reports.</p>
        </div>
        {phaseBRunning && (
          <div className="flex items-center gap-2 text-sm text-move-grad-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Generating more content…
          </div>
        )}
      </div>

      <Tabs defaultValue="social" className="w-full">
        <TabsList className="bg-move-surface border border-move-border p-1 h-auto rounded-[12px]">
          <TabsTrigger data-testid="tab-social" value="social" className="data-[state=active]:bg-move-bg-subtle data-[state=active]:text-move-ink text-move-muted px-6 text-base rounded-[8px]">Social Media Content</TabsTrigger>
          <TabsTrigger data-testid="tab-reporting" value="reporting" className="data-[state=active]:bg-move-bg-subtle data-[state=active]:text-move-ink text-move-muted px-6 text-base rounded-[8px]">Reporting</TabsTrigger>
        </TabsList>

        {/* SOCIAL */}
        <TabsContent value="social" className="mt-6 space-y-8">
          {content.positioning_line && (
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

          <ContentGroup title="LinkedIn posts" Icon={Linkedin} items={content.linkedin.map((p, i) => ({
            id: `li-${i}`,
            heading: `${p.kind ? `[${p.kind}] ` : ""}${p.hook || "LinkedIn post"}`,
            body: p.body,
            footer: [p.engagement_question, p.cta, (p.hashtags || []).join(" ")].filter(Boolean).join(" · "),
          }))} />

          <ContentGroup title="Blog posts" Icon={Globe} items={content.blogs.map((p, i) => ({
            id: `bl-${i}`,
            heading: `${p.kind ? `[${p.kind}] ` : ""}${p.title}`,
            meta: p.target_keyword ? `Target keyword: ${p.target_keyword}` : "",
            body: p.body,
            footer: p.cta,
          }))} emptyText="The blog drafts are still generating — they'll appear here shortly." running={phaseBRunning && !hasPhaseB(result)} />

          <ContentGroup title="Email campaigns" Icon={Send} items={content.emails.map((p, i) => ({
            id: `em-${i}`,
            heading: `${p.kind ? `[${p.kind}] ` : ""}${p.subject}`,
            meta: p.preview ? `Preview: ${p.preview}` : "",
            body: p.body,
            footer: p.cta,
          }))} emptyText="The email drafts are still generating — they'll appear here shortly." running={phaseBRunning && !hasPhaseB(result)} />
        </TabsContent>

        {/* REPORTING */}
        <TabsContent value="reporting" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FORMATS.map((f) => {
              const existing = completedExports[f.key];
              return (
                <div key={f.key} className="rounded-2xl border border-ink-border bg-ink-surface p-6 flex items-center gap-5">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${f.color}20`, color: f.color, border: `1px solid ${f.color}40` }}>
                    <f.Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-ink-text">{f.label}</div>
                    <div className="text-sm text-ink-muted">{existing ? `${Math.round((existing.size || 0) / 1024)} KB · generated` : "Not generated yet"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {existing && (
                      <a href={api.fileUrl(run.id, existing.filename)} target="_blank" rel="noreferrer" className="text-sm text-brand-secondary hover:text-brand-primary flex items-center gap-1" data-testid={`open-${f.key}`}>
                        <ExternalLink className="w-4 h-4" /> open
                      </a>
                    )}
                    <Button data-testid={`export-${f.key}`} onClick={() => exportFile(f.key)} disabled={busyFmt === f.key} className="bg-brand-primary hover:bg-[#9333EA] text-white h-10 text-base">
                      {busyFmt === f.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-1.5" /> {existing ? "Regenerate" : "Generate"}</>}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-sm text-ink-muted">All exports are produced server-side by the agent&apos;s document exporters.</div>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}

function Badge({ children }) {
  return <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-move-grad-2/40 bg-move-grad-2-tint text-move-grad-2"><Sparkles className="w-3 h-3" /> {children}</span>;
}

function Shell({ children }) {
  const { run } = useRun();
  const completedStages = ['research', 'strategy', 'content'];
  const currentStage = run?.status === "running" && run?.stage === "content_phase_b" ? 'content' : 'export';
  
  return (
    <div className="min-h-screen bg-move-bg">
      <TopNav />
      <ProgressTracker currentStage={currentStage} completedStages={completedStages} />
      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        <div className="flex items-center gap-2 text-sm text-move-muted mb-6">
          <Link to="/" className="hover:text-move-ink transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/command-center" className="hover:text-move-ink transition-colors">Strategy Studio</Link>
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

function ContentGroup({ title, Icon, items, emptyText, running = false }) {
  if (!items || items.length === 0) {
    if (emptyText) return (
      <div>
        <div className="flex items-center gap-2 mb-3"><Icon className="w-5 h-5 text-move-ink" /><h3 className="text-lg font-medium" style={{ fontWeight: 500 }}>{title}</h3></div>
        <div className="rounded-[16px] border border-dashed border-move-border p-6 text-sm text-move-muted text-center flex items-center justify-center gap-2">
          {running && <Loader2 className="w-4 h-4 animate-spin" />} {emptyText}
        </div>
      </div>
    );
    return null;
  }
  return (
    <div>
      <div className="flex items-center gap-2 mb-3"><Icon className="w-5 h-5 text-move-ink" /><h3 className="text-lg font-medium" style={{ fontWeight: 500 }}>{title}</h3><span className="text-sm text-move-muted">({items.length})</span></div>
      <div className="space-y-3">
        {items.map((it) => (
          <motion.div key={it.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-[16px] border border-move-border bg-move-surface overflow-hidden">
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
