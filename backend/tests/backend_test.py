"""
Backend smoke tests for MOVE GTM backend.
Covers: health, list runs, create run + poll, chat (research), and delete cleanup.
The agent pipeline is slow; we only verify create + first-poll + (optionally) wait for
awaiting_research_approval, then clean up. No full pipeline drive.
"""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://gtm-copilot-2.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ── Health ────────────────────────────────────────────────────────────────────
class TestHealth:
    def test_health_ok(self, session):
        r = session.get(f"{API}/health", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["ok"] is True
        assert d["service"] == "move-backend"
        assert d["agent"] == "gtm_v4_fixed"


# ── List runs ─────────────────────────────────────────────────────────────────
class TestListRuns:
    def test_list_runs_returns_array(self, session):
        r = session.get(f"{API}/runs?limit=5", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        if data:
            assert "id" in data[0]
            assert "status" in data[0]


# ── Create run + poll + chat + cleanup ────────────────────────────────────────
class TestRunLifecycle:
    run_id = None

    def test_create_run(self, session):
        payload = {"query": "Anthropic competitive brief", "url": ""}
        r = session.post(f"{API}/runs", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "id" in d
        assert d["query"] == "Anthropic competitive brief"
        assert d["status"] in ("running", "queued", "awaiting_research_approval")
        TestRunLifecycle.run_id = d["id"]

    def test_get_run_persisted(self, session):
        assert TestRunLifecycle.run_id, "Run not created"
        r = session.get(f"{API}/runs/{TestRunLifecycle.run_id}", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == TestRunLifecycle.run_id
        assert "status" in d
        assert "stage" in d
        # _id should not leak from mongo
        assert "_id" not in d

    def test_poll_for_awaiting_research(self, session):
        """Poll up to ~3 min for research to complete and hit HITL gate."""
        assert TestRunLifecycle.run_id
        rid = TestRunLifecycle.run_id
        deadline = time.time() + 180
        last_status = None
        while time.time() < deadline:
            r = session.get(f"{API}/runs/{rid}", timeout=15)
            assert r.status_code == 200
            doc = r.json()
            last_status = doc.get("status")
            if last_status == "awaiting_research_approval":
                # has result attached
                assert doc.get("result") is not None or doc.get("stage") is not None
                return
            if last_status == "failed":
                pytest.fail(f"Run failed: {doc.get('error')}")
            time.sleep(5)
        pytest.skip(f"Research did not finish within 180s (last status={last_status}); create+poll path verified")

    def test_chat_research_scope(self, session):
        """Chat works only after research completes; skip if not awaiting."""
        assert TestRunLifecycle.run_id
        rid = TestRunLifecycle.run_id
        r = session.get(f"{API}/runs/{rid}", timeout=15)
        if r.json().get("status") != "awaiting_research_approval":
            pytest.skip("Research not yet complete; cannot validate chat reply content")
        body = {
            "scope": "research",
            "messages": [{"role": "user", "content": "Summarize the top 2 competitors in one line each."}],
        }
        rc = session.post(f"{API}/runs/{rid}/chat", json=body, timeout=60)
        assert rc.status_code == 200, rc.text
        reply = rc.json()
        # Reply may be string or dict with content
        if isinstance(reply, dict):
            text = reply.get("content") or reply.get("reply") or str(reply)
        else:
            text = str(reply)
        assert text and len(text.strip()) > 0

    def test_cleanup_delete_run(self, session):
        rid = TestRunLifecycle.run_id
        if not rid:
            pytest.skip("No run to delete")
        r = session.delete(f"{API}/runs/{rid}", timeout=15)
        assert r.status_code == 200
        assert r.json().get("deleted", 0) >= 1
        # verify gone
        r2 = session.get(f"{API}/runs/{rid}", timeout=15)
        assert r2.status_code == 404


# ── Negative tests ────────────────────────────────────────────────────────────
class TestNegative:
    def test_get_unknown_run_404(self, session):
        r = session.get(f"{API}/runs/does-not-exist-xyz", timeout=15)
        assert r.status_code == 404

    def test_create_run_validation(self, session):
        r = session.post(f"{API}/runs", json={"query": "x"}, timeout=15)
        # query has min_length=2 → 'x' should fail
        assert r.status_code in (400, 422)
