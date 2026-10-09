import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  builtInDefinitions, createRegistry, parseDocument, createCapabilityManifest,
  createMcpCapabilityText,
} from "../dist/core/index.js";
import { DocumentRenderer } from "../dist/react/index.js";

const asBlock = (type, props) => ({ type, version: 1, props });
const documentSource = (blocks) => JSON.stringify({ version: 1, blocks });
const valid = [
  asBlock("heading", { text: "Learning notes", level: 2 }),
  asBlock("quote", { text: "Practice beats memorization.", attribution: "Sample" }),
  asBlock("badge", { label: "In review", tone: "info" }),
  asBlock("bullet_list", { items: ["Read", "Write", "Test"] }),
  asBlock("numbered_list", { items: ["First", "Second"] }),
  asBlock("key_value", { title: "Facts", items: [
    { label: "Author", value: "Example" }, { label: "Count", value: "2" },
  ] }),
  asBlock("table", { title: "Metrics", columns: ["Item", "Value"], rows: [
    { cells: ["A", "12"] }, { cells: ["B", "14"] },
  ] }),
  asBlock("progress", { label: "Coverage", value: 85.5, note: "Reported input" }),
  asBlock("timeline", { title: "Plan", items: [
    { label: "Phase 1", title: "Design" }, { label: "Phase 2", title: "Ship", detail: "After review" },
  ] }),
  asBlock("steps", { title: "Setup", items: [
    { title: "Install", body: "Install dependencies.", code: "npm install" },
  ] }),
  asBlock("comparison", { title: "Options", left: "A", right: "B", rows: [
    { dimension: "Approach", left: "Simple", right: "Complex" },
  ] }),
  asBlock("bar_chart", { title: "Actual scores", unit: "pts", items: [
    { label: "Entry A", value: 12.5 }, { label: "Entry B", value: 9 },
  ] }),
];

test("all twelve new primitives are discoverable and schema-checked", () => {
  assert.equal(builtInDefinitions.length, 30);
  const list = createCapabilityManifest().components;
  assert.equal(new Set(list.map(({ type }) => type)).size, 30);
  for (const block of valid) {
    const match = list.find(({ type }) => type === block.type);
    assert.ok(match, block.type + " must be described in agent manifest");
    assert.equal(match.version, 1);
    assert.equal(parseDocument(documentSource([block])).ok, true, block.type);
  }
  const manifest = JSON.parse(createMcpCapabilityText());
  const tableSchema = manifest.components.find((c) => c.type === "table").propsSchema;
  assert.equal(tableSchema.properties.rows.type, "array");
  assert.deepEqual(tableSchema.arrayLengthsMatch, [{
    collection: "rows", nestedField: "cells", comparison: "columns",
  }], "cross-array constraint must be advertised in the manifest");
});

test("a full composition tree renders all new primitives without event handlers", () => {
  const blocks = [{ type: "stack", version: 1, props: { gap: "md" }, children: [
    valid[0], { type: "grid", version: 1, props: { columns: 2 }, children: [
      valid[2], valid[7], valid[11],
    ] }, ...valid.slice(1, 7), ...valid.slice(8, 11),
  ] }];
  const source = documentSource(blocks);
  const parsed = parseDocument(source);
  assert.equal(parsed.ok, true);
  const html = renderToStaticMarkup(createElement(DocumentRenderer, { source }));
  assert.match(html, /<h2/);
  assert.match(html, /<blockquote/);
  assert.match(html, /<ul/);
  assert.match(html, /<ol/);
  assert.match(html, /<table/);
  assert.match(html, /<progress/);
  assert.match(html, /<svg/);
  assert.match(html, /<details/);
  assert.ok(html.includes('aria-label='));
  assert.ok(!html.includes('onClick='));
  assert.ok(!html.includes('dangerouslySetInnerHTML'));
});

test("array bounds, item fields and table column relations reject invalid input", () => {
  const invalid = [
    asBlock("bullet_list", { items: [] }),
    asBlock("bullet_list", { items: Array.from({ length: 31 }, () => "item") }),
    asBlock("numbered_list", { items: ["One", 2] }),
    asBlock("table", { columns: ["A", "B"], rows: [{ cells: ["only one"] }] }),
    asBlock("table", { columns: ["A", "B"], rows: [{ cells: ["1", "2", "3"] }] }),
    asBlock("table", { columns: ["A", "B"], rows: [{ cells: ["1", "<ok>"], extra: 1 }] }),
    asBlock("table", { columns: ["A", "B"], rows: [{ cells: ["1", "2"] }], evil: "script" }),
    asBlock("progress", { label: "bad", value: -0.1 }),
    asBlock("progress", { label: "bad", value: 100.1 }),
    asBlock("heading", { text: "bad", level: 1 }),
    asBlock("badge", { label: "bad", tone: "script" }),
    asBlock("timeline", { items: [{ label: "today", title: "Valid", url: "https://example.com" }] }),
    asBlock("steps", { items: [{ title: "One", body: "Two", html: "<img>" }] }),
    asBlock("bar_chart", { title: "bad", items: [{ label: "A", value: 5 }] }),
    asBlock("bar_chart", { title: "bad", items: [{ label: "A", value: -3 }, { label: "B", value: 2 }] }),
    asBlock("bar_chart", { title: "bad", items: [{ label: "A", value: null }, { label: "B", value: 2 }] }),
  ];
  for (const block of invalid) {
    const raw = documentSource([block]);
    const result = parseDocument(raw);
    assert.equal(result.ok, false, block.type + ": " + raw);
    if (!result.ok) assert.equal(result.source, raw);
  }
});

test("the safe renderer escapes malicious-looking table, quote and chart strings", () => {
  const attack = '<img src=x onerror="alert(1)"><script>alert(1)</script>';
  const blocks = [
    asBlock("quote", { text: attack }),
    asBlock("table", { columns: ["Name", "Data"], rows: [{ cells: [attack, "ok"] }] }),
    asBlock("bar_chart", { title: "Example", items: [
      { label: attack, value: 3 }, { label: "safe", value: 1 },
    ] }),
    asBlock("steps", { items: [{ title: "Command", body: "Text only", code: attack }] }),
  ];
  const html = renderToStaticMarkup(createElement(DocumentRenderer, { source: documentSource(blocks) }));
  assert.ok(html.includes("&lt;img"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("<img src=x"));
  assert.match(html, /<pre><code>/);
  assert.match(html, /查看原始数据/);
});

test("inherited renderer names do not execute Object.prototype methods", () => {
  const custom = {
    type: "constructor", version: 1, category: "content", label: "Untrusted slot",
    description: "No installed renderer", children: "none",
    propsSchema: {
      type: "object", properties: { text: { type: "string", minLength: 1, maxLength: 80 } },
      required: ["text"], additionalProperties: false,
    },
  };
  const registry = createRegistry([...builtInDefinitions, custom]);
  const raw = documentSource([asBlock("constructor", { text: "<svg>" })]);
  assert.equal(parseDocument(raw, registry).ok, true);
  const html = renderToStaticMarkup(createElement(DocumentRenderer, { source: raw, registry }));
  assert.match(html, /xyc-unavailable/);
  assert.ok(html.includes("&lt;svg&gt;"));
  assert.ok(!html.includes("<svg>"));
});
