import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRun } from "@/lib/RunContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

const QUICK = {
  research: [
    "What are the top 3 opportunities?",
    "Who is the most direct competitor and why?",
    "Which buyer persona should we prioritise?",
  ],
  strategy: [
    "Why this beachhead?",
    "Which channel is highest-leverage?",
    "What's the biggest risk and how do we mitigate it?",
  ],
  content: [
    "Which LinkedIn post is strongest?",
    "Suggest a tighter subject line for the cold email",
    "What blog topic should we publish first?",
  ],
};

const TITLE = {
  research: "Ask about the research",
  strategy: "Ask about the strategy",
  content: "Ask about the content suite",
};

const INTRO = {
  research: "the research report",
  strategy: "the GTM strategy",
  content: "the generated content suite",
};

export default function ChatPanel({ scope = "research", className = "" }) {
  const { runId, run } = useRun();
  const [messages, setMessages] = useState([
    { id: "intro", role: "assistant", content: `Hi — I have ${INTRO[scope] || "the run"} loaded. Ask me anything about it.` },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  const send = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || sending || !runId) return;
    const nextMsgs = [...messages, { id: `u-${Date.now()}`, role: "user", content: text }];
    setMessages(nextMsgs);
    setInput("");
    setSending(true);
    try {
      const ai = await api.chat(runId, scope,
        nextMsgs.filter((m) => m.role !== "system").map(({ role, content }) => ({ role, content })));
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content: ai.content }]);
    } catch (e) {
      toast.error("Chat error", { description: e.message });
      setMessages((m) => [...m, { id: `e-${Date.now()}`, role: "assistant", content: "Sorry, the chat service is unavailable right now." }]);
    } finally { setSending(false); }
  };

  const ready = run?.status === "complete" || run?.status === "awaiting_research_approval"
              || run?.status === "awaiting_strategy_approval" || run?.status === "awaiting_content_approval";

  return (
    <div className={`rounded-2xl border border-ink-border bg-ink-surface flex flex-col ${className}`} data-testid={`chat-panel-${scope}`}>
      <div className="px-5 py-3.5 border-b border-ink-border flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-accent to-brand-secondary flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <div className="font-semibold text-sm text-ink-text">{TITLE[scope] || "Ask the agent"}</div>
          <div className="text-[11px] text-ink-muted">Grounded in this run&apos;s data only</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin max-h-[420px] min-h-[280px]">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === "user" ? "bg-brand-primary text-white" : "bg-ink-elevated border border-ink-border text-ink-text"
            }`}>{m.content}</div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-xl px-3.5 py-2.5 bg-ink-elevated border border-ink-border text-ink-muted text-sm flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
            </div>
          </div>
        )}
      </div>

      {ready && (
        <div className="px-5 pb-2.5 flex flex-wrap gap-1.5">
          {(QUICK[scope] || []).map((p) => (
            <button key={p} onClick={() => send(p)} disabled={sending} data-testid={`chat-quick-${p.slice(0,10)}`} className="text-[11px] px-2.5 py-1 rounded-full bg-ink-elevated border border-ink-border text-ink-muted hover:text-ink-text hover:border-brand-primary/50 transition-colors disabled:opacity-40">
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 border-t border-ink-border flex items-center gap-2">
        <Input data-testid={`chat-input-${scope}`} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={ready ? "Type your question…" : "Waiting for run to be ready…"} disabled={!ready || sending} className="bg-ink-bg border-ink-border text-ink-text" />
        <Button data-testid={`chat-send-${scope}`} onClick={() => send()} disabled={!ready || sending || !input.trim()} className="bg-brand-primary hover:bg-[#9333EA] text-white">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
