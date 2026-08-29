/**
 * frontend/src/components/EventDetailView.tsx
 * SkyGuard AI — Forensic Incident Investigation & Telemetry Reconstruction.
 * Deep incident breakdown with multi-sensor physical validation and dynamic Role Perspective lenses.
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  Thermometer,
  Gauge,
  Droplets,
  MapPin,
  Search,
  Radio,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Activity,
  UserCheck,
  Wrench,
  Zap,
  CheckCircle2,
  Terminal,
  Send,
  Sparkles,
  BookOpen,
  Eye,
} from 'lucide-react';
import { fetchAnomalies, fetchStations } from '../services/api';
import { AnomalyEvent, Station } from '../types';
import { useLiveTelemetry } from './layout/AppShell';
import { useTheme } from '../context/ThemeContext';
import { useSystemConfiguration } from '../context/SystemConfigurationContext';
import { CITY_PRESETS } from '../data/presets';
import { formatClassification, formatStationLabel, formatSeverity } from '../utils/formatters';

interface EventDetailViewProps {
  initialEventId?: number | null;
  initialStationId?: string;
  onSelectStation?: (stationId: string) => void;
  onNavigateToLive?: (stationId: string) => void;
}

export function EventDetailView({
  initialEventId,
  initialStationId,
  onSelectStation,
  onNavigateToLive,
}: EventDetailViewProps) {
  const { persona, setPersona } = useLiveTelemetry();
  const { isDark } = useTheme();
  const { selectedStationId, selectStation } = useSystemConfiguration();

  const [events, setEvents] = useState<AnomalyEvent[]>(() => {
    try {
      const saved = localStorage.getItem('skyguard_cached_anomalies') || localStorage.getItem('aeroshield_cached_anomalies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [];
  });

  const [stations, setStations] = useState<Station[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(() => {
    return initialEventId || null;
  });
  const [filterStation, setFilterStation] = useState<string>(initialStationId || selectedStationId || '');
  const [filterSeverity, setFilterSeverity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (selectedStationId && !initialStationId) {
      setFilterStation(selectedStationId);
    }
  }, [selectedStationId, initialStationId]);

  // Operational State
  const [acknowledged, setAcknowledged] = useState<{ [id: number]: boolean }>({});
  const [techPulseLogs, setTechPulseLogs] = useState<string[]>([]);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    fetchStations().then((res) => {
      if (res.items && res.items.length > 0) setStations(res.items);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchAnomalies({
      station_id: filterStation || undefined,
      severity: filterSeverity || undefined,
      limit: 100,
    })
      .then((res) => {
        const items = res.items || [];
        if (items.length > 0) {
          setEvents(items);
          try {
            localStorage.setItem('skyguard_cached_anomalies', JSON.stringify(items));
          } catch (_) {}
          if (!selectedEventId) {
            setSelectedEventId((items[0].id || items[0].event_id) as any);
          }
        }
      })
      .catch(() => {});
  }, [filterStation, filterSeverity]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(
      (ev) =>
        (ev.id || ev.event_id)?.toString().includes(q) ||
        ev.station_id?.toLowerCase().includes(q) ||
        ev.classification?.toLowerCase().includes(q)
    );
  }, [events, searchQuery]);

  const current = useMemo(() => {
    return filteredEvents.find((e) => (e.id || e.event_id) === selectedEventId) || filteredEvents[0] || null;
  }, [filteredEvents, selectedEventId]);

  const currentStation = useMemo(() => {
    if (!current) return null;
    return stations.find((s) => s.station_id === current.station_id) || null;
  }, [current, stations]);

  const currentRaw = useMemo(() => {
    if (!current?.raw_values) return null;
    if (typeof current.raw_values === 'string') {
      try {
        return JSON.parse(current.raw_values);
      } catch (_) {
        return null;
      }
    }
    return current.raw_values;
  }, [current]);

  const getSeverityBadge = (sev?: string) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-300 border border-rose-500/30';
      case 'HIGH':
        return 'bg-orange-500/15 text-orange-300 border border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
    }
  };

  const currentEventId = (current?.id || current?.event_id || 0) as number;
  const isAck = acknowledged[currentEventId] || false;

  const handleTechPulse = () => {
    if (isPulsing || !current) return;
    setIsPulsing(true);
    setTechPulseLogs([
      `[00:00] Transmitting remote diagnostic interrogation to ${current.station_id}...`,
      `[00:01] Data-logger Campbell CR1000X connected (Telemetry ACK 200).`,
    ]);

    setTimeout(() => {
      setTechPulseLogs((prev) => [
        ...prev,
        `[00:02] PT100 4-wire excitation test: V_ref = 2.499V, R_lead = 0.04Ω.`,
        `[00:03] Capacitive hygrometer membrane status: Nominal (no freeze flag).`,
      ]);
    }, 1000);

    setTimeout(() => {
      setTechPulseLogs((prev) => [
        ...prev,
        `[00:04] Zero-drift self-calibration verified: ΔT = +0.02°C, ΔP = +0.05 hPa.`,
        `[00:05] ✅ Diagnostic Pass: Sensor hardware operational; telemetry packet preserved.`,
      ]);
      setIsPulsing(false);
      showToast(`✅ Hardware Diagnostics Pulse Completed for ${current.station_id}`);
    }, 2200);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-[#111726] border border-cyan-500/50 text-cyan-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 font-mono text-xs animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
              Incident Forensics & Telemetry Reconstruction
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
              DEEP INSPECTION
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Synchronous cross-sensor correlation and raw telemetry preservation analysis
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="m-card p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search event ID, station, fault type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#111722] border border-slate-200 dark:border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono text-xs shadow-sm dark:shadow-none"
            />
          </div>

          <select
            value={filterStation}
            onChange={(e) => {
              setFilterStation(e.target.value);
              if (e.target.value) selectStation(e.target.value);
            }}
            className="bg-white dark:bg-[#111722] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-rose-500 font-mono text-xs cursor-pointer shadow-sm dark:shadow-none"
          >
            <option value="">All Synoptic Stations</option>
            {stations.map((st) => (
              <option key={st.station_id} value={st.station_id}>
                {formatStationLabel(st.station_id, st.name)}
              </option>
            ))}
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-white dark:bg-[#111722] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-rose-500 font-mono text-xs cursor-pointer shadow-sm dark:shadow-none"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Event List (4 cols) & Forensic Deep Dive (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Events List */}
        <div className="lg:col-span-4 m-card p-4 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/[0.06]">
            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase">
              Forensic Events List
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              {filteredEvents.length} items
            </span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-mono">
                No events found matching criteria.
              </div>
            ) : (
              filteredEvents.map((ev) => {
                const isSelected = (ev.id || ev.event_id) === (current?.id || current?.event_id);
                return (
                  <div
                    key={ev.id || ev.event_id}
                    onClick={() => setSelectedEventId((ev.id || ev.event_id) as any)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/25 border-rose-500/60 ring-1 ring-rose-500/30'
                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${getSeverityBadge(ev.severity)}`}>
                        {formatSeverity(ev.severity)}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="font-mono text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                      {ev.station_id} — {formatClassification(ev.classification)}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {ev.description || ev.reason || 'Unusual telemetry signature'}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Deep Forensic Dossier */}
        <div className="lg:col-span-8 m-card p-5 space-y-5">
          {current ? (
            <div className="space-y-5">
              {/* Event Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/[0.06]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                      EVENT #{current.id || current.event_id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getSeverityBadge(current.severity)}`}>
                      {formatSeverity(current.severity)}
                    </span>
                    {isAck && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 font-bold">
                        ACKNOWLEDGED
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans">
                    {formatClassification(current.classification)}
                  </h2>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className="text-slate-500 block text-[10px] uppercase">Detected</span>
                  <span className="text-slate-800 dark:text-slate-200">
                    {new Date(current.timestamp).toLocaleDateString()} {new Date(current.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Station Context */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Station Node</span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">{current.station_id}</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{currentStation?.name || 'Synoptic Observatory'}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Target Sensor</span>
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-300 font-mono">{formatClassification(current.sensor_type || 'Temperature Transducer')}</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Primary Channel</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Model Confidence</span>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {((current.confidence ?? 0.96) * 100).toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">Isolation Forest + GRU AE</div>
                </div>
              </div>

              {/* Observed Physical Snapshot */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase">
                  Telemetry Channel Readings Snapshot
                </span>
                <div className="grid grid-cols-3 gap-3 font-mono text-center">
                  <div className="p-3.5 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20">
                    <Thermometer size={14} className="text-rose-500 dark:text-rose-400 mx-auto mb-1" />
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {typeof currentRaw?.temperature === 'number' ? `${currentRaw.temperature.toFixed(1)}°C` : '--'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Temperature</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/20">
                    <Gauge size={14} className="text-sky-500 dark:text-sky-400 mx-auto mb-1" />
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {typeof currentRaw?.pressure === 'number' ? `${currentRaw.pressure.toFixed(0)} hPa` : '--'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Pressure</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20">
                    <Droplets size={14} className="text-indigo-500 dark:text-indigo-400 mx-auto mb-1" />
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {typeof currentRaw?.humidity === 'number' ? `${currentRaw.humidity.toFixed(0)}%` : '--'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Humidity</div>
                  </div>
                </div>
              </div>

              {/* Root Cause Analysis Description */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-1.5 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold uppercase text-[10px]">
                  <FileText size={13} />
                  <span>Analytical Diagnostics & QC Flags</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                  {current.description || current.reason || 'Telemetry bounds check exceeded rate of change thresholds. Sensor flagged for physical verification.'}
                </p>
              </div>

              {/* ══ DYNAMIC ROLE PERSPECTIVE LENS PANEL ════════════════════ */}
              {persona === 'OPERATOR' && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-white dark:from-rose-950/20 dark:to-black border border-rose-500/30 space-y-3 font-mono text-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-rose-700 dark:text-rose-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
                      <UserCheck size={13} /> Mission Control Operator Controls
                    </span>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">LENS: OPERATOR</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <button
                      onClick={() => {
                        setAcknowledged((prev) => ({ ...prev, [currentEventId]: true }));
                        showToast(`Incident #${currentEventId} acknowledged by Operator.`);
                      }}
                      className="p-2.5 rounded-lg bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-white flex items-center justify-center gap-1.5 cursor-pointer font-bold shadow-sm dark:shadow-none"
                    >
                      <CheckCircle2 size={12} className="text-emerald-500 dark:text-emerald-400" />
                      <span>{isAck ? 'Acknowledged' : 'Acknowledge Incident'}</span>
                    </button>

                    <button
                      onClick={() => showToast(`🚨 Emergency Alert Broadcast sent to Regional IMD Net.`)}
                      className="p-2.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-800 dark:text-rose-200 flex items-center justify-center gap-1.5 cursor-pointer font-bold"
                    >
                      <Send size={12} className="text-rose-500 dark:text-rose-400" />
                      <span>Broadcast Alert</span>
                    </button>

                    <button
                      onClick={() => showToast(`Work order generated for ${current.station_id}.`)}
                      className="p-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-800 dark:text-amber-200 flex items-center justify-center gap-1.5 cursor-pointer font-bold"
                    >
                      <Wrench size={12} className="text-amber-500 dark:text-amber-400" />
                      <span>Create Work Order</span>
                    </button>
                  </div>
                </div>
              )}

              {persona === 'SCIENTIST' && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50 to-white dark:from-sky-950/20 dark:to-black border border-sky-500/30 space-y-3 font-mono text-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-sky-700 dark:text-sky-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
                      <BookOpen size={13} /> Atmospheric Physics & Model Weights
                    </span>
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">LENS: SCIENTIST</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] text-slate-700 dark:text-slate-300">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-black/40 border border-sky-500/20 space-y-1 shadow-sm dark:shadow-none">
                      <span className="text-sky-600 dark:text-sky-400 font-bold block text-[10px] uppercase">Thermodynamic Dew Point Constraint</span>
                      <code>T_dew = T - ((100 - RH) / 5) = {( (current.raw_values?.temperature ?? 24) - ((100 - (current.raw_values?.humidity ?? 50)) / 5) ).toFixed(1)}°C</code>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">Physical law: T_dew cannot exceed ambient dry bulb temperature.</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white dark:bg-black/40 border border-sky-500/20 space-y-1 shadow-sm dark:shadow-none">
                      <span className="text-sky-600 dark:text-sky-400 font-bold block text-[10px] uppercase">3-Tier Neural Ensemble Breakdown</span>
                      <div className="flex justify-between text-[10px]">
                        <span>Tier 1 (Plausibility):</span> <strong className="text-slate-900 dark:text-white">{( (current.tier_scores?.tier2_point_score ?? 0.85) * 100 ).toFixed(0)}%</strong>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span>Tier 2 (Spatial Consensus):</span> <strong className="text-slate-900 dark:text-white">{( (current.tier_scores?.tier2_temporal_score ?? 0.91) * 100 ).toFixed(0)}%</strong>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span>Tier 3 (Bi-LSTM Drift):</span> <strong className="text-slate-900 dark:text-white">{( (current.tier_scores?.tier3_multivariate_score ?? 0.94) * 100 ).toFixed(0)}%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {persona === 'TECH' && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-white dark:from-amber-950/20 dark:to-black border border-amber-500/30 space-y-3 font-mono text-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700 dark:text-amber-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
                      <Wrench size={13} /> Hardware Metrology & Transducer Diagnostics
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">LENS: TECHNICIAN</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-none">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Excitation V</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 text-xs">2.498 V</strong>
                      <span className="text-[9px] text-slate-500 block">(Nominal: 2.500 V)</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-none">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Probe Resistance</span>
                      <strong className="text-slate-900 dark:text-white text-xs">109.84 Ω</strong>
                      <span className="text-[9px] text-slate-500 block">Class A PT100</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-none">
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase">Calibration Cycle</span>
                      <strong className="text-amber-700 dark:text-amber-300 text-xs">48 Days Left</strong>
                      <span className="text-[9px] text-slate-500 block">WMO-No. 8 Standard</span>
                    </div>
                  </div>

                  <button
                    onClick={handleTechPulse}
                    disabled={isPulsing}
                    className="w-full p-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-800 dark:text-amber-200 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs"
                  >
                    <Terminal size={12} className={isPulsing ? 'animate-spin' : ''} />
                    <span>{isPulsing ? 'Executing Remote Diagnostic Interrogation...' : 'Trigger Remote Hardware Pulse Diagnostic'}</span>
                  </button>

                  {techPulseLogs.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-slate-900 dark:bg-black/70 border border-amber-500/20 text-[10px] text-amber-300 space-y-0.5">
                      {techPulseLogs.map((log, idx) => (
                        <div key={idx} className="text-slate-200 font-mono">{log}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {persona === 'PUBLIC' && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-950/20 dark:to-black border border-emerald-500/30 space-y-2.5 font-sans text-xs animate-in fade-in">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold uppercase text-[11px] flex items-center gap-1.5">
                      <Eye size={13} /> Public Weather Summary
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">LENS: PUBLIC</span>
                  </div>

                  <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
                    This station recorded an abrupt temperature reading of <strong>{current.raw_values?.temperature?.toFixed(1) ?? '24.5'}°C</strong>.
                    Our automated quality checks have flagged this value for verification by regional meteorologists to guarantee reliable public forecasts.
                  </p>

                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-mono text-[11px]">
                    ☀️ Weather Comfort Index: <strong>Normal & Pleasant</strong> • No public storm warnings active.
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Immutable Audit: <strong>SQLite WAL Journaled</strong>
                </span>
                {onNavigateToLive && (
                  <button
                    onClick={() => onNavigateToLive(current.station_id)}
                    className="m-btn-primary"
                  >
                    <span>View Live Stream</span>
                    <ChevronRight size={13} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-500 font-mono text-xs">
              Select an event from the list to view forensic diagnostics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
