import type { RendererMap } from "./index.js";

type XY = { label: string; x: number; y: number };
type Value = { label: string; value: number };
const format = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 });
const title = (value: unknown) => typeof value === "string" ? value : "";
const shade = (index: number) => ["#2563eb", "#0d9488", "#d97706", "#7c3aed", "#db2777", "#64748b", "#16a34a", "#ea580c"][index % 8]!;

function DataTable({ title: name, headings, rows }: { title: string; headings: string[]; rows: (string | number)[][] }) {
  return (
    <details className="xyc-pattern-raw">
      <summary>查看原始数据</summary>
      <div className="xyc-pattern-table-scroll" role="region" tabIndex={0} aria-label={name + "原始数据"}>
        <table><caption>{name}</caption><thead><tr>{headings.map((h, i) => <th scope="col" key={i}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((row, i) => <tr key={i}>{row.map((v, j) =>
            j === 0 ? <th scope="row" key={j}>{v}</th> : <td key={j}>{v}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </details>
  );
}
const chartNote = <p className="xyc-pattern-note">仅展示文档提供的示例或原始数据，不自动联网核验。</p>;

export const patternRenderers: RendererMap = {
  panel: (props, children) => (
    <section className={"xyc-pattern-panel xyc-pattern-" + String(props.tone ?? "neutral")}
      aria-label={title(props.title)}>
      <h3>{title(props.title)}</h3>
      {typeof props.summary === "string" && <p>{props.summary}</p>}
      <div className="xyc-pattern-panel-body">{children}</div>
    </section>
  ),
  hero: (props) => (
    <header className={"xyc-pattern-hero xyc-pattern-align-" + String(props.align ?? "left")}>
      {typeof props.eyebrow === "string" && <span>{props.eyebrow}</span>}
      <h2>{title(props.title)}</h2><p>{title(props.summary)}</p>
    </header>
  ),
  link_cards: (props) => (
    <section className="xyc-pattern-links" aria-label={title(props.title) || "外部资源卡片"}>
      {typeof props.title === "string" && <h3>{props.title}</h3>}
      <ul>{(props.items as { label: string; url: string; note?: string }[]).map((item, i) => (
        <li key={i}><a href={item.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
          <strong>{item.label}</strong><span aria-hidden="true">↗</span></a>
          {item.note && <p>{item.note}</p>}
          <small>{new URL(item.url).hostname}</small>
        </li>
      ))}</ul>
      <p className="xyc-pattern-note">外部资源由作者提供，点击后才访问；内容未自动核验。</p>
    </section>
  ),
  stacked_bar_chart: (props) => {
    const items = props.items as Value[];
    const total = items.reduce((sum, v) => sum + v.value, 0);
    let offset = 0;
    const segments = items.map((item, i) => {
      const x = offset;
      const width = 600 * item.value / total;
      offset += width;
      return <rect key={i} x={x} y={12} width={width} height={34} fill={shade(i)} />;
    });
    return <figure className="xyc-pattern-chart">
      <figcaption>{title(props.title)}</figcaption>
      <svg viewBox="0 0 600 58" role="img" aria-label={title(props.title) + "，分段比例图"}>
        <title>{title(props.title)}</title>{segments}
      </svg>
      <ul className="xyc-pattern-legend">{items.map((item, i) =>
        <li key={i}><span style={{ backgroundColor: shade(i) }} aria-hidden="true" />
          {item.label}<strong>{format.format(item.value)} ({format.format(100 * item.value / total)}%)</strong></li>)}</ul>
      <DataTable title={title(props.title)} headings={["分类", "数值" + (props.unit ? "（" + props.unit + "）" : "")]}
        rows={items.map(v => [v.label, format.format(v.value)])} />{chartNote}
    </figure>;
  },
  scatter_chart: (props) => {
    const items = props.items as XY[];
    const minX = Math.min(...items.map(v => v.x)), maxX = Math.max(...items.map(v => v.x));
    const minY = Math.min(...items.map(v => v.y)), maxY = Math.max(...items.map(v => v.y));
    const xRange = Math.max(1, maxX - minX), yRange = Math.max(1, maxY - minY);
    return <figure className="xyc-pattern-chart">
      <figcaption>{title(props.title)}</figcaption>
      <div className="xyc-pattern-chart-scroll" role="region" tabIndex={0} aria-label="横向滚动查看散点图">
        <svg viewBox="0 0 640 310" role="img" aria-label={title(props.title) + "，二维散点图"}>
          <title>{title(props.title)}</title>
          <line className="xyc-pattern-axis" x1="65" x2="610" y1="262" y2="262" />
          <line className="xyc-pattern-axis" x1="65" x2="65" y1="20" y2="262" />
          <text x="340" y="300" textAnchor="middle">{title(props.xLabel)}</text>
          <text x="15" y="150" transform="rotate(-90 15 150)" textAnchor="middle">{title(props.yLabel)}</text>
          <text x="65" y="279" textAnchor="middle">{format.format(minX)}</text>
          <text x="610" y="279" textAnchor="middle">{format.format(maxX)}</text>
          <text x="55" y="262" textAnchor="end">{format.format(minY)}</text>
          <text x="55" y="25" textAnchor="end">{format.format(maxY)}</text>
          {items.map((item, i) => {
            const x = 65 + 545 * (item.x - minX) / xRange;
            const y = 262 - 235 * (item.y - minY) / yRange;
            return <circle key={i} cx={x} cy={y} r="6" fill={shade(i)}><title>{`${item.label}: ${item.x}, ${item.y}`}</title></circle>;
          })}
        </svg>
      </div>
      <DataTable title={title(props.title)} headings={["数据点", title(props.xLabel), title(props.yLabel)]}
        rows={items.map(v => [v.label, format.format(v.x), format.format(v.y)])} />{chartNote}
    </figure>;
  },
  heatmap: (props) => {
    const columns = props.columns as string[];
    const rows = props.rows as { label: string; values: number[] }[];
    return <section className="xyc-pattern-heatmap" aria-label={title(props.title)}>
      <h3>{title(props.title)}</h3>
      <div className="xyc-pattern-table-scroll" role="region" tabIndex={0} aria-label="横向滚动查看热力矩阵">
        <table><caption>{title(props.title)}，数值范围 0 至 100</caption>
          <thead><tr><th scope="col">项目</th>{columns.map((col, i) => <th scope="col" key={i}>{col}</th>)}</tr></thead>
          <tbody>{rows.map((row, i) => <tr key={i}><th scope="row">{row.label}</th>
            {row.values.map((value, j) => <td key={j}><span className="xyc-pattern-heat"
              style={{ backgroundColor: "rgba(37,99,235," + (0.07 + value * 0.006) + ")" }}>
              {format.format(value)}</span></td>)}</tr>)}</tbody>
        </table>
      </div>{chartNote}
    </section>;
  },
  rating_group: (props) => (
    <section className="xyc-pattern-rating" aria-label={title(props.title)}>
      <h3>{title(props.title)}</h3>
      <ul>{(props.items as { label: string; score: number; note?: string }[]).map((item, i) =>
        <li key={i}><div><strong>{item.label}</strong><span>{format.format(item.score)} / 5</span></div>
          <meter min={0} max={5} value={item.score} aria-label={item.label + "评分"} />
          {item.note && <p>{item.note}</p>}
        </li>)}</ul>
    </section>
  ),
  agenda: (props) => (
    <section className="xyc-pattern-agenda" aria-label={title(props.title)}>
      <h3>{title(props.title)}</h3>
      <ol>{(props.items as { when: string; title: string; detail?: string }[]).map((item, i) =>
        <li key={i}><time>{item.when}</time><div><strong>{item.title}</strong>{item.detail && <p>{item.detail}</p>}</div></li>)}</ol>
    </section>
  ),
  kanban_board: (props) => (
    <section className="xyc-pattern-kanban" aria-label={title(props.title)}>
      <h3>{title(props.title)}</h3><div className="xyc-pattern-kanban-columns">
      {(props.columns as { title: string; cards: { title: string; detail?: string }[] }[]).map((column, i) =>
        <section key={i} aria-label={column.title}><h4>{column.title} <span>{column.cards.length}</span></h4>
          <ul>{column.cards.map((card, j) =>
            <li key={j}><strong>{card.title}</strong>{card.detail && <p>{card.detail}</p>}</li>)}</ul>
        </section>)}</div><p className="xyc-pattern-note">只读展示，不支持拖动或更改任务状态。</p>
    </section>
  ),
};
