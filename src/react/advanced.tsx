import type { RendererMap } from "./index.js";

type AccordionItem = { question: string; answer: string };
type CheckItem = { text: string; checked: boolean; note?: string };
type StatusItem = { text: string; status: "done" | "active" | "pending" | "blocked"; detail?: string };
type SourceItem = { label: string; url: string; note?: string };
type ChartItem = { label: string; value: number };
type FlowItem = { title: string; detail?: string };
type GlossaryItem = { term: string; definition: string };

const fmt = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 });
const statusNames: Record<StatusItem["status"], string> = {
  done: "已完成", active: "进行中", pending: "待开始", blocked: "受阻",
};
const chartNames = { line_chart: "折线图", pie_chart: "饼图" } as const;

function SectionTitle({ title }: { title: unknown }) {
  return typeof title === "string" ? <strong className="xyc-advanced-title">{title}</strong> : null;
}

function RawChartTable({ items, unit }: { items: readonly ChartItem[]; unit?: string }) {
  return (
    <details className="xyc-advanced-raw">
      <summary>查看原始数据</summary>
      <table>
        <thead><tr><th scope="col">项目</th><th scope="col">数值{unit ? "（" + unit + "）" : ""}</th></tr></thead>
        <tbody>{items.map(({ label, value }, i) => (
          <tr key={i}><th scope="row">{label}</th><td>{fmt.format(value)}</td></tr>
        ))}</tbody>
      </table>
    </details>
  );
}

function shortened(label: string, limit = 9) {
  const chars = Array.from(label);
  return chars.length <= limit ? label : chars.slice(0, limit - 1).join("") + "…";
}

function LineChart({ title, items, unit }: {
  title: string; items: ChartItem[]; unit?: string;
}) {
  const w = 680, h = 265, left = 56, right = 30, top = 20, bottom = 68;
  const plotWidth = w - left - right, plotHeight = h - top - bottom;
  const max = Math.max(1, ...items.map(({ value }) => value));
  const points = items.map(({ value }, i) => ({
    x: left + i * plotWidth / (items.length - 1),
    y: top + plotHeight * (1 - value / max),
  }));
  return (
    <figure className="xyc-advanced-chart" aria-label={title}>
      <figcaption>{title}</figcaption>
      <div className="xyc-advanced-chart-scroll" role="region" tabIndex={0} aria-label="横向滚动查看折线图">
        <svg viewBox={`0 0 ${w} ${h}`} role="img"
          aria-label={`${title}，${chartNames.line_chart}，共 ${items.length} 个数据点`}>
          <title>{`${title} · 折线图`}</title>
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
            const y = top + plotHeight * (1 - fraction);
            return (
              <g key={fraction}>
                <line className="xyc-advanced-axis-line" x1={left} x2={w - right} y1={y} y2={y} />
                <text className="xyc-advanced-axis-text" x={left - 9} y={y + 4} textAnchor="end">
                  {fmt.format(fraction * max)}
                </text>
              </g>
            );
          })}
          <polyline className="xyc-advanced-line" points={points.map(({ x, y }) => `${x},${y}`).join(" ")} />
          {items.map((item, i) => (
            <g key={i}>
              <circle className="xyc-advanced-point" cx={points[i]!.x} cy={points[i]!.y} r={5} />
              <text className="xyc-advanced-axis-text" x={points[i]!.x} y={h - bottom + 24}
                textAnchor="middle">{shortened(item.label)}</text>
            </g>
          ))}
        </svg>
      </div>
      <RawChartTable items={items} {...(unit ? { unit } : {})} />
      <p className="xyc-advanced-chart-note">仅展示作者提供的数据，不自动更新。</p>
    </figure>
  );
}

function circlePoint(cx: number, cy: number, radius: number, angle: number) {
  return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
}

function arcPath(cx: number, cy: number, radius: number, start: number, end: number) {
  const from = circlePoint(cx, cy, radius, start);
  const to = circlePoint(cx, cy, radius, end);
  return `M ${cx} ${cy} L ${from.x} ${from.y} A ${radius} ${radius} 0 ${end - start > Math.PI ? 1 : 0} 1 ${to.x} ${to.y} Z`;
}

function PieChart({ title, items, unit }: {
  title: string; items: ChartItem[]; unit?: string;
}) {
  const total = items.reduce((sum, { value }) => sum + value, 0);
  let angle = -Math.PI / 2;
  const segments = items.map(({ value }, index) => {
    if (value === 0) return null;
    const delta = 2 * Math.PI * value / total;
    const start = angle;
    angle += delta;
    const className = "xyc-advanced-slice xyc-advanced-slice-" + index;
    return delta >= 2 * Math.PI - 0.000001
      ? <circle key={index} cx={340} cy={137} r={104} className={className} />
      : <path key={index} d={arcPath(340, 137, 104, start, angle)} className={className} />;
  });
  return (
    <figure className="xyc-advanced-chart" aria-label={title}>
      <figcaption>{title}</figcaption>
      <svg className="xyc-advanced-pie" viewBox="0 0 680 274" role="img"
        aria-label={`${title}，${chartNames.pie_chart}，共 ${items.length} 个分类`}>
        <title>{`${title} · 饼图`}</title>
        {segments}
      </svg>
      <ul className="xyc-advanced-legend" aria-label="图表分类与原始值">
        {items.map(({ label, value }, i) => (
          <li key={i}>
            <span className={"xyc-advanced-swatch xyc-advanced-slice-" + i} aria-hidden="true" />
            <span>{label}</span>
            <strong>{fmt.format(value)}{unit ? " " + unit : ""}</strong>
          </li>
        ))}
      </ul>
      <RawChartTable items={items} {...(unit ? { unit } : {})} />
      <p className="xyc-advanced-chart-note">分类占比根据作者提供的数值计算，来源未经自动核验。</p>
    </figure>
  );
}

export const advancedRenderers: RendererMap = {
  accordion: (props) => (
    <section className="xyc-accordion" aria-label={typeof props.title === "string" ? props.title : "折叠问答组"}>
      <SectionTitle title={props.title} />
      {(props.items as AccordionItem[]).map(({ question, answer }, i) => (
        <details key={i}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}
    </section>
  ),
  checklist: (props) => (
    <section className="xyc-checklist" aria-label={typeof props.title === "string" ? props.title : "只读清单"}>
      <SectionTitle title={props.title} />
      <ul>{(props.items as CheckItem[]).map(({ text, checked, note }, i) => (
        <li key={i}>
          <span className={"xyc-check-mark" + (checked ? " xyc-check-done" : "")}
            aria-hidden="true">{checked ? "✓" : "–"}</span>
          <span className="xyc-check-body"><strong>{text}</strong>
            <span className="xyc-check-state">{checked ? "已完成" : "未完成"} · 只读</span>
            {note && <small>{note}</small>}
          </span>
        </li>
      ))}</ul>
    </section>
  ),
  status_list: (props) => (
    <section className="xyc-status-list" aria-label={typeof props.title === "string" ? props.title : "状态清单"}>
      <SectionTitle title={props.title} />
      <ul>{(props.items as StatusItem[]).map(({ text, status, detail }, i) => (
        <li key={i}>
          <div className="xyc-status-row">
            <strong>{text}</strong>
            <span className={"xyc-status-label xyc-status-" + status}>{statusNames[status]}</span>
          </div>
          {detail && <p>{detail}</p>}
        </li>
      ))}</ul>
    </section>
  ),
  code_block: (props) => (
    <figure className="xyc-code-sample">
      <figcaption>
        <span>{String(props.language)}</span>
        {typeof props.caption === "string" && <span>{props.caption}</span>}
      </figcaption>
      <pre><code>{String(props.code)}</code></pre>
    </figure>
  ),
  sources: (props) => (
    <section className="xyc-sources" aria-label={typeof props.title === "string" ? props.title : "参考来源"}>
      <SectionTitle title={props.title} />
      <p className="xyc-source-caution">作者提供的链接，内容未经自动核验；仅点击时访问。</p>
      <ol>{(props.items as SourceItem[]).map(({ label, url, note }, i) => (
        <li key={i}>
          <a href={url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
            {label} <span aria-hidden="true">↗</span>
          </a>
          <small>{new URL(url).hostname}</small>
          {note && <p>{note}</p>}
        </li>
      ))}</ol>
    </section>
  ),
  line_chart: (props) => <LineChart
    title={String(props.title)} items={props.items as ChartItem[]}
    {...(typeof props.unit === "string" ? { unit: props.unit } : {})}
  />,
  pie_chart: (props) => <PieChart
    title={String(props.title)} items={props.items as ChartItem[]}
    {...(typeof props.unit === "string" ? { unit: props.unit } : {})}
  />,
  flowchart: (props) => (
    <section className="xyc-flowchart" aria-label={typeof props.title === "string" ? props.title : "流程路径"}>
      <SectionTitle title={props.title} />
      <ol>{(props.items as FlowItem[]).map(({ title, detail }, i) => (
        <li key={i}>
          <span className="xyc-flow-number" aria-hidden="true">{i + 1}</span>
          <div><strong>{title}</strong>{detail && <p>{detail}</p>}</div>
        </li>
      ))}</ol>
    </section>
  ),
  pros_cons: (props) => (
    <section className="xyc-pros-cons" aria-label={typeof props.title === "string" ? props.title : "优缺点对照"}>
      <SectionTitle title={props.title} />
      <div className="xyc-pros-cons-grid">
        <section aria-label="优点"><strong>优点</strong>
          <ul>{(props.pros as string[]).map((s, i) => <li key={i}>{s}</li>)}</ul>
        </section>
        <section aria-label="注意点"><strong>注意点</strong>
          <ul>{(props.cons as string[]).map((s, i) => <li key={i}>{s}</li>)}</ul>
        </section>
      </div>
    </section>
  ),
  glossary: (props) => (
    <section className="xyc-glossary" aria-label={typeof props.title === "string" ? props.title : "术语解释"}>
      <SectionTitle title={props.title} />
      <dl>{(props.items as GlossaryItem[]).map(({ term, definition }, i) => (
        <div key={i}><dt>{term}</dt><dd>{definition}</dd></div>
      ))}</dl>
    </section>
  ),
  tag_list: (props) => (
    <section className="xyc-tag-list" aria-label={typeof props.label === "string" ? props.label : "主题标签"}>
      {typeof props.label === "string" && <span className="xyc-tag-caption">{props.label}</span>}
      <ul>{(props.tags as string[]).map((tag, i) => <li key={i}>{tag}</li>)}</ul>
    </section>
  ),
};
