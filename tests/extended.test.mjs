import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { builtInDefinitions, createRegistry, parseDocument, createCapabilityManifest, createMcpCapabilityText } from "../dist/core/index.js";
import { DocumentRenderer } from "../dist/react/index.js";

const b = (type, props) => ({ type, version: 1, props });
const doc = (blocks) => JSON.stringify({ version: 1, blocks });
const valid = [
  b("badge", { label: "Review", tone: "info" }),
  b("progress", { label: "Coverage", value: 85.5, note: "Demo only" }),
  b("timeline", { title: "Plan", items: [
    { label: "Phase 1", title: "Design" }, { label: "Phase 2", title: "Ship", detail: "After review" },
  ] }),
  b("bar_chart", { title: "Scores", unit: "pts", items: [
    { label: "Entry A", value: 12.5 }, { label: "Entry B", value: 9 },
  ] }),
];
const render = blocks => renderToStaticMarkup(createElement(DocumentRenderer, { source: doc(blocks) }));

test("retained data primitives are registered in the authoritative manifest", () => {
  assert.equal(builtInDefinitions.length, 24);
  const manifest = createCapabilityManifest();
  assert.equal(new Set(manifest.components.map(x => x.type)).size, 24);
  assert.deepEqual(JSON.parse(createMcpCapabilityText()), manifest);
  for (const block of valid) {
    const definition = manifest.components.find(x => x.type === block.type);
    assert.ok(definition && definition.version === 1);
    assert.equal(parseDocument(doc([block])).ok, true);
  }
});

test("retained primitives compose safely with responsive grid and stack", () => {
  const source = doc([{ type: "stack", version: 1, props: { gap: "md" }, children: [
    { type: "grid", version: 1, props: { columns: 2 }, children: [valid[0], valid[1]] },
    valid[2], valid[3],
  ] }]);
  assert.equal(parseDocument(source).ok, true);
  const html = renderToStaticMarkup(createElement(DocumentRenderer, { source }));
  assert.match(html, /xyc-stack/);
  assert.match(html, /xyc-columns-2/);
  assert.match(html, /<progress/);
  assert.match(html, /<svg/);
  assert.match(html, /<ol/);
  assert.match(html, /<table/);
  assert.ok(!html.includes("dangerouslySetInnerHTML"));
});

test("schema rejects out-of-range values, malformed arrays and unknown fields", () => {
  const invalid = [
    b("progress", { label: "bad", value: -0.1 }),
    b("progress", { label: "bad", value: 101 }),
    b("badge", { label: "bad", tone: "script" }),
    b("badge", { label: "okay", tone: "info", html: "<script>" }),
    b("timeline", { items: [{ label: "today", title: "Valid", url: "https://example.com" }] }),
    b("bar_chart", { title: "bad", items: [{ label: "A", value: 5 }] }),
    b("bar_chart", { title: "bad", items: [{ label: "A", value: -3 }, { label: "B", value: 2 }] }),
    b("bar_chart", { title: "bad", items: [{ label: "A", value: null }, { label: "B", value: 2 }] }),
  ];
  for(const block of invalid){ const raw = doc([block]); const parsed = parseDocument(raw);
    assert.equal(parsed.ok, false, block.type); assert.equal(parsed.source, raw); }
});

test("chart labels and notes are HTML-escaped and raw data remains accessible", () => {
  const attack = '<img src=x onerror="alert(1)">';
  const html = render([
    b("bar_chart", { title: "Unsafe?", items: [{ label: attack, value: 3 }, { label: "Safe", value: 1 }] }),
    b("progress", { label: attack, value: 50 }),
  ]);
  assert.match(html, /&lt;img/);
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /查看原始数据/);
  assert.match(html, /<th scope="row"/);
});

test("uninstalled inherited renderer names cannot call prototype methods", () => {
  const custom = { type: "constructor", version: 1, category: "content", label: "Untrusted slot",
    description: "No installed renderer", children: "none",
    propsSchema: { type: "object", properties: { text: { type: "string", minLength: 1, maxLength: 80 } },
      required: ["text"], additionalProperties: false } };
  const registry = createRegistry([...builtInDefinitions, custom]);
  const raw = doc([b("constructor", { text: "<svg>" })]);
  assert.equal(parseDocument(raw, registry).ok, true);
  const html = renderToStaticMarkup(createElement(DocumentRenderer, { source: raw, registry }));
  assert.match(html, /xyc-unavailable/);
  assert.match(html, /&lt;svg&gt;/);
});
