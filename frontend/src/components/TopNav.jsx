import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Bell, ChevronDown, Command, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import RunStatusPill from "@/components/RunStatusPill";

const NAV = [
  { to: "/research", label: "Research" },
  { to: "/ideation", label: "Strategy" },
  { to: "/studio", label: "Content" },
  { to: "/export", label: "Export" },
];

export default function TopNav({ variant = "app" }) {
  const location = useLocation();
  const [workspace, setWorkspace] = useState("My workspace");

  return (
    <header
      data-testid="top-nav"
      className={`sticky top-0 z-40 w-full ${
        variant === "marketing"
          ? "glass border-b border-ink-border"
          : "bg-ink-bg/80 backdrop-blur-xl border-b border-ink-border"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-16 flex items-center gap-6">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2 group">
          <img
            src="https://customer-assets.emergentagent.com/job_gtm-copilot-2/artifacts/mhxfp8wp_ChatGPT%20Image%20Jun%2023%2C%202026%2C%2001_40_21%20PM.png"
            alt=""
            aria-hidden="true"
            className="object-contain"
            style={{ width: 36, height: 36 }}
          />
          <span
            className="text-[17px] font-semibold tracking-tight"
            style={{
              backgroundImage: 'var(--gradient-headline)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            MOVE
          </span>
        </Link>

        {variant === "app" && (
          <>
            <div className="hidden md:flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    data-testid="workspace-switcher"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-ink-muted hover:text-ink-text hover:bg-ink-surface transition-colors"
                  >
                    <div className="w-5 h-5 rounded bg-brand-primary/20 text-brand-primary text-[10px] font-bold flex items-center justify-center">N</div>
                    {workspace}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-ink-surface border-ink-border text-ink-text" align="start">
                  <DropdownMenuLabel className="text-ink-muted text-xs uppercase tracking-wider">Workspaces</DropdownMenuLabel>
                  {["My workspace"].map((w) => (
                    <DropdownMenuItem key={w} onClick={() => setWorkspace(w)} className="cursor-pointer focus:bg-ink-elevated">
                      {w}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-ink-border" />
                  <DropdownMenuItem className="cursor-pointer focus:bg-ink-elevated text-brand-secondary">+ New workspace</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <nav className="hidden lg:flex items-center gap-1 ml-2">
              {NAV.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    data-testid={`nav-${item.label.toLowerCase().replace(/ /g, "-")}`}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                      active
                        ? "text-ink-text bg-ink-surface"
                        : "text-ink-muted hover:text-ink-text hover:bg-ink-surface/60"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </>
        )}

        {variant === "marketing" && (
          <nav className="hidden md:flex items-center gap-1 ml-auto mr-2">
            {["Product", "Solutions", "Pricing", "Customers", "Docs"].map((label) => (
              <a
                key={label}
                href="#"
                onClick={(e) => e.preventDefault()}
                data-testid={`marketing-nav-${label.toLowerCase()}`}
                className="px-3 py-1.5 rounded-md text-sm text-ink-muted hover:text-ink-text transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
        )}

        <div className={`flex items-center gap-2 ${variant === "marketing" ? "" : "ml-auto"}`}>
          {variant === "app" && <RunStatusPill />}
          {variant === "app" && (
            <button
              data-testid="search-trigger"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-ink-surface border border-ink-border text-sm text-ink-muted hover:text-ink-text transition-colors min-w-[220px]"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-xs">Search accounts, strategies...</span>
              <kbd className="ml-auto flex items-center gap-0.5 text-[10px] text-ink-muted">
                <Command className="w-3 h-3" />K
              </kbd>
            </button>
          )}

          {variant === "app" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  data-testid="notification-bell"
                  className="relative w-9 h-9 rounded-md hover:bg-ink-surface flex items-center justify-center text-ink-muted hover:text-ink-text transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-ink-surface border-ink-border text-ink-text w-80" align="end">
                <DropdownMenuLabel className="text-ink-muted text-xs uppercase tracking-wider">Notifications</DropdownMenuLabel>
                {[
                  { t: "Strategy approved", d: "Land-and-Expand is live", time: "2m" },
                  { t: "New competitor surfaced", d: "Persana raised $14M", time: "1h" },
                  { t: "Content batch ready", d: "12 assets generated", time: "3h" },
                ].map((n) => (
                  <DropdownMenuItem key={n.t} className="cursor-pointer focus:bg-ink-elevated flex-col items-start gap-0.5 py-2">
                    <div className="text-sm">{n.t}</div>
                    <div className="text-xs text-ink-muted">{n.d} · {n.time}</div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {variant === "marketing" ? (
            <>
              <Link to="/research">
                <Button
                  variant="ghost"
                  data-testid="marketing-signin"
                  className="text-ink-muted hover:text-ink-text hover:bg-ink-surface"
                >
                  Sign in
                </Button>
              </Link>
              <Link to="/research">
                <Button
                  data-testid="marketing-cta"
                  className="bg-brand-primary hover:bg-[#9333EA] text-white shadow-lg shadow-brand-primary/30"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Start free
                </Button>
              </Link>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button data-testid="user-menu" className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-ink-surface transition-colors">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-gradient-to-br from-brand-accent to-brand-primary text-white text-xs font-medium">
                      AK
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-ink-surface border-ink-border text-ink-text" align="end">
                <DropdownMenuLabel>Alex Kim</DropdownMenuLabel>
                <DropdownMenuItem asChild className="focus:bg-ink-elevated">
                  <Link to="/projects" data-testid="user-menu-projects">Projects</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-ink-elevated">Profile</DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-ink-elevated">Settings</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-ink-border" />
                <DropdownMenuItem className="focus:bg-ink-elevated">Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
