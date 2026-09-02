import React, { useRef, useState } from 'react';
import { parseCSV } from '../utils/csv';

export default function CsvUpload({ onParsed, disabled }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseCSV(reader.result);
        setFileName(file.name);
        onParsed(parsed);
      } catch (err) {
        setError(err.message);
        setFileName(null);
        onParsed(null);
      }
    };
    reader.onerror = () => {
      setError('Could not read the file.');
      setFileName(null);
      onParsed(null);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-lineStrong bg-panel2/60 px-6 py-10 text-center transition-colors hover:border-accent/50 hover:bg-accent/5"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload a CSV file"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          disabled={disabled}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-xl text-accentSoft">
          ⬆
        </div>
        <div>
          <p className="text-sm font-medium text-ink">
            {fileName ? fileName : 'Drop a CSV or click to browse'}
          </p>
          <p className="mt-1 text-xs text-muted">
            Columns: <span className="font-mono text-muted">test_name, value, unit</span> (optional{' '}
            <span className="font-mono text-muted">age, sex</span>)
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted">
        <a
          href="/lab_template.csv"
          download
          className="inline-flex items-center gap-1.5 text-accentSoft hover:text-accent"
        >
          <span aria-hidden="true">↓</span> Download template CSV
        </a>
        <span>Max 25 results</span>
      </div>

      {error && (
        <div
          className="rounded-lg border border-crit/30 bg-crit/10 px-3 py-2 text-sm text-crit"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
}