import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggleSwitch: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { setTheme, isDark } = useTheme();

  return (
    <div
      className={`inline-flex items-center gap-0.5 p-0.5 rounded-full border transition-colors select-none ${
        isDark
          ? 'bg-[#1E293B] border-[#334155]'
          : 'bg-[#F1F5F9] border-[#E2E8F0]'
      } ${className}`}
      role="group"
      aria-label="Theme Mode Selection"
    >
      {/* Light Mode (Sun) */}
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`flex items-center justify-center w-6 h-6 rounded-full transition-all cursor-pointer ${
          !isDark
            ? 'bg-white text-amber-600 shadow-xs font-bold scale-100'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Switch to Light Tactical Day Mode"
      >
        <Sun size={13} strokeWidth={1.75} />
      </button>

      {/* Dark Mode (Moon) */}
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`flex items-center justify-center w-6 h-6 rounded-full transition-all cursor-pointer ${
          isDark
            ? 'bg-slate-700/90 text-sky-300 shadow-xs font-bold scale-100'
            : 'text-slate-400 hover:text-slate-600'
        }`}
        title="Switch to Dark Night Ops Mode"
      >
        <Moon size={13} strokeWidth={1.75} />
      </button>
    </div>
  );
};

