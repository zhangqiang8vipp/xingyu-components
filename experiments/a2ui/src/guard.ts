/**
 * Experiment boundary. A2UI is a protocol, not permission to run untrusted UI.
 * Only five read-only basic-catalog primitives are allowed in this pilot.
 * Unknown message types/props, custom svgPath, URL, event/action and inputs
 * fail closed before any MessageProcessor receives the stream.
 */
export const MAX_PILOT_SOURCE = 24_000;
export const MAX_PILOT_NODES = 40;
export const PILOT_VERSION = "v0.9.1"; // Attempt actual current-production wire version.
export const PILOT_SURFACE = "xingyu_pilot";

type Rec = Record<string, unknown>;
const record = (value: unknown): value is Rec =>
  value !== null && typeof value === "object" && !Array.isArray(value)
  && Object.getPrototypeOf(value) === Object.prototype;
const keysOnly = (value: Rec, allowed: readonly string[]) =>
  Object.keys(value).every(key => allowed.includes(key));
const required = (value: Rec, requiredKeys: readonly string[]) =>
  requiredKeys.every(key => Object.hasOwn(value, key));
const stableId = (value: unknown): value is string =>
  typeof value === "string" && /^[a-z][a-z0-9_]{0,47}$/.test(value);
const safeText = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= 240
  && !/[<>\u0000-\u001f]/.test(value)
  && !/(?:https?:\/\/|javascript:|data:|\]\()/i.test(value);
const refs = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length >= 1 && value.length <= 16 && value.every(stableId);
const rowAlign = ["start", "center", "end", "stretch"];
const rowJustify = ["start", "center", "end", "spaceAround", "spaceBetween", "spaceEvenly", "stretch"];
const textVariants = ["h1", "h2", "h3", "h4", "h5", "caption", "body"];
const trustedIcons = ["check", "info", "warning", "error", "refresh"];

function validateNode(node: unknown): asserts node is Rec {
  if (!record(node) || !stableId(node.id) || typeof node.component !== "string") throw new Error("Invalid A2UI node");
  switch (node.component) {
    case "Row":
    case "Column":
      if (!keysOnly(node, ["id", "component", "children", "justify", "align"])
        || !refs(node.children)
        || (node.justify !== undefined && !rowJustify.includes(String(node.justify)))
        || (node.align !== undefined && !rowAlign.includes(String(node.align)))) throw new Error("Unsafe A2UI layout");
      return;
    case "Card":
      if (!keysOnly(node, ["id", "component", "child"]) || !stableId(node.child)) throw new Error("Unsafe A2UI card");
      return;
    case "Text": {
      const text = node.text;
      const validText = safeText(text) || (record(text) && keysOnly(text, ["path"]) &&
        typeof text.path === "string" && /^\/[a-z][a-z0-9_]{0,47}$/.test(text.path));
      if (!keysOnly(node, ["id", "component", "text", "variant"]) || !validText
        || (node.variant !== undefined && !textVariants.includes(String(node.variant))))
        throw new Error("Unsafe A2UI text");
      return;
    }
    case "Icon":
      if (!keysOnly(node, ["id", "component", "name"]) || !trustedIcons.includes(String(node.name)))
        throw new Error("Unsafe A2UI icon");
      return;
    default:
      throw new Error("A2UI node outside pilot allowlist");
  }
}

/**
 * For the pilot only: exactly one createSurface, one updateComponents and one
 * whole-surface updateDataModel. This is stricter than the actual A2UI protocol.
 * Do not confuse this gate with a general-purpose A2UI stream validator.
 */
export function assertReadOnlyPilot(messages: unknown, expectedCatalogId: string): asserts messages is Rec[] {
  if (!Array.isArray(messages) || messages.length !== 3
    || JSON.stringify(messages).length > MAX_PILOT_SOURCE || !safeText(expectedCatalogId.replace(/^https:\/\//, "")))
    throw new Error("Invalid pilot stream size or catalog");
  const [create, update, data] = messages;
  const envelopes = [create, update, data];
  if (envelopes.some(message => !record(message) || message.version !== PILOT_VERSION
    || !keysOnly(message, ["version", "createSurface", "updateComponents", "updateDataModel"])
    || Object.keys(message).length !== 2))
    throw new Error("Unsupported A2UI envelope/version");
  if (!record(create.createSurface) || !keysOnly(create.createSurface, ["surfaceId", "catalogId", "sendDataModel"])
    || create.createSurface.surfaceId !== PILOT_SURFACE
    || create.createSurface.catalogId !== expectedCatalogId
    || create.createSurface.sendDataModel !== false) throw new Error("Untrusted A2UI surface/catalog");
  if (!record(update.updateComponents) || !keysOnly(update.updateComponents, ["surfaceId", "components"])
    || update.updateComponents.surfaceId !== PILOT_SURFACE
    || !Array.isArray(update.updateComponents.components)
    || update.updateComponents.components.length < 1
    || update.updateComponents.components.length > MAX_PILOT_NODES)
    throw new Error("Invalid A2UI component update");

  const graph = new Map<string, string[]>();
  const boundPaths = new Set<string>();
  for (const item of update.updateComponents.components) {
    validateNode(item);
    if (graph.has(item.id as string)) throw new Error("Duplicate A2UI node id");
    const children = Array.isArray(item.children) ? item.children : typeof item.child === "string" ? [item.child] : [];
    graph.set(item.id as string, children as string[]);
    if (item.component === "Text" && record(item.text)) boundPaths.add(item.text.path as string);
  }
  if (!graph.has("root")) throw new Error("Missing root");
  const visited = new Set<string>();
  const pending = new Set<string>();
  function visit(id: string) {
    if (!graph.has(id)) throw new Error("Missing referenced node");
    if (pending.has(id)) throw new Error("Cyclic UI");
    if (visited.has(id)) throw new Error("Shared node not supported in pilot");
    pending.add(id);
    for (const child of graph.get(id) ?? []) visit(child);
    pending.delete(id);
    visited.add(id);
  }
  visit("root");
  if (visited.size !== graph.size) throw new Error("Unreachable A2UI component");

  if (!record(data.updateDataModel) || !keysOnly(data.updateDataModel, ["surfaceId", "path", "value"])
    || data.updateDataModel.surfaceId !== PILOT_SURFACE
    || data.updateDataModel.path !== "/"
    || !record(data.updateDataModel.value)) throw new Error("Invalid read-only data model");
  const values = data.updateDataModel.value;
  if (Object.keys(values).length > 24 || Object.entries(values).some(([key, value]) =>
    !/^[a-z][a-z0-9_]{0,47}$/.test(key) || !safeText(value)))
    throw new Error("Invalid data model field");
  if ([...boundPaths].some(path => !Object.hasOwn(values, path.slice(1))))
    throw new Error("Unresolved A2UI text binding");
}
