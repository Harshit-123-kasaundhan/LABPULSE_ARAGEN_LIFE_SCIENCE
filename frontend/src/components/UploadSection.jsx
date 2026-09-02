import React, { useEffect, useState } from 'react';
import LabInput from './LabInput';
import CsvUpload from './CsvUpload';
import { buildLabRequest } from '../utils/csv';

const STEPS = [
  'Validating input',
  'Classifying results',
  'Routing by severity',
  'Generating explanations',
];

export default function UploadSection({ onAnalyze, analyzing }) {
  const [mode, setMode] = useState('manual');
  const [rows, setRows] = useState([{ test_name: '', value: '', unit: '' }]);
  const [patientContext, setPatientContext] = useState({ age: null, sex: null });
  const [csvParsed, setCsvParsed] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!analyzing) return;
    const interval = setInterval(() => {
      setStep((s) => (s < STEPS.length ? s + 1 : s));
    }, 1100);
    return () => clearInterval(interval);
  }, [analyzing]);

  const handleStart = () => {
    setError(null);
    setStep(1);
    if (mode === 'manual') {
      const filled = rows.filter(
        (r) => r.test_name.trim() !== '' && r.value !== '' && r.unit.trim() !== ''
      );
      if (filled.length === 0) {
        setError('Add at least one complete result row (test name, value, unit).');
        return;
      }
      if (filled.length > 25) {
        setError('Maximum 25 results per analysis.');
        return;
      }
      onAnalyze({
        patient_context: {
          age: patientContext.age ?? null,
          sex: patientContext.sex ?? null,
        },
        results: filled.map((r) => ({
          test_name: r.test_name.trim(),
          value: Number(r.value),
          unit: r.unit.trim(),
        })),
      });
    } else {
      if (!csvParsed) {
        setError('Upload a valid CSV file first.');
        return;
      }
      onAnalyze(buildLabRequest(csvParsed));
    }
  };

  const readyCount =
    mode === 'manual'
      ? rows.filter(
          (r) => r.test_name.trim() !== '' && r.value !== '' && r.unit.trim() !== ''
        ).length
      : csvParsed?.results?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Mode tabs */}
      <div className="inline-flex rounded-xl border border-line bg-panel2/60 p-1">
        <button
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'manual'
              ? 'bg-accent/15 text-accentSoft'
              : 'text-muted hover:text-ink'
          }`}
          onClick={() => setMode('manual')}
          disabled={analyzing}
        >
          Manual entry
        </button>
        <button
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'csv' ? 'bg-accent/15 text-accentSoft' : 'text-muted hover:text-ink'
          }`}
          onClick={() => setMode('csv')}
          disabled={analyzing}
        >
          CSV upload
        </button>
      </div>

      {/* Input panel */}
      <div className="glass-panel relative z-20 rounded-2xl p-6">
        {mode === 'manual' ? (
          <LabInput
            rows={rows}
            setRows={setRows}
            patientContext={patientContext}
            setPatientContext={setPatientContext}
            disabled={analyzing}
          />
        ) : (
          <CsvUpload onParsed={setCsvParsed} disabled={analyzing} />
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-lg border border-crit/30 bg-crit/10 px-4 py-3 text-sm text-crit"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Start button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-sm text-muted">
          {readyCount > 0 ? (
            <span>
              <span className="font-mono text-accentSoft">{readyCount}</span> result
              {readyCount === 1 ? '' : 's'} ready
            </span>
          ) : (
            <span>No results loaded yet</span>
          )}
        </div>
        <button
          className="btn-primary"
          onClick={handleStart}
          disabled={analyzing || readyCount === 0}
        >
          {analyzing ? 'Analyzing…' : 'Start Analyzing'}
          {!analyzing && <span aria-hidden="true">→</span>}
        </button>
      </div>

      {/* Analyzing progress */}
      {analyzing && (
        <div className="glass-panel rounded-2xl p-6">
          <div className="mono-label mb-4">Analysis pipeline</div>
          <div className="space-y-3">
            {STEPS.map((label, i) => {
              const done = step > i + 1;
              const active = step === i + 1;
              return (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                      done
                        ? 'border-norm/50 bg-norm/15 text-norm'
                        : active
                          ? 'border-accent/50 bg-accent/10 text-accentSoft'
                          : 'border-line text-faint'
                    }`}
                  >
                    {done ? (
                      '✓'
                    ) : active ? (
                      <span className="h-2 w-2 animate-pulseDot rounded-full bg-accentSoft" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      done ? 'text-muted' : active ? 'text-ink' : 'text-faint'
                    }`}
                  >
                    {label}
                  </span>
                  {active && <span className="shimmer-line ml-auto h-px flex-1 animate-shimmer" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}