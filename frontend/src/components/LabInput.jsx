import React, { useState, useRef, useEffect } from 'react';

const EMPTY_ROW = { test_name: '', value: '', unit: '' };

const PREDEFINED = {
  'Hemoglobin': 'g/dL',
  'Hematocrit': '%',
  'White Blood Cell Count': '10^3/µL',
  'Red Blood Cell Count': '10^6/µL',
  'Platelet Count': '10^3/µL',
  'Mean Corpuscular Volume': 'fL',
  'Mean Corpuscular Hemoglobin': 'pg',
  'Mean Corpuscular Hemoglobin Concentration': 'g/dL',
  'Red Cell Distribution Width': '%',
  'Neutrophils': '%',
  'Lymphocytes': '%',
  'Monocytes': '%',
  'Eosinophils': '%',
  'Basophils': '%',
  'Glucose': 'mg/dL',
  'BUN': 'mg/dL',
  'Creatinine': 'mg/dL',
  'eGFR': 'mL/min/1.73m²',
  'Sodium': 'mmol/L',
  'Potassium': 'mmol/L',
  'Chloride': 'mmol/L',
  'CO2': 'mmol/L',
  'Calcium': 'mg/dL',
  'Total Protein': 'g/dL',
  'Albumin': 'g/dL',
  'Bilirubin Total': 'mg/dL',
  'Alkaline Phosphatase': 'U/L',
  'AST': 'U/L',
  'ALT': 'U/L',
  'GGT': 'U/L',
  'LDH': 'U/L',
  'TSH': 'mIU/L',
  'Free T4': 'ng/dL',
  'Free T3': 'pg/mL',
  'Hemoglobin A1c': '%',
  'Total Cholesterol': 'mg/dL',
  'LDL Cholesterol': 'mg/dL',
  'HDL Cholesterol': 'mg/dL',
  'Triglycerides': 'mg/dL',
  'Uric Acid': 'mg/dL',
  'Iron': 'µg/dL',
  'TIBC': 'µg/dL',
  'Ferritin': 'ng/mL',
  'Vitamin D': 'ng/mL',
  'Magnesium': 'mg/dL',
  'Phosphorus': 'mg/dL',
  'B12': 'pg/mL',
  'Folate': 'ng/mL',
  'CRP': 'mg/L',
  'ESR': 'mm/hr',
  'Procalcitonin': 'ng/mL',
  'D-Dimer': 'µg/mL',
  'PT': 'seconds',
  'INR': '',
  'aPTT': 'seconds',
  'Fibrinogen': 'mg/dL',
  'Lactate': 'mmol/L',
  'Amylase': 'U/L',
  'Lipase': 'U/L',
  'Troponin I': 'ng/mL',
  'CK-MB': 'ng/mL',
  'BNP': 'pg/mL',
  'NT-proBNP': 'pg/mL',
  'Urine Protein': 'mg/dL',
  'Urine Glucose': 'mg/dL',
  'Cortisol': 'µg/dL',
  'Testosterone': 'ng/dL',
  'Estradiol': 'pg/mL',
  'PSA': 'ng/mL',
  'IgA': 'mg/dL',
  'IgG': 'mg/dL',
  'IgM': 'mg/dL',
  'Complement C3': 'mg/dL',
  'Complement C4': 'mg/dL',
};

const TEST_NAMES = Object.keys(PREDEFINED);

function TestNameInput({ value, onNameChange, onUnitChange, disabled }) {
  const [text, setText] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const matches = text.trim()
    ? TEST_NAMES.filter((n) => n.toLowerCase().includes(text.trim().toLowerCase()))
    : TEST_NAMES;

  const shown = matches.slice(0, 10);

  const select = (name) => {
    setText(name);
    onNameChange(name);
    onUnitChange(PREDEFINED[name] || '');
    setOpen(false);
    setHighlighted(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => (h + 1) % shown.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => (h <= 0 ? shown.length - 1 : h - 1));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      select(shown[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative flex-1">
      <input
        ref={inputRef}
        className="field w-full"
        placeholder="Test name (e.g. Hemoglobin)"
        value={text}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setText(e.target.value);
          onNameChange(e.target.value);
          setOpen(true);
          setHighlighted(-1);
        }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      {open && shown.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-line bg-panel shadow-xl">
          {shown.map((name, i) => (
            <li key={name}>
              <button
                type="button"
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                  i === highlighted
                    ? 'bg-accent/15 text-accentSoft'
                    : 'text-ink hover:bg-panel2'
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(name)}
                onMouseEnter={() => setHighlighted(i)}
              >
                <span className="truncate">{name}</span>
                <span className="ml-2 shrink-0 font-mono text-[11px] text-muted">
                  {PREDEFINED[name]}
                </span>
              </button>
            </li>
          ))}
          <li className="border-t border-line px-3 py-2 text-[11px] text-faint">
            {matches.length} match{matches.length !== 1 && 'es'} — type a custom name if needed
          </li>
        </ul>
      )}
    </div>
  );
}

export default function LabInput({ rows, setRows, patientContext, setPatientContext, disabled }) {
  const updateRow = (i, field, val) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
  };
  const addRow = () => setRows([...rows, { ...EMPTY_ROW }]);
  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-5">
      {/* Patient context */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mono-label mb-1.5 block" htmlFor="age">Age</label>
          <input
            id="age"
            type="number"
            min="0"
            max="130"
            className="field"
            placeholder="e.g. 45"
            value={patientContext.age ?? ''}
            disabled={disabled}
            onChange={(e) =>
              setPatientContext({
                ...patientContext,
                age: e.target.value !== '' ? Number(e.target.value) : null,
              })
            }
          />
        </div>
        <div>
          <label className="mono-label mb-1.5 block" htmlFor="sex">Sex</label>
          <select
            id="sex"
            className="field"
            value={patientContext.sex ?? 'unspecified'}
            disabled={disabled}
            onChange={(e) => setPatientContext({ ...patientContext, sex: e.target.value })}
          >
            <option value="unspecified">Not specified</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      {/* Rows */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="mono-label">Results</span>
          <button type="button" className="btn-ghost" onClick={addRow} disabled={disabled}>
            + Add row
          </button>
        </div>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <TestNameInput
                value={row.test_name}
                onNameChange={(v) => updateRow(i, 'test_name', v)}
                onUnitChange={(v) => updateRow(i, 'unit', v)}
                disabled={disabled}
              />
              <input
                className="field w-24"
                placeholder="Value"
                value={row.value}
                disabled={disabled}
                onChange={(e) => updateRow(i, 'value', e.target.value)}
              />
              <input
                className="field w-24"
                placeholder="Unit"
                value={row.unit}
                disabled={disabled}
                onChange={(e) => updateRow(i, 'unit', e.target.value)}
              />
              <button
                type="button"
                className="btn-ghost !px-2.5 text-crit"
                onClick={() => removeRow(i)}
                disabled={disabled || rows.length === 1}
                aria-label={`Remove ${row.test_name || 'row'}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}