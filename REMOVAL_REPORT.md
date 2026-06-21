# REMOVAL_REPORT.md

All removals listed below were applied because the corresponding capability
does not exist in `gtm_v4_fixed`. No backend code was added to “support” a UI
feature — the UI was removed instead, per the integration rules.

## 1. Pages

| Page / Component | Reason | Action |
|---|---|---|
| `src/components/AICopilotDock.jsx` | No chat/copilot endpoint in agent system | **Deleted file**, removed from `App.js` |
| `src/lib/mockData.js` | Held fake strategies/social posts (no longer referenced) | **Deleted file** |

## 2. Research page

| Removed UI | Reason |
|---|---|
| 4 KPI tiles (Market / Growth / Competitive / GTM Readiness) | Agent emits no scoring system |
| Competitor positioning matrix (x/y bubbles) | `Competitor` schema has no coordinates |
| Synthesised "+118% YoY interest growth" trend chart | Agent emits no momentum series |
| "Northwind AI" hard-coded company copy | Was demo content, not a backend feature |

## 3. Ideation (Strategy) page

| Removed UI | Reason |
|---|---|
| 4 AI recommendation cards with confidence rings + Est. ROI + Impact | Agent emits exactly ONE merged `GTMStrategy` — no ranked options |
| "Confidence 92 / 87 / 84 / 79" hard-coded scores | Confidence scoring is not produced |
| "Create custom strategy" textarea + "Generate Strategy" button | No backend endpoint accepts a free-form user strategy prompt |

## 4. Command Center

| Removed UI | Reason |
|---|---|
| Channel allocation **pie chart with percentages** | `ChannelPlay` has `invest` (free text), no allocation % |
| Channel allocation **horizontal bar chart with %** | Same reason |
| KPI cards with `target / actual / progress %` | `Metric` schema is `metric / why / target_band / cadence` — no actual or progress |
| Pipeline & Revenue forecast bar chart (synthesised M1–M6 numbers) | Agent emits no monthly forecast |
| AI Copilot side panel chat (right rail) | No backend chat endpoint |
| "Strategy in scope · GPT-class reasoning" copy | Marketing claim with no backend, removed |

## 5. Content Studio

| Removed UI | Reason |
|---|---|
| Tab: **X (Twitter) posts** | Agent's `ContentBundle` schema does not include X |
| Tab: **Instagram posts** | Not in `ContentBundle` |
| Tab: **Ad copy** | Not in `ContentBundle` |
| Tab: **Strategy Files** with XLSX (`GTM_Budget.xlsx`) | Agent does not export Excel |
| Tab: **Strategy Files** with ICS (`GTM_Calendar.ics`) | Agent does not export calendar files |
| Tab: **Master Package** ZIP | Agent has no zip-bundle exporter |
| Strategy / X / Instagram / Ads sidebars | Same |

## 6. Landing

| Removed UI | Reason |
|---|---|
| "Trusted by GTM teams at Linear / Vercel / Loom / …" logos | Fabricated customer logos (already removed in prior iteration; re-verified absent) |
| Testimonials section | Fabricated quotes (already removed; re-verified) |
| Pricing FAQ ("Starter free / Team $79 / Business $249") | Not real |
| Integrations FAQ ("HubSpot / Salesforce / 30+ more") | Not implemented |
| Data privacy FAQ ("SOC 2 Type II / GDPR / HIPAA-ready") | Not certified |
| Hero claims like "in 38 seconds" / "12 minutes" | Not measured |
| "14-day free pilot" / "SOC 2 · No credit card · Cancel anytime" | Not real |

## 7. Mock data and helpers

| Removed | Reason |
|---|---|
| All mock entries in `lib/mockData.js` (COMPANY_PROFILE, KPIS, COMPETITORS, TREND_DATA, MARKET_SIGNALS, GTM_RECOMMENDATIONS, STRATEGY, SOCIAL_CONTENT, COPILOT_CONVERSATIONS, STRATEGY_FILES) | All replaced by adapters in `lib/transforms.js` that map directly from the real agent JSON |
| `lib/transforms.js` (old version) — heuristic synthetic KPI scoring | Replaced by a defensive, fact-only adapter |

## 8. Old API surface (removed from server.py)

| Endpoint | Why removed |
|---|---|
| `POST /api/runs` accepting `company_name + company_url` | Agent contract is `query + url`. New endpoint uses correct fields. |
| `_run_pipeline_sync` that drove `unified/orchestrator/graph.run_graph` | That orchestrator was a custom modified copy; replaced by a thin web orchestrator that calls the locked agent functions directly. |
| `_progress_cb` injection via state | Was a violation of "do not modify agent" — removed. |
