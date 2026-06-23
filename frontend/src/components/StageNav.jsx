import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * StageNav — Previous / Return-to-Projects / Next bar shown at the bottom
 * of every workflow page. Provides obvious linear navigation between
 * Research → Strategy → Content → Export.
 */
const ORDER = [
  { key: "research", to: "/research", label: "Research" },
  { key: "strategy", to: "/ideation", label: "Strategy" },
  { key: "content",  to: "/studio",   label: "Content"  },
  { key: "export",   to: "/export",   label: "Export"   },
];

export default function StageNav({ stage, nextDisabled = false, nextLabel, onNext }) {
  const navigate = useNavigate();
  const idx = ORDER.findIndex((s) => s.key === stage);
  const prev = idx > 0 ? ORDER[idx - 1] : null;
  const next = idx >= 0 && idx < ORDER.length - 1 ? ORDER[idx + 1] : null;

  return (
    <nav className="mt-12 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-move-border pt-6"
         data-testid="stage-nav" aria-label="Workflow navigation">
      <Button
        variant="outline"
        onClick={() => prev && navigate(prev.to)}
        disabled={!prev}
        data-testid="stage-nav-prev"
        className="border-move-border-ghost text-move-ink hover:bg-move-bg-subtle h-10 rounded-[10px] font-medium min-w-[160px] justify-start"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {prev ? `Previous · ${prev.label}` : "Start"}
      </Button>

      <Button
        variant="ghost"
        asChild
        data-testid="stage-nav-projects"
        className="text-move-muted hover:text-move-ink hover:bg-move-bg-subtle h-10 rounded-[10px]"
      >
        <Link to="/projects">
          <FolderKanban className="w-4 h-4 mr-2" /> Return to Projects
        </Link>
      </Button>

      <Button
        onClick={() => {
          if (onNext) onNext();
          else if (next) navigate(next.to);
        }}
        disabled={nextDisabled || !next}
        data-testid="stage-nav-next"
        className="bg-move-ink hover:bg-move-ink-hover text-white h-10 rounded-[10px] font-medium min-w-[160px] justify-end"
      >
        {nextLabel || (next ? `Next · ${next.label}` : "Done")}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </nav>
  );
}
