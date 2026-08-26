/**
 * frontend/src/types/config.ts
 * SkyGuard AI — Configuration, Preferences, and System Health Type Definitions.
 */

import type { DataSourceType, DataSourceStatus } from './domain';

// ─── City Presets ───────────────────────────────────────────────────

export interface CityPreset {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  station_id: string;
  description: string;
}

// ─── Display & Operator Preferences ─────────────────────────────────

export type DisplayDensity = 'comfortable' | 'compact' | 'operator';

export type ViewId =
  | 'overview'
  | 'live'
  | 'alerts'
  | 'health'
  | 'events'
  | 'explorer'
  | 'injector'
  | 'explainability';

export interface OperatorPreferences {
  displayDensity: DisplayDensity;
  reducedMotion: boolean;
  defaultView: ViewId;
  defaultStationId: string;
  defaultDataSource: DataSourceType;
  timezone: string;
}

// ─── System Health Diagnostics ──────────────────────────────────────

export interface SystemHealthStatus {
  websocket: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';
  restApi: 'HEALTHY' | 'DEGRADED' | 'ERROR';
  databaseWal: 'HEALTHY' | 'DEGRADED' | 'ERROR';
  mlEngine: 'READY' | 'INITIALIZING' | 'DEGRADED';
  spatialConsensus: 'READY' | 'STANDBY';
  openMeteo: 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';
}

// ─── System Configuration ───────────────────────────────────────────

export interface SystemConfiguration {
  activeSource: DataSourceType;
  selectedCityId: string;
  selectedStationId: string;
  activeSourceStatus: DataSourceStatus | null;
  preferences: OperatorPreferences;
  systemHealth: SystemHealthStatus;
}

// ─── Navigation ─────────────────────────────────────────────────────

export type NavGroupId = 'monitoring' | 'analysis' | 'tools';

export interface NavItem {
  id: ViewId;
  label: string;
  path: string;
  icon: string; // Lucide icon name
  shortcut: string;
  group: NavGroupId;
}

export interface NavGroup {
  id: NavGroupId;
  label: string;
  items: NavItem[];
}
