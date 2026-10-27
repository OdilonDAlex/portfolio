export const smoothstep = (a: number, b: number, v: number) => {
  const x = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

export const easeInOutQuart = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export interface ChapterLayout {
  top: number;
  /** Scroll distance the chapter stays still before transitioning to the next one. */
  hold: number;
  height: number;
  /** How much the stage is taller than the viewport. */
  over: number;
}

/** Each chapter is pinned for 1.7 viewports of scroll; overflowing stages get extra room to pan. */
export function layoutChapters(overflows: number[], vh: number) {
  const H = Math.round(vh * 1.7);
  const last = overflows.length - 1;
  let top = 0;
  const chapters = overflows.map((over, k): ChapterLayout => {
    const extra = over * 1.2;
    const c = {
      top,
      over,
      hold: k === last ? Math.max(1, extra) : H * 0.42 + extra,
      height: (k === last ? vh : H) + extra,
    };
    top += c.height;
    return c;
  });
  return { H, chapters, total: top };
}

export interface ScrollState {
  /** Chapter whose range contains the scroll position. */
  i: number;
  /** Transition from chapter i to i + 1, 0 → 1. */
  T: number;
  /** Position in chapters, 0 → N - 1. */
  progress: number;
  /** Chapter considered current for the HUD and keyboard navigation. */
  cur: number;
  /** Pan of an overflowing stage, 0 → 1. */
  pan: number;
  /** Ink flood of the closing chapter, 0 → 1. */
  inv: number;
}

export function scrollState(y: number, L: ChapterLayout[], H: number): ScrollState {
  const N = L.length;
  let i = 0;
  while (i < N - 1 && y >= L[i + 1].top) i++;
  const c = L[i];
  const local = Math.max(0, y - c.top);
  const T = i >= N - 1 ? 0 : smoothstep(0, 1, (local - c.hold) / (H * 0.58));
  return {
    i,
    T,
    progress: Math.min(N - 1, i + local / c.height),
    cur: T > 0.5 ? i + 1 : i,
    pan: c.over > 0 ? Math.min(1, local / c.hold) : 0,
    inv: i === N - 2 ? T : i >= N - 1 ? 1 : 0,
  };
}

// A chapter has fully left at EXIT_END; the next one starts entering at ENTER_START.
const EXIT_END = 0.45;
const ENTER_START = 0.5;

export function chapterPhase(k: number, i: number, T: number) {
  if (k === i) return { on: true, enter: 1, exit: smoothstep(0, EXIT_END, T) };
  if (k === i + 1) return { on: true, enter: smoothstep(ENTER_START, 1, T), exit: 0 };
  return { on: false, enter: 0, exit: 0 };
}

/** Progress of the WebGL title dissolve, kept in step with the HTML content so two chapters never overlap. */
export function titleDissolve(T: number) {
  return { out: clamp01(T / EXIT_END), in: clamp01((T - ENTER_START) / (1 - ENTER_START)) };
}

/** Staggered reveal of the j-th of n elements of a chapter. */
export function reveal(enter: number, exit: number, j: number, n: number) {
  const step = n > 1 ? Math.min(0.12, 0.5 / (n - 1)) : 0;
  const e = clamp01((enter - j * step) / (1 - (n - 1) * step));
  const x = clamp01((exit - j * step * 0.5) / (1 - (n - 1) * step * 0.5));
  return { opacity: e * (1 - x), y: (1 - e) * 26 - x * 26, blur: (1 - e + x) * 6 };
}

export function renderScale(dpr: number, w: number, h: number, quality: number, maxDpr: number, maxPixels: number) {
  const s = Math.min(dpr || 1, maxDpr) * quality;
  return w * h * s * s > maxPixels ? Math.sqrt(maxPixels / (w * h)) : s;
}

export const travelDuration = (from: number, to: number) => Math.min(4.5, 1.1 + Math.abs(to - from) * 0.28);

export const restartDuration = (chapters: number) => Math.min(9, 0.7 * chapters);

interface GovernorOptions {
  budgetMs?: number;
  patience?: number;
  floor?: number;
  step?: number;
}

/** Lowers the render scale when frames stay over budget, so slower GPUs keep a fluid scroll. */
export class FrameGovernor {
  quality = 1;
  private ema: number;
  private slow = 0;
  private budget: number;
  private patience: number;
  private floor: number;
  private step: number;

  constructor({ budgetMs = 24, patience = 60, floor = 0.55, step = 0.8 }: GovernorOptions = {}) {
    this.budget = budgetMs;
    this.patience = patience;
    this.floor = floor;
    this.step = step;
    this.ema = budgetMs * 0.7;
  }

  /** Returns true when the quality changed. */
  sample(dtMs: number) {
    if (dtMs <= 0 || dtMs > 100) return false;
    this.ema = this.ema * 0.92 + dtMs * 0.08;
    if (this.ema <= this.budget || this.quality <= this.floor) {
      this.slow = 0;
      return false;
    }
    if (++this.slow < this.patience) return false;
    this.quality = Math.max(this.floor, this.quality * this.step);
    this.slow = 0;
    this.ema = this.budget * 0.7;
    return true;
  }
}
