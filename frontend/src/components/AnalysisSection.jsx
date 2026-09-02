import React, { useState } from 'react';
import SeverityDonut from './visuals/SeverityDonut';
import RecordDetail from './RecordDetail';

const STATUS_DOT = {
  Critical: 'bg-crit',
  Warning: 'bg-warn',
  Normal: 'bg-norm',
  Unknown: 'bg-unk',
};

const COUNT_STYLES = {
  Critical: {
    label: 'Critical',
    text: 'text-crit',
    ring: 'border-crit/30',
    left: 'border-l-crit',
    bg: 'bg-crit/5',
  },
  Warning: {
    label: 'Warning',
    text: 'text-warn',
    ring: 'border-warn/30',
    left: 'border-l-warn',
    bg: 'bg-warn/5',
  },
  Normal: {
    label: 'Normal',
    text: 'text-norm',
    ring: 'border-norm/30',
    left: 'border-l-norm',
    bg: 'bg-norm/5',
  },
  Unknown: {
    label: 'Unknown',
    text: 'text-unk',
    ring: 'border-unk/30',
    left: 'border-l-unk',
    bg: 'bg-unk/5',
  },
};

const STATUS_BORDER = {
  Critical: 'border-t-crit',
  Warning: 'border-t-warn',
  Normal: 'border-t-norm',
  Unknown: 'border-t-unk',
};

export default function AnalysisSection({ results, summary, generatedAt, model }) {
  const [selected, setSelected] = useState(0);
  const current = results[selected];

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      });
    } catch {
      return '';
    }
  };

  const go = (dir) => {
    setSelected((s) => Math.min(results.length - 1, Math.max(0, s + dir)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            <div className="mono-label">Section 02</div>
          </div>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Analysis
          </h2>
        </div>
        <div className="text-right text-xs text-muted">
          <div>Analyzed {formatTime(generatedAt)}</div>
          <div className="mt-0.5 font-mono">{model}</div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="glass-panel flex flex-col gap-6 rounded-2xl p-6 sm:flex-row sm:items-center">
        <SeverityDonut summary={summary} />
        <div className="hidden h-28 w-px bg-line sm:block" aria-hidden="true" />
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.keys(COUNT_STYLES).map((k) => (
            <div
              key={k}
              className={`rounded-xl border border-l-2 ${COUNT_STYLES[k].ring} ${COUNT_STYLES[k].left} ${COUNT_STYLES[k].bg} px-4 py-3`}
            >
              <div className={`font-display text-3xl font-semibold ${COUNT_STYLES[k].text}`}>
                {summary[k.toLowerCase()] ?? 0}
              </div>
              <div className="mono-label mt-1">{COUNT_STYLES[k].label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Record preview grid */}
      <div>
        <div className="mono-label mb-3">Records · {results.length}</div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              aria-pressed={i === selected}
              className={`group rounded-xl border border-t-2 p-3 text-left transition-all ${
                i === selected
                  ? 'border-accent/50 border-t-accent bg-accent/10 shadow-[0_0_24px_-8px_rgba(45,212,191,0.4)]'
                  : `border-line ${STATUS_BORDER[r.status] || 'border-t-unk'} bg-panel2/60 hover:border-lineStrong hover:bg-panel2`
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[r.status] || 'bg-unk'}`} />
                <span className="font-mono text-[10px] text-muted">#{i + 1}</span>
              </div>
              <div className="mt-2 truncate text-[15px] font-medium text-ink">{r.test_name}</div>
              <div className="mt-0.5 font-mono text-xs text-muted">
                {r.value} {r.unit}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="mono-label">
            Record {selected + 1} of {results.length}
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => go(-1)} disabled={selected === 0}>
              ← Prev
            </button>
            <button
              className="btn-ghost"
              onClick={() => go(1)}
              disabled={selected === results.length - 1}
            >
              Next →
            </button>
          </div>
        </div>
        {current && <RecordDetail key={selected} result={current} />}
      </div>
    </div>
  );
}