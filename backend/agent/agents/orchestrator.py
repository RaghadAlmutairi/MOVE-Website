# -*- coding: utf-8 -*-
"""ORCHESTRATOR AGENT.

Responsibility
--------------
Coordinate the three specialist agents in strict sequential order, enforce
human-in-the-loop approval at every stage, and manage the unified pipeline.

Sequential Workflow: Research → Strategy → Content

Execution order
---------------

  ┌─────────────────────────────────────────────────────────┐
  │  STEP 1 – RESEARCH AGENT                                │
  │  Runs first. Output: approved research Report.          │
  └──────────────────────────┬──────────────────────────────┘
                             │  [Human approves research]
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │  STEP 2 – STRATEGY AGENT                                │
  │  GTM strategy grounded in the research report.          │
  └──────────────────────────┬──────────────────────────────┘
                             │  [Human approves strategy]
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │  STEP 3 – CONTENT (unified phase)                       │
  │  Full content suite: LinkedIn / blogs / SEO / emails    │
  │  Uses BOTH research output AND approved GTM strategy    │
  │  Automatically starts after strategy approval           │
  └─────────────────────────────────────────────────────────┘
                             │  [Human approves content]
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │  STEP 4 – REPORTING                                     │
  │  Export: PDF / Word / PPTX / strategy PDF               │
  └─────────────────────────────────────────────────────────┘

Human-in-the-loop gates
-----------------------
- Research approval required before Strategy
- Strategy approval required before Content
- Content automatically starts after Strategy approval (no separate gate)
- Content approval required before final export
"""
import os
import json
from typing import Any, Dict, List, Optional

from core.config import IN_NOTEBOOK
from core.schemas import ToolPlan

from export.render import render_md, _gtm_md, _content_md
from export.export import market_report_analysis_tool
from export.export_strategy import export_strategy_pdf

from agents.strategy_agent import generate_gtm_strategy
from agents.content_agent import generate_content_studio

# All tools live in the tools package.
from tools.content_tools import generate_ppt, INTENT_KEYWORDS, TEXT_TOOL_NAMES, CONTENT_TOOLS

import pipeline.guardrails as guardrails
import pipeline.evaluation as evaluation
import pipeline.memory as memory


# ---------------------------------------------------------------------------
# Terminal UI helpers
# ---------------------------------------------------------------------------

def _has_llm_output(result: Dict[str, Any]) -> bool:
    """Return True when the result dict contains usable LLM-generated content."""
    if result.get("blocked"):
        return False
    r = result.get("report") or {}
    return bool(
        r.get("executive_summary")
        or r.get("product_competitors")
        or r.get("company_competitors")
        or r.get("buyer_personas")
    )


def _ask_exact(prompt: str, valid: Dict[str, str], attempts: int = 3) -> Optional[str]:
    """Prompt for one of a fixed set of responses; return the canonical value."""
    for i in range(attempts):
        try:
            raw = input(prompt).strip().lower()
        except (EOFError, KeyboardInterrupt):
            return None
        if raw in valid:
            return valid[raw]
        left = attempts - i - 1
        print(
            f"   Invalid response. Allowed: "
            f"{' / '.join(sorted(set(valid.values())))}. "
            f"{left} attempt(s) left."
        )
    return None


def _ask_yes_no(prompt: str, attempts: int = 3) -> bool:
    return (
        _ask_exact(prompt, {"y": "y", "yes": "y", "n": "n", "no": "n"}, attempts) == "y"
    )


def _ask_multi(prompt: str, valid: Dict[str, str], attempts: int = 3) -> List[str]:
    """Multi-select: accept any number of options; 'all' selects everything."""
    import re
    allvals = list(dict.fromkeys(valid.values()))
    for i in range(attempts):
        try:
            raw = input(prompt).strip().lower()
        except (EOFError, KeyboardInterrupt):
            return []
        toks = [t for t in re.split(r"[ ,/]+", raw) if t]
        if "all" in toks or "everything" in toks:
            return allvals
        sel = []
        for t in toks:
            if t in valid and valid[t] not in sel:
                sel.append(valid[t])
        if sel:
            return sel
        print(f"   Choose from: {' / '.join(allvals)} (or 'all').")
    return []


def _render_to_terminal(md: str) -> None:
    try:
        from rich.console import Console
        from rich.markdown import Markdown as _RichMD
        Console().print(_RichMD(md))
    except Exception:
        print(md)


def _show_md(md: str, banner: str) -> None:
    print(f"\n\n================ {banner} ================\n")
    if IN_NOTEBOOK:
        from IPython.display import Markdown, display
        display(Markdown(md))
    else:
        _render_to_terminal(md)


def _show_report(result: Dict[str, Any]) -> str:
    md = render_md(result)
    _show_md(md, "RESEARCH REPORT")
    with open("market_research_result.json", "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    with open("market_research_report.md", "w", encoding="utf-8") as f:
        f.write(md)
    return md


def _deliver_file(path: str) -> None:
    try:
        from google.colab import files as _colab_files  # type: ignore
        _colab_files.download(path)
        print(f"   ⬇ download started: {path}")
        return
    except Exception:
        pass
    print(f"   File saved to: {os.path.abspath(path)}")


def _plan_obj(result: Dict[str, Any]) -> ToolPlan:
    return ToolPlan(**result["plan"])


# ---------------------------------------------------------------------------
# Export helpers
# ---------------------------------------------------------------------------

_FMT = {
    "pdf": "pdf", "word": "word", "docx": "word",
    "pptx": "pptx", "ppt": "pptx", "powerpoint": "pptx", "deck": "pptx",
    "no": "no", "n": "no", "none": "no",
}

_APPROVE = {
    "approved": "approved", "approve": "approved", "a": "approved",
    "re-generate": "regenerate", "regenerate": "regenerate", "r": "regenerate",
}


def _export(result: Dict[str, Any], fmt: str) -> Optional[str]:
    """Export the result in the requested format; return the file path."""
    if fmt == "pptx":
        fn  = generate_ppt
        out = fn.invoke({"result": result}) if hasattr(fn, "invoke") else fn(result=result)
    else:
        fn  = market_report_analysis_tool
        out = (
            fn.invoke({"result": result, "fmt": fmt})
            if hasattr(fn, "invoke")
            else fn(result=result, fmt=fmt)
        )
    p = out.get("path")
    if p:
        _deliver_file(p)
        result.setdefault("exports", []).append({"format": fmt, "path": p})
        print(f"   ✓ {fmt.upper()} created: {p}")
    else:
        print(f"   ⚠ {fmt} export unavailable (install the matching library).")
    return p


# ---------------------------------------------------------------------------
# Stage runners
# ---------------------------------------------------------------------------

def _run_strategy(result: Dict[str, Any], max_attempts: int = 2) -> Optional[Dict[str, Any]]:
    """Generate (and validate) the GTM strategy; return the strategy dict or None."""
    plan   = _plan_obj(result)
    report = result["report"]
    gtm    = None

    for attempt in range(1, max_attempts + 1):
        print(f"\n[strategy agent] generating GTM strategy (attempt {attempt}) …")
        try:
            gtm = generate_gtm_strategy(
                result["query"], plan, report, result.get("sources")
            ).model_dump()
        except Exception as e:
            print(f"   ⚠ strategy generation failed: {str(e)[:90]}")
            return None

        issues = guardrails.strategy_guardrails(gtm, report)
        ev     = evaluation.evaluate_strategy(gtm)
        gtm["_evaluation"] = ev
        print(
            f"   [eval] strategy overall={ev.get('overall')} "
            f"passed={ev.get('passed')} (threshold {ev.get('threshold')})"
        )
        if issues:
            print("   guardrail issues: " + "; ".join(issues))

        if (not issues and ev.get("passed")) or attempt == max_attempts:
            if issues or not ev.get("passed"):
                print("   proceeding with noted gaps.")
            return gtm

        print("   enforcing strategy REGENERATE …")

    return gtm


# ---------------------------------------------------------------------------
# Content Studio – full content suite (requires approved strategy)
# ---------------------------------------------------------------------------

def _run_content_studio(
    result: Dict[str, Any],
    gtm: Dict[str, Any],
    channels: List[str],
    max_attempts: int = 2,
) -> Optional[Dict[str, Any]]:
    """Generate and validate the Content Studio bundle using research + GTM strategy.

    Requires an approved GTM strategy.  This is the single place in the codebase
    where Content Studio generation is initiated.
    """
    plan   = _plan_obj(result)
    report = result["report"]
    bundle = None

    for attempt in range(1, max_attempts + 1):
        print(f"\n[content agent] Content Studio – full content suite (attempt {attempt}) …")
        try:
            bundle = generate_content_studio(
                result["query"], plan, report, gtm
            ).model_dump()
        except Exception as e:
            print(f"   ⚠ Content Studio generation failed: {str(e)[:90]}")
            return None

        bundle = _filter_content(bundle, channels)

        issues = guardrails.content_guardrails(bundle)
        ev     = evaluation.evaluate_content(bundle)
        bundle["_evaluation"] = ev
        print(
            f"   [eval] Content Studio overall={ev.get('overall')} "
            f"passed={ev.get('passed')} (threshold {ev.get('threshold')})"
        )
        if issues:
            print("   brand guardrail issues: " + "; ".join(issues))

        if (not issues and ev.get("passed")) or attempt == max_attempts:
            if issues or not ev.get("passed"):
                print("   proceeding with noted gaps.")
            return bundle

        print("   brand guardrails failed → enforcing Content Studio REGENERATE …")

    return bundle


# ---------------------------------------------------------------------------
# Content helpers
# ---------------------------------------------------------------------------

_CONTENT_OPTS = {
    "linkedin": "linkedin", "li": "linkedin",
    "blog": "blog", "seo": "seo",
    "email": "email", "emails": "email",
    "pdf": "pdf", "ppt": "pptx", "pptx": "pptx", "powerpoint": "pptx",
}


def _filter_content(bundle: Dict[str, Any], channels: List[str]) -> Dict[str, Any]:
    """Remove content assets not in the requested channels list."""
    if not channels:
        return bundle
    if "linkedin" not in channels:
        bundle["linkedin_posts"] = []
    if "blog" not in channels:
        bundle["blog_drafts"] = []
    if "seo" not in channels:
        bundle["seo_articles"] = []
    if "email" not in channels:
        bundle["email_drafts"] = []
    return bundle


def _detect_intents(query: str) -> List[str]:
    """Detect which asset types the user explicitly requested."""
    q = (query or "").lower()
    return [name for name, kws in INTENT_KEYWORDS.items() if any(k in q for k in kws)]


def _call_tool(t: Any, **kwargs: Any) -> Dict[str, Any]:
    return t.invoke(kwargs) if hasattr(t, "invoke") else t(**kwargs)


# ---------------------------------------------------------------------------
# Orchestrator entry point
# ---------------------------------------------------------------------------

def run_pipeline(result: Dict[str, Any], regenerate_research) -> Dict[str, Any]:
    """Run the full multi-agent pipeline with human-in-the-loop at every stage.

    Pipeline: Research → Strategy → Content Studio → Export

    Parameters
    ----------
    result              : research result dict (from run_research)
    regenerate_research : callable() → result dict  – regenerates research

    Returns
    -------
    Final result dict (accumulated across all stages).
    """
    company = (
        (result.get("plan") or {}).get("subject_entity")
        or (result.get("report") or {}).get("title")
        or "(market)"
    )

    # ------------------------------------------------------------------
    # STEP 1: RESEARCH – show, guardrail-check, Approve / Regenerate
    # ------------------------------------------------------------------
    print("\n\n═══════════════ STEP 1: RESEARCH ═══════════════")
    while True:
        _show_report(result)
        ri = guardrails.research_guardrails(result)
        if ri:
            print("\n⚠ Research guardrail notes:")
            for x in ri:
                print(f"   • {x}")

        choice = _ask_exact("\nApproved? / Re-Generate : ", _APPROVE, attempts=3)
        if choice is None:
            print("\n⛔ No valid choice. Session terminated.")
            return result
        if choice == "approved":
            memory.log_approval(company, "research:approved")
            break

        print("\n↻ Regenerating research …")
        new = regenerate_research()
        if not _has_llm_output(new):
            print("\n⛔ Regeneration produced no usable output. Session terminated.")
            return new
        result = new

    # Auto-export research documents (PDF + DOCX)
    print("\n[Exporting] Research documents...")
    _export(result, "pdf")
    _export(result, "word")

    # ------------------------------------------------------------------
    # STEP 2: STRATEGY
    # ------------------------------------------------------------------
    run_strategy = _ask_yes_no("\nCreate your GTM strategy? (y/n) : ")

    gtm: Optional[Dict[str, Any]] = None

    if run_strategy:
        print("\n\n═══════════════ STEP 2: STRATEGY ═══════════════")
        gtm = _run_strategy(result)

        if gtm:
            result["gtm_strategy"] = gtm
            for _ in range(3):
                _show_md("\n".join(_gtm_md(gtm)), "GTM STRATEGY")
                sc = _ask_exact("\nApproved? / Re-Generate : ", _APPROVE, attempts=3)
                if sc is None or sc == "approved":
                    memory.log_approval(company, "strategy:approved")
                    break
                gtm = _run_strategy(result)
                if gtm is None:
                    print("   ⚠ Strategy regeneration failed; proceeding with last draft.")
                    gtm = result["gtm_strategy"]
                    break
                result["gtm_strategy"] = gtm

            # Auto-export strategy documents (PDF + DOCX + PPTX)
            print("\n[Exporting] Strategy documents...")
            p = export_strategy_pdf(result)
            if p:
                _deliver_file(p)
                result.setdefault("exports", []).append({"format": "strategy_pdf", "path": p})
                memory.log_approval(company, "strategy:pdf")

    # ------------------------------------------------------------------
    # STEP 3: CONTENT STUDIO – full suite
    # Gate: requires approved strategy (gtm must be set).
    # Automatically starts after strategy approval.
    # Automatically generates ALL content channels.
    # ------------------------------------------------------------------
    if run_strategy and gtm and result.get("gtm_strategy"):
        print("\n\n═══════════════ STEP 3: CONTENT STUDIO ═══════════════")
        print(
            "   Generating all content channels: LinkedIn, Blog, SEO, Email\n"
        )

        # Auto-generate ALL content channels
        channels = ["linkedin", "blog", "seo", "email"]

        studio_bundle: Optional[Dict[str, Any]] = None
        for _ in range(1, 3):
            studio_bundle = _run_content_studio(result, gtm, channels)
            if studio_bundle is None:
                break
            result["content"] = studio_bundle
            _show_md("\n".join(_content_md(studio_bundle)), "CONTENT STUDIO")
            cb = _ask_exact("\nApproved? / Re-Generate : ", _APPROVE, attempts=3)
            if cb is None or cb == "approved":
                memory.log_approval(company, "content_studio:approved")
                break

    # ------------------------------------------------------------------
    # STEP 4: AUTO-EXPORT ALL DOCUMENTS
    # ------------------------------------------------------------------
    print("\n\n═══════════════ STEP 4: EXPORTING DOCUMENTS ═══════════════")
    
    # Export combined report (Research + Strategy + Content) - PDF + DOCX
    if gtm or result.get("content"):
        print("[Exporting] Combined report (Research + Strategy + Content)...")
        _export(result, "pdf")
        _export(result, "word")
        memory.log_approval(company, "combined:pdf")
        memory.log_approval(company, "combined:word")
    
    # Export strategy PPTX if strategy exists
    if gtm:
        print("[Exporting] Strategy presentation...")
        _export(result, "pptx")
        memory.log_approval(company, "strategy:pptx")

    memory.save_run(result)
    print("\n✓ Session complete. All documents exported.")
    return result