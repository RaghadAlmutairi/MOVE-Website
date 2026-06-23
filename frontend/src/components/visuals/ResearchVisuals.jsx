// Research-page-only visual primitives. Pure visualisation — these components
// only render data that already exists in the report; they never compute,
// score, rank, or synthesise new fields. If data is missing, the component
// renders nothing (the caller is also expected to hide its parent section).

import { useState, useMemo } from "react";
import {
  ChevronDown, ChevronUp, ShieldCheck, AlertTriangle, TrendingUp, Trophy, Users,
  Building2, ExternalLink, Lightbulb, Compass,
} from "lucide-react";

const arr = (v) => (Array.isArray(v) ? v : []);
const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});

// Strip inline citation markers like "[6]", "[48][2]" from any displayed
// text. Citations belong in the Sources drawer only — never in the UI body.
const CITATION_RE = /\s*\[(?:\d+(?:,\s*\d+)*)\](?:\s*\[(?:\d+(?:,\s*\d+)*)\])*/g;
export const stripCitations = (s) =>
  (typeof s === "string" ? s.replace(CITATION_RE, "").replace(/\s+([.,;:!?])/g, "$1").trim() : "");

// ── EXECUTIVE SUMMARY ────────────────────────────────────────────────────────
export function ResearchExecutiveSummary({ text }) {
  const clean = stripCitations(text);
  if (!clean) return null;
  return (
    <Section id="executive-summary" title="Executive summary" icon={Lightbulb}>
      <div className="rounded-[20px] border border-move-border bg-gradient-to-br from-move-grad-1-tint via-move-surface to-move-grad-3-tint p-7 md:p-9" data-testid="research-exec-summary">
        <p className="text-lg md:text-xl text-move-ink leading-relaxed whitespace-pre-wrap" style={{ fontWeight: 400 }}>{clean}</p>
      </div>
    </Section>
  );
}

// ── SWOT 2 × 2 ───────────────────────────────────────────────────────────────
export function SWOTMatrix({ swot }) {
  const o = obj(swot);
  const tiles = [
    { key: "strengths",     label: "Strengths",     items: arr(o.strengths),     tone: "success", icon: ShieldCheck },
    { key: "weaknesses",    label: "Weaknesses",    items: arr(o.weaknesses),    tone: "error",   icon: AlertTriangle },
    { key: "opportunities", label: "Opportunities", items: arr(o.opportunities), tone: "grad",    icon: TrendingUp },
    { key: "threats",       label: "Threats",       items: arr(o.threats),       tone: "warn",    icon: Trophy },
  ];
  if (tiles.every((t) => t.items.length === 0)) return null;

  return (
    <Section id="swot" title="SWOT analysis" icon={ShieldCheck}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-testid="research-swot-matrix">
        {tiles.map((t) => (
          <SwotQuadrant key={t.key} {...t} />
        ))}
      </div>
    </Section>
  );
}
function SwotQuadrant({ label, items, tone, icon: Icon }) {
  const cls = tone === "success" ? "border-move-success/30 bg-move-success-bg"
            : tone === "error"   ? "border-move-error/30 bg-move-error-bg"
            : tone === "warn"    ? "border-move-warning/30 bg-move-warning-bg"
            :                       "border-move-grad-2/30 bg-move-grad-2-tint";
  const tcls = tone === "success" ? "text-move-success"
             : tone === "error"   ? "text-move-error"
             : tone === "warn"    ? "text-move-warning"
             :                       "text-move-grad-2";
  return (
    <div className={`rounded-[16px] border ${cls} p-6 min-h-[180px]`} data-testid={`swot-${label.toLowerCase()}`}>
      <header className={`flex items-center gap-2 mb-3 ${tcls}`}>
        <Icon className="w-4 h-4" />
        <h3 className="text-base font-medium text-move-ink" style={{ fontWeight: 500 }}>{label}</h3>
        <span className="ml-auto text-xs text-move-muted">{items.length}</span>
      </header>
      {items.length === 0
        ? <p className="text-sm text-move-muted">—</p>
        : <ul className="space-y-2">
            {items.map((it, i) => {
              const text = stripCitations(typeof it === "string" ? it : (it?.point || it?.label || ""));
              if (!text) return null;
              return (
                <li key={i} className="flex gap-2 text-sm text-move-body leading-relaxed">
                  <span className={`shrink-0 mt-1.5 ${tcls}`}>•</span>
                  <span>{text}</span>
                </li>
              );
            })}
          </ul>}
    </div>
  );
}

// ── EXPANDABLE INSIGHT CARDS (Opportunities / Risks / Recommendations) ───────
export function InsightCardList({ items, tone = "grad", testIdPrefix }) {
  const list = arr(items)
    .map((s) => stripCitations(typeof s === "string" ? s : (s?.point || s?.label || "")))
    .filter(Boolean);
  if (list.length === 0) return null;
  return (
    <div className="space-y-3" data-testid={`${testIdPrefix}-list`}>
      {list.map((text, i) => (
        <ExpandableInsightCard key={i} text={text} tone={tone} index={i + 1} testId={`${testIdPrefix}-${i}`} />
      ))}
    </div>
  );
}
function ExpandableInsightCard({ text, tone, index, testId }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 180;
  const preview = long ? `${text.slice(0, 180).trim()}…` : text;
  const dot = tone === "success" ? "bg-move-success"
            : tone === "error"   ? "bg-move-error"
            : tone === "warn"    ? "bg-move-warning"
            :                       "bg-move-grad-2";
  return (
    <article className="rounded-[16px] border border-move-border bg-move-surface hover:border-move-grad-2 transition-colors" data-testid={testId}>
      <button onClick={() => long && setOpen((v) => !v)} className="w-full text-left p-5 flex items-start gap-4 group" disabled={!long}>
        <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium text-white ${dot}`} style={{ fontWeight: 500 }}>
          {String(index).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-base text-move-ink leading-relaxed" style={{ fontWeight: 400 }}>{open ? text : preview}</p>
        </div>
        {long && (
          <span className="shrink-0 text-move-muted group-hover:text-move-ink mt-1">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        )}
      </button>
    </article>
  );
}

// ── COMPETITORS TABLE ────────────────────────────────────────────────────────
export function CompetitorsTable({ companyCompetitors, productCompetitors, alternatives }) {
  const rows = useMemo(() => {
    const out = [];
    arr(companyCompetitors).forEach((c) => out.push({ type: "Company", ...obj(c) }));
    arr(productCompetitors).forEach((c) => out.push({ type: "Product", ...obj(c) }));
    arr(alternatives).forEach((c) => out.push({ type: "Alternative", ...obj(c) }));
    return out;
  }, [companyCompetitors, productCompetitors, alternatives]);

  if (rows.length === 0) return null;

  return (
    <Section id="competitors" title="Competitors" icon={Building2}>
      <div className="rounded-[16px] border border-move-border bg-move-surface overflow-hidden" data-testid="research-competitors-table">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-move-border bg-move-bg-subtle">
                <Th>Competitor</Th>
                <Th>Type</Th>
                <Th>Directness</Th>
                <Th className="min-w-[280px]">Value proposition</Th>
                <Th className="min-w-[220px]">Target audience</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <tr key={`${c.name}-${i}`} className="border-b border-move-border last:border-0 hover:bg-move-bg-subtle/40" data-testid={`competitor-row-${i}`}>
                  <td className="px-5 py-4 align-top">
                    <div className="font-medium text-move-ink" style={{ fontWeight: 500 }}>{c.name || "—"}</div>
                    {c.official_website && (
                      <a href={c.official_website} target="_blank" rel="noreferrer" className="text-xs text-move-grad-3 hover:text-move-ink inline-flex items-center gap-1 mt-1">
                        <ExternalLink className="w-3 h-3" /> {c.official_website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    )}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span className="text-[11px] px-2 py-0.5 rounded-full border border-move-border bg-move-bg-subtle text-move-muted">{c.type}</span>
                  </td>
                  <td className="px-5 py-4 align-top text-move-body">{c.directness || "—"}</td>
                  <td className="px-5 py-4 align-top text-move-body leading-relaxed">{stripCitations(c.value_proposition) || "—"}</td>
                  <td className="px-5 py-4 align-top text-move-body leading-relaxed">{stripCitations(c.target_audience) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}
function Th({ children, className = "" }) {
  return <th className={`px-5 py-3 text-left font-medium text-move-ink whitespace-nowrap ${className}`} style={{ fontWeight: 500 }}>{children}</th>;
}

// ── PERSONA CARDS ────────────────────────────────────────────────────────────
export function PersonaCards({ personas }) {
  const list = arr(personas);
  if (list.length === 0) return null;
  return (
    <Section id="personas" title="Buyer personas" icon={Users}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" data-testid="research-personas">
        {list.map((p, i) => <PersonaCard key={i} persona={p} index={i} />)}
      </div>
    </Section>
  );
}
function PersonaCard({ persona, index }) {
  const p = obj(persona);
  return (
    <article className="rounded-[16px] border border-move-border bg-move-surface p-6" data-testid={`persona-card-${index}`}>
      <header className="flex items-start gap-3 mb-4">
        <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-move-grad-1-tint to-move-grad-3-tint flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-move-grad-2" />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-move-ink leading-tight" style={{ fontWeight: 500 }}>{stripCitations(p.persona_name) || `Persona ${index + 1}`}</h3>
          {p.role_title && <div className="text-sm text-move-body mt-0.5">{stripCitations(p.role_title)}</div>}
          {p.segment && <div className="text-xs text-move-muted mt-1 leading-relaxed">{stripCitations(p.segment)}</div>}
        </div>
        {p.decision_power && p.decision_power !== "UNKNOWN" && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-move-grad-2-tint text-move-grad-2 border border-move-grad-2/30 shrink-0">
            {String(p.decision_power).toLowerCase()} influence
          </span>
        )}
      </header>

      <PersonaList label="Goals"        items={p.goals}           tone="success" />
      <PersonaList label="Pain points"  items={mapPainPoints(p.pain_points)} tone="error" />
      <PersonaList label="Buying triggers" items={p.buying_triggers} tone="grad" />

      {Array.isArray(p.channels) && p.channels.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] uppercase tracking-wider text-move-muted mb-1.5">Channels</div>
          <div className="flex flex-wrap gap-1.5">
            {p.channels.map((c, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-move-bg-subtle border border-move-border text-move-body">{c}</span>
            ))}
          </div>
        </div>
      )}
      {p.messaging_angle && (
        <div className="mt-4 pt-4 border-t border-move-border text-sm">
          <span className="text-move-muted">Messaging angle: </span>
          <span className="text-move-ink">{stripCitations(p.messaging_angle)}</span>
        </div>
      )}
    </article>
  );
}
function mapPainPoints(items) {
  return arr(items).map((it) => (typeof it === "string" ? it : (it?.pain || it?.label || "")));
}
function PersonaList({ label, items, tone }) {
  const list = arr(items).map((s) => stripCitations(typeof s === "string" ? s : (s?.label || s?.pain || ""))).filter(Boolean);
  if (list.length === 0) return null;
  const dot = tone === "success" ? "text-move-success"
            : tone === "error"   ? "text-move-error"
            :                       "text-move-grad-2";
  return (
    <div className="mt-3">
      <div className="text-[11px] uppercase tracking-wider text-move-muted mb-1.5">{label}</div>
      <ul className="space-y-1">
        {list.slice(0, 5).map((s, i) => (
          <li key={i} className="text-sm text-move-body leading-relaxed flex gap-2">
            <span className={`shrink-0 mt-1.5 ${dot}`}>•</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── MARKET TRENDS (clean bullet list, no scoring) ────────────────────────────
export function TrendList({ items }) {
  const list = arr(items).map(stripCitations).filter(Boolean);
  if (list.length === 0) return null;
  return (
    <Section id="trends" title="Market trends" icon={TrendingUp}>
      <ul className="rounded-[16px] border border-move-border bg-move-surface p-6 space-y-3" data-testid="research-trends">
        {list.map((t, i) => (
          <li key={i} className="flex gap-3 text-base text-move-body leading-relaxed" data-testid={`trend-${i}`}>
            <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-move-grad-2" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ── SECTION WRAPPER (generic) ────────────────────────────────────────────────
export function Section({ id, title, icon: Icon, children, action }) {
  return (
    <section id={id} className="scroll-mt-32 mb-12" data-testid={`section-${id}`}>
      <header className="flex items-center gap-3 mb-5">
        {Icon && (
          <span className="w-8 h-8 rounded-lg bg-move-bg-subtle border border-move-border flex items-center justify-center text-move-ink">
            <Icon className="w-4 h-4" />
          </span>
        )}
        <h2 className="text-2xl md:text-[28px] font-medium text-move-ink tracking-tight" style={{ fontWeight: 500 }}>{title}</h2>
        {action && <div className="ml-auto">{action}</div>}
      </header>
      {children}
    </section>
  );
}

// ── EXPORTS ──────────────────────────────────────────────────────────────────
export { Compass };
