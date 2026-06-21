# INTEGRATION_ANALYSIS.md

## Existing Backend Capabilities (gtm_v4_fixed — verified in source)

All capabilities below were verified by reading the actual Python source.
No invented APIs.

### 1. Research agent (LangGraph)
- Entry: `pipeline.research_graph.run_research(query: str, url: str = "") → dict`
- Graph nodes: `input_guard → analyze → tools → generate → output_guard → finalize`
- Producers:
  - `ReportCore`-equivalent `Report` (title, executive_summary, SWOT, competitors, personas, market_trends, opportunities, risks, recommendations, confidence_level)
  - `sources` list (with `official`, `role`, `domain`)
  - Optional `output_guard.issues`, `_evidence_limitation`
- Tools available: `competitive_landscape_tool`, `market_analysis_tool`, `customer_intelligence_tool`, `internal_knowledge_tool`
- Guardrails: input policy (Tavily/keyword + LLM), URL validation, output quality with bounded revision loop

### 2. Strategy agent
- Entry: `agents.strategy_agent.generate_gtm_strategy(query, ToolPlan, report, sources) → GTMStrategy`
- Output schema (`core.schemas.GTMStrategy`):
  - `foundation`: positioning_statement, slot_statement (for/who_need/category/promise/unlike/proof), icp (primary_segment, firmographics, technographics, why_now, buying_committee), top_pains, trigger_events, disqualifiers, secondary_segments, beachhead, competitive_differentiation
  - `activation`: pricing (packaging_logic, tiers, anchor_strategy, commercial_motion, pricing_levers, pricing_risks), motion (primary, secondary, rationale, motion_risks), channel_plays, messaging_by_persona, content_engine (cadence, tofu/mofu/bofu)
  - `execution`: sales_playbook (qualification_framework, stages, must_have_collateral), demand_gen (levers, campaign_concepts), metrics (north_star_metric, input_metrics, funnel_kpis, health_metrics), roadmap_90day, risks
- Guardrails: `pipeline.guardrails.strategy_guardrails` + optional `evaluation.evaluate_strategy`

### 3. Content agent — Phase A (parallel with strategy)
- Entry: `agents.content_agent.generate_content_phase_a(query, ToolPlan, report) → ContentBundle`
- Scope (enforced in orchestrator):
  - `linkedin_posts` ≤ 3 (THOUGHT_LEADERSHIP / INDUSTRY_INSIGHT / PRODUCT_AWARENESS)
  - **blog_drafts and email_drafts forced to []**

### 4. Content agent — Phase B (requires approved strategy + approved Phase A)
- Entry: `agents.content_agent.generate_content_phase_b(query, ToolPlan, report, gtm, phase_a) → ContentBundle`
- Output includes `linkedin_posts`, `blog_drafts` (SEO/EDUCATIONAL), `email_drafts` (OUTBOUND/NURTURE/LAUNCH)
- Channel filter via `_filter_content(bundle, channels)` — valid channels: `linkedin`, `blog`, `seo`, `email`

### 5. Document exports
- `export.export.market_report_analysis_tool(result, fmt=pdf|word|pptx, path="") → {path}`
- `export.export_strategy.export_strategy_pdf(result, path?) → path`
- Underlying: `export_pdf.Market_report_analysis`, `export_docx.export_docx`, `export_pptx.export_pptx`

### 6. Orchestration & human-in-the-loop
- `agents.orchestrator.run_pipeline(result, regenerate_research)` — CLI-only, blocks on `input()` for:
  1. Approve / regenerate research
  2. Choose research export format
  3. Run strategy? (y/n) · Run content? (y/n)
  4. Approve / regenerate strategy
  5. Choose strategy export format
  6. Approve / regenerate Phase A
  7. Select Phase B channels (linkedin / blog / seo / email + optional pdf/ppt exports)
  8. Approve / regenerate Phase B
  9. Combined export format

### 7. Persistence (agent-side)
- `pipeline.memory.save_run(result)` / `pipeline.memory.log_approval(company, event)` write to SQLite at `STORAGE_DB` (default `./storage/gtm.db`).

### NOT supported by the backend (verified absent)
- No chat / “AI Copilot” endpoint or function exists.
- No “confidence score” or ROI on individual strategy options (only the merged `GTMStrategy` is produced).
- No channel allocation **percentages** (only `channel_plays` with `invest` as free-form text).
- No fixed KPI dashboard (no Market/Growth/Competitive/GTM Readiness scores).
- No “Master ZIP” combined package.
- No X (Twitter), Instagram, or paid-ads content templates.
- No competitor positioning x/y matrix coordinates.
- No real-time progress streaming inside the agent (the orchestrator only prints to stdout).

---

## Existing Frontend Features (MOVE-GTM-Web1-main — verified in source)

Pages (`/app/frontend/src/pages/`):
- `Landing.jsx` — marketing hero, features grid, "how it works", FAQ, final CTA.
- `CompanyResearch.jsx` — company-name + URL form, KPI scoreboard (Market / Growth / Competitive / GTM Readiness), competitor cards, positioning matrix, trend chart, market signals.
- `StrategyIdeation.jsx` — 4 AI recommendation cards with **confidence ring + Est. ROI + Impact** + a custom strategy textarea.
- `CommandCenter.jsx` — sidebar nav (9 sections), executive summary metrics, ICP, positioning framework, messaging cards, channel allocation **pie + bar**, campaign roadmap (30/60/90), KPI cards with progress %, AI Copilot side panel chat.
- `ContentStudio.jsx` — tabs: Social Content (LinkedIn / X / Instagram / Email / Blog / Ads), Strategy Files (PDF/PPTX/XLSX/ICS), Master Package (ZIP).

Global:
- `AICopilotDock.jsx` — floating chat assistant.
- `TopNav.jsx` — workspace switcher, search, notifications.

---

## Mapping (per UI screen)

### Landing — Supported by Backend
All copy describes real agent capabilities. Hero / features / how-it-works / FAQ retained.

### Research — Partially supported by Backend
- ✅ Inputs (now mapped to `query` + `url` to match `run_research(query, url)`).
- ❌ KPI scoreboard (Market / Growth / Competitive / GTM Readiness). **REMOVED.**
- ❌ Competitor positioning matrix (no x/y in backend). **REMOVED.**
- ❌ Synthetic trend chart with momentum %. **REMOVED.**
- ✅ Real competitors (companies + products + alternatives), personas, market_trends, opportunities, risks, recommendations, SWOT, sources — all rendered as-is.
- ✅ HITL approval gate (`POST /api/runs/{id}/approve_research` + `regenerate_research`).

### Ideation (Strategy review) — Supported by Backend
- ❌ 4 AI recommendations with confidence/ROI rings. **REMOVED** — backend produces ONE merged `GTMStrategy`, not a ranked list.
- ❌ Custom strategy textarea. **REMOVED** — no backend endpoint for user-customised strategies.
- ✅ Approve / Regenerate gates for Strategy and Phase A.
- ✅ Headline strategy summary + Phase A preview.

### Command Center — Mostly supported
- ✅ Foundation / ICP / Positioning / Messaging / Channels / Playbook / Roadmap / Metrics / Risks — all derived from `GTMStrategy`.
- ❌ Channel allocation **pie chart with %**. **REMOVED** — backend has no allocation %.
- ❌ KPI cards with target/actual/progress %. **REMOVED** — replaced by real `Metric` cards (metric name + target_band + cadence).
- ❌ AI Copilot side panel. **REMOVED** — no chat backend.

### Studio — Partially supported
- ✅ LinkedIn / Blog / Email tabs (real agent output).
- ❌ X / Instagram / Ads tabs. **REMOVED.**
- ❌ Master ZIP package + XLSX + ICS exports. **REMOVED.**
- ✅ Strategy PDF + Combined PDF / Word / PowerPoint exports via real agent exporters.
- ✅ Phase B channel selector + Approve / Regenerate gates.
