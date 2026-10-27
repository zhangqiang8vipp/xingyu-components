# XingYu Typora adapter (experimental)

This optional integration reuses [obgnail/typora_plugin](https://github.com/obgnail/typora_plugin). It registers the `xingyu` fenced JSON language through `thirdPartyDiagramParser` and mounts the EXISTING XingYu React `DocumentRenderer`. It does not parse Markdown, replace Typora, change the stored Markdown source, or fork the upstream framework.

## Build

From the repository root, with Node 20+:

```sh
npm install --no-audit --no-fund
npm run build
npm install --no-audit --no-fund --prefix integrations/typora
npm run test --prefix integrations/typora
npm run build --prefix integrations/typora
```

The result is `integrations/typora/dist/xingyu.js` plus `THIRD_PARTY_NOTICES.txt`. The CommonJS bundle includes React, ReactDOM, the existing renderer, schema validation and component CSS; it does not fetch executable code at runtime.

## Use

1. On Windows/Linux, install the **third-party** `obgnail/typora_plugin` framework and confirm it works with your Typora version. The upstream installer injects code into Typora's app resources; back up your installation first. macOS is not supported upstream.
2. Copy the built `dist/xingyu.js` to the existing `<Typora resources>/plugin/xingyu.js`. Preserve its third-party notices when distributing.
3. In `plugin/global/settings/settings.user.toml` (or the supported persistent override file), configure:

```toml
[xingyu]
NAME = "XingYu Components"
ENABLE = true
```

4. Restart Typora and open [examples/metric.md](examples/metric.md). The demo metric should render and update after changing its JSON. Incorrect JSON should display the original source safely.
5. To disable, set `ENABLE = false` and restart.

## Scope and verification

The shared strict JSON schema remains the only source of truth; article content cannot supply JS, JSX, HTML, custom renderers, or fetches. The adapter does not add a Markdown parser or any database/write features.

The automated tests verify the code-fence configuration and React-root lifecycle adapter, but **not a running Typora installation**. Manual Windows/Linux compatibility tests are still needed. PDF/HTML export, typing focus, very large files and every one of the 26 component types are **not yet certified**. The adapter targets Chrome 84; older Typora/Electron builds may require upstream polyfills. Neither the component library nor its Typora adapter is published to npm.

This repository has not selected a public license for XingYu Components. This integration does not copy code from the MIT-licensed `typora_plugin` framework.
