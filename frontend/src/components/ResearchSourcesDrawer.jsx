import { BookOpen, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * ResearchSourcesDrawer - Global sources panel
 * Shows all research sources, URLs, publications, and metadata
 * Citations are hidden from UI but available here for review
 */
export default function ResearchSourcesDrawer({ open, onOpenChange, sources = [] }) {
  if (!sources || sources.length === 0) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg bg-move-surface border-move-border">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-move-ink">
              <BookOpen className="w-5 h-5" />
              Research Sources
            </SheetTitle>
            <SheetDescription className="text-move-body">
              Supporting evidence and citations for this research
            </SheetDescription>
          </SheetHeader>
          <div className="mt-8 text-center text-move-muted">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No sources available yet</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg bg-move-surface border-move-border">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-move-ink font-medium" style={{ fontWeight: 500 }}>
            <BookOpen className="w-5 h-5" />
            Research Sources
          </SheetTitle>
          <SheetDescription className="text-move-body">
            {sources.length} source{sources.length !== 1 ? 's' : ''} referenced in this research
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          <div className="space-y-4">
            {sources.map((source, idx) => (
              <SourceCard key={idx} source={source} index={idx + 1} />
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function SourceCard({ source, index }) {
  const { url, title, publication, date, type, snippet } = source;

  return (
    <div className="rounded-[12px] border border-move-border bg-move-bg p-4 hover:bg-move-bg-subtle transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-move-grad-3-tint border border-move-grad-3/30 flex items-center justify-center">
          <span className="text-[11px] font-medium text-move-grad-3" style={{ fontWeight: 500 }}>{index}</span>
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-[14px] font-medium text-move-ink leading-snug mb-1" style={{ fontWeight: 500 }}>
              {title}
            </h4>
          )}
          {publication && (
            <div className="text-[12px] text-move-muted mb-2">
              {publication}
              {date && ` · ${date}`}
              {type && ` · ${type}`}
            </div>
          )}
          {snippet && (
            <p className="text-[13px] text-move-body leading-relaxed mb-3 line-clamp-3">
              {snippet}
            </p>
          )}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] text-move-grad-3 hover:text-move-ink transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="truncate max-w-[300px]">{url}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// Made with Bob
