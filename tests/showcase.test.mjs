import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createCapabilityManifest, parseDocument } from "../dist/core/index.js";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { DocumentRenderer } from "../dist/react/index.js";

test("the copyable composition showcase follows the same v1 contract as MCP", () => {
  const source = readFileSync(new URL("../examples/showcase.json", import.meta.url), "utf8");
  const parsed = parseDocument(source);
  assert.equal(parsed.ok, true, "document showcase must pass the shipped validator");
  if (!parsed.ok) return;
  const discovered = new Set();
  const visit = (block) => {
    discovered.add(block.type);
    for (const child of block.children ?? []) visit(child);
  };
  for (const block of parsed.document.blocks) visit(block);
  const additions = [
    "heading", "quote", "badge", "bullet_list", "numbered_list", "key_value",
    "table", "progress", "timeline", "steps", "comparison", "bar_chart",
  ];
  for (const name of additions) {
    assert.ok(discovered.has(name), "showcase missing " + name);
    assert.ok(createCapabilityManifest().components.some((entry) => entry.type === name));
  }
  const html = renderToStaticMarkup(createElement(DocumentRenderer, { source }));
  assert.match(html, /xyc-grid/);
  assert.match(html, /xyc-chart/);
  assert.match(html, /<progress/);
  assert.ok(!html.includes("<script"));
});
