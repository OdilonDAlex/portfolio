import { afterEach, describe, expect, it, vi } from "vitest";
import { Engine } from "./engine";

const callbacks = () => ({ onChapter: vi.fn(), onHudDark: vi.fn(), onLost: vi.fn() });

function page() {
  const root = document.createElement("div");
  root.innerHTML = `<section data-ch data-label="A"><div data-stage><h1 data-title>A</h1><p data-d>a</p></div></section>`;
  document.body.append(root);
  return root;
}

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("Engine.create", () => {
  it("returns null and leaves the page untouched without WebGL", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const root = page();
    const before = root.outerHTML;
    expect(Engine.create(root, false, callbacks())).toBeNull();
    expect(root.outerHTML).toBe(before);
    expect(root.querySelector("canvas")).toBeNull();
  });
});
