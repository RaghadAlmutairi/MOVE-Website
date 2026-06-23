# -*- coding: utf-8 -*-
"""CONTENT AGENT – Content Studio.

Responsibility
--------------
Produce a single ContentBundle for the Content Studio stage.  This module owns
ONLY the pure generation logic and brief-compression helpers.

  Content Studio – Full content suite (LinkedIn posts, blogs, SEO articles,
                   email sequences) produced in one unified pass, grounded in
                   BOTH the research report AND the finalised GTM strategy.

  Design note: Content Studio replaces the old Phase A / Phase B split.
  There is no longer a separate "social-media only" pass that runs in parallel
  with the strategy agent.  All content is generated after the strategy is
  approved, which guarantees every asset is strategy-aligned from the start.

What does NOT belong here
-------------------------
* Tool definitions (generate_email / blog / seo / pdf / ppt) → tools/content_tools.py
* Content Studio orchestration (when to run, approval gates) → agents/orchestrator.py

Input
-----
query   : str             – user's original goal
plan    : ToolPlan
report  : Dict[str, Any]  – approved research Report
gtm     : Dict[str, Any]  – approved GTM strategy

Output
------
ContentBundle (Pydantic model).
"""
from typing import Any, Dict, List, Optional

from core.config import CONTENT_MODEL, CONTENT_EFFORT, traceable
from core.llm import parse_llm
from core.prompts import CONTENT_STUDIO_PROMPT
from core.schemas import ContentBundle, ToolPlan
from agents.strategy_agent import _report_brief


# ---------------------------------------------------------------------------
# Brief helpers
# ---------------------------------------------------------------------------

def _strategy_brief(gtm: Dict[str, Any], max_chars: int = 3800) -> str:
    """Compress the GTM strategy into a short context block."""
    g = gtm or {}
    f = g.get("foundation", {}) or {}
    a = g.get("activation", {}) or {}

    wedge = (
        "; ".join(
            d.get("sharpest_message", "")
            for d in (f.get("competitive_differentiation") or [])
        )[:500]
        or "-"
    )
    pillars = (
        "; ".join(
            p
            for m in (a.get("messaging_by_persona") or [])
            for p in (m.get("pillars") or [])
        )[:500]
        or "-"
    )
    chans = (
        "; ".join(c.get("channel", "") for c in (a.get("channel_plays") or []))
        or "-"
    )
    return (
        f"NORTH STAR: {g.get('north_star') or f.get('north_star', '')}\n"
        f"POSITIONING: {f.get('positioning_statement', '')}\n"
        f"BEACHHEAD: {(f.get('beachhead') or {}).get('segment', '')}\n"
        f"COMPETITIVE WEDGE: {wedge}\n"
        f"MESSAGING PILLARS: {pillars}\n"
        f"GTM MOTION: {(a.get('motion') or {}).get('primary', '')}\n"
        f"CHANNELS: {chans}"
    )[:max_chars]


# ---------------------------------------------------------------------------
# Placeholder enforcement (deterministic safety net)
# ---------------------------------------------------------------------------

_RECIPIENT_PH = "[Recipient Name]"
_SENDER_PH    = "[Sender Name]"


def _force_email_placeholders(bundle: Dict[str, Any]) -> Dict[str, Any]:
    """Ensure every email has sender/recipient placeholders.

    The LLM must never invent a real person's name; this deterministic
    post-process is the safety net when the model forgets a placeholder.
    """
    for e in bundle.get("email_drafts", []) or []:
        body = (e.get("body") or "").strip()
        if _RECIPIENT_PH not in body:
            body = f"Hi {_RECIPIENT_PH},\n\n{body}"
        if _SENDER_PH not in body:
            body = f"{body}\n\nBest,\n{_SENDER_PH}"
        e["body"] = body
    return bundle


# ---------------------------------------------------------------------------
# Content Studio – unified single-pass generation
# ---------------------------------------------------------------------------

@traceable(name="content_studio")
def generate_content_studio(
    query: str,
    plan: ToolPlan,
    report: Dict[str, Any],
    gtm: Dict[str, Any],
) -> ContentBundle:
    """Content Studio: generate the full content suite from research + GTM strategy.

    This is the single unified content generation phase that runs sequentially
    after strategy approval. All content is strategy-grounded from the start.

    Sequential workflow: Research → Strategy → Content

    Parameters
    ----------
    query  : user's original goal
    plan   : routing metadata
    report : approved research Report dict
    gtm    : approved GTM strategy dict

    Returns
    -------
    ContentBundle – full suite (LinkedIn posts, blogs, emails)
    """
    user = (
        f"USER GOAL: {query}\n"
        f"SUBJECT: {plan.subject_entity or '(market)'}\n\n"
        f"=== MARKET RESEARCH BRIEF ===\n{_report_brief(report)}\n\n"
        f"=== GTM STRATEGY ===\n{_strategy_brief(gtm)}\n\n"
        "Produce the full Content Studio asset set now."
    )
    out = parse_llm(
        model=CONTENT_MODEL,
        system=CONTENT_STUDIO_PROMPT,
        user=user,
        schema=ContentBundle,
        reasoning_effort=CONTENT_EFFORT,
        label="content-studio",
    )
    bundle = out.model_dump()
    return ContentBundle(**_force_email_placeholders(bundle))