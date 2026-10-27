const hasIdle = () => typeof window.requestIdleCallback === "function";

export const requestIdle = (cb: () => void, timeout = 500): number =>
  hasIdle() ? requestIdleCallback(cb, { timeout }) : window.setTimeout(cb, 120);

export const cancelIdle = (id: number) => (hasIdle() ? cancelIdleCallback(id) : clearTimeout(id));
