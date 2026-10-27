# Odilon D’Alex Nomenjanahary — Portfolio

Next.js (App Router) + React 19. One page, sixteen chapters, statically prerendered.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # Vitest + Testing Library
npm run typecheck
npm run build && npm start
```

## How it is put together

- `content/site.ts` — all copy, typed. Edit text here.
- `components/Chapters.tsx` — server-rendered chapter markup; the page is complete without JavaScript.
- `components/Experience.tsx` — client shell: header, index menu, HUD, theme, keyboard; boots the engine after `load`, on idle, as a separate chunk.
- `lib/engine/` — imperative WebGL layer kept outside React (no re-render per frame):
  - `choreography.ts` pure scroll maths (unit tested),
  - `engine.ts` pins chapters as stages, drives Lenis, the HUD and the scene,
  - `fluid.ts`, `titles.ts`, `shaders.ts`.
- `lib/config.ts` — scene and scroll tunables.

## Performance

- Titles are rendered at up to 2× device pixel ratio for sharp type; a frame-time governor lowers the render scale on slower GPUs.
- At rest the scene drops to 30 fps; per-frame style writes are cached; only the chapters in view are visible and composited.
- Title textures are kept for neighbouring chapters only and the next one is prepared while the browser is idle.
- `prefers-reduced-motion` or missing WebGL keep the plain, fully readable HTML page.
