import test from "node:test";
import assert from "node:assert/strict";
import {createParserConfig} from "../src/adapter.mjs";

test("registers a xingyu fence without a Markdown parser",()=>{
 const r={mount(){},update(){},unmount(){}};
 const c=createParserConfig(r);
 assert.equal(c.lang,"xingyu");
 assert.equal(c.mappingLang,"json");
 assert.equal(c.destroyWhenUpdate,false);
 assert.equal(c.renderStyleGetter().height,"auto");
});
test("mount, update, remount on DOM replacement, unmount",()=>{
 const calls=[];
 const r={
   mount(n,s){calls.push(["mount",n,s]);return {node:n};},
   update(i,s){calls.push(["update",i.node,s]);},
   unmount(i){calls.push(["unmount",i.node]);}
 };
 const c=createParserConfig(r),a={},b={};
 let state=c.createFunc([a],"one");
 state=c.updateFunc([a],"two",state);
 state=c.updateFunc([b],"three",state);
 c.destroyFunc(state);
 assert.deepEqual(calls.map(c=>c[0]),["mount","update","unmount","mount","unmount"]);
});
test("rejects missing hooks and missing container",()=>{
 assert.throws(()=>createParserConfig({}),TypeError);
 const c=createParserConfig({mount(){},update(){},unmount(){}});
 assert.throws(()=>c.createFunc([],"{}"),/Missing/);
});
