/**
 * frontend/src/components/OverviewView.tsx
 * SkyGuard AI — Precision Mission Command Center.
 * Implements M.O.N.K.Y. dashboard architecture:
 * - 8-col Left Area: 3D Satellite / 2D Consensus Radar + Synoptic Station Registry + Recent Incidents
 * - 4-col Right Area: Dedicated M.O.N.K.Y. Digital Clock Card + Notifications Card + Station Telemetry Dossier
 */

import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Eye,
  Thermometer,
  Gauge,
  Droplets,
  Wind,
  MapPin,
  ChevronRight,
  RefreshCw,
  Wifi,
  BarChart3,
  Radio,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react';
import {
  fetchStations,
  fetchFleetHealth,
  fetchAnomalyStats,
  fetchAnomalies,
  fetchMetrics,
} from '../services/api';
import {
  Station,
  FleetHealthSummary,
  AnomalyStats,
  AnomalyEvent,
  SystemMetrics,
  InferenceResult,
} from '../types';
import { NetworkMap } from '../design-system/components/NetworkMap';
import { StationGlobe3D } from '../design-system/components/StationGlobe3D';
import { MonkyClockCard } from './ui/MonkyClockCard';
import { MonkyNotificationCard } from './ui/MonkyNotificationCard';
import { CITY_PRESETS } from '../data/presets';
import { formatClassification, formatSeverity } from '../utils/formatters';
import { useTelemetry } from './layout/AppShell';

interface OverviewViewProps {
  selectedStationId: string;
  onSelectStation: (id: string) => void;
  latestTelemetry: InferenceResult | null;
  historyBuffer: InferenceResult[];
  onNavigate: (tab: string) => void;
}

// Synoptic station metadata list
const INITIAL_STATIONS: Station[] = CITY_PRESETS.map((cp, i) => {
  const sid = cp.station_id || `AWS-00${i + 1}`;
  return {
    id: i + 1,
    station_id: sid,
    name: cp.name,
    latitude: cp.latitude,
    longitude: cp.longitude,
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
  return INITIAL_STATIONS;
};

import { useTheme } from '../context/ThemeContext';

export function OverviewView({
  selectedStationId,
  onSelectStation,
  latestTelemetry,
  historyBuffer,
  onNavigate,
}: OverviewViewProps) {
  const { isDark } = useTheme();
  const [stations, setStations] = useState<Station[]>(getCachedStations);
  const [fleetHealth, setFleetHealth] = useState<FleetHealthSummary>({
    total_stations: 34,
    active_stations: 29,
    degraded_stations: 5,
    critical_stations: 0,
    offline_stations: 0,
    average_health_score: 84.43,
    status_distribution: { EXCELLENT: 14, GOOD: 14, DEGRADED: 5, POOR: 1, CRITICAL: 0 },
  });
  const [anomalyStats, setAnomalyStats] = useState<AnomalyStats | null>({
    total_anomalies: 0,
    period_hours: 24,
    by_severity: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
    by_classification: {},
    sensor_faults: 0,
    meteorological_extremes: 0,
  });
  const [recentAnomalies, setRecentAnomalies] = useState<AnomalyEvent[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>({
    total_observations_ingested: 18450,
    total_anomalies_detected: 0,
    average_inference_latency_ms: 18.2,
    p95_inference_latency_ms: 36.4,
    database_size_bytes: 4194304,
    uptime_seconds: 86400,
    active_websocket_clients: 2,
    active_stations_count: CITY_PRESETS.length,
    websocket_connections: 2,
    cache_hit_ratio: 0.96,
  });
  const [loading, setLoading] = useState(false);
  const [mapMode, setMapMode] = useState<'3D' | '2D'>('3D');
  const [surfaceTexture, setSurfaceTexture] = useState<'SAT' | 'MAP'>('SAT');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock ticker for synoptic cycle
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const ORDER_MAP = new Map(CITY_PRESETS.map((c, i) => [c.station_id, i]));

  const sortStations = (items: Station[]) => {
    return [...items].sort((a, b) => {
      const orderA = ORDER_MAP.get(a.station_id) ?? 999;
      const orderB = ORDER_MAP.get(b.station_id) ?? 999;
      return orderA - orderB;
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [stRes, fhRes, asRes, anRes, mtRes] = await Promise.all([
        fetchStations().catch(() => ({ items: INITIAL_STATIONS, total: INITIAL_STATIONS.length })),
        fetchFleetHealth().catch(() => null),
        fetchAnomalyStats(24).catch(() => null),
        fetchAnomalies({ limit: 8 }).catch(() => ({ items: [], total: 0 })),
        fetchMetrics().catch(() => null),
      ]);
      if (stRes.items && stRes.items.length > 0) setStations(sortStations(stRes.items));
      if (fhRes) setFleetHealth(fhRes);
      if (asRes) setAnomalyStats(asRes);
      if (anRes.items) setRecentAnomalies(anRes.items);
      if (mtRes) setMetrics(mtRes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      fetchStations().then((r) => r.items && r.items.length > 0 && setStations(sortStations(r.items))).catch(() => {});
      fetchFleetHealth().then((r) => r && setFleetHealth(r)).catch(() => {});
      fetchAnomalyStats(24).then((r) => r && setAnomalyStats(r)).catch(() => {});
      fetchAnomalies({ limit: 8 }).then((r) => r.items && setRecentAnomalies(r.items)).catch(() => {});
      fetchMetrics().then((r) => r && setMetrics(r)).catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentStation =
    stations.find((s) => s.station_id === selectedStationId) ||
    stations[0] ||
    INITIAL_STATIONS[0];

  const stationPackets = historyBuffer.filter((p) => p.station_id === currentStation.station_id);
  const latestObs = stationPackets.length > 0 ? stationPackets[stationPackets.length - 1] : latestTelemetry || null;

  const temperature = (latestObs as any)?.temperature ?? latestObs?.raw_values?.temperature ?? 24.5;
  const humidity = (latestObs as any)?.humidity ?? latestObs?.raw_values?.humidity ?? 58;
  const pressure = (latestObs as any)?.pressure ?? latestObs?.raw_values?.pressure ?? 1012.3;
  const windSpeed = (latestObs as any)?.wind_speed ?? latestObs?.raw_values?.wind_speed ?? 12.4;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ── Top Header Banner ───── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200 dark:border-white/[0.06]">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-display flex items-center gap-2.5">
            Operations Dashboard
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium">
              GRID NOMINAL
            </span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-sans mt-0.5">
            Autonomous AWS sensor quality control, spatial consensus verification & anomaly surveillance
          </p>
        </div>

        {/* Real-time Synoptic Countdown & Fast Refresh */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07] text-slate-700 dark:text-slate-300">
            <Clock size={12} className="text-rose-500 dark:text-rose-400" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Next Synoptic Frame:</span>
            <strong className="text-slate-900 dark:text-white tabular-nums">
              {String(59 - currentTime.getMinutes()).padStart(2, '0')}:{String(59 - currentTime.getSeconds()).padStart(2, '0')}
            </strong>
          </div>

          <button
            onClick={loadData}
            className="m-btn-secondary py-1.5 px-3 cursor-pointer"
            title="Refresh Ingestion Telemetry"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin text-rose-500 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'} />
            <span className="hidden sm:inline text-xs font-sans">Sync Grid</span>
          </button>
        </div>
      </div>

      {/* ── 4 Meridian Metric Cards ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Card 1: Fleet Reliability Index */}
        <div className="relative rounded-2xl bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/[0.07] p-5 shadow-sm hover:border-slate-300 dark:hover:border-white/[0.12] transition-all">
          <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-slate-500 dark:text-slate-400 mb-2 font-mono">
            Fleet Reliability Index
          </p>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white font-mono tracking-tight leading-none mb-3">
            {fleetHealth ? `${fleetHealth.average_health_score.toFixed(1)}%` : '--'}
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.04]">
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Calibrated
            </span>
            <span className="text-[11px] text-slate-500 font-mono">{stations.length} Active Nodes</span>
          </div>
        </div>

        {/* Card 2: 24h Active Anomalies */}
        <div className="relative rounded-2xl bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/[0.07] p-5 shadow-sm hover:border-slate-300 dark:hover:border-white/[0.12] transition-all">
          <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-slate-500 dark:text-slate-400 mb-2 font-mono">
            Active Anomalies (24h)
          </p>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white font-mono tracking-tight leading-none mb-3">
            {anomalyStats?.total_anomalies ?? 0}
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.04]">
            <span
              className={`flex items-center gap-1 text-[11px] font-mono ${
                (anomalyStats?.total_anomalies ?? 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  (anomalyStats?.total_anomalies ?? 0) > 0 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
              />
              {(anomalyStats?.total_anomalies ?? 0) > 0 ? 'Triage Active' : 'Zero Drift'}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Multi-Tier QC</span>
          </div>
        </div>

        {/* Card 3: QC Detection Latency */}
        <div className="relative rounded-2xl bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/[0.07] p-5 shadow-sm hover:border-slate-300 dark:hover:border-white/[0.12] transition-all">
          <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-slate-500 dark:text-slate-400 mb-2 font-mono">
            QC Detection Latency
          </p>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white font-mono tracking-tight leading-none mb-3">
            {metrics ? `${metrics.average_inference_latency_ms.toFixed(1)}` : '18.2'}
            <span className="text-sm text-slate-500 dark:text-slate-400 font-normal ml-1">ms</span>
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.04]">
            <span className="flex items-center gap-1 text-[11px] font-mono text-slate-700 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Real-Time Stream
            </span>
            <span className="text-[11px] text-slate-500 font-mono">P95: 36ms</span>
          </div>
        </div>

        {/* Card 4: Ingested Observations */}
        <div className="relative rounded-2xl bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/[0.07] p-5 shadow-sm hover:border-slate-300 dark:hover:border-white/[0.12] transition-all">
          <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-slate-500 dark:text-slate-400 mb-2 font-mono">
            Ingested Observations
          </p>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white font-mono tracking-tight leading-none mb-3">
            {metrics?.total_observations_ingested
              ? (metrics.total_observations_ingested / 1000).toFixed(1) + 'k'
              : '18.4k'}
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.04]">
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 1.5s Stream
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Sync Active</span>
          </div>
        </div>
      </div>

      {/* ── Main Dashboard Layout: Left (8 cols) + Right Stack (4 cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ── LEFT COLUMN (8 cols): Map + Station Registry + Incidents ──── */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          
          {/* Synoptic Station GIS Grid (3D Globe / 2D Map) */}
          <div className="rounded-2xl bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/[0.08] p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between pb-3.5 mb-3.5 border-b border-slate-200 dark:border-white/[0.06] gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">Synoptic Station GIS Grid</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans">
                    Multi-station automated surface observation and spatial consensus verification
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold">
                  {mapMode === '3D' ? '3D SYNOPTIC GLOBE' : '2D GIS SURFACE'}
                </span>
              </div>
            </div>

            {/* Canvas Viewport with Sticky Bottom Dossier */}
            <div className="w-full rounded-xl overflow-hidden border border-slate-200 dark:border-white/[0.04]">
              {mapMode === '3D' ? (
                <StationGlobe3D
                  stations={stations}
                  selectedStationId={currentStation.station_id}
                  onSelectStation={onSelectStation}
                  mapMode={mapMode}
                  onMapModeChange={setMapMode}
                  surfaceTexture={surfaceTexture}
                  onSurfaceTextureChange={setSurfaceTexture}
                  className="w-full"
                />
              ) : (
                <NetworkMap
                  stations={stations}
                  selectedStationId={currentStation.station_id}
                  onSelectStation={onSelectStation}
                  mapMode={mapMode}
                  onMapModeChange={setMapMode}
                  surfaceTexture={surfaceTexture}
                  onSurfaceTextureChange={setSurfaceTexture}
                  className="w-full"
                />
              )}
            </div>
          </div>

          {/* Station Observational Grid Table */}
          <div className="rounded-2xl bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/[0.08] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Wifi size={15} className="text-rose-500 dark:text-rose-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">Station Observational Grid</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans">Select any observatory node to focus live telemetry stream</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]">
                {stations.length} ACTIVE NODES
              </span>
            </div>

            <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="sticky top-0 bg-slate-50 dark:bg-[#11131a] z-10">
                  <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.06] pb-2 text-[11px]">
                    <th className="pb-2.5 font-semibold">STATION ID</th>
                    <th className="pb-2.5 font-semibold">OBSERVATORY LOCATION</th>
                    <th className="pb-2.5 font-semibold">COORDINATES</th>
                    <th className="pb-2.5 font-semibold">INTEGRITY</th>
                    <th className="pb-2.5 font-semibold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {stations.map((st) => {
                    const isSelected = st.station_id === currentStation.station_id;
                    return (
                      <tr
                        key={st.station_id}
                        onClick={() => onSelectStation(st.station_id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-900 dark:text-white font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                        }`}
                      >
                        <td className="py-2.5 text-rose-600 dark:text-rose-300 font-semibold">{st.station_id}</td>
                        <td className="py-2.5 text-slate-800 dark:text-slate-200 font-sans">{st.name}</td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400 text-[11px]">
                          {st.latitude?.toFixed(2)}°N, {st.longitude?.toFixed(2)}°E
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`font-semibold ${
                              (st.health_score ?? 85) >= 75
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : (st.health_score ?? 85) >= 50
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {typeof st.health_score === 'number' ? `${st.health_score.toFixed(1)}%` : '--'}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded transition-all font-mono ${
                              isSelected
                                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 font-bold'
                                : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {isSelected ? 'ACTIVE' : 'SELECT'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Discrepancy Logs */}
          <div className="rounded-2xl bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/[0.08] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-rose-500 dark:text-rose-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">Recent Sensor Discrepancy Logs</h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300">
                      Latest 4 of {recentAnomalies.length || 4}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans">Automated multi-tier sensor anomaly detection flags</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 font-mono cursor-pointer font-semibold"
              >
                <span>View Full Queue ({recentAnomalies.length || 4})</span>
                <ChevronRight size={12} />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentAnomalies.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  <CheckCircle2 size={24} className="text-emerald-500 dark:text-emerald-400 mx-auto mb-2 opacity-70" />
                  <p className="font-semibold text-slate-800 dark:text-slate-300">Observation Stream Nominal</p>
                  <p className="text-[11px] mt-0.5 text-slate-500">No active sensor faults or physical bound violations detected</p>
                </div>
              ) : (
                recentAnomalies.slice(0, 4).map((evt: any) => (
                  <div
                    key={evt.id || evt.event_id}
                    onClick={() => onNavigate('alerts')}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded font-mono bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                          {formatSeverity(evt.severity || 'CRITICAL')}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{evt.station_id}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          • {formatClassification(evt.classification)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[320px] font-sans">
                        {evt.reason || evt.description || 'Threshold deviation detected'}
                      </p>
                    </div>
                    <div className="text-right font-mono text-[10px] text-slate-500">
                      {new Date(evt.timestamp || evt.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (4 cols): Station Telemetry Stack ────────── */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* 1. Digital Clock & Weather Card */}
          <MonkyClockCard
            temperature={temperature}
            locationName={`${currentStation.name.toUpperCase()}, ${currentStation.station_id}`}
          />

          {/* 2. Notifications Card */}
          <MonkyNotificationCard
            anomalies={recentAnomalies}
            onNavigateToEvents={() => onNavigate('alerts')}
          />

          {/* 3. Selected Station Live Telemetry Quick Dossier */}
          <div className="rounded-2xl bg-white dark:bg-[#11131a] border border-slate-200 dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between">
            <div>
              {/* Station Header */}
              <div className="flex items-start justify-between pb-3.5 mb-3.5 border-b border-slate-200 dark:border-white/[0.06]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                      {currentStation.station_id}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                      (currentStation.health_score ?? 98) >= 75
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25'
                    }`}>
                      {currentStation.health_status || 'NOMINAL'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px] font-sans">
                    {currentStation.name}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Health</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {typeof currentStation.health_score === 'number' ? `${currentStation.health_score.toFixed(1)}%` : '--'}
                  </span>
                </div>
              </div>

              {/* Geo Coordinates & Elevation */}
              <div className="grid grid-cols-2 gap-2 mb-3.5">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                  <div className="text-[10px] text-slate-500 uppercase font-mono flex items-center gap-1 mb-1">
                    <MapPin size={10} className="text-rose-500 dark:text-rose-400" /> Location
                  </div>
                  <div className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                    {currentStation.latitude?.toFixed(2)}°N, {currentStation.longitude?.toFixed(2)}°E
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
                  <div className="text-[10px] text-slate-500 uppercase font-mono flex items-center gap-1 mb-1">
                    <TrendingUp size={10} className="text-rose-500 dark:text-rose-400" /> Elevation
                  </div>
                  <div className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                    {currentStation.elevation ?? 216} m MSL
                  </div>
                </div>
              </div>

              {/* Live Metric Tiles */}
              <div className="space-y-2 mb-3.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
                  <span>Observation Stream</span>
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-center">
                    <Thermometer size={14} className="text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                    <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">{temperature.toFixed(1)}°C</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">Temp</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-center">
                    <Gauge size={14} className="text-sky-600 dark:text-sky-400 mx-auto mb-1" />
                    <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">{pressure.toFixed(0)}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">hPa</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-center">
                    <Droplets size={14} className="text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
                    <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">{humidity.toFixed(0)}%</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">Hum</div>
                  </div>
                </div>
              </div>

              {/* Wind Speed Secondary Metric */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs font-mono mb-2">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Wind size={13} className="text-rose-500 dark:text-rose-400" />
                  <span>Wind Velocity</span>
                </div>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{windSpeed.toFixed(1)} km/h</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3.5 mt-3.5 border-t border-slate-200 dark:border-white/[0.06] flex items-center gap-2">
              <button
                onClick={() => onNavigate('live')}
                className="m-btn-primary flex-1 justify-center cursor-pointer"
              >
                <Eye size={13} />
                <span>Live Stream</span>
              </button>
              <button
                onClick={() => onNavigate('alerts')}
                className="m-btn-secondary cursor-pointer"
                title="View Station Events"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
