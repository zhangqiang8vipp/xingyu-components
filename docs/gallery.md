# Component Gallery: real-renderer atlas

The gallery is a static HTML site built from the **same installed React `DocumentRenderer` and `createCapabilityManifest`** as `@xingyu/components`. It is not a separate UI simulation and does not call an AI provider.

## Local review

Requires Node.js 20+.

```bash
npm install
npm run gallery:build
npm run gallery:preview
# Visit http://127.0.0.1:4173/
```

Features:
- 19 documented components, **one real SSR preview per registered component**, sorted in registry order
- Category filtering, search, source JSON panels and copy buttons
- Desktop view and 360px **real iframe** mobile view, so CSS media queries actually run against the iframe viewport
- Light/dark theme control, propagated to all same-origin preview frames
- Downloadable `capabilities.json` generated from the same strict input schema as parsing
- A static zipped/downloadable Actions artifact even when the repository has not yet enabled Pages
- Built without external fonts, CDN, third-party analytics, remote data fetches or site-specific backend dependencies

All numbers and examples in `gallery/fixtures.mjs` are explicitly illustrative. They are not verified user analytics.

## Enabling the public preview

The repository was public but `has_pages` was false during initial development. GitHub's native Pages flow requires a one-time owner setting. The committed workflow **never changes Pages settings or deploys with extra credentials**.

1. Open [repository Pages settings](https://github.com/zhangqiang8vipp/xingyu-components/settings/pages).
2. Choose **Build and deployment → Source → GitHub Actions**.
3. From [GitHub Actions](https://github.com/zhangqiang8vipp/xingyu-components/actions), run **Component Gallery (GitHub Pages)** with **Run workflow** on main, or push a relevant gallery/component commit.
4. Wait for the green `deploy` job, then confirm the reported deployment URL, typically `https://zhangqiang8vipp.github.io/xingyu-components/`.

**Do not advertise that URL as live until the deploy job actually succeeds.** If Pages is not enabled, the workflow builds and uploads a `xingyu-components-gallery` downloadable preview artifact and finishes without a failing deployment job.

The repository already hosts the build/test code. This procedure never deploys the separate XINGYU blog/Knowledge Space app.

## Architecture and security

The generator, `gallery/build.mjs`, fails when the registered schema types do not exactly match fixture types, or any fixture fails `parseDocument`. The source is passed to `DocumentRenderer`, rendered server-side through React escaping, and written to `gallery-dist/preview/<type>.html`. The atlas loads these from same-origin, script-disabled iframes.

The parent site's small, trusted `gallery/gallery.js` controls only filtering, theme/viewport toggles and user-initiated clipboard copying. It has no network calls or persistent state. Example data cannot supply JS, HTML event handlers, CSS or external scripts; this remains the component library's read-only contract.

Compiled component CSS is copied unchanged from `src/styles.css`. Gallery layout CSS is separate and is **not shipped by the npm package**. All assets use relative URLs so the site works under the `/xingyu-components/` GitHub Pages project path.

## Acceptance checklist

- `npm run ci` builds the site then checks all 19 schemas, SSR render fidelity, escaped JSON, theme/device controls, local asset paths, and the downloadable manifest.
- Manually open a desktop width around 1280px and 360px iframe mode. Inspect the table/chart horizontal scroll, progress labels, focus states and disclosure controls.
- Toggle light/dark while frames are loaded, then filter/search; keyboard-focus the search, code disclosure and copy button.
- Real browser mobile/a11y visual smoke is separate from automated source tests and must not be claimed as fully complete until performed.
