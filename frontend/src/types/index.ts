/**
 * frontend/src/types/index.ts
 * SkyGuard AI — Barrel Export for All Type Definitions.
 * Re-exports from organized type modules for backward compatibility.
 */

// Domain types (core business entities)
export type {
  Observation,
  FeatureAttribution,
  ExplanationResult,
  TierScores,
  SeverityLevel,
  InferenceResult,
  DataSourceType,
  SourceConnectionStatus,
  DataSourceStatus,
  DataSourceListResponse,
  Station,
  SpatialConsensusResult,
  AnomalyEvent,
  AnomalyEventDetail,
  SensorHealthRecord,
  StationHealthDetail,
  FleetHealthSummary,
  AnomalyStats,
  SimulationStatus,
  SystemMetrics,
} from './domain';

// Configuration types
export type {
  CityPreset,
  DisplayDensity,
  ViewId,
  OperatorPreferences,
  SystemHealthStatus,
  SystemConfiguration,
  NavGroupId,
  NavItem,
  NavGroup,
} from './config';

// Data presets (re-exported for backward compatibility)
export { CITY_PRESETS } from '../data/presets';
