# Architecture and extension protocol

## Boundaries

```text
Any trusted AI agent -> MCP capability manifest (plain JSON)
                    -> authored JSON inside host document
                    -> host permission/persistence controls
                    -> parseDocument(registry)
                    -> DocumentRenderer + approved host renderers
```

There is **no server-side AI orchestration**, document-provided JS, tool execution, remote source fetching or hidden write action in this package. The host owns ACL, Markdown, database, trusted content sources and publication flows.

## Document protocol v1

```ts
type Document = {
  version: 1;
  blocks: Array<{
    type: string;
    version: 1;
    props: Record<string, unknown>;
    children?: Block[];
  }>;
};
```

Only `stack` and `grid` accept `children`. All other built-ins reject a `children` key, even when empty. Schema fields support bounded `array` values and nested `object` structures. A `table` schema advertises `arrayLengthsMatch` (rows must match columns); a `pie_chart` schema advertises `positiveSumField` (at least one finite positive slice); a `sources` schema uses `https-url` to reject credentials, non-HTTPS schemes, whitespace, hostless/localhost/IP links and nonstandard ports. Parsers require exact keys and validated field types; numbers must be finite, within explicit bounds. Input is bounded to 120,000 UTF-16 characters, 128 total blocks and depth 8; composition containers may hold at most 16 children.

Schema for every component is the **single source of truth** for both runtime input validation and the agent-facing capability manifest. Adding an unknown type cannot implicitly install a renderer. Only explicitly author-approved HTTPS source links can navigate after user clicks; they are not fetched or verified by the renderer.

## Adding a trusted component

1. Define a `ComponentDefinition` with a unique `type`, `version: 1`, closed `propsSchema`, explanatory metadata and child policy.
2. Register it only in trusted code with `createRegistry([...builtInDefinitions, customDefinition])`.
3. Supply a React function through `DocumentRenderer renderers={{ customType: (props) => ... }}`. Never eval/compile code from the document.
4. Ensure its own CSS remains scoped under `.xyc-document`, works in narrow layouts, and inherits host colors.
5. Test invalid keys, bounds, nesting, plain-text rendering, XSS fallback, manifest entry and accessibility.
6. Keep prior `type`/version documents readable. A future incompatible protocol version needs an explicit parser upgrade, not silent reinterpretation.

Illustration (application-owned code):

```tsx
import { createElement } from "react";
import { builtInDefinitions, createRegistry } from "@xingyu/components/core";
import { DocumentRenderer } from "@xingyu/components/react";

const quote = {
  type: "custom_quote", version: 1, label: "引用", category: "content",
  description: "A short plain-text quotation.",
  propsSchema: {
    type: "object",
    properties: { text: { type: "string", minLength: 1, maxLength: 400 } },
    required: ["text"],
    additionalProperties: false,
  },
  children: "none",
} as const;

const registry = createRegistry([...builtInDefinitions, quote]);

export function Reader({ source }: { source: string }) {
  return <DocumentRenderer
    source={source}
    registry={registry}
    renderers={{
      quote: (props) => createElement("blockquote", null, String(props.text)),
    }}
  />;
}
```

## MCP integration

`createMcpCapabilityText(registry)` serializes a versioned JSON capability manifest. An application can expose that string as a read-only MCP resource or the output of an existing metadata tool. This package deliberately does not create its own MCP server, authorize write tools or choose a model/provider.

## Planned extraction / adoption from XINGYU Web

The existing website remains unchanged. **The library's sole maintained document format is `xingyu-document` v1.** Do not build adapters for unused historical formats without a real consumer. A future XINGYU Web integration should be a separate PR using the new protocol with complete ACL, Markdown/persistence and mobile acceptance tests.
