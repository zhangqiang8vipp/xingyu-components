import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { builtInDefinitions, createCapabilityManifest, parseDocument } from "../dist/core/index.js";
import { DocumentRenderer } from "../dist/react/index.js";
import { gallerySpecimens } from "../gallery/fixtures.mjs";

const file = (name) => readFileSync(new URL("../gallery-dist/" + name, import.meta.url), "utf8");
const expectedTypes = builtInDefinitions.map((definition) => definition.type);

test("gallery is generated from the exact 24 declared and validated component schemas", () => {
  const manifest = JSON.parse(file("capabilities.json"));
  const examples = JSON.parse(file("examples.json"));
  const frameFiles = readdirSync(new URL("../gallery-dist/preview/", import.meta.url)).sort();
  assert.equal(expectedTypes.length, 24);
  assert.deepEqual(manifest.components.map((entry) => entry.type), expectedTypes);
  assert.deepEqual(Object.keys(examples), expectedTypes);
  assert.deepEqual(Object.keys(gallerySpecimens), expectedTypes);
  assert.deepEqual(frameFiles, expectedTypes.map((type) => type + ".html").sort());
  assert.deepEqual(manifest, createCapabilityManifest());

  for (const type of expectedTypes) {
    const doc = examples[type];
    assert.deepEqual(doc, { version: 1, blocks: [gallerySpecimens[type]] });
    const source = JSON.stringify(doc);
    const parsed = parseDocument(source);
    assert.equal(parsed.ok, true, type + " must pass the real schema");
    const markup = renderToStaticMarkup(createElement(DocumentRenderer, { source }));
    const frame = file("preview/" + type + ".html");
    assert.ok(frame.includes(markup), type + " must embed actual shipped React markup");
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
  assert.equal((index.match(/class="component-card"/g) ?? []).length, 24);
  assert.equal((index.match(/sandbox="allow-same-origin"/g) ?? []).length, 24);
  assert.equal((index.match(/class="preview-frame"/g) ?? []).length, 24);
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
