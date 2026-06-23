import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Loader2, RefreshCw, Sparkles, ChevronRight, ArrowRight, Target,
  Lightbulb, Edit3, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import TopNav from "@/components/TopNav";
import ProgressTracker from "@/components/ProgressTracker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRun } from "@/lib/RunContext";
import { api } from "@/lib/api";

const MOTION_LABEL = {
  "product-led":   "Product-led",
  "sales-led":     "Sales-led",
  "community-led": "Community-led",
  "partner-led":   "Partner-led",
  "content-led":   "Content-led",
};

/**
 * StrategyDirection gate.
 * Shown between approving the research and running the strategy agent.
 * The user either picks one of 4 AI-suggested directions (derived strictly
 * from the approved research) OR enters a custom GTM objective.
 */
export default function StrategyDirection() {
  const navigate = useNavigate();
  const { run, mutate } = useRun();
  const [directions, setDirections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(-1);
  const [custom, setCustom] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [starting, setStarting] = useState(false);

  const status = run?.status;
  const stage = run?.stage;
  const runId = run?.id;

  useEffect(() => {
    // Fetch (or regenerate) on entering the page.
    if (!runId) return;
    if (status !== "awaiting_strategy_direction") return;
    if (run?.strategy_directions?.length) {
      setDirections(run.strategy_directions);
      return;
    }
    setLoading(true);
    setError("");
    api.getStrategySuggestions(runId)
      .then((d) => setDirections(d.directions || []))
      .catch((e) => setError(e.message || "Failed to load suggestions"))
      .finally(() => setLoading(false));
  }, [runId, status, run?.strategy_directions]);

  // Wrong stage handling.
  if (!run) {
    return <Shell><Empty title="No active run" desc="Start a research run first." cta="Start Research" onClick={() => navigate("/research")} /></Shell>;
  }
  if (status === "awaiting_research_approval" || (status === "running" && stage === "research")) {
    return <Shell><Empty title="Approve the research first" desc="Pick a direction once the research is approved." cta="Review research" onClick={() => navigate("/research")} /></Shell>;
  }
  if (status === "running" && stage === "strategy") {
    return <Shell><Banner kind="running" title="Strategy agent running…" desc="Composing positioning, ICP, channels and roadmap." /><div className="mt-4"><Button onClick={() => navigate("/ideation")} className="bg-move-ink hover:bg-move-ink-hover text-white">Open Strategy <ArrowRight className="ml-2 w-4 h-4" /></Button></div></Shell>;
  }
  if (status === "awaiting_strategy_approval" || status === "awaiting_content_approval" || status === "complete") {
    // Direction already chosen — just send the user to the Strategy page.
    return <Shell><Banner kind="done" title="Direction already chosen" desc="The strategy has been generated." />
      <Button onClick={() => navigate("/ideation")} className="mt-4 bg-move-ink hover:bg-move-ink-hover text-white">Open Strategy <ArrowRight className="ml-2 w-4 h-4" /></Button>
    </Shell>;
  }

  const refresh = async () => {
    setLoading(true); setError("");
    try {
      const d = await api.refreshStrategySuggestions(runId);
      setDirections(d.directions || []);
      setSelected(-1);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const onStart = async () => {
    let directionText = "";
    let customFlag = false;
    if (showCustom) {
      if (!custom.trim()) { toast.error("Please describe your GTM objective"); return; }
      directionText = custom.trim();
      customFlag = true;
    } else {
      if (selected < 0) { toast.error("Pick a direction or write your own"); return; }
      const d = directions[selected];
      // Send a compact, evidence-rich brief so the strategy agent has the
      // user's framing as well as the AI title/summary.
      directionText = [d.title, d.summary, `Target: ${d.target_segment}`, `Motion: ${MOTION_LABEL[d.primary_motion] || d.primary_motion}`,
                       d.evidence?.length ? `Evidence: ${d.evidence.join(" | ")}` : ""].filter(Boolean).join("\n");
    }
    setStarting(true);
    try {
      await mutate(() => api.startStrategy(runId, directionText, customFlag));
      toast.success("Strategy launched", { description: "Generating positioning, ICP and roadmap…" });
      navigate("/ideation");
    } catch (e) { toast.error(e.message); }
    finally { setStarting(false); }
  };

  return (
    <Shell>
      <header className="mb-10">
        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-move-grad-2/40 bg-move-grad-2-tint text-move-grad-2 mb-3">
          <Target className="w-3 h-3" /> Strategy direction
        </span>
        <h1 className="font-heading text-5xl md:text-6xl font-medium tracking-tight text-move-ink" style={{ fontWeight: 500 }}>Choose your direction</h1>
        <p className="text-move-body mt-3 text-lg max-w-2xl">
          Pick one of these AI-suggested directions, each derived strictly from your research, or describe your own GTM objective. The strategy will be generated only after you choose.
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-[12px] border border-move-error/40 bg-move-error-bg p-4 text-sm text-move-error flex items-center justify-between gap-3" data-testid="suggestions-error">
          <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {error}</div>
          <Button variant="outline" onClick={refresh} className="border-move-error/40 text-move-error hover:bg-move-error-bg/60 h-8" data-testid="suggestions-retry">
            <RefreshCw className="w-3 h-3 mr-1.5" /> Retry
          </Button>
        </div>
      )}

      {loading && directions.length === 0 && (
        <div className="rounded-[16px] border border-dashed border-move-border bg-move-bg-subtle p-12 text-center text-move-body flex items-center justify-center gap-2" data-testid="suggestions-loading">
          <Loader2 className="w-4 h-4 animate-spin" /> Generating directions grounded in your research…
        </div>
      )}

      {!loading && directions.length > 0 && !showCustom && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8" data-testid="direction-cards">
            {directions.map((d, i) => (
              <DirectionCard
                key={i}
                index={i}
                direction={d}
                selected={selected === i}
                onClick={() => setSelected(i)}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setShowCustom(true)} data-testid="direction-write-own"
                    className="border-move-border-ghost text-move-ink hover:bg-move-bg-subtle h-11 rounded-[10px] font-medium">
              <Edit3 className="w-4 h-4 mr-2" /> Describe my own GTM objective
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={refresh} data-testid="direction-refresh"
                      className="text-move-muted hover:text-move-ink hover:bg-move-bg-subtle h-11 rounded-[10px]">
                <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh suggestions
              </Button>
              <Button onClick={onStart} disabled={selected < 0 || starting} data-testid="direction-start"
                      className="bg-move-success hover:opacity-90 text-white h-11 rounded-[10px] font-medium shadow-lg">
                {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Generate strategy <ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>
            </div>
          </div>
        </>
      )}

      {showCustom && (
        <div className="rounded-[16px] border border-move-border bg-move-surface p-6" data-testid="direction-custom">
          <div className="flex items-center gap-2 mb-3">
            <Edit3 className="w-4 h-4 text-move-grad-2" />
            <h2 className="text-lg font-medium text-move-ink" style={{ fontWeight: 500 }}>Describe your GTM objective</h2>
          </div>
          <p className="text-sm text-move-body mb-4">
            What is the product, market motion, or strategic outcome you want to focus on? The strategy agent will use this together with the approved research.
          </p>
          <Textarea
            value={custom} onChange={(e) => setCustom(e.target.value)}
            rows={6}
            placeholder="e.g. Win mid-market platform engineering teams in EMEA with a product-led motion that converts via a free CLI and an opinionated onboarding."
            className="bg-move-bg border-move-border text-move-ink"
            data-testid="direction-custom-input"
          />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
            <Button variant="ghost" onClick={() => setShowCustom(false)}
                    className="text-move-muted hover:text-move-ink hover:bg-move-bg-subtle h-10 rounded-[10px]">
              ← Back to suggestions
            </Button>
            <Button onClick={onStart} disabled={!custom.trim() || starting} data-testid="direction-start-custom"
                    className="bg-move-success hover:opacity-90 text-white h-11 rounded-[10px] font-medium shadow-lg">
              {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Generate strategy <ArrowRight className="w-4 h-4 ml-2" /></>}
            </Button>
          </div>
        </div>
      )}
    </Shell>
  );
}

// ── building blocks ─────────────────────────────────────────────────────────

function DirectionCard({ direction, selected, onClick, index }) {
  const motion = MOTION_LABEL[direction.primary_motion] || direction.primary_motion;
  return (
    <button
      onClick={onClick}
      data-testid={`direction-card-${index}`}
      aria-pressed={selected}
      className={`text-left rounded-[16px] border bg-move-surface p-6 transition-all relative ${
        selected
          ? "border-move-grad-2 ring-2 ring-move-grad-2/30 shadow-md"
          : "border-move-border hover:border-move-grad-2/60 hover:shadow-sm"
      }`}
    >
      {selected && (
        <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-move-grad-2 text-white flex items-center justify-center text-xs font-medium" style={{ fontWeight: 500 }}>✓</span>
      )}
      <div className="flex items-start gap-3 mb-3">
        <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-move-grad-1-tint to-move-grad-3-tint flex items-center justify-center shrink-0">
          <Lightbulb className="w-4 h-4 text-move-grad-2" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {motion && <span className="text-[11px] px-2 py-0.5 rounded-full bg-move-bg-subtle border border-move-border text-move-muted">{motion}</span>}
          </div>
          <h3 className="text-base font-medium text-move-ink leading-tight" style={{ fontWeight: 500 }}>{direction.title}</h3>
        </div>
      </div>
      <p className="text-sm text-move-body leading-relaxed">{direction.summary}</p>
      {direction.target_segment && (
        <div className="text-xs text-move-muted mt-3">
          <span className="font-medium" style={{ fontWeight: 500 }}>Target:</span> {direction.target_segment}
        </div>
      )}
      {Array.isArray(direction.evidence) && direction.evidence.length > 0 && (
        <div className="mt-4 pt-3 border-t border-move-border">
          <div className="text-[10px] uppercase tracking-wider text-move-muted mb-1.5 font-medium" style={{ fontWeight: 500 }}>Grounded in research</div>
          <ul className="space-y-1">
            {direction.evidence.slice(0, 3).map((e, j) => (
              <li key={j} className="text-xs text-move-body leading-relaxed flex gap-1.5">
                <span className="text-move-grad-2 shrink-0">•</span><span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </button>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-move-bg pb-32 lg:pr-[420px]">
      <TopNav />
      <ProgressTracker currentStage="strategy" completedStages={["research"]} />
      <main className="max-w-[1200px] mx-auto px-6 lg:px-10 py-10">
        <div className="flex items-center gap-2 text-sm text-move-muted mb-6">
          <Link to="/" className="hover:text-move-ink transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/research" className="hover:text-move-ink transition-colors">Research</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-move-ink">Strategy direction</span>
        </div>
        {children}
      </main>
    </div>
  );
}

function Empty({ title, desc, cta, onClick }) {
  return (
    <div className="rounded-[16px] border border-dashed border-move-border bg-move-bg-subtle p-12 text-center">
      <Sparkles className="w-10 h-10 mx-auto mb-3 text-move-grad-2" />
      <div className="text-xl font-medium text-move-ink" style={{ fontWeight: 500 }}>{title}</div>
      <p className="text-base text-move-body mt-2 mb-5">{desc}</p>
      <Button onClick={onClick} className="bg-move-ink hover:bg-move-ink-hover text-white rounded-[12px] font-medium">{cta} <ArrowRight className="ml-2 w-4 h-4" /></Button>
    </div>
  );
}

function Banner({ kind, title, desc }) {
  const Icon = kind === "running" ? Loader2 : Sparkles;
  const tone = kind === "running"
    ? "border-move-grad-2/40 bg-move-grad-2-tint text-move-grad-2"
    : "border-move-success/40 bg-move-success-bg text-move-success";
  return (
    <div className={`rounded-[16px] border p-5 ${tone}`}>
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
