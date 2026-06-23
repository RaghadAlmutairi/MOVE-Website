// Strategy Studio layout — tabbed interface ported from /command-center,
// repainted with the current cream/coral/mauve theme tokens. ALL data comes
// from getStrategyView(result) — no invented fields.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Crosshair, MessageSquare, Radio, GitBranch, CalendarDays, BarChart3,
  Target, ShieldAlert, Sparkles, BadgeCheck,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

// Move palette — coral / mauve / indigo + supporting accents.
const PALETTE = ["#D4956B", "#B97A8A", "#7E6FB4", "#3D8C7E", "#C08B3E", "#B5544A", "#3B6FA8", "#7C8475"];
const INVEST_WEIGHT = { high: 3, medium: 2, low: 1 };

const arr = (v) => (Array.isArray(v) ? v : []);
const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
const s = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));

export default function StrategyStudio({ strategy }) {
  const [active, setActive] = useState("overview");
  const v = strategy;

  const channelData = useMemo(() => {
    if (!v) return [];
    return arr(v.activation.channelPlays).slice(0, 6).map((c, i) => ({
      name: c.channel || `Channel ${i + 1}`,
      weight: INVEST_WEIGHT[(c.invest || "").toLowerCase()] || 1,
      color: PALETTE[i % PALETTE.length],
    }));
  }, [v]);

  if (!v) return null;

  return (
    <section data-testid="strategy-studio" className="mt-2">
      <Tabs active={active} onChange={setActive} />
      {active === "overview"  && <OverviewTab  v={v} channelData={channelData} />}
      {active === "icp"       && <IcpTab       v={v} />}
      {active === "messaging" && <MessagingTab v={v} />}
      {active === "channels"  && <ChannelsTab  v={v} channelData={channelData} />}
      {active === "roadmap"   && <RoadmapTab   v={v} />}
      {active === "metrics"   && <MetricsTab   v={v} />}
    </section>
  );
}

// ── Tabs ────────────────────────────────────────────────────────────────────
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
    <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-move-border pb-1" data-testid="studio-tabs">
      {TABS.map((t) => {
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} data-testid={`tab-${t.id}`}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm transition-colors border-b-2 -mb-px ${
              on
                ? "border-move-grad-2 text-move-grad-2 bg-move-surface"
                : "border-transparent text-move-muted hover:text-move-ink"
            }`}
            style={{ fontWeight: on ? 500 : 400 }}
          >
            <t.Icon className="w-4 h-4" /> {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Overview ───────────────────────────────────────────────────────────────
function OverviewTab({ v, channelData }) {
  const positioning = v.foundation.positioning;
  const motion      = v.activation.motion?.primary;
  const bh          = obj(v.foundation.beachhead);
  const nsm         = v.execution.metrics?.north_star_metric;
  const nsmWhy      = v.execution.metrics?.north_star_why;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {positioning && (
        <Card title="Positioning" Icon={Crosshair}>
          <p className="text-base text-move-ink leading-relaxed line-clamp-6" data-testid="overview-positioning">{positioning}</p>
        </Card>
      )}
      {motion && (
        <Card title="Primary motion" Icon={GitBranch}>
          <p className="text-base text-move-ink leading-relaxed line-clamp-6" data-testid="overview-motion">{motion}</p>
        </Card>
      )}
      {(bh.segment || bh.rationale) && (
        <Card title="Beachhead" Icon={Target}>
          {bh.segment && <div className="text-base text-move-ink mb-1 font-medium" style={{ fontWeight: 500 }}>{bh.segment}</div>}
          {bh.rationale && <p className="text-sm text-move-body leading-relaxed line-clamp-5">{bh.rationale}</p>}
        </Card>
      )}

      {channelData.length > 0 && (
        <div className="lg:col-span-2 rounded-2xl border border-move-border bg-move-surface p-6">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-4 h-4 text-move-grad-2" />
            <h3 className="text-lg font-medium text-move-ink" style={{ fontWeight: 500 }}>Channel investment weight</h3>
          </div>
          <div className="h-56">
            <InvestmentChart data={channelData} layout="bar" />
          </div>
        </div>
      )}

      {nsm && (
        <Card title="North-star metric" Icon={BarChart3}>
          <div className="text-xl text-move-ink leading-snug" style={{ fontWeight: 500 }}>{nsm}</div>
          {nsmWhy && <p className="text-sm text-move-body mt-2 leading-relaxed line-clamp-4">{nsmWhy}</p>}
        </Card>
      )}
    </div>
  );
}

// ── ICP / Audience ──────────────────────────────────────────────────────────
function IcpTab({ v }) {
  const icp = obj(v.foundation.icp);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {(icp.primary_segment || icp.title || icp.segment) && (
        <Card title="Primary segment" Icon={Users}>
          <p className="text-base text-move-ink leading-relaxed">{s(icp.primary_segment || icp.title || icp.segment)}</p>
        </Card>
      )}
      {icp.why_now && <Card title="Why now"><p className="text-base text-move-ink leading-relaxed">{s(icp.why_now)}</p></Card>}
      {icp.firmographics && <Card title="Firmographics"><p className="text-base text-move-ink leading-relaxed">{s(icp.firmographics)}</p></Card>}
      {icp.technographics && <Card title="Technographics"><p className="text-base text-move-ink leading-relaxed">{s(icp.technographics)}</p></Card>}
      {arr(icp.buying_committee).length > 0 && (
        <Card title="Buying committee" full>
          <div className="flex flex-wrap gap-2">{icp.buying_committee.map((c, i) => <Chip key={i}>{s(c)}</Chip>)}</div>
        </Card>
      )}
      {arr(v.foundation.topPains).length > 0 && (
        <Card title="Top pains"><BulletList items={v.foundation.topPains} /></Card>
      )}
      {arr(v.foundation.triggers).length > 0 && (
        <Card title="Trigger events"><BulletList items={v.foundation.triggers} /></Card>
      )}
      {arr(v.foundation.disqualifiers).length > 0 && (
        <Card title="Disqualifiers"><BulletList items={v.foundation.disqualifiers} /></Card>
      )}
      {arr(v.foundation.secondarySegments).length > 0 && (
        <Card title="Secondary segments" full>
          <div className="flex flex-wrap gap-2">{v.foundation.secondarySegments.map((c, i) => <Chip key={i}>{s(c)}</Chip>)}</div>
        </Card>
      )}
    </div>
  );
}

// ── Messaging ───────────────────────────────────────────────────────────────
function MessagingTab({ v }) {
  const items = arr(v.activation.messagingByPersona);
  if (items.length === 0) return <Empty title="No persona messaging produced" />;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {items.map((m, i) => {
        const o = obj(m);
        return (
          <Card key={i} title={o.persona || `Persona ${i + 1}`} Icon={MessageSquare}>
            {(o.core_promise || o.headline) && (
              <p className="text-base text-move-ink leading-relaxed mb-3">{s(o.core_promise || o.headline)}</p>
            )}
            {o.primary_channel && <div className="text-sm text-move-body">Primary channel: <span className="text-move-ink">{s(o.primary_channel)}</span></div>}
            {o.cta && <div className="text-sm text-move-body">CTA: <span className="text-move-ink">{s(o.cta)}</span></div>}
            {arr(o.pillars).length > 0 && (
              <div className="mt-3">
                <div className="text-xs uppercase tracking-wider text-move-muted mb-1.5">Pillars</div>
                <BulletList items={o.pillars} />
              </div>
            )}
            {arr(o.objections).length > 0 && (
              <div className="mt-3">
                <div className="text-xs uppercase tracking-wider text-move-muted mb-1.5">Objections</div>
                <BulletList items={o.objections} />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ── Channels ────────────────────────────────────────────────────────────────
function ChannelsTab({ v, channelData }) {
  const list = arr(v.activation.channelPlays);
  if (list.length === 0) return <Empty title="No channel plays produced" />;
  return (
    <div>
      {channelData.length > 0 && (
        <div className="rounded-2xl border border-move-border bg-move-surface p-6 mb-5">
          <div className="text-sm uppercase tracking-wider text-move-muted mb-3">Investment weight (Low / Medium / High)</div>
          <div className="h-48"><InvestmentChart data={channelData} layout="vertical" /></div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((c, i) => {
          const o = obj(c);
          return (
            <Card key={i} title={o.channel || `Channel ${i + 1}`}>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {o.invest && <span className="text-xs px-2 py-0.5 rounded-full border border-move-border" style={{ color: PALETTE[i % PALETTE.length] }}>{s(o.invest)}</span>}
                {(o.funnel_role || o.role) && <span className="text-xs px-2 py-0.5 rounded-full bg-move-bg-subtle text-move-muted">{s(o.funnel_role || o.role)}</span>}
              </div>
              {(o.why || o.leading_indicator) && <p className="text-sm text-move-body leading-relaxed line-clamp-5">{s(o.why || o.leading_indicator)}</p>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Roadmap ─────────────────────────────────────────────────────────────────
function RoadmapTab({ v }) {
  const phases = arr(v.execution.roadmap);
  if (phases.length === 0) return <Empty title="No roadmap produced" />;
  return (
    <div className="relative">
      <div className="absolute top-7 left-7 right-7 h-px bg-gradient-to-r from-move-grad-1 via-move-grad-2 to-move-grad-3 opacity-50" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {phases.map((p, i) => {
          const o = obj(p);
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="rounded-2xl border border-move-border bg-move-surface p-6 relative" data-testid={`roadmap-card-${i}`}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-move-grad-1 via-move-grad-2 to-move-grad-3 flex items-center justify-center text-white text-lg mb-4 relative z-10" style={{ fontWeight: 500 }}>{i + 1}</div>
              {o.phase && <div className="text-xs uppercase tracking-wider text-move-grad-3 mb-1" style={{ fontWeight: 500 }}>{s(o.phase)}</div>}
              {o.objective && <p className="text-base text-move-ink mb-4 leading-snug line-clamp-3">{s(o.objective)}</p>}
              {arr(o.workstreams).length > 0 && (
                <ul className="space-y-2">
                  {o.workstreams.slice(0, 5).map((w, j) => {
                    const x = obj(w);
                    return (
                      <li key={j} className="text-sm">
                        <span className="text-move-grad-2" style={{ fontWeight: 500 }}>{s(x.workstream || x.name)}</span>
                        {x.deliverable && <div className="text-move-muted text-xs mt-0.5 line-clamp-2">{s(x.deliverable)}</div>}
                        {x.owner && <div className="text-[11px] text-move-grad-3 mt-0.5">{s(x.owner)}</div>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Metrics & Risks ─────────────────────────────────────────────────────────
function MetricsTab({ v }) {
  const m = obj(v.execution.metrics);
  const cols = [
    { title: "Input metrics",  items: arr(m.input_metrics) },
    { title: "Funnel KPIs",    items: arr(m.funnel_kpis) },
    { title: "Health metrics", items: arr(m.health_metrics) },
  ].filter((c) => c.items.length > 0);
  return (
    <>
      {(m.north_star_metric || v.northStar) && (
        <div className="rounded-2xl border border-move-grad-3/40 bg-move-grad-3-tint p-6 mb-5">
          <div className="text-xs uppercase tracking-wider text-move-grad-3 mb-1.5" style={{ fontWeight: 500 }}>North-star metric</div>
          <div className="text-2xl text-move-ink" style={{ fontWeight: 500 }}>{s(m.north_star_metric || v.northStar)}</div>
          {m.north_star_why && <p className="text-base text-move-body mt-2 leading-relaxed line-clamp-3">{s(m.north_star_why)}</p>}
        </div>
      )}
      {cols.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cols.map((col) => (
            <Card key={col.title} title={col.title}>
              <ul className="space-y-3">
                {col.items.slice(0, 6).map((it, i) => {
                  const o = obj(it);
                  return (
                    <li key={i}>
                      <div className="text-base text-move-ink" style={{ fontWeight: 500 }}>{s(o.metric || o.name)}</div>
                      <div className="text-sm text-move-body">{s(o.target_band || o.target) || "—"}{o.cadence ? ` · ${s(o.cadence)}` : ""}</div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          ))}
        </div>
      )}
      {arr(v.execution.risks).length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4"><ShieldAlert className="w-5 h-5 text-move-warning" /><h2 className="text-xl text-move-ink" style={{ fontWeight: 500 }}>Strategic risks</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {v.execution.risks.map((r, i) => {
              const o = obj(r);
              return (
                <Card key={i} title={s(o.risk || o.label) || `Risk ${i + 1}`}>
                  <div className="flex gap-3 text-sm text-move-body mb-2">
                    {o.likelihood && <span>Likelihood: <span className="text-move-ink">{s(o.likelihood)}</span></span>}
                    {o.impact && <span>Impact: <span className="text-move-ink">{s(o.impact)}</span></span>}
                  </div>
                  {o.mitigation && <p className="text-sm text-move-body leading-relaxed line-clamp-4">{s(o.mitigation)}</p>}
                  {o.owner && <div className="text-xs text-move-grad-3 mt-2">Owner: {s(o.owner)}</div>}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

// ── Chart ───────────────────────────────────────────────────────────────────
function InvestmentChart({ data, layout }) {
  // Tooltip styled for the cream theme.
  const tipStyle = { background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 13, color: "var(--color-ink)" };
  const grid = "rgba(0,0,0,0.05)";
  const axis = "var(--color-muted)";
  const fmt  = (val) => ["", "Low", "Medium", "High"][val] || val;
  return (
    <ResponsiveContainer width="100%" height="100%">
      {layout === "vertical" ? (
        <BarChart data={data} layout="vertical" margin={{ left: 90, right: 12 }}>
          <CartesianGrid stroke={grid} strokeDasharray="3 3" />
          <XAxis type="number" stroke={axis} fontSize={12} domain={[0, 3]} ticks={[1, 2, 3]} tickFormatter={(val) => ["", "Low", "Med", "High"][val] || ""} />
          <YAxis dataKey="name" type="category" stroke={axis} fontSize={13} />
          <Tooltip contentStyle={tipStyle} formatter={fmt} />
          <Bar dataKey="weight" radius={[0, 6, 6, 0]}>
            {data.map((c) => <Cell key={c.name} fill={c.color} />)}
          </Bar>
        </BarChart>
      ) : (
        <BarChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
          <CartesianGrid stroke={grid} strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke={axis} fontSize={12} interval={0} angle={-12} textAnchor="end" height={50} />
          <YAxis stroke={axis} fontSize={12} domain={[0, 3]} ticks={[1, 2, 3]} tickFormatter={(val) => ["", "Low", "Med", "High"][val] || ""} />
          <Tooltip contentStyle={tipStyle} formatter={fmt} />
          <Bar dataKey="weight" radius={[6, 6, 0, 0]}>
            {data.map((c) => <Cell key={c.name} fill={c.color} />)}
          </Bar>
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}

// ── Tiny primitives ─────────────────────────────────────────────────────────
function Card({ title, Icon, children, full = false }) {
  return (
    <div className={`rounded-2xl border border-move-border bg-move-surface p-6 ${full ? "md:col-span-2" : ""}`}>
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-4 h-4 text-move-grad-2" />}
        <div className="text-sm text-move-ink" style={{ fontWeight: 500 }}>{title}</div>
      </div>
      {children}
    </div>
  );
}
function Chip({ children }) { return <span className="text-sm px-3 py-1 rounded-full bg-move-bg-subtle border border-move-border text-move-ink">{children}</span>; }
function BulletList({ items }) {
  return (
    <ul className="space-y-2">
      {arr(items).slice(0, 6).map((i, idx) => (
        <li key={idx} className="flex items-start gap-2 text-sm text-move-ink leading-relaxed">
          <div className="w-1.5 h-1.5 rounded-full bg-move-grad-2 mt-2 shrink-0" />
          <span>{typeof i === "string" ? i : (obj(i).label || obj(i).point || obj(i).pain || "")}</span>
        </li>
      ))}
    </ul>
  );
}
function Empty({ title }) {
  return (
    <div className="rounded-2xl border border-dashed border-move-border bg-move-bg-subtle/40 p-12 text-center">
      <Sparkles className="w-10 h-10 mx-auto mb-3 text-move-grad-2" />
      <div className="text-xl text-move-ink" style={{ fontWeight: 500 }}>{title}</div>
    </div>
  );
}

export { BadgeCheck };
