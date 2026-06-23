import { useEffect, useState } from "react";

const KEY = "move:theme";

function initial() {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "light" || v === "dark") return v;
  } catch (e) { void e; }
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

function apply(theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  root.style.colorScheme = theme;
}

/** Single source of truth for theme. Defaults to OS preference, persists in
 *  localStorage, and toggles the .dark class on <html>. */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const t = initial(); apply(t); return t;
  });

  useEffect(() => { apply(theme); try { localStorage.setItem(KEY, theme); } catch (e) { void e; } }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => {
      const stored = (() => { try { return localStorage.getItem(KEY); } catch (err) { void err; return null; } })();
      if (!stored) setTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return { theme, setTheme, toggle };
}
