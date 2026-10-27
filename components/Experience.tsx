"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from "react";
import type { Chapter } from "@/content/site";
import type { Engine } from "@/lib/engine/engine";
import { cancelIdle, requestIdle } from "@/lib/idle";
import { applyTheme, themeStore } from "@/lib/theme";
import Cursor from "./Cursor";
import Header from "./Header";
import Hud from "./Hud";
import IndexMenu from "./IndexMenu";

// Lets the WebGL ripple cover the button before the DOM colours swap underneath.
const THEME_SWAP_DELAY = 380;

interface ExperienceProps {
  chapters: readonly Chapter[];
  children: ReactNode;
}

export default function Experience({ chapters, children }: ExperienceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const wasOpen = useRef(false);
  const themeTimer = useRef(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [hudDark, setHudDark] = useState(false);
  const dark = useSyncExternalStore(themeStore.subscribe, themeStore.get, themeStore.getServer);
  const N = chapters.length;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let idle = 0;

    const boot = async () => {
      const [{ Engine }] = await Promise.all([import("@/lib/engine/engine"), document.fonts?.ready]);
      if (cancelled) return;
      const engine = Engine.create(root, themeStore.get(), {
        onChapter: setCurrent,
        onHudDark: setHudDark,
        onLost: () => {
          engine?.destroy();
          engineRef.current = null;
        },
      });
      engineRef.current = engine;
    };
    const schedule = () => (idle = requestIdle(() => void boot(), 700));

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      cancelIdle(idle);
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  const setMenu = useCallback((open: boolean) => {
    setMenuOpen(open);
    // Synchronous: Lenis ignores scrollTo while stopped, and go() may follow immediately.
    engineRef.current?.lock(open);
  }, []);

  useEffect(() => {
    if (!menuOpen && wasOpen.current) {
      rootRef.current?.querySelector<HTMLElement>("[data-menu-btn]")?.focus({ preventScroll: true });
    }
    wasOpen.current = menuOpen;
  }, [menuOpen]);

  const go = useCallback(
    (k: number) => {
      setMenu(false);
      const engine = engineRef.current;
      if (engine) return engine.go(k);
      const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById(chapters[k].id)?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    },
    [chapters, setMenu],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (menuOpen) setMenu(false);
        return;
      }
      const engine = engineRef.current;
      if (menuOpen || !engine || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? "")) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        engine.go(Math.min(N - 1, current + 1));
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        engine.go(Math.max(0, current - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, current, N, setMenu]);

  const restart = (e: { preventDefault(): void }) => {
    const engine = engineRef.current;
    if (!engine) return;
    e.preventDefault();
    engine.restart();
  };

  const toggleTheme = (e: MouseEvent<HTMLButtonElement>) => {
    const next = !themeStore.get();
    themeStore.set(next);
    clearTimeout(themeTimer.current);
    const engine = engineRef.current;
    if (!engine) return applyTheme(next);
    engine.setTheme(next, e.currentTarget.getBoundingClientRect());
    themeTimer.current = window.setTimeout(() => applyTheme(next), THEME_SWAP_DELAY);
  };

  useEffect(() => () => clearTimeout(themeTimer.current), []);

  return (
    <div
      ref={rootRef}
      className="root"
      onClick={(e) => {
        if ((e.target as Element).closest("[data-restart]")) restart(e);
      }}
    >
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <Hud chapters={chapters} current={current} dark={hudDark} onGo={go} />
      <Header
        menuOpen={menuOpen}
        dark={dark}
        count={N}
        onToggleMenu={() => setMenu(!menuOpen)}
        onToggleTheme={toggleTheme}
        onHome={restart}
      />
      <IndexMenu open={menuOpen} chapters={chapters} current={current} onGo={go} onClose={() => setMenu(false)} />
      <main inert={menuOpen}>{children}</main>
    </div>
  );
}
