/**
 * Static component gallery generator.
 * Always renders through the shipped React DocumentRenderer, never a mock UI.
 * Only trusted repository fixtures can appear in the generated gallery.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createCapabilityManifest, parseDocument } from "../dist/core/index.js";
import { DocumentRenderer } from "../dist/react/index.js";
import { gallerySpecimens, galleryCategoryLabels, galleryCategoryDescriptions } from "./fixtures.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "gallery-dist");
const repositoryUrl = "https://github.com/zhangqiang8vipp/xingyu-components";
const categoryOrder = ["content", "data", "layout", "interaction"];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;",
  })[char]);
}

function createSource(block) {
  return JSON.stringify({ version: 1, blocks: [block] }, null, 2);
}

function renderFrame(title, markup) {
  const policy = "default-src 'none'; style-src 'self'; img-src 'self'; script-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'";
  return [
    "<!doctype html>",
    '<html lang="zh-CN" data-theme="light">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<meta http-equiv="Content-Security-Policy" content="' + escapeHtml(policy) + '">',
    "<title>" + escapeHtml(title) + " - XINGYU Components</title>",
    '<link rel="stylesheet" href="../components.css">',
    '<link rel="stylesheet" href="../frame.css">',
    "</head>",
    '<body><main class="frame-content">' + markup + "</main></body>",
    "</html>",
  ].join("\n");
}

function renderCard(item, index) {
  const { type, label, category, description, source } = item;
  const cardTitle = escapeHtml(label);
  const categoryTitle = escapeHtml(galleryCategoryLabels[category]);
  const number = String(index + 1).padStart(2, "0");
  return [
    '<article class="component-card" id="component-' + type + '"',
    ' data-component="' + type + '" data-category="' + category + '"',
    ' data-search="' + escapeHtml([type, label, description, galleryCategoryLabels[category]].join(" ").toLowerCase()) + '">',
    '<div class="card-heading"><div class="card-heading-left">',
    '<span class="component-number" aria-hidden="true">' + number + "</span>",
    '<div><div class="card-kicker">' + categoryTitle + ' <span class="kicker-separator">/</span> ' + type + "</div>",
    "<h3>" + cardTitle + "</h3></div></div>",
    '<a class="anchor-link" href="#component-' + type + '" aria-label="链接到' + cardTitle + '">#</a></div>',
    '<p class="card-description">' + escapeHtml(description) + "</p>",
    '<div class="preview-chrome"><div class="preview-chrome-top">',
    '<span class="preview-led" aria-hidden="true"></span><span>LIVE RENDER</span>',
    '<span class="preview-chrome-type">React / v1</span></div>',
    '<div class="frame-wrap">',
    '<iframe class="preview-frame" loading="lazy" sandbox="allow-same-origin" ',
    'src="./preview/' + type + '.html" title="' + cardTitle + ' - 实际 React 渲染预览"></iframe>',
    "</div></div>",
    '<details class="source-details"><summary><span>查看组件 JSON</span>',
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
    '</summary><div class="source-box"><div class="source-bar"><span>xingyu-document / v1</span>',
    '<button type="button" class="copy-button" data-copy>复制 JSON</button></div>',
    '<pre><code>' + escapeHtml(source) + "</code></pre></div></details>",
    "</article>",
  ].join("");
}

function renderIndex(items) {
  const total = items.length;
  const categories = categoryOrder.map((category) => ({
    category, label: galleryCategoryLabels[category],
    description: galleryCategoryDescriptions[category],
    count: items.filter((item) => item.category === category).length,
  }));
  const filters = [
    '<button type="button" class="filter-button is-active" data-filter="all" aria-pressed="true">全部 <span>' + total + "</span></button>",
    ...categories.map(({ category, label, count }) =>
      '<button type="button" class="filter-button" data-filter="' + category + '" aria-pressed="false">' + escapeHtml(label) + ' <span>' + count + "</span></button>"),
  ].join("");
  const subtitle = "一套为自由表达而设计的安全组件语言。AI 决定如何表达，组件只负责忠实呈现。";
  const policy = "default-src 'none'; style-src 'self'; script-src 'self'; img-src 'self' data:; frame-src 'self'; connect-src 'none'; font-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'";
  return [
    "<!doctype html>",
    '<html lang="zh-CN" data-theme="light" data-device="desktop">',
    '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
    '<meta http-equiv="Content-Security-Policy" content="' + escapeHtml(policy) + '">',
    '<meta name="description" content="' + escapeHtml(subtitle) + '">',
    '<meta name="color-scheme" content="light dark">',
    "<title>组件图鉴 · XINGYU Components</title>",
    '<link rel="stylesheet" href="./gallery.css">',
    '<script type="module" src="./gallery.js"></script>',
    "</head>",
    "<body>",
    '<header class="site-header"><div class="site-header-inner">',
    '<a href="#top" class="brand" aria-label="XINGYU Components 返回顶部">',
    '<span class="brand-emblem" aria-hidden="true">✳</span>',
    '<span class="brand-wordmark">XINGYU <small>COMPONENTS</small></span></a>',
    '<div class="header-right"><span class="header-status"><span aria-hidden="true"></span> v0.0 · EXPERIMENTAL</span>',
    '<a class="header-link" href="' + repositoryUrl + '" target="_blank" rel="noopener noreferrer">',
    'GitHub <span aria-hidden="true">↗</span></a></div></div></header>',
    '<main id="top" class="site-main">',
    '<section class="hero" aria-labelledby="page-title"><div class="hero-copy">',
    '<span class="eyebrow"><span class="eyebrow-line" aria-hidden="true"></span> EXPLORE THE LANGUAGE OF CONTENT</span>',
    '<h1 id="page-title">为内容寻找<span>恰好的形式。</span></h1>',
    '<p class="hero-intro">' + escapeHtml(subtitle) + "</p>",
    '<div class="hero-links"><a href="#gallery" class="primary-link">浏览全部组件 <span aria-hidden="true">↘</span></a>',
    '<a class="secondary-link" href="./capabilities.json" download>查看能力清单 <span aria-hidden="true">↗</span></a></div>',
    '</div><div class="hero-aside" aria-label="组件库概览">',
    '<div class="hero-aside-label">THE BUILDING BLOCKS</div>',
    '<strong class="hero-count">' + total + '<span aria-hidden="true">/</span></strong>',
    '<p>独立的组件原语</p><div class="hero-aside-divider"></div>',
    '<div class="hero-aside-foot"><span>04 种内容类别</span><span>01 个统一协议</span></div>',
    '</div></section>',
    '<section class="manifest-note" aria-label="组件使用原则"><span class="manifest-marker" aria-hidden="true">✦</span>',
    '<p><strong>不是另一套 AI 编排器。</strong> 这里只展示实际实现的组件。每张预览都由同一个 React 渲染器生成，示例数据不代表真实用户记录。</p>',
    '</section>',
    '<section id="gallery" class="gallery-section" aria-label="全部组件">',
    '<div class="gallery-intro"><div><span class="eyebrow">COMPONENT ATLAS</span>',
    '<h2>组件图鉴 <span> / ' + total + "</span></h2></div>",
    '<p>试试切换尺寸、主题，再展开 JSON。<br>所有示例都基于同一份受校验的数据格式。</p></div>',
    '<div class="gallery-toolbar"><div class="filter-group" role="group" aria-label="按组件类别筛选">' + filters + "</div>",
    '<div class="toolbar-bottom"><label class="search-field"><span aria-hidden="true">⌕</span>',
    '<span class="visually-hidden">搜索组件名称、类别和介绍</span>',
    '<input id="gallery-search" type="search" placeholder="搜索组件名称或用途…" autocomplete="off"></label>',
    '<div class="preview-toggles"><div class="segmented" role="group" aria-label="预览主题">',
    '<button type="button" data-theme-option="light" aria-pressed="true" class="is-active">☀ 浅色</button>',
    '<button type="button" data-theme-option="dark" aria-pressed="false">☾ 深色</button></div>',
    '<div class="segmented" role="group" aria-label="预览设备">',
    '<button type="button" data-device-option="desktop" aria-pressed="true" class="is-active">▣ 桌面</button>',
    '<button type="button" data-device-option="phone" aria-pressed="false">▯ 手机 360px</button>',
    "</div></div></div></div>",
    '<div class="results-meta"><span id="result-count" aria-live="polite">显示 ' + total + " / " + total + ' 种组件</span>',
    '<span>所有组件均为 <b>READ ONLY</b></span></div>',
    '<div class="component-grid" id="component-grid">' + items.map(renderCard).join("") + "</div>",
    '<div class="empty-state" id="empty-state" hidden><span aria-hidden="true">⌕</span>',
    '<h3>没有找到匹配的组件</h3><p>换个名称或类别试试。</p>',
    '<button type="button" id="reset-filters">查看全部组件</button></div>',
    "</section></main>",
    '<footer class="site-footer"><div class="footer-inner"><div>',
    '<strong>✳ XINGYU COMPONENTS</strong><p>Think freely. Render safely.</p></div>',
    '<div class="footer-right"><a href="' + repositoryUrl + '" target="_blank" rel="noopener noreferrer">源代码 ↗</a>',
    '<span>Designed for long-form reading, not dashboards.</span></div></div></footer>',
    "</body></html>",
  ].join("\n");
}

async function build() {
  const manifest = createCapabilityManifest();
  const definitions = manifest.components;
  if (definitions.length !== 19) throw new Error("Gallery expects the current 19 approved components");
  const expected = new Set(definitions.map((entry) => entry.type));
  const actual = Object.keys(gallerySpecimens);
  if (actual.length !== expected.size || actual.some((type) => !expected.has(type)))
    throw new Error("Gallery fixtures must match the registered component manifest exactly");
  await rm(output, { recursive: true, force: true });
  await mkdir(join(output, "preview"), { recursive: true });

  const items = [];
  for (const definition of definitions) {
    const { type, label, category, description } = definition;
    if (!/^[a-z][a-z0-9_-]*$/.test(type) || !galleryCategoryLabels[category])
      throw new Error("Invalid gallery type/category: " + type);
    const source = createSource(gallerySpecimens[type]);
    const parsed = parseDocument(source);
    if (!parsed.ok || parsed.document.blocks.length !== 1 || parsed.document.blocks[0].type !== type)
      throw new Error("Invalid gallery fixture for registered type: " + type);
    const markup = renderToStaticMarkup(createElement(DocumentRenderer, { source }));
    if (!markup.includes("xyc-document")) throw new Error("Real React renderer missing: " + type);
    await writeFile(join(output, "preview", type + ".html"), renderFrame(label, markup));
    items.push({ type, label, category, description, source });
  }
  await Promise.all([
    writeFile(join(output, "index.html"), renderIndex(items)),
    writeFile(join(output, "capabilities.json"), JSON.stringify(manifest, null, 2) + "\n"),
    writeFile(join(output, "examples.json"), JSON.stringify(Object.fromEntries(items.map((item) => [item.type, JSON.parse(item.source)])), null, 2) + "\n"),
    writeFile(join(output, ".nojekyll"), ""),
    copyFile(join(root, "src/styles.css"), join(output, "components.css")),
    copyFile(join(root, "gallery/gallery.css"), join(output, "gallery.css")),
    copyFile(join(root, "gallery/frame.css"), join(output, "frame.css")),
    copyFile(join(root, "gallery/gallery.js"), join(output, "gallery.js")),
  ]);
  process.stdout.write("Gallery generated: " + items.length + " real React previews at " + output + "\n");
}

await build();
