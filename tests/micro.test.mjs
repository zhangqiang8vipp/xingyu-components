import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { builtInDefinitions, createCapabilityManifest, parseDocument } from "../dist/core/index.js";
import { DocumentRenderer } from "../dist/react/index.js";
import { gallerySpecimens } from "../gallery/fixtures.mjs";

const block = (type, props) => ({ type, version: 1, props });
const source = (blocks) => JSON.stringify({ version: 1, blocks });
const valid = b => parseDocument(source([b])).ok;
const render = blocks => renderToStaticMarkup(createElement(DocumentRenderer, { source: source(blocks) }));

test("tip and metric_transition are the only two additions, discoverable in the v1 manifest", () => {
  const manifest = createCapabilityManifest();
  assert.equal(builtInDefinitions.length, 26);
  assert.deepEqual(manifest.components.slice(-2).map(x => x.type), ["tip", "metric_transition"]);
  for (const type of ["tip", "metric_transition"]) {
    assert.ok(manifest.components.find(x => x.type === type && x.children === "none"));
    assert.equal(valid(gallerySpecimens[type]), true);
  }
});

test("micro tip supports screenshot-inspired pill, inline, and note variants without any event handlers", () => {
  for (const variant of ["pill", "inline", "note"]) {
    const output = render([block("tip", {
      text: "示例状态", tone: "success", variant, detail: "作者提供的说明",
    })]);
    assert.ok(output.includes("xyc-micro-tip-" + variant));
    assert.ok(output.includes("xyc-micro-tone-success"));
    assert.ok(output.includes("作者提供的说明"));
    assert.doesNotMatch(output, /onClick|dangerouslySetInnerHTML|<script/);
  }
  const defaultVariant = render([block("tip", { text: "默认行内提示", tone: "info" })]);
  assert.match(defaultVariant, /xyc-micro-tip-inline/);
  assert.match(render([block("tip", { text: "危险", tone: "danger" })]), /xyc-micro-tone-danger/);
});

test("metric transition computes the absolute difference: 40 to 24 yields 16", () => {
  const before = gallerySpecimens.metric_transition;
  const output = render([before]);
  assert.match(output, /xyc-metric-transition/);
  assert.match(output, /原组件数量/);
  assert.match(output, /精简后/);
  assert.match(output, /<data value="40">40<\/data>/);
  assert.match(output, /<data value="24">24<\/data>/);
  assert.match(output, /<data value="16">16<\/data>/);
  assert.doesNotMatch(output, /<data value="999">/);
  const reverse = render([block("metric_transition", { beforeLabel: "A", before: 3,
    afterLabel: "B", after: 8, differenceLabel: "Change" })]);
  assert.match(reverse, /<data value="5">5<\/data>/);
});

test("strict schemas reject invented delta, unsafe fields, unsupported status and noninteger data", () => {
  const bad = [
    block("tip", { text: "X", tone: "live" }),
    block("tip", { text: "X", tone: "success", variant: "inline", onclick: "evil" }),
    block("tip", { text: "", tone: "info" }),
    block("tip", { text: "X", tone: "info", variant: "popup" }),
    block("tip", { text: "X", tone: "info", detail: "a".repeat(401) }),
    block("metric_transition", { beforeLabel: "A", before: 40, afterLabel: "B", after: 24,
      differenceLabel: "Diff", delta: 999 }),
    block("metric_transition", { beforeLabel: "A", before: -1, afterLabel: "B", after: 24,
      differenceLabel: "Diff" }),
    block("metric_transition", { beforeLabel: "A", before: 40.5, afterLabel: "B", after: 24,
      differenceLabel: "Diff" }),
    block("metric_transition", { beforeLabel: "A", before: 40, afterLabel: "B", after: NaN,
      differenceLabel: "Diff" }),
    block("metric_transition", { beforeLabel: "A", before: 40, afterLabel: "B", after: 1_000_000_001,
      differenceLabel: "Diff" }),
  ];
  for (const b of bad) {
    const raw = source([b]);
    const parsed = parseDocument(raw);
    assert.equal(parsed.ok, false, b.type);
    assert.equal(parsed.source, raw);
  }
});

test("markup escapes authored strings, has no red annotation frame, and has a narrow-viewport layout", () => {
  const malicious = '<img src=x onerror="alert(1)"><script>alert(1)</script>';
  const output = render([
    block("tip", { text: malicious, tone: "success" }),
    block("metric_transition", { beforeLabel: malicious, before: 40, afterLabel: "Current",
      after: 24, differenceLabel: malicious }),
  ]);
  assert.match(output, /&lt;img/);
  assert.match(output, /&lt;script&gt;/);
  assert.doesNotMatch(output, /<img src=x|<script>|<button|onClick=/);
  const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(styles, /max-width: 450px/);
  assert.match(styles, /xyc-metric-transition/);
  assert.match(styles, /xyc-micro-tip-note/);
});
