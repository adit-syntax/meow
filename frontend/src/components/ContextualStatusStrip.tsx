/**
 * frontend/src/components/ContextualStatusStrip.tsx
 * SkyGuard AI — Premium Operational Context Strip.
 * Fully theme-reactive with low visual weight and crisp typography in light/dark modes.
 */

import React from 'react';
import { Radio, Globe, Cpu, SlidersHorizontal, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { useSystemConfiguration } from '../context/SystemConfigurationContext';
import { useTheme } from '../context/ThemeContext';
import { StatusBadge } from '../design-system/components/StatusBadge';

interface ContextualStatusStripProps {
  className?: string;
}

export const ContextualStatusStrip: React.FC<ContextualStatusStripProps> = ({ className = '' }) => {
  const { activeSource, selectedCity, selectedStationId, activeSourceStatus, openSettings } = useSystemConfiguration();
  const { isDark } = useTheme();

  const src = (() => {
    switch (activeSource) {
      case 'SIMULATED':
        return {
          icon: <Radio className="w-3 h-3" />,
          label: 'SIMULATED AWS STREAM',
          tag: 'SYNTHETIC',
          colorDark: '245,158,11',
          bgLight: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'EXTERNAL_API':
        return {
          icon: <Globe className="w-3 h-3" style={{ animation: 'spin 10s linear infinite' }} />,
          label: selectedCity ? `OPEN-METEO · ${selectedCity.name.toUpperCase()}` : 'OPEN-METEO LIVE',
          tag: 'LIVE FEED',
          colorDark: '6,182,212',
          bgLight: 'bg-sky-50 text-sky-800 border-sky-200',
        };
      case 'PHYSICAL_AWS':
        return {
          icon: <Cpu className="w-3 h-3" />,
          label: 'PHYSICAL AWS (ESP32)',
          tag: 'SERIAL/MQTT',
          colorDark: '16,185,129',
          bgLight: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      default:
        return {
          icon: <Radio className="w-3 h-3" />,
          label: 'SIMULATED',
          tag: 'SYNTHETIC',
          colorDark: '245,158,11',
          bgLight: 'bg-amber-50 text-amber-800 border-amber-200',
        };
    }
  })();

  return (
    <div
      className={`relative overflow-hidden rounded-2xl flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs font-mono transition-colors ${
        isDark
          ? 'bg-[#0b0e18]/90 border border-white/[0.08] shadow-[0_2px_16px_rgba(0,0,0,0.3)] text-slate-300'
          : 'bg-white border border-slate-200 shadow-xs text-slate-700'
      } ${className}`}
    >
      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background: isDark
            ? `linear-gradient(90deg, transparent, rgba(${src.colorDark},0.4) 30%, rgba(${src.colorDark},0.4) 70%, transparent)`
            : 'linear-gradient(90deg, transparent, rgba(2,132,199,0.3) 30%, rgba(2,132,199,0.3) 70%, transparent)',
        }}
      />

      {/* Left: Source + Station */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Source pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-bold text-[10px] tracking-wider transition-colors ${
            isDark
              ? `bg-[rgba(${src.colorDark},0.08)] border-[rgba(${src.colorDark},0.3)] text-[rgba(${src.colorDark},1)]`
              : src.bgLight
          }`}
        >
          {src.icon}
          <span>{src.label}</span>
          <span
            className={`text-[8px] px-1 py-0.5 rounded font-bold ${
              isDark ? 'bg-white/10 text-white/90' : 'bg-black/5 text-slate-700'
            }`}
          >
            {src.tag}
          </span>
        </div>

        <div className={`h-4 w-px hidden sm:block ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

        {/* Station ID */}
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isDark
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-300'
                : 'bg-sky-50 border-sky-200 text-sky-800'
            }`}
          >
            {selectedStationId}
          </span>
          {selectedCity && (
            <span className={`hidden md:block text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {selectedCity.name}, {selectedCity.country}
            </span>
          )}
          {selectedCity && (
            <span
              className={`hidden lg:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border ${
                isDark
                  ? 'bg-white/[0.04] border-white/[0.06] text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <MapPin className="w-2.5 h-2.5 text-sky-500" />
              {selectedCity.latitude.toFixed(2)}°N, {selectedCity.longitude.toFixed(2)}°E
            </span>
          )}
        </div>
      </div>

      {/* Right: Status + Controls */}
      <div className="flex items-center gap-2">
        <StatusBadge
          label={activeSourceStatus?.status || 'STREAM NOMINAL'}
          variant={
            activeSourceStatus?.status === 'CONNECTED' || activeSourceStatus?.status === 'RUNNING'
              ? 'nominal'
              : 'warning'
          }
          size="sm"
          pulse={true}
        />

        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] border ${
            isDark
              ? 'bg-white/[0.04] border-white/[0.06] text-slate-400'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          <Clock className="w-2.5 h-2.5" />
          Latency: <strong className={isDark ? 'text-emerald-300' : 'text-emerald-700 font-bold'}>{activeSourceStatus?.data_age_seconds ?? 1}s</strong>
        </div>

        <div
          className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] border ${
            isDark
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300 shadow-[0_0_8px_-2px_rgba(16,185,129,0.15)]'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          5-TIER QC ACTIVE
        </div>

        <button
          onClick={openSettings}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all group cursor-pointer ${
            isDark
              ? 'bg-white/[0.05] border-white/[0.09] text-slate-400 hover:text-white hover:border-sky-400/50'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <SlidersHorizontal className="w-3 h-3 group-hover:rotate-45 transition-transform" />
          Config
        </button>
      </div>
    </div>
  );
};
