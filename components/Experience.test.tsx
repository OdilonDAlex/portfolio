import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chapters } from "@/content/site";
import { themeStore } from "@/lib/theme";
import Experience from "./Experience";

const engine = { go: vi.fn(), restart: vi.fn(), lock: vi.fn(), setTheme: vi.fn(), destroy: vi.fn() };
const create = vi.fn();

vi.mock("@/lib/engine/engine", () => ({ Engine: { create: (...args: unknown[]) => create(...args) } }));

function media({ reducedMotion = false } = {}) {
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: q.includes("reduced-motion") ? reducedMotion : false,
    addEventListener() {},
    removeEventListener() {},
  }));
}

function setup() {
  return render(
    <Experience chapters={chapters}>
      {chapters.map((c) => (
        <section key={c.id} id={c.id} data-ch>
          {c.nav}
        </section>
      ))}
    </Experience>,
  );
}

beforeEach(() => {
  themeStore.set(false);
  create.mockReset();
  Object.values(engine).forEach((f) => f.mockReset());
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => vi.unstubAllGlobals());

describe("<Experience /> without the engine", () => {
  beforeEach(() => media({ reducedMotion: true }));

  it("renders the chapters inside main", () => {
    setup();
    expect(screen.getByRole("main")).toHaveTextContent("Feety");
  });

  it("does not boot the engine when reduced motion is requested", async () => {
    setup();
    await new Promise((r) => setTimeout(r, 50));
    expect(create).not.toHaveBeenCalled();
  });

  it("opens the index, makes the page inert, and closes on Escape with focus restored", async () => {
    setup();
    const btn = screen.getByRole("button", { name: /Index/ });
    await userEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("main", { hidden: true })).toHaveAttribute("inert");
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: /Index/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("main")).not.toHaveAttribute("inert");
    expect(btn).toHaveFocus();
  });

  it("scrolls natively to a chapter picked from the index", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /Index/ }));
    await userEvent.click(screen.getByRole("link", { name: "14 Stack" }));
    expect(screen.getByRole("button", { name: /Index/ })).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("stack")!.scrollIntoView).toHaveBeenCalled();
  });

  it("switches the theme right away", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Switch colour theme" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(screen.getByRole("button", { name: "Switch colour theme" })).toHaveTextContent("Light");
  });
});

describe("<Experience /> with the engine", () => {
  beforeEach(() => {
    media();
    create.mockReturnValue(engine);
  });

  it("boots once the page has loaded and hands navigation to it", async () => {
    const { unmount } = setup();
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    expect(create.mock.calls[0][0]).toBeInstanceOf(HTMLElement);

    await userEvent.click(screen.getByRole("button", { name: /Index/ }));
    expect(engine.lock).toHaveBeenLastCalledWith(true);
    await userEvent.click(screen.getByRole("link", { name: "03 Markets" }));
    expect(engine.go).toHaveBeenCalledWith(2);
    expect(engine.lock).toHaveBeenLastCalledWith(false);

    await userEvent.keyboard("{ArrowDown}");
    expect(engine.go).toHaveBeenLastCalledWith(1);

    await userEvent.click(screen.getByRole("link", { name: /NOMENJANAHARY/ }));
    expect(engine.restart).toHaveBeenCalled();

    unmount();
    expect(engine.destroy).toHaveBeenCalled();
  });

  it("plays the theme ripple before repainting the page", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    setup();
    await waitFor(() => expect(create).toHaveBeenCalled());
    await userEvent.click(screen.getByRole("button", { name: "Switch colour theme" }));
    expect(engine.setTheme).toHaveBeenCalledWith(true, expect.anything());
    expect(document.documentElement.dataset.theme).not.toBe("dark");
    vi.advanceTimersByTime(400);
    expect(document.documentElement.dataset.theme).toBe("dark");
    vi.useRealTimers();
  });
});
