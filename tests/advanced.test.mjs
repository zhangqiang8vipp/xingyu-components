import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  builtInDefinitions, createCapabilityManifest, createMcpCapabilityText,
  parseDocument,
} from "../dist/core/index.js";
import { DocumentRenderer } from "../dist/react/index.js";

const b = (type, props) => ({ type, version: 1, props });
const doc = (blocks) => JSON.stringify({ version: 1, blocks });
const parsed = (block) => parseDocument(doc([block]));
const html = (blocks) => renderToStaticMarkup(createElement(DocumentRenderer, { source: doc(blocks) }));

const valid = [
  b("accordion", { title: "FAQ", items: [
    { question: "Why?", answer: "Readability." },
    { question: "How?", answer: "With data." },
  ] }),
  b("checklist", { items: [{ text: "Test", checked: true, note: "Verified" }, { text: "Ship", checked: false }] }),
  b("status_list", { items: [
    { text: "Build", status: "done" }, { text: "Review", status: "active", detail: "In progress" },
    { text: "Publish", status: "pending" }, { text: "Wait", status: "blocked" },
  ] }),
  b("code_block", { language: "html", code: "<script>alert(1)</script>", caption: "Never runs" }),
  b("sources", { title: "References", items: [
    { label: "MDN", url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details", note: "Example" },
  ] }),
  b("line_chart", { title: "Trend", items: [
    { label: "Start", value: 0 }, { label: "Finish", value: 9.5 },
  ] }),
  b("pie_chart", { title: "Shares", unit: "units", items: [
    { label: "A", value: 0 }, { label: "B", value: 7 },
  ] }),
  b("flowchart", { items: [
    { title: "Draft" }, { title: "Review", detail: "Check facts" }, { title: "Publish" },
  ] }),
  b("pros_cons", { pros: ["Good"], cons: ["Risk", "Cost"] }),
  b("glossary", { items: [{ term: "Doc", definition: "A readable collection." }] }),
  b("tag_list", { label: "Categories", tags: ["AI", "Docs", "React"] }),
];

const newTypes = [
  "accordion", "checklist", "status_list", "code_block", "sources",
  "line_chart", "pie_chart", "flowchart", "pros_cons", "glossary", "tag_list",
];

test("all 40 registered types are discoverable and all 11 new examples use exact schemas", () => {
  assert.equal(builtInDefinitions.length, 40);
  const manifest = createCapabilityManifest();
  assert.deepEqual(JSON.parse(createMcpCapabilityText()), manifest);
  assert.equal(manifest.components.length, 40);
  assert.equal(new Set(manifest.components.map(({ type }) => type)).size, 40);
  assert.deepEqual(manifest.components.slice(19, 30).map(({ type }) => type), newTypes);
  for (const block of valid) {
    const spec = manifest.components.find(({ type }) => type === block.type);
    assert.ok(spec && spec.version === 1 && spec.children === "none", block.type);
    assert.equal(parsed(block).ok, true, block.type + " must parse");
  }
  const link = manifest.components.find(({ type }) => type === "sources");
  assert.equal(link.propsSchema.properties.items.items.properties.url.type, "https-url");
  const pie = manifest.components.find(({ type }) => type === "pie_chart");
  assert.equal(pie.propsSchema.properties.items.positiveSumField, "value");
});

test("all eleven primitives SSR-render from the actual production map", () => {
  const result = html(valid);
  assert.match(result, /<details/);
  assert.ok(result.includes("<summary>Why?</summary>"));
  assert.match(result, /<pre><code>/);
  assert.match(result, /<svg/);
  assert.match(result, /xyc-advanced-pie/);
  assert.match(result, /<dl/);
  assert.match(result, /xyc-flowchart/);
  assert.match(result, /xyc-pros-cons-grid/);
  assert.match(result, /xyc-status-blocked/);
  assert.match(result, /aria-label="只读清单"/);
  assert.ok(!result.includes('xyc-unavailable'), "No missing renderers");
  assert.ok(!result.includes('xyc-fallback'), "No invalid schemas");
});

test("source links require strictly safe HTTPS and do not fetch or auto-verify", () => {
  const bad = [
    "http://example.com", "javascript:alert(1)", "data:text/html,hi",
    "https://u:pw@example.com/private", "https://example.com\\@other.com",
    "https://example.com/has space", " https://example.com",
    "https://127.0.0.1/data", "https://[::1]/data",
    "https://localhost/secret", "https://private.local/info",
    "https://example.com:8443/private", "https://example.com\n/", "not a url",
  ];
  for (const url of bad) {
    const block = b("sources", { items: [{ label: "Source", url }] });
    assert.equal(parsed(block).ok, false, "should reject: " + url);
  }
  const block = b("sources", { items: [{
    label: '<img src=x onerror="alert(1)">', url: "https://example.com/path?q=1",
  }] });
  assert.equal(parsed(block).ok, true);
  const rendered = html([block]);
  assert.match(rendered, /href="https:\/\/example\.com\/path\?q=1"/);
  assert.match(rendered, /target="_blank"/);
  assert.match(rendered, /rel="noopener noreferrer"/);
  assert.match(rendered, /referrerPolicy="no-referrer"|referrerpolicy="no-referrer"/i);
  assert.ok(rendered.includes("&lt;img"));
  assert.ok(!rendered.includes("<img src=x"));
  assert.match(rendered, /未经自动核验/);
});

test("pie chart requires at least one positive slice and both charts reject invalid data", () => {
  const invalid = [
    b("pie_chart", { title: "Zero", items: [{ label: "A", value: 0 }, { label: "B", value: 0 }] }),
    b("pie_chart", { title: "Negative", items: [{ label: "A", value: -1 }, { label: "B", value: 2 }] }),
    b("pie_chart", { title: "Large", items: [{ label: "A", value: 1_000_000_001 }, { label: "B", value: 1 }] }),
    b("pie_chart", { title: "Few", items: [{ label: "A", value: 1 }] }),
    b("line_chart", { title: "Few", items: [{ label: "A", value: 1 }] }),
    b("line_chart", { title: "Invalid", items: [{ label: "A", value: "1" }, { label: "B", value: 2 }] }),
    b("line_chart", { title: "Invalid", items: [{ label: "A", value: NaN }, { label: "B", value: 2 }] }),
    b("line_chart", { title: "Invalid", items: [{ label: "A", value: Infinity }, { label: "B", value: 2 }] }),
    b("pie_chart", { title: "Long", items: Array.from({ length: 9 }, (_, i) => ({ label: "X" + i, value: 1 })) }),
  ];
  for (const block of invalid) assert.equal(parsed(block).ok, false, block.type + " " + block.props.title);
  for (const block of valid.filter(({ type }) => type.endsWith("_chart"))) {
    const markup = html([block]);
    assert.match(markup, /<table/);
    assert.match(markup, /<th scope="row"/);
    assert.match(markup, /查看原始数据/);
    assert.match(markup, /role="img"/);
  }
  assert.ok(!html([valid[6]]).includes("NaN"));
});

test("closed props, bounded arrays, status enums and boolean types fail closed", () => {
  const invalid = [
    b("accordion", { items: [{ question: "Q", answer: "A", onclick: "alert(1)" }] }),
    b("accordion", { items: [] }),
    b("checklist", { items: [{ text: "A", checked: "true" }] }),
    b("checklist", { items: Array.from({ length: 31 }, () => ({ text: "A", checked: true })) }),
    b("status_list", { items: [{ text: "A", status: "imagined" }] }),
    b("code_block", { language: "html", code: "", html: "<script>" }),
    b("code_block", { language: "js", code: "x".repeat(8001) }),
    b("sources", { items: [{ label: "x", url: "https://example.com", extra: true }] }),
    b("flowchart", { items: [{ title: "Only" }] }),
    b("flowchart", { items: Array.from({ length: 11 }, () => ({ title: "Extra" })) }),
    b("pros_cons", { pros: ["ok"], cons: [] }),
    b("glossary", { items: [{ term: "x", definition: 123 }] }),
    b("tag_list", { tags: [] }),
    b("tag_list", { tags: ["x"], onclick: "malicious" }),
  ];
  for (const block of invalid) {
    const source = doc([block]);
    const result = parseDocument(source);
    assert.equal(result.ok, false, block.type);
    if (!result.ok) assert.equal(result.source, source, "Fall back to authored bytes");
  }
});

test("XSS-like code, questions, notes and glossary definitions stay escaped", () => {
  const attack = '<img src=x onerror="alert(1)"><script>evil()</script>';
  const blocks = [
    b("accordion", { items: [{ question: attack, answer: attack }] }),
    b("code_block", { code: attack, language: "html" }),
    b("status_list", { items: [{ text: attack, status: "active", detail: attack }] }),
    b("glossary", { items: [{ term: attack, definition: attack }] }),
    b("tag_list", { tags: [attack] }),
  ];
  const result = html(blocks);
  assert.ok(result.includes("&lt;script&gt;"));
  assert.ok(result.includes("&lt;img"));
  assert.ok(!result.includes("<script>"));
  assert.ok(!result.includes("<img src=x"));
  assert.ok(!result.includes("onClick="));
});

test("new primitives compose inside existing nested grid/stack without adding new document protocol", () => {
  const compose = {
    type: "stack", version: 1, props: { gap: "sm" },
    children: [
      valid[0],
      { type: "grid", version: 1, props: { columns: 2 }, children: [
        valid[1], valid[8], valid[10],
      ] },
      valid[4], valid[5], valid[6],
    ],
  };
  const source = doc([compose]);
  assert.equal(parseDocument(source).ok, true);
  const rendered = html([compose]);
  assert.match(rendered, /xyc-stack/);
  assert.match(rendered, /xyc-columns-2/);
  assert.match(rendered, /xyc-pros-cons/);
  assert.match(rendered, /xyc-advanced-line/);
});
