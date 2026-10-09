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

const integer = (minimum: number, maximum: number): ValueSchema =>
  ({ type: "integer", minimum, maximum });

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

const listItems = array(text(300), 1, 30);
const timelineItems = array(object({
  label: text(80), title: text(160), detail: text(600),
}, ["label", "title"]), 1, 30);
const stepsItems = array(object({
  title: text(140), body: text(1000), code: text(800),
}, ["title", "body"]), 1, 24);
const valueItems = array(object({
  label: text(100), value: text(500),
}, ["label", "value"]), 1, 24);
const chartItems = array(object({
  label: text(70), value: number(0, 1_000_000_000),
}, ["label", "value"]), 2, 16);

export const extendedDefinitions: readonly ComponentDefinition[] = [
  {
    type: "heading", version: 1, label: "小标题", category: "content",
    description: "Structured heading of level 2, 3 or 4; ordinary article prose remains Markdown.",
    propsSchema: object({ text: text(160), level: integer(2, 4) }, ["text", "level"]),
    children: "none",
  },
  {
    type: "quote", version: 1, label: "引用", category: "content",
    description: "A plain-text quotation with optional attribution, never executable HTML.",
    propsSchema: object({ text: text(2000), attribution: text(160) }, ["text"]),
    children: "none",
  },
  {
    type: "badge", version: 1, label: "状态标签", category: "content",
    description: "A short neutral/info/success/warning label; does not claim real-time status.",
    propsSchema: object({
      label: text(60), tone: enumText("neutral", "info", "success", "warning"),
    }, ["label", "tone"]),
    children: "none",
  },
  {
    type: "bullet_list", version: 1, label: "无序列表", category: "content",
    description: "An accessible bullet list of short plain-text entries.",
    propsSchema: object({ items: listItems }, ["items"]),
    children: "none",
  },
  {
    type: "numbered_list", version: 1, label: "有序列表", category: "content",
    description: "An accessible numbered list with stable author-provided order.",
    propsSchema: object({ items: listItems }, ["items"]),
    children: "none",
  },
  {
    type: "key_value", version: 1, label: "属性清单", category: "data",
    description: "An accessible definition list of supplied label/value pairs.",
    propsSchema: object({ title: text(150), items: valueItems }, ["items"]),
    children: "none",
  },
  {
    type: "table", version: 1, label: "数据表格", category: "data",
    description: "Responsive data table. Each row must have exactly one cell per declared column.",
    propsSchema: object({
      title: text(150),
      columns: array(text(120), 2, 6),
      rows: array(object({
        cells: array(text(450, 0), 2, 6),
      }, ["cells"]), 1, 24),
    }, ["columns", "rows"], [
      { collection: "rows", nestedField: "cells", comparison: "columns" },
    ]),
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
    type: "steps", version: 1, label: "分步说明", category: "content",
    description: "Ordered instructions with optional plain-text code examples that are never executed.",
    propsSchema: object({ title: text(150), items: stepsItems }, ["items"]),
    children: "none",
  },
  {
    type: "comparison", version: 1, label: "双列对比", category: "data",
    description: "Compare two named options across supplied dimensions, with no hidden rankings.",
    propsSchema: object({
      title: text(150), left: text(100), right: text(100),
      rows: array(object({
        dimension: text(120), left: text(350), right: text(350),
      }, ["dimension", "left", "right"]), 1, 20),
    }, ["left", "right", "rows"]),
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
