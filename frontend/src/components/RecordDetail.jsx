import React from 'react';
import SeverityBadge from './SeverityBadge';
import ExplanationPanel from './ExplanationPanel';
import RangeGauge from './visuals/RangeGauge';

export default function RecordDetail({ result }) {
  const isUnknown = result.status === 'Unknown';
  const devColor =
    result.status === 'Critical'
      ? 'text-crit'
      : result.status === 'Warning'
        ? 'text-warn'
        : 'text-ink';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-3xl font-semibold tracking-tight text-ink">
            {result.test_name}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <SeverityBadge status={result.status} flag={result.flag} />
            {result.reference_source === 'llm_lookup' && (
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accentSoft">
                AI lookup
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-4xl font-bold text-ink">
            {result.value} <span className="text-lg font-medium text-muted">{result.unit}</span>
          </div>
          {result.thresholds && (
            <div className="mt-1 font-mono text-xs text-muted">
              ref {result.thresholds.low ?? '—'} – {result.thresholds.high ?? '—'}
            </div>
          )}
        </div>
      </div>

      {/* Gauge */}
      <div className="rounded-xl border border-line bg-panel2/60 p-5">
        <div className="mono-label mb-4">Position vs reference range</div>
        <RangeGauge value={result.value} unit={result.unit} thresholds={result.thresholds} />
        {result.deviation && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-line bg-panel/60 px-3 py-2 font-mono text-sm text-ink">
            <span className={devColor} aria-hidden="true">
              {result.deviation.direction === 'low' ? '▼' : '▲'}
            </span>
            <span>
              {result.deviation.direction === 'low'
                ? `${result.deviation.percent_from_bound}% below lower bound`
                : `${result.deviation.percent_from_bound}% above upper bound`}
            </span>
          </div>
        )}
      </div>

      {/* Rule */}
      {!isUnknown && (
        <div className="rounded-xl border border-line bg-panel2/60 p-4 text-sm text-muted">
          <span className="mono-label mr-2">Rule</span>
          {result.rule_applied}
        </div>
      )}

      {/* Explanation */}
      <ExplanationPanel result={result} />
    </div>
  );
}