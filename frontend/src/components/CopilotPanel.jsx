import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Send, Loader2, Sparkles, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRun } from "@/lib/RunContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

// Stage → assistant identity. The route the user is on determines who
// answers — the agent sees the matching scope so its answers are grounded
// in the right artefact set.
const STAGE_FROM_PATH = (path) => {
  if (path.startsWith("/research"))  return "research";
  if (path.startsWith("/ideation"))  return "strategy";
  if (path.startsWith("/studio"))    return "content";
  if (path.startsWith("/export"))    return "gtm";
  return "gtm";
};

const META = {
  research: { name: "Research Assistant",  scope: "research", desc: "Grounded in the research report",  hint: "Ask about the market, competitors, or buyer personas." },
  strategy: { name: "Strategy Assistant",  scope: "strategy", desc: "Grounded in the GTM strategy",     hint: "Ask about positioning, channels, or roadmap." },
  content:  { name: "Content Assistant",   scope: "content",  desc: "Grounded in the content suite",   hint: "Ask about LinkedIn, blog, SEO, or email drafts." },
  gtm:      { name: "GTM Assistant",       scope: "strategy", desc: "Whole-run advisor",                hint: "Summarise the run, surface risks, prep next steps." },
};

const QUICK = {
  research: ["Top 3 opportunities?", "Direct competitor and why?", "Which buyer persona to prioritise?"],
  strategy: ["Why this beachhead?", "Highest-leverage channel?", "Biggest risk and mitigation?"],
  content:  ["Strongest LinkedIn post?", "Tighter cold-email subject?", "Which blog to publish first?"],
  gtm:      ["Executive summary in 5 bullets", "Top 3 risks across the plan", "What to ship first?"],
};

const COLLAPSE_KEY = "move:copilot:collapsed";
export default function CopilotPanel() {
  const location = useLocation();
  const stage = STAGE_FROM_PATH(location.pathname);
  // Don't mount on the landing page.
  const isLanding = location.pathname === "/";

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSE_KEY) === "1"; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0"); } catch { /* noop */ }
  }, [collapsed]);

  if (isLanding) return null;

  return (
    <>
      {/* Floating handle when collapsed */}
      {collapsed && (
        <button
          data-testid="copilot-fab"
          onClick={() => setCollapsed(false)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full pl-3 pr-4 py-3 shadow-xl text-white bg-move-ink hover:bg-move-ink-hover transition-all"
          aria-label="Open AI Copilot"
        >
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-move-grad-1 via-move-grad-2 to-move-grad-3 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </span>
          <span className="text-sm font-medium">{META[stage].name}</span>
        </button>
      )}

      {/* Right-side rail when expanded */}
      {!collapsed && (
        <aside
          data-testid="copilot-panel"
          aria-label={META[stage].name}
          className="fixed right-4 bottom-4 top-28 w-[380px] z-40 hidden lg:flex flex-col rounded-2xl border border-move-border bg-move-surface shadow-2xl overflow-hidden"
        >
          <CopilotInner stage={stage} onCollapse={() => setCollapsed(true)} />
        </aside>
      )}
    </>
  );
}

function CopilotInner({ stage, onCollapse }) {
  const meta = META[stage];
  const { runId, run } = useRun();
  const [messages, setMessages] = useState([{
    id: "intro", role: "assistant",
    content: `${meta.name} ready. ${meta.hint}`,
  }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Reset intro when stage (route) changes — keep the panel context-aware.
  useEffect(() => {
    setMessages([{ id: "intro", role: "assistant", content: `${meta.name} ready. ${meta.hint}` }]);
  }, [stage, meta.name, meta.hint]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  const ready = !!runId && [
    "complete", "awaiting_research_approval",
    "awaiting_strategy_approval", "awaiting_content_approval",
  ].includes(run?.status);

  const send = async (override) => {
    // Fall back to DOM value when controlled state hasn't flushed yet
    // (e.g. when programmatic typing+clicking happens in the same tick).
    const fallback = inputRef.current?.value || "";
    const text = (override ?? input ?? fallback).trim() || fallback.trim();
    if (!text || sending) return;
    if (inputRef.current) inputRef.current.value = "";
    if (!runId) {
      setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", content: text },
        { id: `a-${Date.now()}`, role: "assistant", content: "Start a run from the Research stage and I'll join you here with the data." }]);
      setInput("");
      return;
    }
    if (!ready) {
      setMessages((m) => [...m, { id: `u-${Date.now()}`, role: "user", content: text },
        { id: `a-${Date.now()}`, role: "assistant", content: "I'll be ready as soon as the agent finishes the current step." }]);
      setInput("");
      return;
    }
    const next = [...messages, { id: `u-${Date.now()}`, role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const ai = await api.chat(runId, meta.scope,
        next.filter((m) => m.role !== "system").map(({ role, content }) => ({ role, content })));
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content: ai.content }]);
    } catch (e) {
      toast.error("Copilot error", { description: e.message });
    } finally { setSending(false); }
  };

  return (
    <>
      <header className="px-4 py-3 border-b border-move-border bg-gradient-to-r from-move-grad-1-tint via-move-grad-2-tint to-move-grad-3-tint flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-move-grad-1 via-move-grad-2 to-move-grad-3 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-move-ink truncate" data-testid="copilot-title">{META[stage].name}</div>
          <div className="text-[11px] text-move-muted truncate">{META[stage].desc}</div>
        </div>
        <button onClick={onCollapse} data-testid="copilot-collapse"
                className="w-7 h-7 rounded-md hover:bg-move-bg-subtle flex items-center justify-center text-move-muted hover:text-move-ink"
                aria-label="Minimise">
          <ChevronRight className="w-4 h-4" />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 scrollbar-thin">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-move-ink text-white"
                : "bg-move-bg-subtle border border-move-border text-move-ink"
            }`}>{m.content}</div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-xl px-3 py-2 bg-move-bg-subtle border border-move-border text-move-muted text-sm flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-2.5 flex flex-wrap gap-1.5">
        {(QUICK[stage] || []).map((p) => (
          <button key={p} onClick={() => send(p)} disabled={sending}
                  data-testid={`copilot-quick-${stage}`}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-move-bg-subtle border border-move-border text-move-muted hover:text-move-ink hover:border-move-grad-2 transition-colors disabled:opacity-40">
            {p}
          </button>
        ))}
      </div>

      <div className="p-3 border-t border-move-border flex items-center gap-2">
        <Input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && send()}
               placeholder={ready ? "Ask the assistant…" : "Waiting for run data…"}
               disabled={sending}
               data-testid={`copilot-input-${stage}`}
               className="bg-move-bg border-move-border text-move-ink rounded-[10px]" />
        <Button onClick={() => send()} disabled={sending}
                data-testid={`copilot-send-${stage}`}
                className="bg-move-ink hover:bg-move-ink-hover text-white rounded-[10px] h-10 w-10 p-0">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </>
  );
}

// Re-export X for symmetry; some pages may want a custom close button.
export { X as CopilotCloseIcon };
