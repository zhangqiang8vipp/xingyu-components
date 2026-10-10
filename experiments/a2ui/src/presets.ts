import {assertReadOnlyPilot, PILOT_SURFACE, PILOT_VERSION} from "./guard.js";

export type PilotScenario = "status" | "metrics" | "notice";
export const pilotScenarios: readonly {id: PilotScenario; label: string; description: string}[] = [
  {id: "status", label: "轻量状态", description: "Row + Icon + Text：复用标准原语，而非自造 Tip"},
  {id: "metrics", label: "数值对比", description: "Row + Column + Text：三个指标都是同一个模板组合"},
  {id: "notice", label: "轻提示说明", description: "Card + Column + Text：无需新写 Callout 组件"},
];

/** Returns normal A2UI v0.9.1 messages, not proprietary xingyu-document blocks. */
export function buildPilotMessages(scenario: PilotScenario, catalogId: string) {
  let components: Record<string, unknown>[];
  let value: Record<string, string>;

  if (scenario === "status") {
    components = [
      {id: "root", component: "Column", children: ["title", "status_card", "footer"]},
      {id: "title", component: "Text", text: {path: "/title"}, variant: "h3"},
      {id: "status_card", component: "Card", child: "status_row"},
      {id: "status_row", component: "Row", children: ["status_icon", "status_text"], align: "center"},
      {id: "status_icon", component: "Icon", name: "check"},
      {id: "status_text", component: "Text", text: {path: "/status"}, variant: "body"},
      {id: "footer", component: "Text", text: {path: "/footer"}, variant: "caption"},
    ];
    value = {title: "状态提示 · 标准组件组合", status: "Watch ACTIVE · 示例状态", footer: "非实时检查，展示数据由可信示例提供"};
  } else if (scenario === "metrics") {
    const groups = [
      ["before", "before_label", "before_value"],
      ["after", "after_label", "after_value"],
      ["delta", "delta_label", "delta_value"],
    ] as const;
    components = [
      {id: "root", component: "Column", children: ["title", "values", "footer"]},
      {id: "title", component: "Text", text: {path: "/title"}, variant: "h3"},
      {id: "values", component: "Row", children: groups.map(group => group[0]), justify: "spaceBetween", align: "start"},
      ...groups.flatMap(([group, label, metric]) => [
        {id: group, component: "Column", children: [label, metric]},
        {id: label, component: "Text", text: {path: "/" + label}, variant: "caption"},
        {id: metric, component: "Text", text: {path: "/" + metric}, variant: "h3"},
      ]),
      {id: "footer", component: "Text", text: {path: "/footer"}, variant: "caption"},
    ];
    const before = 40;
    const after = 24;
    const difference = Math.abs(before - after);
    value = {
      title: "前后对比 · 标准 Row/Column/Text",
      before_label: "精简前", before_value: String(before),
      after_label: "精简后", after_value: String(after),
      delta_label: "减少", delta_value: String(difference),
      footer: "40、24 来自历史精简案例；16 是输入数据的确定性计算结果",
    };
  } else if (scenario === "notice") {
    components = [
      {id: "root", component: "Column", children: ["title", "notice_card", "footer"]},
      {id: "title", component: "Text", text: {path: "/title"}, variant: "h3"},
      {id: "notice_card", component: "Card", child: "notice_column"},
      {id: "notice_column", component: "Column", children: ["notice_row", "detail"]},
      {id: "notice_row", component: "Row", children: ["notice_icon", "notice_title"], align: "center"},
      {id: "notice_icon", component: "Icon", name: "warning"},
      {id: "notice_title", component: "Text", text: {path: "/notice"}, variant: "body"},
      {id: "detail", component: "Text", text: {path: "/detail"}, variant: "caption"},
      {id: "footer", component: "Text", text: {path: "/footer"}, variant: "caption"},
    ];
    value = {title: "轻提示说明 · 标准组件组合", notice: "需人工复核", detail: "正式验收前请先核对来源。",
      footer: "提示语仅为排版示例，非真实风险通知"};
  } else {
    throw new Error("Unknown pilot scenario");
  }
  const messages = [
    {version: PILOT_VERSION, createSurface: {surfaceId: PILOT_SURFACE, catalogId, sendDataModel: false}},
    {version: PILOT_VERSION, updateComponents: {surfaceId: PILOT_SURFACE, components}},
    {version: PILOT_VERSION, updateDataModel: {surfaceId: PILOT_SURFACE, path: "/", value}},
  ];
  assertReadOnlyPilot(messages, catalogId);
  return messages;
}
