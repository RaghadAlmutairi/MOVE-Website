// Mock data for the MOVE — Beamdata GTM AI demo experience.

export const COMPANY_PROFILE = {
  name: "Northwind AI",
  website: "northwind.ai",
  tagline: "Workflow intelligence for revenue teams",
  overview:
    "Northwind AI builds an agentic workflow platform that helps RevOps and GTM teams orchestrate prospecting, account research and outreach in a single canvas — combining proprietary intent data with generative reasoning.",
  products: [
    { name: "Northwind Canvas", desc: "Drag-and-drop GTM workflow builder" },
    { name: "Pulse Intent", desc: "Real-time buyer signals from 90+ sources" },
    { name: "Co-pilot for SDRs", desc: "Outbound assistant with playbooks" },
  ],
  valueProps: [
    "Compress prospect-to-meeting cycle by 4.2x",
    "First-party intent + LLM reasoning, no black box",
    "Replaces 6+ point tools (Outreach, Apollo, Clay, ZoomInfo lite)",
  ],
  audience: [
    "Series B–D B2B SaaS",
    "RevOps + SDR Leaders",
    "Mid-market account executives",
    "$10M–$200M ARR",
  ],
};

export const KPIS = [
  { label: "Market Score", value: 87, delta: "+6 vs Q3", tone: "primary" },
  { label: "Growth Score", value: 92, delta: "Hyper-growth", tone: "success" },
  { label: "Competitive Pressure", value: 64, delta: "Crowded mid", tone: "warning" },
  { label: "GTM Readiness", value: 79, delta: "Launch-ready", tone: "accent" },
];

export const COMPETITORS = [
  { name: "Clay", logo: "C", funding: "$62M Series B", strength: 92, weakness: "Steep learning curve", focus: "Data enrichment" },
  { name: "Apollo.io", logo: "A", funding: "$110M Series D", strength: 88, weakness: "Generic playbooks", focus: "Sales engagement" },
  { name: "Outreach", logo: "O", funding: "$489M total", strength: 81, weakness: "Legacy stack", focus: "Sequencing" },
  { name: "Salesloft", logo: "S", funding: "$245M total", strength: 78, weakness: "Slow innovation", focus: "Cadences" },
  { name: "Common Room", logo: "Cr", funding: "$32M Series B", strength: 71, weakness: "Niche focus", focus: "Community signals" },
];

export const TREND_DATA = [
  { month: "Jan", search: 42, mentions: 28, investment: 18 },
  { month: "Feb", search: 48, mentions: 34, investment: 22 },
  { month: "Mar", search: 56, mentions: 41, investment: 31 },
  { month: "Apr", search: 64, mentions: 49, investment: 37 },
  { month: "May", search: 71, mentions: 58, investment: 44 },
  { month: "Jun", search: 78, mentions: 66, investment: 52 },
  { month: "Jul", search: 84, mentions: 72, investment: 61 },
  { month: "Aug", search: 91, mentions: 81, investment: 73 },
];

export const MARKET_SIGNALS = [
  { type: "opportunity", text: "47% of mid-market RevOps leaders plan to consolidate tooling in 2026" },
  { type: "opportunity", text: "AI-native GTM tools see 3.2x faster sales cycles" },
  { type: "risk", text: "Hyperscalers (Salesforce, HubSpot) launching agentic features" },
  { type: "risk", text: "Buyer fatigue from AI tool proliferation — differentiation critical" },
  { type: "opportunity", text: "Series B–D SaaS companies cutting headcount but increasing tool spend" },
];

export const GTM_RECOMMENDATIONS = [
  {
    id: "r1",
    title: "Land-and-Expand via RevOps Champions",
    description:
      "Target RevOps leaders at Series B–D companies with a 14-day pilot focused on one painful workflow. Convert champions into multi-team expansion.",
    impact: "High",
    confidence: 92,
    roi: "5.4x in 12 months",
    reasoning:
      "RevOps champions have budget authority and influence across SDR, AE, and CS. Pilots reduce buying friction; expansion drives NRR.",
  },
  {
    id: "r2",
    title: "Anti-Bloat Replacement Campaign",
    description:
      "Position Northwind as the consolidation play. Bundle Pulse Intent + Canvas to replace 4–6 incumbent tools at 60% the cost.",
    impact: "High",
    confidence: 87,
    roi: "4.1x in 9 months",
    reasoning:
      "CFO-led tool consolidation is the #1 GTM trend of 2026. ROI calculator + side-by-side comparisons accelerate close.",
  },
  {
    id: "r3",
    title: "Community-Led Growth via Operators",
    description:
      "Launch the 'Modern RevOps Stack' community + monthly virtual summits. Build authority through templates, teardowns and playbooks.",
    impact: "Medium-High",
    confidence: 84,
    roi: "3.2x in 18 months",
    reasoning:
      "RevOps is a tight, opinionated community. Owning the conversation creates inbound and brand defensibility.",
  },
  {
    id: "r4",
    title: "Partner Channel with Agencies",
    description:
      "Recruit 30 RevOps consultancies as implementation partners with rev-share. They sell-with and deliver in 6 weeks.",
    impact: "Medium",
    confidence: 79,
    roi: "2.6x in 14 months",
    reasoning:
      "Agencies have trust + delivery capacity. Channel mitigates direct hiring and accelerates time-to-value for buyers.",
  },
];

export const STRATEGY = {
  name: "Land-and-Expand via RevOps Champions",
  summary:
    "A precision-targeted GTM motion focused on Series B–D B2B SaaS RevOps leaders. We win the champion first via a 14-day workflow pilot, then expand to SDR, AE, and CS teams within the same account. Differentiation is built on consolidation economics and AI-native reasoning. The 90-day plan front-loads case-study production and partner enablement.",
  icp: {
    companyTypes: ["B2B SaaS", "Vertical SaaS", "PLG with sales overlay"],
    industries: ["RevTech", "DevTools", "Fintech infra", "MarTech"],
    revenue: "$10M – $200M ARR",
    employees: "80 – 800",
    painPoints: [
      "Fragmented GTM tool stack (avg. 11 tools)",
      "Slow handoff between SDR → AE",
      "No unified buyer signal layer",
      "Pressure from CFO to consolidate",
    ],
    triggers: [
      "New VP of RevOps or CRO hired (last 90 days)",
      "Series B/C funding announcement",
      "Headcount reduction with revenue target unchanged",
      "Renewal of incumbent tooling (Outreach, Apollo)",
    ],
  },
  positioning: {
    problem: "Modern GTM teams run on 11+ disconnected tools, drowning in signals they can't act on.",
    solution: "One agentic canvas where intent data, account research and outreach are orchestrated end-to-end.",
    differentiator: "First-party intent + transparent LLM reasoning. No prompt-engineering required.",
    proof: "4.2x faster prospect-to-meeting at Loom, Vercel, Linear, and 38 other GTM teams.",
  },
  messaging: {
    valueProp: "Replace your GTM stack with one agentic canvas that thinks, prospects and writes — in your voice.",
    elevator:
      "Northwind is the agentic GTM platform for RevOps leaders who want to consolidate 6 tools into one, accelerate pipeline by 4x, and finally see what their buyers are signalling — without black-box AI.",
    email:
      "Subject: 4.2x faster pipeline at Linear — here's how\n\nHi {firstName},\n\nI noticed {company} just closed Series C — congratulations. Most RevOps leaders we work with at this stage face the same wall: 11 tools, fragmented signals, slow SDR→AE handoff.\n\nLinear consolidated 6 tools into Northwind and now closes meetings 4.2x faster. Would a 14-day pilot focused on one painful workflow be worth 20 minutes next week?\n\n—{senderName}",
    linkedin:
      "{firstName} — saw your post about RevOps consolidation. 100%. We just helped Linear collapse Outreach + Apollo + Clay into one canvas. 4.2x faster meetings, $180k/yr saved. Open to a 14-day pilot? No deck, just a working workflow.",
  },
  channels: [
    { name: "LinkedIn", value: 28, color: "#A855F7" },
    { name: "SEO + Content", value: 18, color: "#22D3EE" },
    { name: "Email Outbound", value: 16, color: "#E879F9" },
    { name: "Partnerships", value: 14, color: "#10B981" },
    { name: "Events", value: 12, color: "#F59E0B" },
    { name: "Paid Ads", value: 8, color: "#EC4899" },
    { name: "Community", value: 4, color: "#14B8A6" },
  ],
  roadmap: [
    {
      phase: "Days 1–30",
      title: "Foundation & Champions",
      items: [
        "Lock 5 design-partner pilots (Series B SaaS)",
        "Publish RevOps consolidation calculator",
        "Train SDR pod on champion-led playbook",
        "Launch 'Modern RevOps Stack' newsletter",
      ],
    },
    {
      phase: "Days 31–60",
      title: "Velocity & Proof",
      items: [
        "Ship 3 case studies (Linear, Vercel, Loom)",
        "Run 4-city RevOps roundtable series",
        "Activate 10 agency channel partners",
        "Launch comparison hub (vs. Clay / Apollo)",
      ],
    },
    {
      phase: "Days 61–90",
      title: "Scale & Expand",
      items: [
        "Open expansion motion into SDR + CS teams",
        "Launch ABM campaign for top 200 accounts",
        "Host inaugural 'RevOps Summit' (virtual, 2k attendees)",
        "Publish State of Agentic GTM 2026 report",
      ],
    },
  ],
  metrics: [
    { label: "Pipeline", target: "$12.4M", actual: "$8.6M", progress: 69, tone: "primary" },
    { label: "Leads (MQLs)", target: "1,800", actual: "1,247", progress: 69, tone: "secondary" },
    { label: "Meetings Booked", target: "320", actual: "241", progress: 75, tone: "accent" },
    { label: "CAC", target: "$3,200", actual: "$2,840", progress: 89, tone: "success" },
    { label: "Conversion Rate", target: "14%", actual: "11.6%", progress: 83, tone: "warning" },
    { label: "Revenue (New ARR)", target: "$3.6M", actual: "$2.4M", progress: 67, tone: "primary" },
  ],
};

export const COPILOT_CONVERSATIONS = [
  { role: "ai", text: "I've analyzed Northwind's positioning. Want me to sharpen the differentiator against Clay specifically?" },
  { role: "user", text: "Yes, focus on the transparency angle." },
  { role: "ai", text: "Updated positioning: 'Clay automates with templates. Northwind reasons with transparent agents — every decision is explainable.' Should I propagate this to the messaging framework?" },
];

export const SOCIAL_CONTENT = {
  linkedin: [
    {
      id: "li-1",
      title: "Manifesto: The Anti-Bloat GTM Stack",
      preview:
        "Your GTM stack has 11 tools. Your team uses 3. The other 8 are theater.\n\nIn 2026, the winning RevOps leaders are doing one thing: collapsing the stack...",
      meta: "Recommended: Tuesday 7:42 AM",
    },
    {
      id: "li-2",
      title: "Case Study Thread — Linear",
      preview:
        "How Linear consolidated 6 GTM tools into 1 — and made their SDR team 4.2x faster.\n\nA breakdown of the 14-day pilot, the metrics, and the org-design changes...",
      meta: "Recommended: Thursday 8:15 AM",
    },
    {
      id: "li-3",
      title: "Hot Take — Agentic GTM is Not a Feature",
      preview:
        "'Agentic AI' is becoming the new 'cloud-native'. Buzzword inflation is real.\n\nHere's the honest test: if your AI can't explain why it picked an account, it's not agentic. It's autocomplete...",
      meta: "Recommended: Monday 6:30 AM",
    },
  ],
  x: [
    {
      id: "x-1",
      title: "The 6-Tool Replacement Tweet",
      preview:
        "Outreach + Apollo + Clay + ZoomInfo + Lavender + Gong notetaker = $94k/yr.\n\nNorthwind replaces all 6 for $36k.\n\nMath isn't a vibe.",
      meta: "Quote-tweet bait — high virality",
    },
    {
      id: "x-2",
      title: "Founder POV Thread",
      preview:
        "We built Northwind because I was tired of paying $94k/yr for tools my SDR pod opens twice a week.\n\nHere's what we learned shipping agentic GTM to 100+ teams... 🧵",
      meta: "Thread, 9 posts",
    },
  ],
  instagram: [
    {
      id: "ig-1",
      title: "Reel — Day in the Life of a Modern SDR",
      preview:
        "60-second cinematic reel. SDR opens laptop, Northwind already surfaced 12 hot accounts. Hands-on dashboard footage. Voiceover.",
      meta: "Reel concept + storyboard",
    },
  ],
  email: [
    {
      id: "em-1",
      title: "Cold Email — Series C Trigger",
      preview:
        "Subject: 4.2x faster pipeline at Linear — here's how\n\nHi {firstName},\nI noticed {company} just closed Series C...",
      meta: "Sequence, 4 touches",
    },
    {
      id: "em-2",
      title: "Nurture — Consolidation Calculator",
      preview:
        "Subject: How much is your GTM stack costing you?\n\nMost RevOps leaders we talk to are paying $87–$140k/yr for tools their team uses <30% of the time...",
      meta: "Single send, nurture",
    },
  ],
  blog: [
    {
      id: "bl-1",
      title: "State of Agentic GTM 2026",
      preview:
        "We surveyed 412 RevOps leaders across $10M–$500M ARR companies. The findings reshape how we think about agentic AI in go-to-market...",
      meta: "Long-form, 2,400 words",
    },
    {
      id: "bl-2",
      title: "The Anti-Bloat Manifesto",
      preview:
        "Eleven tools. Three logins. Zero clarity. The modern GTM stack is a Frankenstein and your CFO knows it...",
      meta: "Manifesto, 1,200 words",
    },
  ],
  ads: [
    {
      id: "ad-1",
      title: "LinkedIn Ad — Champion Persona",
      preview:
        "'I cut our GTM stack from 11 tools to 1 — and my SDR pod is 4x faster.' — Sarah K., Head of RevOps, Linear.\n\nSee the 14-day pilot →",
      meta: "Persona: Head of RevOps",
    },
    {
      id: "ad-2",
      title: "Google Search — Competitor Term",
      preview:
        "Alternative to Clay? Northwind reasons, doesn't template. Transparent AI, agentic workflows. 14-day pilot, no credit card.",
      meta: "Keyword: 'clay alternative'",
    },
  ],
};

export const STRATEGY_FILES = [
  { name: "GTM_Strategy.pdf", size: "4.2 MB", icon: "FileText", color: "#EF4444" },
  { name: "GTM_Presentation.pptx", size: "12.8 MB", icon: "Presentation", color: "#F97316" },
  { name: "GTM_Budget.xlsx", size: "286 KB", icon: "FileSpreadsheet", color: "#10B981" },
  { name: "GTM_Calendar.ics", size: "18 KB", icon: "Calendar", color: "#A855F7" },
];
