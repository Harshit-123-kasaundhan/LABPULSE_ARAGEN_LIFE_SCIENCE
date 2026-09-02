import React from 'react';

const STYLES = {
  Critical: { bg: 'bg-crit/15', text: 'text-crit', border: 'border-crit/40', dot: 'bg-crit' },
  Warning: { bg: 'bg-warn/15', text: 'text-warn', border: 'border-warn/40', dot: 'bg-warn' },
  Normal: { bg: 'bg-norm/15', text: 'text-norm', border: 'border-norm/40', dot: 'bg-norm' },
  Unknown: { bg: 'bg-unk/15', text: 'text-unk', border: 'border-unk/40', dot: 'bg-unk' },
};

export default function SeverityBadge({ status, flag }) {
  const s = STYLES[status] || STYLES.Unknown;
  let label = status || 'UNKNOWN';
  if (flag === 'low') label += ' · LOW';
  else if (flag === 'high') label += ' · HIGH';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${s.bg} ${s.text} ${s.border}`}
      aria-label={`${status}${flag && flag !== 'in_range' && flag !== 'unknown' ? ', ' + flag : ''}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {label}
    </span>
  );
}