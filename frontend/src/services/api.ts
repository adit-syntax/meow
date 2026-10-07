/**
 * SkyGuard AI — High-Performance Typed REST API Service Client.
 * Features in-memory caching, request deduplication, and instantaneous tab switching.
 */

import {
  AnomalyEvent,
  AnomalyEventDetail,
  AnomalyStats,
  DataSourceListResponse,
  DataSourceStatus,
  DataSourceType,
  FleetHealthSummary,
  InferenceResult,
  Observation,
  SimulationStatus,
  Station,
  StationHealthDetail,
  SystemMetrics,
} from '../types';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL
  ? `${(import.meta as any).env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

// In-memory cache store & in-flight request deduplication map
const apiCache = new Map<string, { data: any; timestamp: number }>();
const inFlightRequests = new Map<string, Promise<any>>();

export function invalidateApiCache(prefix?: string) {
  if (!prefix) {
    apiCache.clear();
  } else {
    for (const key of apiCache.keys()) {
      if (key.startsWith(prefix)) {
        apiCache.delete(key);
      }
    }
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`API error (${res.status} ${res.statusText}): ${errorBody}`);
  }
  return res.json();
}

async function cachedGet<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const cached = apiCache.get(key);
  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data as T;
  }

  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key) as Promise<T>;
  }

  const reqPromise = fetcher()
    .then((data) => {
      apiCache.set(key, { data, timestamp: Date.now() });
      inFlightRequests.delete(key);
      return data;
    })
    .catch((err) => {
      inFlightRequests.delete(key);
      if (cached) return cached.data as T;
      throw err;
    });

  inFlightRequests.set(key, reqPromise);
  return reqPromise;
}

export async function fetchHealth(): Promise<{ status: string; service: string; version: string }> {
  return cachedGet('health', 5000, async () => {
    const res = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(res);
  });
}

export async function fetchStations(status?: string): Promise<{ items: Station[]; total: number }> {
  const key = `stations:${status || 'all'}`;
  return cachedGet(key, 2000, async () => {
    const url = status ? `${API_BASE_URL}/stations?status=${encodeURIComponent(status)}` : `${API_BASE_URL}/stations`;
    const res = await fetch(url);
    return handleResponse(res);
  });
}

export async function fetchStation(stationId: string): Promise<Station> {
  const key = `station:${stationId}`;
  return cachedGet(key, 2000, async () => {
    const res = await fetch(`${API_BASE_URL}/stations/${encodeURIComponent(stationId)}`);
    return handleResponse(res);
  });
}

export async function fetchObservations(params?: {
  station_id?: string;
  start_time?: string;
  end_time?: string;
  limit?: number;
  page?: number;
  page_size?: number;
  order?: 'asc' | 'desc';
}): Promise<{ items: Observation[]; total: number; page?: number; page_size?: number }> {
  const query = new URLSearchParams();
  if (params?.station_id) query.append('station_id', params.station_id);
  if (params?.start_time) query.append('start_time', params.start_time);
  if (params?.end_time) query.append('end_time', params.end_time);
  if (params?.limit) query.append('page_size', params.limit.toString());
  if (params?.page_size) query.append('page_size', params.page_size.toString());
  if (params?.page) query.append('page', params.page.toString());
  if (params?.order) query.append('order', params.order);

  const key = `obs:${query.toString()}`;
  return cachedGet(key, 1000, async () => {
    const res = await fetch(`${API_BASE_URL}/observations?${query.toString()}`);
    return handleResponse(res);
  });
}

export async function fetchAnomalies(params?: {
  station_id?: string;
  severity?: string;
  classification?: string;
  limit?: number;
  offset?: number;
  page?: number;
  page_size?: number;
  fleet_balanced?: boolean;
}): Promise<{ items: AnomalyEvent[]; total: number; page?: number; page_size?: number }> {
  const query = new URLSearchParams();
  if (params?.station_id) query.append('station_id', params.station_id);
  if (params?.severity) query.append('severity', params.severity);
  if (params?.classification) query.append('classification', params.classification);
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.page_size) query.append('page_size', params.page_size.toString());
  if (params?.page) query.append('page', params.page.toString());
  if (params?.fleet_balanced !== undefined) query.append('fleet_balanced', params.fleet_balanced.toString());

  const key = `anomalies:${query.toString()}`;
  return cachedGet(key, 2000, async () => {
    const res = await fetch(`${API_BASE_URL}/anomalies?${query.toString()}`);
    return handleResponse(res);
  });
}

export async function fetchAnomalyStats(hours: number = 24): Promise<AnomalyStats> {
  const key = `anomaly_stats:${hours}`;
  return cachedGet(key, 1000, async () => {
    const res = await fetch(`${API_BASE_URL}/anomalies/stats?hours=${hours}`);
    return handleResponse(res);
  });
}

export async function fetchAnomalyDetail(id: number): Promise<AnomalyEventDetail> {
  const key = `anomaly_detail:${id}`;
  return cachedGet(key, 2000, async () => {
    const res = await fetch(`${API_BASE_URL}/anomalies/${id}`);
    return handleResponse(res);
  });
}

export async function fetchFleetHealth(): Promise<FleetHealthSummary> {
  const key = 'fleet_health';
  return cachedGet(key, 1000, async () => {
    const res = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(res);
  });
}

export async function fetchStationHealth(stationId: string): Promise<StationHealthDetail> {
  const key = `station_health:${stationId}`;
  return cachedGet(key, 1000, async () => {
    const res = await fetch(`${API_BASE_URL}/health/${encodeURIComponent(stationId)}`);
    return handleResponse(res);
  });
}

export async function fetchMetrics(): Promise<SystemMetrics> {
  return cachedGet('metrics', 5000, async () => {
    const res = await fetch(`${API_BASE_URL}/metrics`);
    return handleResponse(res);
  });
}

export async function startSimulation(config?: {
  station_ids?: string[];
  interval_seconds?: number;
  noise_level?: number;
  scenario?: string;
}): Promise<SimulationStatus> {
  invalidateApiCache();
  const res = await fetch(`${API_BASE_URL}/simulation/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config || {}),
  });
  return handleResponse(res);
}

export async function stopSimulation(): Promise<SimulationStatus> {
  invalidateApiCache();
  const res = await fetch(`${API_BASE_URL}/simulation/stop`, {
    method: 'POST',
  });
  return handleResponse(res);
}

export async function getSimulationStatus(): Promise<SimulationStatus> {
  const res = await fetch(`${API_BASE_URL}/simulation/status`);
  return handleResponse(res);
}

export async function injectAnomaly(params: {
  station_id: string;
  parameter?: string;
  anomaly_type: string;
  magnitude?: number;
  duration_steps?: number;
  decay?: boolean;
}): Promise<{ status: string; message: string }> {
  invalidateApiCache();
  const res = await fetch(`${API_BASE_URL}/anomalies/inject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function clearInjectedAnomaly(stationId?: string): Promise<{ status: string; message: string }> {
  invalidateApiCache();
  const res = await fetch(`${API_BASE_URL}/anomalies/inject/clear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ station_id: stationId }),
  });
  return handleResponse(res);
}

export async function runInference(params: {
  temperature?: number;
  pressure?: number;
  humidity?: number;
  station_id?: string;
}): Promise<InferenceResult> {
  const res = await fetch(`${API_BASE_URL}/inference`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function uploadCSV(file: File): Promise<{
  total_records: number;
  valid_records: number;
  anomalies_detected: number;
  processing_time_ms: number;
  results: InferenceResult[];
}> {
  invalidateApiCache();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/upload/csv`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(res);
}

// ---------------------------------------------------------------------------
// Interchangeable Data Source Layer API
// ---------------------------------------------------------------------------
export async function fetchDataSources(): Promise<DataSourceListResponse> {
  return cachedGet('data_sources', 10000, async () => {
    const res = await fetch(`${API_BASE_URL}/sources`);
    return handleResponse(res);
  });
}

export async function selectDataSource(sourceType: DataSourceType): Promise<any> {
  invalidateApiCache();
  const res = await fetch(`${API_BASE_URL}/sources/switch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_type: sourceType }),
  });
  return handleResponse(res);
}

export const switchDataSource = selectDataSource;

export async function fetchExternalWeatherPreview(cityId?: string): Promise<{
  station_id: string;
  latitude: number;
  longitude: number;
  current_weather: {
    temperature: number;
    pressure: number;
    humidity: number;
    timestamp: string;
  };
}> {
  const url = cityId ? `${API_BASE_URL}/sources/preview/external?city=${cityId}` : `${API_BASE_URL}/sources/preview/external`;
  const res = await fetch(url);
  return handleResponse(res);
}

export async function configureExternalWeather(config: {
  latitude: number;
  longitude: number;
  station_id?: string;
  station_name?: string;
  poll_interval_seconds?: number;
}): Promise<any> {
  invalidateApiCache();
  const res = await fetch(`${API_BASE_URL}/sources/configure/external`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return handleResponse(res);
}

export const configureExternalWeatherSource = configureExternalWeather;

export async function configurePhysicalAWS(config: {
  broker_host?: string;
  broker_port?: number;
  username?: string;
  password?: string;
  use_tls?: boolean;
  telemetry_topic?: string;
  heartbeat_topic?: string;
}): Promise<{ status: string; message: string; config: any }> {
  invalidateApiCache();
  const res = await fetch(`${API_BASE_URL}/sources/configure/physical`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return handleResponse(res);
}

export async function askMistyApi(params: {
  query: string;
  language: 'EN' | 'HINGLISH' | 'HI';
  current_page?: string;
  api_key?: string;
}): Promise<{
  text: string;
  source: string;
  term?: string;
  suggested_questions: string[];
}> {
  const res = await fetch(`${API_BASE_URL}/misty/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

