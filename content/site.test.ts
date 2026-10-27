import { describe, expect, it } from "vitest";
import { chapters, works } from "./site";

describe("chapters", () => {
  it("has 16 chapters with unique ids", () => {
    expect(chapters).toHaveLength(16);
    expect(new Set(chapters.map((c) => c.id)).size).toBe(chapters.length);
  });

  it("starts on the intro anchored at #top and ends on contact", () => {
    expect(chapters[0].id).toBe("top");
    expect(chapters.at(-1)!.id).toBe("contact");
  });

  it("lists the selected works in chapter order", () => {
    const order = chapters.map((c) => c.id as string);
    const positions = works.map((w) => order.indexOf(w.id));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(positions.every((p) => p > 0)).toBe(true);
  });
});
