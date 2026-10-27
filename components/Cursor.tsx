"use client";

import { useEffect, useRef } from "react";

// The dot is drawn at its largest size and scaled down, so it stays crisp when it grows over links.
const REST_SCALE = 0.24;

export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(pointer: fine)").matches) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");
    const instant = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const s = { x: innerWidth / 2, y: innerHeight / 2, tx: innerWidth / 2, ty: innerHeight / 2, k: 1, tk: 1, o: 0, to: 0 };
    let raf = 0;

    const tick = () => {
      const f = instant ? 1 : 0.2;
      s.x += (s.tx - s.x) * f;
      s.y += (s.ty - s.y) * f;
      s.k += (s.tk - s.k) * (instant ? 1 : 0.14);
      s.o += (s.to - s.o) * 0.2;
      el.style.transform = `translate3d(${s.x.toFixed(1)}px,${s.y.toFixed(1)}px,0) scale(${(s.k * REST_SCALE).toFixed(4)})`;
      el.style.opacity = s.o.toFixed(3);
      const settled =
        Math.abs(s.tx - s.x) < 0.1 && Math.abs(s.ty - s.y) < 0.1 && Math.abs(s.tk - s.k) < 1e-3 && Math.abs(s.to - s.o) < 1e-3;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      s.tx = e.clientX;
      s.ty = e.clientY;
      s.to = 1;
      const t = e.target instanceof Element ? e.target : null;
      s.tk = t?.closest("a,button,[data-go]") ? 4.2 : t?.closest("[data-title]") ? 2.4 : 1;
      if (instant) {
        s.x = s.tx;
        s.y = s.ty;
      }
      wake();
    };
    const onDown = () => {
      s.tk *= 0.75;
      wake();
    };
    const onLeave = () => {
      s.to = 0;
      wake();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    html.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      html.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <div ref={ref} className="cursor" aria-hidden="true" />;
}
