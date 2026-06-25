import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Sparkles, ShieldCheck, FileSearch, Compass, MessageSquare, Download,
  GitBranch, BookOpen, Quote, CheckCircle2,
} from "lucide-react";
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const LOGO = "https://customer-assets.emergentagent.com/job_gtm-copilot-2/artifacts/mhxfp8wp_ChatGPT%20Image%20Jun%2023%2C%202026%2C%2001_40_21%20PM.png";

// Marquee chips — short, declarative, premium claims.
const MARQUEE = [
  "Source-grounded reports", "Sequential agent pipeline", "Human-in-the-loop gates",
  "Strategy decks ready in minutes", "Audit-ready evidence", "Zero hallucination drift",
];

// Three product pillars — concrete capabilities, not vague benefits.
const PILLARS = [
  {
    eyebrow: "01",
    title: "Research that cites its work",
    body: "Multi-agent retrieval gathers competitor intel, personas, and market trends, then synthesises a report that lists every source it used. Reviewers can trace any claim in two clicks.",
    Icon: FileSearch,
  },
  {
    eyebrow: "02",
    title: "Strategy with provenance",
    body: "Positioning, ICP, motion, channels, and a 90-day roadmap — generated only after you choose a direction or describe your own. Every recommendation maps back to the research.",
    Icon: Compass,
  },
  {
    eyebrow: "03",
    title: "Content the system already trusts",
    body: "LinkedIn posts, blogs, SEO articles, and email sequences — drafted from the approved strategy, packaged into a ZIP your team can ship the same day.",
    Icon: MessageSquare,
  },
];

// Five-step workflow, presented as a ribbon timeline.
const STEPS = [
  { n: "01", t: "Query",     d: "A company, a URL, an intent. That's all we need to start." },
  { n: "02", t: "Research",  d: "Agents route the right tools and gather evidence in parallel." },
  { n: "03", t: "Direction", d: "Pick a strategic angle — AI suggestion or your own brief." },
  { n: "04", t: "Strategy",  d: "Positioning, ICP, motion, 90-day plan — fully cited." },
  { n: "05", t: "Ship",      d: "PDFs, decks, ZIP kit. Hand off to revenue the same day." },
];

const CAPABILITIES = [
  { Icon: FileSearch,   t: "Source-cited research",      d: "SWOT, opportunities, risks, competitors, personas — every artefact rooted in the agent's evidence." },
  { Icon: GitBranch,    t: "Direction gate",             d: "Pick an AI-suggested strategic direction or write your own GTM objective before generating the strategy." },
  { Icon: Compass,      t: "Full GTM strategy",          d: "Positioning, slot statement, beachhead, competitive edge, pricing, motion, channels, messaging, 90-day plan." },
  { Icon: MessageSquare,t: "Content engine",             d: "Multi-channel suite — LinkedIn, blog, SEO articles, email — anchored to the approved messaging pyramid." },
  { Icon: Download,     t: "Audit-ready exports",        d: "Three PDFs, three Word docs, a strategy deck, and a one-click ZIP kit. Every file built server-side." },
  { Icon: ShieldCheck,  t: "Human-in-the-loop gates",    d: "Approve, regenerate, or rewrite at every stage. The agents never advance without your sign-off." },
];

const STATS = [
  { k: "13", l: "Strategy sections rendered from agent output" },
  { k: "4 → 1", l: "Direction gate: choose from 4 AI angles or your own brief" },
  { k: "7", l: "Export formats — PDF×3, DOCX×3, PPTX, plus a ZIP kit" },
];

const FAQ = [
  { q: "What does MOVE actually do?", a: "MOVE drives a sequential multi-agent system: research → strategy → content. Every artefact is grounded in cited sources, and each stage waits for your approval before the next one runs." },
  { q: "Why does it ask me to approve each stage?", a: "The agents enforce a human-in-the-loop gate after research, strategy, and content. MOVE surfaces those gates as Approve / Regenerate buttons — they are real backend transitions, not UI decoration." },
  { q: "How is the strategy grounded?", a: "After you approve the research, MOVE asks you to pick a strategic direction — either one of four AI-suggested angles derived strictly from the research, or your own GTM brief. The strategy agent then composes only what's traceable to that input." },
  { q: "What can I download?", a: "Three PDFs and three Word documents (research only, strategy only, or both), a strategy PowerPoint, or the full kit as a single ZIP. Every file is generated server-side by the agent's exporters." },
];

const easing = [0.16, 1, 0.3, 1];

export default function Landing() {
  return (
    <div className="relative bg-move-bg min-h-screen overflow-hidden">
      {/* Aurora gradient shadow — full-bleed atmospheric backdrop */}
      <div aria-hidden className="gradient-shadow-bg" data-testid="landing-gradient-shadow" />

      {/* Subtle grain layer for depth (CSS noise via SVG data URI) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.035] mix-blend-multiply z-0"
        style={{
          backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27200%27><filter id=%27n%27><feTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%272%27/></filter><rect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/></svg>")',
        }}
      />

      <TopNav variant="marketing" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-28 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto relative">
          {/* Floating gradient orb behind hero */}
          <div aria-hidden className="absolute -top-32 right-0 w-[640px] h-[640px] rounded-full opacity-50 blur-3xl"
               style={{ background: "radial-gradient(circle, var(--color-grad-2-tint), transparent 70%)" }} />
          <div aria-hidden className="absolute -bottom-40 -left-32 w-[560px] h-[560px] rounded-full opacity-40 blur-3xl"
               style={{ background: "radial-gradient(circle, var(--color-grad-1-tint), transparent 70%)" }} />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: easing }}>
                <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-move-grad-2/30 bg-move-surface/60 backdrop-blur-sm text-move-grad-2 tracking-wide" style={{ fontWeight: 500 }}>
                  <Sparkles className="w-3 h-3" /> The GTM operating system for AI-native teams
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.08, ease: easing }}
                className="mt-6 font-heading tracking-tight text-move-ink leading-[0.95]"
                style={{ fontWeight: 500, fontSize: "clamp(3rem, 7.4vw, 7rem)" }}
              >
                Outthink the market.<br />
                <span style={{
                  backgroundImage: "var(--gradient-headline)",
                  WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
                }}>Outmove</span> the competition.
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2, ease: easing }}
                className="mt-7 max-w-2xl text-lg md:text-xl text-move-body leading-relaxed">
                MOVE is a research-grounded multi-agent system that produces a complete GTM kit — competitive brief, strategy, and content suite — with a human-in-the-loop gate at every stage.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.32, ease: easing }}
                className="mt-9 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" data-testid="hero-cta-primary" className="bg-move-ink hover:bg-move-ink-hover text-white dark:text-move-bg h-14 px-7 text-base rounded-[14px] shadow-lg shadow-move-ink/15" style={{ fontWeight: 500 }}>
                  <Link to="/research">Start building GTM strategy <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
                <Button asChild variant="ghost" size="lg" data-testid="hero-cta-secondary" className="text-move-ink hover:bg-move-surface h-14 px-5 text-base rounded-[14px]">
                  <Link to="/projects">See an example <ArrowUpRight className="ml-2 w-4 h-4" /></Link>
                </Button>
              </motion.div>

              {/* Tiny trust line */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-move-muted">
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-move-success" /> No card required</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-move-success" /> First report in &lt;3 minutes</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-move-success" /> Cited sources by default</span>
              </div>
            </div>

            {/* Hero side artwork — premium project card (matches the live UI) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.25, ease: easing }}
              className="lg:col-span-4 relative hidden lg:block"
            >
              <div className="relative rounded-[24px] border border-move-border bg-move-surface shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)] overflow-hidden">
                {/* card header */}
                <div className="px-6 pt-6 pb-4 border-b border-move-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-move-grad-1 via-move-grad-2 to-move-grad-3 flex items-center justify-center text-white text-[11px]" style={{ fontWeight: 500 }}>A</span>
                    <div>
                      <div className="text-[13px] text-move-ink" style={{ fontWeight: 500 }}>Anthropic — competitive brief</div>
                      <div className="text-[11px] text-move-muted">In progress · live agent</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-move-grad-2 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-move-grad-2 animate-pulse" /> running
                  </span>
                </div>

                {/* timeline rows */}
                <ul className="px-6 py-5 space-y-3">
                  {[
                    { t: "Research", s: "approved", desc: "8 sources cited · SWOT · ICP" },
                    { t: "Direction", s: "approved", desc: "Direction: Enhance enterprise governance" },
                    { t: "Strategy", s: "running",  desc: "Composing positioning + 90-day plan…" },
                    { t: "Content",  s: "queued",   desc: "LinkedIn · blog · SEO · email" },
                    { t: "Export",   s: "queued",   desc: "PDF · DOCX · PPTX · ZIP" },
                  ].map((row, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${
                        row.s === "approved"
                          ? "border-move-success/40 bg-move-success-bg text-move-success"
                          : row.s === "running"
                          ? "border-move-grad-2/40 bg-move-grad-2-tint text-move-grad-2"
                          : "border-move-border bg-move-bg-subtle text-move-muted"
                      }`}>
                        <span className="text-[10px]" style={{ fontWeight: 500 }}>{i + 1}</span>
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-[13px] text-move-ink" style={{ fontWeight: 500 }}>{row.t}</div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                            row.s === "approved" ? "border-move-success/40 bg-move-success-bg text-move-success" :
                            row.s === "running"  ? "border-move-grad-2/40 bg-move-grad-2-tint text-move-grad-2" :
                            "border-move-border bg-move-bg-subtle text-move-muted"
                          }`}>{row.s}</span>
                        </div>
                        <div className="text-[11px] text-move-muted truncate">{row.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* footer */}
                <div className="px-6 py-4 border-t border-move-border bg-move-bg-subtle/50 flex items-center justify-between">
                  <div className="text-[11px] text-move-muted">Awaiting your approval at <span className="text-move-ink">Strategy</span></div>
                  <span className="text-[11px] text-move-grad-3 inline-flex items-center gap-1">View <ArrowRight className="w-3 h-3" /></span>
                </div>
              </div>

              {/* floating chip below the card */}
              <div className="absolute -bottom-5 -left-5 px-3 py-2 rounded-xl border border-move-border bg-move-surface shadow-lg flex items-center gap-2">
                <img src={LOGO} alt="" aria-hidden className="w-6 h-6" />
                <div className="text-[11px]">
                  <div className="text-move-ink" style={{ fontWeight: 500 }}>Run #042</div>
                  <div className="text-move-muted">Created 2 min ago</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Marquee chips ────────────────────────────────────────────────── */}
      <section className="relative py-6 border-y border-move-border bg-move-surface/50 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center gap-3 flex-wrap text-sm text-move-muted">
          <span className="text-[11px] uppercase tracking-[0.2em] text-move-ink mr-2" style={{ fontWeight: 500 }}>Built for</span>
          {MARQUEE.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-move-grad-2" />{c}
            </span>
          ))}
        </div>
      </section>

      {/* ── Pillars ──────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
            <div className="lg:col-span-5">
              <h2 className="font-heading tracking-tight text-move-ink leading-[1.02]"
                  style={{ fontWeight: 500, fontSize: "clamp(2.5rem, 4.4vw, 4rem)" }}>
                Built like an analyst.<br />Shipped like a product.
              </h2>
            </div>
            <div className="lg:col-span-7 lg:pl-10 lg:border-l lg:border-move-border">
              <p className="text-lg text-move-body leading-relaxed">
                Other tools generate plausible prose. MOVE produces auditable artefacts: research with citations, strategy traceable to direction, content tied to messaging. Reviewers can defend every line.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS.map((p, i) => (
              <motion.article
                key={p.eyebrow}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: easing }}
                className="group relative rounded-[22px] border border-move-border bg-move-surface p-7 md:p-8 overflow-hidden hover:border-move-grad-2/60 transition-colors"
              >
                <div aria-hidden className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                     style={{ background: "var(--color-grad-2-tint)" }} />
                <div className="relative">
                  <span className="text-xs tracking-[0.25em] text-move-grad-3 font-medium" style={{ fontWeight: 500 }}>{p.eyebrow}</span>
                  <div className="mt-5 mb-5 w-12 h-12 rounded-2xl bg-gradient-to-br from-move-grad-1-tint to-move-grad-3-tint flex items-center justify-center">
                    <p.Icon className="w-5 h-5 text-move-grad-2" />
                  </div>
                  <h3 className="text-2xl text-move-ink leading-tight mb-3" style={{ fontWeight: 500 }}>{p.title}</h3>
                  <p className="text-move-body leading-relaxed">{p.body}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow ribbon ──────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 lg:px-10 bg-gradient-to-br from-move-grad-1-tint/40 via-transparent to-move-grad-3-tint/40">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
            <div>
              <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-move-grad-3/40 bg-move-surface/80 text-move-grad-3 tracking-wide" style={{ fontWeight: 500 }}>
                <GitBranch className="w-3 h-3" /> The workflow
              </span>
              <h2 className="mt-4 font-heading tracking-tight text-move-ink"
                  style={{ fontWeight: 500, fontSize: "clamp(2.25rem, 4vw, 3.5rem)" }}>
                Five steps. Zero shortcuts.
              </h2>
            </div>
            <p className="max-w-md text-move-body leading-relaxed">
              The agents run the heavy lifting. You stay in control at every gate. Approve, regenerate, or rewrite — the pipeline only advances when you say so.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: easing }}
                className="relative rounded-[18px] border border-move-border bg-move-surface p-6"
              >
                <div className="text-[11px] tracking-[0.25em] text-move-grad-2 mb-4" style={{ fontWeight: 500 }}>{s.n}</div>
                <div className="text-xl text-move-ink mb-2" style={{ fontWeight: 500 }}>{s.t}</div>
                <p className="text-sm text-move-body leading-relaxed">{s.d}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight aria-hidden className="hidden lg:block absolute top-1/2 -right-3 w-5 h-5 text-move-grad-2/60 -translate-y-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capability matrix ────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
            <div className="lg:col-span-5">
              <span className="text-[11px] uppercase tracking-[0.25em] text-move-grad-3" style={{ fontWeight: 500 }}>Inside MOVE</span>
              <h2 className="mt-4 font-heading tracking-tight text-move-ink"
                  style={{ fontWeight: 500, fontSize: "clamp(2.25rem, 4vw, 3.5rem)" }}>
                Every capability,<br />engineered to defend itself.
              </h2>
            </div>
            <div className="lg:col-span-7 lg:pl-10 lg:border-l lg:border-move-border flex items-end">
              <p className="text-lg text-move-body leading-relaxed">
                Six independent systems, one pipeline. Each step is opinionated, observable, and reproducible — so the artefacts you ship today still hold up when a reviewer questions them next quarter.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-move-border rounded-[24px] overflow-hidden border border-move-border">
            {CAPABILITIES.map((c, i) => (
              <motion.div
                key={c.t}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: easing }}
                className="bg-move-surface p-8 hover:bg-move-bg-subtle transition-colors"
              >
                <div className="w-10 h-10 rounded-xl border border-move-border bg-move-bg-subtle flex items-center justify-center mb-5">
                  <c.Icon className="w-4 h-4 text-move-ink" />
                </div>
                <h3 className="text-lg text-move-ink mb-2" style={{ fontWeight: 500 }}>{c.t}</h3>
                <p className="text-sm text-move-body leading-relaxed">{c.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Editorial quote ──────────────────────────────────────────────── */}
      <section className="relative py-28 px-6 lg:px-10 bg-move-ink text-white overflow-hidden">
        <div aria-hidden className="absolute inset-0 opacity-50"
             style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(212, 149, 107, 0.18), transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(126, 111, 180, 0.20), transparent 55%)" }} />
        <div className="max-w-[1100px] mx-auto relative">
          <Quote aria-hidden className="w-10 h-10 text-white/30 mb-8" />
          <blockquote className="font-heading leading-[1.15] tracking-tight"
                      style={{ fontWeight: 500, fontSize: "clamp(2rem, 3.6vw, 3.5rem)" }}>
            We used to spend two weeks turning research into a deck. MOVE turned it into a Friday afternoon — and the citations made the strategy survive contact with our board.
          </blockquote>
          <div className="mt-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-move-grad-1 via-move-grad-2 to-move-grad-3 flex items-center justify-center text-white" style={{ fontWeight: 500 }}>AK</div>
            <div>
              <div className="text-white" style={{ fontWeight: 500 }}>Alex Kim</div>
              <div className="text-sm text-white/60">Head of GTM, AI Platform Co.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section className="relative py-24 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-move-border rounded-[24px] overflow-hidden border border-move-border">
          {STATS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.1, ease: easing }}
                        className="bg-move-surface p-10">
              <div className="font-heading text-move-ink leading-none mb-3"
                   style={{ fontWeight: 500, fontSize: "clamp(3rem, 4vw, 4rem)",
                            backgroundImage: "var(--gradient-headline)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                {s.k}
              </div>
              <div className="text-move-body leading-relaxed">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="relative py-28 px-6 lg:px-10">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <span className="text-[11px] uppercase tracking-[0.25em] text-move-grad-3" style={{ fontWeight: 500 }}>FAQ</span>
            <h2 className="mt-4 font-heading tracking-tight text-move-ink"
                style={{ fontWeight: 500, fontSize: "clamp(2.25rem, 4vw, 3.5rem)" }}>
              Questions, answered honestly.
            </h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ.map((f, i) => (
              <AccordionItem key={i} value={`q-${i}`} className="rounded-[16px] border border-move-border bg-move-surface overflow-hidden">
                <AccordionTrigger className="px-6 py-5 text-left text-move-ink hover:no-underline" style={{ fontWeight: 500 }}>
                  <span className="text-base md:text-lg">{f.q}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 text-move-body leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="relative py-28 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto relative rounded-[32px] overflow-hidden border border-move-border bg-move-ink text-white">
          <div aria-hidden className="absolute inset-0 opacity-70"
               style={{ background: "radial-gradient(circle at 80% 50%, rgba(212, 149, 107, 0.35), transparent 55%), radial-gradient(circle at 20% 100%, rgba(126, 111, 180, 0.35), transparent 55%)" }} />
          <div className="relative px-8 md:px-16 py-20 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
            <div>
              <h2 className="font-heading tracking-tight leading-[1.02] text-white"
                  style={{ fontWeight: 500, fontSize: "clamp(2.5rem, 4.8vw, 4.5rem)" }}>
                Stop drafting decks.<br />Start shipping moves.
              </h2>
              <p className="mt-6 text-lg text-white/70 max-w-xl leading-relaxed">
                Your next GTM run is one company name away. We&apos;ll handle the research, strategy, and content — you stay in control at every gate.
              </p>
            </div>
            <div className="flex flex-col md:items-end gap-3">
              <Button asChild size="lg" data-testid="footer-cta-primary" className="bg-white text-move-ink hover:bg-white/90 h-14 px-7 text-base rounded-[14px]" style={{ fontWeight: 500 }}>
                <Link to="/research">Start your first run <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-white/80 hover:text-white hover:bg-white/10 h-14 px-5 rounded-[14px]">
                <Link to="/projects"><BookOpen className="mr-2 w-4 h-4" /> Browse example runs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-move-border py-10 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-move-muted">
          <div className="flex items-center gap-2">
            <img src={LOGO} alt="" aria-hidden="true" className="w-6 h-6" />
            <span className="text-move-ink" style={{ fontWeight: 500 }}>MOVE</span>
            <span>· The GTM operating system.</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/projects" className="hover:text-move-ink transition-colors">Projects</Link>
            <Link to="/research" className="hover:text-move-ink transition-colors">Research</Link>
            <Link to="/ideation" className="hover:text-move-ink transition-colors">Strategy</Link>
            <Link to="/export" className="hover:text-move-ink transition-colors">Export</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
