import { advancedRenderers } from "./advanced.js";
import { extendedRenderers } from "./extended.js";
import { patternRenderers } from "./patterns.js";
import { createElement, Fragment } from "react";
import type { ReactNode } from "react";
import { defaultRegistry, parseDocument } from "../core/index.js";
import type { ComponentRegistry, DocumentBlock } from "../core/index.js";

export type BlockRenderer = (props: Readonly<Record<string, unknown>>, children: readonly ReactNode[]) => ReactNode;
export type RendererMap = Readonly<Record<string, BlockRenderer>>;

export const builtInRenderers: RendererMap = {
  callout: (props) => createElement("aside", {
    className: "xyc-callout xyc-tone-" + String(props.tone),
    role: props.tone === "warning" ? "note" : undefined,
  },
    createElement("strong", { className: "xyc-callout-title" }, String(props.title)),
    createElement("p", null, String(props.body)),
  ),
  metric: (props) => createElement("div", { className: "xyc-metric" },
    createElement("span", { className: "xyc-metric-label" }, String(props.label)),
    createElement("strong", { className: "xyc-metric-value" }, String(props.value)),
    typeof props.note === "string" ? createElement("small", null, props.note) : null,
  ),
  stack: (props, children) => createElement("div", {
    className: "xyc-stack xyc-gap-" + String(props.gap ?? "md"),
  }, ...children),
  grid: (props, children) => createElement("div", {
    className: "xyc-grid xyc-columns-" + String(props.columns),
  }, ...children),
  ...extendedRenderers,
  ...advancedRenderers,
  ...patternRenderers,
};

export interface DocumentRendererProps {
  /** The unchanged JSON source; never evaluated as JavaScript. */
  source: string;
  /** Only code installed by the host may register additional definitions. */
  registry?: ComponentRegistry;
  /** Only code installed by the host may supply a renderer; document JSON cannot do so. */
  renderers?: RendererMap;
  className?: string;
}

function renderBlock(block: DocumentBlock, renderers: RendererMap, path: string): ReactNode {
  const children = block.children?.map((child, i) => renderBlock(child, renderers, path + "-" + i)) ?? [];
  const renderer = Object.hasOwn(renderers, block.type) ? renderers[block.type] : undefined;
  if (typeof renderer !== "function") {
    return createElement("pre", { key: path, className: "xyc-unavailable" },
      createElement("code", null, JSON.stringify(block, null, 2)));
  }
  return createElement(Fragment, { key: path }, renderer(block.props, children));
}

/**
 * A renderer, not an AI compositor. Invalid or unknown source displays as escaped plain text.
 * React escapes authored strings; no dangerouslySetInnerHTML, eval, fetching or content mutations.
 */
export function DocumentRenderer({
  source, registry = defaultRegistry, renderers, className,
}: DocumentRendererProps) {
  const parsed = parseDocument(source, registry);
  if (!parsed.ok) {
    return createElement("pre", { className: "xyc-document xyc-fallback" + (className ? " " + className : "") },
      createElement("code", null, source));
  }
  const safeRenderers = { ...builtInRenderers, ...renderers };
  return createElement("section", {
    className: "xyc-document" + (className ? " " + className : ""),
    "aria-label": "Structured document content",
  }, parsed.document.blocks.map((block, index) => renderBlock(block, safeRenderers, String(index))));
}
