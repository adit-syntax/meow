import React, { useState } from 'react';
import { AnomalyEvent } from '../../types';

interface MonkyNotificationCardProps {
  anomalies?: AnomalyEvent[];
  onNavigateToEvents?: () => void;
  className?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  level: 'HIGH' | 'MED' | 'LOW' | 'INFO';
  description: string;
  timestamp: string;
}

export const MonkyNotificationCard: React.FC<MonkyNotificationCardProps> = ({
  anomalies = [],
  onNavigateToEvents,
  className = '',
}) => {
  const [cleared, setCleared] = useState(false);

  const defaultNotifications: NotificationItem[] = [
    {
      id: 'notif-1',
      title: 'SYNOPTIC INGESTION ACTIVE',
      level: 'INFO',
      description: 'SQLite WAL ingestion active across all 9 regional telemetry stations.',
      timestamp: '24/09/2026',
    },
    {
      id: 'notif-2',
      title: 'SPATIAL BUDDY CONSENSUS',
      level: 'LOW',
      description: 'Tier 3.5 spatial buddy checks synchronized with zero network drift.',
      timestamp: '24/09/2026',
    },
    {
      id: 'notif-3',
      title: 'NEURAL MODEL PIPELINE',
      level: 'MED',
      description: 'Point ML + Temporal ConvNet inference running at 18.2ms latency.',
      timestamp: '24/09/2026',
    },
  ];

  // Convert real anomalies if present
  const anomalyNotifications: NotificationItem[] = anomalies.map((a) => ({
    id: `anomaly-${a.id}`,
    title: `${(a.classification || a.anomaly_type || 'ANOMALY').replace(/_/g, ' ')} (${a.station_id})`.toUpperCase(),
    level: a.severity === 'CRITICAL' ? 'HIGH' : a.severity === 'HIGH' ? 'MED' : 'LOW',
    description: a.reason || `Telemetry anomaly flagged by multi-tier isolation. Confidence: ${((a.confidence ?? 0.85) * 100).toFixed(0)}%.`,
    timestamp: new Date(a.timestamp || a.created_at || Date.now()).toLocaleDateString('en-GB'),
  }));

  const displayList = cleared
    ? []
    : anomalyNotifications.length > 0
    ? anomalyNotifications.slice(0, 3)
    : defaultNotifications;

  const getLevelColor = (level: NotificationItem['level']) => {
    switch (level) {
      case 'HIGH':
        return { dot: 'bg-rose-500', tag: 'text-rose-400 bg-rose-500/10' };
      case 'MED':
        return { dot: 'bg-amber-400', tag: 'text-amber-400 bg-amber-500/10' };
      case 'LOW':
        return { dot: 'bg-emerald-400', tag: 'text-emerald-400 bg-emerald-500/10' };
      default:
        return { dot: 'bg-sky-400', tag: 'text-sky-400 bg-sky-500/10' };
    }
  };

  return (
    <div
      className={`rounded-2xl bg-[#11131a] border border-white/[0.08] p-5 shadow-lg flex flex-col justify-between ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <h3 className="text-xs font-bold font-mono tracking-widest text-slate-200 uppercase">
            INCIDENT LOGS
          </h3>
        </div>

        <button
          onClick={() => setCleared(true)}
          className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 hover:text-white transition-colors uppercase cursor-pointer"
        >
          CLEAR ALL
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3.5 my-1">
        {displayList.length === 0 ? (
          <div className="py-6 text-center text-xs font-mono text-slate-500">
            No active incidents. Station stream nominal.
          </div>
        ) : (
          displayList.map((item) => {
            const colors = getLevelColor(item.level);
            return (
              <div key={item.id} className="space-y-1">
                {/* Title row with Status Dot + Level */}
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} shrink-0`} />
                  <span className="text-[11px] font-bold font-mono text-slate-200 tracking-wide truncate">
                    {item.title}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ml-auto shrink-0 ${colors.tag}`}
                  >
                    {item.level}
                  </span>
                </div>

                {/* Subtitle / Description */}
                <p className="text-[11px] font-sans text-slate-400 line-clamp-2 leading-relaxed pl-3.5">
                  {item.description}
                </p>

                {/* Date */}
                <div className="text-[10px] font-mono text-slate-500 pl-3.5">
                  {item.timestamp}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer: SHOW ALL */}
      <div className="pt-3 mt-3 border-t border-white/[0.06] text-center">
        <button
          onClick={onNavigateToEvents}
          className="text-[11px] font-mono font-bold tracking-widest text-slate-400 hover:text-rose-400 transition-colors uppercase cursor-pointer"
        >
          SHOW ALL ({displayList.length + 1})
        </button>
      </div>
    </div>
  );
};
