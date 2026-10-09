# XINGYU Components

A small, extensible **AI-native document UI toolkit** for React. Models choose which supported components fit their content; applications validate, render and persist the source. **No AI composer, model gateway or agent-specific runtime.**

> Status: **experimental 0.0.x**, not published on npm, not integrated into XINGYU Web. The original XINGYU Web nine `xingyu-block` implementations remain untouched.

## What is included

- A **versioned JSON v1 document contract** with strictly closed props schemas and composition through `stack` / `grid`.
- A **typed component registry** and a serializable **capability manifest** suitable for an MCP resource or tool response, independent of model vendor.
- Seven foundational primitives: `text`, `callout`, `metric`, `stack`, `grid`, `disclosure`, `divider`.
- A safe React renderer, optional scoped CSS, original-source fallback for invalid/unknown content, and zero runtime AI/network/write actions.
- Tests for limits, unknown fields, nesting, component discovery and HTML-safe React output.

## Start locally

Requires Node.js 20+.

```bash
npm install
npm run ci
```

This repository is currently a **development-only package** (`private: true`); no npm publish or external service is performed.

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

The host decides where to store the source. Markdown is still preferred for regular prose; this format can be stored in a fenced block where the host already supports that convention. No site database or Markdown parser changes are included here.

## Extension and safety contract

`createRegistry` accepts explicitly installed, trusted component definitions. Add a render function for each new component in the host's renderer map. **Never** import arbitrary JavaScript, code, HTML or components named by an article; article data may only select already registered types.

Unknown types, unexpected fields, oversized or deeply nested input fail closed and can be displayed as escaped original text. Built-in components render text through React escaping. No links, scripts, DOM injection, storage writes or background requests are triggered by document data.

Style tokens inherit the host's design system; no global CSS reset.

## Relationship to XINGYU Web

The existing website is the first *future* consumer. It continues to own Markdown persistence, Knowledge Space ACL, draft/publication/version contracts, Cloudflare configuration and its nine specialized blocks. Package adoption will be a **separate, reviewed PR**, with exact-schema compatibility and fallback tests.

## Project stage

Roadmap: [docs/roadmap.md](docs/roadmap.md). Contributions: [CONTRIBUTING.md](CONTRIBUTING.md).

**License:** Not selected yet. Public GitHub visibility alone does not grant an open-source license. Choose an explicit license before accepting external code contributions or publishing to npm.
