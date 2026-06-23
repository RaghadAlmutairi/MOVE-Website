"""
web_orchestrator.py

Non-interactive orchestration layer that mirrors the new sequential
agent flow (Research -> Strategy -> Content) and exposes each
human-in-the-loop gate as an HTTP endpoint instead of a CLI input().

Agent code is NEVER modified. This module:
  * imports the agent's public functions
  * drives them in the documented order
  * persists state in MongoDB so the React UI can resume between approvals
  * builds scoped PDF/DOCX/PPTX/ZIP exports for the UI

Stage flow
==========
  research            (background)
     |  approve_research / regenerate_research
     v
  strategy            (background; auto-started on approve_research)
     |  approve_strategy / regenerate_strategy
     v
  content             (background; auto-started on approve_strategy)
     |  approve_content / regenerate_content
     v
  complete

Exports (no LLM, all sync):
  pdf   scope = research | strategy | combined
  docx  scope = research | strategy | combined
  pptx                                               (strategy deck)
  zip                                                (all available files)
"""

from __future__ import annotations

import io
import logging
import os
import re
import sys
import threading
import uuid
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# Make the agent imports work (it uses bare imports: `from core...`).
AGENT_DIR = Path(__file__).parent / "agent"
sys.path.insert(0, str(AGENT_DIR))

# Per-run files live under backend/runs/{run_id}/ -- never inside the agent dir.
RUNS_DIR = Path(__file__).parent / "runs"
RUNS_DIR.mkdir(parents=True, exist_ok=True)

logger = logging.getLogger("move.orchestrator")


# ---------------------------------------------------------------------------
# Mongo helpers (sync; pipeline runs in worker threads)
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


def _scoped_result(doc: Dict[str, Any], scope: str) -> Dict[str, Any]:
    """Return a copy of result restricted to the requested scope."""
    result = dict(doc.get("result") or {})
    if "report" not in result:
        raise ValueError("Run has no research report")
    if scope == "research":
        result.pop("gtm_strategy", None)
        result.pop("content", None)
    elif scope == "strategy":
        # Strategy-only: keep gtm_strategy plus minimal report context for headers.
        # The strategy PDF/DOCX exporters reference report fields, so keep it.
        result.pop("content", None)
    elif scope == "combined":
        # research + strategy (no content per spec)
        result.pop("content", None)
    else:
        raise ValueError(f"Unknown scope: {scope}")
    return result


# ---------------------------------------------------------------------------
# Stage runners
# ---------------------------------------------------------------------------

def _run_research(run_id: str, query: str, url: str) -> None:
    """Run research only; await human approval before continuing."""
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


def _run_strategy(run_id: str) -> None:
    """Run strategy stage on the current result."""
    try:
        from agents.orchestrator import _run_strategy as agent_run_strategy
        doc = _get(run_id)
        if not doc or "result" not in doc:
            _update(run_id, status="failed", stage="strategy", error="No research result")
            return
        result = dict(doc["result"])
        _push_event(run_id, "strategy", "running")
        gtm = agent_run_strategy(result)
        if not gtm:
            _update(run_id, status="failed", stage="strategy",
                    error="Strategy generation produced no output")
            _push_event(run_id, "strategy", "failed")
            return
        result["gtm_strategy"] = gtm
        _update(run_id,
                status="awaiting_strategy_approval",
                stage="strategy",
                result=_redact(result))
        _push_event(run_id, "strategy", "done")
    except Exception as e:  # noqa: BLE001
        logger.exception("[run %s] strategy error", run_id)
        _update(run_id, status="failed", stage="strategy", error=str(e))
        _push_event(run_id, "strategy", "failed", error=str(e))


def _run_content(run_id: str) -> None:
    """Run unified Content Studio (all channels) on the current result."""
    try:
        from agents.orchestrator import _run_content_studio as agent_run_content
        doc = _get(run_id)
        if not doc or "result" not in doc:
            _update(run_id, status="failed", stage="content", error="No prior result")
            return
        result = dict(doc["result"])
        gtm = result.get("gtm_strategy")
        if not gtm:
            _update(run_id, status="failed", stage="content",
                    error="Approved strategy required before content")
            return
        _push_event(run_id, "content", "running")
        channels = ["linkedin", "blog", "seo", "email"]
        bundle = agent_run_content(result, gtm, channels)
        if not bundle:
            _update(run_id, status="failed", stage="content",
                    error="Content generation produced no output")
            _push_event(run_id, "content", "failed")
            return
        result["content"] = bundle
        _update(run_id,
                status="awaiting_content_approval",
                stage="content",
                result=_redact(result))
        _push_event(run_id, "content", "done")
    except Exception as e:  # noqa: BLE001
        logger.exception("[run %s] content error", run_id)
        _update(run_id, status="failed", stage="content", error=str(e))
        _push_event(run_id, "content", "failed", error=str(e))


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

    threading.Thread(
        target=_run_research,
        args=(run_id, query, url),
        daemon=True,
        name=f"research-{run_id[:8]}",
    ).start()
    return run_id


# ---------------------------------------------------------------------------
# HITL gates
# ---------------------------------------------------------------------------

def approve_research(run_id: str) -> None:
    """Approve research; pause for the user to pick a strategy direction."""
    doc = _get(run_id)
    if not doc:
        raise ValueError("Run not found")
    if doc.get("status") != "awaiting_research_approval":
        raise ValueError(f"Run not awaiting research approval (status={doc.get('status')})")
    _update(run_id,
            status="awaiting_strategy_direction",
            stage="strategy_direction",
            approved_research=True)
    _push_event(run_id, "research", "approved")
    _push_event(run_id, "strategy_direction", "awaiting_user")


def regenerate_research(run_id: str) -> None:
    doc = _get(run_id)
    if not doc:
        raise ValueError("Run not found")
    _update(run_id, status="running", stage="research")
    _push_event(run_id, "research", "running", regenerate=True)
    threading.Thread(
        target=_run_research,
        args=(run_id, doc["query"], doc.get("url", "")),
        daemon=True,
        name=f"regen-research-{run_id[:8]}",
    ).start()


# ── Strategy direction gate ────────────────────────────────────────────────
def suggest_directions(run_id: str) -> List[Dict[str, Any]]:
    """Generate (or return cached) 4 strategy-direction suggestions.

    Suggestions are LLM-derived but the prompt forbids inventing fields not in
    the research report; the response is JSON-validated and trimmed.
    """
    from strategy_direction import generate_directions

    doc = _get(run_id)
    if not doc:
        raise ValueError("Run not found")
    if doc.get("status") not in ("awaiting_strategy_direction", "awaiting_strategy_approval", "complete"):
        # Research must be approved before we can suggest directions.
        if doc.get("status") != "awaiting_research_approval":
            raise ValueError(f"Cannot suggest directions in status={doc.get('status')}")
    cached = doc.get("strategy_directions") or []
    if cached:
        return cached
    result = doc.get("result") or {}
    if not result.get("report"):
        raise ValueError("Research report not available")
    suggestions = generate_directions(result)
    _update(run_id, strategy_directions=suggestions)
    _push_event(run_id, "strategy_direction", "suggested", count=len(suggestions))
    return suggestions


def start_strategy(run_id: str, direction: str, custom: bool = False,
                   meta: Optional[Dict[str, Any]] = None) -> None:
    """Record the user's chosen direction and launch the strategy agent."""
    doc = _get(run_id)
    if not doc:
        raise ValueError("Run not found")
    if doc.get("status") != "awaiting_strategy_direction":
        raise ValueError(f"Run not awaiting strategy direction (status={doc.get('status')})")
    direction = (direction or "").strip()
    if not direction:
        raise ValueError("Direction is required")
    chosen = {"direction": direction, "custom": bool(custom), "meta": meta or {}}
    _update(run_id,
            strategy_direction=chosen,
            status="running",
            stage="strategy")
    _push_event(run_id, "strategy_direction", "chosen", custom=bool(custom))

    # Inject the user direction into the result so the strategy agent (and
    # any downstream stages) see it. We add a NEW field — never overwrite the
    # locked agent's expected fields.
    result = dict(doc.get("result") or {})
    result["user_strategy_direction"] = chosen
    # Also stash inside `plan` since some prompts read from there.
    plan = dict(result.get("plan") or {})
    plan["user_directive"] = direction
    result["plan"] = plan
    _update(run_id, result=_redact(result))

    threading.Thread(target=_run_strategy, args=(run_id,), daemon=True,
                     name=f"strategy-{run_id[:8]}").start()


def approve_strategy(run_id: str) -> None:
    """Approve strategy and auto-launch content generation."""
    doc = _get(run_id)
    if not doc:
        raise ValueError("Run not found")
    if doc.get("status") != "awaiting_strategy_approval":
        raise ValueError(f"Run not awaiting strategy approval (status={doc.get('status')})")
    _update(run_id,
            status="running",
            stage="content",
            approved_strategy=True)
    _push_event(run_id, "strategy", "approved")
    threading.Thread(target=_run_content, args=(run_id,), daemon=True,
                     name=f"content-{run_id[:8]}").start()


def regenerate_strategy(run_id: str) -> None:
    doc = _get(run_id)
    if not doc:
        raise ValueError("Run not found")
    _update(run_id, status="running", stage="strategy")
    _push_event(run_id, "strategy", "running", regenerate=True)
    threading.Thread(target=_run_strategy, args=(run_id,), daemon=True,
                     name=f"regen-strategy-{run_id[:8]}").start()


def approve_content(run_id: str) -> None:
    doc = _get(run_id)
    if not doc:
        raise ValueError("Run not found")
    _update(run_id,
            status="complete",
            stage="content",
            approved_content=True)
    _push_event(run_id, "content", "approved")
    _push_event(run_id, "pipeline", "complete")


def regenerate_content(run_id: str) -> None:
    doc = _get(run_id)
    if not doc:
        raise ValueError("Run not found")
    _update(run_id, status="running", stage="content")
    _push_event(run_id, "content", "running", regenerate=True)
    threading.Thread(target=_run_content, args=(run_id,), daemon=True,
                     name=f"regen-content-{run_id[:8]}").start()


# ---------------------------------------------------------------------------
# Exports
# ---------------------------------------------------------------------------

ALLOWED_FORMATS = {"pdf", "docx", "pptx", "zip"}
ALLOWED_SCOPES  = {"research", "strategy", "combined"}


def _safe_entity(doc: Dict[str, Any]) -> str:
    result = doc.get("result") or {}
    plan = result.get("plan") or {}
    title = (result.get("report") or {}).get("title") or ""
    raw = plan.get("subject_entity") or title or doc.get("query") or "report"
    return re.sub(r"[^a-z0-9]+", "_", raw.lower())[:30] or "report"


def _filename(scope: Optional[str], fmt: str, entity: str) -> str:
    if fmt == "pptx":
        return f"strategy_deck_{entity}.pptx"
    if fmt == "zip":
        return f"move_kit_{entity}.zip"
    label = {
        "research": "research_report",
        "strategy": "gtm_strategy",
        "combined": "research_plus_strategy",
    }[scope]
    return f"{label}_{entity}.{fmt}"


def _emit_pdf(doc: Dict[str, Any], scope: str, out_path: Path) -> Path:
    from export.export_pdf import Market_report_analysis
    from export.export_strategy import export_strategy_pdf
    if scope == "strategy":
        result = _scoped_result(doc, "strategy")
        if not result.get("gtm_strategy"):
            raise ValueError("Strategy not yet generated")
        p = export_strategy_pdf(result, path=str(out_path))
    else:
        result = _scoped_result(doc, scope)
        p = Market_report_analysis(result, path=str(out_path))
    if not p or not Path(p).exists():
        raise RuntimeError(f"PDF export failed for scope={scope}")
    return Path(p)


def _emit_docx(doc: Dict[str, Any], scope: str, out_path: Path) -> Path:
    from export.export_docx import export_docx
    result = _scoped_result(doc, scope)
    if scope == "strategy" and not result.get("gtm_strategy"):
        raise ValueError("Strategy not yet generated")
    p = export_docx(result, path=str(out_path))
    if not p or not Path(p).exists():
        raise RuntimeError(f"DOCX export failed for scope={scope}")
    return Path(p)


def _emit_pptx(doc: Dict[str, Any], out_path: Path) -> Path:
    from export.export_pptx import export_pptx
    result = doc.get("result") or {}
    if not result.get("gtm_strategy"):
        raise ValueError("Strategy not yet generated")
    p = export_pptx(result, path=str(out_path))
    if not p or not Path(p).exists():
        raise RuntimeError("PPTX export failed")
    return Path(p)


def _record_export(run_id: str, fmt: str, scope: Optional[str], path: Path) -> Dict[str, Any]:
    rec = {
        "format": fmt,
        "scope": scope,
        "filename": path.name,
        "path": str(path),
        "size": path.stat().st_size,
    }
    runs.update_one({"id": run_id},
                    {"$push": {"exports": rec}, "$set": {"updated_at": _now()}})
    _push_event(run_id, "export", "done", fmt=fmt, scope=scope, filename=path.name)
    return rec


def export(run_id: str, fmt: str, scope: Optional[str] = None) -> Dict[str, Any]:
    """Export a single artifact. Returns the record stored on the run."""
    if fmt not in ALLOWED_FORMATS:
        raise ValueError(f"Unsupported format: {fmt}")
    doc = _get(run_id)
    if not doc or "result" not in doc:
        raise ValueError("Run not found or has no usable result")

    out_dir = RUNS_DIR / run_id
    out_dir.mkdir(parents=True, exist_ok=True)
    entity = _safe_entity(doc)

    if fmt == "zip":
        return export_zip(run_id)

    if fmt in {"pdf", "docx"}:
        if scope not in ALLOWED_SCOPES:
            raise ValueError(f"scope must be one of {sorted(ALLOWED_SCOPES)} for {fmt}")
        out_path = out_dir / _filename(scope, fmt, entity)
        path = _emit_pdf(doc, scope, out_path) if fmt == "pdf" \
            else _emit_docx(doc, scope, out_path)
        return _record_export(run_id, fmt, scope, path)

    # pptx (strategy deck)
    out_path = out_dir / _filename(None, "pptx", entity)
    path = _emit_pptx(doc, out_path)
    return _record_export(run_id, "pptx", None, path)


def export_zip(run_id: str) -> Dict[str, Any]:
    """Generate every available export and bundle them into a single ZIP."""
    doc = _get(run_id)
    if not doc or "result" not in doc:
        raise ValueError("Run not found or has no usable result")
    result = doc.get("result") or {}

    out_dir = RUNS_DIR / run_id
    out_dir.mkdir(parents=True, exist_ok=True)
    entity = _safe_entity(doc)

    # Generate every artifact that's currently feasible.
    artifacts: List[Path] = []
    pdf_dir = out_dir / "pdf"
    docx_dir = out_dir / "docx"
    pptx_dir = out_dir / "pptx"
    pdf_dir.mkdir(exist_ok=True)
    docx_dir.mkdir(exist_ok=True)
    pptx_dir.mkdir(exist_ok=True)

    has_strategy = bool(result.get("gtm_strategy"))

    # PDFs
    artifacts.append(_emit_pdf(doc, "research", pdf_dir / _filename("research", "pdf", entity)))
    if has_strategy:
        artifacts.append(_emit_pdf(doc, "strategy", pdf_dir / _filename("strategy", "pdf", entity)))
        artifacts.append(_emit_pdf(doc, "combined", pdf_dir / _filename("combined", "pdf", entity)))

    # DOCX
    artifacts.append(_emit_docx(doc, "research", docx_dir / _filename("research", "docx", entity)))
    if has_strategy:
        artifacts.append(_emit_docx(doc, "strategy", docx_dir / _filename("strategy", "docx", entity)))
        artifacts.append(_emit_docx(doc, "combined", docx_dir / _filename("combined", "docx", entity)))

    # PPTX (strategy deck)
    if has_strategy:
        artifacts.append(_emit_pptx(doc, pptx_dir / _filename(None, "pptx", entity)))

    zip_name = _filename(None, "zip", entity)
    zip_path = out_dir / zip_name
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for p in artifacts:
            # arc structure: pdf/foo.pdf etc.
            zf.write(p, arcname=str(p.relative_to(out_dir)))

    return _record_export(run_id, "zip", None, zip_path)
