/**
 * frontend/src/components/DataExplorerView.tsx
 * SkyGuard AI — Historical Synoptic Archive & Time-Machine Playback Matrix.
 * Interactive past time-travel scrubber, multi-station historical telemetry waveforms, WMO statistical digests & batch CSV ingestion.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  Database,
  Upload,
  Download,
  RefreshCw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Thermometer,
  Gauge,
  Droplets,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Search,
  TrendingUp,
  History,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { fetchObservations, fetchStations, fetchAnomalies, uploadCSV } from '../services/api';
import { Observation, Station, InferenceResult, AnomalyEvent } from '../types';
import { CITY_PRESETS } from '../data/presets';
import { useTheme } from '../context/ThemeContext';
import { useSystemConfiguration } from '../context/SystemConfigurationContext';

type TimeRangePreset = '1h' | '6h' | '24h' | '7d' | '30d' | 'custom';

export function DataExplorerView() {
  const { isDark } = useTheme();
  const { selectedStationId: selectedStation, selectStation: setSelectedStation } = useSystemConfiguration();
  const [activeMode, setActiveMode] = useState<'time-machine' | 'log-table'>('time-machine');
  const [stations, setStations] = useState<Station[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRangePreset>('24h');
  
  // Custom date range state
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );

  // Historical Data State
  const [historicalData, setHistoricalData] = useState<Observation[]>([]);
  const [historicalAnomalies, setHistoricalAnomalies] = useState<AnomalyEvent[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [tablePage, setTablePage] = useState<number>(1);
  const [tableSearch, setTableSearch] = useState<string>('');

  // Time Machine Playback Engine
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackIndex, setPlaybackIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 5x, 10x
  const playTimerRef = useRef<any>(null);

  // CSV Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<boolean>(false);
  const [uploadSummary, setUploadSummary] = useState<{
    total_records: number;
    valid_records: number;
    anomalies_detected: number;
    processing_time_ms: number;
    results: InferenceResult[];
  } | null>(null);

  // In-memory instant window cache for zero-latency timeframe switching
  const windowCacheRef = useRef<Map<string, { obs: Observation[]; anom: AnomalyEvent[]; total: number }>>(new Map());

  // Load initial stations
  useEffect(() => {
    fetchStations()
      .then((res) => {
        const items = res.items || [];
        setStations(items);
        if (items.length > 0 && !selectedStation) {
          setSelectedStation(items[0].station_id);
        }
      })
      .catch(() => {});
  }, []);

  // Compute start/end ISO strings based on preset
  const getTimeBounds = (): { start?: string; end?: string } => {
    const now = new Date();
    let start: Date;
    if (timeRange === '1h') start = new Date(now.getTime() - 60 * 60 * 1000);
    else if (timeRange === '6h') start = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    else if (timeRange === '24h') start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    else if (timeRange === '7d') start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (timeRange === '30d') start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else {
      return {
        start: new Date(startDate).toISOString(),
        end: new Date(endDate).toISOString(),
      };
    }
    return { start: start.toISOString(), end: now.toISOString() };
  };

  const loadHistoricalTelemetry = async () => {
    const cacheKey = `${selectedStation}:${timeRange}:${timeRange === 'custom' ? `${startDate}-${endDate}` : ''}`;
    
    // Instant cache hit: render immediately with zero delay
    const cached = windowCacheRef.current.get(cacheKey);
    if (cached && cached.obs.length > 0) {
      setHistoricalData(cached.obs);
      setTotalCount(cached.total);
      setHistoricalAnomalies(cached.anom);
      setPlaybackIndex(Math.max(0, cached.obs.length - 1));
    } else {
      setIsLoading(true);
    }

    try {
      const bounds = getTimeBounds();
      const pointLimit = 120;
      
      const [obsRes, anomRes] = await Promise.all([
        fetchObservations({
          station_id: selectedStation || undefined,
          start_time: bounds.start,
          end_time: bounds.end,
          limit: pointLimit,
          order: 'desc', // Fetch most recent points in window
        }),
        fetchAnomalies({
          station_id: selectedStation || undefined,
          limit: 50,
        }),
      ]);

      let items = obsRes.items || [];
      if (items.length > 0) {
        // Reverse descending results so charts read left-to-right chronologically
        items = [...items].reverse();
        setHistoricalData(items);
        setTotalCount(obsRes.total || items.length);
        setPlaybackIndex(Math.max(0, items.length - 1));
      } else {
        // Fallback to recent telemetry if exact time bounds have no points
        const fallbackRes = await fetchObservations({
          station_id: selectedStation || undefined,
          limit: 60,
          order: 'desc',
        });
        items = [...(fallbackRes.items || [])].reverse();
        setHistoricalData(items);
        setTotalCount(fallbackRes.total || items.length);
        setPlaybackIndex(Math.max(0, items.length - 1));
      }

      const anomItems = anomRes.items || [];
      setHistoricalAnomalies(anomItems);

      // Save to instant window cache
      windowCacheRef.current.set(cacheKey, {
        obs: items,
        anom: anomItems,
        total: obsRes.total || items.length,
      });
    } catch {
      // Handled gracefully
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistoricalTelemetry();
  }, [selectedStation, timeRange, startDate, endDate]);

  // Playback Timer Engine
  useEffect(() => {
    if (isPlaying && historicalData.length > 0) {
      const intervalMs = Math.max(100, 1000 / playbackSpeed);
      playTimerRef.current = setInterval(() => {
        setPlaybackIndex((prev) => {
          if (prev >= historicalData.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, playbackSpeed, historicalData.length]);

  const currentScrubbedObs = historicalData[playbackIndex] || historicalData[historicalData.length - 1];

  const calcDewPoint = (t: number, rh: number) => {
    const a = 17.27;
    const b = 237.7;
    const alpha = (a * t) / (b + t) + Math.log(Math.max(1, rh) / 100);
    return (b * alpha) / (a - alpha);
  };

  const stats = React.useMemo(() => {
    if (historicalData.length === 0) {
      return { minT: '0', maxT: '0', avgT: '0', minP: '0', maxP: '0', minRh: '0', maxRh: '0', anomCount: 0 };
    }
    const temps = historicalData.map((d) => d.temperature);
    const pressures = historicalData.map((d) => d.pressure);
    const humidities = historicalData.map((d) => d.humidity);

    const minT = Math.min(...temps);
    const maxT = Math.max(...temps);
    const avgT = temps.reduce((a, b) => a + b, 0) / temps.length;
    const minP = Math.min(...pressures);
    const maxP = Math.max(...pressures);
    const minRh = Math.min(...humidities);
    const maxRh = Math.max(...humidities);

    return {
      minT: minT.toFixed(1),
      maxT: maxT.toFixed(1),
      avgT: avgT.toFixed(1),
      minP: minP.toFixed(1),
      maxP: maxP.toFixed(1),
      minRh: minRh.toFixed(1),
      maxRh: maxRh.toFixed(1),
      anomCount: historicalAnomalies.filter((a) => a.station_id === selectedStation).length,
    };
  }, [historicalData, historicalAnomalies, selectedStation]);

  const chartData = React.useMemo(() => {
    return historicalData.map((obs, idx) => {
      const d = new Date(obs.timestamp);
      const timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateLabel = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      const dp = calcDewPoint(obs.temperature, obs.humidity);

      return {
        index: idx,
        timestamp: obs.timestamp,
        formattedTime: `${dateLabel} ${timeLabel}`,
        temperature: Number(obs.temperature.toFixed(1)),
        pressure: Number(obs.pressure.toFixed(1)),
        humidity: Number(obs.humidity.toFixed(1)),
        dewPoint: Number(dp.toFixed(1)),
        isScrubbed: idx === playbackIndex,
      };
    });
  }, [historicalData, playbackIndex]);

  const handleExportCSV = () => {
    if (historicalData.length === 0) return;
    const headers = 'timestamp,station_id,temperature,pressure,humidity,validation_status\n';
    const rows = historicalData
      .map(
        (o) =>
          `"${o.timestamp}","${o.station_id}",${o.temperature},${o.pressure},${o.humidity},"${o.validation_status || 'VALID'}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skyguard_${selectedStation}_historical_archive.csv`;
    a.click();
  };

  const handleExportJSON = () => {
    if (historicalData.length === 0) return;
    const blob = new Blob([JSON.stringify(historicalData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skyguard_${selectedStation}_historical_archive.json`;
    a.click();
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;
    setUploadProgress(true);
    try {
      const result = await uploadCSV(uploadFile);
      setUploadSummary(result);
      loadHistoricalTelemetry();
    } catch (err: any) {
      alert(`Upload note: ${err.message}`);
    } finally {
      setUploadProgress(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent =
      'timestamp,station_id,temperature,pressure,humidity\n' +
      '2026-08-24T12:00:00Z,DEL-IMD-001,28.5,1012.3,62.1\n' +
      '2026-08-24T12:05:00Z,DEL-IMD-001,28.8,1012.1,61.8\n' +
      '2026-08-24T12:10:00Z,DEL-IMD-001,29.2,1012.0,61.5\n' +
      '2026-08-24T12:15:00Z,DEL-IMD-001,29.1,1011.8,60.9\n' +
      '2026-08-24T12:20:00Z,DEL-IMD-001,29.4,1011.6,60.5\n';

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skyguard_sample_synoptic_telemetry.csv';
    a.click();
  };

  const currentStationInfo = CITY_PRESETS.find((c) => c.station_id === selectedStation) || {
    name: selectedStation,
    country: 'National Network',
    latitude: 28.61,
    longitude: 77.20,
    description: 'Synoptic Observation Station',
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Top Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b ${
        isDark ? 'border-white/[0.06]' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={`text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <History className="w-6 h-6 text-rose-500" />
              Historical Synoptic Archive & Time-Machine
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30">
              IMMUTABLE AUDIT WAL
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Scrub through past atmospheric records, replay physical diurnal waveforms & export audited datasets
          </p>
        </div>

        {/* Mode Switcher & Export */}
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-xl border flex items-center gap-1 ${
            isDark ? 'bg-[#0b0e18] border-white/[0.08]' : 'bg-slate-100 border-slate-300 shadow-xs'
          }`}>
            <button
              onClick={() => setActiveMode('time-machine')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'time-machine'
                  ? 'bg-rose-500 text-white shadow-md border border-rose-400/40'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Time Machine Replay
            </button>
            <button
              onClick={() => setActiveMode('log-table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'log-table'
                  ? 'bg-rose-500 text-white shadow-md border border-rose-400/40'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Synoptic Data Logs
            </button>
          </div>

          <button
            onClick={loadHistoricalTelemetry}
            className="m-btn-secondary text-xs"
            title="Reload from SQLite WAL"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-rose-400' : 'text-rose-400'} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter & Station Selection Bar */}
      <div className="m-card p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Station Picker */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <MapPin size={16} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Target Synoptic Node
            </span>
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className={`border rounded-xl px-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-rose-500 cursor-pointer mt-0.5 ${
                isDark ? 'bg-[#0e1320] border-white/[0.1] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              {stations && stations.length > 0
                ? stations.map((st) => (
                    <option key={st.station_id} value={st.station_id}>
                      {st.station_id} — {st.name}
                    </option>
                  ))
                : CITY_PRESETS.map((city) => (
                    <option key={city.station_id} value={city.station_id}>
                      {city.name} ({city.station_id}) — {city.country}
                    </option>
                  ))}
            </select>
          </div>
        </div>

        {/* Timeframe Presets */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Past Window:
          </span>
          {[
            { id: '1h', label: '1 Hour' },
            { id: '6h', label: '6 Hours' },
            { id: '24h', label: '24 Hours' },
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: 'custom', label: 'Custom Range' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => setTimeRange(preset.id as any)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                timeRange === preset.id
                  ? (isDark ? 'bg-white/[0.15] text-white font-bold border border-white/[0.25] shadow-sm' : 'bg-rose-500 text-white font-bold border border-rose-500 shadow-sm')
                  : (isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent')
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className={`px-3 py-1.5 border rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 shadow-xs'
            }`}
          >
            <Download size={13} className="text-rose-400" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className={`px-3 py-1.5 border rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 shadow-xs'
            }`}
          >
            <Download size={13} className="text-rose-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Custom Date Pickers */}
      {timeRange === 'custom' && (
        <div className={`m-card p-4 flex flex-col sm:flex-row items-center gap-4 border animate-fadeIn ${
          isDark ? 'bg-[#0c101a] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-mono text-slate-400">Start Time:</span>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-rose-500 ${
                isDark ? 'bg-[#121826] border-white/[0.1] text-slate-200' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-mono text-slate-400">End Time:</span>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-rose-500 ${
                isDark ? 'bg-[#121826] border-white/[0.1] text-slate-200' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>
          <button
            onClick={loadHistoricalTelemetry}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs rounded-xl shadow-md cursor-pointer"
          >
            Query Archive
          </button>
        </div>
      )}

      {/* MODE 1: TIME MACHINE & WAVEFORM REPLAY */}
      {activeMode === 'time-machine' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Statistical Digest Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="m-card p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Temp Range (Min / Max)
                </span>
                <span className="text-base font-mono font-bold text-white mt-0.5 block">
                  {stats.minT}°C <span className="text-slate-500 font-normal">to</span> {stats.maxT}°C
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Mean: {stats.avgT}°C</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Thermometer size={18} />
              </div>
            </div>

            <div className="m-card p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Barometric Range
                </span>
                <span className="text-base font-mono font-bold text-white mt-0.5 block">
                  {stats.minP} <span className="text-slate-500 font-normal">to</span> {stats.maxP}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">hPa (Sea Level)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Gauge size={18} />
              </div>
            </div>

            <div className="m-card p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Relative Humidity
                </span>
                <span className="text-base font-mono font-bold text-white mt-0.5 block">
                  {stats.minRh}% <span className="text-slate-500 font-normal">to</span> {stats.maxRh}%
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Vapor Saturation</span>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Droplets size={18} />
              </div>
            </div>

            <div className="m-card p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Flagged Anomalies
                </span>
                <span className="text-base font-mono font-bold text-amber-400 mt-0.5 block">
                  {stats.anomCount} Events
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">WMO-No. 8 QC Audited</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle size={18} />
              </div>
            </div>
          </div>

          {/* Time Machine Playback Control Console */}
          <div className="m-card p-5 space-y-4 border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.06)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Time-Machine Past Replay Console
                    {isPlaying && (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                        PLAYING ({playbackSpeed}x)
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Step chronologically through recorded synoptic observations with synchronized physics
                  </p>
                </div>
              </div>

              {/* Play / Pause / Reset Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={historicalData.length === 0}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-950/50'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 border border-rose-400/40'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause size={14} className="fill-current" />
                      Pause Replay
                    </>
                  ) : (
                    <>
                      <Play size={14} className="fill-current" />
                      Play Replay
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setPlaybackIndex(0);
                  }}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition-all cursor-pointer"
                  title="Rewind to Beginning"
                >
                  <RotateCcw size={14} />
                </button>

                {/* Speed Multiplier */}
                <div className={`flex items-center rounded-xl p-0.5 border ${
                  isDark ? 'bg-[#0d121f] border-white/[0.08]' : 'bg-slate-100 border-slate-300'
                }`}>
                  {[1, 2, 5, 10].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        playbackSpeed === spd
                          ? 'bg-rose-500 text-white'
                          : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Slider & Timestamp HUD */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">
                  Past Timestamp HUD:{' '}
                  <strong className="text-rose-400 font-bold">
                    {currentScrubbedObs
                      ? new Date(currentScrubbedObs.timestamp).toLocaleString()
                      : 'No Historical Data'}
                  </strong>
                </span>
                <span className="text-slate-400">
                  Frame {playbackIndex + 1} of {historicalData.length}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max={Math.max(0, historicalData.length - 1)}
                value={playbackIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setPlaybackIndex(parseInt(e.target.value, 10));
                }}
                className={`w-full accent-rose-500 cursor-pointer h-2 rounded-lg ${
                  isDark ? 'bg-slate-800' : 'bg-slate-200'
                }`}
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>
                  {historicalData[0] ? new Date(historicalData[0].timestamp).toLocaleDateString() : 'Start'}
                </span>
                <span className="text-rose-400 font-semibold">Interactive Time Travel Timeline</span>
                <span>
                  {historicalData[historicalData.length - 1]
                    ? new Date(historicalData[historicalData.length - 1].timestamp).toLocaleDateString()
                    : 'Now'}
                </span>
              </div>
            </div>

            {/* Scrubbed Instant Telemetry Snapshot Card */}
            {currentScrubbedObs && (
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 border rounded-2xl ${
                isDark ? 'bg-[#090d16] border-white/[0.08]' : 'bg-slate-50 border-slate-200 shadow-xs'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                    <Thermometer size={14} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Temperature</span>
                    <span className={`text-sm font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {currentScrubbedObs.temperature.toFixed(1)} °C
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                    <Droplets size={14} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Relative Humidity</span>
                    <span className={`text-sm font-bold font-mono ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>
                      {currentScrubbedObs.humidity.toFixed(1)} %
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Gauge size={14} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Atmospheric Pressure</span>
                    <span className={`text-sm font-bold font-mono ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                      {currentScrubbedObs.pressure.toFixed(1)} hPa
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">QC Status</span>
                    <span className={`text-sm font-bold font-mono uppercase ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      {currentScrubbedObs.validation_status || 'VALID'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Historical Waveform Multi-Curve Chart */}
          <div className="m-card p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                  Historical Telemetry Waveform ({currentStationInfo.name})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Left Axis: Temperature (°C), Dew Point (°C) & Humidity (%) • Right Axis: Barometric Pressure (hPa)
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.08]">
                {chartData.length} Sample Points
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                  <XAxis
                    dataKey="formattedTime"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#f43f5e"
                    domain={[0, 100]}
                    fontSize={10}
                    tickLine={false}
                    unit="°C"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#818cf8"
                    domain={[900, 1050]}
                    fontSize={10}
                    tickLine={false}
                    unit="hPa"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '0.75rem',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
                  
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperature"
                    name="Temperature (°C)"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, fill: '#f43f5e' }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="dewPoint"
                    name="Dew Point (°C)"
                    stroke="#38bdf8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="humidity"
                    name="Humidity (%)"
                    stroke="#34d399"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="pressure"
                    name="Pressure (hPa)"
                    stroke="#818cf8"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: LOG TABLE & BATCH DATASET INGESTION */}
      {activeMode === 'log-table' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Batch Dataset Ingestion Dropzone */}
          <div className="m-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <Upload size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Batch CSV Dataset Ingestion</h3>
                  <p className="text-[11px] text-slate-400">
                    Upload comma-separated values (`timestamp`, `station_id`, `temperature`, `pressure`, `humidity`)
                  </p>
                </div>
              </div>

              <button
                onClick={downloadSampleCSV}
                className="m-btn-secondary text-xs"
              >
                <Download size={13} />
                <span>Download Sample CSV</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-mono file:font-semibold file:bg-rose-500/15 file:text-rose-300 hover:file:bg-rose-500/25 cursor-pointer bg-[#0e1320] border border-white/[0.08] rounded-xl p-1.5"
              />
              <button
                onClick={handleFileUpload}
                disabled={!uploadFile || uploadProgress}
                className="m-btn-primary text-xs whitespace-nowrap w-full sm:w-auto"
              >
                <Upload size={13} />
                <span>{uploadProgress ? 'Validating & Ingesting...' : 'Upload & Validate'}</span>
              </button>
            </div>

            {uploadSummary && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 size={16} />
                  <span>Batch Ingestion Completed in {uploadSummary.processing_time_ms.toFixed(1)}ms</span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-slate-300">
                  <div>Total Ingested: <strong className="text-white">{uploadSummary.total_records}</strong></div>
                  <div>Valid Records: <strong className="text-emerald-400">{uploadSummary.valid_records}</strong></div>
                  <div>Anomalies Flagged: <strong className="text-rose-400">{uploadSummary.anomalies_detected}</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Historical Observations Table */}
          <div className="m-card overflow-hidden">
            <div className="p-4 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-rose-400" />
                <h3 className="text-sm font-bold text-white">
                  Audited Telemetry Records ({totalCount.toLocaleString()} Total)
                </h3>
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by timestamp or status..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-full bg-[#101524] border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#090d16] text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
                  <tr>
                    <th className="py-3 px-4">Timestamp (UTC)</th>
                    <th className="py-3 px-4">Station ID</th>
                    <th className="py-3 px-4">Temperature</th>
                    <th className="py-3 px-4">Dew Point</th>
                    <th className="py-3 px-4">Humidity</th>
                    <th className="py-3 px-4">Pressure</th>
                    <th className="py-3 px-4">WMO QC Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {historicalData
                    .filter((obs) => {
                      if (!tableSearch) return true;
                      return (
                        obs.timestamp.toLowerCase().includes(tableSearch.toLowerCase()) ||
                        (obs.validation_status || '').toLowerCase().includes(tableSearch.toLowerCase())
                      );
                    })
                    .slice((tablePage - 1) * 15, tablePage * 15)
                    .map((obs) => {
                      const dp = calcDewPoint(obs.temperature, obs.humidity);
                      return (
                        <tr key={obs.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 text-slate-300">
                            {new Date(obs.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-bold text-rose-300">{obs.station_id}</td>
                          <td className="py-3 px-4 text-white font-bold">{obs.temperature.toFixed(1)} °C</td>
                          <td className="py-3 px-4 text-sky-400">{dp.toFixed(1)} °C</td>
                          <td className="py-3 px-4 text-emerald-400">{obs.humidity.toFixed(1)} %</td>
                          <td className="py-3 px-4 text-indigo-400">{obs.pressure.toFixed(1)} hPa</td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                obs.validation_status === 'VALID'
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              }`}
                            >
                              {obs.validation_status || 'VALID'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Table Pagination */}
            <div className="p-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">
                Page {tablePage} of {Math.max(1, Math.ceil(historicalData.length / 15))}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                  disabled={tablePage === 1}
                  className="p-1.5 rounded-lg bg-white/[0.04] text-slate-300 disabled:opacity-30 border border-white/[0.08]"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setTablePage((p) => p + 1)}
                  disabled={tablePage * 15 >= historicalData.length}
                  className="p-1.5 rounded-lg bg-white/[0.04] text-slate-300 disabled:opacity-30 border border-white/[0.08]"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
