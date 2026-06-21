import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, Crosshair, MessageSquare, Radio, GitBranch, CalendarDays, BarChart3,
  ArrowRight, Sparkles, ChevronRight, ShieldAlert, Target,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import TopNav from "@/components/TopNav";
import ChatPanel from "@/components/ChatPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRun } from "@/lib/RunContext";
import { getStrategyView } from "@/lib/transforms";

const PALETTE = ["#A855F7", "#22D3EE", "#E879F9", "#10B981", "#F59E0B", "#EC4899", "#3B82F6", "#14B8A6"];
const INVEST_WEIGHT = { high: 3, medium: 2, low: 1 };

export default function CommandCenter() {
  const navigate = useNavigate();
  const { run } = useRun();
  const result = run?.result;
  const v = useMemo(() => (result ? getStrategyView(result) : null), [result]);
  const [active, setActive] = useState("overview");

  const channelData = useMemo(() => {
    if (!v) return [];
    return v.activation.channelPlays.slice(0, 6).map((c, i) => ({
      name: c.channel || `Channel ${i + 1}`,
      weight: INVEST_WEIGHT[(c.invest || "").toLowerCase()] || 1,
      color: PALETTE[i % PALETTE.length],
    }));
  }, [v]);

  if (!run) return <Shell><Empty title="No active run" desc="Start research first." cta="Start Research" onClick={() => navigate("/research")} /></Shell>;
  if (!v) return <Shell><Empty title="Strategy not ready" desc="The strategy agent must complete first." cta="Open Strategy" onClick={() => navigate("/ideation")} /></Shell>;

  return (
    <Shell>
      {/* Compact header — no long bold title */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-brand-accent/40 text-brand-accent bg-brand-accent/10 text-xs">
            <Sparkles className="w-3 h-3 mr-1" /> Strategy Studio
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="cc-title">Strategy Studio</h1>
        </div>
        <Button onClick={() => navigate("/studio")} data-testid="cc-go-studio" className="bg-brand-primary hover:bg-[#9333EA] text-white text-base">
          Open Content Studio <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>

      {/* North star — featured, but compact */}
      <div className="rounded-2xl border border-brand-primary/30 bg-gradient-to-br from-brand-primary/10 via-ink-surface to-brand-accent/10 p-7 mb-8">
        <div className="text-xs uppercase tracking-[0.18em] text-brand-secondary mb-2">North Star</div>
        <p className="text-2xl font-bold text-ink-text leading-snug" data-testid="cc-north-star">{v.northStar || "—"}</p>
      </div>

      {/* Tabs */}
      <Tabs active={active} onChange={setActive} />

      {active === "overview" && <OverviewTab v={v} channelData={channelData} />}
      {active === "icp" && <IcpTab v={v} />}
      {active === "messaging" && <MessagingTab v={v} />}
      {active === "channels" && <ChannelsTab v={v} channelData={channelData} />}
      {active === "roadmap" && <RoadmapTab v={v} />}
      {active === "metrics" && <MetricsTab v={v} />}

      {/* Chat */}
      <div className="mt-10">
        <ChatPanel scope="strategy" />
      </div>
    </Shell>
  );
}

function Tabs({ active, onChange }) {
  const TABS = [
    { id: "overview",  label: "Overview",  Icon: Target },
    { id: "icp",       label: "Audience",  Icon: Users },
    { id: "messaging", label: "Messaging", Icon: MessageSquare },
    { id: "channels",  label: "Channels",  Icon: Radio },
    { id: "roadmap",   label: "Roadmap",   Icon: CalendarDays },
    { id: "metrics",   label: "Metrics",   Icon: BarChart3 },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-ink-border pb-1">
      {TABS.map((t) => {
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} data-testid={`tab-${t.id}`}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-base font-medium transition-colors border-b-2 -mb-px ${
              on ? "border-brand-primary text-brand-primary bg-ink-surface" : "border-transparent text-ink-muted hover:text-ink-text"
            }`}>
            <t.Icon className="w-4 h-4" /> {t.label}
          </button>
        );
      })}
    </div>
  );
}

function OverviewTab({ v, channelData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Card title="Positioning" Icon={Crosshair}>
        <p className="text-base text-ink-text leading-relaxed line-clamp-5">{v.foundation.positioning || "—"}</p>
      </Card>
      <Card title="Primary motion" Icon={GitBranch}>
        <p className="text-base text-ink-text leading-relaxed line-clamp-5">{v.activation.motion?.primary || "—"}</p>
      </Card>
      <Card title="Beachhead" Icon={Target}>
        <div className="text-base text-ink-text mb-1">{v.foundation.beachhead?.segment || "—"}</div>
        <p className="text-sm text-ink-muted leading-relaxed line-clamp-4">{v.foundation.beachhead?.rationale || ""}</p>
      </Card>

      {channelData.length > 0 && (
        <div className="lg:col-span-2 rounded-2xl border border-ink-border bg-ink-surface p-6">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-4 h-4 text-brand-primary" />
            <h3 className="text-lg font-bold">Channel investment weight</h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="#2A1F3D" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#A89FB8" fontSize={12} interval={0} angle={-12} textAnchor="end" height={50} />
                <YAxis stroke="#A89FB8" fontSize={12} domain={[0, 3]} ticks={[1,2,3]} tickFormatter={(v) => ["", "Low", "Med", "High"][v] || ""} />
                <Tooltip contentStyle={{ background: "#15101F", border: "1px solid #2A1F3D", borderRadius: 8, fontSize: 13 }} formatter={(v) => ["", "Low", "Medium", "High"][v] || v} />
                <Bar dataKey="weight" radius={[6, 6, 0, 0]}>
                  {channelData.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <Card title="North-star metric" Icon={BarChart3}>
        <div className="text-xl font-bold text-ink-text leading-snug">{v.execution.metrics.north_star_metric || "—"}</div>
        {v.execution.metrics.north_star_why && <p className="text-sm text-ink-muted mt-2 leading-relaxed line-clamp-4">{v.execution.metrics.north_star_why}</p>}
      </Card>
    </div>
  );
}

function IcpTab({ v }) {
  const icp = v.foundation.icp;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Card title="Primary segment" Icon={Users}><p className="text-base text-ink-text leading-relaxed">{icp.primary_segment || "—"}</p></Card>
      <Card title="Why now"><p className="text-base text-ink-text leading-relaxed">{icp.why_now || "—"}</p></Card>
      <Card title="Firmographics"><p className="text-base text-ink-text leading-relaxed">{icp.firmographics || "—"}</p></Card>
      <Card title="Technographics"><p className="text-base text-ink-text leading-relaxed">{icp.technographics || "—"}</p></Card>
      {icp.buying_committee?.length > 0 && (
        <Card title="Buying committee" full>
          <div className="flex flex-wrap gap-2">{icp.buying_committee.map((c) => <Chip key={c}>{c}</Chip>)}</div>
        </Card>
      )}
      {v.foundation.topPains?.length > 0 && (
        <Card title="Top pains"><BulletList items={v.foundation.topPains} /></Card>
      )}
      {v.foundation.triggers?.length > 0 && (
        <Card title="Trigger events"><BulletList items={v.foundation.triggers} /></Card>
      )}
    </div>
  );
}

function MessagingTab({ v }) {
  const items = v.activation.messagingByPersona;
  if (items.length === 0) return <Empty title="No persona messaging produced" />;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {items.map((m) => (
        <Card key={m.persona} title={m.persona} Icon={MessageSquare}>
          {m.core_promise && <p className="text-base text-ink-text leading-relaxed mb-3">{m.core_promise}</p>}
          {m.primary_channel && <div className="text-sm text-ink-muted">Primary channel: <span className="text-ink-text">{m.primary_channel}</span></div>}
          {m.cta && <div className="text-sm text-ink-muted">CTA: <span className="text-ink-text">{m.cta}</span></div>}
          {m.pillars?.length > 0 && <div className="mt-3"><div className="text-xs uppercase tracking-wider text-ink-muted mb-1.5">Pillars</div><BulletList items={m.pillars} /></div>}
        </Card>
      ))}
    </div>
  );
}

function ChannelsTab({ v, channelData }) {
  if (v.activation.channelPlays.length === 0) return <Empty title="No channel plays produced" />;
  return (
    <div>
      {channelData.length > 0 && (
        <div className="rounded-2xl border border-ink-border bg-ink-surface p-6 mb-5">
          <div className="text-sm uppercase tracking-wider text-ink-muted mb-3">Investment weight (Low / Medium / High)</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} layout="vertical" margin={{ left: 90, right: 12 }}>
                <CartesianGrid stroke="#2A1F3D" strokeDasharray="3 3" />
                <XAxis type="number" stroke="#A89FB8" fontSize={12} domain={[0, 3]} ticks={[1,2,3]} tickFormatter={(v) => ["", "Low", "Med", "High"][v] || ""} />
                <YAxis dataKey="name" type="category" stroke="#A89FB8" fontSize={13} />
                <Tooltip contentStyle={{ background: "#15101F", border: "1px solid #2A1F3D", borderRadius: 8, fontSize: 13 }} formatter={(v) => ["", "Low", "Medium", "High"][v] || v} />
                <Bar dataKey="weight" radius={[0, 6, 6, 0]}>
                  {channelData.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {v.activation.channelPlays.map((c, i) => (
          <Card key={c.channel} title={c.channel}>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {c.invest && <span className="text-xs px-2 py-0.5 rounded-full border border-ink-border" style={{ color: PALETTE[i % PALETTE.length] }}>{c.invest}</span>}
              {c.funnel_role && <span className="text-xs px-2 py-0.5 rounded-full bg-ink-elevated text-ink-muted">{c.funnel_role}</span>}
            </div>
            {c.why && <p className="text-sm text-ink-text/90 leading-relaxed line-clamp-5">{c.why}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}

function RoadmapTab({ v }) {
  const phases = v.execution.roadmap;
  if (phases.length === 0) return <Empty title="No roadmap produced" />;
  return (
    <div className="relative">
      <div className="absolute top-7 left-7 right-7 h-px bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary opacity-50" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {phases.map((p, i) => (
          <motion.div key={p.phase} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-2xl border border-ink-border bg-ink-surface p-6 relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center font-bold text-white text-lg mb-4 relative z-10">{i + 1}</div>
            <div className="text-xs uppercase tracking-wider text-brand-secondary mb-1">{p.phase}</div>
            <p className="text-base text-ink-text mb-4 leading-snug line-clamp-3">{p.objective}</p>
            {p.workstreams?.length > 0 && (
              <ul className="space-y-2">
                {p.workstreams.slice(0, 4).map((w) => (
                  <li key={w.workstream} className="text-sm">
                    <span className="text-brand-primary font-medium">{w.workstream}</span>
                    {w.deliverable && <div className="text-ink-muted text-xs mt-0.5 line-clamp-2">{w.deliverable}</div>}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MetricsTab({ v }) {
  const m = v.execution.metrics;
  const cols = [
    { title: "Input metrics", items: m.input_metrics || [] },
    { title: "Funnel KPIs", items: m.funnel_kpis || [] },
    { title: "Health metrics", items: m.health_metrics || [] },
  ];
  return (
    <>
      <div className="rounded-2xl border border-ink-border bg-ink-surface p-6 mb-5">
        <div className="text-xs uppercase tracking-wider text-ink-muted mb-1.5">North-star metric</div>
        <div className="text-2xl font-bold text-ink-text">{m.north_star_metric || "—"}</div>
        {m.north_star_why && <p className="text-base text-ink-muted mt-2 leading-relaxed line-clamp-3">{m.north_star_why}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cols.map((col) => (
          <Card key={col.title} title={col.title}>
            {col.items.length === 0 ? <span className="text-sm text-ink-muted">—</span> :
              <ul className="space-y-3">
                {col.items.slice(0, 5).map((it) => (
                  <li key={it.metric}>
                    <div className="text-base text-ink-text font-medium">{it.metric}</div>
                    <div className="text-sm text-ink-muted">{it.target_band || "—"}{it.cadence ? ` · ${it.cadence}` : ""}</div>
                  </li>
                ))}
              </ul>
            }
          </Card>
        ))}
      </div>
      {v.execution.risks?.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4"><ShieldAlert className="w-5 h-5 text-brand-warning" /><h2 className="text-xl font-bold">Strategic risks</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {v.execution.risks.map((r) => (
              <Card key={r.risk} title={r.risk}>
                <div className="flex gap-3 text-sm text-ink-muted mb-2">
                  <span>Likelihood: <span className="text-ink-text">{r.likelihood || "—"}</span></span>
                  <span>Impact: <span className="text-ink-text">{r.impact || "—"}</span></span>
                </div>
                {r.mitigation && <p className="text-sm text-ink-text leading-relaxed line-clamp-3">{r.mitigation}</p>}
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function Card({ title, Icon, children, full = false }) {
  return (
    <div className={`rounded-2xl border border-ink-border bg-ink-surface p-6 ${full ? "md:col-span-2" : ""}`}>
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-4 h-4 text-brand-primary" />}
        <div className="text-sm font-semibold text-ink-text">{title}</div>
      </div>
      {children}
    </div>
  );
}

function Chip({ children }) { return <span className="text-sm px-3 py-1 rounded-full bg-ink-elevated border border-ink-border text-ink-text">{children}</span>; }
function BulletList({ items }) {
  return (
    <ul className="space-y-2">
      {items.slice(0, 6).map((i) => <li key={i} className="flex items-start gap-2 text-sm text-ink-text leading-relaxed"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 shrink-0" /><span>{i}</span></li>)}
    </ul>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-ink-bg">
      <TopNav />
      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        <div className="flex items-center gap-2 text-sm text-ink-muted mb-6">
          <Link to="/" className="hover:text-ink-text transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/ideation" className="hover:text-ink-text transition-colors">Strategy</Link>
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
    <div className="rounded-2xl border border-dashed border-ink-border bg-ink-surface/30 p-12 text-center">
      <Sparkles className="w-10 h-10 mx-auto mb-3 text-brand-accent" />
      <div className="text-xl font-bold text-ink-text">{title}</div>
      {desc && <p className="text-base text-ink-muted mt-2 mb-5">{desc}</p>}
      {cta && <Button onClick={onClick} className="bg-brand-primary hover:bg-[#9333EA] text-white">{cta} <ArrowRight className="ml-2 w-4 h-4" /></Button>}
    </div>
  );
}
