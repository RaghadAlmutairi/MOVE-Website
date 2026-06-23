"""
strategy_direction.py — Generate 4 strategy-direction suggestions grounded in
the approved research report.

Lives OUTSIDE the locked agent directory. Does NOT modify the agent code.
The model is instructed to use ONLY fields present in the research report;
the response shape is JSON-validated and rejected if it adds fields the UI
does not ground on.
"""

from __future__ import annotations

import json
import os
import re
from typing import Any, Dict, List

from openai import OpenAI

_client: OpenAI | None = None
def _openai() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    return _client


def _report_context(result: Dict[str, Any]) -> str:
    """Compact research-report context. Same shape used by chat.py."""
    report = (result or {}).get("report") or {}
    plan = (result or {}).get("plan") or {}
    keep = {
        "subject":           plan.get("subject_entity") or report.get("title"),
        "industry":          plan.get("industry") or plan.get("market"),
        "geography":         plan.get("geography"),
        "executive_summary": report.get("executive_summary"),
        "subject_swot":      report.get("subject_swot"),
        "market_trends":     (report.get("market_trends") or [])[:8],
        "opportunities":     (report.get("opportunities") or [])[:8],
        "risks":             (report.get("risks") or [])[:8],
        "recommendations":   (report.get("recommendations") or [])[:8],
        "buyer_personas": [
            {"persona_name": p.get("persona_name"), "role_title": p.get("role_title"), "segment": p.get("segment")}
            for p in (report.get("buyer_personas") or [])[:6]
        ],
        "company_competitors": [
            {"name": c.get("name"), "value_proposition": c.get("value_proposition"), "directness": c.get("directness")}
            for c in (report.get("company_competitors") or [])[:6]
        ],
    }
    return json.dumps(keep, ensure_ascii=False)[:9000]


SYS = (
    "You are MOVE's GTM strategist. Propose exactly 4 distinct, mutually-different "
    "strategic directions for the subject below.\n"
    "\n"
    "STRICT RULES:\n"
    "  • Use ONLY information present in the RESEARCH CONTEXT — do not invent "
    "competitors, market sizes, growth rates, revenue, or any number not in the "
    "context.\n"
    "  • Each direction must be traceable to one or more elements in the context "
    "(opportunity / risk / persona / competitor / SWOT item / recommendation).\n"
    "  • Keep each direction SHORT and actionable.\n"
    "  • Do NOT include citation markers like [12]; cite by quoting the supporting "
    "fact in plain language inside the `evidence` field.\n"
    "\n"
    "Return JSON ONLY with this exact schema:\n"
    '{ "directions": [\n'
    '    { "title": str (≤8 words),\n'
    '      "summary": str (1 sentence, ≤32 words),\n'
    '      "target_segment": str (≤16 words),\n'
    '      "primary_motion": one of ["product-led","sales-led","community-led","partner-led","content-led"],\n'
    '      "evidence": [str, str, ...]   — 2-4 short bullets quoting supporting facts from the context\n'
    "    }, ... 4 items in total ] }"
)


def generate_directions(result: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Return exactly 4 grounded strategy-direction suggestions."""
    ctx = _report_context(result)
    res = _openai().chat.completions.create(
        model=os.getenv("DIRECTION_MODEL", "gpt-4o-mini"),
        messages=[
            {"role": "system", "content": SYS},
            {"role": "user",   "content": f"===RESEARCH CONTEXT===\n{ctx}\n===END CONTEXT==="},
        ],
        temperature=0.4,
        max_tokens=900,
        response_format={"type": "json_object"},
    )
    raw = (res.choices[0].message.content or "").strip()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        # The model occasionally wraps the JSON in prose; salvage it.
        m = re.search(r"\{[\s\S]+\}", raw)
        data = json.loads(m.group(0)) if m else {"directions": []}

    out: List[Dict[str, Any]] = []
    for d in (data.get("directions") or [])[:4]:
        if not isinstance(d, dict):
            continue
        out.append({
            "title":          str(d.get("title") or "").strip(),
            "summary":        str(d.get("summary") or "").strip(),
            "target_segment": str(d.get("target_segment") or "").strip(),
            "primary_motion": str(d.get("primary_motion") or "").strip().lower(),
            "evidence":       [str(x).strip() for x in (d.get("evidence") or []) if x][:4],
        })
    return out[:4]
