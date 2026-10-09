/** Curated public demo data. These are fixtures, not production/user knowledge. */
const block = (type, props, children) => ({
  type, version: 1, props, ...(children ? { children } : {}),
});

export const gallerySpecimens = Object.freeze({
  callout: block("callout", {
    title: "关于这套图鉴",
    body: "这里的内容仅是演示。AI 可根据组件能力清单自行选择表达形式，所有输入仍须先通过严格校验。",
    tone: "info",
  }),
  metric: block("metric", {
    label: "通用组件数量",
    value: "26",
    note: "来自当前版本的能力目录",
  }),
  stack: block("stack", { gap: "sm" }, [
    block("metric", { label: "结构块", value: "26", note: "仅统计独立视觉组件" }),
    block("tip", { text: "Watch ACTIVE · 示例", tone: "success", variant: "pill" }),
    block("callout", { title: "组合，而非重复", body: "标题、段落与列表由宿主 Markdown 呈现。", tone: "success" }),
  ]),
  grid: block("grid", { columns: 2 }, [
    block("metric", { label: "内容表达", value: "自由组合" }),
    block("metric", { label: "数据来源", value: "作者提供" }),
    block("callout", { title: "适应屏幕", body: "真正的手机视口会触发组件的移动端样式。", tone: "success" }),
  ]),
  badge: block("badge", {
    label: "示例内容",
    tone: "info",
  }),
  progress: block("progress", {
    label: "演示项目完成度",
    value: 68,
    note: "68% 是纯粹的演示数字，并非实际项目进度。",
  }),
  timeline: block("timeline", {
    title: "组件开发流程 · 演示",
    items: [
      { label: "第一阶段", title: "确定文档协议" },
      { label: "第二阶段", title: "扩展安全组件", detail: "保持严格数据校验" },
      { label: "第三阶段", title: "进行视觉验收", detail: "桌面 · 手机 · 暗色" },
    ],
  }),
  bar_chart: block("bar_chart", {
    title: "模拟阅读统计 · 演示数据",
    unit: "次",
    items: [
      { label: "自然段落", value: 58 },
      { label: "数据表格", value: 31 },
      { label: "交互模块", value: 17 },
    ],
  }),
  accordion: block("accordion", {
    title: "常见疑问 · 演示",
    items: [
      { question: "为什么使用组件？", answer: "当数据需要被比较、折叠或分组时，结构化呈现有助于理解。" },
      { question: "普通文字怎么办？", answer: "保持自然的 Markdown 段落即可，不需要全部改写。" },
    ],
  }),
  status_list: block("status_list", {
    title: "小型任务状态 · 演示",
    items: [
      { text: "整理源数据", status: "done" },
      { text: "核对数据含义", status: "active", detail: "正在演示处理中状态" },
      { text: "发布内容", status: "pending" },
    ],
  }),
  line_chart: block("line_chart", {
    title: "每周示例趋势（模拟数据）",
    unit: "次",
    items: [
      { label: "周一", value: 24 },
      { label: "周二", value: 30 },
      { label: "周三", value: 21 },
      { label: "周四", value: 39 },
      { label: "周五", value: 43 },
    ],
  }),
  pie_chart: block("pie_chart", {
    title: "内容类型占比（模拟数据）",
    unit: "项",
    items: [
      { label: "文章", value: 52 },
      { label: "图表", value: 28 },
      { label: "卡片", value: 20 },
    ],
  }),
  pros_cons: block("pros_cons", {
    title: "两种表达方式的取舍 · 示例",
    pros: ["结构清晰，便于核对", "可复用并支持响应式布局"],
    cons: ["需要准确填写数据", "复杂内容可能更适合普通段落"],
  }),
  glossary: block("glossary", {
    title: "术语速查 · 演示",
    items: [
      { term: "文档协议", definition: "描述安全、可读、可渲染数据结构的规则。" },
      { term: "能力清单", definition: "让 AI 知道组件支持的类型、字段和边界。" },
      { term: "只读渲染", definition: "展示内容，不执行作者提供的脚本或写入请求。" },
    ],
  }),
  tag_list: block("tag_list", {
    label: "文章主题 · 演示标签",
    tags: ["AI 原生", "文档设计", "TypeScript", "无障碍", "响应式"],
  }),
  panel: block("panel", { title: "内容分组 · 演示", summary: "组合已有组件，无需重做 Markdown。", tone: "soft" }, [
    block("metric", { label: "可视组件", value: "26", note: "模拟展示数据" }),
    block("callout", { title: "原生文本仍使用 Markdown", body: "分组面板只负责特殊视觉层次。", tone: "info" }),
  ]),
  hero: block("hero", { eyebrow: "XINGYU · EXAMPLE", title: "让表达更有层次", summary: "用简明的标题与引言建立阅读重点，复杂文字仍交给 Markdown。", align: "left" }),
  link_cards: block("link_cards", { title: "参考资源 · 示例", items: [
    { label: "MDN Web Docs", url: "https://developer.mozilla.org/", note: "浏览器技术文档，需自行核验" },
    { label: "W3C WAI", url: "https://www.w3.org/WAI/", note: "无障碍设计资源" },
  ] }),
  stacked_bar_chart: block("stacked_bar_chart", { title: "内容结构占比 · 模拟数据", unit: "项", items: [
    { label: "文章", value: 48 }, { label: "组件", value: 32 }, { label: "其他", value: 20 },
  ] }),
  scatter_chart: block("scatter_chart", { title: "时间与评分 · 模拟数据", xLabel: "阅读时间", yLabel: "理解评分", items: [
    { label: "A", x: 2, y: 4 }, { label: "B", x: 4, y: 3 }, { label: "C", x: 6, y: 5 },
  ] }),
  heatmap: block("heatmap", { title: "学习热力矩阵 · 模拟数据", columns: ["星期一", "星期二", "星期三"], rows: [
    { label: "阅读", values: [25, 75, 48] }, { label: "整理", values: [55, 100, 65] }, { label: "练习", values: [10, 32, 87] },
  ] }),
  rating_group: block("rating_group", { title: "主观维度评分 · 模拟数据", items: [
    { label: "可读性", score: 4.5, note: "仅作视觉演示" },
    { label: "灵活性", score: 4.0 }, { label: "信息密度", score: 3.5 },
  ] }),
  agenda: block("agenda", { title: "工作坊日程 · 演示", items: [
    { when: "09:00", title: "主题介绍", detail: "了解基本目标" },
    { when: "10:30", title: "分组讨论", detail: "整理表达建议" },
    { when: "14:00", title: "示例展示" },
  ] }),
  kanban_board: block("kanban_board", { title: "项目任务 · 演示", columns: [
    { title: "待开始", cards: [{ title: "确定主题" }, { title: "收集参考资料" }] },
    { title: "进行中", cards: [{ title: "设计布局", detail: "模拟状态" }] },
    { title: "已完成", cards: [{ title: "协议定义" }] },
  ] }),
  tip: block("tip", { text: "示例：检查通过", tone: "success", variant: "inline",
    detail: "演示状态，不代表实时系统检查" }),
  metric_transition: block("metric_transition", {
    beforeLabel: "原组件数量", before: 40,
    afterLabel: "精简后", after: 24,
    differenceLabel: "移除重复组件",
    note: "历史组件精简示例，当前总数请以能力清单为准",
  }),
});

export const galleryCategoryLabels = Object.freeze({
  content: "内容排版",
  layout: "布局组合",
  data: "数据呈现",
  interaction: "轻量交互",
});

export const galleryCategoryDescriptions = Object.freeze({
  content: "让文字更清晰地被阅读",
  layout: "用基础积木自由编排",
  data: "让数据保留来源与结构",
  interaction: "可访问、无副作用的本地操作",
});
