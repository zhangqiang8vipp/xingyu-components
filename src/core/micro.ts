import type { ComponentDefinition, ObjectSchema, ValueSchema } from "./types.js";
const str = (maxLength: number): ValueSchema => ({ type: "string", minLength: 1, maxLength });
const pick = (...choices: string[]): ValueSchema => ({ type: "string", maxLength: 24, enum: choices });
const object = (properties: Record<string, ValueSchema>, required: string[]): ObjectSchema =>
  ({ type: "object", properties, required, additionalProperties: false });
const count: ValueSchema = { type: "integer", minimum: 0, maximum: 1_000_000_000 };
/** These are factual visual patterns, not Markdown or real-time status mechanisms. */
export const microDefinitions: readonly ComponentDefinition[] = [
  {
    type: "tip", version: 1, label: "轻量状态提示", category: "content",
    description: "Author-provided hint or state: pill, inline or note. Does not claim independent verification or live status.",
    propsSchema: object({
      text: str(160), tone: pick("neutral", "info", "success", "warning", "danger"),
      variant: pick("pill", "inline", "note"), detail: str(400),
    }, ["text", "tone"]),
    children: "none",
  },
  {
    type: "metric_transition", version: 1, label: "前后变化指标", category: "data",
    description: "Compact integer before-to-after comparison. Difference is computed from numbers and never taken from an unverified delta prop.",
    propsSchema: object({
      beforeLabel: str(100), before: count,
      afterLabel: str(100), after: count,
      differenceLabel: str(100), unit: str(24), note: str(260),
    }, ["beforeLabel", "before", "afterLabel", "after", "differenceLabel"]),
    children: "none",
  },
];
