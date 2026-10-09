# XINGYU Components

A small, extensible **AI-native document UI toolkit** for React. Models choose which supported components fit their content; applications validate, render and persist the source. **No AI composer, model gateway or agent-specific runtime.**

> Status: **experimental 0.0.x**, not published on npm, not integrated into XINGYU Web. The original XINGYU Web nine `xingyu-block` implementations remain untouched.

## What is included

- A **versioned JSON v1 document contract** with strictly closed props schemas and composition through `stack` / `grid`.
- Strict bounded **arrays, nested object fields and advertised table row/column consistency**, plus a **typed component registry** and a serializable **capability manifest** suitable for an MCP resource or tool response, independent of model vendor.
- 19 foundational and general components: the original seven plus `heading`, `quote`, `badge`, `bullet_list`, `numbered_list`, `key_value`, `table`, `progress`, `timeline`, `steps`, `comparison`, `bar_chart`.
- A safe React renderer, optional scoped CSS, original-source fallback for invalid/unknown content, and zero runtime AI/network/write actions.
- Tests for limits, unknown fields, bounded arrays, relational table constraints, nesting, capability discovery and HTML-safe React output.

## Start locally

Requires Node.js 20+.

```bash
npm install
npm run ci
```

This repository is currently a **development-only package** (`private: true`); no npm publish or external service is performed.

## 可视化组件图鉴 (Gallery)

This repository includes a **real-renderer component atlas** for all 19 registered components. It is generated from the same `DocumentRenderer` and `createCapabilityManifest()` as the library. Each example is validated first and rendered to static HTML, not hand-drawn as a mock. A separate same-origin iframe provides a **real 360px mobile viewport** and dark theme synchronization.

```bash
npm install
npm run gallery:build
npm run gallery:preview
# Open http://127.0.0.1:4173/
```

The atlas provides searchable, category-filterable examples, light/dark and desktop/phone views, copyable v1 JSON and a downloadable `capabilities.json`. It uses no external scripts, CDN, analytics, live user data or AI API calls. All included statistics are explicitly **示例数据**.

**Online preview:** This public repository does not yet have GitHub Pages enabled. A GitHub Actions workflow builds the gallery and uploads a downloadable preview artifact. When the owner opens **Settings → Pages → Build and deployment → Source: GitHub Actions**, the workflow can publish the site at `https://zhangqiang8vipp.github.io/xingyu-components/` after a new `workflow_dispatch` run. Do not assume this URL is live until deployment has succeeded.

More details: [docs/gallery.md](docs/gallery.md).

## Host application usage

```tsx
import { DocumentRenderer } from "@xingyu/components/react";
import { createMcpCapabilityText } from "@xingyu/components/core";
import "@xingyu/components/styles.css";

const capabilityResource = createMcpCapabilityText();
// Expose capabilityResource as read-only MCP resource/tool content.
// GPT, Claude, Gemini, etc. decide which approved type to write.

export function Example() {
  return <DocumentRenderer source={savedJsonSource} />;
}
```

For local development inside this repository, import the compiled `dist/` output after running `npm run build`. See [the example](examples/document.json) and [extension guide](docs/architecture.md).

## Data format

```json
{
  "version": 1,
  "blocks": [
    { "type": "text", "version": 1, "props": { "text": "A short paragraph." } },
    { "type": "grid", "version": 1, "props": { "columns": 2 }, "children": [
      { "type": "metric", "version": 1, "props": { "label": "Example", "value": "42" } },
      { "type": "callout", "version": 1, "props": { "title": "Note", "body": "Factual data only.", "tone": "info" } }
    ] }
  ]
}
```

The host decides where to store the source. Structured components do not replace Markdown prose; this format can be stored in a fenced block where the host already supports that convention. No site database or Markdown parser changes are included here.

## New composition showcase

See [`examples/showcase.json`](examples/showcase.json) for a copyable document containing the 12 additional component types. This is a static example, not a production article or verified external data source.

## Extension and safety contract

`createRegistry` accepts explicitly installed, trusted component definitions. Add a render function for each new component in the host's renderer map. **Never** import arbitrary JavaScript, code, HTML or components named by an article; article data may only select already registered types.

Unknown types, unexpected fields, oversized or deeply nested input fail closed and can be displayed as escaped original text. Built-in components render text through React escaping. No links, scripts, DOM injection, storage writes or background requests are triggered by document data.

Style tokens inherit the host's design system; no global CSS reset.

## Relationship to XINGYU Web

XINGYU Web may become a future consumer, but **no website or historical component migration is planned in this stage**. Only the new, unified `xingyu-document` v1 format is developed here. The website continues to own Markdown persistence, Knowledge Space ACL, draft/publication/version contracts and Cloudflare configuration. Any future adoption is a **separate, reviewed PR** with explicit end-to-end test coverage.

## Project stage

Roadmap: [docs/roadmap.md](docs/roadmap.md). Contributions: [CONTRIBUTING.md](CONTRIBUTING.md).

**License:** Not selected yet. Public GitHub visibility alone does not grant an open-source license. Choose an explicit license before accepting external code contributions or publishing to npm.
