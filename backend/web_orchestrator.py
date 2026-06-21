"""
web_orchestrator.py

A thin, NON-INTERACTIVE orchestration layer that mirrors the order, parallelism
and gates of `agents/orchestrator.run_pipeline`, but exposes each
human-in-the-loop gate as an HTTP endpoint instead of a CLI `input()` prompt.

Agent code is NEVER modified.  This module only:
  • imports the agent's public functions (run_research, generate_gtm_strategy,
    generate_content_phase_a, generate_content_phase_b, exporters)
  • drives them in the documented order
  • persists state in MongoDB so the React UI can resume between approvals

Stage flow (identical to agents/orchestrator.py)
================================================
  step1_research    : pipeline.research_graph.run_research(query, url)
       │
       │  approve_research()  or  regenerate_research()
       ▼
  step2_parallel    : ThreadPoolExecutor → _run_strategy + _run_content_phase_a
       │
       │  approve_strategy()  or  regenerate_strategy()
       │  approve_phase_a()   or  regenerate_phase_a()
       ▼
  step3_phase_b     : _run_content_phase_b(channels=…)
       │
       │  approve_phase_b()   or  regenerate_phase_b()
       ▼
  step4_export      : exporters (PDF / DOCX / PPTX / strategy_pdf)

Every state transition writes the merged `result` dict back to Mongo so that
the React client can recover the full graph after a refresh.
"""

from __future__ import annotations

import logging
import os
import sys
import threading
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

# ---- Make the agent imports work (it uses bare imports: `from core...`) ----
AGENT_DIR = Path(__file__).parent / "agent"
sys.path.insert(0, str(AGENT_DIR))

# Run all per-run files under backend/runs/{run_id}/ — never inside the agent dir.
RUNS_DIR = Path(__file__).parent / "runs"
RUNS_DIR.mkdir(parents=True, exist_ok=True)

logger = logging.getLogger("move.orchestrator")


# ---------------------------------------------------------------------------
# Mongo helpers (sync — pipeline runs in worker threads)
# ---------------------------------------------------------------------------
from pymongo import MongoClient

_mongo_client = MongoClient(os.environ["MONGO_URL"])
_db = _mongo_client[os.environ["DB_NAME"]]
runs = _db["gtm_runs"]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _update(run_id: str, **fields) -> None:
    fields["updated_at"] = _now()
    runs.update_one({"id": run_id}, {"$set": fields})


def _push_event(run_id: str, stage: str, status: str, **extra) -> None:
    runs.update_one(
        {"id": run_id},
        {"$push": {"events": {"stage": stage, "status": status, "ts": _now(), **extra}},
         "$set": {"updated_at": _now()}},
    )


def _get(run_id: str) -> Optional[Dict[str, Any]]:
    return runs.find_one({"id": run_id})


# ---------------------------------------------------------------------------
# Stage runners (mirror agents/orchestrator.py exactly, minus input() prompts)
# ---------------------------------------------------------------------------

def _run_strategy_stage(run_id: str, result: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Calls the agent's strategy stage runner (orchestrator._run_strategy)."""
    from agents.orchestrator import _run_strategy as agent_run_strategy
    _push_event(run_id, "strategy", "running")
    gtm = agent_run_strategy(result)
    _push_event(run_id, "strategy", "done" if gtm else "failed")
    return gtm


def _run_phase_a_stage(run_id: str, result: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Calls the agent's content Phase A runner (orchestrator._run_content_phase_a)."""
    from agents.orchestrator import _run_content_phase_a as agent_run_phase_a
    _push_event(run_id, "content_phase_a", "running")
    bundle = agent_run_phase_a(result)
    _push_event(run_id, "content_phase_a", "done" if bundle else "failed")
    return bundle


def _run_phase_b_stage(run_id: str, result: Dict[str, Any],
                       gtm: Dict[str, Any], phase_a: Dict[str, Any],
                       channels: List[str]) -> Optional[Dict[str, Any]]:
    """Calls the agent's content Phase B runner (orchestrator._run_content_phase_b)."""
    from agents.orchestrator import _run_content_phase_b as agent_run_phase_b
    _push_event(run_id, "content_phase_b", "running")
    bundle = agent_run_phase_b(result, gtm, phase_a, channels)
    _push_event(run_id, "content_phase_b", "done" if bundle else "failed")
    return bundle


# ---------------------------------------------------------------------------
# Public API: kick off a run
# ---------------------------------------------------------------------------

def create_run(query: str, url: str = "") -> str:
    """Create a new run document and start research in the background."""
    run_id = str(uuid.uuid4())
    runs.insert_one({
        "id": run_id,
        "query": query,
        "url": url,
        "status": "running",
        "stage": "research",
        "created_at": _now(),
        "updated_at": _now(),
        "events": [{"stage": "research", "status": "running", "ts": _now()}],
        "exports": [],
    })

    thread = threading.Thread(
        target=_background_research,
        args=(run_id, query, url),
        daemon=True,
        name=f"research-{run_id[:8]}",
    )
    thread.start()
    return run_id


def _background_research(run_id: str, query: str, url: str) -> None:
    """Run only the research stage; await human approval before continuing."""
    try:
        from pipeline.research_graph import run_research
        result = run_research(query, url=url)
        if result.get("blocked"):
            _update(run_id,
                    status="failed",
                    stage="research",
                    error="; ".join(result.get("message", [])) or "Input blocked",
                    result=_redact(result))
            _push_event(run_id, "research", "blocked")
            return

        from agents.orchestrator import _has_llm_output
        if not _has_llm_output(result):
            _update(run_id,
                    status="failed",
                    stage="research",
                    error="No usable LLM output produced",
                    result=_redact(result))
            _push_event(run_id, "research", "failed")
            return

        _update(run_id,
                status="awaiting_research_approval",
                stage="research",
                result=_redact(result))
        _push_event(run_id, "research", "done")
    except Exception as e:  # noqa: BLE001
        logger.exception("[run %s] research error", run_id)
        _update(run_id, status="failed", stage="research", error=str(e))
        _push_event(run_id, "research", "failed", error=str(e))


# ---------------------------------------------------------------------------
# HITL gate: research approval / regeneration
# ---------------------------------------------------------------------------

def approve_research(run_id: str, run_strategy: bool, run_content: bool) -> None:
    """Mirrors orchestrator.run_pipeline STEP 2 entry: launch strategy and/or Phase A."""
    doc = _get(run_id)
    if not doc or doc.get("status") != "awaiting_research_approval":
        raise ValueError("Run is not awaiting research approval")
    result = doc["result"]
    _update(run_id,
            status="running",
            stage="parallel",
            run_strategy=run_strategy,
            run_content=run_content,
            approved_research=True)

    thread = threading.Thread(
        target=_background_parallel,
        args=(run_id, result, run_strategy, run_content),
        daemon=True,
        name=f"parallel-{run_id[:8]}",
    )
    thread.start()


def regenerate_research(run_id: str) -> None:
    doc = _get(run_id)
    if not doc:
        raise ValueError("Run not found")
    _update(run_id, status="running", stage="research")
    _push_event(run_id, "research", "running", regenerate=True)
    thread = threading.Thread(
        target=_background_research,
        args=(run_id, doc["query"], doc.get("url", "")),
        daemon=True,
        name=f"regen-{run_id[:8]}",
    )
    thread.start()


def _background_parallel(run_id: str, result: Dict[str, Any],
                         run_strategy: bool, run_content: bool) -> None:
    """Run strategy + Phase A in parallel, mirroring agents/orchestrator.py STEP 2."""
    try:
        gtm = None
        phase_a = None
        with ThreadPoolExecutor(max_workers=2) as ex:
            futs = {}
            if run_strategy:
                futs["strategy"] = ex.submit(_run_strategy_stage, run_id, result)
            if run_content:
                futs["phase_a"] = ex.submit(_run_phase_a_stage, run_id, result)
            if "strategy" in futs:
                gtm = futs["strategy"].result()
            if "phase_a" in futs:
                phase_a = futs["phase_a"].result()

        if gtm:
            result["gtm_strategy"] = gtm
        if phase_a:
            result["content_phase_a"] = phase_a

        # Determine next status — wait for whichever approvals are still due.
        next_status = "awaiting_strategy_approval" if gtm and not phase_a \
            else "awaiting_phase_a_approval" if phase_a and not gtm \
            else "awaiting_strategy_and_phase_a_approval" if (gtm and phase_a) \
            else "complete"

        _update(run_id, status=next_status, stage="parallel", result=_redact(result))
        if next_status == "complete":
            _push_event(run_id, "pipeline", "complete")
    except Exception as e:  # noqa: BLE001
        logger.exception("[run %s] parallel error", run_id)
        _update(run_id, status="failed", stage="parallel", error=str(e))


# ---------------------------------------------------------------------------
# HITL gate: strategy + Phase A approval / regeneration
# ---------------------------------------------------------------------------

def _advance_after(run_id: str, doc: Dict[str, Any]) -> None:
    """Advance the run's status based on which approvals are still outstanding."""
    waiting_strategy = doc.get("status") in ("awaiting_strategy_approval", "awaiting_strategy_and_phase_a_approval")
    waiting_phase_a  = doc.get("status") in ("awaiting_phase_a_approval", "awaiting_strategy_and_phase_a_approval")
    if doc.get("approved_strategy") and waiting_strategy:
        waiting_strategy = False
    if doc.get("approved_phase_a") and waiting_phase_a:
        waiting_phase_a = False

    if waiting_strategy and waiting_phase_a:
        next_status = "awaiting_strategy_and_phase_a_approval"
    elif waiting_strategy:
        next_status = "awaiting_strategy_approval"
    elif waiting_phase_a:
        next_status = "awaiting_phase_a_approval"
    else:
        next_status = "ready_for_phase_b"
    _update(run_id, status=next_status)


def approve_strategy(run_id: str) -> None:
    doc = _get(run_id)
    if not doc:
        raise ValueError("Run not found")
    _update(run_id, approved_strategy=True)
    _push_event(run_id, "strategy", "approved")
    _advance_after(run_id, _get(run_id))


def regenerate_strategy(run_id: str) -> None:
    doc = _get(run_id)
    if not doc or "result" not in doc:
        raise ValueError("Run not found or missing result")
    _push_event(run_id, "strategy", "regenerating")

    def _job():
        result = doc["result"]
        gtm = _run_strategy_stage(run_id, result)
        if gtm:
            result["gtm_strategy"] = gtm
            _update(run_id, result=_redact(result))

    threading.Thread(target=_job, daemon=True).start()


def approve_phase_a(run_id: str) -> None:
    doc = _get(run_id)
    if not doc:
        raise ValueError("Run not found")
    _update(run_id, approved_phase_a=True)
    _push_event(run_id, "content_phase_a", "approved")
    _advance_after(run_id, _get(run_id))


def regenerate_phase_a(run_id: str) -> None:
    doc = _get(run_id)
    if not doc or "result" not in doc:
        raise ValueError("Run not found or missing result")
    _push_event(run_id, "content_phase_a", "regenerating")

    def _job():
        result = doc["result"]
        bundle = _run_phase_a_stage(run_id, result)
        if bundle:
            result["content_phase_a"] = bundle
            _update(run_id, result=_redact(result))

    threading.Thread(target=_job, daemon=True).start()


# ---------------------------------------------------------------------------
# HITL gate: Phase B
# ---------------------------------------------------------------------------

VALID_CHANNELS = {"linkedin", "blog", "seo", "email"}


def start_phase_b(run_id: str, channels: List[str]) -> None:
    doc = _get(run_id)
    if not doc:
        raise ValueError("Run not found")
    if doc.get("status") not in ("ready_for_phase_b", "awaiting_phase_b_approval", "complete"):
        raise ValueError(f"Run not ready for Phase B (status={doc.get('status')})")
    result = doc["result"]
    gtm = result.get("gtm_strategy")
    phase_a = result.get("content_phase_a")
    if not gtm or not phase_a:
        raise ValueError("Phase B requires approved strategy AND approved Phase A")

    channels = [c.lower() for c in channels if c.lower() in VALID_CHANNELS]
    _update(run_id, status="running", stage="content_phase_b", phase_b_channels=channels)

    def _job():
        try:
            bundle = _run_phase_b_stage(run_id, result, gtm, phase_a, channels)
            if bundle:
                result["content"] = bundle
            _update(run_id,
                    status="awaiting_phase_b_approval" if bundle else "complete",
                    result=_redact(result))
        except Exception as e:  # noqa: BLE001
            logger.exception("[run %s] phase B error", run_id)
            _update(run_id, status="failed", stage="content_phase_b", error=str(e))

    threading.Thread(target=_job, daemon=True).start()


def approve_phase_b(run_id: str) -> None:
    _update(run_id, approved_phase_b=True, status="complete")
    _push_event(run_id, "content_phase_b", "approved")
    _push_event(run_id, "pipeline", "complete")


def regenerate_phase_b(run_id: str) -> None:
    doc = _get(run_id)
    if not doc:
        raise ValueError("Run not found")
    start_phase_b(run_id, doc.get("phase_b_channels") or [])


# ---------------------------------------------------------------------------
# Exports (calls agent exporters; writes to runs/{run_id}/{filename})
# ---------------------------------------------------------------------------

ALLOWED_FORMATS = {"pdf", "word", "pptx", "strategy_pdf"}


def export(run_id: str, fmt: str) -> Dict[str, str]:
    """Export the run's current result in the requested format.

    Returns {"filename": "...", "path": "..."} on success.
    """
    if fmt not in ALLOWED_FORMATS:
        raise ValueError(f"Unsupported format: {fmt}")
    doc = _get(run_id)
    if not doc or "result" not in doc:
        raise ValueError("Run not found or has no usable result")
    result = doc["result"]

    out_dir = RUNS_DIR / run_id
    out_dir.mkdir(parents=True, exist_ok=True)
    filename = {
        "pdf":          "report.pdf",
        "word":         "report.docx",
        "pptx":         "presentation.pptx",
        "strategy_pdf": "gtm_strategy.pdf",
    }[fmt]
    out_path = out_dir / filename

    if fmt == "strategy_pdf":
        from export.export_strategy import export_strategy_pdf
        p = export_strategy_pdf(result, path=str(out_path))
    else:
        from export.export import market_report_analysis_tool
        fn = market_report_analysis_tool
        invoker = fn.invoke if hasattr(fn, "invoke") else fn
        out = invoker({"result": result, "fmt": fmt, "path": str(out_path)}) \
            if hasattr(fn, "invoke") else fn(result=result, fmt=fmt, path=str(out_path))
        p = out.get("path")
    if not p or not Path(p).exists():
        raise RuntimeError(f"Export library unavailable or failed for fmt={fmt}")

    rec = {"format": fmt, "filename": filename, "path": str(p), "size": Path(p).stat().st_size}
    runs.update_one({"id": run_id}, {"$push": {"exports": rec}, "$set": {"updated_at": _now()}})
    _push_event(run_id, "export", "done", fmt=fmt, filename=filename)
    return rec


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _redact(result: Dict[str, Any]) -> Dict[str, Any]:
    """Trim very large embedded raw text from sources before storing in Mongo."""
    out = dict(result)
    if "sources" in out:
        out["sources"] = [
            {k: v for k, v in s.items() if k != "raw"} for s in out["sources"]
        ]
    return out
