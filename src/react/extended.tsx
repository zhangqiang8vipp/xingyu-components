import type { RendererMap } from "./index.js";

type TimePoint = { label: string; title: string; detail?: string };
type ChartPoint = { label: string; value: number };

const format = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 });
const text = (value: unknown) => String(value);

function renderBarChart(props: Readonly<Record<string, unknown>>) {
  const items = props.items as ChartPoint[];
  const max = Math.max(1, ...items.map(({ value }) => value));
  const h = items.length * 36 + 12;
  const left = 132;
  const usable = 430;
  const unit = typeof props.unit === "string" ? " " + props.unit : "";
  const heading = text(props.title);
  return (
    <figure className="xyc-chart" aria-label={heading}>
      <figcaption className="xyc-chart-title">{heading}</figcaption>
      <div className="xyc-chart-scroller" role="region" tabIndex={0} aria-label="横向滚动查看条形图">
        <svg viewBox={`0 0 680 ${h}`} role="img"
          aria-label={`${heading}：共 ${items.length} 项非负数值`}>
          <title>{heading}</title>
          {items.map(({ label, value }, index) => {
            const y = index * 36 + 7;
            const clipped = Array.from(label);
            const shortLabel = clipped.length > 12
              ? clipped.slice(0, 11).join("") + "…"
              : label;
            return (
              <g key={index}>
                <text className="xyc-chart-axis" x={left - 9} y={y + 17} textAnchor="end">{shortLabel}</text>
                <rect className="xyc-chart-track" x={left} y={y} width={usable} height={24} rx={4} />
                <rect className="xyc-chart-bar" x={left} y={y}
                  width={Math.max(0, usable * value / max)} height={24} rx={4} />
                <text className="xyc-chart-axis" x={left + usable + 10} y={y + 17}>
                  {format.format(value)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <details className="xyc-chart-data">
        <summary>查看原始数据</summary>
        <table>
          <thead><tr><th scope="col">项目</th><th scope="col">数值{unit}</th></tr></thead>
          <tbody>{items.map(({ label, value }, index) =>
            <tr key={index}><th scope="row">{label}</th><td>{format.format(value)}</td></tr>)}</tbody>
        </table>
      </details>
      <p className="xyc-chart-note">仅展示文档中提供的数据，不联网更新。</p>
    </figure>
  );
}

/** New core protocol renderers: static, read-only and fully data-validated upstream. */
export const extendedRenderers: RendererMap = {
  badge: (props) => (
    <span className={"xyc-badge xyc-badge-" + text(props.tone)}>
      {text(props.label)}
    </span>
  ),
  progress: (props) => (
    <div className="xyc-progress">
      <div className="xyc-progress-title">
        <strong>{text(props.label)}</strong><span>{format.format(props.value as number)}%</span>
      </div>
      <progress value={props.value as number} max={100}
        aria-label={text(props.label)} />
      {typeof props.note === "string" && <p>{props.note}</p>}
    </div>
  ),
  timeline: (props) => (
    <section className="xyc-timeline" aria-label={typeof props.title === "string" ? props.title : "时间线"}>
      {typeof props.title === "string" && <strong className="xyc-section-title">{props.title}</strong>}
      <ol>{(props.items as TimePoint[]).map(({ label, title, detail }, i) => (
        <li key={i}>
          <span className="xyc-timeline-label">{label}</span>
          <strong>{title}</strong>
          {detail && <p>{detail}</p>}
        </li>
      ))}</ol>
    </section>
  ),
  bar_chart: (props) => renderBarChart(props),
};
