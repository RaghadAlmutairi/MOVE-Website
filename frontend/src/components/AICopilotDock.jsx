import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const QUICK_PROMPTS = [
  "Improve my positioning",
  "Sharpen the ICP",
  "Suggest 3 new channels",
  "Rewrite the elevator pitch",
];

export default function AICopilotDock() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { id: "init", role: "ai", text: "Hi Alex — I'm your GTM Copilot. Ask me anything about Northwind's strategy, content, or competitors." },
  ]);

  const send = (textOverride) => {
    const text = textOverride ?? input;
    if (!text.trim()) return;
    const next = [...messages, { id: `u-${Date.now()}`, role: "user", text }];
    setInput("");
    setMessages(next);
    setTimeout(() => {
      setMessages([
        ...next,
        {
          id: `a-${Date.now()}`,
          role: "ai",
          text:
            text.toLowerCase().includes("position")
              ? "Updated positioning: 'Clay automates with templates. Northwind reasons with transparent agents — every decision is explainable.' Want me to propagate this across messaging?"
              : text.toLowerCase().includes("icp")
              ? "Tightening ICP to Series B–C SaaS with $20M–$100M ARR and a new RevOps hire in the last 90 days. That's 412 accounts in our target list."
              : "I've drafted a refined version. Take a look at the strategy panel — I've highlighted the changes for review.",
        },
      ]);
    }, 900);
  };

  return (
    <>
      <button
        data-testid="ai-copilot-fab"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-brand-primary via-brand-accent to-brand-secondary text-white shadow-2xl shadow-brand-primary/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform animate-pulse-glow"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: 480, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 480, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[460px] bg-ink-surface border-l border-ink-border flex flex-col"
              data-testid="ai-copilot-panel"
            >
              <div className="px-5 py-4 border-b border-ink-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent to-brand-secondary flex items-center justify-center">
                    <Wand2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-sm text-ink-text">GTM Copilot</div>
                    <div className="text-[11px] text-ink-muted">Strategy assistant · GPT-class reasoning</div>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  data-testid="ai-copilot-close"
                  className="w-8 h-8 rounded-md hover:bg-ink-elevated flex items-center justify-center text-ink-muted hover:text-ink-text transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-brand-primary text-white"
                          : "bg-ink-elevated border border-ink-border text-ink-text"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 pb-3 flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    data-testid={`copilot-quick-${p.replace(/\s+/g, "-").toLowerCase()}`}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-ink-elevated border border-ink-border text-ink-muted hover:text-ink-text hover:border-brand-primary/50 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="p-4 border-t border-ink-border flex items-center gap-2">
                <Input
                  data-testid="copilot-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask the copilot anything..."
                  className="bg-ink-bg border-ink-border text-ink-text placeholder:text-ink-muted/60 focus-visible:ring-brand-primary/40"
                />
                <Button onClick={() => send()} data-testid="copilot-send" className="bg-brand-primary hover:bg-[#9333EA] text-white">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
