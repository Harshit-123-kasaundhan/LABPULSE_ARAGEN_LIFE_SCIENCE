import React from 'react';

export default function ExplanationPanel({ result }) {
  if (result.explanation_status === 'unavailable') {
    return (
      <div className="rounded-lg border border-warn/25 bg-warn/5 p-4 text-[15px] text-ink">
        <span className="font-semibold text-warn">AI explanation temporarily unavailable.</span>{' '}
        The classification above is complete and unaffected.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-line bg-panel2/60 p-5 text-[15px] leading-relaxed text-ink">
      <div>
        <h4 className="mb-1.5 font-display text-lg font-semibold text-ink">Explanation</h4>
        <p>{result.explanation}</p>
      </div>

      {result.clinical_significance && (
        <div>
          <h4 className="mb-1.5 font-display text-lg font-semibold text-ink">
            Clinical Significance
          </h4>
          <p>{result.clinical_significance}</p>
        </div>
      )}

      {result.next_steps && result.next_steps.length > 0 && (
        <div>
          <h4 className="mb-1.5 font-display text-base font-semibold text-ink">
            Suggested Next Steps
          </h4>
          <ul className="space-y-1.5">
            {result.next_steps.map((step, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="mt-0.5 text-accent" aria-hidden="true">▸</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}