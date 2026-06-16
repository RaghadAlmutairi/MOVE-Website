import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Lightbulb, ChevronRight, TrendingUp, Zap, Check } from "lucide-react";
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { GTM_RECOMMENDATIONS } from "@/lib/mockData";

export default function StrategyIdeation() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("r1");
  const [custom, setCustom] = useState("");

  const confidenceColor = (v) =>
    v >= 90 ? "from-brand-success to-emerald-400" :
    v >= 85 ? "from-brand-primary to-brand-accent" :
    v >= 80 ? "from-brand-secondary to-brand-primary" :
    "from-brand-warning to-orange-400";

  return (
    <div className="min-h-screen bg-ink-bg">
      <TopNav />
      <main className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8">
        <div className="flex items-center gap-2 text-xs text-ink-muted mb-6">
          <Link to="/" className="hover:text-ink-text transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/research" className="hover:text-ink-text transition-colors">Research</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-ink-text">Strategy Builder</span>
        </div>

        <div className="flex items-end justify-between mb-2">
          <div>
            <Badge variant="outline" className="border-brand-accent/40 text-brand-accent bg-brand-accent/10 mb-3">
              <Sparkles className="w-3 h-3 mr-1" /> AI Strategy Builder
            </Badge>
            <h1 className="font-heading text-4xl font-semibold tracking-tight">Strategy Builder</h1>
            <p className="text-ink-muted mt-1.5">Pick an AI recommendation, or describe your own initiative.</p>
          </div>
        </div>

        {/* Section A — Recommendations */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading text-xl font-semibold">AI Recommended GTM Opportunities</h2>
              <p className="text-xs text-ink-muted mt-1">Generated from research signals · refreshed 2 min ago</p>
            </div>
            <button className="text-xs text-brand-secondary hover:text-brand-primary transition-colors flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> Regenerate
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {GTM_RECOMMENDATIONS.map((r, i) => (
              <motion.button
                key={r.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                onClick={() => setSelected(r.id)}
                data-testid={`recommendation-${r.id}`}
                className={`group text-left rounded-xl border p-6 bg-ink-surface transition-all relative overflow-hidden ${
                  selected === r.id
                    ? "border-brand-primary/60 glow-primary"
                    : "border-ink-border hover:border-brand-primary/40"
                }`}
              >
                {selected === r.id && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="flex items-start justify-between mb-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">Strategy {String(i + 1).padStart(2, "0")}</div>
                </div>

                <h3 className="font-heading text-xl font-semibold tracking-tight text-ink-text leading-snug">{r.title}</h3>
                <p className="text-sm text-ink-muted mt-2 leading-relaxed">{r.description}</p>

                <div className="mt-5 flex items-center gap-4">
                  <div className="relative">
                    <svg className="w-16 h-16 -rotate-90">
                      <circle cx="32" cy="32" r="26" stroke="#2A1F3D" strokeWidth="5" fill="none" />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        stroke="url(#grad-conf)"
                        strokeWidth="5"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(r.confidence / 100) * 163.4} 163.4`}
                      />
                      <defs>
                        <linearGradient id="grad-conf" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#A855F7" />
                          <stop offset="100%" stopColor="#E879F9" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-heading text-lg font-semibold text-ink-text">{r.confidence}</span>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <Stat label="Impact" value={r.impact} accent="primary" />
                    <Stat label="Est. ROI" value={r.roi} accent="success" />
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-ink-border">
                  <div className="text-[10px] uppercase tracking-wider text-brand-secondary mb-1.5 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" /> Reasoning
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">{r.reasoning}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Custom strategy */}
        <section className="mt-12">
          <div className="rounded-2xl border border-ink-border bg-gradient-to-br from-ink-surface to-ink-bg p-7">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-brand-accent to-brand-secondary flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="font-heading text-xl font-semibold">Or design a custom strategy</h2>
            </div>
            <p className="text-sm text-ink-muted mb-4">Describe an angle, an audience, or a hypothesis. The copilot will architect the rest.</p>
            <Textarea
              data-testid="custom-strategy-input"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="e.g., 'A founder-led content motion focused on RevOps practitioners who follow LinkedIn thought-leaders...'"
              rows={4}
              className="bg-ink-bg border-ink-border text-ink-text placeholder:text-ink-muted/60 focus-visible:ring-brand-primary/40"
            />
            <div className="flex items-center justify-between mt-4">
              <div className="text-xs text-ink-muted flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" />
                Pro tip: include a constraint (budget, timeframe, channel) for sharper outputs.
              </div>
              <Button
                data-testid="generate-custom-strategy"
                onClick={() => navigate("/command-center")}
                className="bg-brand-accent hover:bg-[#7C3AED] text-white shadow-lg shadow-brand-accent/30"
              >
                <Sparkles className="w-4 h-4 mr-1.5" /> Generate Strategy
              </Button>
            </div>
          </div>
        </section>

        {/* Bottom action */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-xl border border-ink-border bg-ink-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <div className="font-medium text-ink-text">Selected: {GTM_RECOMMENDATIONS.find(r => r.id === selected)?.title}</div>
              <div className="text-xs text-ink-muted">We&apos;ll build the full command center from this foundation.</div>
            </div>
          </div>
          <Button
            onClick={() => navigate("/command-center")}
            data-testid="continue-to-command-center"
            size="lg"
            className="bg-brand-primary hover:bg-[#9333EA] text-white shadow-xl shadow-brand-primary/30"
          >
            Build Command Center <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, accent }) {
  const accentMap = {
    primary: "text-brand-primary",
    success: "text-brand-success",
    accent: "text-brand-accent",
  };
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-muted">{label}</div>
      <div className={`text-sm font-medium mt-0.5 ${accentMap[accent] || "text-ink-text"}`}>{value}</div>
    </div>
  );
}
