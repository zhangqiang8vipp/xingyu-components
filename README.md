# XINGYU Components

An experimental **AI-native visual component library** for React. Agents choose from a validated, trusted capability manifest; the host owns regular Markdown and persistence. **This package neither parses nor replaces Markdown.**

> Status: private development package (`0.0.x`), not on npm and not integrated into XINGYU Web.

## Markdown first: 26 distinct visual components

Ordinary paragraphs, headings, blockquotes, ordered and unordered/nested lists, task lists, code fences, horizontal rules, links, reference lists and Markdown tables belong to the **host's existing Markdown renderer**. They are deliberately *not* reimplemented as JSON components.

The 26 retained components provide visual expression beyond ordinary Markdown:

| Kind | Components |
| --- | --- |
| Layout (3) | `stack`, `grid`, `panel` |
| Content / emphasis (7) | `callout`, `badge`, `tip`, `hero`, `link_cards`, `glossary`, `tag_list` |
| Data visualization (15) | `metric`, `metric_transition`, `progress`, `timeline`, `bar_chart`, `status_list`, `line_chart`, `pie_chart`, `pros_cons`, `stacked_bar_chart`, `scatter_chart`, `heatmap`, `rating_group`, `agenda`, `kanban_board` |
| Local interaction (1) | `accordion` |

The experimental 40-component branch was first reduced to 24 by removing 16 Markdown-equivalent or redundant types. Two later components, `tip` and `metric_transition`, add distinct visual behavior rather than reproducing Markdown. See [Markdown boundary and removed types](docs/markdown-boundary.md).

## Small visual patterns

- `tip`: one schema with `variant: "pill" | "inline" | "note"`, author-supplied `tone`, short text and optional detail. The library does **not** verify the indicated status.
- `metric_transition`: a compact comparison of two nonnegative integer values plus a **derived absolute difference**. The labels and numbers must be factual; no separate or potentially inconsistent `delta` property is accepted.
- Both render as read-only document blocks; `tip` looks visually inline but does not rewrite or embed itself inside an existing Markdown paragraph.

## Implementation and trust boundaries

- A versioned `xingyu-document/v1` JSON contract with bounded nested schemas, a typed trusted registry, and composite children in `stack`, `grid` and `panel`.
- A serializable MCP capability manifest produced from the **same schemas** as parsing; model/vendor independent.
- React SSR output, scoped optional CSS, safely escaped values, and source-preserving fallback for invalid or unknown blocks.
- Author-supplied HTTPS-only `link_cards` navigate only when a reader explicitly clicks; external claims are not verified.
- Static visualizations with labels and original-data tables, never hidden network fetches or fabricated values.
- No AI compositor, agent SDK, Markdown parser, arbitrary executable document code, remote HTML, storage or ACL.

## Development and live gallery

Requires Node.js 20+.

```bash
npm install
npm run ci
npm run gallery:preview
# http://127.0.0.1:4173/
```

The [XINGYU Components gallery](https://zhangqiang8vipp.github.io/xingyu-components/) shows **real React-rendered previews** with search, category filtering, light/dark themes, 360px phone frame, copyable JSON and downloadable capability manifest. Examples contain clearly labeled demonstration data. A successful GitHub Pages Actions deployment is required before assuming the latest branch is live. See [gallery guide](docs/gallery.md).

## Host integration

```tsx
import { DocumentRenderer } from "@xingyu/components/react";
import { createMcpCapabilityText } from "@xingyu/components/core";
import "@xingyu/components/styles.css";

const capabilities = createMcpCapabilityText();
// Expose as a read-only MCP resource/tool output to any supported agent.
// Ordinary prose remains with the host's Markdown renderer.

export function Example({ savedJsonSource }: { savedJsonSource: string }) {
  return <DocumentRenderer source={savedJsonSource} />;
}
```

Example of a **visual-only** document:

```json
{
  "version": 1,
  "blocks": [
    { "type": "hero", "version": 1, "props": { "title": "Overview", "summary": "Author-provided context." } },
    { "type": "grid", "version": 1, "props": { "columns": 2 }, "children": [
      { "type": "metric", "version": 1, "props": { "label": "Example", "value": "42" } },
      { "type": "callout", "version": 1, "props": { "title": "Note", "body": "Factual source data only.", "tone": "info" } }
    ] }
  ]
}
```

See [copyable showcase](examples/showcase.json) and [trusted extension guide](docs/architecture.md). Hosts may embed visual JSON alongside Markdown, but the host decides persistence and parsing conventions. This package neither defines a new Markdown syntax nor auto-converts prose to JSON.

## Future contributions

Only trusted host code may register new schemas and React renderers. Authored data cannot supply JSX/HTML, scripts, executable handlers, styles or network operations. Before adding any component, first check whether host Markdown or **composition of existing components** already does the job.

XINGYU Web is unchanged. It continues to own Markdown, ACL, knowledge-space permissions, versions, drafts and publication. Adoption requires a separate reviewed integration.

[Roadmap](docs/roadmap.md) · [Contributing](CONTRIBUTING.md)

**License:** not yet selected. Public visibility alone is not a source license.
