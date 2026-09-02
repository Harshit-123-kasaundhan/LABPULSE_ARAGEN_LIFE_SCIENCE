import React, { useEffect, useState } from 'react';

const SEVERITY = [
  { key: 'critical', color: '#F43F5E', label: 'Critical' },
  { key: 'warning', color: '#F59E0B', label: 'Warning' },
  { key: 'normal', color: '#34D399', label: 'Normal' },
  { key: 'unknown', color: '#94A3B8', label: 'Unknown' },
];

export default function SeverityDonut({ summary }) {
  const total = summary.total || 0;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 60);
    return () => clearTimeout(t);
  }, []);

  const R = 42;
  const C = 2 * Math.PI * R;

  const segments = SEVERITY.reduce((acc, s) => {
    const count = summary[s.key] || 0;
    const len = count === 0 ? 0 : (count / total) * C;
    const offset = acc.length ? acc[acc.length - 1].end : 0;
    acc.push({ ...s, len, offset, end: offset + len });
    return acc;
  }, []);

  return (
    <div className="relative h-40 w-40 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="rgb(var(--line) / 0.12)"
          strokeWidth="10"
        />
        {segments.map((s) => {
          if (s.len === 0) return null;
          const dash = animated ? `${s.len} ${C - s.len}` : `0 ${C}`;
          return (
            <circle
              key={s.key}
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={dash}
              strokeDashoffset={-s.offset}
              style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.22,1,0.36,1)' }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-semibold text-ink">{total}</span>
        <span className="mono-label">results</span>
      </div>
    </div>
  );
}