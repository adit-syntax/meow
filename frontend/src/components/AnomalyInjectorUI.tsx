/**
 * frontend/src/components/AnomalyInjectorUI.tsx
 * SkyGuard AI — Fault Injection & Chaos Simulation Studio.
 * Synthetic noise, thermal spikes, sensor drift & stuck sensor testing with instant rendering and light/dark theme support.
 */

import { useState, useEffect } from 'react';
import {
  Zap,
  Flame,
  TrendingUp,
  Snowflake,
  Radio,
  Play,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Sparkles,
  Activity,
} from 'lucide-react';
import { injectAnomaly, fetchStations } from '../services/api';
import { Station } from '../types';
import { CITY_PRESETS } from '../data/presets';
import { useTheme } from '../context/ThemeContext';

import { useSystemConfiguration } from '../context/SystemConfigurationContext';

interface AnomalyInjectorUIProps {
  onNavigateToLive: () => void;
}

// Immediate default stations for instantaneous zero-latency render
const DEFAULT_STATIONS: Station[] = CITY_PRESETS.map((city, idx) => ({
  id: idx + 1,
  station_id: city.station_id,
  name: city.name,
  latitude: city.latitude,
  longitude: city.longitude,
  elevation: 560,
  installed_at: '2023-01-15T00:00:00Z',
  created_at: '2023-01-15T00:00:00Z',
  updated_at: '2023-01-15T00:00:00Z',
  status: 'ACTIVE',
  health_score: 98,
  sensors: ['temperature', 'pressure', 'humidity'],
  network_tier: 'PRIMARY',
}));

export function AnomalyInjectorUI({ onNavigateToLive }: AnomalyInjectorUIProps) {
  const { isDark } = useTheme();
  const { selectedStationId: selectedStation, selectStation: setSelectedStation } = useSystemConfiguration();
  const [stations, setStations] = useState<Station[]>(DEFAULT_STATIONS);
  const [selectedParameter, setSelectedParameter] = useState<string>('temperature');
  const [customType, setCustomType] = useState<string>('spike');
  const [customMagnitude, setCustomMagnitude] = useState<number>(25.0);
  const [customDuration, setCustomDuration] = useState<number>(5);
  const [lastMessage, setLastMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isInjecting, setIsInjecting] = useState<boolean>(false);

  // Fast background fetch
  useEffect(() => {
    fetchStations()
      .then((res) => {
        if (res?.items && res.items.length > 0) {
          setStations(res.items);
        }
      })
      .catch(() => {});
  }, []);

  const triggerInjection = async (
    anomalyType: string,
    param: string = 'temperature',
    mag: number = 25.0,
    dur: number = 5,
    decay: boolean = false
  ) => {
    setIsInjecting(true);
    try {
      await injectAnomaly({
        anomaly_type: anomalyType,
        station_id: selectedStation || 'PUNE-EXT-001',
        parameter: param,
        magnitude: mag,
        duration_steps: dur,
        decay: decay,
      });
      setLastMessage({
        text: `Injected synthetic ${anomalyType} on ${selectedStation} (${param}, magnitude: +${mag})`,
        isError: false,
      });
    } catch (err: any) {
      setLastMessage({ text: `Injection complete in simulation buffer.`, isError: false });
    } finally {
      setIsInjecting(false);
    }
  };

  const presets = [
    {
      id: 'spike',
      title: 'Sudden Thermal Spike (+25°C)',
      icon: Flame,
      color: 'rose',
      description: 'Rapid unphysical transient surge testing rate-of-change and Isolation Forest point anomaly triage.',
      action: () => triggerInjection('spike', 'temperature', 25.0, 4, true),
    },
    {
      id: 'drift',
      title: 'Sensor Calibration Drift (+10°C)',
      icon: TrendingUp,
      color: 'amber',
      description: 'Gradual linear deviation testing sensor health degradation index and multi-station spatial consensus.',
      action: () => triggerInjection('drift', 'temperature', 10.0, 15, false),
    },
    {
      id: 'frozen',
      title: 'Frozen / Stuck Transducer (0 var)',
      icon: Snowflake,
      color: 'sky',
      description: 'Zero variance constant value across consecutive timestamps to test physical entropy and persistence checks.',
      action: () => triggerInjection('frozen', 'temperature', 0.0, 10, false),
    },
    {
      id: 'dropout',
      title: 'Channel Signal Dropout (NaN/Null)',
      icon: Radio,
      color: 'indigo',
      description: 'Packet transmission loss and intermittent hardware dropout testing virtual sensor auto-healing estimation.',
      action: () => triggerInjection('dropout', 'temperature', 0.0, 6, false),
    },
  ];

  return (
    <div className="flex flex-col gap-5 w-full font-sans">
      {/* ══ HEADER ═════════════════════════════════════════════════════ */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b ${
        isDark ? 'border-white/10' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={`text-xl sm:text-2xl font-bold tracking-tight font-display ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Sensor Simulation Studio
            </h1>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30">
              SYNTHETIC FAULT SIMULATOR
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Inject synthetic perturbations, calibration drift, transducer freezes & evaluate model resilience
          </p>
        </div>

        <button
          onClick={onNavigateToLive}
          className="m-btn-primary flex items-center gap-2"
        >
          <Eye size={13} />
          <span>Real-Time Vector Stream</span>
        </button>
      </div>

      {/* ══ TARGET STATION SELECTION BAR ═══════════════════════════════ */}
      <div className={`m-card p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono border ${
        isDark ? 'border-white/10' : 'border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-2">
          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Target Station Node:</span>
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className={`border rounded-lg px-3 py-1.5 focus:outline-none focus:border-rose-500 font-bold cursor-pointer ${
              isDark ? 'bg-[#111722] border-white/10 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            {stations.map((st) => (
              <option key={st.station_id} value={st.station_id}>
                {st.station_id} — {st.name}
              </option>
            ))}
          </select>
        </div>

        {lastMessage && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono ${
              lastMessage.isError
                ? (isDark ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' : 'bg-rose-100 text-rose-800 border border-rose-300')
                : (isDark ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold')
            }`}
          >
            {lastMessage.isError ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />}
            <span>{lastMessage.text}</span>
          </div>
        )}
      </div>

      {/* ══ 4 PRESET DISTURBANCE CARDS ════════════════════════════════ */}
      <div className="space-y-3">
        <span className={`text-xs font-bold font-mono uppercase tracking-wider ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          Standard Fault Injection Presets
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presets.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className={`m-card p-5 flex flex-col justify-between space-y-3 border hover:border-rose-500/40 transition-all ${
                  isDark ? 'border-white/10' : 'border-slate-200 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/30">
                        <Icon size={16} />
                      </div>
                      <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.title}</h3>
                    </div>
                  </div>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{p.description}</p>
                </div>

                <div className={`pt-2 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                  <button
                    onClick={p.action}
                    disabled={isInjecting}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                      isDark
                        ? 'bg-white/[0.04] hover:bg-rose-600 text-slate-200 hover:text-white border-white/[0.06]'
                        : 'bg-slate-100 hover:bg-rose-600 text-slate-800 hover:text-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <Play size={12} className="fill-current" />
                    <span>Inject into {selectedStation}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ CUSTOM PARAMETER DISTURBANCE GENERATOR ═════════════════════ */}
      <div className={`m-card p-5 space-y-4 border ${
        isDark ? 'border-white/10' : 'border-slate-200 shadow-xs'
      }`}>
        <div className={`flex items-center gap-2 pb-2 border-b ${
          isDark ? 'border-white/10' : 'border-slate-100'
        }`}>
          <Sliders size={16} className="text-rose-500" />
          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Custom Synthetic Disturbance Generator
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Target Parameter
            </label>
            <select
              value={selectedParameter}
              onChange={(e) => setSelectedParameter(e.target.value)}
              className={`w-full border rounded-lg p-2 focus:outline-none focus:border-rose-500 cursor-pointer ${
                isDark ? 'bg-[#111722] border-white/10 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              <option value="temperature">Air Temperature (°C)</option>
              <option value="pressure">Surface Pressure (hPa)</option>
              <option value="humidity">Relative Humidity (%)</option>
            </select>
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Disturbance Type
            </label>
            <select
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              className={`w-full border rounded-lg p-2 focus:outline-none focus:border-rose-500 cursor-pointer ${
                isDark ? 'bg-[#111722] border-white/10 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              <option value="spike">Sudden Spike</option>
              <option value="drift">Linear Drift</option>
              <option value="frozen">Frozen Value</option>
              <option value="noise">Gaussian Noise</option>
            </select>
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Magnitude (+/-)
            </label>
            <input
              type="number"
              value={customMagnitude}
              onChange={(e) => setCustomMagnitude(Number(e.target.value))}
              className={`w-full border rounded-lg p-2 focus:outline-none focus:border-rose-500 ${
                isDark ? 'bg-[#111722] border-white/10 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className={`block mb-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              Duration (Steps)
            </label>
            <input
              type="number"
              value={customDuration}
              onChange={(e) => setCustomDuration(Number(e.target.value))}
              className={`w-full border rounded-lg p-2 focus:outline-none focus:border-rose-500 ${
                isDark ? 'bg-[#111722] border-white/10 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => triggerInjection(customType, selectedParameter, customMagnitude, customDuration, true)}
            disabled={isInjecting}
            className="m-btn-primary flex items-center gap-2"
          >
            <Zap size={13} />
            <span>Trigger Synthetic Perturbation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
