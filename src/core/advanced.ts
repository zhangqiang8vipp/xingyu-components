/**
 * Additional editorial / knowledge primitives for xingyu-document v1.
 * All schemas are finite, closed, render-only, and published through the
 * existing registry-derived MCP capability manifest.
 */
import type { ComponentDefinition, ObjectSchema, ValueSchema } from "./types.js";

const str = (maxLength: number, minLength = 1): ValueSchema =>
  ({ type: "string", minLength, maxLength });
const pick = (...values: string[]): ValueSchema =>
  ({ type: "string", maxLength: 32, enum: values });
const array = (items: ValueSchema, minItems: number, maxItems: number, positiveSumField?: string): ValueSchema =>
  ({ type: "array", items, minItems, maxItems, ...(positiveSumField ? { positiveSumField } : {}) });
const obj = (properties: Record<string, ValueSchema>, required: readonly string[]): ObjectSchema =>
  ({ type: "object", properties, required, additionalProperties: false });
const title = str(140);
const chartDatum = obj({
  label: str(70),
  value: { type: "number", minimum: 0, maximum: 1_000_000_000 },
}, ["label", "value"]);
const shortTexts = array(str(240), 1, 16);

/**
 * Design principle: small primitives, not full page templates.
 * "Read-only" means the document cannot trigger writes, automatic requests,
 * code evaluation or AI calls. Native <details> is local presentation only.
 */
export const advancedDefinitions: readonly ComponentDefinition[] = [
  {
    type: "accordion", version: 1, label: "折叠问答组", category: "interaction",
    description: "Multiple keyboard-operable native disclosures, each with a question and plain-text answer.",
    propsSchema: obj({
      title,
      items: array(obj({ question: str(180), answer: str(2000) }, ["question", "answer"]), 1, 12),
    }, ["items"]),
    children: "none",
  },
  {
    type: "checklist", version: 1, label: "只读检查清单", category: "data",
    description: "Author-provided checked or unchecked states; not editable and never persisted from the UI.",
    propsSchema: obj({
      title,
      items: array(obj({
        text: str(200), checked: { type: "boolean" }, note: str(340),
      }, ["text", "checked"]), 1, 30),
    }, ["items"]),
    children: "none",
  },
  {
    type: "status_list", version: 1, label: "状态清单", category: "data",
    description: "Author-confirmed done, active, pending, blocked states with optional explanatory details.",
    propsSchema: obj({
      title,
      items: array(obj({
        text: str(180), status: pick("done", "active", "pending", "blocked"), detail: str(400),
      }, ["text", "status"]), 1, 24),
    }, ["items"]),
    children: "none",
  },
  {
    type: "code_block", version: 1, label: "代码示例", category: "content",
    description: "Escaped, non-executing code with a plain language label; no syntax engine or remote dependencies.",
    propsSchema: obj({
      language: str(32), code: str(8000), caption: str(160),
    }, ["language", "code"]),
    children: "none",
  },
  {
    type: "sources", version: 1, label: "来源引用", category: "content",
    description: "Author-provided HTTPS references only; links are never fetched or automatically verified.",
    propsSchema: obj({
      title,
      items: array(obj({
        label: str(180), url: { type: "https-url", maxLength: 600 }, note: str(360),
      }, ["label", "url"]), 1, 12),
    }, ["items"]),
    children: "none",
  },
  {
    type: "line_chart", version: 1, label: "折线图", category: "data",
    description: "Static SVG line graph with an accessible raw-data table. At least two finite nonnegative measurements.",
    propsSchema: obj({
      title, unit: str(28), items: array(chartDatum, 2, 16),
    }, ["title", "items"]),
    children: "none",
  },
  {
    type: "pie_chart", version: 1, label: "比例饼图", category: "data",
    description: "Static SVG share chart, accessible values table, and a required positive sum.",
    propsSchema: obj({
      title, unit: str(28), items: array(chartDatum, 2, 8, "value"),
    }, ["title", "items"]),
    children: "none",
  },
  {
    type: "flowchart", version: 1, label: "流程路径", category: "data",
    description: "A simple ordered flow with explicit titles and optional notes; no invented decisions or executable actions.",
    propsSchema: obj({
      title,
      items: array(obj({ title: str(150), detail: str(500) }, ["title"]), 2, 10),
    }, ["items"]),
    children: "none",
  },
  {
    type: "pros_cons", version: 1, label: "优缺点对照", category: "data",
    description: "Balanced pros and cons supplied by the author; no automatic verdict.",
    propsSchema: obj({
      title, pros: shortTexts, cons: shortTexts,
    }, ["pros", "cons"]),
    children: "none",
  },
  {
    type: "glossary", version: 1, label: "术语解释", category: "content",
    description: "A readable glossary of short terms and author-written plain-text definitions.",
    propsSchema: obj({
      title,
      items: array(obj({
        term: str(100), definition: str(700),
      }, ["term", "definition"]), 1, 24),
    }, ["items"]),
    children: "none",
  },
  {
    type: "tag_list", version: 1, label: "主题标签组", category: "content",
    description: "A compact collection of static categorization tags, not navigation or clickable filters.",
    propsSchema: obj({
      label: str(120), tags: array(str(48), 1, 24),
    }, ["tags"]),
    children: "none",
  },
];
