import { extendedDefinitions } from "./extended.js";
import { advancedDefinitions } from "./advanced.js";
import type { ComponentDefinition, ObjectSchema, ValueSchema } from "./types.js";

const string = (maxLength: number, minLength = 1): ValueSchema =>
  ({ type: "string", minLength, maxLength });

const enumeration = (...choices: string[]): ValueSchema =>
  ({ type: "string", maxLength: 40, enum: choices });

const object = (properties: Record<string, ValueSchema>, required: string[]): ObjectSchema =>
  ({ type: "object", properties, required, additionalProperties: false });

/**
 * Small, general primitives, not a port of XINGYU Web's existing nine document blocks.
 * Validations are driven by these schemas so agent manifests and runtime checks cannot diverge.
 */
export const builtInDefinitions: readonly ComponentDefinition[] = [
  {
    type: "text", version: 1, label: "纯文本", category: "content",
    description: "Display a short plain-text paragraph; Markdown remains the primary format for long articles.",
    propsSchema: object({ text: string(4000) }, ["text"]), children: "none",
  },
  {
    type: "callout", version: 1, label: "提示卡片", category: "content",
    description: "A contextual tip, note, or warning. No HTML or executable content.",
    propsSchema: object({
      title: string(120), body: string(1500), tone: enumeration("info", "success", "warning"),
    }, ["title", "body", "tone"]), children: "none",
  },
  {
    type: "metric", version: 1, label: "指标展示", category: "data",
    description: "A factual label/value/note; the model must not fabricate metrics.",
    propsSchema: object({
      label: string(100), value: string(120), note: string(220),
    }, ["label", "value"]), children: "none",
  },
  {
    type: "stack", version: 1, label: "纵向布局", category: "layout",
    description: "Compose up to sixteen child blocks in a vertical flow.",
    propsSchema: object({ gap: enumeration("sm", "md", "lg") }, []), children: "required",
  },
  {
    type: "grid", version: 1, label: "响应式网格", category: "layout",
    description: "Compose child blocks into two or three responsive columns.",
    propsSchema: object({ columns: { type: "integer", minimum: 2, maximum: 3 } }, ["columns"]),
    children: "required",
  },
  {
    type: "disclosure", version: 1, label: "折叠内容", category: "interaction",
    description: "A local native details/summary interaction, with no network or write effects.",
    propsSchema: object({ summary: string(160), body: string(2000) }, ["summary", "body"]),
    children: "none",
  },
  {
    type: "divider", version: 1, label: "分隔线", category: "layout",
    description: "A subtle thematic visual separator.",
    propsSchema: object({}, []), children: "none",
  },
  ...extendedDefinitions,
  ...advancedDefinitions,
];
