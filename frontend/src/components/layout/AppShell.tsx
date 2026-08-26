/**
 * frontend/src/components/layout/AppShell.tsx
 * SkyGuard AI — Precision Meteorological Console Shell.
 * Top header with Station Quick-Selector on left + Live Clock & Notifications on right (M.O.N.K.Y. Style).
 */

import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Eye,
  AlertTriangle,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Database,
  Search,
  Bell,
  Settings2,
  Pause,
  Play,
  MapPin,
  ChevronDown,
  UserCheck,
  Sun,
  Moon,
  BookOpen,
} from 'lucide-react';
import { TelemetryStreamClient } from '../../services/websocket';
import { fetchStations, fetchAnomalies } from '../../services/api';
import { InferenceResult, Station } from '../../types';
import { useSystemConfiguration } from '../../context/SystemConfigurationContext';
import { useTheme } from '../../context/ThemeContext';
import { SettingsCenter } from '../../settings/SettingsCenter';
import { CommandPaletteModal } from '../CommandPaletteModal';
import { NAV_GROUPS } from '../../app/routes';
import { LiveClockWidget } from '../ui/LiveClockWidget';
import { NotificationDropdown, NotificationItem } from '../ui/NotificationDropdown';
import { ThemeToggleSwitch } from '../ui/ThemeToggleSwitch';
import { useMisty } from '../../context/MistyContext';
import { MistyCloudAvatar } from '../misty/MistyCloudAvatar';
import { MistyTextSelectionPopup } from '../misty/MistyTextSelectionPopup';
import { MistyChatDrawer } from '../misty/MistyChatDrawer';

export type UserPersona = 'OPERATOR' | 'SCIENTIST' | 'TECH' | 'PUBLIC';

// ─── Telemetry Context ────────────────────────────────────────────────
export const TelemetryContext = React.createContext<{
  latestTelemetry: InferenceResult | null;
  historyBuffer: InferenceResult[];
  isWsConnected: boolean;
  isStreaming: boolean;
  toggleStreaming: () => void;
  packetCount: number;
  persona: UserPersona;
  setPersona: (p: UserPersona) => void;
}>({
  latestTelemetry: null,
  historyBuffer: [],
  isWsConnected: false,
  isStreaming: true,
  toggleStreaming: () => {},
  packetCount: 0,
  persona: 'OPERATOR',
  setPersona: () => {},
});

export const useTelemetry = () => React.useContext(TelemetryContext);
export const useLiveTelemetry = useTelemetry;

// ─── Tab icon map ─────────────────────────────────────────────────────
const TAB_ICONS: Record<string, any> = {
  Compass,
  Eye,
  AlertTriangle,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Database,
};

import { CITY_PRESETS } from '../../data/presets';

const ORDER_MAP = new Map(CITY_PRESETS.map((c, i) => [c.station_id, i]));

const DEFAULT_STATIONS_LIST: Station[] = CITY_PRESETS.map((c, i) => {
  const sid = c.station_id || `AWS-${i + 1}`;
  return {
    id: i + 1,
    station_id: sid,
    name: c.name,
    latitude: c.latitude,
    longitude: c.longitude,
    elevation: 216,
    status: 'ACTIVE' as const,
    health_score: undefined as any,
    health_status: undefined as any,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
});

const getCachedStations = (): Station[] => {
  try {
    const cached = localStorage.getItem('skyguard_stations_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_STATIONS_LIST;
};

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedStationId, selectStation, openSettings } = useSystemConfiguration();
  const { isAwake, toggleAwake, toggleOpen } = useMisty();
  const { theme, toggleTheme, isDark } = useTheme();

  const [latestTelemetry, setLatestTelemetry] = useState<InferenceResult | null>(null);
  const [historyBuffer, setHistoryBuffer] = useState<InferenceResult[]>([]);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);
  const [packetCount, setPacketCount] = useState(0);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [stationsList, setStationsList] = useState<Station[]>(getCachedStations);
  const [stationSearchQuery, setStationSearchQuery] = useState('');
  const [persona, setPersona] = useState<UserPersona>('OPERATOR');
  const [isStationDropdownOpen, setIsStationDropdownOpen] = useState(false);
  const [isPersonaDropdownOpen, setIsPersonaDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      type: 'INFO',
      title: 'Telemetry Ingestion Steady',
      description: 'Synchronous 1.5s interval stream active across all 34 synoptic nodes.',
      stationId: 'PUNE-EXT-001',
      timestamp: new Date().toISOString(),
      read: false,
    },
  ]);

  const isStreamingRef = useRef(true);
  isStreamingRef.current = isStreaming;

  const stationDropdownRef = useRef<HTMLDivElement>(null);
  const personaDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadStations = () => {
      fetchStations().then((res) => {
        if (res.items && res.items.length > 0) {
          const sorted = [...res.items].sort((a, b) => {
            const orderA = ORDER_MAP.get(a.station_id) ?? 999;
            const orderB = ORDER_MAP.get(b.station_id) ?? 999;
            return orderA - orderB;
          });
          setStationsList(sorted);
          try {
            localStorage.setItem('skyguard_stations_cache', JSON.stringify(sorted));
          } catch {}
        }
      }).catch(() => {});
    };
    loadStations();
    const timer = setInterval(loadStations, 3000);

    fetchAnomalies({ limit: 5 }).then((res) => {
      const items = res.items || [];
      if (items.length > 0) {
        const mapped: NotificationItem[] = items.map((a: any) => ({
          id: String(a.id || a.event_id),
          type: (a.severity === 'CRITICAL' ? 'CRITICAL' : a.severity === 'HIGH' ? 'WARNING' : 'INFO') as any,
          title: `${a.classification || 'Sensor Anomaly'} Flagged`,
          description: a.reason || a.description || 'Unusual rate of change detected.',
          stationId: a.station_id,
          timestamp: a.timestamp,
          read: false,
        }));
        setNotifications((prev) => [...mapped, ...prev]);
      }
    }).catch(() => {});

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const wsClient = new TelemetryStreamClient({
      onOpen: () => setIsWsConnected(true),
      onClose: () => setIsWsConnected(false),
      onTelemetry: (data: InferenceResult) => {
        if (!isStreamingRef.current) return;
        setLatestTelemetry(data);
        setPacketCount((c) => c + 1);
        setHistoryBuffer((prev) => {
          const next = [...prev, data];
          return next.length > 200 ? next.slice(-200) : next;
        });

        if (data.is_anomaly) {
          setNotifications((prev) => [
            {
              id: `live-${Date.now()}`,
              type: data.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
              title: `${data.classification || 'Anomalous Event'} Flagged`,
              description: data.reason || 'Telemetry deviation flagged by neural inference.',
              stationId: data.station_id,
              timestamp: data.timestamp,
              read: false,
            },
            ...prev.slice(0, 15),
          ]);
        }
      },
    });
    wsClient.connect();
    return () => wsClient.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((p) => !p);
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
        return;
      }
      const allItems = NAV_GROUPS.flatMap((g) => g.items);
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= allItems.length) navigate(allItems[n - 1].path);
      if (e.key === 's' || e.key === 'S') openSettings();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, openSettings]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (stationDropdownRef.current && !stationDropdownRef.current.contains(e.target as Node)) {
        setIsStationDropdownOpen(false);
      }
      if (personaDropdownRef.current && !personaDropdownRef.current.contains(e.target as Node)) {
        setIsPersonaDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleStreaming = () => setIsStreaming((s) => !s);
  const isActive = (path: string) => location.pathname.startsWith(path);
  const allTabs = NAV_GROUPS.flatMap((g) => g.items);

  const currentStationObj = stationsList.find((s) => s.station_id === selectedStationId) || stationsList[0] || {
    station_id: 'PUNE-EXT-001',
    name: 'Pune Weather Observatory',
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <TelemetryContext.Provider
      value={{ latestTelemetry, historyBuffer, isWsConnected, isStreaming, toggleStreaming, packetCount, persona, setPersona }}
    >
      <div className={`meridian-root ${isDark ? 'dark' : 'light'}`}>
        {/* ══ TOP HEADER BAR ═════════════════════════════════════════ */}
        <header className={`h-14 px-4 sm:px-6 lg:px-8 border-b sticky top-0 z-30 flex items-center justify-between gap-3 transition-colors ${
          isDark
            ? 'border-white/[0.08] bg-[#0c0d12]/95 backdrop-blur-md text-white'
            : 'border-slate-200 bg-white/95 backdrop-blur-md text-slate-900 shadow-xs'
        }`}>
          {/* Left: Brand + Station Selector */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div
              className="flex items-center gap-2.5 cursor-pointer group select-none"
              onClick={() => navigate('/synoptic')}
              title="SkyGuard AI — Return to Synoptic Grid"
            >
              <img
                src="/logo-icon.png"
                alt="SkyGuard AI Icon"
                className="size-7.5 sm:size-8 object-contain transition-transform group-hover:scale-105 duration-200 drop-shadow-sm"
              />
              <div className="flex items-center">
                <img
                  src={isDark ? "/logo-text-dark.png" : "/logo-text-light.png"}
                  alt="SkyGuard AI"
                  className="h-4.5 sm:h-5 object-contain"
                />
              </div>
            </div>

            {/* Station Quick Selector Dropdown */}
            <div className="relative" ref={stationDropdownRef}>
              <button
                onClick={() => setIsStationDropdownOpen((p) => !p)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                  isDark
                    ? 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] text-slate-200'
                    : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-800'
                }`}
                title="Select Synoptic Station"
              >
                <MapPin size={11} className="text-rose-400" />
                <span className="font-semibold">{currentStationObj.station_id}</span>
                <ChevronDown size={11} className="opacity-70" />
              </button>

              {isStationDropdownOpen && (
                <div className={`absolute left-0 mt-1.5 w-72 rounded-xl shadow-2xl z-50 py-1.5 animate-fadeIn font-mono text-xs backdrop-blur-xl flex flex-col max-h-[420px] border ${
                  isDark ? 'bg-[#0c0e17]/95 border-white/[0.12] text-slate-300' : 'bg-white border-slate-200 text-slate-900'
                }`}>
                  <div className={`px-3 py-2 border-b flex items-center justify-between ${isDark ? 'border-white/[0.08]' : 'border-slate-100'}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                      Synoptic Array ({stationsList.length} Nodes)
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${isDark ? 'bg-white/[0.05] text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                      WMO Grid
                    </span>
                  </div>

                  {/* Search Filter */}
                  <div className={`p-2 border-b ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                    <input
                      type="text"
                      value={stationSearchQuery}
                      onChange={(e) => setStationSearchQuery(e.target.value)}
                      placeholder="Filter stations by code, city..."
                      className={`w-full px-2.5 py-1 text-[11px] rounded-lg focus:outline-none border ${
                        isDark
                          ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-slate-500 focus:border-amber-500/50'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500/50'
                      }`}
                      autoFocus
                    />
                  </div>

                  {/* Scrollable Stations List */}
                  <div className="overflow-y-auto max-h-[300px] divide-y divide-slate-100 dark:divide-white/[0.03]">
                    {stationsList
                      .filter(
                        (st) =>
                          st.station_id.toLowerCase().includes(stationSearchQuery.toLowerCase()) ||
                          st.name.toLowerCase().includes(stationSearchQuery.toLowerCase())
                      )
                      .map((st) => (
                        <button
                          key={st.station_id}
                          onClick={() => {
                            selectStation(st.station_id);
                            setIsStationDropdownOpen(false);
                            setStationSearchQuery('');
                          }}
                          className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer ${
                            st.station_id === selectedStationId
                              ? (isDark ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'bg-sky-50 text-sky-800 font-semibold')
                              : (isDark ? 'text-slate-300' : 'text-slate-700')
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="block font-bold text-[11px]">{st.station_id}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans truncate block">
                              {st.name}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span
                              className={`text-[10px] font-bold ${
                                (st.health_score ?? 85) >= 85
                                  ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                                  : (st.health_score ?? 85) >= 60
                                  ? (isDark ? 'text-amber-400' : 'text-amber-600')
                                  : 'text-rose-500'
                              }`}
                            >
                              {typeof st.health_score === 'number' ? `${st.health_score.toFixed(1)}%` : '--'}
                            </span>
                            <span className="block text-[8px] text-slate-400 dark:text-slate-500 uppercase">
                              {st.health_status || ((st.health_score ?? 85) >= 85 ? 'Nominal' : (st.health_score ?? 85) >= 60 ? 'Degraded' : 'Critical')}
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ══ CENTER: DOCS BUTTON + ASK MISTY + THEME TOGGLE ═══ */}
          <div className="flex items-center justify-center gap-2.5 flex-1 max-w-lg mx-auto">
            {/* Documentation Button */}
            <button
              onClick={() => navigate('/docs')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer border select-none ${
                location.pathname === '/docs'
                  ? (isDark ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]' : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 shadow-xs')
                  : (isDark ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700')
              }`}
              title="SkyGuard AI — System Documentation & Field Manual"
            >
              <BookOpen size={13} className={location.pathname === '/docs' ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-amber-500' : 'text-amber-600')} />
              <span>Docs</span>
            </button>

            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all select-none ${
                isDark
                  ? (isAwake ? 'bg-[#111726] border-white/15 text-slate-200 hover:border-white/25 shadow-sm' : 'bg-[#0e131f] border-white/[0.08] text-slate-400 hover:border-white/[0.15]')
                  : (isAwake ? 'bg-slate-100 border-slate-300 text-slate-900 hover:border-slate-400 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300')
              }`}
            >
              {/* Cloud Avatar */}
              <div
                onClick={toggleOpen}
                className="cursor-pointer hover:opacity-90 transition-opacity"
                title="Open Ask Misty"
              >
                <MistyCloudAvatar size="sm" isAwake={isAwake} interactive={true} showSleepZzz={false} />
              </div>

              {/* Title: Ask Misty */}
              <div
                onClick={toggleOpen}
                className="flex items-center gap-1.5 cursor-pointer font-sans"
              >
                <span className={`text-xs font-semibold tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Ask Misty
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isAwake ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'
                  }`}
                />
              </div>

              {/* Separator */}
              <div className={`w-px h-3 mx-0.5 ${isDark ? 'bg-white/10' : 'bg-slate-300'}`} />

              {/* Sleep / Awake Toggle Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAwake();
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium transition-all cursor-pointer border ${
                  isDark
                    ? (isAwake ? 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/10' : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 border-white/[0.08]')
                    : (isAwake ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-xs' : 'bg-slate-200/60 hover:bg-slate-200 text-slate-600 border-slate-200')
                }`}
                title={isAwake ? 'Misty is Awake (Click to Sleep)' : 'Misty is Asleep (Click to Awake)'}
              >
                <span>{isAwake ? 'Awake' : 'Asleep'}</span>
              </button>
            </div>

            {/* Uiverse Animated Theme Switch on the far right of Ask Misty */}
            <ThemeToggleSwitch />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Persona Switcher Dropdown */}
            <div className="relative" ref={personaDropdownRef}>
              <button
                onClick={() => setIsPersonaDropdownOpen((p) => !p)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                  isDark
                    ? (persona === 'OPERATOR' ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' :
                       persona === 'SCIENTIST' ? 'bg-sky-500/15 border-sky-500/40 text-sky-300' :
                       persona === 'TECH' ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' :
                       'bg-emerald-500/15 border-emerald-500/40 text-emerald-300')
                    : (persona === 'OPERATOR' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                       persona === 'SCIENTIST' ? 'bg-sky-50 border-sky-200 text-sky-700' :
                       persona === 'TECH' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                       'bg-emerald-50 border-emerald-200 text-emerald-800')
                }`}
                title="Switch User Role Perspective"
              >
                <UserCheck size={12} />
                <span className="text-[11px] hidden md:inline">{persona}</span>
                <ChevronDown size={11} className="opacity-70" />
              </button>

              {isPersonaDropdownOpen && (
                <div className={`absolute right-0 mt-1.5 w-60 rounded-xl shadow-2xl z-50 py-1.5 animate-fadeIn font-mono text-xs backdrop-blur-xl border ${
                  isDark ? 'bg-[#0c0e17] border-white/[0.12]' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b flex items-center justify-between ${
                    isDark ? 'border-white/[0.06] text-slate-400' : 'border-slate-100 text-slate-600'
                  }`}>
                    <span>Role Perspective</span>
                    <span className={`text-[9px] ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>Live Lens</span>
                  </div>
                  {[
                    { id: 'OPERATOR', label: 'OPERATOR', desc: 'Mission control & triage' },
                    { id: 'SCIENTIST', label: 'SCIENTIST', desc: 'Physical laws & metrics' },
                    { id: 'TECH', label: 'TECHNICIAN', desc: 'Sensor drift & maintenance' },
                    { id: 'PUBLIC', label: 'PUBLIC', desc: 'General weather overview' },
                  ].map((role) => {
                    const isSelected = persona === role.id;
                    return (
                      <button
                        key={role.id}
                        onClick={() => {
                          setPersona(role.id as UserPersona);
                          setIsPersonaDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer flex items-start gap-2 ${
                          isSelected ? (isDark ? 'bg-white/[0.08] text-white font-semibold' : 'bg-slate-100 text-slate-900 font-semibold') : (isDark ? 'text-slate-300' : 'text-slate-700')
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                          role.id === 'OPERATOR' ? 'bg-rose-500' :
                          role.id === 'SCIENTIST' ? 'bg-sky-500' :
                          role.id === 'TECH' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <div>
                          <div className="font-bold text-xs">{role.label}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">{role.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Live Stream Controller */}
            <button
              onClick={toggleStreaming}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all cursor-pointer ${
                isDark
                  ? (isStreaming && isWsConnected
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                      : !isStreaming
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800/80 text-slate-400 border-white/[0.08]')
                  : (isStreaming && isWsConnected
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      : !isStreaming
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200')
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isStreaming && isWsConnected
                    ? 'bg-rose-500 animate-pulse'
                    : !isStreaming
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
                }`}
              />
              <span className="hidden sm:inline font-mono text-[11px]">
                {!isStreaming ? 'PAUSED' : isWsConnected ? 'LIVE' : 'OFFLINE'}
              </span>
              {isStreaming ? <Pause size={10} className="text-rose-500" /> : <Play size={10} />}
            </button>

            {/* Search */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] text-slate-400 hover:text-white'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Search (/) or Ctrl+K"
            >
              <Search size={14} />
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setIsNotificationsOpen((p) => !p)}
                className={`p-1.5 rounded-lg border transition-colors relative cursor-pointer ${
                  isDark
                    ? 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] text-slate-400 hover:text-white'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="Notifications"
              >
                <Bell size={14} />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 px-1 py-0.2 font-mono text-[9px] font-bold rounded-full bg-rose-600 text-white leading-none">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={notifications}
                onClearAll={() => setNotifications([])}
                onMarkRead={(id) => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                  );
                }}
              />
            </div>


            {/* Settings */}
            <button
              onClick={openSettings}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] text-slate-400 hover:text-white'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="System Settings"
            >
              <Settings2 size={14} />
            </button>
          </div>
        </header>

        {/* ══ HORIZONTAL TAB NAVIGATION ═══════════════════════════════ */}
        <nav className={`border-b sticky top-14 z-20 px-4 sm:px-6 lg:px-8 transition-colors ${
          isDark
            ? 'border-white/[0.08] bg-[#090b10]/95 backdrop-blur-md'
            : 'border-slate-200 bg-[#f8fafc]/95 backdrop-blur-md'
        }`}>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 -mb-px scrollbar-none">
            {allTabs.map((tab) => {
              const Icon = TAB_ICONS[tab.icon] || Compass;
              const active = isActive(tab.path);
              return (
                <button
                  key={tab.id}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 font-sans cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none ${
                    isDark
                      ? (active
                          ? 'text-white bg-white/[0.06] border border-white/10 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02] border border-transparent')
                      : (active
                          ? 'text-[#0369a1] bg-[#eff6ff] border border-sky-300/80 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border border-transparent')
                  }`}
                  onClick={() => navigate(tab.path)}
                  title={`${tab.label} (${tab.shortcut})`}
                >
                  <Icon
                    size={13}
                    className={
                      active
                        ? (isDark ? 'text-rose-400' : 'text-[#0284c7]')
                        : (isDark ? 'text-slate-400' : 'text-slate-500')
                    }
                  />
                  <span>{tab.label}</span>

                  {/* Clean Active Indicator */}
                  {active && (
                    <div
                      className={`absolute bottom-0 left-2.5 right-2.5 h-0.5 rounded-full ${
                        isDark ? 'bg-rose-500' : 'bg-[#0284c7]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ══ MAIN VIEWPORT ═══════════════════════════════════════════ */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 flex flex-col gap-5">
          <Outlet />
        </main>

        {/* ══ FOOTER STATUS BAR ═══════════════════════════════════════ */}
        <footer className={`h-8 px-5 border-t flex items-center justify-between text-[11px] font-mono shrink-0 transition-colors ${
          isDark
            ? 'bg-[#090b10] border-white/[0.06] text-slate-400'
            : 'bg-[#f8fafc] border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 font-medium ${
              isDark ? 'text-emerald-400' : 'text-emerald-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                isDark ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-emerald-600'
              }`} />
              Core Ingestion Nominal
            </span>
            <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>•</span>
            <span className={`hidden sm:inline ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Packets: <strong className={isDark ? 'text-slate-300' : 'text-slate-800'}>{packetCount}</strong>
            </span>
            <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>•</span>
            <span className={`hidden md:inline font-semibold ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>
              Lens: {persona}
            </span>
          </div>
          <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            SkyGuard AI-Intelligent Weather Monitoring
          </div>
        </footer>
      </div>

      {/* ══ GLOBAL MODALS ══════════════════════════════════════════════ */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        stations={stationsList}
        selectedStationId={selectedStationId}
        onSelectStation={selectStation}
        onNavigateTab={(tab) => {
          const pathMap: Record<string, string> = {
            overview: '/synoptic',
            live: '/telemetry',
            alerts: '/alerts',
            events: '/forensics',
            explainability: '/diagnostics',
            health: '/sensors',
            injector: '/simulator',
            explorer: '/archive',
          };
          navigate(pathMap[tab] || '/synoptic');
        }}
        isStreaming={isStreaming}
        onToggleStreaming={toggleStreaming}
        onOpenSettings={openSettings}
      />
      <SettingsCenter />
      <MistyTextSelectionPopup />
      <MistyChatDrawer />
    </TelemetryContext.Provider>
  );
}
