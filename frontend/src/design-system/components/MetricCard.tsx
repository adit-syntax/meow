import React from 'react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  sublabel?: string;
  sparklineData?: number[];
  delta?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'sky';
  className?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  sublabel,
  sparklineData,
  delta,
  icon,
  badge,
  footerLeft,
  footerRight,
  accentColor = 'cyan',
  className = '',
  onClick,
}) => {
  // Generate simple SVG path for sparkline if data provided
  const generateSparklinePath = (data: number[]) => {
    if (!data || data.length < 2) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 100;
    const height = 24;
    
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  const getAccentBorder = () => {
    switch (accentColor) {
      case 'emerald':
        return 'hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]';
      case 'amber':
        return 'hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]';
      case 'rose':
        return 'hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]';
      case 'sky':
        return 'hover:border-sky-500/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]';
      case 'cyan':
      default:
        return 'hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]';
    }
  };

  const getAccentIconBg = () => {
    switch (accentColor) {
      case 'emerald':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'amber':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'rose':
        return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
      case 'sky':
        return 'bg-sky-500/10 border-sky-500/30 text-sky-400';
      case 'cyan':
      default:
        return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden bg-[#0F172A]/70 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4.5 shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-300 flex flex-col justify-between ${getAccentBorder()} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Subtle Top Ambient Gradient Flare */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Background Micro Glow */}
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none group-hover:bg-cyan-500/15 transition-all duration-500" />

      <div className="relative z-10">
        {/* Header: Label & Icon/Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
            {label}
          </span>
          <div className="flex items-center gap-2">
            {badge}
            {icon && (
              <div className={`p-2 rounded-xl border transition-all duration-300 ${getAccentIconBg()}`}>
                {icon}
              </div>
            )}
          </div>
        </div>

        {/* Value & Delta Row */}
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight tabular-nums drop-shadow-sm">
              {value}
            </span>
            {unit && (
              <span className="text-xs sm:text-sm font-semibold font-mono text-slate-400">
                {unit}
              </span>
            )}
          </div>

          {delta && (
            <span
              className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                delta.isNeutral
                  ? 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
                  : delta.isPositive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
              }`}
            >
              {delta.value}
            </span>
          )}
        </div>

        {/* Optional Sparkline Silhouette */}
        {sparklineData && sparklineData.length > 1 && (
          <div className="mt-2.5 h-6 w-full opacity-60 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 100 24" className="w-full h-full overflow-visible">
              <path
                d={generateSparklinePath(sparklineData)}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-cyan-400"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {sublabel && (
          <div className="mt-2 text-xs text-slate-400 font-medium">{sublabel}</div>
        )}
      </div>

      {/* Footer Status Row */}
      {(footerLeft || footerRight) && (
        <div className="relative z-10 mt-3.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="truncate">{footerLeft}</div>
          <div className="shrink-0">{footerRight}</div>
        </div>
      )}
    </div>
  );
};
