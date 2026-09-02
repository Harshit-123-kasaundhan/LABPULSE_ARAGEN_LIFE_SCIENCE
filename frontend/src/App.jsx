import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import UploadSection from './components/UploadSection';
import AnalysisSection from './components/AnalysisSection';
import ThemeToggle from './components/ThemeToggle';
import { analyzeLabs, getHealth } from './api/client';

const THEME_KEY = 'labpulse-theme';

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* ignore */
  }
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [health, setHealth] = useState({ status: 'unknown', mcp_server: 'unknown' });
  const [section, setSection] = useState('upload');
  const [analyzing, setAnalyzing] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    const check = async () => {
      const h = await getHealth();
      setHealth(h);
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [section]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const navigate = (s) => {
    setSection(s);
    setSidebarOpen(false);
  };

  const handleAnalyze = async (requestData) => {
    setAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeLabs(requestData);
      setResultsData(data);
      setSection('analysis');
    } catch (err) {
      setError(
        err.status === 422
          ? 'Invalid input data. Please check your fields.'
          : 'Analysis service is unavailable right now.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="grain min-h-screen bg-base text-ink">
      {/* Blueprint backdrop */}
      <div className="bg-grid bg-grid-fade pointer-events-none fixed inset-0" />

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-panel/90 px-4 backdrop-blur-xl lg:hidden">
        <button
          className="rounded-lg p-2 text-muted hover:bg-panel2 hover:text-ink"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent/40 bg-accent/10 text-accent">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <path
                d="M2 12h4l2-5 4 10 3-7 1.5 2H22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="font-display text-lg font-semibold text-ink">LabPulse</span>
        </div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      <Sidebar
        section={section}
        onNavigate={navigate}
        health={health}
        hasResults={!!resultsData}
        theme={theme}
        onToggleTheme={toggleTheme}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="relative z-10 min-h-screen lg:ml-60">
        <div className="mx-auto max-w-5xl px-4 py-6 pt-20 md:px-8 lg:px-10 lg:pt-10">
          {/* Page header */}
          <header className="mb-8">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              <div className="mono-label">Clinical Lab Results Analyzer</div>
            </div>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
              {section === 'upload' ? 'Upload results' : 'Review analysis'}
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
              {section === 'upload'
                ? 'Enter results manually or upload a CSV. One click classifies, routes and explains every value.'
                : 'Step through each result — see where it sits against its reference range and what it means.'}
            </p>
          </header>

          {/* Error banner */}
          {error && (
            <div
              className="mb-6 flex items-start justify-between rounded-xl border border-crit/30 bg-crit/10 px-4 py-3 text-sm text-crit"
              role="alert"
            >
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-4 text-crit/70 hover:text-crit"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          )}

          {/* Sections */}
          {section === 'upload' && <UploadSection onAnalyze={handleAnalyze} analyzing={analyzing} />}

          {section === 'analysis' && resultsData && (
            <AnalysisSection
              results={resultsData.ordered_results}
              summary={resultsData.summary}
              generatedAt={resultsData.generated_at}
              model={resultsData.model}
            />
          )}

          {/* Footer */}
          <footer className="mt-14 border-t border-line pt-6 text-xs text-faint">
            <p className="max-w-3xl">
              <strong className="font-semibold text-muted">Disclaimer:</strong> Illustrative
              demonstration — reference ranges are example adult values and this is not medical
              advice. Outputs from the LLM model ({resultsData?.model || 'AI'}) may be inaccurate.
              Always consult a physician for medical decisions.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}