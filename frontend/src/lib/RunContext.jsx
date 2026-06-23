import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, activeRun, pollRun } from "@/lib/api";

const RunContext = createContext(null);

// Statuses where polling should continue (the backend is working).
const ACTIVE_STATUSES = new Set([
  "running",
  "awaiting_research_approval",
  "awaiting_strategy_direction",
  "awaiting_strategy_approval",
  "awaiting_content_approval",
]);

export function RunProvider({ children }) {
  const [runId, setRunIdState] = useState(() => activeRun.get());
  const [run, setRun] = useState(null);
  const [history, setHistory] = useState([]);

  const setRunId = useCallback((id) => {
    if (id) activeRun.set(id); else activeRun.clear();
    setRunIdState(id);
    setRun(null);
  }, []);

  const refreshHistory = useCallback(async () => {
    try {
      const list = await api.listRuns(20);
      setHistory(list);
    } catch (e) { /* ignore — history is non-critical */ void e; }
  }, []);

  useEffect(() => {
    if (!runId) { setRun(null); return; }
    const stop = pollRun(runId, (doc) => {
      setRun(doc);
      if (doc.status === "complete" || doc.status === "failed") refreshHistory();
    }, 2500);
    return () => stop && stop();
  }, [runId, refreshHistory]);

  useEffect(() => { refreshHistory(); }, [refreshHistory]);

  const startRun = useCallback(async (query, url) => {
    const created = await api.createRun(query, url);
    setRunId(created.id);
    refreshHistory();
    return created;
  }, [setRunId, refreshHistory]);

  // Mutators that hit the backend and force a refresh
  const mutate = useCallback(async (fn) => {
    const updated = await fn();
    setRun(updated);
    refreshHistory();
    return updated;
  }, [refreshHistory]);

  const value = useMemo(() => ({
    runId, run, history,
    isActive: !!run && ACTIVE_STATUSES.has(run.status),
    setRunId, startRun, refreshHistory, mutate,
  }), [runId, run, history, setRunId, startRun, refreshHistory, mutate]);

  return <RunContext.Provider value={value}>{children}</RunContext.Provider>;
}

export function useRun() {
  const ctx = useContext(RunContext);
  if (!ctx) throw new Error("useRun must be used inside <RunProvider>");
  return ctx;
}
