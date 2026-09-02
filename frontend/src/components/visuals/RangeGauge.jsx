import React from 'react';

const ZONE_COLORS = {
  critical_low: 'bg-crit/80',
  low: 'bg-warn/70',
  normal: 'bg-norm/70',
  high: 'bg-warn/70',
  critical_high: 'bg-crit/80',
};

function clampPct(v) {
  return Math.min(97, Math.max(3, v));
}

export default function RangeGauge({ value, unit, thresholds }) {
  if (!thresholds || (thresholds.low == null && thresholds.high == null)) {
    return (
      <div className="rounded-lg border border-line bg-panel/60 px-4 py-3 text-sm text-muted">
        No reference range available for this test.
      </div>
    );
  }

  const low = thresholds.low;
  const high = thresholds.high;
  const critLow = thresholds.critical_low;
  const critHigh = thresholds.critical_high;

  let min = critLow ?? low;
  let max = critHigh ?? high;
  if (value < min) min = value;
  if (value > max) max = value;
  const pad = (max - min) * 0.08 || 1;
  min -= pad;
  max += pad;

  const pct = (v) => ((v - min) / (max - min)) * 100;

  const zones = [];
  if (critLow != null) zones.push({ key: 'critical_low', from: pct(min), to: pct(critLow) });
  zones.push({ key: 'low', from: pct(critLow ?? min), to: pct(low) });
  zones.push({ key: 'normal', from: pct(low), to: pct(high) });
  zones.push({ key: 'high', from: pct(high), to: pct(critHigh ?? max) });
  if (critHigh != null) zones.push({ key: 'critical_high', from: pct(critHigh), to: pct(max) });

  const markerPct = Math.min(94, Math.max(6, pct(value)));

  const labels = [];
  if (critLow != null) labels.push({ pos: clampPct(pct(critLow)), text: `crit ≤ ${critLow}` });
  labels.push({ pos: clampPct(pct(low)), text: `${low}` });
  labels.push({ pos: clampPct(pct(high)), text: `${high}` });
  if (critHigh != null) labels.push({ pos: clampPct(pct(critHigh)), text: `crit ≥ ${critHigh}` });

  return (
    <div>
      {/* Marker: bubble + connector + dot (spans bubble row and track) */}
      <div className="relative">
        <div
          className="absolute bottom-0 top-0 z-10 flex flex-col items-center animate-markerIn"
          style={{ left: '0%', '--marker-pos': `${markerPct}%`, transform: 'translateX(-50%)' }}
        >
          <div
            className="whitespace-nowrap rounded-md border border-accent/40 bg-panel px-2 py-0.5 font-mono text-sm font-bold text-accentSoft shadow-lg"
            style={{
              transform: markerPct < 15 ? 'translateX(calc(50% - 10px))' : markerPct > 85 ? 'translateX(calc(-50% + 10px))' : 'none'
            }}
          >
            {value} {unit}
          </div>
          <div className="w-px bg-ink/40 flex-1" />
          <div className="h-3 w-3 rounded-full bg-ink ring-4 ring-accent/30 mb-[1px]" />
        </div>

        {/* Reserved bubble row */}
        <div className="h-8" aria-hidden="true" />

        {/* Track */}
        <div className="flex h-3 w-full overflow-hidden rounded-full">
          {zones.map((z) => (
            <div
              key={z.key}
              className={`${ZONE_COLORS[z.key]} h-full`}
              style={{ width: `${Math.max(0, z.to - z.from)}%` }}
            />
          ))}
        </div>
      </div>

      {/* Scale labels */}
      <div className="relative mt-2 h-5">
        {labels.map((l, i) => (
          <span
            key={i}
            className="absolute -translate-x-1/2 font-mono text-[11px] text-muted"
            style={{ left: `${l.pos}%` }}
          >
            {l.text}
          </span>
        ))}
      </div>
    </div>
  );
}