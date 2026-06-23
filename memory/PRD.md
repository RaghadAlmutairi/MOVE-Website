# MOVE — GTM AI Platform — PRD

## Original Problem Statement
Build a premium enterprise SaaS web application called **MOVE** (originally Beamdata GTM AI). Full-stack web app with a sequential GTM agent workflow: Research → Strategy → Content → Export. Must integrate with the user's LangGraph-style agent system **without modifying the agent code itself**.

## Locked Constraints
- The GTM agent at `/app/backend/agent/` is a black box. Do NOT modify its prompts, tools, agents, schemas, or pipeline.
- All HTTP routes are mounted under `/api`.
- Env-driven config only (`MONGO_URL`, `DB_NAME`, `OPENAI_API_KEY`, `REACT_APP_BACKEND_URL`).
- Citations live in the Sources drawer ONLY. They are stripped from every rendered text leaf in the UI but preserved in PDF/DOCX/PPTX exports.

## Architecture
- **Frontend** (`/app/frontend`): React + Tailwind + shadcn/ui.
  - Routes: `/`, `/projects`, `/research`, `/ideation`, `/command-center`, `/studio`, `/export`.
  - Global `CopilotPanel` (right rail, stage-aware: Research / Strategy / Content / GTM Assistant), collapsible to a floating button. z-index 10001 to clear platform badge.
  - `ProgressTracker` (4 clickable stages) + `StageNav` (Previous / Return to Projects / Next) on every workflow page.
- **Backend** (`/app/backend`):
  - `server.py` — FastAPI gateway (`/api/*`).
  - `web_orchestrator.py` — sequential pipeline driver + scoped exports + zip bundling.
  - `chat.py` — OpenAI chat helper (scope: research | strategy | content).
  - `agent/` — locked agent.
- **Storage**: MongoDB (`gtm_runs`) + filesystem (`/app/backend/runs/{run_id}/`).

## API Contract (under `/api`)
- `GET /health` · `POST /runs` · `GET /runs` · `GET /runs/{id}` · `DELETE /runs/{id}`
- HITL: `POST /runs/{id}/{approve|regenerate}_{research|strategy|content}`
- `POST /runs/{id}/export` body `{format: "pdf"|"docx"|"pptx"|"zip", scope?: "research"|"strategy"|"combined"}`
- `GET /runs/{id}/files/{filename}` — download
- `POST /runs/{id}/chat` body `{scope: research|strategy|content, messages: [...]}`

## Exports
- PDF × 3 (research / strategy / combined), DOCX × 3, PPTX × 1 (strategy deck), ZIP × 1 (full kit organised under pdf/ docx/ pptx/).

## Design System
Light cream theme (`#FBFAF7`), ink `#1A1D2E`, gradient `coral → mauve → indigo`. Logo lockup: bolt mark on dark capsule + gradient "MOVE" wordmark (new logoMOVE.png).

## Changelog
### 2026-06-23 — Research page pure-visualisation redesign
- Rewrote `/research` as a strict visualisation layer: full-width Executive Summary, 2×2 SWOT matrix, expandable Opportunity/Risk/Recommendation cards, Competitors table, individual Persona cards, Market Trends bullet list, sticky left TOC (`ResearchTOC`).
- Added `stripCitations()` so every text leaf in the page body removes `[N]`/`[N,M]` markers; citations only live in the Sources drawer.
- Sections auto-hide when their data array is empty.
- Sources drawer now renders citation labels `[id]`, domain, official badge, clickable URL with data-testid='source-N'.
- Fixed Copilot z-index overlap with `#emergent-badge`: panel and FAB raised to z-index 10001 and lifted by 80px from the bottom.

### 2026-06-23 — UX overhaul (earlier)
- Persistent stage-aware Copilot panel (Research / Strategy / Content / GTM Assistant), collapsible FAB.
- 4-stage simplified nav (Research / Strategy / Content / Export); Projects page; clickable ProgressTracker; StageNav with Prev/Next/Return-to-Projects.
- Executive summaries, SWOT grid, Positioning canvas, Messaging pyramid, Strategic priorities on the Strategy page.
- Asset cards + ExpandableContentCard on the Content page.
- Dedicated Export page extracted from ContentStudio.
- Logo swap to logoMOVE.png across TopNav + index.html.

### 2026-06-23 — Sequential pipeline migration
- Replaced agent with the new sequential backend (research → strategy → content). New API: approve/regenerate_content. Exports gained scope filtering and zip bundling.

## Backlog
- **P1** Re-test hidden-section behaviour on a run with empty risks/recommendations (logic verified by code review; not exercised on real data yet).
- **P2** Persist Copilot conversation per stage across route changes (currently resets to intro on route change).
- **P2** Mobile polish: TOC collapses below md breakpoint; ensure cards stack cleanly.
- **P2** CommandCenter deep-dive page is still routed at `/command-center` (linked from FAQ only).
