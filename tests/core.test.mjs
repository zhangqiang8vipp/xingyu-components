import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  builtInDefinitions, createRegistry, defaultRegistry, parseDocument,
  createCapabilityManifest, createMcpCapabilityText, MAX_BLOCKS, MAX_DEPTH,
  MAX_SOURCE_CHARACTERS,
} from "../dist/core/index.js";

const example = readFileSync(new URL("../examples/document.json", import.meta.url), "utf8");
const text = (value = "hello") => ({ type: "text", version: 1, props: { text: value } });
const source = (blocks) => JSON.stringify({ version: 1, blocks });

test("example composes text, grid, metric and callout", () => {
  const result = parseDocument(example);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.document.blocks.length, 3);
});

test("schema catalog is the only source for all seven primitive types", () => {
  const names = builtInDefinitions.map((entry) => entry.type);
  assert.deepEqual(names, ["text", "callout", "metric", "stack", "grid", "disclosure", "divider",
    "heading", "quote", "badge", "bullet_list", "numbered_list", "key_value", "table",
    "progress", "timeline", "steps", "comparison", "bar_chart",
    "accordion", "checklist", "status_list", "code_block", "sources", "line_chart",
    "pie_chart", "flowchart", "pros_cons", "glossary", "tag_list"]);
  assert.equal(new Set(names).size, names.length);
  const manifest = createCapabilityManifest();
  assert.equal(manifest.protocol, "xingyu-document");
  assert.equal(manifest.version, 1);
  assert.equal(manifest.contentModel, "render-only");
  assert.equal(manifest.components.length, 40);
  assert.deepEqual(manifest.components.map((v) => v.type), names);
  assert.deepEqual(JSON.parse(createMcpCapabilityText()), manifest);
});

test("malformed source retains exact original bytes for safe fallback", () => {
  const malformed = '{ "<img src=x onerror=alert(1)>": ';
  const result = parseDocument(malformed);
  assert.deepEqual(result, { ok: false, source: malformed, reason: "invalid-json" });
});

test("unknown versions, types and keys fail closed", () => {
  const invalid = [
    '{"version":2,"blocks":[]}',
    source([{ ...text(), version: 2 }]),
    source([{ ...text(), type: "react-component" }]),
    source([{ ...text(), onclick: "alert(1)" }]),
    source([{ ...text(), props: { text: "hello", html: "<b>bad</b>" } }]),
    source([{ ...text(), children: [] }]),
    source([{ type: "divider", version: 1, props: { className: "external-script" } }]),
    JSON.stringify({ version: 1, blocks: [text()], extra: true }),
    JSON.stringify({ version: 1, blocks: [text()], __proto__: null, evil: 1 }),
  ];
  for (const raw of invalid) assert.equal(parseDocument(raw).ok, false, raw);
});

test("valid nested stack and grid are accepted", () => {
  const nested = source([{ type: "stack", version: 1, props: { gap: "md" }, children: [
    { type: "grid", version: 1, props: { columns: 2 }, children: [text("one"), text("two")] },
  ] }]);
  assert.equal(parseDocument(nested).ok, true);
});

test("composition requires bounded children and valid props", () => {
  const bad = [
    source([{ type: "stack", version: 1, props: {}, children: [] }]),
    source([{ type: "stack", version: 1, props: {}, children: Array.from({ length: 17 }, () => text()) }]),
    source([{ type: "grid", version: 1, props: { columns: 4 }, children: [text()] }]),
    source([{ type: "grid", version: 1, props: { columns: "2" }, children: [text()] }]),
    source([{ type: "callout", version: 1, props: { title: "Title", body: "Body", tone: "critical" } }]),
    source([{ type: "metric", version: 1, props: { label: "L", value: "" } }]),
    source([{ type: "disclosure", version: 1, props: { summary: "S", body: "B", onToggle: 1 } }]),
  ];
  for (const raw of bad) assert.equal(parseDocument(raw).ok, false, raw);
});

test("source, tree size and depth limits are enforced", () => {
  assert.equal(parseDocument("x".repeat(MAX_SOURCE_CHARACTERS + 1)).ok, false);
  assert.equal(parseDocument(source(Array.from({ length: MAX_BLOCKS + 1 }, () => text()))).ok, false);
  let deep = text("bottom");
  for (let index = 0; index < MAX_DEPTH; index++) {
    deep = { type: "stack", version: 1, props: {}, children: [deep] };
  }
  assert.equal(parseDocument(source([deep])).ok, false);
});

test("untrusted URLs or event handlers cannot be smuggled into a callout", () => {
  const raw = source([{
    type: "callout", version: 1,
    props: { title: "hello", body: "text", tone: "info", href: "javascript:alert(1)" },
  }]);
  const result = parseDocument(raw);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.source, raw);
});

test("registering trusted custom component extends discovery and parsing only when explicit", () => {
  const custom = {
    type: "custom_quote", version: 1, label: "Quote", description: "Plain quote", category: "content",
    propsSchema: { type: "object", required: ["text"], properties: { text: { type: "string", minLength: 1, maxLength: 500 } }, additionalProperties: false },
    children: "none",
  };
  const raw = source([{ type: "custom_quote", version: 1, props: { text: "Original words" } }]);
  assert.equal(parseDocument(raw).ok, false);
  const registry = createRegistry([...builtInDefinitions, custom]);
  assert.equal(parseDocument(raw, registry).ok, true);
  assert.equal(createCapabilityManifest(registry).components.length, 41);
  assert.throws(() => registry.register(custom), /Duplicate/);
  assert.throws(() => registry.register({ ...custom, type: "__proto__" }), /Invalid/);
  assert.equal(defaultRegistry.list().length, 40, "global registry must not mutate");
});
