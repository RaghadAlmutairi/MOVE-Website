# MOVE — Multi-Agent GTM Intelligence

> **Outthink the market. Outmove the competition.**
> An agentic AI platform that automates go-to-market (GTM) work end to end —
> **market research → strategy → launch-ready content** — with a human approval
> step at every stage.

This repository is the **full web application**: a **FastAPI** backend that drives
a multi-agent pipeline, and a **React** frontend that lets a user start a run,
review each stage, chat with the agents, and download the deliverables.
🌐 **Live demo:** [https://gtm-copilot-2.emergent.host](https://gtm-copilot-2.emergent.host)
---

## Table of contents

1. [Project summary](#1-project-summary)
2. [Requirements](#2-requirements)
3. [Installation](#3-installation)
4. [Run the project](#4-run-the-project)
5. [API keys & environment variables](#5-api-keys--environment-variables)
6. [Project structure](#6-project-structure)
7. [Known issues & limitations](#7-known-issues--limitations)

---

## 1. Project summary

**What the project does.** MOVE takes a single company or market query and runs
it through an ordered, observable pipeline of specialised AI agents:

| Stage | What it produces |
|-------|------------------|
| **Research** | A structured market-research report: competitors, buyer personas, SWOT, market trends, opportunities, risks, and recommendations — grounded in live web sources and an internal knowledge base. |
| **Strategy** | A GTM strategy across three frameworks — Foundation (positioning, ICP, beachhead), Activation (pricing, channels, messaging), and Execution (sales motion, demand generation, metrics, roadmap). |
| **Content** | A launch-ready content suite — LinkedIn posts, blog drafts, SEO articles, and email sequences — aligned to the approved research and strategy. |
| **Export** | Professional deliverables: **PDF, Word (DOCX), a 13-slide PowerPoint (PPTX)**, and a combined **ZIP** package. |

A **human-in-the-loop** approval gate sits between every stage (approve / regenerate),
and **deterministic + model-based guardrails** validate every output. All agents
share one state object (the "MOVEState"), and run history is persisted so the UI
can resume after a refresh. The frontend adds a progress tracker, a research-sources
drawer, and an in-app chat/copilot panel grounded in the current run's data.

---

## 2. Requirements

### 2.1 Tools you must have installed

| Tool | Version | Purpose |
|------|---------|---------|
| **Python** | 3.10 or newer | Backend + agent pipeline |
| **Node.js** | 18 or newer | Frontend (React) |
| **npm** or **Yarn** | latest | Frontend package manager |
| **MongoDB** | 5.0+ (local or hosted, e.g. Atlas) | Run-state persistence (**required** — the backend will not start without it) |
| **Git** | any | Cloning the repository |

### 2.2 Accounts / API keys

| Provider | Required? | Used for |
|----------|-----------|----------|
| **OpenAI** | **Required** | All core agents (research synthesis, strategy, content) and in-app chat. The agent **refuses to start** without `OPENAI_API_KEY`. |
| **Tavily** | Recommended | Primary web-search provider. Without it, search falls back to Firecrawl → Google → DuckDuckGo. |
| **Firecrawl** | Optional | Web-search fallback #1. |
| **Google Custom Search** (`GOOGLE_API_KEY` + `GOOGLE_CSE_ID`) | Optional | Web-search fallback #2. |
| **Anthropic (Claude)** | **Required** | PowerPoint narrative-copy enhancement. If absent, this step is skipped. |
| **LangSmith** | Optional | Tracing/observability of agent runs. |


### 2.3 Python packages

Declared in two files (installed in step 3):

- **`backend/requirements.txt`** — web layer: `fastapi`, `uvicorn`, `motor`,
  `pymongo`, `pydantic`, `python-dotenv`, and others.
- **`backend/agent/requirements.txt`** — agent layer: `openai`, `anthropic`,
  `langgraph`, `langchain` (+ `langchain-openai`, `langchain-community`),
  `faiss-cpu`, `rank_bm25`, `pymupdf`, `tiktoken`, `reportlab`, `python-docx`,
  `python-pptx`, `ddgs`, `langsmith`, and others.

### 2.4 Frontend packages

Declared in **`frontend/package.json`** (React 19, CRACO, Tailwind CSS, Radix UI /
shadcn-style components). Installed with `npm install`.

---

## 3. Installation

```bash
# 0) Clone
git clone <your-repo-url> MOVE-Website
cd MOVE-Website
```

### 3.1 Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install the web layer
pip install -r requirements.txt

# Install the agent layer
pip install -r agent/requirements.txt
```


### 3.2 Frontend

```bash
cd ../frontend
npm install                      # or: yarn install
```

> If `npm install` reports peer-dependency conflicts, use
> `npm install --legacy-peer-deps`.

---

## 4. Run the project

You need **three things running**: MongoDB, the backend API, and the frontend.

### 4.1 Start MongoDB

```bash
# Local install:
mongod --dbpath /your/data/path
# …or use a hosted MongoDB (e.g. Atlas) and put its URI in MONGO_URL (see §5).
```

### 4.2 Start the backend (FastAPI)

```bash
cd backend
source .venv/bin/activate         # Windows: .venv\Scripts\activate

# The app object is `app` in server.py.
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

- API base URL: **`http://localhost:8001/api`**
- Health check: **`http://localhost:8001/api/health`**
- Interactive API docs (Swagger): **`http://localhost:8001/docs`**

### 4.3 Start the frontend (React)

```bash
cd frontend
npm start                         # runs `craco start`, default port 3000
```

Open **`http://localhost:3000`** in your browser.

> Make sure the frontend points at the backend by setting
> `REACT_APP_BACKEND_URL` (see §5). All frontend API calls go to
> `${REACT_APP_BACKEND_URL}/api`.

### 4.4 Typical user flow in the UI

1. Enter a company/market query and start a run.
2. Review the **research** report → **Approve** (or Regenerate).
3. Review the **strategy** → **Approve** (or Regenerate).
4. Review the **content** → **Approve** (or Regenerate).
5. **Export** to PDF / DOCX / PPTX / ZIP and download.

---

## 5. API keys & environment variables

### 5.1 Backend — `backend/.env`

Create a file named `.env` inside the `backend/` folder:

```dotenv
# ---- Required ----
OPENAI_API_KEY=sk-...                         # core models + chat; app won't start without it
MONGO_URL=mongodb://localhost:27017           # run-state database (required)
DB_NAME=move                                  # database name (required)

# ---- Frontend access (CORS) ----
CORS_ORIGINS=http://localhost:3000            # comma-separated; default "*"

# ---- Web search (recommended / optional) ----
TAVILY_API_KEY=                               # primary search; recommended
FIRECRAWL_API_KEY=                            # search fallback #1
GOOGLE_API_KEY=                               # search fallback #2 (Custom Search JSON API)
GOOGLE_CSE_ID=                                # Programmable Search Engine id (cx)

# ---- Optional model / feature toggles ----
ANTHROPIC_API_KEY=                            # enables PPTX copy enhancement (Claude)
CHAT_MODEL=gpt-4o-mini                         # in-app chat model (default shown)
PLAN_MODEL=gpt-4.1-mini                        # routing / planning model
SYNTH_MODEL=gpt-5                              # research + strategy synthesis model
CONTENT_MODEL=gpt-5                            # content model (defaults to SYNTH_MODEL)
GUARD_MODEL=gpt-4.1-mini                       # guardrail checks
FALLBACK_MODEL=gpt-4.1-mini                    # cross-model fallback
ENABLE_EVALUATORS=false                        # turn LLM-as-judge scoring on/off
ENABLE_INPUT_GUARD=1                            # set 0 to disable input guard
ENABLE_OUTPUT_GUARD=1                           # set 0 to disable output guard
STORAGE_DB=./storage/gtm.db                     # local SQLite store for agent memory
RAG_DOCS_FOLDER=./rag_docs                       # folder of internal PDFs for grounding
INTERNAL_ENTITIES=weclouddata,beamdata           # entities treated as "internal"

# ---- Optional observability (LangSmith) ----
LANGSMITH_API_KEY=                              # enables tracing when set
LANGSMITH_PROJECT=market-analyst-agent
```

**Reference of every variable read by the backend:**

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `OPENAI_API_KEY` | ✅ | — | Core models + chat (hard requirement) |
| `MONGO_URL` | ✅ | — | MongoDB connection string |
| `DB_NAME` | ✅ | — | MongoDB database name |
| `CORS_ORIGINS` | – | `*` | Allowed frontend origins (comma-separated) |
| `TAVILY_API_KEY` | – | — | Primary web search |
| `FIRECRAWL_API_KEY` | – | — | Search fallback #1 |
| `GOOGLE_API_KEY` / `GOOGLE_CSE_ID` | – | — | Search fallback #2 |
| `ANTHROPIC_API_KEY` | – | — | PPTX content enhancement (Claude) |
| `ANTHROPIC_MODEL` | – | `claude-sonnet-4-6` | Claude model id |
| `CHAT_MODEL` | – | `gpt-4o-mini` | In-app chat model |
| `PLAN_MODEL` | – | `gpt-4.1-mini` | Routing / planning |
| `SYNTH_MODEL` | – | `gpt-5` | Research + strategy synthesis |
| `CONTENT_MODEL` | – | = `SYNTH_MODEL` | Content generation |
| `GUARD_MODEL` | – | `gpt-4.1-mini` | Guardrail checks |
| `FALLBACK_MODEL` | – | `gpt-4.1-mini` | Cross-model fallback |
| `EVAL_MODEL` | – | = `PLAN_MODEL` | LLM-as-judge evaluator |
| `ENABLE_EVALUATORS` | – | `false` | Toggle evaluation scoring |
| `ENABLE_INPUT_GUARD` / `ENABLE_OUTPUT_GUARD` | – | `1` | Toggle guards |
| `STORAGE_DB` | – | `./storage/gtm.db` | Agent memory (SQLite) |
| `RAG_DOCS_FOLDER` | – | `./rag_docs` | Internal PDFs for RAG grounding |
| `INTERNAL_ENTITIES` | – | `weclouddata,beamdata` | Internal-entity list |
| `LANGSMITH_API_KEY` / `LANGCHAIN_API_KEY` | – | — | Enables LangSmith tracing |
| `LANGSMITH_PROJECT` | – | `market-analyst-agent` | LangSmith project name |

### 5.2 Frontend — `frontend/.env`

```dotenv
# Base URL of the backend. All API calls go to ${REACT_APP_BACKEND_URL}/api
REACT_APP_BACKEND_URL=http://localhost:8001
```

> **Minimum to run:** set `OPENAI_API_KEY`, `MONGO_URL`, and `DB_NAME` in
> `backend/.env`, and `REACT_APP_BACKEND_URL` in `frontend/.env`. Everything else
> is optional and has sensible defaults.

---

## 6. Project structure

```
MOVE-Website/
├── backend/
│   ├── server.py            FastAPI app — all routes under /api (run with uvicorn)
│   ├── web_orchestrator.py  Drives the agent pipeline; persists run state to MongoDB
│   ├── chat.py              Grounded in-app chat (OpenAI)
│   ├── requirements.txt     Web-layer Python dependencies
│   └── agent/               The multi-agent system (not modified by the web layer)
│       ├── agents/          orchestrator, research, strategy, content agents
│       ├── core/            config (models, env, keys), llm, prompts, schemas
│       ├── pipeline/        research_graph (LangGraph), router, guards, guardrails,
│       │                    evaluation, memory
│       ├── tools/           research_tools, content_tools
│       ├── utils/           search, rag (FAISS + BM25), sources, relevance, …
│       ├── export/          PDF / DOCX / PPTX / strategy / ZIP exporters
│       └── requirements.txt Agent-layer Python dependencies
└── frontend/
    ├── package.json         React 19 + CRACO + Tailwind + Radix UI
    └── src/
        ├── App.js           Routes
        ├── components/       TopNav, ProgressTracker, ChatPanel, CopilotPanel,
        │                     ResearchSourcesDrawer, StageNav, RunStatusPill, ui/…
        └── …
```

**Backend API endpoints (all under `/api`):**

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health probe |
| POST | `/api/runs` | Start a new run (research) |
| GET | `/api/runs` | List run history |
| GET | `/api/runs/{id}` | Fetch full run state |
| DELETE | `/api/runs/{id}` | Delete a run |
| POST | `/api/runs/{id}/approve_research` | Advance to strategy |
| POST | `/api/runs/{id}/regenerate_research` | Re-run research |
| POST | `/api/runs/{id}/approve_strategy` | Advance to content |
| POST | `/api/runs/{id}/regenerate_strategy` | Re-run strategy |
| POST | `/api/runs/{id}/approve_content` | Final approval |
| POST | `/api/runs/{id}/regenerate_content` | Re-run content |
| POST | `/api/runs/{id}/export` | Export `{pdf\|docx\|pptx\|zip}` |
| GET | `/api/runs/{id}/files/{filename}` | Download an export |
| POST | `/api/runs/{id}/chat` | In-app chat |

---

## 7. Known issues & limitations

- **MongoDB is mandatory.** The backend reads `MONGO_URL`/`DB_NAME` at startup and
  will fail to start (or error on the first request) if MongoDB is not reachable.
  Make sure MongoDB is running before launching the backend.
- **Best search quality needs API keys.** With no `TAVILY_API_KEY` /
  `FIRECRAWL_API_KEY` / Google keys, search falls back to DuckDuckGo (no key), which
  reduces source breadth and quality.
- **PPTX enhancement requires Claude.** Without `ANTHROPIC_API_KEY`, the PowerPoint
  copy-polishing step is skipped and the deck uses base copy.
- **Evaluators are advisory and off by default.** LLM-as-judge scoring is enabled
  only when `ENABLE_EVALUATORS=true`; it attaches scores but does not block the
  pipeline.
- **Bounded research revision.** The research output guard allows a single revision
  pass; once spent, the report is accepted with guardrail notes attached rather than
  fully resolved.
- **Internal RAG grounding is optional and empty by default.** Grounded analysis of
  "internal" entities only applies if you place PDFs in `RAG_DOCS_FOLDER`; otherwise
  the system relies on web sources alone.
- **Model availability.** Defaults reference `gpt-5` / `gpt-4.1-mini` /
  `gpt-4o-mini` / `claude-sonnet-4-6`. If your account cannot access a given model,
  override it with the corresponding environment variable (e.g. `SYNTH_MODEL`,
  `CONTENT_MODEL`, `CHAT_MODEL`).
- **Domain validation pending.** The system has been validated on engineering
  behaviour (pipeline flow, guardrails, schema conformance, exports) but its
  marketing recommendations have not yet been reviewed by a domain expert, and it
  does not yet ingest a company's internal knowledge (brand guidelines, historical
  performance).
- **Frontend peer dependencies.** Some environments require
  `npm install --legacy-peer-deps` to resolve React/peer ranges cleanly.

---

### Quick start (TL;DR)

```bash
# 1. MongoDB running locally (mongodb://localhost:27017)

# 2. Backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && pip install -r agent/requirements.txt
# create backend/.env with OPENAI_API_KEY, MONGO_URL, DB_NAME
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# 3. Frontend (new terminal)
cd frontend && npm install
# create frontend/.env with REACT_APP_BACKEND_URL=http://localhost:8001
npm start        # open http://localhost:3000
```

---

*MOVE — an agentic GTM platform. Research, strategy, and content, end to end, with
you in control at every step.*
