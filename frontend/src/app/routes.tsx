/**
 * frontend/src/app/routes.tsx
 * SkyGuard AI — React Router Route Configuration with Telemetry Context Adapters.
 * Clean, modular navigation without demo sections.
 */

import React from 'react';
import { createBrowserRouter, Navigate, useNavigate } from 'react-router-dom';
import { AppShell, useTelemetry } from '../components/layout/AppShell';
import { useSystemConfiguration } from '../context/SystemConfigurationContext';

import { OverviewView } from '../components/OverviewView';
import { LiveMonitoringView } from '../components/LiveMonitoringView';
import { AlertCenterView } from '../components/AlertCenterView';
import { EventDetailView } from '../components/EventDetailView';
import { ExplainabilityViewer } from '../components/ExplainabilityViewer';
import { SensorHealthView } from '../components/SensorHealthView';
import { AnomalyInjectorUI } from '../components/AnomalyInjectorUI';
import { DataExplorerView } from '../components/DataExplorerView';
import { DocumentationView } from '../components/DocumentationView';

// ─── Route Adapters ─────────────────────────────────────────────────

function OverviewRouteWrapper() {
  const navigate = useNavigate();
  const { selectedStationId, selectStation } = useSystemConfiguration();
  const { latestTelemetry, historyBuffer } = useTelemetry();

  return (
    <OverviewView
      selectedStationId={selectedStationId}
      onSelectStation={selectStation}
      latestTelemetry={latestTelemetry}
      historyBuffer={historyBuffer}
      onNavigate={(tab) => {
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
    />
  );
}

function LiveMonitoringRouteWrapper() {
  const { selectedStationId, selectStation } = useSystemConfiguration();
  const { latestTelemetry, historyBuffer, isStreaming, toggleStreaming } = useTelemetry();

  return (
    <LiveMonitoringView
      selectedStationId={selectedStationId}
      onSelectStation={selectStation}
      latestTelemetry={latestTelemetry}
      historyBuffer={historyBuffer}
      isStreaming={isStreaming}
      onToggleStreaming={toggleStreaming}
    />
  );
}

function AnomalyInjectorRouteWrapper() {
  const navigate = useNavigate();
  return <AnomalyInjectorUI onNavigateToLive={() => navigate('/telemetry')} />;
}

// ─── Route Configuration ────────────────────────────────────────────

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/synoptic" replace /> },

      // ─── SYNOPTIC MONITORING ──────────────────────────────
      {
        path: 'synoptic',
        element: <OverviewRouteWrapper />,
      },
      {
        path: 'telemetry',
        element: <LiveMonitoringRouteWrapper />,
      },
      {
        path: 'alerts',
        element: <AlertCenterView />,
      },

      // ─── MET QUALITY & XAI ────────────────────────────────
      {
        path: 'forensics',
        element: <EventDetailView />,
      },
      {
        path: 'forensics/:eventId',
        element: <EventDetailView />,
      },
      {
        path: 'diagnostics',
        element: <ExplainabilityViewer />,
      },
      {
        path: 'diagnostics/:eventId',
        element: <ExplainabilityViewer />,
      },
      {
        path: 'sensors',
        element: <SensorHealthView />,
      },

      // ─── SIMULATION & ARCHIVE ─────────────────────────────
      {
        path: 'simulator',
        element: <AnomalyInjectorRouteWrapper />,
      },
      {
        path: 'archive',
        element: <DataExplorerView />,
      },
      {
        path: 'docs',
        element: <DocumentationView />,
      },

      // ─── Legacy Route Aliases (Smooth Transition) ─────────
      { path: 'monitoring/overview', element: <Navigate to="/synoptic" replace /> },
      { path: 'monitoring/live', element: <Navigate to="/telemetry" replace /> },
      { path: 'monitoring/alerts', element: <Navigate to="/alerts" replace /> },
      { path: 'analysis/events', element: <Navigate to="/forensics" replace /> },
      { path: 'analysis/events/:eventId', element: <Navigate to="/forensics" replace /> },
      { path: 'analysis/explain', element: <Navigate to="/diagnostics" replace /> },
      { path: 'analysis/explain/:eventId', element: <Navigate to="/diagnostics" replace /> },
      { path: 'analysis/health', element: <Navigate to="/sensors" replace /> },
      { path: 'tools/lab', element: <Navigate to="/simulator" replace /> },
      { path: 'tools/explorer', element: <Navigate to="/archive" replace /> },

      // ─── Catch-all: redirect unknown routes ──────────────
      { path: '*', element: <Navigate to="/synoptic" replace /> },
    ],
  },
]);

// ─── Navigation Configuration ───────────────────────────────────────

export interface RouteNavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  shortcut: string;
}

export interface RouteNavGroup {
  id: string;
  label: string;
  items: RouteNavItem[];
}

export const NAV_GROUPS: RouteNavGroup[] = [
  {
    id: 'monitoring',
    label: 'SYNOPTIC MONITORING',
    items: [
      { id: 'overview', label: 'Synoptic Grid', path: '/synoptic', icon: 'Compass', shortcut: '1' },
      { id: 'live', label: 'AWS Telemetry', path: '/telemetry', icon: 'Eye', shortcut: '2' },
      { id: 'alerts', label: 'QC Alerts', path: '/alerts', icon: 'AlertTriangle', shortcut: '3' },
    ],
  },
  {
    id: 'analysis',
    label: 'MET QUALITY & XAI',
    items: [
      { id: 'events', label: 'QC Forensics', path: '/forensics', icon: 'Cpu', shortcut: '4' },
      { id: 'explainability', label: 'XAI Diagnostics', path: '/diagnostics', icon: 'Layers', shortcut: '5' },
      { id: 'health', label: 'Sensor Health', path: '/sensors', icon: 'ShieldCheck', shortcut: '6' },
    ],
  },
  {
    id: 'tools',
    label: 'SIMULATION & ARCHIVE',
    items: [
      { id: 'injector', label: 'AWS Simulator', path: '/simulator', icon: 'Zap', shortcut: '7' },
      { id: 'explorer', label: 'Met Archive', path: '/archive', icon: 'Database', shortcut: '8' },
    ],
  },
];
