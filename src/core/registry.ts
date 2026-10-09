import { builtInDefinitions } from "./builtins.js";
import type {
  CapabilityManifest, ComponentDefinition, ComponentRegistry, DocumentBlock,
  ObjectSchema, ParseResult, ValueSchema, XingyuDocument,
} from "./types.js";

export const MAX_SOURCE_CHARACTERS = 120_000;
export const MAX_BLOCKS = 128;
export const MAX_DEPTH = 8;
export const MAX_CHILDREN = 16;
const TYPE_PATTERN = /^[a-z][a-z0-9_-]{0,47}$/;

function isPlainRecord(input: unknown): input is Record<string, unknown> {
  return input !== null && typeof input === "object" && !Array.isArray(input)
    && (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null);
}

function hasOnlyKeys(input: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(input).every((key) => allowed.includes(key));
}

function validValue(value: unknown, schema: ValueSchema, depth = 0): boolean {
  if (depth > MAX_DEPTH) return false;
  if (schema.type === "string") {
    return typeof value === "string"
      && value.length >= (schema.minLength ?? 0)
      && value.length <= schema.maxLength
      && (!schema.enum || schema.enum.includes(value));
  }
  if (schema.type === "number" || schema.type === "integer") {
    return typeof value === "number" && Number.isFinite(value)
      && (schema.type !== "integer" || Number.isSafeInteger(value))
      && value >= schema.minimum && value <= schema.maximum;
  }
  if (schema.type === "boolean") return typeof value === "boolean";
  if (schema.type === "array") {
    return Array.isArray(value) && value.length >= schema.minItems && value.length <= schema.maxItems
      && value.every((item) => validValue(item, schema.items, depth + 1));
  }
  if (schema.type !== "object" || !isPlainRecord(value) || schema.additionalProperties !== false) return false;
  if (schema.required.some((key) => !Object.hasOwn(value, key))) return false;
  if (!hasOnlyKeys(value, Object.keys(schema.properties))) return false;
  if (!Object.entries(value).every(([key, item]) => {
    const propertySchema = schema.properties[key];
    return propertySchema !== undefined && validValue(item, propertySchema, depth + 1);
  })) return false;
  return (schema.arrayLengthsMatch ?? []).every(({ collection, nestedField, comparison }) => {
    const rows = value[collection];
    const headers = value[comparison];
    return Array.isArray(rows) && Array.isArray(headers)
      && rows.every((row) => isPlainRecord(row) && Array.isArray(row[nestedField])
        && row[nestedField].length === headers.length);
  });
}

function validProps(value: unknown, schema: ObjectSchema): value is Record<string, unknown> {
  return validValue(value, schema);
}

export function createRegistry(definitions: readonly ComponentDefinition[] = []): ComponentRegistry {
  const entries = new Map<string, ComponentDefinition>();
  const registry: ComponentRegistry = {
    register(definition) {
      if (!TYPE_PATTERN.test(definition.type) || definition.version !== 1)
        throw new Error("Invalid component type or version");
      if (entries.has(definition.type)) throw new Error("Duplicate component type: " + definition.type);
      if (definition.propsSchema.type !== "object" || definition.propsSchema.additionalProperties !== false)
        throw new Error("Component props must use a closed object schema");
      entries.set(definition.type, definition);
    },
    get(type) { return entries.get(type); },
    list() { return [...entries.values()]; },
  };
  for (const definition of definitions) registry.register(definition);
  return registry;
}

export const defaultRegistry = createRegistry(builtInDefinitions);

function validBlock(value: unknown, registry: ComponentRegistry, budget: { nodes: number }, depth: number): value is DocumentBlock {
  if (depth > MAX_DEPTH || !isPlainRecord(value)) return false;
  const { type, version, props, children } = value;
  if (typeof type !== "string" || version !== 1) return false;
  const definition = registry.get(type);
  if (!definition || !validProps(props, definition.propsSchema)) return false;
  if (++budget.nodes > MAX_BLOCKS) return false;
  if (definition.children === "none") {
    return hasOnlyKeys(value, ["type", "version", "props"]) && children === undefined;
  }
  if (!hasOnlyKeys(value, ["type", "version", "props", "children"])
      || !Array.isArray(children) || children.length < 1 || children.length > MAX_CHILDREN) return false;
  return children.every((child) => validBlock(child, registry, budget, depth + 1));
}

function validDocument(value: unknown, registry: ComponentRegistry): value is XingyuDocument {
  if (!isPlainRecord(value) || !hasOnlyKeys(value, ["version", "blocks"]) || value.version !== 1)
    return false;
  if (!Array.isArray(value.blocks) || value.blocks.length < 1 || value.blocks.length > MAX_BLOCKS)
    return false;
  const budget = { nodes: 0 };
  return value.blocks.every((block) => validBlock(block, registry, budget, 1));
}

/** Source is never normalized or rewritten. On any failure, callers can display the original text. */
export function parseDocument(source: string, registry: ComponentRegistry = defaultRegistry): ParseResult {
  if (typeof source !== "string") return { ok: false, source: String(source), reason: "invalid-json" };
  if (source.length > MAX_SOURCE_CHARACTERS) return { ok: false, source, reason: "too-large" };
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch {
    return { ok: false, source, reason: "invalid-json" };
  }
  if (!validDocument(value, registry)) return { ok: false, source, reason: "unsupported-document" };
  return { ok: true, document: value };
}

/** Machine-readable capability resource: pass to any trusted agent/MCP endpoint as plain data. */
export function createCapabilityManifest(registry: ComponentRegistry = defaultRegistry): CapabilityManifest {
  return {
    protocol: "xingyu-document",
    version: 1,
    contentModel: "render-only",
    constraints: {
      maxSourceCharacters: MAX_SOURCE_CHARACTERS,
      maxBlocks: MAX_BLOCKS,
      maxDepth: MAX_DEPTH,
    },
    components: registry.list().map(({ type, version, label, description, category, propsSchema, children }) => ({
      type, version, label, description, category, propsSchema, children,
    })),
    authoringGuidance: [
      "The agent chooses when a component is useful. Use regular Markdown for normal prose.",
      "Only use the advertised type/version and exact props schema; do not add unknown fields.",
      "Never invent metrics, sources, dates, task states, or user data.",
      "Components are read-only render data, not commands, HTML, code execution or network fetches.",
      "Keep persisted source and fall back to escaped original text on invalid/unknown components.",
    ],
  };
}

export function createMcpCapabilityText(registry: ComponentRegistry = defaultRegistry): string {
  return JSON.stringify(createCapabilityManifest(registry), null, 2);
}
