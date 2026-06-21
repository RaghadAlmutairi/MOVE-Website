# FEATURE_MAPPING.md

Every UI feature is mapped 1:1 to an actual gtm_v4_fixed backend function and the
HTTP route that exposes it.

| UI Surface | UI Element | Backend Function (agent) | API Endpoint | Action |
|---|---|---|---|---|
| Landing | Hero CTA "Start Your GTM Strategy" | — (navigation) | — | **Keep** |
| Landing | Features grid (6 cards) | research/strategy/content agents + exporters | — | **Keep** (copy describes only real capabilities) |
| Landing | "How it works" 4 steps | matches research → approve → strategy+phaseA → phaseB+export flow | — | **Keep** |
| Landing | FAQ | accurate descriptions of pipeline | — | **Keep** |
| Research | `query` input | `pipeline.research_graph.run_research(query, …)` | `POST /api/runs` | **Keep** |
| Research | `url` input | `run_research(…, url=…)` | `POST /api/runs` | **Keep** |
| Research | "Analyze" button | starts background research thread | `POST /api/runs` | **Keep** |
| Research | "Market Score" KPI tile | none — agent emits no such score | — | **Remove** |
| Research | "Growth Score" KPI tile | none | — | **Remove** |
| Research | "Competitive Pressure" KPI tile | none | — | **Remove** |
| Research | "GTM Readiness" KPI tile | none | — | **Remove** |
| Research | Competitor positioning x/y matrix | none — schema has no coordinates | — | **Remove** |
| Research | Synthesised momentum trend chart | none | — | **Remove** |
| Research | Industry Trends / Signals / Opportunities / Risks lists | `Report.market_trends / opportunities / risks / recommendations` | `GET /api/runs/{id}` | **Keep** (real data) |
| Research | Competitor cards | `Report.company_competitors / product_competitors / alternative_solutions` | `GET /api/runs/{id}` | **Keep** (real data) |
| Research | Persona cards | `Report.buyer_personas` | `GET /api/runs/{id}` | **Keep** (real data) |
| Research | Sources tab | `result.sources` | `GET /api/runs/{id}` | **Keep** (added) |
| Research | "Approve & continue" gate | `orchestrator._has_llm_output` + parallel stage entry | `POST /api/runs/{id}/approve_research` | **Keep** |
| Research | "Regenerate" | re-invokes `run_research` | `POST /api/runs/{id}/regenerate_research` | **Keep** |
| Ideation | 4 AI recommendation cards (rings + ROI) | none — backend emits one merged `GTMStrategy` | — | **Remove** |
| Ideation | Custom-strategy textarea + "Generate Strategy" | none — no user-prompt strategy endpoint | — | **Remove** |
| Ideation | Strategy preview + Approve | `agents.orchestrator._run_strategy` (called by web orchestrator) | `POST /api/runs/{id}/approve_strategy` / `regenerate_strategy` | **Keep** |
| Ideation | Phase A preview + Approve | `agents.orchestrator._run_content_phase_a` | `POST /api/runs/{id}/approve_phase_a` / `regenerate_phase_a` | **Keep** |
| Command Center | North-star + positioning | `GTMStrategy.north_star`, `foundation.positioning_statement` | `GET /api/runs/{id}` | **Keep** |
| Command Center | Slot statement, beachhead, ICP, top pains, triggers, disqualifiers | `GTMStrategy.foundation.*` | `GET /api/runs/{id}` | **Keep** |
| Command Center | Competitive differentiation cards | `GTMStrategy.foundation.competitive_differentiation` | `GET /api/runs/{id}` | **Keep** |
| Command Center | Messaging by persona | `GTMStrategy.activation.messaging_by_persona` | `GET /api/runs/{id}` | **Keep** |
| Command Center | Channel allocation **pie + %** | none — `channel_plays` has no allocation % | — | **Remove** (replaced by ChannelPlay cards) |
| Command Center | Channel plays cards | `GTMStrategy.activation.channel_plays` | `GET /api/runs/{id}` | **Keep** |
| Command Center | Sales playbook stages | `GTMStrategy.execution.sales_playbook.stages` | `GET /api/runs/{id}` | **Keep** |
| Command Center | 30 / 60 / 90 roadmap | `GTMStrategy.execution.roadmap_90day` | `GET /api/runs/{id}` | **Keep** |
| Command Center | Metrics — target/actual/progress % | none — schema has `target_band` + `cadence` only | — | **Remove** (replaced) |
| Command Center | Metrics — north-star + columns | `GTMStrategy.execution.metrics` | `GET /api/runs/{id}` | **Keep** |
| Command Center | Strategic risks | `GTMStrategy.execution.risks` | `GET /api/runs/{id}` | **Keep** |
| Command Center | AI Copilot side panel (chat) | none — no chat backend | — | **Remove** |
| Studio | Content positioning_line + pillars | `ContentBundle.positioning_line / messaging_pillars` | `GET /api/runs/{id}` | **Keep** |
| Studio | LinkedIn posts | `ContentBundle.linkedin_posts` | `GET /api/runs/{id}` | **Keep** |
| Studio | Blog drafts | `ContentBundle.blog_drafts` (Phase B) | `GET /api/runs/{id}` | **Keep** |
| Studio | Email drafts | `ContentBundle.email_drafts` (Phase B) | `GET /api/runs/{id}` | **Keep** |
| Studio | X / Instagram / Ads tabs | none | — | **Remove** |
| Studio | Phase B channel selector + Run | `orchestrator._run_content_phase_b(channels)` | `POST /api/runs/{id}/phase_b` | **Keep** |
| Studio | Phase B Approve / Regenerate | matches HITL gate | `POST /api/runs/{id}/approve_phase_b` / `regenerate_phase_b` | **Keep** |
| Studio | PDF export | `market_report_analysis_tool(fmt=pdf)` | `POST /api/runs/{id}/export {format:"pdf"}` | **Keep** |
| Studio | Word export | `market_report_analysis_tool(fmt=word)` | `POST /api/runs/{id}/export {format:"word"}` | **Keep** |
| Studio | PowerPoint export | `market_report_analysis_tool(fmt=pptx)` | `POST /api/runs/{id}/export {format:"pptx"}` | **Keep** |
| Studio | Strategy PDF export | `export_strategy.export_strategy_pdf(result)` | `POST /api/runs/{id}/export {format:"strategy_pdf"}` | **Keep** |
| Studio | XLSX budget export | none | — | **Remove** |
| Studio | ICS calendar export | none | — | **Remove** |
| Studio | Master ZIP package | none | — | **Remove** |
| Global | Run history dropdown | run docs in Mongo | `GET /api/runs` | **Keep** (added) |
| Global | Workspace switcher | none (was decorative) | — | **Keep as cosmetic only — no API claim** |
| Global | Notification bell | none (was decorative) | — | **Keep as cosmetic only — no real items** |
| Global | Search (⌘K) | none | — | **Keep button shape; no search backend, no false claim** |
