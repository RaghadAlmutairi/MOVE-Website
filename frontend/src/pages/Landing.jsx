import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  PlayCircle,
  Search,
  Target,
  TrendingUp,
  LayoutPanelTop,
  PenSquare,
  Download,
  Brain,
  Zap,
} from "lucide-react";
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  { icon: Search, title: "AI Research Engine", desc: "Map any company in one pass — products, ICP, value props, and signal feeds." },
  { icon: Target, title: "Competitor Discovery", desc: "Surface direct, adjacent and emerging competitors with funding & strength scoring." },
  { icon: TrendingUp, title: "Market Trends", desc: "Search, mention, and capital momentum visualized in real-time charts." },
  { icon: LayoutPanelTop, title: "GTM Strategy Builder", desc: "From positioning to channel mix to a 30/60/90 plan — fully editable." },
  { icon: PenSquare, title: "AI Content Generator", desc: "LinkedIn, X, email, ads, blog — on-brand and ready to ship." },
  { icon: Download, title: "Export Center", desc: "PDF, PPTX, XLSX, calendar files. One-click master ZIP." },
];

const STEPS = [
  { n: "01", t: "Drop a company", d: "Paste a URL. We crawl, parse, and structure everything." },
  { n: "02", t: "Choose a strategy", d: "AI proposes 4 GTM motions with confidence and ROI." },
  { n: "03", t: "Refine in the command center", d: "Edit ICP, positioning, channels, and roadmap with the copilot." },
  { n: "04", t: "Export & launch", d: "Ship campaign-ready content, decks and timelines from a single bundle." },
];

const FAQ = [
  { q: "How does MOVE generate strategies?", a: "MOVE combines first-party research (crawling, signal aggregation) with a frontier reasoning model coordinated across multiple agents. Every recommendation is explained — no black box." },
  { q: "Can I use my own brand voice?", a: "Yes. Upload sample posts, decks, or emails and the copilot will mirror your tone, vocabulary and cadence across all generated content." },
];


export default function Landing() {
  return (
    <div className="relative overflow-hidden">
      <TopNav variant="marketing" />

      {/* Hero */}
      <section className="relative pt-24 pb-32 px-6 lg:px-10">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] rounded-full blur-[140px] opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle, #A855F7 0%, transparent 60%)" }}
        />
        <div
          className="absolute top-40 right-0 w-[600px] h-[600px] rounded-full blur-[160px] opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, #E879F9 0%, transparent 70%)" }}
        />

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-ink-muted mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
            Multi-Agent GTM Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-heading font-semibold tracking-tight text-5xl sm:text-6xl lg:text-7xl leading-[1.04] text-ink-text"
          >
            Build Winning Go-To-Market
            <br />
            Strategies with <span className="text-gradient-ai">AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 text-lg sm:text-xl text-ink-muted max-w-2xl mx-auto leading-relaxed"
          >
            Research your market, discover competitors, generate GTM plans, and create campaign-ready content — all from a single agentic workspace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/research">
              <Button
                data-testid="hero-primary-cta"
                size="lg"
                className="bg-brand-primary hover:bg-[#9333EA] text-white px-7 py-6 text-base shadow-xl shadow-brand-primary/40"
              >
                Start Your GTM Strategy
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button
              data-testid="hero-secondary-cta"
              size="lg"
              variant="outline"
              className="border-ink-border bg-transparent text-ink-text hover:bg-ink-surface px-7 py-6 text-base"
            >
              <PlayCircle className="mr-2 w-4 h-4" />
              Watch Demo
            </Button>
          </motion.div>
        </div>

          {/* Hero product preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-6xl mx-auto mt-20"
        >
          <div className="relative rounded-2xl border border-ink-border bg-ink-surface overflow-hidden shadow-2xl shadow-brand-primary/10">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-accent/10 pointer-events-none" />
            <div className="px-4 py-3 border-b border-ink-border flex items-center gap-2 bg-ink-bg/40">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="ml-3 text-xs text-ink-muted font-mono">move · command-center</span>
            </div>
            <div className="grid grid-cols-12 gap-4 p-6">
              <div className="col-span-3 space-y-2">
                {["Overview", "ICP", "Positioning", "Messaging", "Channels", "Campaigns", "Timeline"].map((s, i) => (
                  <div key={s} className={`px-3 py-2 rounded-md text-xs ${i === 2 ? "bg-brand-primary/15 text-brand-primary" : "text-ink-muted"}`}>{s}</div>
                ))}
              </div>
              <div className="col-span-9 space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  {[87, 92, 64, 79].map((v, i) => (
                    <div key={i} className="rounded-lg border border-ink-border bg-ink-bg/40 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-ink-muted">Score {i + 1}</div>
                      <div className="font-heading text-2xl text-ink-text mt-1">{v}</div>
                      <div className="h-1 mt-2 rounded-full bg-ink-elevated overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-primary to-brand-accent" style={{ width: `${v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-ink-border bg-ink-bg/40 p-4 h-40 relative overflow-hidden">
                  <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-3">Channel allocation</div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-end gap-1.5 h-20">
                    {[60, 80, 45, 70, 35, 50, 30].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-brand-primary to-brand-accent" style={{ height: `${h}%`, opacity: 0.5 + i * 0.07 }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Overview */}
      <section className="relative px-6 lg:px-10 py-24 border-t border-ink-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] uppercase tracking-[0.2em] text-brand-secondary mb-3">The Platform</div>
            <h2 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight">Everything you need to ship a GTM</h2>
            <p className="mt-4 text-ink-muted max-w-2xl mx-auto">Six modules. One coherent workflow. Built for ambitious RevOps and growth leaders.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className="group rounded-xl border border-ink-border bg-ink-surface p-6 hover:border-brand-primary/50 hover:bg-ink-elevated transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 border border-brand-primary/30 flex items-center justify-center mb-4 group-hover:from-brand-primary/30 group-hover:to-brand-accent/30 transition-colors">
                  <f.icon className="w-5 h-5 text-brand-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-ink-text mb-2">{f.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative px-6 lg:px-10 py-24 border-t border-ink-border bg-ink-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] uppercase tracking-[0.2em] text-brand-accent mb-3">How it works</div>
            <h2 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight">From URL to launch in four steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-xl border border-ink-border bg-ink-bg p-6 relative overflow-hidden">
                <div className="font-mono text-xs text-brand-secondary mb-3">{s.n}</div>
                <h3 className="font-heading font-semibold text-base text-ink-text mb-1.5">{s.t}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detail blocks */}
      <section className="px-6 lg:px-10 py-24 border-t border-ink-border">
        <div className="max-w-6xl mx-auto space-y-24">
          {[
            { icon: Brain, label: "AI Research Engine", title: "Know any company at a deeper level", desc: "MOVE crawls public sources — websites, filings, podcasts, hiring data — and reconstructs the full GTM picture: products, ICP, value props, pricing posture, and emerging risks." },
            { icon: Target, label: "Competitor Discovery", title: "Map the battlefield before you step on it", desc: "Surface direct, adjacent and emerging competitors with funding context, momentum signals, strengths and weaknesses. Build positioning matrices in one click." },
            { icon: TrendingUp, label: "Market Trends", title: "Spot signals before your competitors do", desc: "Search momentum, social mentions, and capital flow — visualized as trend lines, anomaly alerts and opportunity scores." },
            { icon: LayoutPanelTop, label: "GTM Strategy Builder", title: "Boardroom-grade strategy, not a Notion doc", desc: "ICP, positioning, messaging, channel mix, and a 30/60/90 plan — every section editable, justified, and exportable." },
            { icon: PenSquare, label: "AI Content Generator", title: "Campaign-ready, in your voice", desc: "LinkedIn manifestos, X threads, email sequences, search ads, blog posts. On-brand, optimized for each surface." },
            { icon: Download, label: "Export Center", title: "Boardroom decks, calendars and budgets — all in one bundle", desc: "PDF strategy doc, PPTX deck, XLSX budget, ICS calendar. One-click ZIP for the full package." },
          ].map((b, i) => (
            <div key={b.label} className={`grid md:grid-cols-12 gap-10 items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <div className="md:col-span-6">
                <div className="text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-2">{b.label}</div>
                <h3 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight mb-4">{b.title}</h3>
                <p className="text-ink-muted leading-relaxed text-base">{b.desc}</p>
              </div>
              <div className="md:col-span-6">
                <div className="relative rounded-2xl border border-ink-border bg-gradient-to-br from-ink-surface to-ink-bg p-8 h-64 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 grid-bg opacity-40" />
                  <b.icon className="w-24 h-24 text-brand-primary/40 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-brand-accent/15" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 lg:px-10 py-24 border-t border-ink-border">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] uppercase tracking-[0.2em] text-brand-accent mb-3">FAQ</div>
            <h2 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight">Frequently asked</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-2" data-testid="faq-accordion">
            {FAQ.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-ink-border bg-ink-surface rounded-lg px-5 data-[state=open]:border-brand-primary/50">
                <AccordionTrigger data-testid={`faq-item-${i}`} className="text-left font-heading font-medium text-base text-ink-text hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-ink-muted leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 lg:px-10 py-24 border-t border-ink-border relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(168,85,247,0.4) 0%, transparent 60%)" }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <Badge variant="outline" className="border-brand-primary/40 text-brand-primary bg-brand-primary/10 mb-5">
            <Zap className="w-3 h-3 mr-1" /> Try the workspace
          </Badge>
          <h2 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight">Stop planning. Start moving.</h2>
          <p className="mt-4 text-ink-muted text-lg">Build your next GTM with a multi-agent intelligence stack.</p>
          <Link to="/research">
            <Button
              data-testid="final-cta"
              size="lg"
              className="mt-8 bg-brand-primary hover:bg-[#9333EA] text-white px-7 py-6 text-base shadow-xl shadow-brand-primary/40"
            >
              Start Your GTM Strategy
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink-border px-6 lg:px-10 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <img
              src="https://customer-assets.emergentagent.com/job_gtm-copilot-2/artifacts/9jdueuty_ChatGPT%20Image%20Jun%2016%2C%202026%2C%2009_48_17%20AM.png"
              alt="MOVE"
              className="h-7 w-auto object-contain"
            />
            <span>© 2026</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#" onClick={(e)=>e.preventDefault()} className="hover:text-ink-text transition-colors">Privacy</a>
            <a href="#" onClick={(e)=>e.preventDefault()} className="hover:text-ink-text transition-colors">Terms</a>
            <a href="#" onClick={(e)=>e.preventDefault()} className="hover:text-ink-text transition-colors">Security</a>
            <a href="#" onClick={(e)=>e.preventDefault()} className="hover:text-ink-text transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
