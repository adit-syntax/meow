/**
 * frontend/src/components/ui/LiveClockWidget.tsx
 * SkyGuard AI — Real-Time Precision Synoptic Clock & Timezone Controller.
 * Inspired by M.O.N.K.Y. dashboard architecture with high-contrast digital display,
 * live seconds ticker, UTC/IST timezone switcher, and active synoptic node locality.
 */

import React, { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';

interface LiveClockWidgetProps {
  stationLocation?: string;
  className?: string;
}

export const LiveClockWidget: React.FC<LiveClockWidgetProps> = ({
  stationLocation = 'Pune Observatory',
  className = '',
}) => {
  const [time, setTime] = useState(new Date());
  const [useUtc, setUseUtc] = useState<boolean>(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeZone = useUtc ? 'UTC' : undefined;

  const dayOfWeek = time.toLocaleDateString('en-US', {
    weekday: 'short',
    timeZone,
  }).toUpperCase();

  const dateString = time.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone,
  }).toUpperCase();

  const hours = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    hour12: false,
    timeZone,
  });

  const minutes = time.toLocaleTimeString('en-US', {
    minute: '2-digit',
    timeZone,
  });

  const seconds = time.toLocaleTimeString('en-US', {
    second: '2-digit',
    timeZone,
  });

  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#0a0e1a]/90 backdrop-blur-md border border-white/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.4)] text-xs font-mono ${className}`}
    >
      {/* Live Active Pulsing Dot & Clock Icon */}
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
        <Clock size={13} className="text-sky-400" />
      </div>

      {/* Date Display */}
      <div className="text-[11px] font-medium text-slate-400 hidden sm:inline tracking-tight">
        <span className="text-slate-200 font-bold">{dayOfWeek}</span>, {dateString}
      </div>

      {/* Digital Time with Ticking Seconds */}
      <div className="flex items-baseline gap-0.5 bg-black/40 px-2.5 py-0.5 rounded-lg border border-white/[0.06]">
        <span className="text-sm font-extrabold text-white tracking-widest tabular-nums">
          {hours}:{minutes}
        </span>
        <span className="text-[10px] font-bold text-sky-400 tabular-nums">
          :{seconds}
        </span>
      </div>

      {/* Timezone Toggle Switcher */}
      <button
        onClick={() => setUseUtc((p) => !p)}
        className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider transition-all duration-150 cursor-pointer ${
          useUtc
            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 shadow-[0_0_8px_rgba(56,189,248,0.2)]'
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
        }`}
        title="Click to toggle between UTC (Universal) and IST / Local Time"
      >
        {useUtc ? 'UTC+00:00' : 'IST+05:30'}
      </button>

      {/* Synoptic Station Locality */}
      <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-400 pl-2 border-l border-white/[0.08]">
        <MapPin size={11} className="text-sky-400" />
        <span className="truncate max-w-[120px] font-sans font-medium text-slate-300">{stationLocation}</span>
      </div>
    </div>
  );
};
