# MOVE — GTM AI Platform — PRD

## Original Problem Statement
Build a premium enterprise SaaS web application called **MOVE** (originally Beamdata GTM AI). A full-stack web application with GTM (Go-To-Market) agent workflows: Company Research → Strategy Ideation → Strategy Studio → Content Studio. Must integrate with the user's provided LangGraph agent system **without modifying the agent code itself**.

## Locked Constraints
- The GTM agent at `/app/backend/agent/` is a **black box**. Do NOT modify its prompts, tools, agents, schemas, or pipeline.
- All HTTP routes are mounted under `/api`.
- Env-driven config only (`MONGO_URL`, `DB_NAME`, `OPENAI_API_KEY`, `REACT_APP_BACKEND_URL`).

## Architecture
- **Frontend** (`/app/frontend`): React + Tailwind + shadcn/ui. Pages: Landing, CompanyResearch, StrategyIdeation, CommandCenter (Studio), ContentStudio.
- **Backend** (`/app/backend`):
  - `server.py` — FastAPI gateway (`/api/*`), polls/serves runs from Mongo.
  - `web_orchestrator.py` — drives the agent pipeline (research → parallel strategy + Phase A → Phase B → exports) without touching agent code.
  - `chat.py` — isolated OpenAI-backed chat helper for the in-app chat panel.
  - `agent/` — locked LangGraph agent (`agents/orchestrator`, `pipeline/research_graph`, `export/*`, etc.).
- **Storage**: MongoDB (`gtm_runs` collection) + filesystem (`/app/backend/runs/{run_id}/`) for export artifacts.

## API Contract (under `/api`)
- `GET  /health` · `POST /runs` · `GET /runs` · `GET /runs/{id}` · `DELETE /runs/{id}`
- HITL gates: `POST /runs/{id}/{approve|regenerate}_{research|strategy|phase_a|phase_b}`
- `POST /runs/{id}/phase_b` (channel selection)
- `POST /runs/{id}/export` body `{format: pdf|word|pptx|strategy_pdf}`
- `GET  /runs/{id}/files/{filename}` (download)
- `POST /runs/{id}/chat` body `{scope: research|strategy, messages: [...]}`

## Design System (current)
Light editorial theme: cream background `#FBFAF7`, ink `#1A1D2E`, coral→mauve→indigo gradient (`var(--gradient-headline)`). Tailwind tokens at `move-*` and `ink-*`. Logo lockup = bolt mark on dark capsule + "MOVE" gradient wordmark.

## Changelog
### 2026-06-23 — User-supplied UI integration
- Integrated the user's frontend redesign from `MOVE-GTM-Platform.zip`:
  - New `index.css` (cream/coral/mauve light theme tokens)
  - New `tailwind.config.js` (move-* color tokens)
  - Redesigned pages: Landing, CompanyResearch, StrategyIdeation, CommandCenter, ContentStudio
  - New components: `ProgressTracker`, `ResearchSourcesDrawer` (Sources gated behind a button drawer instead of inline)
  - Updated TopNav logo lockup to the new MOVE bolt + gradient wordmark
- Backend kept untouched (the user's `backend.zip` server.py was broken — referenced undefined classes; the existing `web_orchestrator.py` already wraps the agent's documented public functions).
- API contract unchanged — frontend `lib/api.js` is identical between old/new.

## Backlog
- **P1** Wire `ChatPanel` and `ProgressTracker` into newly redesigned pages where the user expects them.
- **P2** Re-test the full E2E flow (Research → Strategy → Content → Export) on the new UI after every backend revision.
- **P2** Continue suppressing inline citation text on the new pages (Sources drawer is the only sanctioned surface).
