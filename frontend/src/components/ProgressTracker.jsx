import { Check, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * ProgressTracker — sticky workflow progress bar with clickable stages.
 *   Research → Strategy → Content → Export
 * Stages are links so the user always knows where they are and can move
 * between stages with one click.
 */
const STAGES = [
  { key: "research", label: "Research", to: "/research" },
  { key: "strategy", label: "Strategy", to: "/ideation" },
  { key: "content",  label: "Content",  to: "/studio" },
  { key: "export",   label: "Export",   to: "/export" },
];

export default function ProgressTracker({ currentStage, completedStages = [] }) {
  const status = (k) =>
    completedStages.includes(k) ? "completed" :
    currentStage === k          ? "active"    : "pending";

  return (
    <div className="bg-move-surface/80 backdrop-blur border-b border-move-border py-3 px-6 sticky top-16 z-30">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-2">
          {STAGES.map((s, idx) => {
            const st = status(s.key);
            const last = idx === STAGES.length - 1;
            return (
              <div key={s.key} className="flex items-center flex-1">
                <Link
                  to={s.to}
                  data-testid={`progress-stage-${s.key}`}
                  className="flex items-center gap-2 group"
                  aria-current={st === "active" ? "step" : undefined}
                >
                  <Indicator status={st} />
                  <span
                    className={`text-[13px] whitespace-nowrap transition-colors ${
                      st === "pending" ? "text-move-muted group-hover:text-move-ink" : "text-move-ink"
                    }`}
                    style={{ fontWeight: st === "pending" ? 400 : 500 }}
                  >
                    {s.label}
                  </span>
                </Link>
                {!last && (
                  <div className="flex-1 h-0.5 mx-3 relative">
                    <div className="absolute inset-0 bg-move-border" />
                    {completedStages.includes(s.key) && (
                      <div className="absolute inset-0 bg-move-ink transition-all duration-500" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Indicator({ status }) {
  const cls =
    status === "completed" ? "bg-move-ink border-move-ink" :
    status === "active"    ? "bg-move-grad-2 border-move-grad-2 animate-pulse" :
                              "bg-move-bg-subtle border-move-border";
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border-2 ${cls}`}>
      {status === "completed" && <Check className="w-4 h-4 text-white" />}
      {status === "active"    && <Loader2 className="w-4 h-4 text-white animate-spin" />}
      {status === "pending"   && <div className="w-2 h-2 rounded-full bg-move-border" />}
    </div>
  );
}
