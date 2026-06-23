// MOVE backend client. Every endpoint here maps 1:1 to the sequential
// pipeline (Research -> Strategy -> Content -> Export).
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

  // Sequential gates: research -> strategy -> content
  approveResearch: (id) => req(`/runs/${id}/approve_research`, { method: "POST" }),
  regenerateResearch: (id) => req(`/runs/${id}/regenerate_research`, { method: "POST" }),

  approveStrategy: (id) => req(`/runs/${id}/approve_strategy`, { method: "POST" }),
  regenerateStrategy: (id) => req(`/runs/${id}/regenerate_strategy`, { method: "POST" }),

  approveContent: (id) => req(`/runs/${id}/approve_content`, { method: "POST" }),
  regenerateContent: (id) => req(`/runs/${id}/regenerate_content`, { method: "POST" }),

  // Exports
  // - format: "pdf" | "docx" | "pptx" | "zip"
  // - scope:  "research" | "strategy" | "combined"  (required for pdf/docx)
  exportFile: (id, format, scope = null) =>
    req(`/runs/${id}/export`, {
      method: "POST",
      body: JSON.stringify(scope ? { format, scope } : { format }),
    }),
  exportZip: (id) =>
    req(`/runs/${id}/export`, { method: "POST", body: JSON.stringify({ format: "zip" }) }),
  fileUrl: (id, filename) => `${API}/runs/${id}/files/${filename}`,

  chat: (id, scope, messages) =>
    req(`/runs/${id}/chat`, { method: "POST", body: JSON.stringify({ scope, messages }) }),
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

// `activeRun` stores ONLY the opaque server-issued run UUID — never auth tokens
// or secrets.
const KEY = "move:active_run_id";
export const activeRun = {
  get: () => { try { return localStorage.getItem(KEY) || null; } catch (e) { void e; return null; } },
  set: (id) => { try { localStorage.setItem(KEY, id); } catch (e) { void e; } },
  clear: () => { try { localStorage.removeItem(KEY); } catch (e) { void e; } },
};
