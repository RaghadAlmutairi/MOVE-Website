import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Copy, Download, Linkedin, Mail, FileText, Sparkles, ChevronRight, Loader2, CheckCircle2,
  RefreshCw, AlertTriangle, Presentation, FileSpreadsheet, ArrowRight, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRun } from "@/lib/RunContext";
import { api } from "@/lib/api";
import { getContentView, hasPhaseB } from "@/lib/transforms";

// gtm_v4_fixed supports exactly these export formats — no others.
const FORMATS = [
  { key: "pdf",          label: "Combined PDF",        Icon: FileText,          color: "#EF4444", filename: "report.pdf" },
  { key: "word",         label: "Combined Word",       Icon: FileText,          color: "#3B82F6", filename: "report.docx" },
  { key: "pptx",         label: "PowerPoint deck",     Icon: Presentation,      color: "#F97316", filename: "presentation.pptx" },
  { key: "strategy_pdf", label: "Strategy PDF",        Icon: FileSpreadsheet,   color: "#A855F7", filename: "gtm_strategy.pdf" },
];

const VALID_CHANNELS = [
  { key: "linkedin", label: "LinkedIn posts" },
  { key: "blog",     label: "Blog articles" },
  { key: "seo",      label: "SEO articles" },
  { key: "email",    label: "Email sequences" },
];

export default function ContentStudio() {
  const navigate = useNavigate();
  const { run, mutate } = useRun();
  const result = run?.result;
  const content = useMemo(() => (result ? getContentView(result) : null), [result]);
  const [channels, setChannels] = useState(["linkedin", "blog", "email"]);
  const [busyFmt, setBusyFmt] = useState(null);

  if (!run) {
    return <Shell><Empty title="No active run" desc="Start a research pass first." cta="Start Research" onClick={() => navigate("/research")} /></Shell>;
  }
  if (!content || (content.linkedin.length === 0 && content.blogs.length === 0 && content.emails.length === 0)) {
    return <Shell><Empty title="No content yet" desc="Run the pipeline through to Phase A in the Strategy view." cta="Open Strategy" onClick={() => navigate("/ideation")} /></Shell>;
  }

  const phaseBReady = run.status === "ready_for_phase_b";
  const phaseBRunning = run.status === "running" && run.stage === "content_phase_b";
  const phaseBPending = run.status === "awaiting_phase_b_approval";
  const phaseBComplete = run.status === "complete" || hasPhaseB(result);

  const startPhaseB = async () => {
    if (channels.length === 0) { toast.error("Select at least one channel"); return; }
    try {
      await mutate(() => api.startPhaseB(run.id, channels));
      toast.success("Phase B started", { description: `Generating: ${channels.join(", ")}` });
    } catch (e) { toast.error("Phase B failed", { description: e.message }); }
  };

  const exportFile = async (fmt) => {
    setBusyFmt(fmt);
    try {
      const rec = await api.exportFile(run.id, fmt);
      toast.success(`${rec.filename} ready`);
      window.open(api.fileUrl(run.id, rec.filename), "_blank");
    } catch (e) { toast.error("Export failed", { description: e.message }); }
    finally { setBusyFmt(null); }
  };

  const completedExports = (run.exports || []).reduce((m, e) => { m[e.format] = e; return m; }, {});

  return (
    <Shell>
      <div className="flex items-end justify-between mb-6">
        <div>
          <Badge variant="outline" className="border-brand-accent/40 text-brand-accent bg-brand-accent/10 mb-3 text-[10px]"><Sparkles className="w-3 h-3 mr-1" /> Content & exports</Badge>
          <h1 className="font-heading text-4xl font-semibold tracking-tight">Content Studio</h1>
          <p className="text-ink-muted mt-1.5">Inspect agent-generated drafts and produce the deliverables.</p>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="bg-ink-surface border border-ink-border p-1 h-auto">
          <TabsTrigger data-testid="tab-content" value="content" className="data-[state=active]:bg-ink-elevated data-[state=active]:text-ink-text text-ink-muted px-5">Content</TabsTrigger>
          <TabsTrigger data-testid="tab-phase-b" value="phase_b" className="data-[state=active]:bg-ink-elevated data-[state=active]:text-ink-text text-ink-muted px-5">Phase B</TabsTrigger>
          <TabsTrigger data-testid="tab-exports" value="exports" className="data-[state=active]:bg-ink-elevated data-[state=active]:text-ink-text text-ink-muted px-5">Exports</TabsTrigger>
        </TabsList>

        {/* CONTENT */}
        <TabsContent value="content" className="mt-6 space-y-8">
          {content.positioning_line && (
            <div className="rounded-xl border border-ink-border bg-ink-surface p-5">
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-1">Positioning line</div>
              <p className="font-heading text-lg text-ink-text leading-snug">{content.positioning_line}</p>
              {content.messaging_pillars?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {content.messaging_pillars.map((p) => <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-ink-elevated border border-ink-border">{p}</span>)}
                </div>
              )}
            </div>
          )}

          <ContentGroup title="LinkedIn posts" Icon={Linkedin} items={content.linkedin.map((p, i) => ({
            id: `li-${i}`,
            heading: `[${p.kind}] ${p.hook}`,
            body: p.body,
            footer: [p.engagement_question, p.cta, (p.hashtags || []).join(" ")].filter(Boolean).join(" · "),
          }))} />

          <ContentGroup title="Blog drafts" Icon={FileText} items={content.blogs.map((p, i) => ({
            id: `bl-${i}`,
            heading: `[${p.kind}] ${p.title}`,
            meta: `Keyword: ${p.target_keyword || "—"}${p.secondary_keywords?.length ? ` · Secondary: ${p.secondary_keywords.join(", ")}` : ""}`,
            body: p.body,
            footer: p.cta,
          }))} emptyText="Phase B not run yet — blog drafts will appear after Phase B." />

          <ContentGroup title="Email drafts" Icon={Mail} items={content.emails.map((p, i) => ({
            id: `em-${i}`,
            heading: `[${p.kind}] ${p.subject}`,
            meta: p.preview ? `Preview: ${p.preview}` : "",
            body: p.body,
            footer: p.cta,
          }))} emptyText="Phase B not run yet — email drafts will appear after Phase B." />
        </TabsContent>

        {/* PHASE B */}
        <TabsContent value="phase_b" className="mt-6 space-y-5">
          {!phaseBReady && !phaseBRunning && !phaseBPending && !phaseBComplete && (
            <div className="rounded-xl border border-dashed border-ink-border p-6 text-sm text-ink-muted">
              Phase B becomes available after the strategy AND Phase A content are both approved.
              <div className="mt-3"><Button variant="outline" onClick={() => navigate("/ideation")} className="border-ink-border text-ink-text hover:bg-ink-surface">Open Strategy review <ArrowRight className="ml-2 w-4 h-4" /></Button></div>
            </div>
          )}

          {(phaseBReady || phaseBPending || phaseBComplete) && (
            <div className="rounded-xl border border-ink-border bg-ink-surface p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-heading text-lg font-semibold">Phase B — full content suite</h3>
                {phaseBComplete && <Badge className="ml-auto bg-brand-success/15 text-brand-success border border-brand-success/40">Generated</Badge>}
                {phaseBPending && <Badge className="ml-auto bg-brand-warning/15 text-brand-warning border border-brand-warning/40">Awaiting approval</Badge>}
              </div>
              <p className="text-sm text-ink-muted mb-4">Select the channels you want the content agent to fully produce.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {VALID_CHANNELS.map((c) => {
                  const on = channels.includes(c.key);
                  return (
                    <button key={c.key} onClick={() => setChannels(on ? channels.filter((k) => k !== c.key) : [...channels, c.key])} data-testid={`phase-b-channel-${c.key}`} className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${on ? "border-brand-primary/60 bg-brand-primary/15 text-brand-primary" : "border-ink-border bg-ink-elevated text-ink-muted hover:text-ink-text"}`}>
                      {c.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={startPhaseB} disabled={phaseBRunning || channels.length === 0} data-testid="start-phase-b" className="bg-brand-primary hover:bg-[#9333EA] text-white">
                  {phaseBRunning ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Running…</> : <><Sparkles className="w-4 h-4 mr-1.5" /> {phaseBComplete ? "Re-run Phase B" : "Run Phase B"}</>}
                </Button>
                {phaseBPending && (
                  <>
                    <Button variant="outline" onClick={async () => { try { await mutate(() => api.regeneratePhaseB(run.id)); toast.success("Regenerating Phase B…"); } catch (e) { toast.error(e.message); } }} data-testid="regenerate-phase-b" className="border-ink-border text-ink-text hover:bg-ink-surface">
                      <RefreshCw className="w-4 h-4 mr-1.5" /> Regenerate
                    </Button>
                    <Button onClick={async () => { try { await mutate(() => api.approvePhaseB(run.id)); toast.success("Phase B approved"); } catch (e) { toast.error(e.message); } }} data-testid="approve-phase-b" className="bg-brand-success hover:bg-[#0EA371] text-white">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Phase B
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {phaseBRunning && <Banner kind="running" title="Phase B running…" desc="Generating blogs / SEO / emails based on your selection." />}
          {run.status === "failed" && <Banner kind="failed" title="Pipeline failed" desc={run.error} />}
        </TabsContent>

        {/* EXPORTS */}
        <TabsContent value="exports" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FORMATS.map((f) => {
              const existing = completedExports[f.key];
              return (
                <div key={f.key} className="rounded-xl border border-ink-border bg-ink-surface p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${f.color}20`, color: f.color, border: `1px solid ${f.color}40` }}>
                    <f.Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink-text">{f.label}</div>
                    <div className="text-xs text-ink-muted">{existing ? `${Math.round((existing.size || 0) / 1024)} KB · generated` : "Not generated yet"}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {existing && (
                      <a href={api.fileUrl(run.id, existing.filename)} target="_blank" rel="noreferrer" className="text-xs text-brand-secondary hover:text-brand-primary flex items-center gap-1" data-testid={`open-${f.key}`}>
                        <ExternalLink className="w-3 h-3" /> open
                      </a>
                    )}
                    <Button data-testid={`export-${f.key}`} onClick={() => exportFile(f.key)} disabled={busyFmt === f.key} className="bg-brand-primary hover:bg-[#9333EA] text-white h-9">
                      {busyFmt === f.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-1.5" /> {existing ? "Regenerate" : "Generate"}</>}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-ink-muted">All exports are generated server-side by the agent&apos;s exporters (export_pdf · export_docx · export_pptx · export_strategy).</div>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-ink-bg">
      <TopNav />
      <main className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8">
        <div className="flex items-center gap-2 text-xs text-ink-muted mb-5">
          <Link to="/" className="hover:text-ink-text transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/command-center" className="hover:text-ink-text transition-colors">Command Center</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-ink-text">Studio</span>
        </div>
        {children}
      </main>
    </div>
  );
}

function Empty({ title, desc, cta, onClick }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-border bg-ink-surface/30 p-10 text-center" data-testid="studio-empty">
      <Sparkles className="w-8 h-8 mx-auto mb-3 text-brand-accent" />
      <div className="font-heading text-lg text-ink-text">{title}</div>
      <p className="text-sm text-ink-muted mt-1 mb-4">{desc}</p>
      <Button onClick={onClick} className="bg-brand-primary hover:bg-[#9333EA] text-white">{cta} <ArrowRight className="ml-2 w-4 h-4" /></Button>
    </div>
  );
}

function ContentGroup({ title, Icon, items, emptyText }) {
  if (!items || items.length === 0) {
    if (emptyText) return (
      <div>
        <div className="flex items-center gap-2 mb-3"><Icon className="w-4 h-4 text-brand-primary" /><h3 className="font-heading text-lg font-semibold">{title}</h3></div>
        <div className="rounded-xl border border-dashed border-ink-border p-5 text-sm text-ink-muted text-center">{emptyText}</div>
      </div>
    );
    return null;
  }
  return (
    <div>
      <div className="flex items-center gap-2 mb-3"><Icon className="w-4 h-4 text-brand-primary" /><h3 className="font-heading text-lg font-semibold">{title}</h3><span className="text-xs text-ink-muted">({items.length})</span></div>
      <div className="space-y-3">
        {items.map((it) => (
          <motion.div key={it.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-ink-border bg-ink-surface overflow-hidden">
            <div className="px-5 py-3 border-b border-ink-border bg-ink-bg/30 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-sm text-ink-text truncate">{it.heading}</div>
                {it.meta && <div className="text-[11px] text-ink-muted truncate">{it.meta}</div>}
              </div>
              <Button onClick={() => { navigator.clipboard?.writeText(it.body || ""); toast.success("Copied to clipboard"); }} data-testid={`copy-${it.id}`} variant="ghost" size="sm" className="text-ink-muted hover:text-ink-text hover:bg-ink-elevated h-8 shrink-0">
                <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
              </Button>
            </div>
            <div className="px-5 py-4">
              <pre className="text-sm text-ink-text/90 leading-relaxed whitespace-pre-wrap font-sans">{it.body}</pre>
              {it.footer && <div className="mt-3 pt-3 border-t border-ink-border text-xs text-ink-muted">{it.footer}</div>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Banner({ kind, title, desc }) {
  const Icon = kind === "running" ? Loader2 : AlertTriangle;
  const tone = kind === "running" ? "border-brand-accent/40 bg-brand-accent/5 text-brand-accent" : "border-red-400/40 bg-red-400/5 text-red-400";
  return (
    <div className={`rounded-xl border p-5 ${tone}`} data-testid={`stage-${kind}`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${kind === "running" ? "animate-spin" : ""}`} />
        <div><div className="font-medium text-ink-text">{title}</div><div className="text-xs text-ink-muted">{desc}</div></div>
      </div>
    </div>
  );
}
