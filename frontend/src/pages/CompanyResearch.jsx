import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe,
  Building2,
  Loader2,
  ArrowRight,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from "recharts";
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { COMPANY_PROFILE, KPIS, COMPETITORS, TREND_DATA, MARKET_SIGNALS } from "@/lib/mockData";

export default function CompanyResearch() {
  const navigate = useNavigate();
  const [name, setName] = useState("Northwind AI");
  const [url, setUrl] = useState("northwind.ai");
  const [loading, setLoading] = useState(false);
  const [hasResult, setHasResult] = useState(true);

  const analyze = () => {
    setLoading(true);
    setHasResult(false);
    setTimeout(() => {
      setLoading(false);
      setHasResult(true);
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-ink-bg">
      <TopNav />
      <main className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-ink-muted mb-6">
          <Link to="/" className="hover:text-ink-text transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-ink-text">Company Research</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-4xl font-semibold tracking-tight">Company Research</h1>
            <p className="text-ink-muted mt-1">Drop a URL. We map the market in seconds.</p>
          </div>
          <Badge variant="outline" className="border-brand-success/40 text-brand-success bg-brand-success/10 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-success mr-2 animate-pulse" /> Engine online
          </Badge>
        </div>

        {/* Input panel */}
        <div className="rounded-xl border border-ink-border bg-ink-surface p-5 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-5">
              <label className="text-xs uppercase tracking-wider text-ink-muted mb-1.5 block">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-ink-muted" />
                <Input
                  data-testid="research-company-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 bg-ink-bg border-ink-border text-ink-text"
                />
              </div>
            </div>
            <div className="md:col-span-5">
              <label className="text-xs uppercase tracking-wider text-ink-muted mb-1.5 block">Website URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-ink-muted" />
                <Input
                  data-testid="research-website"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-9 bg-ink-bg border-ink-border text-ink-text"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <Button
                onClick={analyze}
                disabled={loading}
                data-testid="research-analyze-btn"
                className="w-full bg-brand-primary hover:bg-[#9333EA] text-white shadow-lg shadow-brand-primary/30"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-1.5" />Analyze</>}
              </Button>
            </div>
          </div>
        </div>

        {hasResult && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {KPIS.map((k, i) => (
                <motion.div
                  key={k.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  data-testid={`kpi-${k.label.toLowerCase().replace(/ /g, "-")}`}
                  className="rounded-xl border border-ink-border bg-ink-surface p-5 hover:border-brand-primary/40 transition-colors"
                >
                  <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">{k.label}</div>
                  <div className="font-heading text-4xl font-semibold mt-1 text-ink-text">{k.value}</div>
                  <div className="mt-3 h-1.5 rounded-full bg-ink-elevated overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent"
                      style={{ width: `${k.value}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-ink-muted">{k.delta}</div>
                </motion.div>
              ))}
            </div>

            {/* 3-panel layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-10">
              {/* LEFT: Company Overview */}
              <div className="lg:col-span-4 space-y-5">
                <PanelTitle>Company Overview</PanelTitle>
                <div className="rounded-xl border border-ink-border bg-ink-surface p-5">
                  <h3 className="font-heading text-lg font-semibold mb-1">{COMPANY_PROFILE.name}</h3>
                  <p className="text-xs text-ink-muted mb-3">{COMPANY_PROFILE.tagline}</p>
                  <p className="text-sm text-ink-text/90 leading-relaxed">{COMPANY_PROFILE.overview}</p>
                </div>

                <div className="rounded-xl border border-ink-border bg-ink-surface p-5">
                  <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">Products & Services</div>
                  <div className="space-y-2">
                    {COMPANY_PROFILE.products.map((p) => (
                      <div key={p.name} className="flex items-start gap-3 p-2 rounded-md hover:bg-ink-elevated transition-colors">
                        <div className="w-7 h-7 rounded-md bg-brand-primary/15 text-brand-primary flex items-center justify-center font-heading text-xs font-semibold mt-0.5">
                          {p.name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-ink-text">{p.name}</div>
                          <div className="text-xs text-ink-muted">{p.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-ink-border bg-ink-surface p-5">
                  <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">Value Proposition</div>
                  <ul className="space-y-2.5">
                    {COMPANY_PROFILE.valueProps.map((v) => (
                      <li key={v} className="flex items-start gap-2 text-sm text-ink-text/90">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary mt-1.5 shrink-0" />
                        {v}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-ink-border bg-ink-surface p-5">
                  <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">Target Audience</div>
                  <div className="flex flex-wrap gap-1.5">
                    {COMPANY_PROFILE.audience.map((a) => (
                      <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-ink-elevated border border-ink-border text-ink-text/90">{a}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* CENTER: Competitors */}
              <div className="lg:col-span-5 space-y-5">
                <PanelTitle>Competitor Discovery</PanelTitle>
                <div className="space-y-3">
                  {COMPETITORS.map((c, i) => (
                    <motion.div
                      key={c.name}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      data-testid={`competitor-${c.name.toLowerCase()}`}
                      className="rounded-xl border border-ink-border bg-ink-surface p-4 hover:border-brand-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 border border-brand-primary/30 flex items-center justify-center font-heading font-semibold text-brand-primary">
                          {c.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-medium text-ink-text">{c.name}</div>
                            <span className="font-mono text-xs text-brand-secondary">{c.strength}/100</span>
                          </div>
                          <div className="text-xs text-ink-muted mt-0.5">{c.focus} · {c.funding}</div>
                          <div className="mt-2 h-1 rounded-full bg-ink-elevated overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-brand-secondary to-brand-accent"
                              style={{ width: `${c.strength}%` }}
                            />
                          </div>
                          <div className="mt-2 text-xs text-ink-muted flex items-start gap-1.5">
                            <Target className="w-3 h-3 mt-0.5 text-brand-warning shrink-0" />
                            <span className="text-ink-text/80">Weakness:</span> {c.weakness}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="rounded-xl border border-ink-border bg-ink-surface p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs uppercase tracking-wider text-ink-muted">Market Positioning</div>
                    <span className="text-[10px] font-mono text-brand-secondary">Differentiation index</span>
                  </div>
                  <div className="relative h-44 rounded-lg border border-ink-border/60 bg-ink-bg/40 overflow-hidden">
                    <div className="absolute inset-0 grid-bg opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider text-ink-muted">Premium / Agentic</div>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider text-ink-muted">Commodity / Manual</div>
                      <div className="absolute top-1/2 left-2 -translate-y-1/2 text-[10px] uppercase tracking-wider text-ink-muted -rotate-90 origin-left">Niche</div>
                      <div className="absolute top-1/2 right-2 -translate-y-1/2 text-[10px] uppercase tracking-wider text-ink-muted rotate-90 origin-right">Broad</div>
                    </div>
                    {[
                      { x: 70, y: 24, l: "Northwind", c: "#A855F7", size: 14 },
                      { x: 56, y: 38, l: "Clay", c: "#22D3EE", size: 11 },
                      { x: 78, y: 56, l: "Apollo", c: "#E879F9", size: 12 },
                      { x: 32, y: 70, l: "Outreach", c: "#F59E0B", size: 10 },
                      { x: 26, y: 50, l: "Salesloft", c: "#10B981", size: 9 },
                      { x: 18, y: 30, l: "C-Room", c: "#EC4899", size: 8 },
                    ].map((d) => (
                      <div
                        key={d.l}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full text-[9px] font-medium text-white"
                        style={{
                          left: `${d.x}%`,
                          top: `${d.y}%`,
                          width: d.size + 18,
                          height: d.size + 18,
                          background: d.c,
                          opacity: 0.85,
                        }}
                      >
                        {d.l}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT: Industry trends + signals */}
              <div className="lg:col-span-3 space-y-5">
                <PanelTitle>Industry Trends</PanelTitle>
                <div className="rounded-xl border border-ink-border bg-ink-surface p-5">
                  <div className="text-xs uppercase tracking-wider text-ink-muted mb-2">Momentum (8 mo)</div>
                  <div className="h-32 -ml-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={TREND_DATA}>
                        <defs>
                          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#A855F7" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="#A855F7" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="search" stroke="#A855F7" strokeWidth={2} fill="url(#g1)" />
                        <Tooltip contentStyle={{ background: "#15101F", border: "1px solid #2A1F3D", borderRadius: 8, fontSize: 12 }} />
                        <XAxis dataKey="month" stroke="#A89FB8" fontSize={10} tickLine={false} axisLine={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-brand-success font-medium mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +118% YoY interest growth
                  </div>
                </div>

                <div className="rounded-xl border border-ink-border bg-ink-surface p-5">
                  <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">Market Signals</div>
                  <div className="space-y-2.5">
                    {MARKET_SIGNALS.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        {s.type === "opportunity" ? (
                          <Lightbulb className="w-3.5 h-3.5 text-brand-success mt-0.5 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-brand-warning mt-0.5 shrink-0" />
                        )}
                        <span className="text-ink-text/90 leading-relaxed">{s.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-ink-border bg-ink-surface p-5">
                  <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">Opportunities vs Risks</div>
                  <div className="flex items-end gap-3 h-20">
                    <div className="flex-1 flex flex-col items-center justify-end">
                      <div className="w-full rounded-t bg-gradient-to-t from-brand-success/40 to-brand-success" style={{ height: "68%" }} />
                      <div className="text-[10px] mt-1.5 text-ink-muted">Opp</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-end">
                      <div className="w-full rounded-t bg-gradient-to-t from-brand-warning/40 to-brand-warning" style={{ height: "38%" }} />
                      <div className="text-[10px] mt-1.5 text-ink-muted">Risk</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="rounded-2xl border border-brand-primary/40 bg-gradient-to-r from-brand-primary/15 via-brand-accent/10 to-brand-secondary/15 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-heading text-2xl font-semibold">Ready to turn research into revenue?</h3>
                <p className="text-ink-muted mt-1">We&apos;ve assembled enough signal. Let&apos;s design your GTM motion.</p>
              </div>
              <Button
                onClick={() => navigate("/ideation")}
                data-testid="research-to-ideation-cta"
                size="lg"
                className="bg-brand-primary hover:bg-[#9333EA] text-white shadow-xl shadow-brand-primary/40"
              >
                Start Your GTM Strategy <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {loading && (
          <div className="flex items-center justify-center py-32 gap-3 text-ink-muted">
            <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
            <span>Crawling sources, distilling signals...</span>
          </div>
        )}
      </main>
    </div>
  );
}

function PanelTitle({ children }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-px flex-1 bg-gradient-to-r from-brand-primary/0 via-brand-primary/40 to-brand-primary/0" />
      <div className="text-[11px] uppercase tracking-[0.22em] text-ink-muted">{children}</div>
      <div className="h-px flex-1 bg-gradient-to-r from-brand-primary/0 via-brand-primary/40 to-brand-primary/0" />
    </div>
  );
}
