import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { builtInDefinitions, createCapabilityManifest, parseDocument } from "../dist/core/index.js";
import { DocumentRenderer } from "../dist/react/index.js";
import { gallerySpecimens } from "../gallery/fixtures.mjs";

const types = ["panel", "hero", "link_cards", "stacked_bar_chart",
  "scatter_chart", "heatmap", "rating_group", "agenda", "kanban_board"];
const source = (block) => JSON.stringify({ version: 1, blocks: [block] });
const b = (type, props, children) => ({ type, version: 1, props, ...(children ? { children } : {}) });
const valid = (block) => parseDocument(source(block)).ok;
const render = (block) => renderToStaticMarkup(createElement(DocumentRenderer, { source: source(block) }));

test("24 components expose nine new patterns through the exact same capability manifest", () => {
  assert.equal(builtInDefinitions.length, 26);
  const capabilities = createCapabilityManifest().components;
  assert.deepEqual(capabilities.slice(15, 24).map((item) => item.type), types);
  assert.equal(new Set(capabilities.map((item) => item.type)).size, 26);
  for (const type of types) {
    assert.ok(gallerySpecimens[type], "missing gallery specimen for " + type);
    assert.equal(valid(gallerySpecimens[type]), true, "invalid specimen for " + type);
    const html = render(gallerySpecimens[type]);
    assert.match(html, /xyc-pattern-/);
    assert.doesNotMatch(html, /xyc-fallback|xyc-unavailable/);
  }
});

test("closed schemas, array bounds and matrix alignment fail closed, returning exact authored source", () => {
  const invalid = [
    b("panel", { title: "No children" }),
    b("hero", { title: "Bad", summary: "No HTML", onclick: "alert(1)" }),
    b("link_cards", { items: [{ label: "Bad", url: "javascript:alert(1)" }] }),
    b("link_cards", { items: [{ label: "Private", url: "https://localhost/" }] }),
    b("link_cards", { items: [{ label: "Bad", url: "https://example.com", target: "_self" }] }),
    b("tree_view", { groups: [{ label: "Empty", children: [] }] }),
    b("stacked_bar_chart", { title: "Zero", items: [{ label: "A", value: 0 }, { label: "B", value: 0 }] }),
    b("stacked_bar_chart", { title: "Bad", items: [{ label: "A", value: -1 }, { label: "B", value: 3 }] }),
    b("scatter_chart", { title: "Inf", xLabel: "X", yLabel: "Y", items: [
      { label: "A", x: Infinity, y: 1 }, { label: "B", x: 1, y: 2 },
    ] }),
    b("heatmap", { title: "Ragged", columns: ["A", "B", "C"], rows: [
      { label: "One", values: [10, 20] }, { label: "Two", values: [30, 40, 50] },
    ] }),
    b("heatmap", { title: "Bad", columns: ["A", "B"], rows: [
      { label: "One", values: [10, 101] }, { label: "Two", values: [30, 40] },
    ] }),
    b("rating_group", { title: "Out of range", items: [{ label: "A", score: 6 }] }),
    b("agenda", { title: "Incorrect", items: [{ when: "Now", title: "Meet", url: "https://example.com" }] }),
    b("kanban_board", { title: "Only one", columns: [{ title: "A", cards: [{ title: "X" }] }] }),
  ];
  for (const block of invalid) {
    const raw = source(block);
    const parsed = parseDocument(raw);
    assert.equal(parsed.ok, false, block.type + " should reject malformed content");
    assert.equal(parsed.source, raw, "source preservation");
  }
});

test("plain text remains escaped; static visualizations provide accessible tables and labels", () => {
  const injected = b("hero", { title: "<img src=x onerror=alert(1)>", summary: "<script>alert(1)</script>" });
  const markup = render(injected);
  assert.match(markup, /&lt;img/);
  assert.match(markup, /&lt;script/);
  assert.doesNotMatch(markup, /<script>|<img src=x/);
  for (const type of ["stacked_bar_chart", "scatter_chart", "heatmap"]) {
    const html = render(gallerySpecimens[type]);
    assert.match(html, /<table>/);
    assert.match(html, /<th scope="col"/);
    assert.match(html, /<th scope="row"/);
    assert.match(html, /模拟数据|原始数据|数值范围|未经|提供的示例/);
    assert.doesNotMatch(html, /NaN|Infinity/);
  }
  const links = render(gallerySpecimens.link_cards);
  assert.match(links, /rel="noopener noreferrer"/);
  assert.match(links, /href="https:\/\//);
  assert.match(links, /未自动核验/);
  const board = render(gallerySpecimens.kanban_board);
  assert.match(board, /只读展示/);
});
