import type { Chapter } from "@/content/site";

interface HudProps {
  chapters: readonly Chapter[];
  current: number;
  dark: boolean;
  onGo(index: number): void;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Only displayed in immersive mode; progress, cue and bar are animated by the engine. */
export default function Hud({ chapters, current, dark, onGo }: HudProps) {
  return (
    <div className="hud" data-dark={dark || undefined}>
      <div className="hud__count">
        <span data-hud-count>{pad(current + 1)}</span>
        <span className="hud__muted" data-hud-total>
          / {pad(chapters.length)}
        </span>
      </div>
      <div className="hud__label" data-hud-label aria-hidden="true">
        {chapters[current].label}
      </div>
      <div className="hud__track">
        <div className="hud__progress" data-hud-progress />
      </div>
      <nav className="rail" aria-label="Chapter rail">
        {chapters.map((c, k) => (
          <button
            key={c.id}
            type="button"
            className="rail__tick"
            aria-label={`Go to ${c.nav}`}
            aria-current={k === current ? "true" : undefined}
            onClick={() => onGo(k)}
          >
            <span className="rail__label">{c.nav}</span>
            <span className="rail__line" />
          </button>
        ))}
      </nav>
      <div className="cue" data-hud-cue aria-hidden="true">
        <span>Scroll</span>
        <span className="cue__track">
          <span className="cue__bar" data-hud-bar />
        </span>
      </div>
    </div>
  );
}
