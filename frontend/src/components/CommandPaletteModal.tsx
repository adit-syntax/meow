import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Compass,
  Eye,
  AlertTriangle,
  ShieldCheck,
  Cpu,
  Database,
  Zap,
  Layers,
  MapPin,
  Sliders,
  X,
  ArrowRight,
  Play,
  Pause,
  LucideIcon,
} from 'lucide-react';
import { Station } from '../types';
import { useTheme } from '../context/ThemeContext';

interface CommandPaletteItem {
  id: string;
  label: string;
  category: string;
  icon: LucideIcon;
  key?: string;
  isNav?: boolean;
  isAction?: boolean;
  isStation?: boolean;
  stationId?: string;
  isSelected?: boolean;
  action?: () => void;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: Station[];
  selectedStationId: string;
  onSelectStation: (stationId: string) => void;
  onNavigateTab: (tab: any) => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onOpenSettings: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  stations,
  selectedStationId,
  onSelectStation,
  onNavigateTab,
  isStreaming,
  onToggleStreaming,
  onOpenSettings,
}) => {
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickNav: CommandPaletteItem[] = [
    { id: 'overview', label: 'Command Center Overview', category: 'Navigation', icon: Compass, key: '1', isNav: true },
    { id: 'live', label: 'Live Real-Time Telemetry Stream', category: 'Navigation', icon: Eye, key: '2', isNav: true },
    { id: 'alerts', label: 'Alert & Incident Center', category: 'Navigation', icon: AlertTriangle, key: '3', isNav: true },
    { id: 'health', label: 'Fleet Sensor Health & Calibration', category: 'Navigation', icon: ShieldCheck, key: '4', isNav: true },
    { id: 'events', label: 'Forensic Event Deep Dive', category: 'Navigation', icon: Cpu, key: '5', isNav: true },
    { id: 'explorer', label: 'Data Explorer & Historical Query', category: 'Navigation', icon: Database, key: '6', isNav: true },
    { id: 'injector', label: 'Anomaly Simulation Lab', category: 'Navigation', icon: Zap, key: '7', isNav: true },
    { id: 'explainability', label: 'TreeSHAP & Physics Explainability', category: 'Navigation', icon: Layers, key: '8', isNav: true },
  ];

  const actions: CommandPaletteItem[] = [
    {
      id: 'toggle-stream',
      label: isStreaming ? 'Pause Live Telemetry Stream' : 'Resume Live Telemetry Stream',
      category: 'Controls',
      icon: isStreaming ? Pause : Play,
      isAction: true,
      action: () => {
        onToggleStreaming();
        onClose();
      },
    },
    {
      id: 'settings',
      label: 'Open System Settings & QC Preferences',
      category: 'Controls',
      icon: Sliders,
      isAction: true,
      action: () => {
        onOpenSettings();
        onClose();
      },
    },
  ];

  const stationItems: CommandPaletteItem[] = stations.map((s) => ({
    id: `station-${s.station_id}`,
    label: `${s.station_id} — ${s.name} (${s.latitude.toFixed(2)}°N, ${s.longitude.toFixed(2)}°E)`,
    category: 'Weather Stations',
    icon: MapPin,
    isStation: true,
    stationId: s.station_id,
    isSelected: s.station_id === selectedStationId,
  }));

  const allItems: CommandPaletteItem[] = [
    ...quickNav,
    ...actions,
    ...stationItems,
  ];

  const filtered = allItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (item: CommandPaletteItem) => {
    if (item.isNav) {
      onNavigateTab(item.id);
      onClose();
    } else if (item.isAction && item.action) {
      item.action();
    } else if (item.isStation && item.stationId) {
      onSelectStation(item.stationId);
      onClose();
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 backdrop-blur-md animate-fade-in select-none ${
      isDark ? 'bg-black/75' : 'bg-slate-900/40'
    }`}>
      <div
        className={`w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col border shadow-2xl ${
          isDark
            ? 'bg-[#0F172A] border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] text-white'
            : 'bg-white border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className={`relative flex items-center px-4 py-3.5 border-b ${
          isDark ? 'bg-[#131E33]/90 border-white/[0.08]' : 'bg-slate-50 border-slate-200'
        }`}>
          <Search className={`w-5 h-5 mr-3 shrink-0 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
              } else if (e.key === 'Enter' && filtered[selectedIndex]) {
                e.preventDefault();
                handleSelect(filtered[selectedIndex]);
              }
            }}
            placeholder="Type a command, jump to view, or search station (e.g. 'Pune', 'Alerts', 'Stream')..."
            className={`w-full bg-transparent text-sm focus:outline-none font-sans ${
              isDark ? 'text-white placeholder-slate-400' : 'text-slate-900 placeholder-slate-400'
            }`}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className={`p-1 rounded-lg mr-1 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className={`hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono rounded border ${
            isDark ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-500 bg-slate-200 border-slate-300'
          }`}>
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className={`py-12 text-center text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              No matching commands or stations found for "{search}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs cursor-pointer transition-all border ${
                    isSelected
                      ? isDark
                        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                        : 'bg-blue-50 text-blue-800 border-blue-200 font-medium'
                      : isDark
                      ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white border-transparent'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected
                          ? isDark
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-blue-100 text-blue-700'
                          : isDark
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="font-semibold">{item.label}</div>
                      <div className={`text-[10px] uppercase font-mono tracking-wider ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.key && (
                      <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                        isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}>
                        {item.key}
                      </kbd>
                    )}
                    {item.isSelected && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                        isDark ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        ACTIVE
                      </span>
                    )}
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected
                          ? isDark
                            ? 'text-cyan-400 translate-x-0.5'
                            : 'text-blue-600 translate-x-0.5'
                          : isDark
                          ? 'text-slate-600'
                          : 'text-slate-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className={`px-4 py-2.5 border-t flex items-center justify-between text-[11px] font-mono ${
          isDark ? 'bg-[#090D16] border-white/[0.06] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center gap-3">
            <span>
              <kbd className={`px-1 rounded border mr-1 ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'
              }`}>↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className={`px-1 rounded border mr-1 ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'
              }`}>↵</kbd> Select
            </span>
          </div>
          <div className={`font-bold ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>SkyGuard Command Palette</div>
        </div>
      </div>
    </div>
  );
};

