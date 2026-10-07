/**
 * frontend/src/design-system/components/NetworkMap.tsx
 * SkyGuard AI — 2D Interactive Synoptic Surface GIS Map.
 * Real Leaflet WGS84 tile mapping with ESRI Satellite / CartoDB Dark Matter tile switching,
 * dynamic distance scale, station integrity badges, unified 3D/2D switcher,
 * and 100% header/footer design parity with the 3D Planetary Digital Twin.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Station } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import {
  Globe,
  MapPin,
  Map,
  Satellite,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  X,
} from 'lucide-react';

export interface NetworkMapProps {
  stations: Station[];
  selectedStationId?: string;
  onSelectStation?: (stationId: string) => void;
  mapMode?: '3D' | '2D';
  onMapModeChange?: (mode: '3D' | '2D') => void;
  surfaceTexture?: 'SAT' | 'MAP';
  onSurfaceTextureChange?: (tex: 'SAT' | 'MAP') => void;
  className?: string;
}

export const NetworkMap: React.FC<NetworkMapProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  mapMode = '2D',
  onMapModeChange,
  surfaceTexture = 'SAT',
  onSurfaceTextureChange,
  className = '',
}) => {
  const { isDark } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Record<string, L.CircleMarker>>({});

  const [localTexture, setLocalTexture] = useState<'SAT' | 'MAP'>(surfaceTexture);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [isFullPage, setIsFullPage] = useState<boolean>(false);
  const [zuluTime, setZuluTime] = useState<string>('');
  const [cursorCoordinateText, setCursorCoordinateText] = useState<string>('28.61°N, 77.21°E');
  const [scaleKm, setScaleKm] = useState<number>(2000);
  const [scaleBarPx, setScaleBarPx] = useState<number>(72);

  // Synchronize local texture with prop
  useEffect(() => {
    setLocalTexture(surfaceTexture);
  }, [surfaceTexture]);

  // Synchronize selected entity with prop
  useEffect(() => {
    if (selectedStationId) {
      const found = stations.find((s) => s.station_id === selectedStationId);
      if (found) setSelectedEntity(found);
    }
  }, [selectedStationId, stations]);

  // Zulu Clock Ticker
  useEffect(() => {
    const updateZulu = () => {
      const now = new Date();
      setZuluTime(now.toISOString().slice(11, 19) + 'Z');
    };
    updateZulu();
    const t = setInterval(updateZulu, 1000);
    return () => clearInterval(t);
  }, []);

  // Handle Full Page Escape Key
  useEffect(() => {
    if (!isFullPage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullPage(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullPage]);

  // Dynamic Scale Calibration
  const updateExactScale = useCallback((map: L.Map) => {
    const center = map.getCenter();
    const pt1 = map.latLngToContainerPoint(center);
    const pt2 = L.point(pt1.x + 80, pt1.y);
    const latLng2 = map.containerPointToLatLng(pt2);
    const groundMeters = center.distanceTo(latLng2);
    const groundKm = groundMeters / 1000;

    let roundKm = 1000;
    if (groundKm < 35) roundKm = 25;
    else if (groundKm < 75) roundKm = 50;
    else if (groundKm < 150) roundKm = 100;
    else if (groundKm < 350) roundKm = 250;
    else if (groundKm < 750) roundKm = 500;
    else if (groundKm < 1500) roundKm = 1000;
    else if (groundKm < 3500) roundKm = 2000;
    else roundKm = 5000;

    const kmPerPx = groundKm / 80;
    const barPx = Math.max(36, Math.min(140, Math.round(roundKm / kmPerPx)));
    setScaleKm(roundKm);
    setScaleBarPx(barPx);
  }, []);

  // Invalidate Leaflet Map Size on Full Page toggle
  useEffect(() => {
    const handleInvalidate = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        updateExactScale(mapInstanceRef.current);
      }
    };
    handleInvalidate();
    const timers = [30, 80, 180, 320].map((d) => setTimeout(handleInvalidate, d));
    return () => timers.forEach(clearTimeout);
  }, [isFullPage, updateExactScale]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.5, 78.9],
      zoom: 4,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
    });

    const getTileUrl = () => {
      if (localTexture === 'SAT') {
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      }
      return isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    };

    const layer = L.tileLayer(getTileUrl(), { maxZoom: 19 }).addTo(map);
    currentTileLayerRef.current = layer;

    // Track Cursor Coordinates
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      const latDeg = e.latlng.lat;
      let lonDeg = e.latlng.lng;
      while (lonDeg < -180) lonDeg += 360;
      while (lonDeg > 180) lonDeg -= 360;
      const latDir = latDeg >= 0 ? 'N' : 'S';
      const lonDir = lonDeg >= 0 ? 'E' : 'W';
      setCursorCoordinateText(`${Math.abs(latDeg).toFixed(2)}°${latDir}, ${Math.abs(lonDeg).toFixed(2)}°${lonDir}`);
    });

    // Geodesic distance listener for dynamic scale
    const handleMapChange = () => {
      updateExactScale(map);
    };

    map.on('zoomend', handleMapChange);
    map.on('moveend', handleMapChange);

    mapInstanceRef.current = map;
    setTimeout(() => updateExactScale(map), 100);

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        updateExactScale(mapInstanceRef.current);
      }
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [updateExactScale, isDark, localTexture]);

  // Update Tile Layer when SAT / MAP or Theme changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      currentTileLayerRef.current.remove();
    }

    const tileUrl =
      localTexture === 'SAT'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    const layer = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);
    currentTileLayerRef.current = layer;
  }, [localTexture, isDark]);

  // Update Station Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    stations.forEach((st) => {
      if (!st.latitude || !st.longitude) return;

      const isSelected = st.station_id === selectedStationId;
      const health = st.health_score ?? 98;
      const isCritical = health < 60 || st.status === 'CRITICAL';
      const isWarning = (health >= 60 && health < 85) || st.status === 'WARNING' || st.status === 'DEGRADED';

      const color = isSelected ? '#0284c7' : isCritical ? '#dc2626' : isWarning ? '#d97706' : '#059669';

      const marker = L.circleMarker([st.latitude, st.longitude], {
        radius: isSelected ? 9 : 6.5,
        fillColor: color,
        color: isSelected ? '#ffffff' : color,
        weight: isSelected ? 2.5 : 1.5,
        opacity: 1,
        fillOpacity: isSelected ? 0.95 : 0.85,
      }).addTo(map);

      marker.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px; padding: 3px 6px; background: ${isDark ? '#080c16' : '#ffffff'}; border: 1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}; border-radius: 6px; color: ${isDark ? '#fff' : '#0f172a'}; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <strong style="color: ${color};">${st.station_id}</strong><br/>
          <span style="color: ${isDark ? '#cbd5e1' : '#475569'}; font-size: 10px;">${st.name}</span><br/>
          <span style="color: ${isDark ? '#94a3b8' : '#64748b'}; font-size: 9px;">Health: ${typeof st.health_score === 'number' ? `${st.health_score.toFixed(1)}%` : '--'} | ${st.latitude.toFixed(2)}°N, ${st.longitude.toFixed(2)}°E</span>
        </div>`,
        {
          direction: 'top',
          offset: [0, -6],
          className: isDark ? 'leaflet-dark-tooltip' : 'leaflet-light-tooltip',
        }
      );

      marker.on('click', () => {
        setSelectedEntity(st);
        if (onSelectStation) {
          onSelectStation(st.station_id);
        }
      });

      markersRef.current[st.station_id] = marker;
    });
  }, [stations, selectedStationId, onSelectStation, isDark]);

  // Pan to selected station if changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedStationId) return;

    const target = stations.find((s) => s.station_id === selectedStationId);
    if (target && target.latitude && target.longitude) {
      map.flyTo([target.latitude, target.longitude], Math.max(map.getZoom(), 5), {
        duration: 0.8,
      });
    }
  }, [selectedStationId, stations]);

  const handleTextureSwitch = (tex: 'SAT' | 'MAP') => {
    setLocalTexture(tex);
    if (onSurfaceTextureChange) onSurfaceTextureChange(tex);
  };

  const handleZoom = (delta: number) => {
    if (!mapInstanceRef.current) return;
    if (delta < 0) {
      mapInstanceRef.current.zoomIn();
    } else {
      mapInstanceRef.current.zoomOut();
    }
  };

  return (
    <div
      className={
        isFullPage
          ? `fixed inset-0 z-50 w-screen h-screen overflow-hidden select-none font-sans animate-fadeIn ${
              isDark ? 'bg-[#02040a]' : 'bg-[#f8fafc]'
            }`
          : `relative w-full h-[340px] sm:h-[440px] md:h-[500px] lg:h-[540px] rounded-2xl overflow-hidden select-none transition-all ${
              isDark
                ? 'bg-[#02040a] border border-white/[0.08] shadow-[0_0_80px_rgba(0,0,0,0.9)]'
                : 'bg-[#f8fafc] border border-slate-200 shadow-sm'
            } ${className}`
      }
    >
      {/* ─── TOP STATUS HUD (Frosted Glass Translucent Pill) ──────────────── */}
      <div className="absolute top-3 left-4 right-4 z-[400] flex flex-wrap items-center justify-between pointer-events-none gap-2">
        {/* Left Telemetry Stamp */}
        <div
          className={`flex items-center gap-3 backdrop-blur-md px-3.5 py-1.5 rounded-xl pointer-events-auto transition-all ${
            isDark
              ? 'bg-[#060914]/90 border border-white/[0.08] shadow-lg text-slate-200'
              : 'bg-white/90 border border-slate-200 shadow-sm text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span
              className={`text-xs font-black font-mono tracking-widest uppercase ${
                isDark ? 'text-amber-300' : 'text-amber-700'
              }`}
            >
              SYNOPTIC OBSERVATION GRID
            </span>
          </div>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              isDark
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            ZULU {zuluTime || 'LIVE'}
          </span>
          <span
            className={`text-[10px] font-mono font-bold ${
              isDark ? 'text-emerald-400' : 'text-emerald-700'
            }`}
          >
            STATUS: LIVE
          </span>
          <span
            className={`text-[10px] font-mono hidden sm:inline ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
            title="Total registered synoptic automatic weather stations in network"
          >
            NODES:{' '}
            <strong className={isDark ? 'text-white' : 'text-slate-900'}>
              {stations.length} SYNOPTIC AWS
            </strong>
          </span>
        </div>

        {/* Right Controls */}
        <div
          className={`flex items-center gap-1.5 backdrop-blur-md p-1 rounded-xl pointer-events-auto transition-all ${
            isDark
              ? 'bg-[#060914]/90 border border-white/[0.08] shadow-lg'
              : 'bg-white/90 border border-slate-200 shadow-sm'
          }`}
        >
          {/* Zoom In / Out */}
          <button
            onClick={() => handleZoom(-1)}
            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Zoom In (+)"
          >
            <ZoomIn size={13} />
          </button>
          <button
            onClick={() => handleZoom(1)}
            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Zoom Out (-)"
          >
            <ZoomOut size={13} />
          </button>
          <div className={`w-[1px] h-3.5 mx-0.5 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
          <button
            onClick={() => setIsFullPage((prev) => !prev)}
            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              isFullPage
                ? isDark
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={isFullPage ? 'Exit Full Page (Esc)' : 'View Full Page'}
          >
            {isFullPage ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Real Interactive Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full select-none z-0" />

      {/* ─── BOTTOM-LEFT TOOLBAR & DYNAMIC SCALE (Frosted Glass Pill) ────── */}
      <div className="absolute bottom-9 left-4 z-[400] pointer-events-auto flex flex-col gap-1.5">
        <div
          className={`flex items-center rounded-xl p-1 font-mono text-xs font-bold backdrop-blur-md transition-all ${
            isDark
              ? 'bg-[#070a12]/95 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] text-slate-300'
              : 'bg-white/90 border border-slate-300 shadow-sm text-slate-800'
          }`}
        >
          {/* 3D Button */}
          <button
            onClick={() => onMapModeChange && onMapModeChange('3D')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              mapMode === '3D'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-inner'
                  : 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe size={13} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
            <span>3D</span>
          </button>

          {/* 2D Button */}
          <button
            onClick={() => onMapModeChange && onMapModeChange('2D')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              mapMode === '2D'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-inner'
                  : 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin size={13} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
            <span>2D</span>
          </button>

          <div className={`w-[1px] h-4 mx-1 ${isDark ? 'bg-amber-500/30' : 'bg-slate-300'}`} />

          {/* MAP Mode */}
          <button
            onClick={() => handleTextureSwitch('MAP')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              localTexture === 'MAP'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-inner'
                  : 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map size={13} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
            <span>MAP</span>
          </button>

          {/* SAT Mode */}
          <button
            onClick={() => handleTextureSwitch('SAT')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              localTexture === 'SAT'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-inner'
                  : 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Satellite size={13} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
            <span>SAT</span>
          </button>
        </div>

        {/* Dynamic Distance Scale Bar */}
        <div
          className={`flex items-center gap-2 text-[10px] font-mono px-2 backdrop-blur-sm rounded-md py-0.5 w-fit border transition-all ${
            isDark
              ? 'bg-[#060914]/90 border-white/[0.08] text-amber-400/90 shadow-md'
              : 'bg-white/90 border-slate-200 text-slate-700 shadow-xs'
          }`}
        >
          <div
            style={{ width: `${scaleBarPx}px` }}
            className={`h-[3px] relative border-l-2 border-r-2 ${
              isDark
                ? 'bg-amber-500/80 border-amber-300'
                : 'bg-amber-600 border-amber-700'
            }`}
          >
            <span
              className={`absolute -top-1 left-1/2 -translate-x-1/2 w-[1px] h-[5px] ${
                isDark ? 'bg-amber-400/50' : 'bg-amber-700/50'
              }`}
            />
          </div>
          <span className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
            {scaleKm.toLocaleString()} km
          </span>
        </div>
      </div>

      {/* ─── SELECTED ENTITY DOSSIER INSPECTOR (Right Slide-In) ────────── */}
      {selectedEntity && (
        <div
          className={`absolute top-14 right-4 z-[400] w-72 rounded-2xl p-4 text-xs font-mono backdrop-blur-xl border space-y-3 animate-slideLeft transition-all ${
            isDark
              ? 'bg-[#080b16]/95 border-white/[0.12] shadow-2xl text-slate-200'
              : 'bg-white/95 border-slate-200 shadow-xl text-slate-800'
          }`}
        >
          <div className={`flex items-start justify-between pb-2 border-b ${isDark ? 'border-white/[0.08]' : 'border-slate-100'}`}>
            <div>
              <span className={`text-[10px] uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Synoptic Telemetry Dossier
              </span>
              <h4 className={`text-sm font-bold leading-tight mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {selectedEntity.name}
              </h4>
              <span className={`text-[10px] font-bold block ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                {selectedEntity.station_id}
              </span>
            </div>
            <button
              onClick={() => setSelectedEntity(null)}
              className={`p-1 rounded-lg cursor-pointer transition-colors ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[9px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Temperature</span>
              <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {selectedEntity.temperature ?? 24.5} °C
              </span>
            </div>
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[9px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Humidity</span>
              <span className={`font-bold text-xs ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>
                {selectedEntity.humidity ?? 58} %
              </span>
            </div>
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[9px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Barometric P</span>
              <span className={`font-bold text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>
                {selectedEntity.pressure ?? 1012.3} hPa
              </span>
            </div>
            <div className={`p-2 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[9px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>QC Status</span>
              <span className={`font-bold text-xs uppercase ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                {selectedEntity.status || 'NOMINAL'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (onSelectStation && selectedEntity.station_id) {
                onSelectStation(selectedEntity.station_id);
              }
            }}
            className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold rounded-xl text-center shadow-md transition-all cursor-pointer"
          >
            Target Live Waveform
          </button>
        </div>
      )}

      {/* ─── BOTTOM STATUS TICKER & EXPLICIT COLOR SYSTEM LEGEND ─────────── */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-[400] backdrop-blur-md px-4 py-1.5 flex items-center justify-between text-[10px] font-mono transition-all ${
          isDark
            ? 'bg-[#04060c]/95 border-t border-amber-500/20 text-slate-400'
            : 'bg-white/90 border-t border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <span className={`font-bold ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
            CURSOR: {cursorCoordinateText}
          </span>
          <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>•</span>
          <span className={`flex items-center gap-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <strong className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>GREEN:</strong> Nominal (Health ≥85%)
            </span>
            <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <strong className={isDark ? 'text-amber-400' : 'text-amber-700'}>AMBER:</strong> Warning / Drift
            </span>
            <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <strong className={isDark ? 'text-rose-400' : 'text-rose-700'}>RED:</strong> Critical Anomaly
            </span>
            <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <strong className={isDark ? 'text-sky-400' : 'text-sky-700'}>CYAN:</strong> Active Focus Node
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

