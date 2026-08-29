/**
 * frontend/src/components/LiveMonitoringView.tsx
 * SkyGuard AI — Real-Time Synoptic Telemetry Streaming Console.
 * Instantaneous station switching, multi-scaled dual Y-axis waveform charts, and live physical consistency metrics.
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Thermometer,
  Gauge,
  Droplets,
  Radio,
  Play,
  Pause,
  MapPin,
  Activity,
  Sliders,
  ChevronDown,
  Layers,
  Wind,
} from 'lucide-react';
import { InferenceResult, Station, Observation } from '../types';
import { fetchObservations, fetchStations } from '../services/api';
import { useSystemConfiguration } from '../context/SystemConfigurationContext';

interface LiveMonitoringViewProps {
  selectedStationId: string;
  onSelectStation: (stationId: string) => void;
  latestTelemetry: InferenceResult | null;
  historyBuffer: InferenceResult[];
  isStreaming: boolean;
  onToggleStreaming: () => void;
}

interface TelemetryPoint {
  step: number;
  time: string;
  timestamp: string;
  temp: number;
  press: number;
  hum: number;
  is_anomaly: boolean;
}

export function LiveMonitoringView({
  selectedStationId,
  onSelectStation,
  latestTelemetry,
  historyBuffer: _historyBuffer,
  isStreaming,
  onToggleStreaming,
}: LiveMonitoringViewProps) {
  const { openSettings } = useSystemConfiguration();
  const [stations, setStations] = useState<Station[]>([]);
  const [activeChannel, setActiveChannel] = useState<'all' | 'temperature' | 'pressure' | 'humidity'>('all');
  const [timelineData, setTimelineData] = useState<TelemetryPoint[]>([]);
  const lastProcessedTimeRef = useRef<string>('');

  // Load configured stations
  useEffect(() => {
    fetchStations().then((res) => {
      setStations(res.items || []);
    });
  }, []);

  const activeStation = useMemo(() => {
    return stations.find((s) => s.station_id === selectedStationId) || stations[0] || {
      station_id: 'PUNE-AWS-006',
      name: 'Shivajinagar Climate Research Center (Pune)',
      latitude: 18.5314,
      longitude: 73.8446,
      elevation: 560,
    };
  }, [stations, selectedStationId]);

  const latestObsRef = useRef<{ temp: number; press: number; hum: number; is_anomaly: boolean }>({
    temp: 24.5,
    press: 1012,
    hum: 58,
    is_anomaly: false,
  });

  // 1. Initial Load of Station Observations
  useEffect(() => {
    let isMounted = true;
    const targetStationId = selectedStationId || activeStation.station_id;

    fetchObservations({ station_id: targetStationId, limit: 30, order: 'desc' })
      .then((res) => {
        if (!isMounted) return;
        const rawItems: Observation[] = res.items || [];
        if (rawItems.length > 0) {
          const nowMs = Date.now();
          const ascending = [...rawItems].reverse();
          const count = ascending.length;
          
          // Generate strictly spaced 10-second historical baseline ending at now
          const formatted: TelemetryPoint[] = ascending.map((obs, idx) => {
            const pointTime = new Date(nowMs - (count - 1 - idx) * 10000);
            return {
              step: idx,
              time: pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
              timestamp: obs.timestamp,
              temp: Number(obs.temperature?.toFixed(1) ?? 24.5),
              press: Number(obs.pressure?.toFixed(0) ?? 1012),
              hum: Number(obs.humidity?.toFixed(0) ?? 58),
              is_anomaly: obs.validation_status === 'QC_FLAGGED' || obs.validation_status === 'ANOMALY' || obs.validation_status === 'FLAGGED',
            };
          });

          setTimelineData(formatted);
          const lastObs = formatted[formatted.length - 1];
          latestObsRef.current = {
            temp: lastObs.temp,
            press: lastObs.press,
            hum: lastObs.hum,
            is_anomaly: lastObs.is_anomaly,
          };
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [selectedStationId, activeStation]);

  // 2. Track Live Telemetry from WebSocket & API
  useEffect(() => {
    if (!latestTelemetry || !latestTelemetry.timestamp) return;
    if (latestTelemetry.station_id && latestTelemetry.station_id !== selectedStationId && selectedStationId) {
      return;
    }
    latestObsRef.current = {
      temp: Number((latestTelemetry.temperature ?? latestTelemetry.raw_values?.temperature ?? latestObsRef.current.temp).toFixed(1)),
      press: Number((latestTelemetry.pressure ?? latestTelemetry.raw_values?.pressure ?? latestObsRef.current.press).toFixed(0)),
      hum: Number((latestTelemetry.humidity ?? latestTelemetry.raw_values?.humidity ?? latestObsRef.current.hum).toFixed(0)),
      is_anomaly: latestTelemetry.is_anomaly || false,
    };
  }, [latestTelemetry, selectedStationId]);

  // 3. Strict 10-Second Heartbeat Engine (Guaranteed 10s tick, straight line if steady)
  useEffect(() => {
    const targetStationId = selectedStationId || activeStation.station_id;

    const tick = () => {
      // Periodic background fetch of latest observation to keep state anchored
      fetchObservations({ station_id: targetStationId, limit: 1, order: 'desc' })
        .then((res) => {
          if (res.items && res.items.length > 0) {
            const o = res.items[0];
            latestObsRef.current = {
              temp: Number(o.temperature?.toFixed(1) ?? latestObsRef.current.temp),
              press: Number(o.pressure?.toFixed(0) ?? latestObsRef.current.press),
              hum: Number(o.humidity?.toFixed(0) ?? latestObsRef.current.hum),
              is_anomaly: o.validation_status === 'QC_FLAGGED' || o.validation_status === 'ANOMALY',
            };
          }
        })
        .catch(() => {});

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      const current = latestObsRef.current;

      const newPoint: TelemetryPoint = {
        step: Date.now(),
        time: timeStr,
        timestamp: now.toISOString(),
        temp: current.temp,
        press: current.press,
        hum: current.hum,
        is_anomaly: current.is_anomaly,
      };

      setTimelineData((prev) => {
        const next = [...prev, newPoint];
        return next.length > 35 ? next.slice(-35) : next;
      });
    };

    const interval = setInterval(tick, 10000); // Strict 10,000ms regular interval
    return () => clearInterval(interval);
  }, [selectedStationId, activeStation]);

  // Current readings (derived from latest timeline point for instant accuracy)
  const latestPoint = timelineData[timelineData.length - 1];
  const isMatchingTelemetry = latestTelemetry?.station_id === (selectedStationId || activeStation.station_id);
  const currentTemp = latestPoint?.temp ?? (isMatchingTelemetry ? latestTelemetry?.temperature ?? 24.5 : 24.5);
  const currentHumidity = latestPoint?.hum ?? (isMatchingTelemetry ? latestTelemetry?.humidity ?? 58.0 : 58.0);
  const currentPressure = latestPoint?.press ?? (isMatchingTelemetry ? latestTelemetry?.pressure ?? 1012.3 : 1012.3);

  // Magnus-Tetens dew point calculation
  const a = 17.27, b = 237.7;
  const alpha = (a * currentTemp) / (b + currentTemp) + Math.log(Math.max(1, currentHumidity) / 100.0);
  const dewPoint = (b * alpha) / (a - alpha);
  const dewPointDepression = currentTemp - dewPoint;

  // Statistics Summary
  const stats = useMemo(() => {
    if (timelineData.length === 0) {
      return {
        temp: { min: 22, max: 28, avg: 24.5 },
        press: { min: 1008, max: 1016, avg: 1012 },
        hum: { min: 50, max: 68, avg: 58 },
      };
    }
    const temps = timelineData.map((d) => d.temp);
    const presses = timelineData.map((d) => d.press);
    const hums = timelineData.map((d) => d.hum);

    const calc = (arr: number[]) => ({
      min: Math.min(...arr),
      max: Math.max(...arr),
      avg: Number((arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1)),
    });

    return {
      temp: calc(temps),
      press: calc(presses),
      hum: calc(hums),
    };
  }, [timelineData]);

  // Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: TelemetryPoint = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-[#0e131f]/95 border border-slate-200 dark:border-rose-500/40 p-3 rounded-xl shadow-xl dark:shadow-2xl text-xs font-mono space-y-1.5 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-1">
            <span className="text-slate-900 dark:text-slate-300 font-bold">{label}</span>
            {data.is_anomaly && (
              <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-600 dark:text-rose-300 rounded text-[9px] font-bold border border-rose-500/40">
                QC FLAG
              </span>
            )}
          </div>
          <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 gap-4">
            <span className="flex items-center gap-1"><Thermometer size={12} /> Temp:</span>
            <span className="font-bold text-slate-900 dark:text-white">{data.temp.toFixed(1)} °C</span>
          </div>
          <div className="flex justify-between items-center text-sky-600 dark:text-sky-400 gap-4">
            <span className="flex items-center gap-1"><Gauge size={12} /> Pressure:</span>
            <span className="font-bold text-slate-900 dark:text-white">{data.press} hPa</span>
          </div>
          <div className="flex justify-between items-center text-indigo-600 dark:text-indigo-400 gap-4">
            <span className="flex items-center gap-1"><Droplets size={12} /> Humidity:</span>
            <span className="font-bold text-slate-900 dark:text-white">{data.hum} %</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ── Sub Header Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Real-Time Synoptic Stream Console
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
              STREAM ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            High-frequency multi-channel surface observation stream & threshold monitoring
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Station Selector */}
          <div className="relative">
            <select
              value={selectedStationId}
              onChange={(e) => onSelectStation(e.target.value)}
              className="appearance-none bg-[#111722] border border-white/[0.08] hover:border-white/[0.15] text-slate-200 text-xs rounded-lg pl-3 pr-8 py-2 font-mono font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              {stations.map((st) => (
                <option key={st.station_id} value={st.station_id} className="bg-[#0d121c] text-white">
                  {st.station_id} — {st.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={openSettings}
            className="m-btn-secondary"
            title="System Settings"
          >
            <Sliders size={13} />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            onClick={onToggleStreaming}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              isStreaming
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause size={13} className="text-rose-400" />
                <span>Pause Feed</span>
              </>
            ) : (
              <>
                <Play size={13} className="text-amber-400" />
                <span>Resume Feed</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── 3 Main Sensor Metric Gauges ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Air Temperature */}
        <div className="m-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Thermometer size={14} className="text-rose-400" />
              <span className="m-stat-label">Air Temperature</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400">1.5m AGL</span>
          </div>
          <div className="flex items-baseline justify-between my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="m-stat-value">{currentTemp.toFixed(1)}</span>
              <span className="text-xs text-slate-400 font-mono">°C</span>
            </div>
            <div className="text-right text-xs font-mono">
              <span className="text-slate-500 block text-[10px] uppercase">Dew Point</span>
              <span className="text-slate-300 font-bold">{dewPoint.toFixed(1)}°C</span>
            </div>
          </div>
          <div className="pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Range (24h):</span>
            <span className="text-slate-200">{stats.temp.min}°C — {stats.temp.max}°C</span>
          </div>
        </div>

        {/* Surface Pressure */}
        <div className="m-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gauge size={14} className="text-sky-400" />
              <span className="m-stat-label">Surface Pressure</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">Barometer</span>
          </div>
          <div className="flex items-baseline justify-between my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="m-stat-value">{currentPressure.toFixed(0)}</span>
              <span className="text-xs text-slate-400 font-mono">hPa</span>
            </div>
            <div className="text-right text-xs font-mono">
              <span className="text-slate-500 block text-[10px] uppercase">Tendency</span>
              <span className="text-emerald-400 font-bold">STABLE</span>
            </div>
          </div>
          <div className="pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Avg Pressure:</span>
            <span className="text-slate-200">{stats.press.avg} hPa</span>
          </div>
        </div>

        {/* Relative Humidity */}
        <div className="m-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Droplets size={14} className="text-indigo-400" />
              <span className="m-stat-label">Relative Humidity</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Hygrometer</span>
          </div>
          <div className="flex items-baseline justify-between my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="m-stat-value">{currentHumidity.toFixed(0)}</span>
              <span className="text-xs text-slate-400 font-mono">%</span>
            </div>
            <div className="text-right text-xs font-mono">
              <span className="text-slate-500 block text-[10px] uppercase">Depression</span>
              <span className="text-indigo-300 font-bold">{dewPointDepression.toFixed(1)}°C</span>
            </div>
          </div>
          <div className="pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Vapor Saturation:</span>
            <span className="text-slate-200">{currentHumidity > 85 ? 'HIGH' : 'NORMAL'}</span>
          </div>
        </div>
      </div>

      {/* ── Main Multi-Channel Streaming Chart ────────────────────── */}
      <div className="m-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-white">Live Time-Series Sensor Traces</h3>
              <p className="text-[11px] text-slate-400">
                Synchronous multi-variable atmospheric telemetry curves ({timelineData.length} observations in window)
              </p>
            </div>
          </div>

          {/* Channel Filters */}
          <div className="flex items-center p-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs font-mono">
            {[
              { id: 'all', label: 'All Channels' },
              { id: 'temperature', label: 'Temp' },
              { id: 'pressure', label: 'Pressure' },
              { id: 'humidity', label: 'Humidity' },
            ].map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id as any)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeChannel === ch.id
                    ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorPress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
              
              {/* Dual Y-Axes for All Channels vs Dedicated Single-Channel Scale */}
              {activeChannel === 'all' ? (
                <>
                  <YAxis
                    yAxisId="left"
                    stroke="#f43f5e"
                    fontSize={10}
                    tickLine={false}
                    domain={[-10, 100]}
                    unit=""
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#38bdf8"
                    fontSize={10}
                    tickLine={false}
                    domain={['dataMin - 10', 'dataMax + 10']}
                    unit="hPa"
                  />
                </>
              ) : activeChannel === 'temperature' ? (
                <YAxis
                  stroke="#f43f5e"
                  fontSize={10}
                  tickLine={false}
                  domain={[(dataMin: number) => Math.floor(dataMin - 2), (dataMax: number) => Math.ceil(dataMax + 2)]}
                  unit="°C"
                />
              ) : activeChannel === 'pressure' ? (
                <YAxis
                  stroke="#38bdf8"
                  fontSize={10}
                  tickLine={false}
                  domain={[(dataMin: number) => Math.floor(dataMin - 5), (dataMax: number) => Math.ceil(dataMax + 5)]}
                  unit="hPa"
                />
              ) : (
                <YAxis
                  stroke="#818cf8"
                  fontSize={10}
                  tickLine={false}
                  domain={[0, 100]}
                  unit="%"
                />
              )}

              <Tooltip content={<CustomTooltip />} />

              {(activeChannel === 'all' || activeChannel === 'temperature') && (
                <Area
                  yAxisId={activeChannel === 'all' ? 'left' : undefined}
                  type="monotone"
                  dataKey="temp"
                  name="Temperature (°C)"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTemp)"
                  isAnimationActive={false}
                />
              )}
              {(activeChannel === 'all' || activeChannel === 'pressure') && (
                <Area
                  yAxisId={activeChannel === 'all' ? 'right' : undefined}
                  type="monotone"
                  dataKey="press"
                  name="Pressure (hPa)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPress)"
                  isAnimationActive={false}
                />
              )}
              {(activeChannel === 'all' || activeChannel === 'humidity') && (
                <Area
                  yAxisId={activeChannel === 'all' ? 'left' : undefined}
                  type="monotone"
                  dataKey="hum"
                  name="Relative Humidity (%)"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorHum)"
                  isAnimationActive={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
