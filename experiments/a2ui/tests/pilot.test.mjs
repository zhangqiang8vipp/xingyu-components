import {test} from "node:test";
import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {MessageProcessor} from "@a2ui/web_core/v0_9";
import {basicCatalog} from "@a2ui/web_core/v0_9/basic_catalog";
import {A2uiSurface} from "@a2ui/react/v0_9";
import {assertReadOnlyPilot, PILOT_SURFACE, PILOT_VERSION} from "../src/guard.ts";
import {buildPilotMessages, pilotScenarios} from "../src/presets.ts";

const catalogId = basicCatalog.id;
const clone = value => structuredClone(value);
const messages = () => buildPilotMessages("status", catalogId);

test("official A2UI packages export the v0_9 protocol processor, basic catalog and React surface", () => {
  assert.equal(typeof MessageProcessor, "function");
  assert.equal(typeof A2uiSurface, "function");
  assert.equal(typeof catalogId, "string");
  assert.ok(catalogId.includes("a2ui"));
});

test("standard A2UI catalog builds three different UIs from the same read-only basic primitives", () => {
  assert.equal(pilotScenarios.length, 3);
  for (const {id} of pilotScenarios) {
    const stream = buildPilotMessages(id, catalogId);
    assert.equal(stream.length, 3);
    assert.equal(stream[0].version, PILOT_VERSION);
    assert.equal(stream[0].createSurface.catalogId, catalogId);
    assert.equal(stream[0].createSurface.sendDataModel, false);
    assert.equal(stream[1].updateComponents.surfaceId, PILOT_SURFACE);
    assert.equal(stream[2].updateDataModel.path, "/");
    const names = new Set(stream[1].updateComponents.components.map(v => v.component));
    for (const name of names) assert.ok(["Text", "Row", "Column", "Card", "Icon"].includes(name));
    assert.ok(names.has("Text"));
    assertReadOnlyPilot(stream, catalogId);
  }
});

test("official web_core processes each actual sample stream into a surface", () => {
  for (const {id} of pilotScenarios) {
    const processor = new MessageProcessor([basicCatalog]);
    processor.processMessages(buildPilotMessages(id, catalogId));
    const surface = processor.model.surfacesMap.get(PILOT_SURFACE);
    assert.ok(surface, "official A2UI processor must create the surface for " + id);
    const markup = renderToStaticMarkup(createElement(A2uiSurface, {surface}));
    assert.ok(markup.length > 20, "official A2UI React renderer produced no markup");
    assert.ok(!markup.includes("<script"), "A2UI output must not contain active scripts");
  }
});

test("the 40 to 24 case derives 16 from the real before and after inputs", () => {
  const stream = buildPilotMessages("metrics", catalogId);
  const model = stream[2].updateDataModel.value;
  assert.equal(model.before_value, "40");
  assert.equal(model.after_value, "24");
  assert.equal(model.delta_value, String(Math.abs(Number(model.before_value) - Number(model.after_value))));
  assert.equal(model.delta_value, "16");
  assert.ok(!JSON.stringify(stream).includes("metric_transition"));
  assert.ok(!JSON.stringify(stream).includes("tip"));
});

test("pilot hard-fails unknown catalog, version, action, widget, SVG, URL and oversized content", () => {
  const sample = messages();
  const bad = [
    clone(sample),
    clone(sample),
    clone(sample),
    clone(sample),
    clone(sample),
    clone(sample),
    clone(sample),
    clone(sample),
    clone(sample),
  ];
  bad[0][0].version = "v1.0";
  bad[1][0].createSurface.catalogId = "https://attacker.test/catalog";
  bad[2][1].updateComponents.components[4].name = {svgPath: "M0 0"};
  bad[3][1].updateComponents.components[3].action = {event: {name: "deleteUser"}};
  bad[4][1].updateComponents.components[4].component = "Button";
  bad[5][2].updateDataModel.value.footer = "<img src=x onerror=alert(1)>";
  bad[6][2].updateDataModel.value.footer = "https://attacker.test";
  bad[7][1].updateComponents.components[0].children = ["title", "status_card", "root"];
  bad[8][2].updateDataModel.value.status = "x".repeat(1000);
  for (const b of bad) assert.throws(() => assertReadOnlyPilot(b, catalogId));
});

test("graph gate rejects unknown refs, duplicate ids, unreachable nodes and missing bindings", () => {
  const missing = messages();
  missing[1].updateComponents.components[0].children.push("does_not_exist");
  assert.throws(() => assertReadOnlyPilot(missing, catalogId), /Missing referenced/);
  const duplicate = messages();
  duplicate[1].updateComponents.components.push(clone(duplicate[1].updateComponents.components[2]));
  assert.throws(() => assertReadOnlyPilot(duplicate, catalogId), /Duplicate/);
  const unreachable = messages();
  unreachable[1].updateComponents.components.push({id: "ghost", component: "Text", text: "Hidden"});
  assert.throws(() => assertReadOnlyPilot(unreachable, catalogId), /Unreachable/);
  const unbound = messages();
  delete unbound[2].updateDataModel.value.status;
  assert.throws(() => assertReadOnlyPilot(unbound, catalogId), /Unresolved/);
});
