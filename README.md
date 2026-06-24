# MOVE — Multi-Agent GTM Intelligence

> **M**arket intelligence · **O**rchestrated strategy · **V**erified content · **E**xport-ready

MOVE is a full-stack AI platform that takes a product description or company URL and walks a team through an end-to-end go-to-market pipeline: deep market research → strategy generation → content creation → document export. Every stage includes a human-in-the-loop approval gate before the next stage begins.

🌐 **Live demo:** [https://gtm-copilot-2.emergent.host](https://gtm-copilot-2.emergent.host)

---

## Table of Contents

- [Overview](#overview)
- [Pipeline](#pipeline)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Exports](#exports)

---

## Overview

MOVE replaces weeks of manual GTM work with a supervised AI pipeline. You provide a query (and optionally a URL), and the system orchestrates three specialized LangGraph agents in sequence:

1. A **Research agent** maps your market, competitors, buyer personas, trends, risks, and opportunities.
2. A **Strategy agent** synthesises a full `GTMStrategy` — positioning, ICP, channel plays, sales playbook, 90-day roadmap, and metrics.
3. A **Content agent** (Phase A + Phase B) produces LinkedIn posts, blog drafts, and email sequences tailored to the strategy.

Each stage is gated: you review the output and choose to approve or regenerate before the next stage runs.

---

## Pipeline

```
POST /api/runs
      │
      ▼
┌─────────────┐     approve_research      ┌──────────────────────────────┐
│  Research   │ ─────────────────────────▶│  Strategy  +  Content Ph. A  │ (parallel)
│   Agent     │                           └──────────────┬───────────────┘
└─────────────┘                                          │ approve_strategy
                                                         │ approve_phase_a
                                                         ▼
                                              ┌─────────────────────┐
                                              │  Content Phase B     │
                                              │ (linkedin/blog/email)│
                                              └──────────┬──────────┘
                                                         │ approve_phase_b
                                                         ▼
                                                    Exports (PDF / Word / PPTX)
```

---

## Features

### Research (`/research`)
- Enter a product **query** and optional **company URL**
- LangGraph graph: `input_guard → analyze → tools → generate → output_guard → finalize`
- Outputs: executive summary, SWOT, competitor cards (companies, products, alternatives), buyer personas, market trends, signals, opportunities, risks, recommendations, and cited sources
- Approve or regenerate before moving on

### Strategy Ideation & Command Center (`/ideation`, `/command-center`)
- One merged `GTMStrategy` covering:
  - **Foundation** — positioning statement, slot statement, ICP, beachhead, top pains, trigger events, disqualifiers, competitive differentiation
  - **Activation** — pricing tiers, GTM motion, channel plays, messaging by persona, content engine cadence
  - **Execution** — sales playbook stages, demand-gen levers, 90-day roadmap, north-star + funnel metrics, strategic risks
- Approve or regenerate strategy and Phase A content independently

### Content Studio (`/studio`)
- **Phase A** (parallel with strategy): up to 3 LinkedIn posts
- **Phase B** (post-approval): select channels → LinkedIn, Blog (SEO/Educational), Email (Outbound / Nurture / Launch)
- Approve or regenerate Phase B output

### Exports
| Format | What's included |
|---|---|
| PDF | Full market research report |
| Word (.docx) | Editable market report |
| PowerPoint (.pptx) | Market report presentation |
| Strategy PDF | Full GTM strategy document |

### Run History
All runs are persisted (MongoDB + SQLite). Reload any previous run from the global dropdown.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (JavaScript) |
| Backend | Python, FastAPI |
| AI orchestration | LangGraph |
| Research tools | Tavily search, competitive / market / customer / internal-knowledge tools |
| Persistence | MongoDB (runs), SQLite (approvals log) |
| Exports | ReportLab (PDF), python-docx (Word), python-pptx (PowerPoint) |

**Language breakdown:** Python 60% · JavaScript 38% · Other 2%

---

## Project Structure

```
MOVE-Website/
├── backend/                  # Python FastAPI + LangGraph agents
│   ├── agents/
│   │   ├── orchestrator.py   # Pipeline coordinator & HITL gates
│   │   ├── research_agent.py
│   │   ├── strategy_agent.py
│   │   └── content_agent.py
│   ├── pipeline/
│   │   ├── research_graph.py # LangGraph research graph
│   │   ├── guardrails.py
│   │   └── memory.py         # SQLite run log
│   ├── core/
│   │   └── schemas.py        # GTMStrategy, Report, ContentBundle models
│   └── export/
│       ├── export.py         # PDF / Word / PPTX dispatch
│       ├── export_strategy.py
│       ├── export_pdf.py
│       ├── export_docx.py
│       └── export_pptx.py
├── frontend/                 # React SPA
│   └── src/
│       └── pages/
│           ├── Landing.jsx
│           ├── CompanyResearch.jsx
│           ├── StrategyIdeation.jsx
│           ├── CommandCenter.jsx
│           └── ContentStudio.jsx
├── tests/                    # Test suite
├── test_reports/
├── FEATURE_MAPPING.md        # UI element → backend function mapping
├── INTEGRATION_ANALYSIS.md   # Verified backend capabilities
└── design_guidelines.json
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB instance
- A Tavily API key (for web research)
- An OpenAI or Anthropic API key (for LLM calls)

### Backend

```bash
cd backend
pip install -r requirements.txt

# Set environment variables
export TAVILY_API_KEY=...
export OPENAI_API_KEY=...        # or ANTHROPIC_API_KEY
export MONGO_URI=mongodb://localhost:27017
export STORAGE_DB=./storage/gtm.db

uvicorn server:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm start
```

The app will be available at `http://localhost:3000` and expects the API at `http://localhost:8000`.

---

## API Reference

All endpoints are under `/api`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/runs` | Start a new research run (`query`, optional `url`) |
| `GET` | `/api/runs` | List all previous runs |
| `GET` | `/api/runs/{id}` | Get full run result (research + strategy + content) |
| `POST` | `/api/runs/{id}/approve_research` | Approve research, trigger strategy + Phase A |
| `POST` | `/api/runs/{id}/regenerate_research` | Regenerate research output |
| `POST` | `/api/runs/{id}/approve_strategy` | Approve strategy |
| `POST` | `/api/runs/{id}/regenerate_strategy` | Regenerate strategy |
| `POST` | `/api/runs/{id}/approve_phase_a` | Approve Phase A content |
| `POST` | `/api/runs/{id}/regenerate_phase_a` | Regenerate Phase A |
| `POST` | `/api/runs/{id}/phase_b` | Run Phase B with selected channels |
| `POST` | `/api/runs/{id}/approve_phase_b` | Approve Phase B content |
| `POST` | `/api/runs/{id}/regenerate_phase_b` | Regenerate Phase B |
| `POST` | `/api/runs/{id}/export` | Export document (`format`: `pdf`, `word`, `pptx`, `strategy_pdf`) |

---

## Exports

Export endpoints accept a JSON body with a `format` field:

```json
{ "format": "pdf" }       // Market research report as PDF
{ "format": "word" }      // Market research report as .docx
{ "format": "pptx" }      // Market research report as .pptx
{ "format": "strategy_pdf" }  // Full GTM strategy as PDF
```

---

## Notes

- The backend produces **one** merged `GTMStrategy` per run — not multiple ranked alternatives.
- Channel allocation is expressed as qualitative guidance (`invest`, `test`, `avoid`), not percentages.
- Phase B channels: `linkedin`, `blog`, `seo`, `email`.
- Runs are persisted server-side; the frontend run-history dropdown loads them via `GET /api/runs`.
