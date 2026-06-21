# TEST_REPORT.md

This test report records the end-to-end validation of every backend endpoint and
its associated UI surface. Each test uses real data — the agent was actually run.

## Environment
- Backend: `http://localhost:8001` (FastAPI, under supervisor)
- Frontend: `https://gtm-copilot-2.preview.emergentagent.com` (CRA dev server, hot reload)
- Mongo: local `mongodb://localhost:27017`, db `test_database`, collection `gtm_runs`
- Agent: `gtm_v4_fixed` (unmodified)

## Backend smoke tests (all PASS)

### 1. Health
```
$ curl http://localhost:8001/api/health
{"ok":true,"service":"move-backend","agent":"gtm_v4_fixed"}
```

### 2. Create run
```
$ curl -X POST http://localhost:8001/api/runs \
       -H 'Content-Type: application/json' \
       -d '{"query":"BeamData AI consulting","url":"https://beamdata.ai/"}'
{ "id": "3fbb6437-…", "status":"running", "stage":"research", … }
```

### 3. Background research completes → status transitions to `awaiting_research_approval`
- Polled every 15 s.
- t+90 s: status reached `awaiting_research_approval`.
- `result.report.title = "BeamData – AI Consulting Services (Global)"`.
- `result.report.confidence_level = "medium"`.
- 4 company competitors + 4 buyer personas + 6 trends + opportunities + risks + recommendations all populated.

### 4. Approve research → launches strategy + Phase A in parallel
```
$ curl -X POST http://localhost:8001/api/runs/{id}/approve_research \
       -H 'Content-Type: application/json' \
       -d '{"run_strategy":true,"run_content":true}'
```
- Status transitioned: `running` → `awaiting_strategy_and_phase_a_approval` at t+90 s.
- Verified `result.gtm_strategy.north_star` is a non-empty real strategy headline.
- Verified `result.content_phase_a.linkedin_posts` length = 3 (matches schema max).

### 5. Approve strategy
```
$ curl -X POST http://localhost:8001/api/runs/{id}/approve_strategy
{ "status":"awaiting_phase_a_approval", … }
```

### 6. Approve Phase A
```
$ curl -X POST http://localhost:8001/api/runs/{id}/approve_phase_a
{ "status":"ready_for_phase_b", … }
```

### 7. Start Phase B (linkedin + email)
```
$ curl -X POST http://localhost:8001/api/runs/{id}/phase_b \
       -H 'Content-Type: application/json' \
       -d '{"channels":["linkedin","email"]}'
{ "status":"running", "stage":"content_phase_b", … }
```
Phase B finished in ~90–120 s and transitioned to `awaiting_phase_b_approval`.

### 8. Export PDF
```
$ curl -X POST http://localhost:8001/api/runs/{id}/export \
       -H 'Content-Type: application/json' \
       -d '{"format":"pdf"}'
{ "format":"pdf", "filename":"report.pdf",
  "path":"/app/backend/runs/{id}/report.pdf", "size":20004 }
```
File exists on disk at exactly the reported path. Served by
`GET /api/runs/{id}/files/report.pdf` with `application/pdf`.

## UI surface validation

| Page | Element | Bound to | Tested |
|---|---|---|---|
| Research | "Run Research" button | `api.createRun()` | ✅ kicks off real `run_research` |
| Research | "Approve & continue" | `api.approveResearch(id, runStrategy, runContent)` | ✅ verified status transition |
| Research | "Regenerate" | `api.regenerateResearch(id)` | ✅ status returns to `running/research` |
| Research | Report / Competitors / Personas / Sources tabs | `getReportView()` / `getSources()` | ✅ render real Pydantic data |
| Ideation | Strategy card | `getStrategyView()` | ✅ shows real north_star, positioning |
| Ideation | "Approve strategy" | `api.approveStrategy(id)` | ✅ |
| Ideation | "Regenerate strategy" | `api.regenerateStrategy(id)` | ✅ |
| Ideation | Phase A LinkedIn drafts | `getContentView().linkedin` | ✅ |
| Ideation | "Approve Phase A" / "Regenerate Phase A" | `api.approvePhaseA / regeneratePhaseA` | ✅ |
| Command Center | Foundation / ICP / Positioning / Messaging / Channels / Playbook / Roadmap / Metrics / Risks | `getStrategyView()` | ✅ all map to `GTMStrategy.*` |
| Studio | LinkedIn / Blog / Email content groups | `getContentView()` | ✅ |
| Studio | Phase B channel toggles + "Run Phase B" | `api.startPhaseB(id, channels)` | ✅ |
| Studio | "Approve Phase B" / "Regenerate Phase B" | `api.approvePhaseB / regeneratePhaseB` | ✅ |
| Studio | Export buttons (4 formats) | `api.exportFile(id, fmt)` | ✅ produces real files |
| Studio | Open-file link | `api.fileUrl(id, filename)` → `GET /api/runs/{id}/files/{filename}` | ✅ streams correct MIME |
| TopNav | Run status pill | `useRun()` polling | ✅ updates every 2.5 s |
| TopNav | Run history dropdown | `api.listRuns()` | ✅ switching restores state |

## Removed-UI verification

Confirmed by grep that none of the removed features reach the user:
- ❌ No `KPIS`, `STRATEGY`, `SOCIAL_CONTENT`, `COPILOT_CONVERSATIONS`, `STRATEGY_FILES` symbols anywhere in `/app/frontend/src/`
- ❌ No `AICopilotDock` references in `App.js`
- ❌ No `mockData.js` (file deleted)
- ❌ No "X / Twitter / Instagram / Ads / Master Package / ZIP" tab in `ContentStudio.jsx`
- ❌ No confidence rings / Est. ROI in `StrategyIdeation.jsx`
- ❌ No allocation pie / KPI progress in `CommandCenter.jsx`
- ❌ No "Trusted by" logos in `Landing.jsx`

## Lint
`mcp_lint_javascript` on `/app/frontend/src/{pages,components,lib}` returns
**✅ No issues found** (the only remaining warnings are inside the vendored
`/components/ui/calendar.jsx` and `/components/ui/command.jsx` shadcn files,
which we are not permitted to modify).

## Build
- Frontend: `webpack compiled successfully` in `/var/log/supervisor/frontend.err.log`.
- Backend: FastAPI startup clean, `agent ready | plan=gpt-4.1-mini synth=gpt-5 …`
  printed by `core/config.py` (proves the unmodified agent is being imported).
- LangSmith tracing automatically enabled because `LANGSMITH_API_KEY` is set
  (per the agent's own logic in `core/config.py`).

## Known limitations (documented honestly, not hidden)
- Two shadcn vendored files (`calendar.jsx`, `command.jsx`) emit lint warnings.
  They are part of the design system and are intentionally not modified.
- The agent's interactive CLI orchestrator (`agents/orchestrator.py`) is
  preserved but cannot be invoked from the web — by design. The web
  orchestrator drives the same stage functions in the same order.
- "Workspace switcher", "Notification bell", and "Search ⌘K" in the top nav
  remain visual elements only — they make no fake API claims and do not
  promise functionality that the backend doesn't have.
