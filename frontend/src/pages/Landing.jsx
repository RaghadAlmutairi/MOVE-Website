import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, PlayCircle, Search, Target, TrendingUp, LayoutPanelTop, PenSquare, Download, Brain,
} from "lucide-react";
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Every feature listed below maps to a real capability of gtm_v4_fixed.
const FEATURES = [
  { icon: Search,         title: "Research Agent",         desc: "Routes the right research tools, gathers sources in parallel, and synthesises a Report with SWOT, competitors, personas and trends." },
  { icon: Target,         title: "Competitor Discovery",   desc: "Discovers company, product and alternative competitors with positioning, value props and product-level differentiators." },
  { icon: TrendingUp,     title: "Market & Trends",        desc: "Surfaces market trends, opportunities and risks grounded in cited sources." },
  { icon: LayoutPanelTop, title: "Strategy Agent",         desc: "Generates a full GTM strategy: foundation (positioning, ICP, beachhead), activation (pricing, motion, channels) and execution (sales playbook, demand gen, 90-day roadmap)." },
  { icon: PenSquare,      title: "Content Agent — 2 phases", desc: "Phase A drafts LinkedIn social content from research only. Phase B adds blogs, SEO articles and email sequences once the strategy is approved." },
  { icon: Download,       title: "Document Exports",       desc: "Generates PDF, Word and PowerPoint deliverables — plus a dedicated Strategy PDF — from the approved artefacts." },
];

const STEPS = [
  { n: "01", t: "Query",          d: "Submit your research question and company URL to start the GTM pipeline." },
  { n: "02", t: "Research",       d: "AI agents gather market insights, competitors, and customer personas with cited sources." },
  { n: "03", t: "Strategy",       d: "Generate positioning, ICP, pricing, channels, and a 90-day execution roadmap." },
  { n: "04", t: "Content",        d: "Create LinkedIn posts, blogs, SEO articles, and email sequences aligned with your strategy." },
  { n: "05", t: "Export",         d: "Download PDF, Word, and PowerPoint deliverables with all research and strategy artifacts." },
];

const FAQ = [
  { q: "What does MOVE actually do?", a: "MOVE drives the gtm_v4_fixed multi-agent system: a research agent (LangGraph) produces a structured Report; a strategy agent produces a full GTM Strategy; a content agent produces a Phase A draft (LinkedIn) and a Phase B full suite (blogs, SEO, emails). Every artefact is rooted in cited sources." },
  { q: "Why does it ask me to approve each stage?", a: "The agent system enforces a human-in-the-loop gate after research, strategy and each content phase. MOVE surfaces those gates as Approve / Regenerate buttons — they are real backend transitions, not UI decoration." },
  { q: "What can I download?", a: "Once a stage is approved, MOVE can export PDF, Word or PowerPoint of the combined report, and a dedicated Strategy PDF. Each export is generated server-side by the agent's exporters." },
];

export default function Landing() {
  return (
    <div className="relative overflow-hidden bg-move-bg min-h-screen">
      <TopNav variant="marketing" />

      {/* Hero Section - MOVE Design System */}
      <section className="relative pt-16 pb-12 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[20px] bg-move-surface border border-move-border p-10 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-8">
              {/* Left Column - Text Content */}
              <div className="flex flex-col justify-center">
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  className="font-heading text-[50px] leading-[1.0] tracking-[-0.03em] font-medium"
                  style={{ fontWeight: 500 }}
                >
                  <span className="text-move-ink">Outthink the market.</span>
                  <br />
                  <span className="text-gradient-move">Outmove the competition.</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="mt-6 text-base leading-[1.6] text-move-body"
                >
                  <span className="text-move-ink font-medium">MOVE</span> — an agentic AI platform that automates go-to-market work. Research, strategy, and content, end to end. You stay in control at every step.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="mt-8 flex flex-col sm:flex-row items-start gap-3"
                >
                  <Link to="/research">
                    <Button
                      data-testid="hero-primary-cta"
                      className="bg-move-ink hover:bg-move-ink/90 text-white rounded-[12px] px-6 py-3 h-auto text-[14px] font-medium"
                      style={{ fontWeight: 500 }}
                    >
                      Start building GTM strategy
                    </Button>
                  </Link>
                  <Button
                    data-testid="hero-secondary-cta"
                    variant="outline"
                    className="border-move-border-ghost bg-transparent text-move-ink hover:bg-move-bg-subtle rounded-[12px] px-6 py-3 h-auto text-[14px] font-medium"
                    style={{ fontWeight: 500 }}
                  >
                    <PlayCircle className="mr-2 w-4 h-4" /> Watch demo
                  </Button>
                </motion.div>
              </div>

              {/* Right Column - Preview Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="relative aspect-[4/5] rounded-[16px] overflow-hidden"
                style={{ background: 'linear-gradient(140deg, var(--color-grad-1), var(--color-grad-2), var(--color-grad-3))' }}
              >
                {/* Status Pill */}
                <div className="absolute top-5 left-5 glass-dark rounded-full px-3 py-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white text-[10px] uppercase tracking-[0.06em] font-medium" style={{ fontWeight: 500 }}>ANALYZING</span>
                </div>

                {/* Progress Section */}
                <div className="absolute bottom-24 left-5 right-5">
                  <div className="text-white/80 text-[9px] uppercase tracking-[0.06em] mb-2 font-medium" style={{ fontWeight: 500 }}>YOUR PROJECT</div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-white rounded-full" style={{ width: '60%' }} />
                  </div>
                  <div className="flex items-center gap-1.5 text-white text-[11px]">
                    <span className="font-medium" style={{ fontWeight: 500 }}>Query</span>
                    <span className="opacity-60">·</span>
                    <span className="font-medium" style={{ fontWeight: 500 }}>Research</span>
                    <span className="opacity-60">·</span>
                    <span className="opacity-90">Strategy</span>
                    <span className="opacity-60">·</span>
                    <span className="opacity-70">Content</span>
                    <span className="opacity-60">·</span>
                    <span className="opacity-70">Export</span>
                  </div>
                </div>

                {/* White Inset Card */}
                <div className="absolute bottom-5 left-5 right-5 bg-white rounded-[12px] border border-move-border p-4">
                  <div className="text-[9px] uppercase tracking-[0.06em] mb-1.5 font-medium" style={{ color: 'var(--color-grad-3)', fontWeight: 500 }}>
                    MARKET RESEARCH · LIVE
                  </div>
                  <div className="text-move-ink text-[12px] font-medium leading-tight" style={{ fontWeight: 500 }}>
                    Anthropic competitive brief and positioning analysis
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Stats Row - 5 Stages */}
            <div className="mt-10 pt-8 border-t border-move-border grid grid-cols-2 md:grid-cols-5 gap-6">
              <div>
                <div className="text-[22px] font-medium tracking-[-0.01em] text-move-ink mb-1" style={{ fontWeight: 500 }}>Query</div>
                <div className="text-[12px] text-move-muted leading-relaxed">Submit research question</div>
              </div>
              <div>
                <div className="text-[22px] font-medium tracking-[-0.01em] text-move-ink mb-1" style={{ fontWeight: 500 }}>Research</div>
                <div className="text-[12px] text-move-muted leading-relaxed">Market trends, competitors</div>
              </div>
              <div>
                <div className="text-[22px] font-medium tracking-[-0.01em] text-move-ink mb-1" style={{ fontWeight: 500 }}>Strategy</div>
                <div className="text-[12px] text-move-muted leading-relaxed">Positioning, execution plan</div>
              </div>
              <div>
                <div className="text-[22px] font-medium tracking-[-0.01em] text-move-ink mb-1" style={{ fontWeight: 500 }}>Content</div>
                <div className="text-[12px] text-move-muted leading-relaxed">Ready-to-launch content</div>
              </div>
              <div>
                <div className="text-[22px] font-medium tracking-[-0.01em] text-move-ink mb-1" style={{ fontWeight: 500 }}>Export</div>
                <div className="text-[12px] text-move-muted leading-relaxed">PDF, Word, PowerPoint</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-6 lg:px-10 py-24 border-t border-move-border bg-move-bg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] uppercase tracking-[0.2em] text-move-grad-3 mb-3 font-medium" style={{ fontWeight: 500 }}>The Platform</div>
            <h2 className="font-heading text-4xl sm:text-5xl font-medium tracking-tight text-move-ink" style={{ fontWeight: 500 }}>Six capabilities. One agent stack.</h2>
            <p className="mt-4 text-move-body max-w-2xl mx-auto">Every capability below is a real agent function — research, strategy, content, and document export.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.04 }} className="group rounded-[16px] border border-move-border bg-move-surface p-6 hover:border-move-grad-3/50 hover:bg-move-surface-hover transition-all">
                <div className="w-10 h-10 rounded-lg bg-move-grad-3-tint border border-move-grad-3/30 flex items-center justify-center mb-4 transition-colors">
                  <f.icon className="w-5 h-5 text-move-grad-3" />
                </div>
                <h3 className="font-heading font-medium text-lg text-move-ink mb-2" style={{ fontWeight: 500 }}>{f.title}</h3>
                <p className="text-sm text-move-body leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 lg:px-10 py-24 border-t border-move-border bg-move-bg-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] uppercase tracking-[0.2em] text-move-grad-2 mb-3 font-medium" style={{ fontWeight: 500 }}>How it works</div>
            <h2 className="font-heading text-4xl sm:text-5xl font-medium tracking-tight text-move-ink" style={{ fontWeight: 500 }}>From a question to a deliverable</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-[16px] border border-move-border bg-move-surface p-6 relative overflow-hidden">
                <div className="font-mono text-xs text-move-grad-3 mb-3">{s.n}</div>
                <h3 className="font-heading font-medium text-base text-move-ink mb-1.5" style={{ fontWeight: 500 }}>{s.t}</h3>
                <p className="text-sm text-move-body leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-10 py-24 border-t border-move-border bg-move-bg">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] uppercase tracking-[0.2em] text-move-grad-2 mb-3 font-medium" style={{ fontWeight: 500 }}>FAQ</div>
            <h2 className="font-heading text-4xl sm:text-5xl font-medium tracking-tight text-move-ink" style={{ fontWeight: 500 }}>Frequently asked</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-2" data-testid="faq-accordion">
            {FAQ.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border border-move-border bg-move-surface rounded-lg px-5 data-[state=open]:border-move-grad-3/50">
                <AccordionTrigger data-testid={`faq-item-${f.q.slice(0, 18)}`} className="text-left font-heading font-medium text-base text-move-ink hover:no-underline" style={{ fontWeight: 500 }}>{f.q}</AccordionTrigger>
                <AccordionContent className="text-move-body leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="px-6 lg:px-10 py-24 border-t border-move-border bg-move-bg-subtle relative overflow-hidden">
        <div className="relative max-w-3xl mx-auto text-center">
          <Brain className="w-10 h-10 mx-auto mb-4 text-move-ink" />
          <h2 className="font-heading text-4xl sm:text-5xl font-medium tracking-tight text-move-ink" style={{ fontWeight: 500 }}>Stop planning. Start moving.</h2>
          <p className="mt-4 text-move-body text-lg">Run a real multi-agent GTM pipeline end-to-end.</p>
          <Link to="/research">
            <Button data-testid="final-cta" className="mt-8 bg-move-ink hover:bg-move-ink-hover text-white px-6 py-3 text-[14px] rounded-[12px] h-auto font-medium" style={{ fontWeight: 500 }}>
              Start building GTM strategy <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-move-border px-6 lg:px-10 py-10 bg-move-bg">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-move-muted">
          <div className="flex items-center gap-3">
            <span className="text-move-ink font-medium" style={{ fontWeight: 500 }}>MOVE</span>
            <span>Marketing Opportunity Value Executor · © 2026</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-move-ink transition-colors">Privacy</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-move-ink transition-colors">Terms</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-move-ink transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
