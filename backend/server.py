"""
MOVE backend — FastAPI gateway for the gtm_v4_fixed multi-agent pipeline.

All routes are mounted under /api.  The agent layer is NOT modified;
this file only adds HTTP endpoints that drive the agent functions in
the documented order (see web_orchestrator.py).

Endpoints (under /api):
  GET    /api/health                               health probe
  POST   /api/runs                                  start a new run (research)
  GET    /api/runs                                  list runs (history)
  GET    /api/runs/{id}                             fetch full run state
  POST   /api/runs/{id}/approve_research            advance past research gate
  POST   /api/runs/{id}/regenerate_research         re-run research
  POST   /api/runs/{id}/approve_strategy            approve strategy
  POST   /api/runs/{id}/regenerate_strategy         re-run strategy
  POST   /api/runs/{id}/approve_phase_a             approve Phase A content
  POST   /api/runs/{id}/regenerate_phase_a          re-run Phase A
  POST   /api/runs/{id}/phase_b                     start Phase B with channels
  POST   /api/runs/{id}/approve_phase_b             approve Phase B content
  POST   /api/runs/{id}/regenerate_phase_b          re-run Phase B
  POST   /api/runs/{id}/export                      export {pdf|word|pptx|strategy_pdf}
  GET    /api/runs/{id}/files/{filename}            download an export
  DELETE /api/runs/{id}                             delete a run
"""

from __future__ import annotations

import os
import re
from pathlib import Path
from typing import List, Literal, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware

# Load env BEFORE importing the agent (which asserts OPENAI_API_KEY).
ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")

# Importing web_orchestrator triggers `import core.config` inside the agent,
# which validates that OPENAI_API_KEY is set.
import web_orchestrator as wo  # noqa: E402

RUNS_DIR = ROOT / "runs"
RUNS_DIR.mkdir(parents=True, exist_ok=True)


# ── Async Mongo (for read endpoints only; writes happen in web_orchestrator) ──
mongo_client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = mongo_client[os.environ["DB_NAME"]]
runs = db["gtm_runs"]

app = FastAPI(title="MOVE — GTM Backend (gtm_v4_fixed)")
api = APIRouter(prefix="/api")


# ── Schemas ───────────────────────────────────────────────────────────────────
class CreateRunRequest(BaseModel):
    query: str = Field(min_length=2, max_length=400)
    url: Optional[str] = ""


class ApproveResearchRequest(BaseModel):
    run_strategy: bool = True
    run_content:  bool = True


class PhaseBRequest(BaseModel):
    channels: List[Literal["linkedin", "blog", "seo", "email"]]


class ExportRequest(BaseModel):
    format: Literal["pdf", "word", "pptx", "strategy_pdf"]


SAFE_FILE = re.compile(r"^[A-Za-z0-9_.\-]+$")


def _summary(d: dict) -> dict:
    if not d:
        return d
    return {
        "id": d["id"],
        "query": d.get("query", ""),
        "url": d.get("url", ""),
        "status": d.get("status"),
        "stage": d.get("stage"),
        "error": d.get("error"),
        "created_at": d.get("created_at"),
        "updated_at": d.get("updated_at"),
        "exports": d.get("exports", []),
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────
@api.get("/health")
async def health():
    return {"ok": True, "service": "move-backend", "agent": "gtm_v4_fixed"}


@api.post("/runs")
async def create_run(body: CreateRunRequest):
    rid = wo.create_run(query=body.query.strip(), url=(body.url or "").strip())
    d = await runs.find_one({"id": rid}, {"_id": 0})
    return _summary(d)


@api.get("/runs")
async def list_runs(limit: int = 30):
    cursor = runs.find({}, {"_id": 0, "result": 0, "events": 0}).sort("created_at", -1).limit(limit)
    return [_summary(d) for d in await cursor.to_list(length=limit)]


@api.get("/runs/{run_id}")
async def get_run(run_id: str):
    d = await runs.find_one({"id": run_id}, {"_id": 0})
    if not d:
        raise HTTPException(status_code=404, detail="Run not found")
    return d


@api.delete("/runs/{run_id}")
async def delete_run(run_id: str):
    res = await runs.delete_one({"id": run_id})
    rdir = RUNS_DIR / run_id
    if rdir.exists():
        for p in rdir.glob("*"):
            try: p.unlink()
            except OSError: pass
        try: rdir.rmdir()
        except OSError: pass
    return {"deleted": res.deleted_count}


# ── HITL gates ────────────────────────────────────────────────────────────────
@api.post("/runs/{run_id}/approve_research")
async def approve_research(run_id: str, body: ApproveResearchRequest):
    try:
        wo.approve_research(run_id, run_strategy=body.run_strategy, run_content=body.run_content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return await get_run(run_id)


@api.post("/runs/{run_id}/regenerate_research")
async def regenerate_research(run_id: str):
    try:
        wo.regenerate_research(run_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return await get_run(run_id)


@api.post("/runs/{run_id}/approve_strategy")
async def approve_strategy(run_id: str):
    try:
        wo.approve_strategy(run_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return await get_run(run_id)


@api.post("/runs/{run_id}/regenerate_strategy")
async def regenerate_strategy(run_id: str):
    try:
        wo.regenerate_strategy(run_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return await get_run(run_id)


@api.post("/runs/{run_id}/approve_phase_a")
async def approve_phase_a(run_id: str):
    try:
        wo.approve_phase_a(run_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return await get_run(run_id)


@api.post("/runs/{run_id}/regenerate_phase_a")
async def regenerate_phase_a(run_id: str):
    try:
        wo.regenerate_phase_a(run_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return await get_run(run_id)


@api.post("/runs/{run_id}/phase_b")
async def start_phase_b(run_id: str, body: PhaseBRequest):
    try:
        wo.start_phase_b(run_id, body.channels)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return await get_run(run_id)


@api.post("/runs/{run_id}/approve_phase_b")
async def approve_phase_b(run_id: str):
    try:
        wo.approve_phase_b(run_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return await get_run(run_id)


@api.post("/runs/{run_id}/regenerate_phase_b")
async def regenerate_phase_b(run_id: str):
    try:
        wo.regenerate_phase_b(run_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return await get_run(run_id)


# ── Exports ───────────────────────────────────────────────────────────────────
@api.post("/runs/{run_id}/export")
async def export_run(run_id: str, body: ExportRequest):
    rec = None
    try:
        rec = wo.export(run_id, body.format)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    return rec


@api.get("/runs/{run_id}/files/{filename}")
async def get_file(run_id: str, filename: str):
    if not SAFE_FILE.match(filename):
        raise HTTPException(status_code=400, detail="Invalid filename")
    p = RUNS_DIR / run_id / filename
    if not p.exists():
        raise HTTPException(status_code=404, detail="File not found")
    media = {
        ".pdf": "application/pdf",
        ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }.get(p.suffix.lower(), "application/octet-stream")
    return FileResponse(p, media_type=media, filename=filename)


# ── Mount + CORS ──────────────────────────────────────────────────────────────
app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def _shutdown():
    mongo_client.close()
