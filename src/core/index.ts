export {
  MAX_BLOCKS, MAX_CHILDREN, MAX_DEPTH, MAX_SOURCE_CHARACTERS,
  createRegistry, defaultRegistry, parseDocument,
  createCapabilityManifest, createMcpCapabilityText,
} from "./registry.js";
export { builtInDefinitions } from "./builtins.js";
export type {
  ValueSchema, ObjectSchema, ComponentCategory, ComponentDefinition,
  ComponentRegistry, DocumentBlock, XingyuDocument, CapabilityManifest, ParseResult,
} from "./types.js";
