/** Curated public demo data. These are fixtures, not production/user knowledge. */
const block = (type, props, children) => ({
  type, version: 1, props, ...(children ? { children } : {}),
});

export const gallerySpecimens = Object.freeze({
  text: block("text", {
    text: "星屿不替内容选择表达方式。文字保持自然，结构化组件只在有帮助时出现。",
  }),
  callout: block("callout", {
    title: "关于这套图鉴",
    body: "这里的内容仅是演示。AI 可根据组件能力清单自行选择表达形式，所有输入仍须先通过严格校验。",
    tone: "info",
  }),
  metric: block("metric", {
    label: "通用组件数量",
    value: "19",
    note: "来自当前版本的能力目录",
  }),
  stack: block("stack", { gap: "sm" }, [
    block("heading", { text: "阅读中的自然节奏", level: 4 }),
    block("text", { text: "标题、段落和说明可以纵向组合，不必再写新的业务模板。" }),
    block("badge", { label: "纵向组合 · 演示", tone: "neutral" }),
  ]),
  grid: block("grid", { columns: 2 }, [
    block("metric", { label: "内容表达", value: "自由组合" }),
    block("metric", { label: "数据来源", value: "作者提供" }),
    block("callout", { title: "适应屏幕", body: "真正的手机视口会触发组件的移动端样式。", tone: "success" }),
  ]),
  disclosure: block("disclosure", {
    summary: "为什么不自动生成所有组件？",
    body: "因为真正重要的是阅读体验。普通段落继续保持自然，需要结构化信息时才使用合适的组件。",
  }),
  divider: block("divider", {}),
  heading: block("heading", {
    text: "把知识写得更清楚",
    level: 3,
  }),
  quote: block("quote", {
    text: "形式应服务于理解，而不是要求每一段内容都变成一张卡片。",
    attribution: "图鉴示例语句",
  }),
  badge: block("badge", {
    label: "示例内容",
    tone: "info",
  }),
  bullet_list: block("bullet_list", {
    items: ["自然的阅读排版", "仅显示有依据的数据", "手机和桌面都易于阅读"],
  }),
  numbered_list: block("numbered_list", {
    items: ["理解内容", "选择表达方式", "交给组件安全渲染"],
  }),
  key_value: block("key_value", {
    title: "文档元信息 · 示例",
    items: [
      { label: "协议版本", value: "xingyu-document / 1" },
      { label: "渲染引擎", value: "React · Server Render" },
      { label: "网络请求", value: "组件自身不发起" },
    ],
  }),
  table: block("table", {
    title: "表达方式对照 · 示例",
    columns: ["内容", "推荐形式", "阅读重点"],
    rows: [
      { cells: ["观点", "自然文本", "连续叙述"] },
      { cells: ["小型数据", "指标", "数值与单位"] },
      { cells: ["多项比较", "表格", "差异与依据"] },
    ],
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
  steps: block("steps", {
    title: "从数据到展示",
    items: [
      { title: "准备内容", body: "保留原始文字和可核查的事实。" },
      { title: "按协议构建", body: "组件类型与属性须符合能力清单。", code: "npm run gallery:build" },
      { title: "检查体验", body: "在不同宽度和主题下阅读。" },
    ],
  }),
  comparison: block("comparison", {
    title: "两种阅读方式 · 示例",
    left: "普通 Markdown",
    right: "结构化组件",
    rows: [
      { dimension: "擅长内容", left: "长段落与叙述", right: "数字和关系" },
      { dimension: "基本要求", left: "可读性", right: "可读性与校验" },
      { dimension: "典型用途", left: "文章主体", right: "辅助理解" },
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
