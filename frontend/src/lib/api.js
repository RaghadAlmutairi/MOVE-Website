// MOVE backend client. Every endpoint here maps 1:1 to the sequential
// pipeline (Research -> Strategy -> Content -> Export).
const RAW_BASE = process.env.REACT_APP_BACKEND_URL || "";
const API = `${RAW_BASE.replace(/\/$/, "")}/api`;

// Status codes that indicate a transient upstream / proxy issue worth retrying.
// 520-526 are Cloudflare-specific; 502/503/504 are standard gateway errors; 408 timeout.
const TRANSIENT = new Set([408, 425, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524, 525, 526]);

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function req(path, opts = {}) {
  const isMutation = (opts.method || "GET").toUpperCase() !== "GET";
  // Retry GETs more aggressively, mutations once (idempotent on the backend).
  const maxAttempts = isMutation ? 2 : 3;

  let lastErr = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(`${API}${path}`, {
        headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
        ...opts,
      });
      if (res.ok) return res.json();

      // Transient upstream — retry with backoff.
      if (TRANSIENT.has(res.status) && attempt < maxAttempts) {
        await sleep(400 * attempt); // 400ms, 800ms
        continue;
      }

      // Hard failure — surface a helpful message.
      let detail;
      try { const j = await res.json(); detail = j.detail || JSON.stringify(j); }
      catch (e) { void e; detail = null; }

      if (!detail) {
        detail = TRANSIENT.has(res.status)
          ? "The server is temporarily unreachable. Please try again in a moment."
          : `${res.status}${res.statusText ? " " + res.statusText : ""}`;
      }
      throw new Error(detail);
    } catch (e) {
      lastErr = e;
      // Network-level failure (offline, DNS, abort) — retry if we have budget.
      if (e.name === "TypeError" && attempt < maxAttempts) {
        await sleep(400 * attempt);
        continue;
      }
      throw e;
    }
  }
  throw lastErr || new Error("Request failed");
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

  // Strategy direction gate (between research approval and strategy generation)
  getStrategySuggestions: (id) => req(`/runs/${id}/strategy/suggestions`),
  refreshStrategySuggestions: (id) => req(`/runs/${id}/strategy/suggestions`, { method: "POST" }),
  startStrategy: (id, direction, custom = false) =>
    req(`/runs/${id}/strategy/start`, {
      method: "POST",
      body: JSON.stringify({ direction, custom }),
    }),

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
