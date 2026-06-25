// Strategy-page visualisations. Each component renders ONLY the fields the
// strategy agent actually returns; if a field is missing, the row/section is
// hidden. Tables match the agent's JSON shape (channel_plays, roadmap_90day
// workstreams, metrics, risks, etc.).
import { Sparkles, Target, TrendingUp, AlertTriangle, Users, BadgeCheck } from "lucide-react";

const arr = (v) => (Array.isArray(v) ? v : []);
const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
const s = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));

// ── Re-usable bits ──────────────────────────────────────────────────────────
export function KV({ label, value }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="rounded-[10px] border border-dashed border-move-border bg-move-bg-subtle/60 p-3">
      <div className="text-[10px] uppercase tracking-wider text-move-grad-2 font-medium" style={{ fontWeight: 500 }}>{label}</div>
      {Array.isArray(value)
        ? <ul className="mt-1 space-y-1 text-sm text-move-ink leading-relaxed">{value.map((x, i) => <li key={`${s(x)}-${i}`} className="flex gap-1.5"><span className="text-move-grad-2 shrink-0">•</span><span>{s(x)}</span></li>)}</ul>
        : <p className="text-sm text-move-ink mt-0.5 leading-relaxed">{s(value)}</p>}
    </div>
  );
}

function Th({ children }) { return <th className="px-4 py-2.5 text-left text-[12px] font-medium text-move-ink whitespace-nowrap" style={{ fontWeight: 500 }}>{children}</th>; }
function Td({ children }) { return <td className="px-4 py-3 align-top text-sm text-move-body leading-relaxed">{children || "—"}</td>; }

export function Table({ columns, rows, getCell, testId }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="rounded-[12px] border border-move-border bg-move-surface overflow-hidden" data-testid={testId}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-move-border bg-move-bg-subtle">{columns.map((c) => <Th key={c}>{c}</Th>)}</tr></thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row?.id || row?.name || `row-${i}`} className="border-b border-move-border last:border-0">
                {columns.map((c) => <Td key={c}>{getCell(row, c, i)}</Td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Foundation: Positioning + Slot statement (For/Who/Category/Promise/…) ────
export function PositioningPanel({ positioning, slot }) {
  const p = obj(slot);
  const blocks = [
    ["For who",  p.for_who],
    ["Who need", p.who_need],
    ["Category", p.category],
    ["Promise",  p.promise],
    ["Unlike",   p.unlike],
    ["Proof",    p.proof],
  ].filter(([, v]) => !!v);
  return (
    <div className="space-y-4">
      {positioning && (
        <div className="rounded-[12px] bg-gradient-to-r from-move-grad-1-tint via-move-grad-2-tint to-move-grad-3-tint p-5">
          <div className="text-[11px] uppercase tracking-wider text-move-grad-2 font-medium mb-1.5" style={{ fontWeight: 500 }}>Positioning statement</div>
          <p className="text-base md:text-lg text-move-ink leading-snug" style={{ fontWeight: 400 }}>{positioning}</p>
        </div>
      )}
      {blocks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {blocks.map(([k, v]) => <KV key={k} label={k} value={v} />)}
        </div>
      )}
    </div>
  );
}

// ── ICP, Beachhead, Disqualifiers, Triggers, Pains, Secondary segments ───────
export function ICPPanel({ icp, topPains, triggers, disqualifiers, secondarySegments, beachhead }) {
  const i = obj(icp);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <KV label="Primary segment" value={i.title || i.segment || i.primary_segment} />
        <KV label="Firmographics" value={i.firmographics} />
        <KV label="Technographics" value={i.technographics} />
        <KV label="Why now" value={i.why_now} />
        <KV label="Buying committee" value={i.buying_committee} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <KV label="Top pains" value={topPains} />
        <KV label="Trigger events" value={triggers} />
        <KV label="Disqualifiers" value={disqualifiers} />
        <KV label="Secondary segments" value={secondarySegments} />
      </div>
      {beachhead && (beachhead.segment || beachhead.rationale) && (
        <div className="rounded-[12px] border border-move-border bg-move-surface p-4">
          <div className="text-[11px] uppercase tracking-wider text-move-grad-3 font-medium mb-1.5" style={{ fontWeight: 500 }}>Beachhead</div>
          {beachhead.segment   && <div className="text-sm text-move-ink"><span className="text-move-muted">Segment:</span> {s(beachhead.segment)}</div>}
          {beachhead.rationale && <div className="text-sm text-move-body mt-1 leading-relaxed">{s(beachhead.rationale)}</div>}
        </div>
      )}
    </div>
  );
}

// ── Competitive edges table ──────────────────────────────────────────────────
export function CompetitiveEdgeTable({ edges }) {
  const rows = arr(edges);
  return (
    <Table
      columns={["Competitor", "Where we win", "Where they win", "Sharpest message"]}
      rows={rows}
      getCell={(e, c) => {
        const o = typeof e === "string" ? { sharpest_message: e } : obj(e);
        if (c === "Competitor")       return o.competitor || o.against || o.name || "—";
        if (c === "Where we win")     return o.where_we_win || o.we_win || (Array.isArray(o.wins) ? o.wins.join(", ") : "");
        if (c === "Where they win")   return o.where_they_win || o.they_win || (Array.isArray(o.losses) ? o.losses.join(", ") : "");
        if (c === "Sharpest message") return o.sharpest_message || o.message || o.edge || o.label || "";
        return "";
      }}
      testId="competitive-edge-table"
    />
  );
}

// ── Pricing & Packaging ──────────────────────────────────────────────────────
export function PricingPanel({ pricing }) {
  const p = obj(pricing);
  const tiers = arr(p.tiers);
  if (!p.packaging && !p.anchor && tiers.length === 0) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <KV label="Packaging" value={p.packaging} />
        <KV label="Anchor"    value={p.anchor} />
      </div>
      {tiers.length > 0 && (
        <Table
          columns={["Tier", "Price / mode", "Includes"]}
          rows={tiers}
          getCell={(t, c) => {
            const o = typeof t === "string" ? { name: t } : obj(t);
            if (c === "Tier")          return o.name || o.tier || "";
            if (c === "Price / mode")  return o.price || o.mode || o.unit || "";
            if (c === "Includes")      return Array.isArray(o.includes) ? o.includes.join(" · ") : (o.includes || o.summary || "");
            return "";
          }}
          testId="pricing-tiers-table"
        />
      )}
    </div>
  );
}

// ── GTM Motion (primary / secondary / rationale / risks) ─────────────────────
export function MotionPanel({ motion }) {
  const m = obj(motion);
  if (!m.primary && !m.secondary && !m.rationale && !(arr(m.risks).length)) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <KV label="Primary motion"   value={m.primary} />
      <KV label="Secondary motion" value={m.secondary} />
      <KV label="Rationale"        value={m.rationale} />
      <KV label="Risks"            value={arr(m.risks)} />
    </div>
  );
}

// ── Channel plays table ──────────────────────────────────────────────────────
export function ChannelPlaysTable({ plays }) {
  return (
    <Table
      columns={["Channel", "Funnel role", "Leading indicator", "Invest"]}
      rows={arr(plays)}
      getCell={(p, c) => {
        const o = obj(p);
        if (c === "Channel")           return o.channel || "";
        if (c === "Funnel role")       return o.funnel_role || o.role || "";
        if (c === "Leading indicator") return o.leading_indicator || o.kpi || "";
        if (c === "Invest")            return o.invest || o.tier || "";
        return "";
      }}
      testId="channel-plays-table"
    />
  );
}

// ── Messaging by Persona ─────────────────────────────────────────────────────
export function MessagingByPersonaList({ list }) {
  const items = arr(list);
  if (items.length === 0) return null;
  return (
    <div className="space-y-3">
      {items.map((p, i) => {
        const o = obj(p);
        return (
          <div key={o.persona || o.name || `messaging-${i}`} className="rounded-[12px] border border-move-border bg-move-surface p-5" data-testid={`messaging-${i}`}>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-move-grad-2" />
              <div className="text-base font-medium text-move-ink" style={{ fontWeight: 500 }}>{o.persona || o.name || `Persona ${i + 1}`}</div>
            </div>
            {(o.headline || o.core_promise || o.message) && (
              <p className="text-sm text-move-ink leading-relaxed mb-3">{s(o.headline || o.core_promise || o.message)}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <KV label="Channel"    value={o.channel || o.channels} />
              <KV label="CTA"        value={o.cta} />
              <KV label="Pillars"    value={arr(o.pillars)} />
              <KV label="Objections" value={arr(o.objections)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Content Engine ───────────────────────────────────────────────────────────
export function ContentEnginePanel({ engine }) {
  const e = obj(engine);
  const blocks = [
    ["Cadence",      e.cadence],
    ["Distribution", e.distribution],
    ["TOFU",         e.tofu],
    ["MOFU",         e.mofu],
    ["BOFU",         e.bofu],
  ].filter(([, v]) => !!v);
  if (blocks.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {blocks.map(([k, v]) => <KV key={k} label={k} value={v} />)}
    </div>
  );
}

// ── Sales Playbook ───────────────────────────────────────────────────────────
export function SalesPlaybookPanel({ playbook }) {
  const p = obj(playbook);
  const stages = arr(p.stages);
  if (!p.qualification && stages.length === 0) return null;
  return (
    <div className="space-y-4">
      <KV label="Qualification" value={p.qualification} />
      {stages.length > 0 && (
        <Table
          columns={["Stage", "Objective", "Exit criteria"]}
          rows={stages}
          getCell={(st, c) => {
            const o = obj(st);
            if (c === "Stage")          return o.stage || o.name || "";
            if (c === "Objective")      return o.objective || "";
            if (c === "Exit criteria")  return o.exit_criteria || o.exit || "";
            return "";
          }}
          testId="sales-stages-table"
        />
      )}
    </div>
  );
}

// ── Demand-Gen Mix ───────────────────────────────────────────────────────────
export function DemandGenPanel({ demand }) {
  const d = obj(demand);
  const blocks = [
    ["Paid",      d.paid],
    ["Organic",   d.organic],
    ["ABM",       d.abm],
    ["Community", d.community],
    ["Partner",   d.partner],
    ["Campaigns", d.campaigns],
  ].filter(([, v]) => !!(v && (Array.isArray(v) ? v.length : String(v).trim())));
  if (blocks.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {blocks.map(([k, v]) => <KV key={k} label={k} value={v} />)}
    </div>
  );
}

// ── Metrics & North Star ─────────────────────────────────────────────────────
export function MetricsPanel({ metrics, northStar }) {
  const m = obj(metrics);
  const groups = [
    ["Input metrics", arr(m.input_metrics)],
    ["Funnel KPIs",   arr(m.funnel_kpis)],
    ["Health metrics", arr(m.health_metrics)],
  ].filter(([, rows]) => rows.length > 0);
  return (
    <div className="space-y-5">
      {(northStar || m.north_star_metric || m.north_star_why) && (
        <div className="rounded-[12px] border border-move-grad-3/40 bg-move-grad-3-tint p-5">
          <div className="text-[11px] uppercase tracking-wider text-move-grad-3 font-medium mb-1.5" style={{ fontWeight: 500 }}>North star</div>
          {(m.north_star_metric || northStar) && (
            <p className="text-base font-medium text-move-ink leading-snug" style={{ fontWeight: 500 }}>{s(m.north_star_metric || northStar)}</p>
          )}
          {m.north_star_why && <p className="text-sm text-move-body mt-1 leading-relaxed">{s(m.north_star_why)}</p>}
        </div>
      )}
      {groups.map(([title, rows]) => (
        <div key={title}>
          <div className="text-[11px] uppercase tracking-wider text-move-muted font-medium mb-2" style={{ fontWeight: 500 }}>{title}</div>
          <Table
            columns={["Metric", "Target band", "Cadence"]}
            rows={rows}
            getCell={(r, c) => {
              const o = obj(r);
              if (c === "Metric")      return o.metric || o.name || "";
              if (c === "Target band") return o.target_band || o.target || "";
              if (c === "Cadence")     return o.cadence || o.frequency || "";
              return "";
            }}
            testId={`metrics-${title.toLowerCase().replace(/\s+/g, "-")}-table`}
          />
        </div>
      ))}
    </div>
  );
}

// ── 90-day Execution Roadmap ────────────────────────────────────────────────
export function RoadmapPanel({ phases }) {
  const list = arr(phases);
  if (list.length === 0) return null;
  return (
    <div className="space-y-5">
      {list.map((ph, i) => {
        const o = obj(ph);
        const ws = arr(o.workstreams);
        return (
          <div key={i} className="rounded-[12px] border border-move-border bg-move-surface overflow-hidden" data-testid={`roadmap-phase-${i}`}>
            <div className="px-5 py-3 border-b border-move-border bg-move-bg-subtle">
              <div className="flex items-baseline gap-3">
                <span className="text-base font-medium text-move-ink" style={{ fontWeight: 500 }}>{s(o.phase) || `Phase ${i + 1}`}</span>
                {o.objective && <span className="text-sm text-move-body">{s(o.objective)}</span>}
              </div>
            </div>
            {ws.length > 0 ? (
              <Table
                columns={["Workstream", "Deliverable", "Owner", "Success signal"]}
                rows={ws}
                getCell={(r, c) => {
                  const x = obj(r);
                  if (c === "Workstream")     return x.workstream || x.name || "";
                  if (c === "Deliverable")    return x.deliverable || "";
                  if (c === "Owner")          return x.owner || "";
                  if (c === "Success signal") return x.success_signal || x.signal || "";
                  return "";
                }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

// ── Risks ───────────────────────────────────────────────────────────────────
export function RisksTable({ risks }) {
  return (
    <Table
      columns={["Risk", "Likelihood", "Impact", "Mitigation", "Owner"]}
      rows={arr(risks)}
      getCell={(r, c) => {
        const o = obj(r);
        if (c === "Risk")        return o.risk || o.label || "";
        if (c === "Likelihood")  return o.likelihood || "";
        if (c === "Impact")      return o.impact || "";
        if (c === "Mitigation")  return o.mitigation || "";
        if (c === "Owner")       return o.owner || "";
        return "";
      }}
      testId="strategy-risks-table"
    />
  );
}

// Icons re-exported so the parent doesn't import twice.
export { Sparkles, Target, TrendingUp, AlertTriangle, BadgeCheck };
