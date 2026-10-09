/**
 * General-purpose, read-only document primitives.
 * No site business schemas or model-specific orchestration.
 *
 * Values are bounded and described through one typed registry so the
 * MCP capability manifest is generated from the same contract as parsing.
 */
import type { ComponentDefinition, ObjectSchema, ValueSchema } from "./types.js";

const text = (maxLength: number, minLength = 1): ValueSchema =>
  ({ type: "string", minLength, maxLength });

const enumText = (...values: string[]): ValueSchema =>
  ({ type: "string", maxLength: 30, enum: values });

const number = (minimum: number, maximum: number): ValueSchema =>
  ({ type: "number", minimum, maximum });

const array = (items: ValueSchema, minItems: number, maxItems: number): ValueSchema =>
  ({ type: "array", items, minItems, maxItems });

const object = (
  properties: Record<string, ValueSchema>,
  required: readonly string[],
  arrayLengthsMatch?: ObjectSchema["arrayLengthsMatch"],
): ObjectSchema => ({
  type: "object", properties, required, additionalProperties: false,
  ...(arrayLengthsMatch ? { arrayLengthsMatch } : {}),
});

const timelineItems = array(object({
  label: text(80), title: text(160), detail: text(600),
}, ["label", "title"]), 1, 30);
const chartItems = array(object({
  label: text(70), value: number(0, 1_000_000_000),
}, ["label", "value"]), 2, 16);

export const extendedDefinitions: readonly ComponentDefinition[] = [
  {
    type: "badge", version: 1, label: "状态标签", category: "content",
    description: "A short neutral/info/success/warning label; does not claim real-time status.",
    propsSchema: object({
      label: text(60), tone: enumText("neutral", "info", "success", "warning"),
    }, ["label", "tone"]),
    children: "none",
  },
  {
    type: "progress", version: 1, label: "进度条", category: "data",
    description: "Factual progress from 0 to 100, with an optional explanatory note.",
    propsSchema: object({
      label: text(120), value: number(0, 100), note: text(240),
    }, ["label", "value"]),
    children: "none",
  },
  {
    type: "timeline", version: 1, label: "时间线", category: "data",
    description: "A chronological or staged list. Labels stay exactly as authored; no inferred dates.",
    propsSchema: object({ title: text(150), items: timelineItems }, ["items"]),
    children: "none",
  },
  {
    type: "bar_chart", version: 1, label: "条形图", category: "data",
    description: "Dependency-free static SVG bar chart with an accessible raw-data table; non-negative verified numbers only.",
    propsSchema: object({
      title: text(150), unit: text(30), items: chartItems,
    }, ["title", "items"]),
    children: "none",
  },
];
