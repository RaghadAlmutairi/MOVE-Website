// MOVE backend client. Every endpoint here maps 1:1 to a documented gate
// in agents/orchestrator.py (gtm_v4_fixed). No fake endpoints.
const RAW_BASE = process.env.REACT_APP_BACKEND_URL || "";
const API = `${RAW_BASE.replace(/\/$/, "")}/api`;

async function req(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try { const j = await res.json(); detail = j.detail || JSON.stringify(j); } catch (e) { void e; }
    throw new Error(detail);
  }
  return res.json();
}

export const api = {
  base: API,
  health: () => req("/health"),
  createRun: (query, url) => req("/runs", { method: "POST", body: JSON.stringify({ query, url: url || "" }) }),
  listRuns: (limit = 30) => req(`/runs?limit=${limit}`),
  getRun: (id) => req(`/runs/${id}`),
  deleteRun: (id) => req(`/runs/${id}`, { method: "DELETE" }),

  approveResearch: (id, runStrategy = true, runContent = true) =>
    req(`/runs/${id}/approve_research`, { method: "POST", body: JSON.stringify({ run_strategy: runStrategy, run_content: runContent }) }),
  regenerateResearch: (id) => req(`/runs/${id}/regenerate_research`, { method: "POST" }),

  approveStrategy: (id) => req(`/runs/${id}/approve_strategy`, { method: "POST" }),
  regenerateStrategy: (id) => req(`/runs/${id}/regenerate_strategy`, { method: "POST" }),

  approvePhaseA: (id) => req(`/runs/${id}/approve_phase_a`, { method: "POST" }),
  regeneratePhaseA: (id) => req(`/runs/${id}/regenerate_phase_a`, { method: "POST" }),

  startPhaseB: (id, channels) => req(`/runs/${id}/phase_b`, { method: "POST", body: JSON.stringify({ channels }) }),
  approvePhaseB: (id) => req(`/runs/${id}/approve_phase_b`, { method: "POST" }),
  regeneratePhaseB: (id) => req(`/runs/${id}/regenerate_phase_b`, { method: "POST" }),

  exportFile: (id, format) => req(`/runs/${id}/export`, { method: "POST", body: JSON.stringify({ format }) }),
  fileUrl: (id, filename) => `${API}/runs/${id}/files/${filename}`,
};

// Long-poll a run until a terminal/awaiting state.
export function pollRun(id, onUpdate, intervalMs = 2000) {
  let stopped = false; let timer = null;
  const tick = async () => {
    if (stopped) return;
    try {
      const doc = await api.getRun(id);
      onUpdate(doc);
    } catch (e) {
      onUpdate({ status: "failed", error: e.message });
      return;
    }
    timer = setTimeout(tick, intervalMs);
  };
  tick();
  return () => { stopped = true; if (timer) clearTimeout(timer); };
}

const KEY = "move:active_run_id";
export const activeRun = {
  get: () => { try { return localStorage.getItem(KEY) || null; } catch (e) { void e; return null; } },
  set: (id) => { try { localStorage.setItem(KEY, id); } catch (e) { void e; } },
  clear: () => { try { localStorage.removeItem(KEY); } catch (e) { void e; } },
};
