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
  { n: "01", t: "Submit a query",          d: "Type a research question (and optionally a company URL)." },
  { n: "02", t: "Approve the research",    d: "Review the report and approve, or ask the agent to regenerate." },
  { n: "03", t: "Strategy + content (parallel)", d: "The strategy agent and the Phase A content agent run in parallel." },
  { n: "04", t: "Phase B + exports",       d: "Approve the strategy + Phase A draft, then trigger Phase B and download deliverables." },
];

const FAQ = [
  { q: "What does MOVE actually do?", a: "MOVE drives the gtm_v4_fixed multi-agent system: a research agent (LangGraph) produces a structured Report; a strategy agent produces a full GTM Strategy; a content agent produces a Phase A draft (LinkedIn) and a Phase B full suite (blogs, SEO, emails). Every artefact is rooted in cited sources." },
  { q: "Why does it ask me to approve each stage?", a: "The agent system enforces a human-in-the-loop gate after research, strategy and each content phase. MOVE surfaces those gates as Approve / Regenerate buttons — they are real backend transitions, not UI decoration." },
  { q: "What can I download?", a: "Once a stage is approved, MOVE can export PDF, Word or PowerPoint of the combined report, and a dedicated Strategy PDF. Each export is generated server-side by the agent's exporters." },
];

export default function Landing() {
  return (
    <div className="relative overflow-hidden">
      <TopNav variant="marketing" />

      <section className="relative pt-24 pb-32 px-6 lg:px-10">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] rounded-full blur-[140px] opacity-40 pointer-events-none" style={{ background: "radial-gradient(circle, #A855F7 0%, transparent 60%)" }} />
        <div className="absolute top-40 right-0 w-[600px] h-[600px] rounded-full blur-[160px] opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle, #E879F9 0%, transparent 70%)" }} />

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="flex justify-center -mt-6 mb-2">
            <img src="https://customer-assets.emergentagent.com/job_gtm-copilot-2/artifacts/den8bpor_new%20move%20logo.png" alt="MOVE — Marketing Opportunity Value Executor" className="h-56 sm:h-72 md:h-80 lg:h-96 w-auto object-contain drop-shadow-[0_0_60px_rgba(168,85,247,0.55)]" style={{ mixBlendMode: 'lighten' }} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-ink-muted mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
            <span className="font-mono uppercase tracking-[0.18em] text-[10px]">M.O.V.E.</span>
            <span className="text-ink-muted/60">·</span>
            Marketing Opportunity Value Executor
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }} className="font-heading font-semibold tracking-tight text-5xl sm:text-6xl lg:text-7xl leading-[1.04] text-ink-text">
            Build Winning Go-To-Market
            <br />
            Strategies with <span className="text-gradient-ai">AI</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mt-6 text-lg sm:text-xl text-ink-muted max-w-2xl mx-auto leading-relaxed">
            Research the market, draft the GTM strategy, and produce campaign-ready content — through a fully observable multi-agent pipeline.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/research">
              <Button data-testid="hero-primary-cta" size="lg" className="bg-brand-primary hover:bg-[#9333EA] text-white px-7 py-6 text-base shadow-xl shadow-brand-primary/40">
                Start Your GTM Strategy <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button data-testid="hero-secondary-cta" size="lg" variant="outline" className="border-ink-border bg-transparent text-ink-text hover:bg-ink-surface px-7 py-6 text-base">
              <PlayCircle className="mr-2 w-4 h-4" /> Watch Demo
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="relative px-6 lg:px-10 py-24 border-t border-ink-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] uppercase tracking-[0.2em] text-brand-secondary mb-3">The Platform</div>
            <h2 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight">Six capabilities. One agent stack.</h2>
            <p className="mt-4 text-ink-muted max-w-2xl mx-auto">Every capability below is a real agent function — research, strategy, content, and document export.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.04 }} className="group rounded-xl border border-ink-border bg-ink-surface p-6 hover:border-brand-primary/50 hover:bg-ink-elevated transition-all">
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

      <section className="relative px-6 lg:px-10 py-24 border-t border-ink-border bg-ink-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] uppercase tracking-[0.2em] text-brand-accent mb-3">How it works</div>
            <h2 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight">From a question to a deliverable</h2>
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

      <section className="px-6 lg:px-10 py-24 border-t border-ink-border">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] uppercase tracking-[0.2em] text-brand-accent mb-3">FAQ</div>
            <h2 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight">Frequently asked</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-2" data-testid="faq-accordion">
            {FAQ.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border border-ink-border bg-ink-surface rounded-lg px-5 data-[state=open]:border-brand-primary/50">
                <AccordionTrigger data-testid={`faq-item-${f.q.slice(0, 18)}`} className="text-left font-heading font-medium text-base text-ink-text hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-ink-muted leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="px-6 lg:px-10 py-24 border-t border-ink-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, rgba(168,85,247,0.4) 0%, transparent 60%)" }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <Brain className="w-10 h-10 mx-auto mb-4 text-brand-primary" />
          <h2 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight">Stop planning. Start moving.</h2>
          <p className="mt-4 text-ink-muted text-lg">Run a real multi-agent GTM pipeline end-to-end.</p>
          <Link to="/research">
            <Button data-testid="final-cta" size="lg" className="mt-8 bg-brand-primary hover:bg-[#9333EA] text-white px-7 py-6 text-base shadow-xl shadow-brand-primary/40">
              Start Your GTM Strategy <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink-border px-6 lg:px-10 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
          <div className="flex items-center gap-3">
            <img src="https://customer-assets.emergentagent.com/job_gtm-copilot-2/artifacts/den8bpor_new%20move%20logo.png" alt="MOVE" className="h-10 w-auto object-contain" style={{ mixBlendMode: 'lighten' }} />
            <span>Marketing Opportunity Value Executor · © 2026</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-ink-text transition-colors">Privacy</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-ink-text transition-colors">Terms</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-ink-text transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
