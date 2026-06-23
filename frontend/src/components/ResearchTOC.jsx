import { useEffect, useState } from "react";
import {
  Lightbulb, ShieldCheck, TrendingUp, AlertTriangle, Compass, Building2,
  Users, BookOpen, FileText,
} from "lucide-react";

/**
 * ResearchTOC — sticky left sidebar listing the sections that ACTUALLY have
 * content for this run. We only emit a TOC entry when the caller tells us a
 * section is present (`sections[key] === true`). Clicking an entry smooth-
 * scrolls to the corresponding section by id (#executive-summary, #swot, …).
 */
const ITEMS = [
  { id: "executive-summary", label: "Executive summary", icon: Lightbulb },
  { id: "swot",              label: "SWOT",              icon: ShieldCheck },
  { id: "opportunities",     label: "Opportunities",     icon: TrendingUp },
  { id: "risks",             label: "Risks",             icon: AlertTriangle },
  { id: "recommendations",   label: "Recommendations",   icon: Compass },
  { id: "trends",            label: "Market trends",     icon: TrendingUp },
  { id: "competitors",       label: "Competitors",       icon: Building2 },
  { id: "personas",          label: "Buyer personas",    icon: Users },
];

export default function ResearchTOC({ sections, onOpenSources, sourcesCount }) {
  const visible = ITEMS.filter((it) => sections[it.id]);
  const [active, setActive] = useState(visible[0]?.id || "");

  // Highlight the section currently in view.
  useEffect(() => {
    if (visible.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const inview = entries.filter((e) => e.isIntersecting);
        if (inview.length > 0) setActive(inview[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    );
    visible.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [visible.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <aside aria-label="Section navigation" data-testid="research-toc"
           className="hidden md:block w-[220px] shrink-0 sticky top-32 self-start">
      <nav className="rounded-[16px] border border-move-border bg-move-surface p-3">
        <div className="text-[11px] uppercase tracking-wider text-move-muted px-3 py-2 font-medium" style={{ fontWeight: 500 }}>On this page</div>
        <ul>
          {visible.map((it) => {
            const isActive = active === it.id;
            return (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(it.id);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  data-testid={`toc-${it.id}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive ? "bg-move-bg-subtle text-move-ink" : "text-move-muted hover:text-move-ink hover:bg-move-bg-subtle/60"
                  }`}
                  style={{ fontWeight: isActive ? 500 : 400 }}
                >
                  <it.icon className="w-4 h-4" />
                  <span className="truncate">{it.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
        <hr className="my-2 border-move-border" />
        <button
          onClick={onOpenSources}
          data-testid="toc-sources"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-move-muted hover:text-move-ink hover:bg-move-bg-subtle/60 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Sources</span>
          {!!sourcesCount && (
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-move-bg-subtle border border-move-border text-move-muted">{sourcesCount}</span>
          )}
        </button>
      </nav>
    </aside>
  );
}
