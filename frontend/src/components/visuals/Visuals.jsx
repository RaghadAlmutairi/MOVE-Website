// Reusable visual cards for the Research and Strategy pages.
// All components here render data ONLY — they never produce text content
// themselves and never display source URLs / footnote markers, per spec.
import { useState } from "react";
import {
  Sparkles, Target, Building2, TrendingUp, AlertTriangle, ShieldCheck,
  Users, Trophy, Compass, ChevronDown, ChevronUp, MapPin, Zap,
} from "lucide-react";

const safeArr = (v) => (Array.isArray(v) ? v : []);
const safeStr = (v) => (typeof v === "string" ? v : "");
const safeObj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});

// ───────────────────────────────────────────────────────────────────────────────
// EXECUTIVE SUMMARY — top-of-page key takeaways for either Research or Strategy
// ───────────────────────────────────────────────────────────────────────────────
export function ExecutiveSummary({ kind = "research", insights = [], opportunities = [], risks = [], recommendations = [] }) {
  const cols = [
    { key: "insights",         label: "Key insights",     items: insights,        icon: Sparkles, accent: "var(--color-grad-2)" },
    { key: "opportunities",    label: "Opportunities",    items: opportunities,   icon: TrendingUp, accent: "var(--color-success)" },
    { key: "risks",            label: "Risks",            items: risks,           icon: AlertTriangle, accent: "var(--color-grad-1)" },
    { key: "recommendations",  label: "Recommendations",  items: recommendations, icon: Compass,    accent: "var(--color-grad-3)" },
  ].filter((c) => c.items && c.items.length > 0);

  if (cols.length === 0) return null;

  return (
    <section className="rounded-[20px] border border-move-border bg-gradient-to-br from-move-grad-1-tint via-move-surface to-move-grad-3-tint p-6 mb-8" data-testid={`exec-summary-${kind}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-move-grad-2/40 bg-move-grad-2-tint text-move-grad-2">
          <Sparkles className="w-3 h-3" /> Executive summary
        </span>
        <span className="text-xs text-move-muted">Read this in 30 seconds.</span>
      </div>
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${cols.length >= 3 ? "lg:grid-cols-4" : "lg:grid-cols-2"} gap-4`}>
        {cols.map((c) => (
          <div key={c.key} className="rounded-[16px] bg-move-surface border border-move-border p-4" data-testid={`summary-col-${c.key}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${c.accent}1A`, color: c.accent, border: `1px solid ${c.accent}40` }}>
                <c.icon className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-sm font-medium text-move-ink" style={{ fontWeight: 500 }}>{c.label}</h3>
            </div>
            <ul className="space-y-1.5">
              {c.items.slice(0, 4).map((it, i) => (
                <li key={i} className="text-sm text-move-body leading-relaxed flex gap-2">
                  <span className="text-move-grad-2 shrink-0">•</span>
                  <span>{typeof it === "string" ? it : it?.label || it?.title || it?.name || ""}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// RESEARCH VISUALS
// ───────────────────────────────────────────────────────────────────────────────

export function IndustrySnapshot({ report }) {
  const r = safeObj(report);
  const stats = [
    { label: "Industry",      value: safeStr(r.industry) || "—",         icon: Building2 },
    { label: "Geography",     value: safeStr(r.geography) || "Global",    icon: MapPin },
    { label: "Growth signal", value: safeStr(r.growth_signal) || (r.market_size ? `${r.market_size}` : "—"), icon: TrendingUp },
    { label: "Stage",         value: safeStr(r.stage) || "—",             icon: Zap },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="industry-snapshot">
      {stats.map((s) => (
        <div key={s.label} className="rounded-[16px] border border-move-border bg-move-surface p-4">
          <div className="flex items-center gap-2 text-move-muted text-xs uppercase tracking-wider mb-1.5">
            <s.icon className="w-3.5 h-3.5" /> {s.label}
          </div>
          <div className="text-base font-medium text-move-ink line-clamp-2" style={{ fontWeight: 500 }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

export function ICPCards({ personas = [] }) {
  const list = safeArr(personas);
  if (list.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="icp-cards">
      {list.map((p, i) => {
        const o = safeObj(p);
        return (
          <article key={i} className="rounded-[16px] border border-move-border bg-move-surface p-5 hover:border-move-grad-2 transition-colors" data-testid={`icp-card-${i}`}>
            <div className="flex items-start gap-3 mb-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-move-grad-1-tint to-move-grad-3-tint flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-move-grad-2" />
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-move-ink truncate" style={{ fontWeight: 500 }}>{o.name || o.role || `Persona ${i + 1}`}</h3>
                {o.role && o.name && <div className="text-xs text-move-muted truncate">{o.role}</div>}
                {(o.firmographic || o.segment || o.industry) && (
                  <div className="text-xs text-move-muted truncate">{o.firmographic || o.segment || o.industry}</div>
                )}
              </div>
            </div>
            {Array.isArray(o.pains) && o.pains.length > 0 && (
              <PillRow label="Pains" items={o.pains.slice(0, 3)} accent="error" />
            )}
            {Array.isArray(o.goals) && o.goals.length > 0 && (
              <PillRow label="Goals" items={o.goals.slice(0, 3)} accent="success" />
            )}
            {Array.isArray(o.triggers) && o.triggers.length > 0 && (
              <PillRow label="Triggers" items={o.triggers.slice(0, 3)} accent="grad" />
            )}
          </article>
        );
      })}
    </div>
  );
}

function PillRow({ label, items, accent = "grad" }) {
  const cls = {
    grad:    "bg-move-grad-2-tint text-move-grad-2 border-move-grad-2/30",
    success: "bg-move-success-bg text-move-success border-move-success/30",
    error:   "bg-move-error-bg text-move-error border-move-error/30",
  }[accent];
  return (
    <div className="mt-2">
      <div className="text-[11px] uppercase tracking-wider text-move-muted mb-1">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((s, i) => (
          <span key={i} className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}>{typeof s === "string" ? s : (s?.label || "")}</span>
        ))}
      </div>
    </div>
  );
}

export function CompetitorMatrix({ competitors = [] }) {
  const list = safeArr(competitors);
  if (list.length === 0) return null;
  return (
    <div className="rounded-[16px] border border-move-border bg-move-surface overflow-hidden" data-testid="competitor-matrix">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-move-border bg-move-bg-subtle">
            <th className="px-4 py-3 text-left font-medium text-move-ink" style={{ fontWeight: 500 }}>Competitor</th>
            <th className="px-4 py-3 text-left font-medium text-move-ink" style={{ fontWeight: 500 }}>Strengths</th>
            <th className="px-4 py-3 text-left font-medium text-move-ink" style={{ fontWeight: 500 }}>Weaknesses</th>
            <th className="px-4 py-3 text-left font-medium text-move-ink" style={{ fontWeight: 500 }}>Positioning</th>
          </tr>
        </thead>
        <tbody>
          {list.map((c, i) => {
            const o = safeObj(c);
            return (
              <tr key={i} className="border-b border-move-border last:border-0 hover:bg-move-bg-subtle/40" data-testid={`competitor-row-${i}`}>
                <td className="px-4 py-3 align-top">
                  <div className="font-medium text-move-ink" style={{ fontWeight: 500 }}>{o.name || `Competitor ${i + 1}`}</div>
                  {o.url && <div className="text-xs text-move-muted truncate max-w-[200px]">{o.url}</div>}
                </td>
                <td className="px-4 py-3 align-top">
                  <BulletList items={o.strengths} accent="success" />
                </td>
                <td className="px-4 py-3 align-top">
                  <BulletList items={o.weaknesses} accent="error" />
                </td>
                <td className="px-4 py-3 align-top text-move-body">
                  {o.positioning || o.summary || "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BulletList({ items, accent }) {
  const list = safeArr(items).slice(0, 4);
  if (list.length === 0) return <span className="text-move-muted">—</span>;
  const dot = { success: "text-move-success", error: "text-move-error" }[accent] || "text-move-grad-2";
  return (
    <ul className="space-y-1">
      {list.map((s, i) => (
        <li key={i} className="text-move-body flex gap-1.5">
          <span className={`shrink-0 ${dot}`}>•</span>
          <span className="leading-snug">{typeof s === "string" ? s : (s?.label || "")}</span>
        </li>
      ))}
    </ul>
  );
}

export function MarketLandscape({ swot = {}, opportunities = [] }) {
  // Visual at-a-glance landscape for the research stage.
  const o = safeObj(swot);
  const opps = safeArr(opportunities);
  const tiles = [
    { label: "Strengths",     items: o.strengths,     tone: "success" },
    { label: "Weaknesses",    items: o.weaknesses,    tone: "error"   },
    { label: "Opportunities", items: opps.length ? opps : o.opportunities, tone: "grad" },
    { label: "Threats",       items: o.threats,       tone: "warn"    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="market-landscape">
      {tiles.map((t) => (
        <div key={t.label} className={`rounded-[16px] border p-4 ${
          t.tone === "success" ? "border-move-success/30 bg-move-success-bg" :
          t.tone === "error"   ? "border-move-error/30 bg-move-error-bg"     :
          t.tone === "warn"    ? "border-move-warning/30 bg-move-warning-bg" :
                                  "border-move-grad-2/30 bg-move-grad-2-tint"
        }`}>
          <h4 className="text-sm font-medium text-move-ink mb-2" style={{ fontWeight: 500 }}>{t.label}</h4>
          <BulletList items={t.items} />
        </div>
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// STRATEGY VISUALS
// ───────────────────────────────────────────────────────────────────────────────

export function SWOTGrid({ swot }) {
  const o = safeObj(swot);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="swot-grid">
      <SwotTile label="Strengths"     icon={ShieldCheck} tone="success" items={o.strengths} />
      <SwotTile label="Weaknesses"    icon={AlertTriangle} tone="error"  items={o.weaknesses} />
      <SwotTile label="Opportunities" icon={TrendingUp}   tone="grad"   items={o.opportunities} />
      <SwotTile label="Threats"       icon={Trophy}       tone="warn"   items={o.threats} />
    </div>
  );
}
function SwotTile({ label, icon: Icon, tone, items }) {
  const cls = tone === "success" ? "border-move-success/30 bg-move-success-bg"
            : tone === "error"   ? "border-move-error/30 bg-move-error-bg"
            : tone === "warn"    ? "border-move-warning/30 bg-move-warning-bg"
            :                       "border-move-grad-2/30 bg-move-grad-2-tint";
  const tcls = tone === "success" ? "text-move-success"
             : tone === "error"   ? "text-move-error"
             : tone === "warn"    ? "text-move-warning"
             :                       "text-move-grad-2";
  return (
    <div className={`rounded-[16px] border p-4 ${cls}`}>
      <div className={`flex items-center gap-2 mb-2 ${tcls}`}>
        <Icon className="w-4 h-4" />
        <h4 className="text-sm font-medium text-move-ink" style={{ fontWeight: 500 }}>{label}</h4>
      </div>
      <BulletList items={items} />
    </div>
  );
}

export function PositioningCanvas({ positioning }) {
  const o = safeObj(positioning);
  const blocks = [
    { label: "For",            value: o.for_audience || o.audience || "—" },
    { label: "Who",            value: o.who_need || o.need || "—" },
    { label: "Our",            value: o.our_product || o.product || "—" },
    { label: "Provides",       value: o.provides || o.benefit || "—" },
    { label: "Unlike",         value: o.unlike || o.alternative || "—" },
    { label: "Our product",    value: o.differentiator || o.unique || "—" },
  ];
  return (
    <div className="rounded-[16px] border border-move-border bg-move-surface p-5" data-testid="positioning-canvas">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {blocks.map((b) => (
          <div key={b.label} className="rounded-[12px] border border-dashed border-move-border bg-move-bg-subtle/60 p-3">
            <div className="text-[11px] uppercase tracking-wider text-move-grad-2 font-medium" style={{ fontWeight: 500 }}>{b.label}</div>
            <div className="text-sm text-move-ink mt-0.5 leading-relaxed">{b.value}</div>
          </div>
        ))}
      </div>
      {o.statement && (
        <div className="mt-4 pt-4 border-t border-move-border">
          <div className="text-[11px] uppercase tracking-wider text-move-muted mb-1">Positioning statement</div>
          <p className="text-base font-medium text-move-ink leading-snug" style={{ fontWeight: 500 }}>{o.statement}</p>
        </div>
      )}
    </div>
  );
}

export function MessagingPyramid({ messaging }) {
  const o = safeObj(messaging);
  const headline = o.value_prop || o.headline || o.tagline;
  const pillars  = safeArr(o.pillars).slice(0, 3);
  const proofs   = safeArr(o.proof_points || o.proofs);
  if (!headline && pillars.length === 0 && proofs.length === 0) return null;
  return (
    <div className="rounded-[16px] border border-move-border bg-move-surface p-5 space-y-4" data-testid="messaging-pyramid">
      {headline && (
        <div className="rounded-[12px] bg-gradient-to-r from-move-grad-1 via-move-grad-2 to-move-grad-3 text-white p-5 text-center">
          <div className="text-[11px] uppercase tracking-wider opacity-80 mb-1.5">Headline value prop</div>
          <p className="text-lg font-medium leading-snug" style={{ fontWeight: 500 }}>{headline}</p>
        </div>
      )}
      {pillars.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pillars.map((p, i) => {
            const obj = typeof p === "string" ? { label: p } : safeObj(p);
            return (
              <div key={i} className="rounded-[12px] border border-move-border bg-move-bg-subtle p-4">
                <div className="text-[11px] uppercase tracking-wider text-move-grad-2 font-medium mb-1" style={{ fontWeight: 500 }}>Pillar {i + 1}</div>
                <div className="text-sm font-medium text-move-ink" style={{ fontWeight: 500 }}>{obj.label || obj.title || obj.name || ""}</div>
                {obj.description && <div className="text-sm text-move-body mt-1 leading-relaxed">{obj.description}</div>}
              </div>
            );
          })}
        </div>
      )}
      {proofs.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-wider text-move-muted mb-2">Proof points</div>
          <div className="flex flex-wrap gap-1.5">
            {proofs.slice(0, 8).map((p, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-move-bg-subtle border border-move-border text-move-body">{typeof p === "string" ? p : (p?.label || "")}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function StrategicPriorities({ priorities = [] }) {
  const list = safeArr(priorities);
  if (list.length === 0) return null;
  return (
    <ol className="space-y-3" data-testid="strategic-priorities">
      {list.map((p, i) => {
        const o = typeof p === "string" ? { label: p } : safeObj(p);
        return (
          <li key={i} className="rounded-[16px] border border-move-border bg-move-surface p-4 flex gap-4" data-testid={`priority-${i}`}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-move-grad-1 via-move-grad-2 to-move-grad-3 text-white flex items-center justify-center shrink-0 font-medium" style={{ fontWeight: 500 }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-medium text-move-ink" style={{ fontWeight: 500 }}>{o.label || o.title || o.name || ""}</div>
              {o.description && <p className="text-sm text-move-body mt-1 leading-relaxed">{o.description}</p>}
              {Array.isArray(o.kpis) && o.kpis.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {o.kpis.slice(0, 4).map((k, j) => (
                    <span key={j} className="text-[11px] px-2 py-0.5 rounded-full bg-move-grad-2-tint text-move-grad-2 border border-move-grad-2/30">{typeof k === "string" ? k : (k?.label || "")}</span>
                  ))}
                </div>
              )}
            </div>
            {o.owner && (
              <span className="text-[11px] px-2 py-0.5 rounded-full border border-move-border bg-move-bg-subtle text-move-muted h-fit shrink-0">{o.owner}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// CONTENT VISUALS
// ───────────────────────────────────────────────────────────────────────────────

export function ExpandableContentCard({ heading, meta, body, footer, testId }) {
  const [open, setOpen] = useState(false);
  const preview = (body || "").slice(0, 220);
  const long = (body || "").length > 220;
  return (
    <article className="rounded-[16px] border border-move-border bg-move-surface overflow-hidden" data-testid={testId}>
      <header className="px-5 py-3.5 border-b border-move-border bg-move-bg-subtle flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium text-base text-move-ink leading-snug" style={{ fontWeight: 500 }}>{heading}</div>
          {meta && <div className="text-sm text-move-muted mt-0.5">{meta}</div>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => { navigator.clipboard?.writeText(body || ""); }}
                  className="text-xs px-2 py-1 rounded-md hover:bg-move-bg-subtle text-move-muted hover:text-move-ink"
                  data-testid={`${testId}-copy`}>Copy</button>
          {long && (
            <button onClick={() => setOpen((v) => !v)}
                    className="text-xs px-2 py-1 rounded-md hover:bg-move-bg-subtle text-move-muted hover:text-move-ink flex items-center gap-1"
                    data-testid={`${testId}-toggle`}>
              {open ? <>Less <ChevronUp className="w-3 h-3" /></> : <>More <ChevronDown className="w-3 h-3" /></>}
            </button>
          )}
        </div>
      </header>
      <div className="px-5 py-4">
        <pre className="text-sm text-move-ink leading-relaxed whitespace-pre-wrap font-sans">
          {open || !long ? body : `${preview}${long ? "…" : ""}`}
        </pre>
        {footer && <div className="mt-3 pt-3 border-t border-move-border text-sm text-move-muted">{footer}</div>}
      </div>
    </article>
  );
}

// Aliases for nicer call-sites.
export { Target, Building2 };
