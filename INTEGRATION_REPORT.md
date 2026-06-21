# INTEGRATION_REPORT.md

## Outcome

A production-ready application that drives the `gtm_v4_fixed` multi-agent
system end-to-end from a React UI, **without modifying any agent code**.

## Architectural decisions

### 1. Agent code is byte-identical to gtm_v4_fixed
- Files in `/app/backend/agent/` were copied verbatim from `gtm_v4_fixed/gtm_v4_fixed/`.
- Verified by `diff -q` after copy (see `INTEGRATION_ANALYSIS.md` audit).
- The only files removed from the source tree were the agent's own `.env`
  (we route env through `/app/backend/.env`) and the demo
  `market_research_report.md` (a stale CLI artefact, never imported by code).
- No agent prompts, schemas, tools, guardrails or graph nodes were touched.

### 2. Web orchestrator instead of CLI orchestrator
- `agents/orchestrator.run_pipeline` is **CLI-driven** — it calls `input()` at
  every HITL gate, which is incompatible with a stateless HTTP server.
- Adding a flag to `orchestrator.py` to bypass `input()` would constitute
  modifying agent behaviour. **Forbidden.**
- Instead, `/app/backend/web_orchestrator.py` was created. It imports the
  agent's PUBLIC stage runners (`_run_strategy`, `_run_content_phase_a`,
  `_run_content_phase_b`, `_has_llm_output`, the exporters, and
  `pipeline.research_graph.run_research`) and drives them in the **exact same
  order, with the exact same parallelism**, but exposes each `input()` gate
  as an HTTP endpoint.
- Net result: the CLI flow is preserved (`python agent/main.py` still works)
  and the web flow follows the same documented contract.

### 3. Persistence
- MongoDB (`gtm_runs` collection) stores every run document and survives
  refresh / browser switch. The agent's own SQLite `memory.save_run()` is
  preserved alongside (it still writes to `./storage/gtm.db`).
- Per-run filesystem outputs live in `/app/backend/runs/{run_id}/` — never
  inside the agent directory.

### 4. Frontend
- React/CRA frontend re-uses the MOVE-GTM-Web1 visual design where the
  underlying feature exists in the backend.
- A new `lib/transforms.js` translates the agent's real Pydantic schemas
  (`Report`, `GTMStrategy`, `ContentBundle`) into view-models. No fake numbers.
- A new `lib/RunContext.jsx` long-polls the active run (2.5 s) and broadcasts
  the doc to all pages, so the user can refresh anywhere and resume.

## API surface (`/api`)

| Method & path | Purpose |
|---|---|
| `GET  /api/health` | Liveness |
| `POST /api/runs` | Create a run; starts research in a background thread |
| `GET  /api/runs` | History (paginated) |
| `GET  /api/runs/{id}` | Full run state (incl. result) |
| `DELETE /api/runs/{id}` | Delete run + per-run files |
| `POST /api/runs/{id}/approve_research` | Gate 1 → launches strategy + Phase A |
| `POST /api/runs/{id}/regenerate_research` | Re-run research stage |
| `POST /api/runs/{id}/approve_strategy` | Gate 2a |
| `POST /api/runs/{id}/regenerate_strategy` | Re-run strategy |
| `POST /api/runs/{id}/approve_phase_a` | Gate 2b |
| `POST /api/runs/{id}/regenerate_phase_a` | Re-run Phase A |
| `POST /api/runs/{id}/phase_b` | Run Phase B with channels |
| `POST /api/runs/{id}/approve_phase_b` | Gate 3 |
| `POST /api/runs/{id}/regenerate_phase_b` | Re-run Phase B |
| `POST /api/runs/{id}/export` | Generate {pdf, word, pptx, strategy_pdf} |
| `GET  /api/runs/{id}/files/{filename}` | Stream an exported file |

Every endpoint is backed by a real agent function (see `FEATURE_MAPPING.md`).

## Files changed

### Created
- `/app/backend/web_orchestrator.py` — non-interactive driver (does not modify agents)
- `/app/backend/server.py` — FastAPI gateway
- `/app/backend/.env` — keys preserved verbatim from the agent's `.env`
- `/app/frontend/src/lib/api.js` — typed REST client (1:1 with backend routes)
- `/app/frontend/src/lib/transforms.js` — view-model adapters
- `/app/frontend/src/lib/RunContext.jsx` — active-run polling context
- `/app/frontend/src/components/RunStatusPill.jsx` — global run status + history switcher
- `INTEGRATION_ANALYSIS.md`, `FEATURE_MAPPING.md`, `REMOVAL_REPORT.md`, `INTEGRATION_REPORT.md`, `TEST_REPORT.md`

### Replaced (UI only)
- `/app/frontend/src/App.js` — added `RunProvider`, removed `AICopilotDock`
- `/app/frontend/src/pages/Landing.jsx` — copy reflects only real capabilities
- `/app/frontend/src/pages/CompanyResearch.jsx` — driven by real `Report`
- `/app/frontend/src/pages/StrategyIdeation.jsx` — Strategy + Phase A gates
- `/app/frontend/src/pages/CommandCenter.jsx` — driven by real `GTMStrategy`
- `/app/frontend/src/pages/ContentStudio.jsx` — content + Phase B + real exports

### Deleted
- `/app/frontend/src/components/AICopilotDock.jsx`
- `/app/frontend/src/lib/mockData.js`

### Agent directory — unchanged
- All 40+ files under `/app/backend/agent/` are bit-for-bit identical to
  `gtm_v4_fixed/gtm_v4_fixed/`. Confirmed by `diff -q`.

## Constraints honoured
- No invented endpoints.
- No mock data shipped to the user.
- No backend capabilities added to satisfy UI.
- All UI features either map to a real agent function or were removed.
