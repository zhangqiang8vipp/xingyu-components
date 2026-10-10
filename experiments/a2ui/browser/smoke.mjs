/**
 * Actual browser proof. No mock DOM or screenshots substituted for SDK output.
 * Uses Vite's built preview and the official A2uiSurface in Chromium.
 */
import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {chromium} from "@playwright/test";
import {preview} from "vite";

const server = await preview({preview: {host: "127.0.0.1", port: 4173, strictPort: true}});
let browser;
try {
  browser = await chromium.launch({headless: true});
  const page = await browser.newPage({viewport: {width: 1024, height: 768}});
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("http://127.0.0.1:4173/", {waitUntil: "networkidle"});
  // Collect an explicit failure artifact if the official renderer does not
  // resolve data bindings or crashes. Do not treat protocol processing alone
  // as evidence of visible UI.
  try {
    await page.getByText("Watch ACTIVE · 示例状态").waitFor({state: "visible", timeout: 12000});
  } catch (error) {
    console.error("A2UI BROWSER FAILURE:", error instanceof Error ? error.message : String(error));
    console.error("UNCUGHT PAGE ERRORS:", JSON.stringify(errors));
    console.error("PILOT PREVIEW TEXT:", (await page.locator(".pilot-preview").innerText()).slice(0, 3000));
    console.error("PILOT PREVIEW HTML:", (await page.locator(".pilot-preview").innerHTML()).slice(0, 6000));
    await mkdir("screenshots", {recursive: true});
    await page.screenshot({path: "screenshots/a2ui-pilot-failure.png", fullPage: true});
    throw error;
  }

  assert.equal(await page.title(), "XINGYU | A2UI 官方渲染器验证");
  await page.getByText("Watch ACTIVE · 示例状态").waitFor({state: "visible", timeout: 15000});
  assert.equal(await page.locator(".pilot-error").count(), 0);
  console.log("A2UI status: rendered by official React surface");

  await page.getByRole("button", {name: "数值对比"}).click();
  await page.getByText("精简前", {exact: true}).waitFor({state: "visible", timeout: 15000});
  await page.getByText("40", {exact: true}).waitFor({state: "visible"});
  await page.getByText("24", {exact: true}).waitFor({state: "visible"});
  await page.getByText("16", {exact: true}).waitFor({state: "visible"});
  console.log("A2UI metric transition: rendered by official React surface");

  await page.getByRole("button", {name: "轻提示说明"}).click();
  await page.getByText("需人工复核", {exact: true}).waitFor({state: "visible", timeout: 15000});
  console.log("A2UI note: rendered by official React surface");

  await page.setViewportSize({width: 360, height: 740});
  await page.getByRole("button", {name: "轻量状态"}).click();
  await page.getByText("Watch ACTIVE · 示例状态").waitFor({state: "visible"});
  assert.ok((await page.locator("body").evaluate(el => el.scrollWidth)) <= 360,
    "Demo must not create page-wide horizontal overflow at 360px");

  await mkdir("screenshots", {recursive: true});
  await page.screenshot({path: "screenshots/a2ui-pilot-360.png", fullPage: true});
  assert.deepEqual(errors, [], "uncaught errors in actual A2UI React browser renderer");
  console.log("A2UI 360px Chromium visual smoke: passed");
} finally {
  await browser?.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
