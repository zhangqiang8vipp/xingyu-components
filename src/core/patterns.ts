/**
 * Optional presentation patterns for xingyu-document/v1.
 * This remains a render-only registry: strict closed schemas, no user-defined code.
 * These are compact data expressions, not Markdown parsers or full page templates.
 */
import type { ComponentDefinition, ObjectSchema, ValueSchema } from "./types.js";

const str = (maxLength: number, minLength = 1): ValueSchema =>
  ({ type: "string", minLength, maxLength });
const choice = (...values: string[]): ValueSchema =>
  ({ type: "string", maxLength: 32, enum: values });
const number = (minimum: number, maximum: number): ValueSchema =>
  ({ type: "number", minimum, maximum });
const array = (items: ValueSchema, minItems: number, maxItems: number, positiveSumField?: string): ValueSchema =>
  ({ type: "array", items, minItems, maxItems, ...(positiveSumField ? { positiveSumField } : {}) });
const obj = (
  properties: Record<string, ValueSchema>,
  required: readonly string[],
  arrayLengthsMatch?: ObjectSchema["arrayLengthsMatch"],
): ObjectSchema => ({
  type: "object", properties, required, additionalProperties: false,
  ...(arrayLengthsMatch ? { arrayLengthsMatch } : {}),
});

const heading = str(160);
const description = str(360);
const chartValue = obj({
  label: str(80), value: number(0, 1_000_000_000),
}, ["label", "value"]);

export const patternDefinitions: readonly ComponentDefinition[] = [
  {
    type: "panel", version: 1, label: "内容分组面板", category: "layout",
    description: "Bounded section container with a visible heading and optional summary, composable with approved child blocks.",
    propsSchema: obj({
      title: heading, summary: description,
      tone: choice("neutral", "soft", "accent"),
    }, ["title"]),
    children: "required",
  },
  {
    type: "hero", version: 1, label: "文章主题引言", category: "content",
    description: "Editorial introduction with title and summary. No image requests, custom HTML or automatic actions.",
    propsSchema: obj({
      eyebrow: str(80), title: heading, summary: str(800),
      align: choice("left", "center"),
    }, ["title", "summary"]),
    children: "none",
  },
  {
    type: "link_cards", version: 1, label: "外部资源卡片", category: "content",
    description: "Author-supplied HTTPS links with concise labels and descriptions; navigation is click-only and unverified.",
    propsSchema: obj({
      title: heading,
      items: array(obj({
        label: str(120), url: { type: "https-url", maxLength: 600 }, note: description,
      }, ["label", "url"]), 1, 8),
    }, ["items"]),
    children: "none",
  },
  {
    type: "tree_view", version: 1, label: "层级结构树", category: "data",
    description: "Two-level information hierarchy with limited groups and leaves, without expanding remote data.",
    propsSchema: obj({
      title: heading,
      groups: array(obj({
        label: str(120), children: array(str(180), 1, 8),
      }, ["label", "children"]), 1, 8),
    }, ["groups"]),
    children: "none",
  },
  {
    type: "stacked_bar_chart", version: 1, label: "分段比例条", category: "data",
    description: "Static SVG stacked share bar with a positive total and an accessible raw values table.",
    propsSchema: obj({
      title: heading, unit: str(28),
      items: array(chartValue, 2, 8, "value"),
    }, ["title", "items"]),
    children: "none",
  },
  {
    type: "scatter_chart", version: 1, label: "二维散点图", category: "data",
    description: "Static SVG XY points with finite signed coordinates, axis names and an accessible raw-data table.",
    propsSchema: obj({
      title: heading, xLabel: str(80), yLabel: str(80),
      items: array(obj({
        label: str(80),
        x: number(-1_000_000, 1_000_000), y: number(-1_000_000, 1_000_000),
      }, ["label", "x", "y"]), 2, 18),
    }, ["title", "xLabel", "yLabel", "items"]),
    children: "none",
  },
  {
    type: "heatmap", version: 1, label: "数值热力矩阵", category: "data",
    description: "Bounded 0–100 numeric matrix; cell colors are accompanied by visible values and row/column labels.",
    propsSchema: obj({
      title: heading,
      columns: array(str(70), 2, 8),
      rows: array(obj({
        label: str(70), values: array(number(0, 100), 2, 8),
      }, ["label", "values"]), 2, 12),
    }, ["title", "columns", "rows"], [
      { collection: "rows", nestedField: "values", comparison: "columns" },
    ]),
    children: "none",
  },
  {
    type: "rating_group", version: 1, label: "多维评分组", category: "data",
    description: "Author-entered numeric ratings from 0 to 5 using semantic meters, not inferred rankings.",
    propsSchema: obj({
      title: heading,
      items: array(obj({
        label: str(100), score: number(0, 5), note: description,
      }, ["label", "score"]), 1, 10),
    }, ["title", "items"]),
    children: "none",
  },
  {
    type: "agenda", version: 1, label: "日程安排", category: "data",
    description: "Read-only agenda with author-provided when/title/details; times are displayed verbatim, not parsed or booked.",
    propsSchema: obj({
      title: heading,
      items: array(obj({
        when: str(100), title: str(160), detail: description,
      }, ["when", "title"]), 1, 20),
    }, ["title", "items"]),
    children: "none",
  },
  {
    type: "kanban_board", version: 1, label: "只读看板", category: "data",
    description: "Compact read-only workflow board. Cards cannot be moved, edited or persisted by the renderer.",
    propsSchema: obj({
      title: heading,
      columns: array(obj({
        title: str(100),
        cards: array(obj({ title: str(160), detail: description }, ["title"]), 1, 8),
      }, ["title", "cards"]), 2, 4),
    }, ["title", "columns"]),
    children: "none",
  },
];
