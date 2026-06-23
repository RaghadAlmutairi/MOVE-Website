# MOVE — GTM AI Platform — PRD

## Original Problem Statement
Build a premium enterprise SaaS web application called **MOVE** (originally Beamdata GTM AI). A full-stack web application with GTM (Go-To-Market) agent workflows: Research → Strategy → Content. Must integrate with the user's provided LangGraph-style agent system **without modifying the agent code itself**.

## Locked Constraints
- The GTM agent at `/app/backend/agent/` is a **black box**. Do NOT modify its prompts, tools, agents, schemas, or pipeline.
- All HTTP routes are mounted under `/api`.
- Env-driven config only (`MONGO_URL`, `DB_NAME`, `OPENAI_API_KEY`, `REACT_APP_BACKEND_URL`).

## Architecture
- **Frontend** (`/app/frontend`): React + Tailwind + shadcn/ui. Pages: Landing, CompanyResearch, StrategyIdeation, CommandCenter (deep-dive), ContentStudio.
- **Backend** (`/app/backend`):
  - `server.py` — FastAPI gateway (`/api/*`).
  - `web_orchestrator.py` — drives the agent pipeline (sequential: research → strategy → content) without touching agent code; produces scoped exports + zip bundle.
  - `chat.py` — isolated OpenAI-backed chat helper for the in-app chat panel (scope: research | strategy | content).
  - `agent/` — locked agent (`agents/orchestrator`, `pipeline/research_graph`, `export/*`, etc.).
- **Storage**: MongoDB (`gtm_runs`) + filesystem (`/app/backend/runs/{run_id}/`) for export artifacts.

## API Contract (under `/api`)
- `GET  /health` · `POST /runs` · `GET /runs` · `GET /runs/{id}` · `DELETE /runs/{id}`
- HITL gates (sequential): `POST /runs/{id}/{approve|regenerate}_{research|strategy|content}`
- `POST /runs/{id}/export` body `{format: "pdf"|"docx"|"pptx"|"zip", scope?: "research"|"strategy"|"combined"}`
- `GET  /runs/{id}/files/{filename}` — download
- `POST /runs/{id}/chat` body `{scope: research|strategy|content, messages: [...]}`

## Pipeline (sequential)
1. `create_run(query, url)` → background `run_research` → `awaiting_research_approval`
2. `approve_research` → background strategy → `awaiting_strategy_approval`
3. `approve_strategy` → background content (LinkedIn / blog / SEO / email, all channels) → `awaiting_content_approval`
4. `approve_content` → `complete`

## Exports
- **PDF × 3**: research / strategy / combined (research+strategy)
- **DOCX × 3**: research / strategy / combined
- **PPTX × 1**: strategy deck
- **ZIP × 1**: full GTM kit (everything available, organised under `pdf/`, `docx/`, `pptx/`)

## Design System (current)
Light editorial theme: cream background `#FBFAF7`, ink `#1A1D2E`, coral→mauve→indigo gradient (`var(--gradient-headline)`). Tailwind tokens at `move-*` and `ink-*`. Logo lockup = bolt mark on dark capsule + "MOVE" gradient wordmark.

## Changelog
### 2026-06-23 — Sequential pipeline + new export catalogue (this iteration)
- Replaced `/app/backend/agent/` with the user's new agent (`backend.zip`, j5513sa8) — sequential workflow, removed Phase A/B from the agent.
- Rewrote `web_orchestrator.py` for sequential flow with scoped exports + ZIP bundling.
- Rewrote `server.py` to expose new endpoints, removed `phase_a` / `phase_b` / `start_phase_b`.
- Frontend `lib/api.js` rewritten — new `approveContent`, `regenerateContent`, `exportFile(id, format, scope)`, `exportZip(id)`.
- Updated `RunContext`, `RunStatusPill`, `ChatPanel` for new statuses (`awaiting_content_approval`).
- Updated `transforms.js` — single `content` view, `hasContent()` predicate.
- Rewrote `ContentStudio.jsx` with three tabs (Reports & Exports / Social & Marketing / Ask the agent), one-click ZIP download, 3 PDF cards × 3 DOCX cards × 1 PPTX card, plus SEO articles support.
- Simplified TopNav to 3 sections (Research / Strategy / Content).
- Updated Landing copy and FAQ for sequential flow.

### 2026-06-23 — UI redesign integration (previous iteration)
- Light cream/coral theme, 5 redesigned pages, ProgressTracker + ResearchSourcesDrawer, MOVE bolt-on-dark-capsule logo lockup.

## Backlog
- **P1** Polish/extend the CommandCenter "Strategy Studio" deep-dive page if user wants it kept (currently still routed at `/command-center` but no longer in main nav).
- **P2** Surface live progress for content generation in the Strategy page (currently only the Content page shows the spinner).
- **P2** Auto-rehydrate `activeRun` on app mount.
