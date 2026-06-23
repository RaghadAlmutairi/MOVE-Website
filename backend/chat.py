"""
chat.py — Grounded chat helper for run pages.

This module is OUTSIDE the locked agent directory. It uses OpenAI directly to
answer user questions about the current run's artefacts (research report or
GTM strategy). It NEVER modifies the run document — it is read-only.

The chat is grounded: a small, scope-specific slice of the run is sent to the
model as system context, so answers stay tied to the real agent output.
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Literal

from openai import OpenAI

_client: OpenAI | None = None
def _openai() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    return _client


def _research_context(result: Dict[str, Any]) -> str:
    """Compact JSON of the research report for the chat to ground on."""
    report = (result or {}).get("report") or {}
    keep = {
        "title": report.get("title"),
        "executive_summary": report.get("executive_summary"),
        "subject_swot": report.get("subject_swot"),
        "market_trends": (report.get("market_trends") or [])[:8],
        "opportunities": (report.get("opportunities") or [])[:8],
        "risks": (report.get("risks") or [])[:8],
        "recommendations": (report.get("recommendations") or [])[:8],
        "company_competitors": [
            {"name": c.get("name"), "value_proposition": c.get("value_proposition"),
             "differentiators_usp": c.get("differentiators_usp")}
            for c in (report.get("company_competitors") or [])[:5]
        ],
        "buyer_personas": [
            {"persona_name": p.get("persona_name"), "role_title": p.get("role_title"),
             "pain_points": (p.get("pain_points") or [])[:3],
             "buying_triggers": (p.get("buying_triggers") or [])[:3]}
            for p in (report.get("buyer_personas") or [])[:5]
        ],
    }
    return json.dumps(keep, ensure_ascii=False)[:8000]


def _strategy_context(result: Dict[str, Any]) -> str:
    gtm = (result or {}).get("gtm_strategy") or {}
    f = gtm.get("foundation") or {}
    a = gtm.get("activation") or {}
    x = gtm.get("execution") or {}
    keep = {
        "north_star": gtm.get("north_star"),
        "positioning_statement": f.get("positioning_statement"),
        "icp": f.get("icp"),
        "top_pains": f.get("top_pains"),
        "beachhead": f.get("beachhead"),
        "primary_motion": (a.get("motion") or {}).get("primary"),
        "channel_plays": [
            {"channel": c.get("channel"), "why": c.get("why"), "invest": c.get("invest")}
            for c in (a.get("channel_plays") or [])[:6]
        ],
        "messaging_by_persona": [
            {"persona": m.get("persona"), "core_promise": m.get("core_promise")}
            for m in (a.get("messaging_by_persona") or [])[:5]
        ],
        "roadmap_90day": [
            {"phase": p.get("phase"), "objective": p.get("objective")}
            for p in (x.get("roadmap_90day") or [])[:3]
        ],
        "north_star_metric": (x.get("metrics") or {}).get("north_star_metric"),
        "risks": [
            {"risk": r.get("risk"), "likelihood": r.get("likelihood"), "impact": r.get("impact")}
            for r in (x.get("risks") or [])[:5]
        ],
    }
    return json.dumps(keep, ensure_ascii=False)[:8000]


def _system_prompt(scope: str, context: str) -> str:
    persona = {
        "research": "You are MOVE's research analyst. Answer the user's question using ONLY the research data below. Be concise (≤120 words), specific, and cite facts from the data. If the data does not contain the answer, say so plainly.",
        "strategy": "You are MOVE's GTM strategy advisor. Answer using ONLY the strategy data below. Be concise (≤120 words), action-oriented, and specific. If the user asks for a change, describe what you would change but DO NOT claim to have applied it — only the Regenerate button does that.",
        "content":  "You are MOVE's content marketing advisor. Answer using ONLY the strategy data below as context for the generated content suite (LinkedIn / blog / SEO / email). Be concise (≤120 words) and constructive. If the user asks for a content change, describe what you would change but DO NOT claim to have applied it — only the Regenerate button does that.",
    }[scope]
    return f"{persona}\n\n===CONTEXT===\n{context}\n===END CONTEXT==="


def reply(run_doc: Dict[str, Any], scope: Literal["research", "strategy", "content"],
          messages: List[Dict[str, str]]) -> Dict[str, str]:
    """Synchronously call OpenAI and return a chat completion message."""
    if not run_doc or "result" not in run_doc:
        return {"role": "assistant", "content": "I don't see a completed run yet. Please run research first."}
    result = run_doc["result"]
    if scope == "research":
        ctx = _research_context(result)
    else:
        # both strategy and content scopes ground on the strategy snapshot
        ctx = _strategy_context(result)
    sys = {"role": "system", "content": _system_prompt(scope, ctx)}
    # Keep last ~10 user/assistant turns
    history = [m for m in messages if m.get("role") in ("user", "assistant") and m.get("content")][-10:]

    res = _openai().chat.completions.create(
        model=os.getenv("CHAT_MODEL", "gpt-4o-mini"),
        messages=[sys, *history],
        temperature=0.3,
        max_tokens=400,
    )
    text = (res.choices[0].message.content or "").strip()
    return {"role": "assistant", "content": text}
