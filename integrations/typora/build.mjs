import {build} from "esbuild";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";
import {dirname,resolve,join} from "node:path";

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,"../..");
const requireLocal=createRequire(import.meta.url);
const componentEntry=join(root,"dist/react/index.js");
const styles=await readFile(join(root,"src/styles.css"),"utf8");
const hostStyles=`
.md-fences .plugin-xingyu-content { box-sizing:border-box; min-width:0; width:100%; overflow-x:auto; padding:8px 2px; }
.md-fences .plugin-xingyu-content .xyc-document {
--xyc-ink:var(--text-color,#1d1d1f);
--xyc-surface:var(--bg-color,#fff);
--xyc-soft:var(--item-hover-bg-color,#f5f5f7);
--xyc-accent:var(--primary-color,#2563eb);
}
`;
await mkdir(join(here,"dist"),{recursive:true});
await build({
 entryPoints:[join(here,"src/entry.jsx")],
 outfile:join(here,"dist/xingyu.js"),
 bundle:true,platform:"browser",format:"cjs",target:["chrome84"],minify:true,legalComments:"eof",
 define:{"process.env.NODE_ENV":'"production"',__XINGYU_CSS__:JSON.stringify(styles+hostStyles)},
 plugins:[{name:"xingyu-aliases",setup(ctx){
   ctx.onResolve({filter:/^@xingyu\/components\/react$/},()=>({path:componentEntry}));
   ctx.onResolve({filter:/^(?:react(?:\/.*)?|react-dom(?:\/.*)?)$/},args=>({path:requireLocal.resolve(args.path)}));
 }}]
});
const notices=[];
for (const pkg of ["react","react-dom"]) {
 const folder=dirname(requireLocal.resolve(pkg+"/package.json"));
 notices.push(pkg+" (MIT)\n"+await readFile(join(folder,"LICENSE"),"utf8"));
}
await writeFile(join(here,"dist/THIRD_PARTY_NOTICES.txt"),notices.join("\n\n---\n\n"));
console.log("Generated integrations/typora/dist/xingyu.js");
