"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { Chapter, ChapterGroup } from "@/content/site";

interface IndexMenuProps {
  open: boolean;
  chapters: readonly Chapter[];
  current: number;
  onGo(index: number): void;
  onClose(): void;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function IndexMenu({ open, chapters, current, onGo, onClose }: IndexMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      ref.current?.querySelector<HTMLElement>(`[data-go="${current}"]`)?.focus({ preventScroll: true });
    }, 60);
    return () => clearTimeout(t);
  }, [open, current]);

  const groups = new Map<ChapterGroup, { chapter: Chapter; index: number }[]>();
  chapters.forEach((chapter, index) => {
    const list = groups.get(chapter.group) ?? [];
    list.push({ chapter, index });
    groups.set(chapter.group, list);
  });

  return (
    <div
      ref={ref}
      id="index-menu"
      className="menu"
      role="dialog"
      aria-modal="true"
      aria-label="Index"
      data-open={open || undefined}
      data-lenis-prevent
      inert={!open}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <nav className="menu__grid" aria-label="Chapters">
        {[...groups].map(([group, items]) => (
          <div key={group} className="menu__group">
            <p className="menu__heading">{group}</p>
            {items.map(({ chapter, index }) => (
              <a
                key={chapter.id}
                href={`#${chapter.id}`}
                className="menu__link"
                data-go={index}
                aria-current={open && index === current ? "true" : undefined}
                style={{ "--i": index } as CSSProperties}
                onClick={(e) => {
                  e.preventDefault();
                  onGo(index);
                }}
              >
                <span className="menu__num">{pad(index + 1)}</span> {chapter.nav}
              </a>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}
