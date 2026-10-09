import type { RendererMap } from "./index.js";
type Tone = "neutral" | "info" | "success" | "warning" | "danger";
const glyphs: Record<Tone, string> = {
  neutral: "•", info: "i", success: "✓", warning: "!", danger: "×",
};
const format = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 });

export const microRenderers: RendererMap = {
  tip: (props) => {
    const tone = props.tone as Tone;
    const variant = String(props.variant ?? "inline");
    const className = "xyc-micro-tip xyc-micro-tip-" + variant + " xyc-micro-tone-" + tone;
    const contents = <>
      <span className="xyc-micro-tip-icon" aria-hidden="true">{glyphs[tone]}</span>
      <span className="xyc-micro-tip-content">
        <strong>{String(props.text)}</strong>
        {typeof props.detail === "string" && <small>{props.detail}</small>}
      </span>
    </>;
    if (variant === "pill") return <span className={className}>{contents}</span>;
    if (variant === "note") return <aside className={className} role="note">{contents}</aside>;
    return <div className={className}>{contents}</div>;
  },
  metric_transition: (props) => {
    const before = props.before as number;
    const after = props.after as number;
    const difference = Math.abs(after - before);
    const unit = typeof props.unit === "string" ? props.unit : "";
    return <section className="xyc-metric-transition" aria-label="前后指标变化">
      <div className="xyc-transition-item xyc-transition-before">
        <span className="xyc-transition-label">{String(props.beforeLabel)}</span>
        <strong className="xyc-transition-value"><data value={before}>{format.format(before)}</data>
          {unit && <small> {unit}</small>}</strong>
      </div>
      <span className="xyc-transition-arrow" aria-hidden="true">→</span>
      <div className="xyc-transition-item xyc-transition-after">
        <span className="xyc-transition-label">{String(props.afterLabel)}</span>
        <strong className="xyc-transition-value"><data value={after}>{format.format(after)}</data>
          {unit && <small> {unit}</small>}</strong>
      </div>
      <div className="xyc-transition-item xyc-transition-difference">
        <span className="xyc-transition-label">{String(props.differenceLabel)}</span>
        <strong className="xyc-transition-value"><data value={difference}>{format.format(difference)}</data>
          {unit && <small> {unit}</small>}</strong>
      </div>
      {typeof props.note === "string" && <p className="xyc-transition-note">{props.note}</p>}
    </section>;
  },
};
