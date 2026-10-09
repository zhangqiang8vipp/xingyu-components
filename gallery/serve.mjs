/** Tiny dependency-free server for testing the generated static gallery locally. */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../gallery-dist");
const port = Number(process.env.PORT || 4173);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { "Allow": "GET, HEAD" });
    response.end();
    return;
  }
  let pathname;
  try {
    pathname = new URL(request.url || "/", "http://127.0.0.1").pathname;
    pathname = decodeURIComponent(pathname);
  } catch {
    response.writeHead(400);
    response.end();
    return;
  }
  if (pathname === "/") pathname = "/index.html";
  const match = /^\/(?:index\.html|gallery\.(?:css|js)|components\.css|frame\.css|capabilities\.json|examples\.json|preview\/[a-z][a-z0-9_-]*\.html)$/.exec(pathname);
  if (!match) {
    response.writeHead(404);
    response.end();
    return;
  }
  try {
    const data = await readFile(join(root, pathname));
    const ext = pathname.slice(pathname.lastIndexOf("."));
    response.writeHead(200, {
      "Content-Type": mime[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(request.method === "HEAD" ? undefined : data);
  } catch {
    response.writeHead(404);
    response.end();
  }
}).listen(port, "127.0.0.1", () => {
  process.stdout.write("Preview available at http://127.0.0.1:" + port + "/\n");
});
