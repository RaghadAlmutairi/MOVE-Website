"""
MOVE backend - FastAPI gateway for the sequential GTM agent pipeline.

All routes are mounted under /api. The agent layer is NOT modified;
this file only adds HTTP endpoints that drive the agent functions in
the documented order (see web_orchestrator.py).

Endpoints (under /api):
  GET    /api/health                                  health probe
  POST   /api/runs                                     start a new run (research)
  GET    /api/runs                                     list runs (history)
  GET    /api/runs/{id}                                fetch full run state
  DELETE /api/runs/{id}                                delete a run
  POST   /api/runs/{id}/approve_research               advance to strategy
  POST   /api/runs/{id}/regenerate_research            re-run research
  POST   /api/runs/{id}/approve_strategy               advance to content
  POST   /api/runs/{id}/regenerate_strategy            re-run strategy
  POST   /api/runs/{id}/approve_content                final approval
  POST   /api/runs/{id}/regenerate_content             re-run content
  POST   /api/runs/{id}/export                         export {pdf|docx|pptx|zip}
  GET    /api/runs/{id}/files/{filename}               download an export
  POST   /api/runs/{id}/chat                           in-app chat
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

import web_orchestrator as wo  # noqa: E402

RUNS_DIR = ROOT / "runs"
RUNS_DIR.mkdir(parents=True, exist_ok=True)


# Async Mongo for read endpoints; writes happen in web_orchestrator.
mongo_client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = mongo_client[os.environ["DB_NAME"]]
runs = db["gtm_runs"]

app = FastAPI(title="MOVE - GTM Backend (sequential)")
api = APIRouter(prefix="/api")


# Schemas
class CreateRunRequest(BaseModel):
    query: str = Field(min_length=2, max_length=400)
    url: Optional[str] = ""


class ExportRequest(BaseModel):
    format: Literal["pdf", "docx", "pptx", "zip"]
    scope: Optional[Literal["research", "strategy", "combined"]] = None


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    scope: Literal["research", "strategy", "content"]
    messages: List[ChatMessage]


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


@api.get("/health")
async def health():
    return {"ok": True, "service": "move-backend", "agent": "gtm_sequential"}


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
        for p in rdir.rglob("*"):
            if p.is_file():
                try: p.unlink()
                except OSError: pass
        for p in sorted(rdir.rglob("*"), reverse=True):
            if p.is_dir():
                try: p.rmdir()
                except OSError: pass
        try: rdir.rmdir()
        except OSError: pass
    return {"deleted": res.deleted_count}


# HITL gates - sequential
def _safe_run(action, run_id: str):
    try:
        action(run_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@api.post("/runs/{run_id}/approve_research")
async def approve_research(run_id: str):
    _safe_run(wo.approve_research, run_id)
    return await get_run(run_id)


@api.post("/runs/{run_id}/regenerate_research")
async def regenerate_research(run_id: str):
    _safe_run(wo.regenerate_research, run_id)
    return await get_run(run_id)


@api.post("/runs/{run_id}/approve_strategy")
async def approve_strategy(run_id: str):
    _safe_run(wo.approve_strategy, run_id)
    return await get_run(run_id)


@api.post("/runs/{run_id}/regenerate_strategy")
async def regenerate_strategy(run_id: str):
    _safe_run(wo.regenerate_strategy, run_id)
    return await get_run(run_id)


@api.post("/runs/{run_id}/approve_content")
async def approve_content(run_id: str):
    _safe_run(wo.approve_content, run_id)
    return await get_run(run_id)


@api.post("/runs/{run_id}/regenerate_content")
async def regenerate_content(run_id: str):
    _safe_run(wo.regenerate_content, run_id)
    return await get_run(run_id)


# Exports
@api.post("/runs/{run_id}/export")
async def export_run(run_id: str, body: ExportRequest):
    try:
        rec = wo.export(run_id, body.format, body.scope)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    return rec


@api.get("/runs/{run_id}/files/{filename}")
async def get_file(run_id: str, filename: str):
    if not SAFE_FILE.match(filename):
        raise HTTPException(status_code=400, detail="Invalid filename")
    # Search the run dir AND its first-level subdirs (pdf/, docx/, pptx/).
    base = RUNS_DIR / run_id
    candidates = [base / filename] + [d / filename for d in base.iterdir() if d.is_dir()] \
        if base.exists() else []
    p = next((c for c in candidates if c.exists()), None)
    if not p:
        raise HTTPException(status_code=404, detail="File not found")
    media = {
        ".pdf":  "application/pdf",
        ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".zip":  "application/zip",
    }.get(p.suffix.lower(), "application/octet-stream")
    return FileResponse(p, media_type=media, filename=filename)


@api.post("/runs/{run_id}/chat")
async def chat_run(run_id: str, body: ChatRequest):
    import chat as chat_module
    doc = await runs.find_one({"id": run_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Run not found")
    msgs = [m.model_dump() for m in body.messages]
    try:
        reply = chat_module.reply(doc, body.scope, msgs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat unavailable: {e}")
    return reply


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
