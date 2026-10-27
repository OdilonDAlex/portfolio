import { afterEach, describe, expect, it, vi } from "vitest";
import { THEME_KEY } from "./config";
import { applyTheme, createThemeStore, themeScript } from "./theme";

const setColorScheme = (dark: boolean) =>
  vi.stubGlobal("matchMedia", (q: string) => ({ matches: dark && q.includes("dark") }));

afterEach(() => vi.unstubAllGlobals());

describe("createThemeStore", () => {
  it("reads the theme set on <html> before hydration", () => {
    document.documentElement.dataset.theme = "dark";
    expect(createThemeStore().get()).toBe(true);
  });

  it("defaults to light on the server snapshot", () => {
    document.documentElement.dataset.theme = "dark";
    expect(createThemeStore().getServer()).toBe(false);
  });

  it("persists and notifies subscribers on set", () => {
    const store = createThemeStore();
    const listener = vi.fn();
    const off = store.subscribe(listener);
    store.set(true);
    expect(store.get()).toBe(true);
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
    expect(listener).toHaveBeenCalledTimes(1);
    off();
    store.set(false);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
  });
});

describe("applyTheme", () => {
  it("writes the theme on <html>", () => {
    applyTheme(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
    applyTheme(false);
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});

describe("themeScript", () => {
  const run = () => new Function(themeScript)();

  it("prefers the stored choice", () => {
    setColorScheme(true);
    localStorage.setItem(THEME_KEY, "light");
    run();
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("falls back to the system preference", () => {
    setColorScheme(true);
    run();
    expect(document.documentElement.dataset.theme).toBe("dark");
    setColorScheme(false);
    run();
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});
