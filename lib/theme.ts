import { THEME_KEY } from "./config";

/** Runs in <head> before first paint so the stored or system theme never flashes. */
export const themeScript = `try{var t=localStorage.getItem("${THEME_KEY}");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=d?"dark":"light"}catch(e){}`;

export function applyTheme(dark: boolean) {
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

/**
 * The selected theme, for useSyncExternalStore. It changes before the DOM does:
 * while WebGL plays the theme ripple, applyTheme runs a little later.
 */
export function createThemeStore() {
  let dark: boolean | null = null;
  const listeners = new Set<() => void>();
  return {
    get() {
      dark ??= document.documentElement.dataset.theme === "dark";
      return dark;
    },
    getServer: () => false,
    set(next: boolean) {
      dark = next;
      try {
        localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      } catch {}
      listeners.forEach((l) => l());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const themeStore = createThemeStore();
