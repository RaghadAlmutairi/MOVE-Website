import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Crosshair,
  MessageSquare,
  Radio,
  CalendarDays,
  GitBranch,
  FileText,
  BarChart3,
  Check,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Mail,
  Linkedin,
  Quote,
  TrendingUp,
  Send,
  Wand2,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { STRATEGY, COPILOT_CONVERSATIONS } from "@/lib/mockData";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "icp", label: "ICP", icon: Users },
  { id: "positioning", label: "Positioning", icon: Crosshair },
  { id: "messaging", label: "Messaging", icon: MessageSquare },
  { id: "channels", label: "Channels", icon: Radio },
  { id: "campaigns", label: "Campaigns", icon: GitBranch },
  { id: "timeline", label: "Timeline", icon: CalendarDays },
  { id: "content", label: "Content", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function CommandCenter() {
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");

  return (
    <div className="min-h-screen bg-ink-bg">
      <TopNav />
      <div className="flex max-w-[1600px] mx-auto">
        {/* Left sidebar */}
        <aside className="hidden lg:flex w-56 shrink-0 border-r border-ink-border min-h-[calc(100vh-4rem)] flex-col p-4 sticky top-16">
          <div className="px-2 mb-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">Strategy</div>
            <div className="font-heading text-sm font-medium mt-1 text-ink-text">Land & Expand</div>
            <Badge variant="outline" className="mt-2 border-brand-success/40 text-brand-success bg-brand-success/10 text-[10px]">
              Confidence 92
            </Badge>
          </div>
          <nav className="space-y-0.5 mt-3">
            {SECTIONS.map((s) => {
              const Active = s.id === active;
              return (
                <button
                  key={s.id}
                  data-testid={`sidebar-${s.id}`}
                  onClick={() => setActive(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                    Active
                      ? "bg-brand-primary/15 text-brand-primary border-l-2 border-brand-primary"
                      : "text-ink-muted hover:text-ink-text hover:bg-ink-surface"
                  }`}
                >
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
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
              <Badge variant="outline" className="border-brand-accent/40 text-brand-accent bg-brand-accent/10 mb-3 text-[10px]">
                <Sparkles className="w-3 h-3 mr-1" /> Live strategy
              </Badge>
              <h1 className="font-heading text-4xl font-semibold tracking-tight text-ink-text">{STRATEGY.name}</h1>
              <p className="text-ink-muted mt-1.5 max-w-2xl leading-relaxed">{STRATEGY.summary}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" data-testid="export-strategy-btn" className="border-ink-border text-ink-text hover:bg-ink-surface" onClick={() => navigate("/studio")}>
                Export Package
              </Button>
              <Button data-testid="approve-strategy-btn" onClick={() => toast.success("Strategy approved", { description: "Notifications sent to GTM team." })} className="bg-brand-success hover:bg-[#0EA371] text-white shadow-lg shadow-brand-success/30">
                <Check className="w-4 h-4 mr-1.5" /> Approve
              </Button>
            </div>
          </div>

          {/* Executive Summary */}
          <Section id="overview" title="Executive Summary">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STRATEGY.metrics.slice(0, 4).map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-xl border border-ink-border bg-ink-surface p-5"
                >
                  <div className="text-[10px] uppercase tracking-wider text-ink-muted">{m.label}</div>
                  <div className="font-heading text-2xl font-semibold mt-1.5 text-ink-text">{m.actual}</div>
                  <div className="text-xs text-ink-muted mt-0.5">Target {m.target}</div>
                  <div className="mt-3 h-1.5 rounded-full bg-ink-elevated overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent" style={{ width: `${m.progress}%` }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>

          {/* ICP */}
          <Section id="icp" title="Ideal Customer Profile" icon={Users}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card title="Company Types" items={STRATEGY.icp.companyTypes} chips />
              <Card title="Industries" items={STRATEGY.icp.industries} chips />
              <Card title="Revenue & Size">
                <div className="font-heading text-2xl font-semibold text-ink-text">{STRATEGY.icp.revenue}</div>
                <div className="text-sm text-ink-muted mt-1">{STRATEGY.icp.employees} employees</div>
              </Card>
              <div className="md:col-span-2">
                <Card title="Pain Points" items={STRATEGY.icp.painPoints} list />
              </div>
              <Card title="Buying Triggers" items={STRATEGY.icp.triggers} list />
            </div>
          </Section>

          {/* Positioning */}
          <Section id="positioning" title="Positioning Framework" icon={Crosshair}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Problem", value: STRATEGY.positioning.problem, color: "from-brand-warning to-orange-400" },
                { label: "Solution", value: STRATEGY.positioning.solution, color: "from-brand-primary to-brand-accent" },
                { label: "Differentiator", value: STRATEGY.positioning.differentiator, color: "from-brand-accent to-brand-secondary" },
                { label: "Proof", value: STRATEGY.positioning.proof, color: "from-brand-success to-emerald-400" },
              ].map((p) => (
                <div key={p.label} className="rounded-xl border border-ink-border bg-ink-surface p-5 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r ${p.color}`} />
                  <div className="text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-2">{p.label}</div>
                  <p className="text-base text-ink-text leading-relaxed">{p.value}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Messaging */}
          <Section id="messaging" title="Messaging Framework" icon={MessageSquare}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-ink-border bg-ink-surface p-6 md:col-span-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-accent/10 pointer-events-none" />
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-brand-secondary mb-2 relative">
                  <Quote className="w-3.5 h-3.5" /> Value Proposition
                </div>
                <p className="font-heading text-xl text-ink-text leading-snug relative">{STRATEGY.messaging.valueProp}</p>
              </div>
              <Card title="Elevator Pitch">
                <p className="text-sm text-ink-text/90 leading-relaxed">{STRATEGY.messaging.elevator}</p>
              </Card>
              <Card title="Email Messaging" icon={Mail}>
                <pre className="text-xs text-ink-text/90 leading-relaxed whitespace-pre-wrap font-sans">{STRATEGY.messaging.email}</pre>
              </Card>
              <Card title="LinkedIn Messaging" icon={Linkedin}>
                <p className="text-sm text-ink-text/90 leading-relaxed whitespace-pre-wrap">{STRATEGY.messaging.linkedin}</p>
              </Card>
            </div>
          </Section>

          {/* Channels */}
          <Section id="channels" title="Channel Strategy" icon={Radio}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5 rounded-xl border border-ink-border bg-ink-surface p-5">
                <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">Allocation</div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={STRATEGY.channels} dataKey="value" nameKey="name" innerRadius={50} outerRadius={88} paddingAngle={3}>
                        {STRATEGY.channels.map((c) => (
                          <Cell key={c.name} fill={c.color} stroke="#0A0613" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#15101F", border: "1px solid #2A1F3D", borderRadius: 8, fontSize: 12, color: "#F8FAFC" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="md:col-span-7 rounded-xl border border-ink-border bg-ink-surface p-5">
                <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">Breakdown</div>
                <div className="space-y-2.5">
                  {STRATEGY.channels.map((c) => (
                    <div key={c.name} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                      <div className="text-sm text-ink-text/90 w-40">{c.name}</div>
                      <div className="flex-1 h-2 rounded-full bg-ink-elevated overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${c.value * 3.5}%`, background: c.color }} />
                      </div>
                      <div className="text-xs font-mono text-ink-muted w-10 text-right">{c.value}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Campaigns + Timeline */}
          <Section id="timeline" title="Campaign Roadmap" icon={CalendarDays}>
            <div className="relative">
              <div className="absolute top-6 left-6 right-6 h-px bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary opacity-40" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STRATEGY.roadmap.map((r, i) => (
                  <motion.div
                    key={r.phase}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-xl border border-ink-border bg-ink-surface p-5 relative"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center font-heading font-bold text-white text-sm mb-3 relative z-10">
                      {i + 1}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-brand-secondary">{r.phase}</div>
                    <h3 className="font-heading text-base font-semibold mt-1 mb-3 text-ink-text">{r.title}</h3>
                    <ul className="space-y-2">
                      {r.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-ink-text/90">
                          <Check className="w-3.5 h-3.5 text-brand-success mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </Section>

          {/* Analytics */}
          <Section id="analytics" title="Success Metrics" icon={BarChart3}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-7 rounded-xl border border-ink-border bg-ink-surface p-5">
                <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">Pipeline & Revenue forecast</div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { m: "M1", pipeline: 0.8, revenue: 0.15 },
                      { m: "M2", pipeline: 2.1, revenue: 0.4 },
                      { m: "M3", pipeline: 3.8, revenue: 0.8 },
                      { m: "M4", pipeline: 5.4, revenue: 1.4 },
                      { m: "M5", pipeline: 7.6, revenue: 1.9 },
                      { m: "M6", pipeline: 9.8, revenue: 2.6 },
                    ]}>
                      <CartesianGrid stroke="#2A1F3D" strokeDasharray="3 3" />
                      <XAxis dataKey="m" stroke="#A89FB8" fontSize={11} />
                      <YAxis stroke="#A89FB8" fontSize={11} />
                      <Tooltip contentStyle={{ background: "#15101F", border: "1px solid #2A1F3D", borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="pipeline" fill="#A855F7" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="revenue" fill="#E879F9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="md:col-span-5 grid grid-cols-2 gap-3">
                {STRATEGY.metrics.map((m) => (
                  <div key={m.label} className="rounded-xl border border-ink-border bg-ink-surface p-4">
                    <div className="text-[10px] uppercase tracking-wider text-ink-muted">{m.label}</div>
                    <div className="font-heading text-lg font-semibold mt-1 text-ink-text">{m.actual}</div>
                    <div className="text-[11px] text-ink-muted">of {m.target}</div>
                    <div className="mt-2 h-1 rounded-full bg-ink-elevated overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent" style={{ width: `${m.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Bottom CTA */}
          <div className="mt-12 rounded-2xl border border-brand-primary/40 bg-gradient-to-r from-brand-primary/15 via-brand-accent/10 to-brand-secondary/15 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-heading text-2xl font-semibold">Strategy is locked. Ready to launch.</h3>
              <p className="text-ink-muted mt-1">Approve to notify the GTM team, or jump into Content Studio.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/studio")} data-testid="cc-go-studio" className="border-ink-border text-ink-text hover:bg-ink-surface">
                Open Studio
              </Button>
              <Button onClick={() => toast.success("Strategy approved", { description: "Notifications sent to GTM team." })} data-testid="cc-approve" size="lg" className="bg-brand-success hover:bg-[#0EA371] text-white">
                <Check className="w-4 h-4 mr-1.5" /> Approve Strategy
              </Button>
            </div>
          </div>
        </main>

        {/* Right AI Copilot Panel */}
        <aside className="hidden xl:flex w-80 shrink-0 border-l border-ink-border min-h-[calc(100vh-4rem)] sticky top-16 flex-col">
          <CopilotPanel />
        </aside>
      </div>
    </div>
  );
}

function Section({ id, title, icon: Icon, children }) {
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

function Card({ title, items, list, chips, icon: Icon, children }) {
  return (
    <div className="rounded-xl border border-ink-border bg-ink-surface p-5">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-ink-muted mb-3">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {title}
      </div>
      {chips && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((it) => (
            <span key={it} className="text-xs px-2.5 py-1 rounded-full bg-ink-elevated border border-ink-border text-ink-text/90">{it}</span>
          ))}
        </div>
      )}
      {list && (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it} className="flex items-start gap-2 text-sm text-ink-text/90">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 shrink-0" />
              {it}
            </li>
          ))}
        </ul>
      )}
      {children}
    </div>
  );
}

function CopilotPanel() {
  const [messages, setMessages] = useState(() =>
    COPILOT_CONVERSATIONS.map((m, idx) => ({ ...m, id: `seed-${idx}` }))
  );
  const [input, setInput] = useState("");

  const send = (t) => {
    const text = t ?? input;
    if (!text.trim()) return;
    const userId = `u-${Date.now()}`;
    const next = [...messages, { id: userId, role: "user", text }];
    setMessages(next);
    setInput("");
    setTimeout(() => {
      setMessages([
        ...next,
        { id: `a-${Date.now()}`, role: "ai", text: "Got it. I've drafted a refinement — highlighted in the main panel. Want me to A/B test it against the current version?" },
      ]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-5 py-4 border-b border-ink-border flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent to-brand-secondary flex items-center justify-center">
          <Wand2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-heading font-semibold text-sm">GTM Copilot</div>
          <div className="text-[11px] text-ink-muted flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-brand-success animate-pulse" />
            Strategy in scope
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
              m.role === "user" ? "bg-brand-primary text-white" : "bg-ink-elevated border border-ink-border text-ink-text"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 pb-2.5 flex flex-wrap gap-1.5">
        {["Sharpen ICP", "Try a new channel", "Rewrite email"].map((p) => (
          <button
            key={p}
            data-testid={`cc-copilot-quick-${p.toLowerCase().replace(/\s+/g, "-")}`}
            onClick={() => send(p)}
            className="text-[10px] px-2 py-0.5 rounded-full bg-ink-elevated border border-ink-border text-ink-muted hover:text-ink-text hover:border-brand-primary/50 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>
      <div className="p-3 border-t border-ink-border flex items-center gap-1.5">
        <Input
          data-testid="cc-copilot-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask the copilot..."
          className="bg-ink-bg border-ink-border text-ink-text text-xs h-9 focus-visible:ring-brand-primary/40"
        />
        <Button data-testid="cc-copilot-send" onClick={() => send()} size="sm" className="bg-brand-primary hover:bg-[#9333EA] text-white h-9 px-2.5">
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
