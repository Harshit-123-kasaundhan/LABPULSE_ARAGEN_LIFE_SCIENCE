import React from 'react';
import ThemeToggle from './ThemeToggle';

export default function Sidebar({
  section,
  onNavigate,
  health,
  hasResults,
  theme,
  onToggleTheme,
  open,
  onClose,
}) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-panel backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 text-accent">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path
                d="M2 12h4l2-5 4 10 3-7 1.5 2H22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="font-display text-lg font-semibold leading-none text-ink">LabPulse</div>
            <div className="mono-label mt-1">Clinical Analyzer</div>
          </div>
          <button
            className="ml-auto rounded-lg p-1.5 text-muted hover:bg-panel2 hover:text-ink lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 pt-2">
          <button
            className={`nav-item ${section === 'upload' ? 'active' : ''}`}
            onClick={() => onNavigate('upload')}
          >
            <span aria-hidden="true">⬆</span>
            Uploads
          </button>
          <button
            className={`nav-item ${section === 'analysis' ? 'active' : ''} ${
              !hasResults ? 'pointer-events-none opacity-40' : ''
            }`}
            onClick={() => onNavigate('analysis')}
            disabled={!hasResults}
          >
            <span aria-hidden="true">◉</span>
            Analysis
            {hasResults && (
              <span className="ml-auto h-1.5 w-1.5 animate-pulseDot rounded-full bg-accent" />
            )}
          </button>
        </nav>

        {/* Footer */}
        <div className="border-t border-line px-5 py-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="mono-label">Theme</span>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                health.mcp_server === 'reachable'
                  ? 'animate-pulseDot bg-norm'
                  : health.mcp_server === 'unreachable'
                    ? 'bg-warn'
                    : 'bg-unk'
              }`}
            />
            <span className="text-muted">
              {health.mcp_server === 'reachable'
                ? 'API connected'
                : health.mcp_server === 'unreachable'
                  ? 'Service starting…'
                  : 'Offline'}
            </span>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-faint">
            Illustrative demo — not medical advice.
          </p>
        </div>
      </aside>
    </>
  );
}