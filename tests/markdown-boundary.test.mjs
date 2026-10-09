import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { builtInDefinitions, createCapabilityManifest, parseDocument } from "../dist/core/index.js";
import { builtInRenderers, DocumentRenderer } from "../dist/react/index.js";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

const obsolete=[
  "text","heading","quote","bullet_list","numbered_list",
  "code_block","divider","table","checklist","sources",
  "tree_view","key_value","comparison","steps","flowchart","disclosure",
];

test("native Markdown and overlapping list/table components never appear in the 26-component capability registry",()=>{
  const registered=builtInDefinitions.map(x=>x.type);
  const manifest=createCapabilityManifest();
  assert.equal(registered.length, 26);
  assert.deepEqual(manifest.components.map(x=>x.type),registered);
  for(const name of obsolete){
    assert.ok(!registered.includes(name), "Markdown is the host's responsibility: "+name);
    assert.equal(Object.hasOwn(builtInRenderers,name),false,"Renderer must not retain: "+name);
  }
});
test("obsolete authored blocks fail closed instead of running or silently converting user prose",()=>{
  for(const type of obsolete){
    const raw=JSON.stringify({version:1,blocks:[{type,version:1,props:{text:"<script>alert(1)</script>"}}]});
    const parsed=parseDocument(raw);
    assert.equal(parsed.ok,false,type+" should be rejected");
    assert.equal(parsed.source,raw);
    const html=renderToStaticMarkup(createElement(DocumentRenderer,{source:raw}));
    assert.match(html,/xyc-fallback/);
    assert.match(html,/&lt;script&gt;/);
    assert.ok(!html.includes("<script>"));
  }
});
test("authoring guidance and docs explicitly choose Markdown for normal prose",()=>{
  const guidance=createCapabilityManifest().authoringGuidance.join(" ");
  const policy=readFileSync(new URL("../docs/markdown-boundary.md",import.meta.url),"utf8");
  assert.match(guidance,/Markdown/);
  assert.match(policy,/Markdown/);
  for(const type of obsolete)assert.ok(policy.includes(type),"missing documented removed type "+type);
});
