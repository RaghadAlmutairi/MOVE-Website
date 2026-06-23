import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Download, FileText, FileSpreadsheet, Presentation, Package,
  Loader2, ExternalLink, ChevronRight, CheckCircle2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import TopNav from "@/components/TopNav";
import ProgressTracker from "@/components/ProgressTracker";
import StageNav from "@/components/StageNav";
import { Button } from "@/components/ui/button";
import { useRun } from "@/lib/RunContext";
import { api } from "@/lib/api";
import { hasStrategy } from "@/lib/transforms";

const PDF_DOCX_SCOPES = [
  { scope: "research", label: "Research only",       desc: "Market analysis, SWOT, competitors, personas." },
  { scope: "strategy", label: "Strategy only",       desc: "GTM playbook: positioning, ICP, motion, roadmap." },
  { scope: "combined", label: "Research + Strategy", desc: "Full briefing: research insights with the GTM plan." },
];

export default function ExportPage() {
  const navigate = useNavigate();
  const { run, mutate } = useRun();
  const [busy, setBusy] = useState(null);
  const [zipBusy, setZipBusy] = useState(false);

  if (!run) {
    return (
      <Shell>
        <Empty title="No active run" desc="Start a research run first; exports unlock as you complete each stage." cta="Start Research" onClick={() => navigate("/research")} />
      </Shell>
    );
  }

  const result = run.result;
  const strategyReady = hasStrategy(result);

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

  const findExport = (format, scope = null) => {
    const list = (run.exports || []).filter((e) => e.format === format && (scope ? e.scope === scope : !e.scope));
    return list.length ? list[list.length - 1] : null;
  };

  return (
    <Shell>
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-move-grad-3/40 bg-move-grad-3-tint text-move-grad-3 mb-3">
            <Download className="w-3 h-3" /> Export
          </span>
          <h1 className="font-heading text-5xl font-medium tracking-tight text-move-ink" style={{ fontWeight: 500 }}>Download your GTM kit</h1>
          <p className="text-move-body mt-2 text-lg max-w-2xl">Pick exactly what you need — research, strategy, or both — in PDF, Word, or PowerPoint. Or grab everything as a single ZIP.</p>
        </div>
        {run.status === "complete" && (
          <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-move-success-bg text-move-success border border-move-success/40">
            <CheckCircle2 className="w-3.5 h-3.5" /> Run complete
          </span>
        )}
      </header>

      {!strategyReady && (
        <div className="mb-6 rounded-[16px] border border-move-warning/40 bg-move-warning-bg p-4 text-sm text-move-ink flex items-start gap-3" data-testid="strategy-not-ready">
          <AlertCircle className="w-4 h-4 text-move-warning shrink-0 mt-0.5" />
          <div>
            <div className="font-medium">Strategy not approved yet</div>
            <p className="text-move-body mt-0.5">Strategy and combined exports unlock once you approve the strategy stage. Research-only PDF and DOCX are available now.</p>
          </div>
        </div>
      )}

      {/* Big call-to-action: download everything */}
      <div className="rounded-[20px] border border-move-border bg-gradient-to-br from-move-grad-1-tint via-move-grad-2-tint to-move-grad-3-tint p-6 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-move-ink/90 text-white flex items-center justify-center shrink-0">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <div className="text-lg font-medium text-move-ink" style={{ fontWeight: 500 }}>The full GTM kit (.zip)</div>
            <p className="text-sm text-move-body">{strategyReady ? "All 3 PDFs, 3 Word docs, and the strategy deck — bundled in one zip." : "Bundles every artefact that's currently available."}</p>
          </div>
        </div>
        <Button onClick={exportZip} disabled={zipBusy} data-testid="export-zip" className="bg-move-ink hover:bg-move-ink-hover text-white h-12 px-6 rounded-[12px] font-medium">
          {zipBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-1.5" /> Download .zip</>}
        </Button>
      </div>

      <Section Icon={FileText} title="PDF reports" accent="#B5544A">
        {PDF_DOCX_SCOPES.map((s) => (
          <ExportCard
            key={`pdf-${s.scope}`}
            label={s.label}
            desc={s.desc}
            disabled={s.scope !== "research" && !strategyReady}
            onClick={() => exportFile("pdf", s.scope)}
            existing={findExport("pdf", s.scope)}
            runId={run.id}
            busy={busy === `pdf-${s.scope}`}
            testId={`export-pdf-${s.scope}`}
            Icon={FileText} accent="#B5544A"
          />
        ))}
      </Section>

      <Section Icon={FileSpreadsheet} title="Word documents" accent="#3B6FA8">
        {PDF_DOCX_SCOPES.map((s) => (
          <ExportCard
            key={`docx-${s.scope}`}
            label={s.label}
            desc={s.desc}
            disabled={s.scope !== "research" && !strategyReady}
            onClick={() => exportFile("docx", s.scope)}
            existing={findExport("docx", s.scope)}
            runId={run.id}
            busy={busy === `docx-${s.scope}`}
            testId={`export-docx-${s.scope}`}
            Icon={FileSpreadsheet} accent="#3B6FA8"
          />
        ))}
      </Section>

      <Section Icon={Presentation} title="Strategy deck" accent="#C08B3E">
        <ExportCard
          label="Strategy deck (.pptx)"
          desc="Boardroom-ready slide deck for the GTM strategy."
          disabled={!strategyReady}
          onClick={() => exportFile("pptx")}
          existing={findExport("pptx")}
          runId={run.id}
          busy={busy === "pptx"}
          testId="export-pptx"
          Icon={Presentation} accent="#C08B3E"
          single
        />
      </Section>

      <StageNav stage="export" nextLabel="Return to Projects" onNext={() => navigate("/projects")} />
    </Shell>
  );
}

// ── Building blocks ──────────────────────────────────────────────────────────

function Section({ Icon, title, accent, children }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${accent}1A`, color: accent, border: `1px solid ${accent}40` }}>
          <Icon className="w-3.5 h-3.5" />
        </span>
        <h2 className="text-xl font-medium text-move-ink" style={{ fontWeight: 500 }}>{title}</h2>
        <div className="ml-3 h-px flex-1 bg-move-border" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}

function ExportCard({ label, desc, disabled, onClick, existing, runId, busy, testId, Icon, accent, single }) {
  return (
    <div className={`rounded-[16px] border bg-move-surface p-5 flex flex-col gap-3 ${disabled ? "opacity-60 border-dashed border-move-border" : "border-move-border"} ${single ? "md:col-span-3" : ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-base font-medium text-move-ink" style={{ fontWeight: 500 }}>{label}</div>
          <div className="text-sm text-move-body mt-0.5">{desc}</div>
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${accent}1A`, color: accent, border: `1px solid ${accent}40` }}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-auto">
        <Button onClick={onClick} disabled={disabled || busy} data-testid={testId} className="flex-1 bg-move-ink hover:bg-move-ink-hover text-white h-10 rounded-[10px] font-medium disabled:bg-move-bg-subtle disabled:text-move-muted">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-1.5" /> {existing ? "Regenerate" : "Generate"}</>}
        </Button>
        {existing && (
          <a href={api.fileUrl(runId, existing.filename)} target="_blank" rel="noreferrer" data-testid={`open-${testId}`} className="text-sm text-move-grad-3 hover:text-move-ink flex items-center gap-1 px-2">
            <ExternalLink className="w-4 h-4" /> open
          </a>
        )}
      </div>
      {existing && <div className="text-xs text-move-muted">Last build: {Math.round((existing.size || 0) / 1024)} KB</div>}
      {disabled && <div className="text-xs text-move-warning">Approve the strategy first.</div>}
    </div>
  );
}

function Shell({ children }) {
  const { run } = useRun();
  const status = run?.status;
  const completed = ["research", "strategy", "content"].filter((k) => {
    if (k === "research") return status && status !== "running" && status !== "awaiting_research_approval" && status !== "failed";
    if (k === "strategy") return status === "awaiting_content_approval" || status === "complete";
    if (k === "content")  return status === "complete";
    return false;
  });
  return (
    <div className="min-h-screen bg-move-bg pb-32 lg:pr-[420px]">
      <TopNav />
      <ProgressTracker currentStage="export" completedStages={completed} />
      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        <Crumbs />
        {children}
      </main>
    </div>
  );
}

function Crumbs() {
  return (
    <div className="flex items-center gap-2 text-sm text-move-muted mb-6">
      <Link to="/" className="hover:text-move-ink transition-colors">Home</Link>
      <ChevronRight className="w-3 h-3" />
      <Link to="/projects" className="hover:text-move-ink transition-colors">Projects</Link>
      <ChevronRight className="w-3 h-3" />
      <Link to="/research" className="hover:text-move-ink transition-colors">Research</Link>
      <ChevronRight className="w-3 h-3" />
      <Link to="/ideation" className="hover:text-move-ink transition-colors">Strategy</Link>
      <ChevronRight className="w-3 h-3" />
      <Link to="/studio" className="hover:text-move-ink transition-colors">Content</Link>
      <ChevronRight className="w-3 h-3" />
      <span className="text-move-ink">Export</span>
    </div>
  );
}

function Empty({ title, desc, cta, onClick }) {
  return (
    <div className="rounded-[16px] border border-dashed border-move-border bg-move-bg-subtle p-12 text-center" data-testid="export-empty">
      <Package className="w-10 h-10 mx-auto mb-3 text-move-grad-3" />
      <div className="text-xl font-medium text-move-ink" style={{ fontWeight: 500 }}>{title}</div>
      <p className="text-base text-move-body mt-2 mb-5 max-w-md mx-auto">{desc}</p>
      <Button onClick={onClick} className="bg-move-ink hover:bg-move-ink-hover text-white rounded-[12px] font-medium">{cta}</Button>
    </div>
  );
}
