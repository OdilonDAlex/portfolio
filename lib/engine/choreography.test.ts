import { describe, expect, it } from "vitest";
import {
  FrameGovernor,
  chapterPhase,
  easeInOutQuart,
  layoutChapters,
  renderScale,
  restartDuration,
  reveal,
  scrollState,
  smoothstep,
  travelDuration,
} from "./choreography";

describe("smoothstep / easeInOutQuart", () => {
  it("clamps and eases between edges", () => {
    expect(smoothstep(0, 1, -1)).toBe(0);
    expect(smoothstep(0, 1, 2)).toBe(1);
    expect(smoothstep(0, 1, 0.5)).toBe(0.5);
    expect(smoothstep(0, 1, 0.25)).toBeCloseTo(0.15625);
  });

  it("eases in and out symmetrically", () => {
    expect(easeInOutQuart(0)).toBe(0);
    expect(easeInOutQuart(1)).toBe(1);
    expect(easeInOutQuart(0.5)).toBe(0.5);
    expect(easeInOutQuart(0.25) + easeInOutQuart(0.75)).toBeCloseTo(1);
  });
});

describe("layoutChapters", () => {
  const vh = 1000;

  it("gives each chapter 1.7 viewports of scroll, the last one a single viewport", () => {
    const { H, chapters, total } = layoutChapters([0, 0, 0], vh);
    expect(H).toBe(1700);
    expect(chapters.map((c) => c.top)).toEqual([0, 1700, 3400]);
    expect(chapters.map((c) => c.height)).toEqual([1700, 1700, 1000]);
    expect(chapters.map((c) => c.hold)).toEqual([1700 * 0.42, 1700 * 0.42, 1]);
    expect(total).toBe(4400);
  });

  it("adds scroll room for stages taller than the viewport", () => {
    const { chapters } = layoutChapters([0, 200, 100], vh);
    expect(chapters[1]).toMatchObject({ over: 200, height: 1700 + 240, top: 1700 });
    expect(chapters[1].hold).toBeCloseTo(714 + 240);
    expect(chapters[2]).toMatchObject({ over: 100, height: 1000 + 120, hold: 120, top: 1700 + 1940 });
  });
});

describe("scrollState", () => {
  const { H, chapters } = layoutChapters([0, 0, 0, 0], 1000);

  it("rests on the first chapter at the top of the page", () => {
    expect(scrollState(0, chapters, H)).toEqual({ i: 0, T: 0, progress: 0, cur: 0, pan: 0, inv: 0 });
  });

  it("holds the chapter before starting the transition", () => {
    const s = scrollState(chapters[0].hold - 1, chapters, H);
    expect(s.T).toBe(0);
    expect(s.cur).toBe(0);
  });

  it("switches the current chapter halfway through the transition", () => {
    const mid = chapters[0].hold + H * 0.58 * 0.5;
    const s = scrollState(mid, chapters, H);
    expect(s.T).toBeCloseTo(0.5);
    expect(scrollState(mid + 5, chapters, H).cur).toBe(1);
    expect(scrollState(mid - 5, chapters, H).cur).toBe(0);
  });

  it("reports overall progress in chapters", () => {
    expect(scrollState(chapters[2].top, chapters, H).progress).toBe(2);
    expect(scrollState(chapters[1].top + H / 2, chapters, H).progress).toBeCloseTo(1.5);
  });

  it("floods ink while entering the last chapter and keeps it there", () => {
    const enter = chapters[2].top + chapters[2].hold + H * 0.58 * 0.5;
    expect(scrollState(enter, chapters, H).inv).toBeCloseTo(0.5);
    expect(scrollState(chapters[3].top, chapters, H).inv).toBe(1);
    expect(scrollState(chapters[3].top, chapters, H).T).toBe(0);
  });

  it("pans tall stages up while holding", () => {
    const tall = layoutChapters([300, 0], 1000);
    const c = tall.chapters[0];
    expect(scrollState(c.hold / 2, tall.chapters, tall.H).pan).toBeCloseTo(0.5);
    expect(scrollState(c.hold + 10, tall.chapters, tall.H).pan).toBe(1);
  });
});

describe("chapterPhase", () => {
  it("shows the current chapter, fading out during the first half of the transition", () => {
    expect(chapterPhase(2, 2, 0)).toEqual({ on: true, enter: 1, exit: 0 });
    expect(chapterPhase(2, 2, 0.45).exit).toBe(1);
  });

  it("brings the next chapter in during the second half", () => {
    expect(chapterPhase(3, 2, 0.4)).toEqual({ on: true, enter: 0, exit: 0 });
    expect(chapterPhase(3, 2, 1).enter).toBe(1);
  });

  it("keeps every other chapter off", () => {
    expect(chapterPhase(0, 2, 0.5).on).toBe(false);
    expect(chapterPhase(4, 2, 0.5).on).toBe(false);
  });
});

describe("reveal", () => {
  it("is fully visible and sharp when entered and not exiting", () => {
    expect(reveal(1, 0, 0, 3)).toEqual({ opacity: 1, y: 0, blur: 0 });
  });

  it("starts hidden, lowered and blurred", () => {
    expect(reveal(0, 0, 0, 3)).toEqual({ opacity: 0, y: 26, blur: 6 });
  });

  it("leaves upwards when exiting", () => {
    const r = reveal(1, 1, 0, 3);
    expect(r.opacity).toBe(0);
    expect(r.y).toBe(-26);
  });

  it("staggers later elements", () => {
    expect(reveal(0.5, 0, 2, 3).opacity).toBeLessThan(reveal(0.5, 0, 0, 3).opacity);
  });
});

describe("renderScale", () => {
  it("renders at device pixel ratio, capped", () => {
    expect(renderScale(2, 1440, 900, 1, 2, 1e9)).toBe(2);
    expect(renderScale(3, 400, 800, 1, 2, 1e9)).toBe(2);
    expect(renderScale(0, 400, 800, 1, 2, 1e9)).toBe(1);
  });

  it("applies the quality factor and the pixel budget", () => {
    expect(renderScale(2, 1000, 1000, 0.5, 2, 1e9)).toBe(1);
    expect(renderScale(2, 2000, 1000, 1, 2, 4e6)).toBeCloseTo(Math.sqrt(2));
  });
});

describe("durations", () => {
  it("travels further for distant chapters, within limits", () => {
    expect(travelDuration(0, 1)).toBeCloseTo(1.38);
    expect(travelDuration(0, 15)).toBe(4.5);
    expect(restartDuration(16)).toBe(9);
    expect(restartDuration(4)).toBeCloseTo(2.8);
  });
});

describe("FrameGovernor", () => {
  it("keeps full quality when frames are on budget", () => {
    const g = new FrameGovernor();
    for (let n = 0; n < 500; n++) expect(g.sample(16.7)).toBe(false);
    expect(g.quality).toBe(1);
  });

  it("lowers quality after sustained slow frames, down to a floor", () => {
    const g = new FrameGovernor({ patience: 10 });
    let changes = 0;
    for (let n = 0; n < 2000; n++) if (g.sample(40)) changes++;
    expect(changes).toBeGreaterThan(0);
    expect(g.quality).toBeLessThan(1);
    expect(g.quality).toBeGreaterThanOrEqual(0.55);
  });

  it("ignores stalls such as a backgrounded tab", () => {
    const g = new FrameGovernor({ patience: 2 });
    for (let n = 0; n < 50; n++) g.sample(1000);
    expect(g.quality).toBe(1);
  });
});
