import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { builtInDefinitions, createCapabilityManifest, createMcpCapabilityText, parseDocument } from "../dist/core/index.js";
import { DocumentRenderer } from "../dist/react/index.js";

const b=(type,props)=>({type,version:1,props});
const doc=blocks=>JSON.stringify({version:1,blocks});
const parsed=block=>parseDocument(doc([block]));
const html=blocks=>renderToStaticMarkup(createElement(DocumentRenderer,{source:doc(blocks)}));
const valid=[
  b("accordion",{title:"FAQ",items:[{question:"Why?",answer:"Readability."},{question:"How?",answer:"With data."}]}),
  b("status_list",{items:[{text:"Build",status:"done"},{text:"Review",status:"active"},{text:"Hold",status:"blocked"}]}),
  b("line_chart",{title:"Trend",items:[{label:"Start",value:0},{label:"Finish",value:9.5}]}),
  b("pie_chart",{title:"Shares",items:[{label:"A",value:0},{label:"B",value:7}]}),
  b("pros_cons",{pros:["Benefit"],cons:["Risk","Cost"]}),
  b("glossary",{items:[{term:"Doc",definition:"A readable collection."}]}),
  b("tag_list",{label:"Categories",tags:["AI","Docs","React"]}),
];
const types=["accordion","status_list","line_chart","pie_chart","pros_cons","glossary","tag_list"];

test("remaining editorial and chart components follow one bounded v1 manifest",()=>{
  assert.equal(builtInDefinitions.length, 26);
  const manifest=createCapabilityManifest();
  assert.deepEqual(JSON.parse(createMcpCapabilityText()),manifest);
  for(const block of valid){const spec=manifest.components.find(x=>x.type===block.type);
    assert.ok(spec && spec.version===1 && spec.children==="none",block.type);
    assert.equal(parsed(block).ok,true,block.type);}
  assert.deepEqual(manifest.components.filter(x=>types.includes(x.type)).map(x=>x.type),types);
  const pie=manifest.components.find(x=>x.type==="pie_chart");
  assert.equal(pie.propsSchema.properties.items.positiveSumField,"value");
});
test("native accordion, chart SVG/tables, statuses, glossary and tags SSR without writes",()=>{
  const out=html(valid);
  for(const pattern of [/<details/,/<summary>Why\?<\/summary>/,/<svg/,/<table/,/<dl/,/xyc-advanced-pie/,
    /xyc-pros-cons-grid/,/xyc-status-blocked/,/xyc-tag-list/]) assert.match(out,pattern);
  assert.doesNotMatch(out,/xyc-fallback|xyc-unavailable/);
});
test("pie and line charts reject nonfinite, negative and undersized data",()=>{
  const bad=[
    b("pie_chart",{title:"Zero",items:[{label:"A",value:0},{label:"B",value:0}]}),
    b("pie_chart",{title:"Negative",items:[{label:"A",value:-1},{label:"B",value:2}]}),
    b("pie_chart",{title:"Few",items:[{label:"A",value:1}]}),
    b("line_chart",{title:"Few",items:[{label:"A",value:1}]}),
    b("line_chart",{title:"Infinity",items:[{label:"A",value:Infinity},{label:"B",value:1}]}),
    b("line_chart",{title:"String",items:[{label:"A",value:"1"},{label:"B",value:2}]}),
  ];
  for(const block of bad)assert.equal(parsed(block).ok,false,block.type);
  for(const block of valid.filter(x=>x.type.endsWith("_chart"))){
    const markup=html([block]);assert.match(markup,/<th scope="row"/);assert.match(markup,/查看原始数据/);
    assert.match(markup,/role="img"/);}
});
test("strict closed props and typed status/color fields reject unsupported values",()=>{
  const bad=[
    b("accordion",{items:[]}),
    b("accordion",{items:[{question:"Q",answer:"A",onclick:"evil"}]}),
    b("status_list",{items:[{text:"A",status:"invented"}]}),
    b("pros_cons",{pros:["fine"],cons:[]}),
    b("glossary",{items:[{term:"x",definition:123}]}),
    b("tag_list",{tags:[]}),
    b("tag_list",{tags:["x"],onclick:"evil"}),
  ];
  for(const block of bad){const raw=doc([block]);const result=parseDocument(raw);
    assert.equal(result.ok,false,block.type);assert.equal(result.source,raw);}
});
test("malicious-looking labels and questions remain escaped as literal text",()=>{
  const attack='<img src=x onerror="alert(1)"><script>evil()</script>';
  const rendered=html([
    b("accordion",{items:[{question:attack,answer:attack}]}),
    b("status_list",{items:[{text:attack,status:"active",detail:attack}]}),
    b("glossary",{items:[{term:attack,definition:attack}]}),
    b("tag_list",{tags:[attack]}),
  ]);
  assert.match(rendered,/&lt;script&gt;/);
  assert.match(rendered,/&lt;img/);
  assert.doesNotMatch(rendered,/<script>|<img src=x|onClick=/);
});
test("retained editorial blocks compose inside nested stack and grid",()=>{
  const nested={type:"stack",version:1,props:{gap:"sm"},children:[
    valid[0],{type:"grid",version:1,props:{columns:2},children:[valid[1],valid[4],valid[6]]},
    valid[2],valid[3]
  ]};
  assert.equal(parsed(nested).ok,true);
  const out=html([nested]);
  assert.match(out,/xyc-stack/);
  assert.match(out,/xyc-columns-2/);
  assert.match(out,/xyc-advanced-line/);
});
