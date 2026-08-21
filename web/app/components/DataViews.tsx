type BarDatum = { label: string; inclusion: number; mobile: number };
type SignalDatum = { label: string; value: number };

export function Statistic({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div className="statistic">
      <strong>{value}</strong>
      <span>{label}</span>
      {note && <small>{note}</small>}
    </div>
  );
}

export function GroupedBars({ data, compact = false }: { data: BarDatum[]; compact?: boolean }) {
  return (
    <div className={`grouped-bars ${compact ? "grouped-bars--compact" : ""}`} role="img" aria-label="Comparison of financial inclusion and mobile-money account rates by group">
      <div className="chart-legend">
        <span><i className="legend-swatch legend-swatch--one" />Financial inclusion</span>
        <span><i className="legend-swatch legend-swatch--two" />Mobile money</span>
      </div>
      <div className="bar-scale" aria-hidden="true"><span>0</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>
      {data.map((item) => (
        <div className="bar-row" key={item.label}>
          <div className="bar-label">{item.label}</div>
          <div className="bar-track">
            <div className="bar-fill bar-fill--one" style={{ width: `${item.inclusion}%` }}>
              <span>{item.inclusion.toFixed(1)}%</span>
            </div>
          </div>
          <div className="bar-track">
            <div className="bar-fill bar-fill--two" style={{ width: `${item.mobile}%` }}>
              <span>{item.mobile.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SignalBars({ data, accent = "one" }: { data: SignalDatum[]; accent?: "one" | "two" }) {
  const maximum = Math.max(...data.map((item) => item.value));
  return (
    <ol className="signal-list">
      {data.map((item, index) => (
        <li key={item.label}>
          <span className="signal-rank">{String(index + 1).padStart(2, "0")}</span>
          <span className="signal-name">{item.label}</span>
          <span className="signal-track" aria-label={`${item.label}: mean absolute SHAP ${item.value.toFixed(3)}`}>
            <i className={`signal-fill signal-fill--${accent}`} style={{ width: `${(item.value / maximum) * 100}%` }} />
          </span>
          <span className="signal-value">{item.value.toFixed(3)}</span>
        </li>
      ))}
    </ol>
  );
}

export function ModelScore({ label, value }: { label: string; value: string }) {
  return (
    <div className="model-score">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
