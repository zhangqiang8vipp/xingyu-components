# XINGYU A2UI protocol pilot (isolated)

A **real official-renderer proof of concept**, not a refactor of `@xingyu/components`.

- Protocol target: A2UI v0.9.1 production specification; test the package's actual compatibility in CI.
- npm packages (pinned to 0.12.0): `@a2ui/react` + `@a2ui/web_core`.
- Runtime: official `MessageProcessor([basicCatalog])` -> official React `A2uiSurface`.
- Scenarios: short status, numeric transition, and warning note. All composed from **the same five basic components**: `Text`, `Icon`, `Row`, `Column`, `Card`.
- Security: experiment-only read-only envelope whitelist, explicit catalog ID, bounded adjacency graph, no actions, remote links, image/video, custom SVG, author HTML, markdown parsing, arbitrary component registration, or model/network calls.
- Lifecycle: isolated Vite app; not part of the published library, main gallery, Typora or XINGYU Web.
- Content examples are fabricated for visual testing only. No real account or health data.

## Run

Requires Node.js 22+:

```bash
cd experiments/a2ui
npm install --no-audit --no-fund
npm run check
npm run dev
# open http://127.0.0.1:5173/
```

The demo source is in `src/presets.ts`. The trusted boundary is `src/guard.ts`. The host-owned buttons switch among three fixed A2UI surfaces; **UI data itself cannot define an action**. Use browser visual verification separately from the build/type/unit tests.

## Evaluation boundaries

The basic catalog is **not a generic visual design language**: it includes layout/text/icon/card but **not** `Badge`, `Chart`, an accessible read-only progress bar, or a custom tone-pill. These require trusted host presets, theme styling, or specialized extensions. A2UI standardizes transmission and composition, not the visual fidelity of every existing XINGYU widget.

The upstream React quick start documents `v0.9` transport. This pilot tests `v0.9.1` explicitly; if the pinned official SDK rejects that identifier, the experiment must report the mismatch rather than silently invent a converter or claim acceptance.

Do not expose this read-only gate as a full A2UI validator: it intentionally rejects most standard A2UI messages, including `deleteSurface`, actions, incremental update streams, images, inputs and function calls. Before real agent use, develop a standard-conformant trust boundary, catalog approval, lifecycle rules, SSR/client hydration and tenancy review. The experiment must not rewrite existing persisted JSON.
