/**
 * frontend/src/components/ui/NotificationDropdown.tsx
 * SkyGuard AI — Real-Time Alert & Notification Drawer.
 * Categorized operational events, priority flags, and rapid triage shortcuts.
 */

import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Info,
  Trash2,
  ExternalLink,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export interface NotificationItem {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  stationId: string;
  timestamp: string;
  read: boolean;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onClearAll: () => void;
  onMarkRead: (id: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onMarkRead,
}) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'INFO'>('ALL');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filter === 'CRITICAL') return n.type === 'CRITICAL' || n.type === 'WARNING';
    if (filter === 'INFO') return n.type === 'INFO';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={`absolute right-0 top-12 w-80 sm:w-96 border rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-fadeIn font-mono text-xs ${
      isDark
        ? 'bg-[#0c1018]/95 border-white/[0.1] shadow-[0_16px_40px_rgba(0,0,0,0.8)]'
        : 'bg-white/95 border-slate-200 shadow-[0_16px_40px_rgba(0,0,0,0.15)] text-slate-800'
    }`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b flex items-center justify-between ${
        isDark ? 'bg-[#0f1422] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <Bell size={14} className={isDark ? 'text-rose-400' : 'text-rose-600'} />
          <span className={`font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
            NOTIFICATIONS
          </span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold text-[10px]">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className={`text-[10px] font-semibold uppercase flex items-center gap-1 transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-rose-400' : 'text-slate-500 hover:text-rose-600'
              }`}
            >
              <Trash2 size={11} /> Clear
            </button>
          )}
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={`px-4 py-2 border-b flex items-center gap-1.5 ${
        isDark ? 'bg-[#090d16] border-white/[0.06]' : 'bg-slate-100/70 border-slate-200'
      }`}>
        {(['ALL', 'CRITICAL', 'INFO'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
              filter === tab
                ? isDark
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'bg-rose-100 text-rose-800 border border-rose-300 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white border border-transparent'
                : 'text-slate-600 hover:text-slate-900 border border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04] p-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-500" />
            <p className={`font-semibold text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>All Clear</p>
            <p className="text-[11px] mt-0.5">No active unread alarms in this filter.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const isCrit = item.type === 'CRITICAL';
            const isWarn = item.type === 'WARNING';
            return (
              <div
                key={item.id}
                onClick={() => {
                  onMarkRead(item.id);
                  navigate('/alerts');
                  onClose();
                }}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                  !item.read
                    ? isCrit
                      ? isDark
                        ? 'bg-rose-950/20 border-rose-500/40 hover:bg-rose-950/30'
                        : 'bg-rose-50 border-rose-200 hover:bg-rose-100/80'
                      : isWarn
                      ? isDark
                        ? 'bg-amber-950/20 border-amber-500/40 hover:bg-amber-950/30'
                        : 'bg-amber-50 border-amber-200 hover:bg-amber-100/80'
                      : isDark
                      ? 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    : isDark
                    ? 'bg-transparent border-transparent hover:bg-white/[0.02] opacity-75'
                    : 'bg-transparent border-transparent hover:bg-slate-50 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isCrit
                          ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                          : isWarn
                          ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                          : 'bg-sky-400 shadow-[0_0_6px_#38bdf8]'
                      }`}
                    />
                    <span className={`font-bold text-[11px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</span>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                      isCrit
                        ? isDark ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-rose-100 text-rose-800 border border-rose-200'
                        : isWarn
                        ? isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-amber-100 text-amber-800 border border-amber-200'
                        : isDark ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-sky-100 text-sky-800 border border-sky-200'
                    }`}
                  >
                    {item.stationId}
                  </span>
                </div>

                <p className={`text-[11px] leading-snug mb-2 line-clamp-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={`flex items-center gap-0.5 font-bold ${isDark ? 'text-rose-400 hover:text-rose-300' : 'text-rose-600 hover:text-rose-700'}`}>
                    Triage <ExternalLink size={9} />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className={`p-2.5 border-t text-center ${
        isDark ? 'bg-[#0f1422] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
      }`}>
        <button
          onClick={() => {
            navigate('/alerts');
            onClose();
          }}
          className={`w-full py-1.5 text-center text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            isDark
              ? 'text-rose-400 hover:text-white bg-white/[0.03] hover:bg-rose-600'
              : 'text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-transparent'
          }`}
        >
          View All in Incident Center
        </button>
      </div>
    </div>
  );
};

