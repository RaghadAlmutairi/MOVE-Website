# MOVE — GTM AI Platform — PRD

## Original Problem Statement
Premium enterprise SaaS, MOVE. Sequential GTM agent workflow: Research → **Strategy Direction (NEW gate)** → Strategy → Content → Export. Agent at `/app/backend/agent/` is locked. All UI must be research-grounded, explainable, auditable, with no unsupported AI-generated assumptions.

## Locked Constraints
- Agent code at `/app/backend/agent/` is a black box.
- All HTTP routes under `/api`.
- Env-driven config only.
- Citations live in the Sources drawer only; stripped from every UI text leaf.
- **NEW**: Strategy generation NEVER auto-runs after research approval — the user must explicitly choose a direction or write their own GTM objective.

## Architecture
- **Frontend** routes: `/`, `/projects`, `/research`, `/strategy-direction`, `/ideation`, `/command-center`, `/studio`, `/export`.
- **Backend**:
  - `server.py` — FastAPI gateway.
  - `web_orchestrator.py` — sequential pipeline; `approve_research` now sets `awaiting_strategy_direction` (no auto-launch). `suggest_directions` calls the new `strategy_direction.py` helper. `start_strategy(direction, custom)` records the choice and launches `_run_strategy` in a background thread.
  - `strategy_direction.py` — NEW; OpenAI call grounded strictly in the report (executive summary, SWOT, opportunities, risks, recommendations, personas, competitors). Returns exactly 4 directions: `{title, summary, target_segment, primary_motion, evidence[]}` with response_format=json_object.
  - `chat.py` — unchanged.
  - `agent/` — locked.

## API Contract (under `/api`) — NEW endpoints **bold**
- `GET /health` · `POST /runs` · `GET /runs` · `GET /runs/{id}` · `DELETE /runs/{id}`
- `POST /runs/{id}/approve_research` (now → `awaiting_strategy_direction`)
- **`GET /runs/{id}/strategy/suggestions`** → `{directions: [...]}` (cached on run doc)
- **`POST /runs/{id}/strategy/suggestions`** → re-generate
- **`POST /runs/{id}/strategy/start`** body `{direction: str, custom?: bool}`
- `POST /runs/{id}/approve_strategy` · `regenerate_strategy`
- `POST /runs/{id}/approve_content` · `regenerate_content`
- `POST /runs/{id}/export` · `GET /runs/{id}/files/{filename}` · `POST /runs/{id}/chat`

## New Status Flow
research → approve_research → **`awaiting_strategy_direction`** → start_strategy → running(strategy) → `awaiting_strategy_approval` → approve_strategy → running(content) → `awaiting_content_approval` → approve_content → `complete`

## Frontend
- **`/strategy-direction`** (NEW page): renders 4 grounded direction cards (motion badge, title, summary, target segment, "Grounded in research" evidence bullets) + optional custom textarea. "Generate strategy" gated on selection.
- **`/ideation`** (rewritten body): Strategy Summary card at top (chosen direction, North star, Positioning, Primary motion, Top priorities, Open-full and Approve buttons) + Full strategy as a shadcn **Accordion** (Positioning canvas / SWOT / Messaging pyramid / Strategic priorities). Auto-redirect to `/strategy-direction` if status is `awaiting_strategy_direction`.
- **`/research`** `onApprove` now navigates to `/strategy-direction` (was `/ideation`).
- All sections continue to hide when their data is empty. `stripCitations()` continues to scrub `[N]` markers.
- `RunContext.ACTIVE_STATUSES` includes `awaiting_strategy_direction`. `RunStatusPill` label = "Choose a strategy direction".

## Design System
Unchanged. Cream theme + coral→mauve→indigo gradient. New page reuses tokens (move-grad-1-tint / move-grad-2-tint / move-grad-3-tint, move-ink, move-success).

## Changelog
### 2026-06-23 — Strategy Direction gate + grounded summary
- Backend: `approve_research` no longer auto-launches strategy. Added `strategy_direction.py` (4 directions, JSON-validated, grounded prompt). Added 3 new endpoints. `start_strategy` stores chosen direction in run doc + injects into `result.user_strategy_direction` + `plan.user_directive`.
- Frontend: new `/strategy-direction` page with cards + custom textarea. New Strategy Summary card on `/ideation`. Full strategy rendered as collapsible Accordion sections. Auto-redirect logic. Status labels + active statuses updated.

## Backlog
- **P1** Persist Copilot conversation per stage across route changes.
- **P2** Show selected direction prominently in `/export` page summary.
- **P2** Mobile polish: direction cards stack cleanly; accordion items full-width.
