import React, { useState, useEffect } from 'react';

interface MonkyClockCardProps {
  temperature?: number;
  locationName?: string;
  className?: string;
}

export const MonkyClockCard: React.FC<MonkyClockCardProps> = ({
  temperature = 24.5,
  locationName = 'PUNE OBSERVATORY, IN',
  className = '',
}) => {
  const [time, setTime] = useState(new Date());
  const [isUtc, setIsUtc] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeZone = isUtc ? 'UTC' : undefined;

  // Day of week e.g. "THURSDAY"
  const dayOfWeek = time
    .toLocaleDateString('en-US', { weekday: 'long', timeZone })
    .toUpperCase();

  // Full date e.g. "SEPTEMBER 24, 2026"
  const fullDate = time
    .toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone,
    })
    .toUpperCase();

  // 12-hour format e.g. "3:28 PM"
  const time12Hour = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  });

  const tzString = isUtc ? 'UTC' : 'UTC+5:30';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#11131a] border border-white/[0.08] p-5 shadow-lg flex flex-col justify-between min-h-[165px] ${className}`}
    >
      {/* Subtle background gradient & hairline grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(244,63,94,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

      {/* Top Header: DAY OF WEEK on Left | FULL DATE on Right */}
      <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-400 font-semibold z-10">
        <span className="text-slate-400 uppercase tracking-widest">{dayOfWeek}</span>
        <span className="text-slate-300 uppercase tracking-wider">{fullDate}</span>
      </div>

      {/* Center Display: Sleek Digital Clock */}
      <div className="relative my-3 flex items-center justify-center z-10">
        <div
          onClick={() => setIsUtc((prev) => !prev)}
          className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight text-white cursor-pointer hover:text-rose-200 transition-colors flex items-center justify-center"
          title="Click to toggle UTC / Local Time"
        >
          {time12Hour}
        </div>
      </div>

      {/* Bottom Footer: TEMPERATURE | LOCALITY | TIMEZONE */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 z-10 pt-2.5 border-t border-white/[0.06]">
        <div className="text-slate-200 font-bold tracking-wider text-sm">
          {Math.round(temperature)}°C
        </div>

        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate max-w-[170px] text-center">
          {locationName}
        </div>

        <div
          onClick={() => setIsUtc((prev) => !prev)}
          className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/[0.08] cursor-pointer transition-colors"
          title="Toggle Timezone"
        >
          {tzString}
        </div>
      </div>
    </div>
  );
};
