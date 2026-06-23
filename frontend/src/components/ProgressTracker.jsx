import { Check, Loader2 } from "lucide-react";

/**
 * ProgressTracker - Persistent workflow progress bar
 * Shows: Research → Strategy → Content → Export
 * Visible throughout the application
 */
export default function ProgressTracker({ currentStage, completedStages = [] }) {
  const stages = [
    { key: 'research', label: 'Research' },
    { key: 'strategy', label: 'Strategy' },
    { key: 'content', label: 'Content' },
    { key: 'export', label: 'Export' }
  ];

  const getStageStatus = (stageKey) => {
    if (completedStages.includes(stageKey)) return 'completed';
    if (currentStage === stageKey) return 'active';
    return 'pending';
  };

  return (
    <div className="bg-move-surface border-b border-move-border py-3 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-2">
          {stages.map((stage, idx) => {
            const status = getStageStatus(stage.key);
            const isLast = idx === stages.length - 1;

            return (
              <div key={stage.key} className="flex items-center flex-1">
                <StageIndicator stage={stage} status={status} />
                {!isLast && <Connector completed={completedStages.includes(stage.key)} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StageIndicator({ stage, status }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center transition-all
          ${status === 'completed' ? 'bg-move-ink border-2 border-move-ink' : ''}
          ${status === 'active' ? 'bg-move-grad-2 border-2 border-move-grad-2 animate-pulse' : ''}
          ${status === 'pending' ? 'bg-move-bg-subtle border-2 border-move-border' : ''}
        `}
      >
        {status === 'completed' && <Check className="w-4 h-4 text-white" />}
        {status === 'active' && <Loader2 className="w-4 h-4 text-white animate-spin" />}
        {status === 'pending' && <div className="w-2 h-2 rounded-full bg-move-border" />}
      </div>
      <span
        className={`
          text-[13px] font-medium whitespace-nowrap
          ${status === 'completed' ? 'text-move-ink' : ''}
          ${status === 'active' ? 'text-move-ink' : ''}
          ${status === 'pending' ? 'text-move-muted' : ''}
        `}
        style={{ fontWeight: status === 'pending' ? 400 : 500 }}
      >
        {stage.label}
      </span>
    </div>
  );
}

function Connector({ completed }) {
  return (
    <div className="flex-1 h-0.5 mx-2 relative">
      <div className="absolute inset-0 bg-move-border" />
      {completed && (
        <div className="absolute inset-0 bg-move-ink transition-all duration-500" />
      )}
    </div>
  );
}

// Made with Bob
