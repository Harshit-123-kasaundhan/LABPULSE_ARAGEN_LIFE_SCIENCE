// Minimal RFC-4180-ish CSV parser + request builder for lab result uploads.
//
// Expected CSV structure (header row required):
//   test_name,value,unit,age,sex
//   Hemoglobin,8.1,g/dL,45,female
//   Potassium,6.9,mmol/L,,
//
//   test_name (required) : name of the lab test, e.g. "Hemoglobin"
//   value     (required) : numeric result value, e.g. 8.1
//   unit      (required) : unit of measure, e.g. "g/dL"
//   age       (optional) : patient age — only the first data row is read
//   sex       (optional) : patient sex "male"/"female" — only the first data row is read
//
// A 3-column variant (test_name,value,unit — as used by /test_data) is also
// accepted; age/sex are simply omitted.

function splitRow(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields.map((f) => f.trim());
}

export function parseCSV(text) {
  const cleaned = text.replace(/^\uFEFF/, ''); // strip BOM
  const lines = cleaned.split(/\r?\n/).map((l) => l.trimEnd());
  const dataLines = lines.filter((l) => l.trim() !== '');

  if (dataLines.length < 2) {
    throw new Error('CSV must have a header row and at least one data row.');
  }

  const header = splitRow(dataLines[0]).map((h) => h.toLowerCase());
  const idx = (name) => header.indexOf(name);
  const iTest = idx('test_name');
  const iValue = idx('value');
  const iUnit = idx('unit');
  const iAge = idx('age');
  const iSex = idx('sex');

  if (iTest === -1 || iValue === -1 || iUnit === -1) {
    throw new Error(
      'CSV must contain columns: test_name, value, unit (optional: age, sex).'
    );
  }

  const results = [];
  const patientContext = { age: null, sex: null };
  let firstDataRow = true;

  for (let i = 1; i < dataLines.length; i++) {
    const f = splitRow(dataLines[i]);
    const test = (f[iTest] || '').trim();
    const valueStr = (f[iValue] || '').trim();
    const unit = (f[iUnit] || '').trim();

    if (firstDataRow) {
      firstDataRow = false;
      if (iAge !== -1 && f[iAge] && f[iAge].trim() !== '') {
        const a = Number(f[iAge]);
        if (!isNaN(a)) patientContext.age = a;
      }
      if (iSex !== -1 && f[iSex] && f[iSex].trim() !== '') {
        const s = f[iSex].trim().toLowerCase();
        if (s === 'male' || s === 'female') patientContext.sex = s;
      }
    }

    // Skip fully empty rows
    if (!test && !valueStr && !unit) continue;

    if (!test || !unit || valueStr === '' || isNaN(Number(valueStr))) {
      throw new Error(
        `Row ${i + 1} is invalid: each row needs a test_name, a numeric value, and a unit.`
      );
    }

    results.push({ test_name: test, value: Number(valueStr), unit });

    if (results.length > 25) {
      throw new Error('CSV contains more than 25 results (max is 25).');
    }
  }

  if (results.length === 0) {
    throw new Error('No valid lab results found in the CSV.');
  }

  return { results, patientContext };
}

export function buildLabRequest(parsed) {
  return {
    patient_context: {
      age: parsed.patientContext.age ?? null,
      sex: parsed.patientContext.sex ?? null
    },
    results: parsed.results
  };
}
