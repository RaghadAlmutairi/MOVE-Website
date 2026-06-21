import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Crosshair, MessageSquare, Radio, GitBranch, CalendarDays, BarChart3,
  Check, ArrowRight, Sparkles, ChevronRight, AlertTriangle, ShieldAlert, ExternalLink,
} from "lucide-react";
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRun } from "@/lib/RunContext";
import { getStrategyView } from "@/lib/transforms";

const SECTIONS = [
  { id: "overview",     label: "Overview",   icon: LayoutDashboard },
  { id: "icp",          label: "ICP",        icon: Users },
  { id: "positioning",  label: "Positioning", icon: Crosshair },
  { id: "messaging",    label: "Messaging",  icon: MessageSquare },
  { id: "channels",     label: "Channels",   icon: Radio },
  { id: "playbook",     label: "Playbook",   icon: GitBranch },
  { id: "roadmap",      label: "Roadmap",    icon: CalendarDays },
  { id: "metrics",      label: "Metrics",    icon: BarChart3 },
];

export default function CommandCenter() {
  const navigate = useNavigate();
  const { run } = useRun();
  const [active, setActive] = useState("overview");
  const result = run?.result;
  const v = useMemo(() => (result ? getStrategyView(result) : null), [result]);

  if (!run) return <Shell><EmptyState title="No active run" desc="Start research first." cta="Start Research" onClick={() => navigate("/research")} /></Shell>;
  if (!v) return <Shell><EmptyState title="Strategy not generated yet" desc="The strategy agent must complete first. Return to Strategy & Content to monitor." cta="Open Strategy" onClick={() => navigate("/ideation")} /></Shell>;

  return (
    <div className="min-h-screen bg-ink-bg">
      <TopNav />
      <div className="flex max-w-[1600px] mx-auto">
        <aside className="hidden lg:flex w-56 shrink-0 border-r border-ink-border min-h-[calc(100vh-4rem)] flex-col p-4 sticky top-16">
          <div className="px-2 mb-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">Strategy</div>
            <div className="font-heading text-sm font-medium mt-1 text-ink-text truncate">{run.query}</div>
          </div>
          <nav className="space-y-0.5 mt-3">
            {SECTIONS.map((s) => {
              const Active = s.id === active;
              return (
                <button key={s.id} data-testid={`sidebar-${s.id}`} onClick={() => setActive(s.id)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${Active ? "bg-brand-primary/15 text-brand-primary border-l-2 border-brand-primary" : "text-ink-muted hover:text-ink-text hover:bg-ink-surface"}`}>
                  <s.icon className="w-4 h-4" /> {s.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 px-6 lg:px-8 py-8 pb-32">
          <div className="flex items-center gap-2 text-xs text-ink-muted mb-5">
            <Link to="/" className="hover:text-ink-text transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/ideation" className="hover:text-ink-text transition-colors">Strategy</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-ink-text">Command Center</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <Badge variant="outline" className="border-brand-accent/40 text-brand-accent bg-brand-accent/10 mb-3 text-[10px]"><Sparkles className="w-3 h-3 mr-1" /> GTM strategy</Badge>
              <h1 className="font-heading text-4xl font-semibold tracking-tight text-ink-text">{v.northStar || "GTM Strategy"}</h1>
              <p className="text-ink-muted mt-1.5 max-w-2xl leading-relaxed">{v.foundation.positioning || ""}</p>
            </div>
            <Button onClick={() => navigate("/studio")} data-testid="cc-go-studio" className="bg-brand-primary hover:bg-[#9333EA] text-white">
              Open Content Studio <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {/* Section: Overview */}
          <SectionWrap id="overview" title="Foundation summary" icon={LayoutDashboard}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <KV title="Slot statement">
                {v.foundation.slot && (
                  <ul className="space-y-1 text-sm text-ink-text/90">
                    {v.foundation.slot.for_who && <li><span className="text-ink-muted">For:</span> {v.foundation.slot.for_who}</li>}
                    {v.foundation.slot.who_need && <li><span className="text-ink-muted">Need:</span> {v.foundation.slot.who_need}</li>}
                    {v.foundation.slot.category && <li><span className="text-ink-muted">Category:</span> {v.foundation.slot.category}</li>}
                    {v.foundation.slot.promise && <li><span className="text-ink-muted">Promise:</span> {v.foundation.slot.promise}</li>}
                    {v.foundation.slot.unlike && <li><span className="text-ink-muted">Unlike:</span> {v.foundation.slot.unlike}</li>}
                    {v.foundation.slot.proof && <li><span className="text-ink-muted">Proof:</span> {v.foundation.slot.proof}</li>}
                  </ul>
                )}
              </KV>
              <KV title="Beachhead">
                {v.foundation.beachhead && (
                  <div className="space-y-2 text-sm text-ink-text/90">
                    {v.foundation.beachhead.segment && <p><span className="text-ink-muted">Segment:</span> {v.foundation.beachhead.segment}</p>}
                    {v.foundation.beachhead.rationale && <p className="line-clamp-4">{v.foundation.beachhead.rationale}</p>}
                    {v.foundation.beachhead.entry_wedge && <p><span className="text-ink-muted">Wedge:</span> {v.foundation.beachhead.entry_wedge}</p>}
                  </div>
                )}
              </KV>
            </div>
          </SectionWrap>

          {/* ICP */}
          <SectionWrap id="icp" title="Ideal Customer Profile" icon={Users}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <KV title="Primary segment"><p className="text-sm text-ink-text/90">{v.foundation.icp.primary_segment || "—"}</p></KV>
              <KV title="Why now"><p className="text-sm text-ink-text/90">{v.foundation.icp.why_now || "—"}</p></KV>
              <KV title="Firmographics"><p className="text-sm text-ink-text/90">{v.foundation.icp.firmographics || "—"}</p></KV>
              <KV title="Technographics"><p className="text-sm text-ink-text/90">{v.foundation.icp.technographics || "—"}</p></KV>
              {v.foundation.icp.buying_committee?.length > 0 && (
                <KV title="Buying committee"><div className="flex flex-wrap gap-1.5">{v.foundation.icp.buying_committee.map((c) => <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-ink-elevated border border-ink-border">{c}</span>)}</div></KV>
              )}
              {v.foundation.topPains?.length > 0 && (
                <KV title="Top pains"><ul className="space-y-1.5 text-sm text-ink-text/90">{v.foundation.topPains.map((p) => <li key={p}>• {p}</li>)}</ul></KV>
              )}
              {v.foundation.triggers?.length > 0 && (
                <KV title="Trigger events"><ul className="space-y-1.5 text-sm text-ink-text/90">{v.foundation.triggers.map((t) => <li key={t}>• {t}</li>)}</ul></KV>
              )}
              {v.foundation.disqualifiers?.length > 0 && (
                <KV title="Disqualifiers"><ul className="space-y-1.5 text-sm text-ink-text/90">{v.foundation.disqualifiers.map((t) => <li key={t}>• {t}</li>)}</ul></KV>
              )}
            </div>
          </SectionWrap>

          {/* Positioning */}
          <SectionWrap id="positioning" title="Positioning & differentiation" icon={Crosshair}>
            <div className="rounded-xl border border-ink-border bg-ink-surface p-5 mb-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2">Positioning statement</div>
              <p className="font-heading text-lg text-ink-text leading-snug">{v.foundation.positioning || "—"}</p>
            </div>
            {v.foundation.competitiveEdges?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {v.foundation.competitiveEdges.map((e) => (
                  <div key={e.competitor} className="rounded-xl border border-ink-border bg-ink-surface p-5">
                    <div className="text-xs text-ink-muted mb-1">vs.</div>
                    <div className="font-heading font-semibold text-ink-text mb-2">{e.competitor}</div>
                    {e.where_we_win?.length > 0 && <MiniList label="Where we win" items={e.where_we_win} tone="success" />}
                    {e.where_they_win?.length > 0 && <MiniList label="Where they win" items={e.where_they_win} tone="warning" />}
                    {e.sharpest_message && <div className="mt-2 text-xs text-ink-text/90 border-t border-ink-border pt-2"><span className="text-ink-muted">Sharpest msg:</span> {e.sharpest_message}</div>}
                  </div>
                ))}
              </div>
            )}
          </SectionWrap>

          {/* Messaging */}
          <SectionWrap id="messaging" title="Messaging by persona" icon={MessageSquare}>
            {v.activation.messagingByPersona?.length === 0 ? <EmptyText text="No persona-level messaging produced." /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {v.activation.messagingByPersona.map((m) => (
                  <div key={m.persona} className="rounded-xl border border-ink-border bg-ink-surface p-5">
                    <div className="font-heading font-semibold text-ink-text mb-1">{m.persona}</div>
                    {m.core_promise && <p className="text-sm text-ink-text/90 mb-2">{m.core_promise}</p>}
                    {m.primary_channel && <div className="text-xs text-ink-muted">Primary: {m.primary_channel}</div>}
                    {m.cta && <div className="text-xs text-ink-muted">CTA: {m.cta}</div>}
                    {m.pillars?.length > 0 && <MiniList label="Pillars" items={m.pillars} />}
                    {m.proof_points?.length > 0 && <MiniList label="Proof" items={m.proof_points} />}
                  </div>
                ))}
              </div>
            )}
          </SectionWrap>

          {/* Channels */}
          <SectionWrap id="channels" title="Channel plays" icon={Radio}>
            {v.activation.channelPlays?.length === 0 ? <EmptyText text="No channel plays produced." /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {v.activation.channelPlays.map((c) => (
                  <div key={c.channel} className="rounded-xl border border-ink-border bg-ink-surface p-5">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="font-heading font-semibold text-ink-text">{c.channel}</div>
                      {c.invest && <Badge variant="outline" className="border-ink-border text-ink-muted text-[10px]">{c.invest}</Badge>}
                    </div>
                    {c.funnel_role && <div className="text-xs text-brand-secondary mb-1">{c.funnel_role}</div>}
                    {c.why && <p className="text-sm text-ink-text/90 leading-relaxed line-clamp-4">{c.why}</p>}
                    {c.leading_indicator && <div className="text-[11px] text-ink-muted mt-2 border-t border-ink-border pt-2">Leading: {c.leading_indicator}</div>}
                  </div>
                ))}
              </div>
            )}
          </SectionWrap>

          {/* Playbook */}
          <SectionWrap id="playbook" title="Sales playbook" icon={GitBranch}>
            <div className="rounded-xl border border-ink-border bg-ink-surface p-5 mb-4">
              <div className="text-xs uppercase tracking-wider text-ink-muted mb-2">Qualification framework</div>
              <p className="text-sm text-ink-text/90">{v.execution.salesPlaybook.qualification_framework || "—"}</p>
            </div>
            {v.execution.salesPlaybook.stages?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {v.execution.salesPlaybook.stages.map((s) => (
                  <div key={s.stage} className="rounded-xl border border-ink-border bg-ink-surface p-5">
                    <div className="font-heading font-semibold text-ink-text mb-1">{s.stage}</div>
                    {s.objective && <p className="text-xs text-ink-muted mb-2">{s.objective}</p>}
                    {s.key_questions?.length > 0 && <MiniList label="Key questions" items={s.key_questions} />}
                    {s.exit_criteria && <div className="text-xs mt-2"><span className="text-ink-muted">Exit:</span> {s.exit_criteria}</div>}
                    {s.traps?.length > 0 && <MiniList label="Traps" items={s.traps} tone="warning" />}
                  </div>
                ))}
              </div>
            )}
          </SectionWrap>

          {/* Roadmap */}
          <SectionWrap id="roadmap" title="90-day roadmap" icon={CalendarDays}>
            {v.execution.roadmap?.length === 0 ? <EmptyText text="No roadmap produced." /> : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {v.execution.roadmap.map((p, i) => (
                  <motion.div key={p.phase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-xl border border-ink-border bg-ink-surface p-5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center font-heading font-bold text-white text-sm mb-3">{i + 1}</div>
                    <div className="text-[10px] uppercase tracking-wider text-brand-secondary">{p.phase}</div>
                    <p className="text-sm text-ink-text/90 mt-1 mb-3">{p.objective}</p>
                    {p.workstreams?.length > 0 && (
                      <ul className="space-y-1.5">
                        {p.workstreams.map((w) => (
                          <li key={w.workstream} className="text-xs text-ink-text/90">
                            <span className="text-brand-primary">{w.workstream}</span>
                            {w.deliverable && <span className="text-ink-muted"> — {w.deliverable}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </SectionWrap>

          {/* Metrics */}
          <SectionWrap id="metrics" title="Metrics plan" icon={BarChart3}>
            <div className="rounded-xl border border-ink-border bg-ink-surface p-5 mb-4">
              <div className="text-xs uppercase tracking-wider text-ink-muted mb-2">North-star metric</div>
              <div className="font-heading text-lg text-ink-text mb-1">{v.execution.metrics.north_star_metric || "—"}</div>
              {v.execution.metrics.north_star_why && <p className="text-sm text-ink-muted">{v.execution.metrics.north_star_why}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <MetricCol title="Input metrics" items={v.execution.metrics.input_metrics} />
              <MetricCol title="Funnel KPIs" items={v.execution.metrics.funnel_kpis} />
              <MetricCol title="Health metrics" items={v.execution.metrics.health_metrics} />
            </div>
          </SectionWrap>

          {v.execution.risks?.length > 0 && (
            <SectionWrap id="risks" title="Strategic risks" icon={ShieldAlert}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {v.execution.risks.map((r) => (
                  <div key={r.risk} className="rounded-xl border border-ink-border bg-ink-surface p-5">
                    <div className="font-heading font-semibold text-ink-text mb-1.5">{r.risk}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-ink-muted mb-2">
                      <div>Likelihood: <span className="text-ink-text">{r.likelihood || "—"}</span></div>
                      <div>Impact: <span className="text-ink-text">{r.impact || "—"}</span></div>
                    </div>
                    {r.mitigation && <p className="text-sm text-ink-text/90"><span className="text-ink-muted">Mitigation:</span> {r.mitigation}</p>}
                  </div>
                ))}
              </div>
            </SectionWrap>
          )}
        </main>
      </div>
    </div>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-ink-bg">
      <TopNav />
      <main className="max-w-3xl mx-auto px-6 py-24">{children}</main>
    </div>
  );
}

function EmptyState({ title, desc, cta, onClick }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-border bg-ink-surface/30 p-10 text-center">
      <Sparkles className="w-8 h-8 mx-auto mb-3 text-brand-accent" />
      <div className="font-heading text-lg text-ink-text">{title}</div>
      <p className="text-sm text-ink-muted mt-1 mb-4">{desc}</p>
      <Button onClick={onClick} data-testid="empty-cta" className="bg-brand-primary hover:bg-[#9333EA] text-white">{cta} <ArrowRight className="ml-2 w-4 h-4" /></Button>
    </div>
  );
}

function SectionWrap({ id, title, icon: Icon, children }) {
  return (
    <section id={id} className="mb-12 scroll-mt-20">
      <div className="flex items-center gap-2 mb-5">
        {Icon && <Icon className="w-4 h-4 text-brand-primary" />}
        <h2 className="font-heading text-xl font-semibold tracking-tight">{title}</h2>
        <div className="ml-3 h-px flex-1 bg-ink-border" />
      </div>
      {children}
    </section>
  );
}

function KV({ title, children }) {
  return (
    <div className="rounded-xl border border-ink-border bg-ink-surface p-5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2">{title}</div>
      {children}
    </div>
  );
}

function MiniList({ label, items, tone = "muted" }) {
  const toneMap = { success: "text-brand-success", warning: "text-brand-warning", muted: "text-ink-muted" };
  return (
    <div className="mt-2">
      <div className={`text-[10px] uppercase tracking-wider mb-1 ${toneMap[tone]}`}>{label}</div>
      <ul className="text-xs text-ink-text/90 space-y-0.5">
        {items.map((i) => <li key={i} className="line-clamp-2">• {i}</li>)}
      </ul>
    </div>
  );
}

function MetricCol({ title, items }) {
  return (
    <div className="rounded-xl border border-ink-border bg-ink-surface p-5">
      <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">{title}</div>
      {!items || items.length === 0 ? <div className="text-xs text-ink-muted">—</div> :
        <ul className="space-y-2">
          {items.map((m) => (
            <li key={m.metric} className="text-sm">
              <div className="text-ink-text font-medium">{m.metric}</div>
              <div className="text-xs text-ink-muted">{m.target_band || "—"}{m.cadence ? ` · ${m.cadence}` : ""}</div>
            </li>
          ))}
        </ul>
      }
    </div>
  );
}

function EmptyText({ text }) { return <div className="rounded-xl border border-dashed border-ink-border p-6 text-sm text-ink-muted text-center">{text}</div>; }
