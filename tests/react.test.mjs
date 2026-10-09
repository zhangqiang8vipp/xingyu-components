import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DocumentRenderer } from "../dist/react/index.js";
import { builtInDefinitions, createRegistry } from "../dist/core/index.js";

const source = (blocks) => JSON.stringify({ version: 1, blocks });
const paragraph = (text) => ({ type: "text", version: 1, props: { text } });

test("React text content is HTML-escaped, not interpreted as raw markup", () => {
  const evil = '<img src=x onerror="alert(1)"><script>alert(1)</script>';
  const html = renderToStaticMarkup(createElement(DocumentRenderer, { source: source([paragraph(evil)]) }));
  assert.ok(html.includes("&lt;img"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("<img src=x"));
});

test("unknown source falls back to escaped original and preserves text", () => {
  const raw = source([{ type: "malicious-html", version: 1, props: { html: "<iframe>" } }]);
  const html = renderToStaticMarkup(createElement(DocumentRenderer, { source: raw }));
  assert.ok(html.includes("xyc-fallback"));
  assert.ok(html.includes("&lt;iframe&gt;"));
  assert.ok(!html.includes("<iframe>"));
});

test("nested layout and local disclosure SSR without additional dependencies", () => {
  const blocks = [{ type: "grid", version: 1, props: { columns: 2 }, children: [
    paragraph("first"),
    { type: "disclosure", version: 1, props: { summary: "Show", body: "Reveal" } },
  ] }];
  const html = renderToStaticMarkup(createElement(DocumentRenderer, { source: source(blocks) }));
  assert.match(html, /xyc-columns-2/);
  assert.match(html, /<details/);
  assert.match(html, /<summary>Show<\/summary>/);
});

test("installed custom validation without a renderer safely degrades to text", () => {
  const quote = { type: "custom_quote", version: 1, label: "Quote", description: "Text", category: "content",
    propsSchema: { type: "object", properties: { text: { type: "string", minLength: 1, maxLength: 80 } },
      required: ["text"], additionalProperties: false }, children: "none" };
  const registry = createRegistry([...builtInDefinitions, quote]);
  const raw = source([{ type: "custom_quote", version: 1, props: { text: "<b>not HTML</b>" } }]);
  const html = renderToStaticMarkup(createElement(DocumentRenderer, { source: raw, registry }));
  assert.match(html, /xyc-unavailable/);
  assert.ok(html.includes("&lt;b&gt;"));
  assert.ok(!html.includes("<b>not HTML</b>"));
});
