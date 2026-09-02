import React from 'react';

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative inline-flex h-7 w-[52px] shrink-0 items-center rounded-full border border-lineStrong bg-panel2 px-0.5 transition-colors"
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs transition-all duration-300 ${
          isDark
            ? 'translate-x-6 bg-accent/20 text-accentSoft'
            : 'translate-x-0 bg-warn/20 text-warn'
        }`}
      >
        {isDark ? '☾' : '☀'}
      </span>
    </button>
  );
}