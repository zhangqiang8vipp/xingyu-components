import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { builtInDefinitions, createCapabilityManifest, parseDocument } from "../dist/core/index.js";
import { DocumentRenderer } from "../dist/react/index.js";
import { gallerySpecimens, galleryTipGroups } from "../gallery/fixtures.mjs";

const file = (name) => readFileSync(new URL("../gallery-dist/" + name, import.meta.url), "utf8");
const expectedTypes = builtInDefinitions.map((definition) => definition.type);

test("gallery is generated from the exact 26 declared and validated component schemas", () => {
  const manifest = JSON.parse(file("capabilities.json"));
  const examples = JSON.parse(file("examples.json"));
  const frameFiles = readdirSync(new URL("../gallery-dist/preview/", import.meta.url)).sort();
  assert.equal(expectedTypes.length, 26);
  assert.deepEqual(manifest.components.map((entry) => entry.type), expectedTypes);
  assert.deepEqual(Object.keys(examples), expectedTypes);
  assert.deepEqual(Object.keys(gallerySpecimens), expectedTypes);
  assert.deepEqual(frameFiles, expectedTypes.map((type) => type + ".html").sort());
  assert.deepEqual(manifest, createCapabilityManifest());

  for (const type of expectedTypes) {
    const doc = examples[type];
    const samples = type === "tip"
      ? galleryTipGroups.flatMap(group => group.examples)
      : [gallerySpecimens[type]];
    assert.deepEqual(doc, { version: 1, blocks: samples });
    const source = JSON.stringify(doc);
    const parsed = parseDocument(source);
    assert.equal(parsed.ok, true, type + " must pass the real schema");
    const frame = file("preview/" + type + ".html");
    if (type === "tip") {
      for (const sample of samples) {
        const markup = renderToStaticMarkup(createElement(DocumentRenderer, {
          source: JSON.stringify({ version: 1, blocks: [sample] }),
        }));
        assert.ok(frame.includes(markup), "tip variant must use shipped React renderer");
      }
    } else {
      const markup = renderToStaticMarkup(createElement(DocumentRenderer, { source }));
      assert.ok(frame.includes(markup), type + " must embed actual shipped React markup");
    }
    assert.match(frame, /<meta name="viewport" content="width=device-width,initial-scale=1">/);
    assert.match(frame, /script-src &#39;none&#39;/, "render-only frame must disable scripts");
    assert.match(frame, /href="\.\.\/components\.css"/);
    assert.ok(!frame.includes("<script"), "frame source must not contain executable script");
  }
});

test("atlas navigation, category filters, search and phone/dark preview toggles are present", () => {
  const index = file("index.html");
  assert.match(index, /lang="zh-CN"/);
  assert.match(index, /data-theme="light" data-device="desktop"/);
  assert.match(index, /data-theme-option="dark"/);
  assert.match(index, /data-device-option="phone"/);
  assert.match(index, /id="gallery-search"/);
  assert.match(index, /id="empty-state"/);
  assert.match(index, /data-copy/);
  assert.match(index, /data-filter="content"/);
  assert.match(index, /data-filter="layout"/);
  assert.match(index, /data-filter="data"/);
  assert.match(index, /data-filter="interaction"/);
  assert.equal((index.match(/class="component-card"/g) ?? []).length, 26);
  assert.equal((index.match(/sandbox="allow-same-origin"/g) ?? []).length, 26);
  assert.equal((index.match(/class="preview-frame"/g) ?? []).length, 26);
  assert.match(index, /script-src &#39;self&#39;/);
  assert.ok(!index.includes("src=\"https:"));
  assert.ok(!index.includes("onload="));
});

test("gallery viewer uses genuine iframe viewport changes and inherits dark-theme tokens", () => {
  const gallery = file("gallery.css");
  const frame = file("frame.css");
  const client = file("gallery.js");
  const components = file("components.css");
  assert.match(gallery, /data-device="phone".*\.preview-frame/);
  assert.match(gallery, /360px/);
  assert.match(frame, /:root\[data-theme="dark"\]/);
  assert.match(frame, /@media \(max-width: 520px\)/);
  assert.match(client, /contentDocument/);
  assert.match(client, /data-filter/);
  assert.match(client, /navigator\.clipboard\.writeText/);
  assert.match(components, /\.xyc-document/);
  assert.ok(gallery.length < 50_000, "gallery CSS should remain compact");
  assert.ok(file("index.html").length < 180_000, "static atlas should remain compact");
  assert.ok(existsSync(new URL("../gallery-dist/.nojekyll", import.meta.url)));
  assert.ok(statSync(new URL("../gallery-dist/.nojekyll", import.meta.url)).isFile());
});

test("rendered JSON examples remain safely escaped in source panels", () => {
  const examples = JSON.parse(file("examples.json"));
  const index = file("index.html");
  for (const type of expectedTypes) {
    assert.ok(index.includes('id="component-' + type + '"'));
    assert.ok(index.includes('src="./preview/' + type + '.html"'));
    assert.ok(parseDocument(JSON.stringify(examples[type])).ok);
  }
  assert.match(index, /&quot;version&quot;: 1/);
  assert.ok(!index.includes("<script>alert"));
});

test("tip atlas showcases 3 variants and 5 tones without registering new component types", () => {
  const variants = ["pill", "inline", "note"];
  const tones = ["neutral", "info", "success", "warning", "danger"];
  const examples = galleryTipGroups.flatMap(group => group.examples);
  assert.equal(galleryTipGroups.length, 3);
  assert.equal(examples.length, 15);
  assert.deepEqual(galleryTipGroups.map(group => group.variant), variants);
  for (const group of galleryTipGroups) {
    assert.equal(group.examples.length, 5);
    assert.deepEqual(group.examples.map(example => example.props.tone), tones);
    for (const example of group.examples) {
      assert.equal(example.type, "tip");
      assert.equal(example.version, 1);
      assert.equal(example.props.variant, group.variant);
      assert.equal(parseDocument(JSON.stringify({ version: 1, blocks: [example] })).ok, true);
    }
  }
  const page = file("index.html");
  const preview = file("preview/tip.html");
  const examplesJson = JSON.parse(file("examples.json"));
  assert.equal(examplesJson.tip.blocks.length, 15);
  assert.match(page, /id="component-tip"/);
  assert.match(page, /<button type="button" class="copy-button" data-copy>/);
  assert.match(preview, /tip-showcase-grid/);
  assert.match(preview, /tip-showcase-lead/);
  assert.match(preview, /Watch ACTIVE/);
  assert.match(preview, /已合并部署成功/);
  assert.match(preview, /风险提醒/);
  assert.equal((preview.match(/class="tip-case"/g) ?? []).length, 15);
  assert.equal((preview.match(/class="tip-group" /g) ?? []).length, 3);
  assert.ok(!preview.includes("<script"));
  assert.match(file("gallery.css"), /data-component="tip"/);
  assert.match(file("frame.css"), /@media \(max-width: 700px\)/);
});
