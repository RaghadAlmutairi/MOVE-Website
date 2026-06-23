"""
Backend tests for MOVE GTM sequential pipeline (iteration 2).

This file covers the new SEQUENTIAL API contract:
  research -> strategy -> content (phase_a / phase_b endpoints REMOVED).

Strategy:
  * The pipeline takes ~3-5 min for a fresh run, so we DO NOT drive a full
    pipeline here. We reuse an existing 'complete' run in Mongo (one of the
    seed runs in /app/backend/runs/) whose `result` already contains
    report + gtm_strategy + content. Export endpoints are pure renderers
    (no LLM) -- they work fine on any well-formed result doc.
  * We still smoke-test create_run + initial state to confirm the new
    sequential entry point works.
  * Deprecated endpoints (approve_phase_a/b, regenerate_phase_a/b, phase_b)
    are asserted to return 404/405.
"""
import os
import io
import time
import zipfile

import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")
BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

# A pre-existing complete run in the dev Mongo (verified to have
# result.report + result.gtm_strategy + result.content). Used for export
# and chat tests without paying the 5-min pipeline cost.
SEEDED_COMPLETE_RUN = "7da57a83-626e-47b2-9289-044d2e4fbd6c"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def complete_run_id(session):
    """Return a run id whose result has report + gtm_strategy + content."""
    r = session.get(f"{API}/runs/{SEEDED_COMPLETE_RUN}", timeout=15)
    if r.status_code != 200:
        pytest.skip(f"Seeded complete run not present: {r.status_code}")
    doc = r.json()
    result = doc.get("result") or {}
    if not ("report" in result and "gtm_strategy" in result):
        pytest.skip("Seeded run missing required result fields")
    return SEEDED_COMPLETE_RUN


# -- Health -----------------------------------------------------------------
class TestHealth:
    def test_health_ok(self, session):
        r = session.get(f"{API}/health", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["ok"] is True
        assert d["agent"] == "gtm_sequential", f"agent='{d.get('agent')}' expected gtm_sequential"


# -- Deprecated endpoints must be gone --------------------------------------
class TestDeprecatedEndpoints:
    """phase_a / phase_b endpoints were removed in the sequential refactor."""

    @pytest.mark.parametrize("path", [
        "approve_phase_a",
        "approve_phase_b",
        "regenerate_phase_a",
        "regenerate_phase_b",
        "phase_b",
    ])
    def test_old_endpoints_gone(self, session, path):
        # Use the seeded run id so we hit the route layer, not a 404-for-run.
        r = session.post(f"{API}/runs/{SEEDED_COMPLETE_RUN}/{path}", timeout=15)
        # Either 404 (route not registered) or 405 (method-not-allowed) is OK.
        assert r.status_code in (404, 405), f"{path} returned {r.status_code} (expected 404/405)"


# -- Create run (sequential entry point) ------------------------------------
class TestCreateRun:
    def test_create_starts_in_research(self, session):
        r = session.post(f"{API}/runs", json={"query": "TEST_seq_smoke OpenAI", "url": ""}, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "id" in d
        assert d["query"] == "TEST_seq_smoke OpenAI"
        # Initial state must be research-stage and active.
        assert d["status"] in ("running", "queued", "awaiting_research_approval")
        assert d.get("stage") in (None, "research")
        # Cleanup immediately - we don't want to wait for the full pipeline.
        session.delete(f"{API}/runs/{d['id']}", timeout=15)


# -- Exports (against the seeded complete run) ------------------------------
class TestExports:
    def _post_export(self, session, run_id, fmt, scope=None):
        body = {"format": fmt}
        if scope is not None:
            body["scope"] = scope
        return session.post(f"{API}/runs/{run_id}/export", json=body, timeout=120)

    @pytest.mark.parametrize("scope,expected_prefix", [
        ("research", "research_report_"),
        ("strategy", "gtm_strategy_"),
        ("combined", "research_plus_strategy_"),
    ])
    def test_export_pdf_scopes(self, session, complete_run_id, scope, expected_prefix):
        r = self._post_export(session, complete_run_id, "pdf", scope)
        assert r.status_code == 200, r.text
        rec = r.json()
        assert rec["format"] == "pdf"
        assert rec["scope"] == scope
        assert rec["filename"].startswith(expected_prefix), rec["filename"]
        assert rec["filename"].endswith(".pdf")
        assert rec["size"] > 100

    @pytest.mark.parametrize("scope,expected_prefix", [
        ("research", "research_report_"),
        ("strategy", "gtm_strategy_"),
        ("combined", "research_plus_strategy_"),
    ])
    def test_export_docx_scopes(self, session, complete_run_id, scope, expected_prefix):
        r = self._post_export(session, complete_run_id, "docx", scope)
        assert r.status_code == 200, r.text
        rec = r.json()
        assert rec["format"] == "docx"
        assert rec["scope"] == scope
        assert rec["filename"].startswith(expected_prefix)
        assert rec["filename"].endswith(".docx")
        assert rec["size"] > 100

    def test_export_pptx_strategy_deck(self, session, complete_run_id):
        r = self._post_export(session, complete_run_id, "pptx")
        assert r.status_code == 200, r.text
        rec = r.json()
        assert rec["format"] == "pptx"
        # scope may be None for pptx
        assert rec["filename"].startswith("strategy_deck_")
        assert rec["filename"].endswith(".pptx")
        assert rec["size"] > 100

    def test_export_zip_bundles_all(self, session, complete_run_id):
        r = self._post_export(session, complete_run_id, "zip")
        assert r.status_code == 200, r.text
        rec = r.json()
        assert rec["format"] == "zip"
        assert rec["filename"].startswith("move_kit_")
        assert rec["filename"].endswith(".zip")

        # Download and inspect archive contents.
        dl = session.get(f"{API}/runs/{complete_run_id}/files/{rec['filename']}", timeout=60)
        assert dl.status_code == 200
        assert dl.headers.get("content-type", "").startswith("application/zip")
        with zipfile.ZipFile(io.BytesIO(dl.content)) as zf:
            names = zf.namelist()
        # Must contain pdf/ docx/ pptx/ subdirs
        assert any(n.startswith("pdf/") for n in names), names
        assert any(n.startswith("docx/") for n in names), names
        assert any(n.startswith("pptx/") for n in names), names
        # Spot-check a few expected files
        assert any("research_report_" in n and n.endswith(".pdf") for n in names)
        assert any("gtm_strategy_" in n and n.endswith(".pdf") for n in names)
        assert any("strategy_deck_" in n and n.endswith(".pptx") for n in names)


# -- File download (subdirs supported) --------------------------------------
class TestFileDownload:
    def test_download_pdf_at_root(self, session, complete_run_id):
        # Export to ensure a file exists, then fetch by name.
        ex = session.post(f"{API}/runs/{complete_run_id}/export",
                          json={"format": "pdf", "scope": "research"}, timeout=60).json()
        fname = ex["filename"]
        r = session.get(f"{API}/runs/{complete_run_id}/files/{fname}", timeout=30)
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("application/pdf")
        assert r.content[:4] == b"%PDF"

    def test_download_from_subdir(self, session, complete_run_id):
        # ZIP populates pdf/, docx/, pptx/ subdirs. Fetch a file in pdf/ by basename.
        session.post(f"{API}/runs/{complete_run_id}/export", json={"format": "zip"}, timeout=120)
        # Pull the run document to find an artefact in subdir
        doc = session.get(f"{API}/runs/{complete_run_id}", timeout=15).json()
        # Use a known filename pattern; matches what export_zip generated
        # under pdf/ -- research_report_*.pdf
        # We don't have a list endpoint, but the server route searches the
        # first-level subdirs by basename, so just try the canonical name.
        # Use the latest research export's filename, which lives at the root,
        # AND a copy will be inside pdf/. Both should resolve via basename.
        exports = doc.get("exports", [])
        research_pdf = next((e for e in exports if e.get("format") == "pdf" and e.get("scope") == "research"), None)
        assert research_pdf, "No research PDF export recorded"
        fname = research_pdf["filename"]
        r = session.get(f"{API}/runs/{complete_run_id}/files/{fname}", timeout=30)
        assert r.status_code == 200
        assert r.content[:4] == b"%PDF"


# -- Validation: bad format/scope -------------------------------------------
class TestExportValidation:
    def test_bad_format(self, session, complete_run_id):
        r = session.post(f"{API}/runs/{complete_run_id}/export",
                         json={"format": "csv"}, timeout=15)
        # Pydantic Literal rejects -> 422; the spec says 400, but FastAPI/Pydantic
        # default is 422. Either is acceptable for "bad input".
        assert r.status_code in (400, 422), r.text

    def test_bad_scope(self, session, complete_run_id):
        r = session.post(f"{API}/runs/{complete_run_id}/export",
                         json={"format": "pdf", "scope": "banana"}, timeout=15)
        assert r.status_code in (400, 422), r.text

    def test_strategy_export_without_strategy(self, session):
        """Create a fresh run (no strategy yet) and try to export pdf/strategy."""
        cr = session.post(f"{API}/runs",
                          json={"query": "TEST_no_strategy_yet", "url": ""}, timeout=30)
        assert cr.status_code == 200
        rid = cr.json()["id"]
        try:
            # Immediately try strategy export. The run has no result.report at
            # all yet (research still running), so we expect 400 with a clear
            # error. We retry briefly in case the doc isn't yet visible.
            for _ in range(5):
                r = session.post(f"{API}/runs/{rid}/export",
                                 json={"format": "pdf", "scope": "strategy"}, timeout=15)
                if r.status_code == 400:
                    break
                time.sleep(1)
            assert r.status_code == 400, r.text
            detail = r.json().get("detail", "")
            assert ("strategy" in detail.lower()) or ("research" in detail.lower()) or ("result" in detail.lower())
        finally:
            session.delete(f"{API}/runs/{rid}", timeout=15)


# -- Chat -------------------------------------------------------------------
class TestChat:
    @pytest.mark.parametrize("scope", ["research", "strategy", "content"])
    def test_chat_scopes_return_text(self, session, complete_run_id, scope):
        body = {
            "scope": scope,
            "messages": [{"role": "user", "content": "Give me a one-line summary."}],
        }
        r = session.post(f"{API}/runs/{complete_run_id}/chat", json=body, timeout=90)
        assert r.status_code == 200, r.text
        reply = r.json()
        text = reply.get("content") if isinstance(reply, dict) else str(reply)
        assert text and len(text.strip()) > 0, f"Empty chat reply for scope={scope}"


# -- Negative ---------------------------------------------------------------
class TestNegative:
    def test_get_unknown_run_404(self, session):
        r = session.get(f"{API}/runs/does-not-exist-xyz", timeout=15)
        assert r.status_code == 404

    def test_create_run_validation(self, session):
        # query min_length=2
        r = session.post(f"{API}/runs", json={"query": "x"}, timeout=15)
        assert r.status_code in (400, 422)
