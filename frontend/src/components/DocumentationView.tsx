/**
 * frontend/src/components/DocumentationView.tsx
 * SkyGuard AI — System Documentation & Technical Reference Manual.
 * Vintage Editorial Palette: Warm Parchment Ivory (#f6f4ee) / Deep Carbon (#080a0f).
 */

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Compass,
  FileText,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  Database,
  Search,
  ChevronRight,
  ExternalLink,
  Code2,
  Activity,
  Radio,
  Globe,
  SlidersHorizontal,
  Eye,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Terminal,
  Bookmark,
  Share2,
  Copy,
  Printer,
  Hash,
  Info,
  Server,
  Network,
  GitBranch,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

type DocSectionMode = 'architecture' | 'webpages';

interface DocChapter {
  id: string;
  title: string;
  category: string;
  badge: string;
  summary: string;
  mode: DocSectionMode;
}

export const DocumentationView: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [activeMode, setActiveMode] = useState<DocSectionMode>('architecture');
  const [activeSectionId, setActiveSectionId] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const chapters: DocChapter[] = useMemo(
    () => [
      // ─── ARCHITECTURE & SYSTEM SPECIFICATIONS ──────────────────
      {
        id: 'overview',
        title: '1. System Overview & Core Objectives',
        category: 'Overview',
        badge: 'Core System',
        summary: 'Architecture overview, automated telemetry validation, and real-time anomaly intelligence.',
        mode: 'architecture',
      },
      {
        id: 'triad-parameters',
        title: '2. Target Meteorological Triad & Sensor Limits',
        category: 'Physical Parameters',
        badge: 'Sensor Ranges',
        summary: 'Operational ranges, physical thresholds, and boundary conditions for Temperature, Pressure, and Humidity.',
        mode: 'architecture',
      },
      {
        id: 'data-source-arch',
        title: '3. Data Source Architecture & Canonical Contract',
        category: 'Data Ingestion',
        badge: '3-Source Adapter',
        summary: 'Diurnal Simulation, Open-Meteo REST Integration, and ESP32 MQTT hardware pipelines.',
        mode: 'architecture',
      },
      {
        id: 'external-api-setup',
        title: '4. External Weather Feed Setup (Open-Meteo)',
        category: 'Data Ingestion',
        badge: 'REST Integration',
        summary: 'Coordinate grid assimilation, asynchronous polling, parameter normalization, and rate limiting.',
        mode: 'architecture',
      },
      {
        id: 'physical-hardware-guide',
        title: '5. Physical AWS & ESP32 Hardware Guide',
        category: 'Hardware & IoT',
        badge: 'ESP32 + BME280',
        summary: 'Microcontroller pinout, I2C bus wiring, C++ FreeRTOS firmware, and non-volatile buffer logic.',
        mode: 'architecture',
      },
      {
        id: 'mqtt-protocol-spec',
        title: '6. MQTT Communication Protocol Specification',
        category: 'Hardware & IoT',
        badge: 'QoS 1 TCP',
        summary: 'Topic taxonomy, JSON telemetry packets, device heartbeat diagnostics, and stale detection timeouts.',
        mode: 'architecture',
      },
      {
        id: 'data-lineage-provenance',
        title: '7. Data Lineage & Provenance Specification',
        category: 'Data Governance',
        badge: 'Cryptographic Audit',
        summary: 'SHA-256 payload integrity, audit trail tracking, and immutable SQLite WAL persistence.',
        mode: 'architecture',
      },
      {
        id: 'math-formulations',
        title: '8. Complete Mathematical Formulations & Quality Control',
        category: 'Algorithms & Physics',
        badge: '5-Tier QC',
        summary: 'Dual-Phase Magnus-Tetens, Ridge-Regularized Mahalanobis, Dew Point Inversion, and Isolation Forest.',
        mode: 'architecture',
      },
      {
        id: 'operational-rules',
        title: '9. Operational Rules & State Isolation Policies',
        category: 'System Policies',
        badge: 'Zero Mock Policy',
        summary: '10-second live update cadence, station-isolated state, and deterministic multi-source validation.',
        mode: 'architecture',
      },
      {
        id: 'verification-audit',
        title: '10. System Verification Audit & Test Matrix',
        category: 'Testing & QA',
        badge: '15-Scenario Matrix',
        summary: '15-scenario empirical test suite results, performance metrics, and sub-100ms response benchmarks.',
        mode: 'architecture',
      },

      // ─── WEBPAGES & UI MANUAL ──────────────────────────────────
      {
        id: 'page-synoptic',
        title: '1. Synoptic Station Overview (/synoptic)',
        category: 'Application Walkthrough',
        badge: 'Mission Control',
        summary: 'Macro station status map, active warning alerts, fleet health distribution, and quick diagnostics.',
        mode: 'webpages',
      },
      {
        id: 'page-telemetry',
        title: '2. Live Sensor Telemetry Stream (/telemetry)',
        category: 'Application Walkthrough',
        badge: 'Real-Time Stream',
        summary: 'Real-time charting, 10s live packet ingest, thermodynamic gauges, and dynamic sparklines.',
        mode: 'webpages',
      },
      {
        id: 'page-alerts',
        title: '3. Anomaly Intelligence & Alerts (/alerts)',
        category: 'Application Walkthrough',
        badge: 'Anomaly Engine',
        summary: 'Tier-based anomaly triage, severity level filtering, automated root-cause cards, and operator dismissal.',
        mode: 'webpages',
      },
      {
        id: 'page-forensics',
        title: '4. Physical Constraint Forensics (/forensics)',
        category: 'Application Walkthrough',
        badge: 'Physics Validation',
        summary: 'Thermodynamic consistency graphs, psychrometric validation curves, and barometric lapse inspection.',
        mode: 'webpages',
      },
      {
        id: 'page-diagnostics',
        title: '5. Explainable AI & SHAP Diagnostics (/diagnostics)',
        category: 'Application Walkthrough',
        badge: 'Model Transparency',
        summary: 'TreeSHAP feature contributions, decision path breakdowns, and multivariate anomaly attribution.',
        mode: 'webpages',
      },
      {
        id: 'page-sensors',
        title: '6. Sensor Fleet Health & Reliability (/sensors)',
        category: 'Application Walkthrough',
        badge: 'Prognostics',
        summary: 'Dynamic Sensor Health Index (SHI), calibration drift wear index, and predictive maintenance horizons.',
        mode: 'webpages',
      },
      {
        id: 'page-simulator',
        title: '7. Simulator & Fault Injection Lab (/simulator)',
        category: 'Application Walkthrough',
        badge: 'Interactive Lab',
        summary: 'Synthetic weather generation engine and on-the-fly fault injection laboratory for empirical testing.',
        mode: 'webpages',
      },
      {
        id: 'page-archive',
        title: '8. Archive & Batch Inference (/archive)',
        category: 'Application Walkthrough',
        badge: 'Historical Data',
        summary: 'Historical observation records query, CSV dataset batch upload, and raw CSV data export.',
        mode: 'webpages',
      },
      {
        id: 'page-misty',
        title: '9. Ask Misty — Meteorological Assistant',
        category: 'Application Walkthrough',
        badge: 'Local AI Copilot',
        summary: 'Conversational assistant analyzing live telemetry, station anomalies, and diagnostic procedures.',
        mode: 'webpages',
      },
      {
        id: 'page-settings',
        title: '10. Configuration & Data Sources',
        category: 'Application Walkthrough',
        badge: 'Settings Center',
        summary: '1-click telemetry source switching (Simulated / Open-Meteo / MQTT), station presets, and QC tuning.',
        mode: 'webpages',
      },
    ],
    []
  );

  const filteredChapters = useMemo(() => {
    return chapters.filter((c) => {
      const matchMode = c.mode === activeMode;
      const matchQuery =
        searchQuery.trim() === '' ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.badge.toLowerCase().includes(searchQuery.toLowerCase());
      return matchMode && matchQuery;
    });
  }, [chapters, activeMode, searchQuery]);

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const elem = document.getElementById(`doc-sec-${id}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCopyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/docs#${id}`);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Original Vintage Editorial Palette
  const vintage = {
    bg: isDark ? 'bg-[#080a0f]' : 'bg-[#f6f4ee]',
    headerBg: isDark ? 'bg-[#0c0f17]' : 'bg-[#eee8db]',
    headerBorder: isDark ? 'border-white/[0.08]' : 'border-[#dfd7ca]',
    cardBg: isDark ? 'bg-[#0c0f17]' : 'bg-[#fcfbf9]',
    cardBorder: isDark ? 'border-white/[0.08]' : 'border-[#dfd7ca]',
    innerBoxBg: isDark ? 'bg-[#080a0f]' : 'bg-[#eee8db]',
    innerBoxBorder: isDark ? 'border-white/[0.06]' : 'border-[#dfd7ca]',
    badgeBg: isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-[#d8cebc] border-[#b5a790] text-[#3d3320]',
    textHeading: isDark ? 'text-white' : 'text-[#191b22]',
    textBody: isDark ? 'text-slate-300' : 'text-stone-700',
    textMuted: isDark ? 'text-slate-400' : 'text-stone-700',
    accentColor: isDark ? 'text-amber-400' : 'text-amber-700',
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${vintage.bg} ${vintage.textBody}`}>
      {/* ══ MASTHEAD / HEADER ════════════════════════════════════════════ */}
      <header className={`border-b ${vintage.headerBorder} ${vintage.headerBg} rounded-xl mb-6 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          
          <div className="flex flex-wrap items-center gap-2 mb-3 select-none">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold tracking-wider uppercase border ${vintage.badgeBg}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              SYSTEM DOCUMENTATION
            </span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-mono border ${isDark ? 'bg-white/[0.04] border-white/10 text-slate-300' : 'bg-white/80 border-stone-300 text-stone-700'}`}>
              Automatic Weather Station Quality Control
            </span>
            <span className={`hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-mono border ${isDark ? 'bg-white/[0.04] border-white/10 text-slate-300' : 'bg-white/80 border-stone-300 text-stone-700'}`}>
              Standard Meteorological Validation
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${vintage.textHeading}`}>
                SkyGuard AI Technical Reference &amp; Manual
              </h1>
              <p className={`mt-2 text-xs sm:text-sm max-w-3xl leading-relaxed ${vintage.textMuted}`}>
                Comprehensive operational manual, mathematical derivations, five-tier quality control architecture,
                IoT hardware pinouts, and complete page-by-page system walkthrough.
              </p>
            </div>

            {/* Dual Mode Switcher */}
            <div className={`p-1 rounded-lg border flex items-center shrink-0 select-none shadow-sm ${
              isDark ? 'bg-[#121622] border-white/10' : 'bg-[#eae3d5] border-[#cec2ae]'
            }`}>
              <button
                onClick={() => {
                  setActiveMode('architecture');
                  setActiveSectionId('overview');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeMode === 'architecture'
                    ? (isDark ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-amber-600 text-white shadow-sm')
                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-stone-700 hover:text-stone-950')
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>1. System Architecture &amp; Math</span>
              </button>

              <button
                onClick={() => {
                  setActiveMode('webpages');
                  setActiveSectionId('page-synoptic');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeMode === 'webpages'
                    ? (isDark ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-amber-600 text-white shadow-sm')
                    : (isDark ? 'text-slate-400 hover:text-white' : 'text-stone-700 hover:text-stone-950')
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>2. Webpages &amp; UI Manual</span>
              </button>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="mt-6 pt-4 border-t border-dashed border-stone-400/30 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-2.5 w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-stone-600'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quick search chapters, formulas, topics..."
                className={`w-full pl-9 pr-8 py-1.5 text-xs font-mono rounded-lg border focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-black/40 border-white/10 text-white placeholder-slate-500 focus:border-amber-500/50'
                    : 'bg-white/90 border-[#dfd7ca] text-stone-900 placeholder-stone-400 focus:border-stone-500'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-2.5 top-1.5 text-xs font-mono ${isDark ? 'text-slate-400 hover:text-white' : 'text-stone-400 hover:text-stone-800'}`}
                >
                  &times;
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                  isDark ? 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]' : 'bg-white/80 border-[#dfd7ca] text-stone-700 hover:bg-white'
                }`}
                title="Print / Save PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ══ MAIN DOCUMENTATION WORKSPACE ═══════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── STICKY SIDEBAR: TABLE OF CONTENTS ────────────────────────── */}
          <aside className="lg:col-span-4 xl:col-span-3 sticky top-20">
            <div className={`rounded-xl border ${vintage.cardBorder} ${vintage.cardBg} p-4 shadow-sm flex flex-col max-h-[calc(100vh-6rem)] overflow-hidden`}>
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-stone-300/40 dark:border-white/[0.06]">
                <span className={`text-xs font-bold uppercase tracking-wider font-mono ${vintage.textHeading}`}>
                  {activeMode === 'architecture' ? 'Table of Contents' : 'Application Pages'}
                </span>
                <span className={`text-[11px] font-mono ${vintage.textMuted}`}>
                  {filteredChapters.length} {filteredChapters.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <nav className="overflow-y-auto space-y-1.5 pr-1 py-1">
                {filteredChapters.map((chap) => {
                  const isCurrent = activeSectionId === chap.id;
                  return (
                    <button
                      key={chap.id}
                      onClick={() => scrollToSection(chap.id)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-all cursor-pointer flex flex-col gap-1 border ${
                        isCurrent
                          ? (isDark ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold' : 'bg-[#ece5d8] border-[#c8beaf] text-stone-900 font-bold')
                          : `border-transparent hover:${vintage.innerBoxBg} ${vintage.textBody} hover:${vintage.textHeading}`
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate">{chap.title}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono shrink-0 border ${vintage.innerBoxBorder} ${vintage.innerBoxBg} ${vintage.textMuted}`}>
                          {chap.badge}
                        </span>
                      </div>
                      <span className={`text-[11px] line-clamp-1 font-normal ${vintage.textMuted}`}>
                        {chap.summary}
                      </span>
                    </button>
                  );
                })}

                {filteredChapters.length === 0 && (
                  <div className={`p-4 text-center text-xs font-mono ${vintage.textMuted}`}>
                    No matching chapters found.
                  </div>
                )}
              </nav>
            </div>
          </aside>

          {/* ── CHAPTER CONTENT PANELS ───────────────────────────────────── */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-8">
            
            {activeMode === 'architecture' ? (
              <>
                {/* CHAPTER 1: SYSTEM OVERVIEW */}
                <section id="doc-sec-overview" className={`rounded-xl border ${vintage.cardBorder} ${vintage.cardBg} p-6 sm:p-8 shadow-sm`}>
                  <div className="flex items-center justify-between border-b border-stone-300/40 dark:border-white/[0.06] pb-4 mb-5">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-mono font-bold text-sm">
                        01
                      </span>
                      <div>
                        <h2 className={`text-lg sm:text-xl font-bold ${vintage.textHeading}`}>
                          System Overview &amp; Core Objectives
                        </h2>
                        <p className={`text-xs ${vintage.textMuted}`}>
                          Automated Quality Control &amp; Anomaly Intelligence Architecture
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyLink('overview')}
                      className={`p-1.5 rounded-md border ${vintage.innerBoxBorder} ${vintage.innerBoxBg} ${vintage.textMuted} hover:${vintage.textHeading}`}
                      title="Copy section link"
                    >
                      {copiedSection === 'overview' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="space-y-4 text-sm leading-relaxed">
                    <p className={vintage.textBody}>
                      Automatic Weather Station (AWS) networks deployed in diverse environments experience sensor fouling, environmental degradation, transmission packet dropouts, and drifting calibration. Standard threshold-only checks often fail to distinguish between physical severe weather events and mechanical sensor failure.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                      <div className={`p-4 rounded-lg border ${vintage.innerBoxBorder} ${vintage.innerBoxBg}`}>
                        <div className="font-semibold text-xs text-amber-500 mb-1">1. Multi-Source Ingestion</div>
                        <p className={`text-xs ${vintage.textMuted}`}>Seamless assimilation from local hardware (ESP32 via MQTT), global numerical feeds (Open-Meteo REST), and diurnal simulations.</p>
                      </div>
                      <div className={`p-4 rounded-lg border ${vintage.innerBoxBorder} ${vintage.innerBoxBg}`}>
                        <div className="font-semibold text-xs text-emerald-500 mb-1">2. 5-Tier Validation Pipeline</div>
                        <p className={`text-xs ${vintage.textMuted}`}>Hierarchical evaluation from hard physical limits to spatial consistency, multivariate Mahalanobis distance, and machine learning trees.</p>
                      </div>
                      <div className={`p-4 rounded-lg border ${vintage.innerBoxBorder} ${vintage.innerBoxBg}`}>
                        <div className="font-semibold text-xs text-sky-500 mb-1">3. Automated Triage &amp; Root Cause</div>
                        <p className={`text-xs ${vintage.textMuted}`}>Instant explanation cards isolating root cause (sensor drift, thermal coupling, electrical spike, or true meteorological event).</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* CHAPTER 2: METEOROLOGICAL TRIAD & SENSOR LIMITS */}
                <section id="doc-sec-triad-parameters" className={`rounded-xl border ${vintage.cardBorder} ${vintage.cardBg} p-6 sm:p-8 shadow-sm`}>
                  <div className="flex items-center justify-between border-b border-stone-300/40 dark:border-white/[0.06] pb-4 mb-5">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-mono font-bold text-sm">
                        02
                      </span>
                      <div>
                        <h2 className={`text-lg sm:text-xl font-bold ${vintage.textHeading}`}>
                          Target Meteorological Triad &amp; Physical Limits
                        </h2>
                        <p className={`text-xs ${vintage.textMuted}`}>
                          Primary Atmospheric Variables &amp; Standard Operational Ranges
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyLink('triad-parameters')}
                      className={`p-1.5 rounded-md border ${vintage.innerBoxBorder} ${vintage.innerBoxBg} ${vintage.textMuted} hover:${vintage.textHeading}`}
                    >
                      {copiedSection === 'triad-parameters' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="overflow-x-auto my-3">
                    <table className={`w-full text-left text-xs border-collapse font-mono`}>
                      <thead>
                        <tr className={`border-b ${vintage.innerBoxBorder} ${vintage.innerBoxBg}`}>
                          <th className="py-2.5 px-3 font-semibold">Parameter</th>
                          <th className="py-2.5 px-3 font-semibold">Unit</th>
                          <th className="py-2.5 px-3 font-semibold">Valid Range</th>
                          <th className="py-2.5 px-3 font-semibold">Max Step (10s)</th>
                          <th className="py-2.5 px-3 font-semibold">Persistence Floor</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${vintage.innerBoxBorder} ${vintage.textMuted}`}>
                        <tr>
                          <td className="py-2 px-3 font-medium text-slate-200">Ambient Temperature (T)</td>
                          <td className="py-2 px-3">&deg;C</td>
                          <td className="py-2 px-3">-40.0 to +60.0 &deg;C</td>
                          <td className="py-2 px-3">&le; 2.5 &deg;C / 10s</td>
                          <td className="py-2 px-3">&sigma; &gt; 0.05 &deg;C / 60 min</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-slate-200">Surface Pressure (P)</td>
                          <td className="py-2 px-3">hPa</td>
                          <td className="py-2 px-3">500.0 to 1080.0 hPa</td>
                          <td className="py-2 px-3">&le; 3.0 hPa / 10s</td>
                          <td className="py-2 px-3">&sigma; &gt; 0.02 hPa / 60 min</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-slate-200">Relative Humidity (RH)</td>
                          <td className="py-2 px-3">%</td>
                          <td className="py-2 px-3">0.0% to 100.0%</td>
                          <td className="py-2 px-3">&le; 15.0% / 10s</td>
                          <td className="py-2 px-3">&sigma; &gt; 0.10% / 60 min</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-slate-200">Dew Point (Td)</td>
                          <td className="py-2 px-3">&deg;C</td>
                          <td className="py-2 px-3">-50.0 to +40.0 &deg;C</td>
                          <td className="py-2 px-3">&le; T (Invariant)</td>
                          <td className="py-2 px-3">T - Td &ge; 0.0 &deg;C</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* CHAPTER 3: DATA SOURCE ARCHITECTURE & ARCHIFY DIAGRAM */}
                <section id="doc-sec-data-source-arch" className={`rounded-xl border ${vintage.cardBorder} ${vintage.cardBg} p-6 sm:p-8 shadow-sm`}>
                  <div className="flex items-center justify-between border-b border-stone-300/40 dark:border-white/[0.06] pb-4 mb-5">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-mono font-bold text-sm">
                        03
                      </span>
                      <div>
                        <h2 className={`text-lg sm:text-xl font-bold ${vintage.textHeading}`}>
                          Data Source Architecture &amp; System Flowchart
                        </h2>
                        <p className={`text-xs ${vintage.textMuted}`}>
                          Multi-Source Ingestion Pipeline &amp; Canonical Normalization
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyLink('data-source-arch')}
                      className={`p-1.5 rounded-md border ${vintage.innerBoxBorder} ${vintage.innerBoxBg} ${vintage.textMuted} hover:${vintage.textHeading}`}
                    >
                      {copiedSection === 'data-source-arch' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* ARCHIFY STRUCTURED FLOWCHART */}
                  <div className={`p-5 rounded-xl border ${vintage.innerBoxBorder} ${vintage.innerBoxBg} my-4`}>
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-4 font-mono flex items-center gap-2">
                      <Activity size={14} />
                      <span>System Data Flow &amp; Quality Control Pipeline</span>
                    </div>

                    <div className="space-y-4">
                      {/* INGESTION NODES */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className={`p-3 rounded-lg border ${vintage.cardBorder} ${vintage.cardBg}`}>
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 mb-1">
                            <Activity size={13} />
                            <span>1. Simulated AWS</span>
                          </div>
                          <p className={`text-[11px] ${vintage.textMuted}`}>Solar diurnal model + Gaussian micro-noise (1.5s interval).</p>
                        </div>

                        <div className={`p-3 rounded-lg border ${vintage.cardBorder} ${vintage.cardBg}`}>
                          <div className="flex items-center gap-2 text-xs font-bold text-sky-500 mb-1">
                            <Globe size={13} />
                            <span>2. External Weather Feed</span>
                          </div>
                          <p className={`text-[11px] ${vintage.textMuted}`}>Open-Meteo REST assimilation + cache layer (60s polling).</p>
                        </div>

                        <div className={`p-3 rounded-lg border ${vintage.cardBorder} ${vintage.cardBg}`}>
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 mb-1">
                            <Radio size={13} />
                            <span>3. Physical Hardware</span>
                          </div>
                          <p className={`text-[11px] ${vintage.textMuted}`}>ESP32 + BME280 via MQTT broker with QoS 1 TCP (3.0s cadence).</p>
                        </div>
                      </div>

                      {/* CONNECTOR ARROW */}
                      <div className="flex justify-center text-slate-500 my-1">
                        <div className="px-3 py-1 rounded font-mono text-[11px] bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          &darr; Canonical Telemetry Normalization (station_id, temperature, pressure, humidity, timestamp)
                        </div>
                      </div>

                      {/* 5-TIER PIPELINE BOX */}
                      <div className={`p-4 rounded-xl border border-amber-500/30 bg-amber-500/5`}>
                        <div className="text-xs font-bold text-amber-400 font-mono mb-2 flex items-center justify-between">
                          <span>5-TIER QUALITY CONTROL &amp; INFERENCE ENGINE</span>
                          <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded">Deterministic &amp; ML</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px] font-mono">
                          <div className={`p-2 rounded border ${vintage.cardBorder} ${vintage.cardBg} text-center`}>
                            <span className="block font-bold text-amber-400">Tier 1</span>
                            <span className={vintage.textMuted}>Physics Limits</span>
                          </div>
                          <div className={`p-2 rounded border ${vintage.cardBorder} ${vintage.cardBg} text-center`}>
                            <span className="block font-bold text-emerald-400">Tier 2</span>
                            <span className={vintage.textMuted}>Spatial Neighbors</span>
                          </div>
                          <div className={`p-2 rounded border ${vintage.cardBorder} ${vintage.cardBg} text-center`}>
                            <span className="block font-bold text-sky-400">Tier 3</span>
                            <span className={vintage.textMuted}>Multivariate Matrix</span>
                          </div>
                          <div className={`p-2 rounded border ${vintage.cardBorder} ${vintage.cardBg} text-center`}>
                            <span className="block font-bold text-indigo-400">Tier 4</span>
                            <span className={vintage.textMuted}>Isolation Forest</span>
                          </div>
                          <div className={`p-2 rounded border ${vintage.cardBorder} ${vintage.cardBg} text-center`}>
                            <span className="block font-bold text-rose-400">Tier 5</span>
                            <span className={vintage.textMuted}>Prognostic Drift</span>
                          </div>
                        </div>
                      </div>

                      {/* OUTPUTS */}
                      <div className="flex justify-center text-slate-500 my-1">
                        <div className="px-3 py-1 rounded font-mono text-[11px] bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          &darr; Inference Result (Quality Score, Flags, Explainability Vector)
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className={`p-3 rounded-lg border ${vintage.cardBorder} ${vintage.cardBg} flex items-center gap-3`}>
                          <Database size={16} className="text-amber-500 shrink-0" />
                          <div>
                            <div className={`text-xs font-bold ${vintage.textHeading}`}>SQLite WAL Persistence</div>
                            <div className={`text-[11px] ${vintage.textMuted}`}>Persistent audit trails &amp; sub-millisecond writes.</div>
                          </div>
                        </div>
                        <div className={`p-3 rounded-lg border ${vintage.cardBorder} ${vintage.cardBg} flex items-center gap-3`}>
                          <Zap size={16} className="text-emerald-500 shrink-0" />
                          <div>
                            <div className={`text-xs font-bold ${vintage.textHeading}`}>WebSocket Live Broadcast</div>
                            <div className={`text-[11px] ${vintage.textMuted}`}>Instant dispatch to all connected dashboard clients.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* CHAPTER 4: EXTERNAL WEATHER FEED */}
                <section id="doc-sec-external-api-setup" className={`rounded-xl border ${vintage.cardBorder} ${vintage.cardBg} p-6 sm:p-8 shadow-sm`}>
                  <div className="flex items-center justify-between border-b border-stone-300/40 dark:border-white/[0.06] pb-4 mb-5">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-mono font-bold text-sm">
                        04
                      </span>
                      <div>
                        <h2 className={`text-lg sm:text-xl font-bold ${vintage.textHeading}`}>
                          External Weather Feed Setup (Open-Meteo)
                        </h2>
                        <p className={`text-xs ${vintage.textMuted}`}>
                          Global Coordinate Assimilation &amp; Rate-Limiting Protocol
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyLink('external-api-setup')}
                      className={`p-1.5 rounded-md border ${vintage.innerBoxBorder} ${vintage.innerBoxBg} ${vintage.textMuted} hover:${vintage.textHeading}`}
                    >
                      {copiedSection === 'external-api-setup' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <p className={vintage.textBody}>
                      The external feed assimilates live observational data using global coordinate queries (latitude, longitude, elevation). It queries the Open-Meteo free tier API without requiring proprietary API keys.
                    </p>
                    <div className={`p-3 rounded-lg border ${vintage.innerBoxBorder} ${vintage.innerBoxBg} font-mono text-xs overflow-x-auto`}>
                      <span className="text-amber-500 font-bold">GET</span> https://api.open-meteo.com/v1/forecast?latitude=18.5204&amp;longitude=73.8567&amp;current=temperature_2m,relative_humidity_2m,surface_pressure,dew_point_2m,wind_speed_10m&amp;wind_speed_unit=ms
                    </div>
                    <p className={`text-xs ${vintage.textMuted}`}>
                      <strong>Caching &amp; Fallback:</strong> Polling occurs every 60 seconds with an in-memory cache to prevent upstream rate-limiting (HTTP 429). If connection fails, the station preserves the last valid timestamp and flags communication health.
                    </p>
                  </div>
                </section>

                {/* CHAPTER 5: PHYSICAL AWS & ESP32 HARDWARE GUIDE */}
                <section id="doc-sec-physical-hardware-guide" className={`rounded-xl border ${vintage.cardBorder} ${vintage.cardBg} p-6 sm:p-8 shadow-sm`}>
                  <div className="flex items-center justify-between border-b border-stone-300/40 dark:border-white/[0.06] pb-4 mb-5">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-mono font-bold text-sm">
                        05
                      </span>
                      <div>
                        <h2 className={`text-lg sm:text-xl font-bold ${vintage.textHeading}`}>
                          Physical AWS &amp; ESP32 Hardware Guide
                        </h2>
                        <p className={`text-xs ${vintage.textMuted}`}>
                          Microcontroller Pinouts, I2C Bus Wiring, and FreeRTOS Firmware
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyLink('physical-hardware-guide')}
                      className={`p-1.5 rounded-md border ${vintage.innerBoxBorder} ${vintage.innerBoxBg} ${vintage.textMuted} hover:${vintage.textHeading}`}
                    >
                      {copiedSection === 'physical-hardware-guide' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg border ${vintage.innerBoxBorder} ${vintage.innerBoxBg}`}>
                        <h4 className="font-bold text-xs text-amber-500 uppercase tracking-wider mb-2">Hardware Bill of Materials</h4>
                        <ul className={`text-xs space-y-1.5 ${vintage.textMuted}`}>
                          <li>&bull; <strong>MCU:</strong> ESP32 NodeMCU (Dual-Core Xtensa LX6 @ 240MHz)</li>
                          <li>&bull; <strong>Sensor:</strong> Bosch Sensortec BME280 (Temp, Humidity, Pressure)</li>
                          <li>&bull; <strong>Bus Protocol:</strong> I2C (Default 0x76, alternate 0x77)</li>
                          <li>&bull; <strong>Power:</strong> 3.3V Regulated (Max 3.6V tolerance)</li>
                        </ul>
                      </div>
                      <div className={`p-4 rounded-lg border ${vintage.innerBoxBorder} ${vintage.innerBoxBg}`}>
                        <h4 className="font-bold text-xs text-amber-500 uppercase tracking-wider mb-2">Pin Mapping</h4>
                        <ul className={`text-xs space-y-1.5 ${vintage.textMuted}`}>
                          <li>&bull; <strong>VCC &rarr; 3V3</strong> (Pin 1)</li>
                          <li>&bull; <strong>GND &rarr; GND</strong> (Pin 2)</li>
                          <li>&bull; <strong>SCL &rarr; GPIO 22</strong> (Hardware I2C Clock)</li>
                          <li>&bull; <strong>SDA &rarr; GPIO 21</strong> (Hardware I2C Data)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* CHAPTER 6: MQTT PROTOCOL SPECIFICATION */}
                <section id="doc-sec-mqtt-protocol-spec" className={`rounded-xl border ${vintage.cardBorder} ${vintage.cardBg} p-6 sm:p-8 shadow-sm`}>
                  <div className="flex items-center justify-between border-b border-stone-300/40 dark:border-white/[0.06] pb-4 mb-5">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-mono font-bold text-sm">
                        06
                      </span>
                      <div>
                        <h2 className={`text-lg sm:text-xl font-bold ${vintage.textHeading}`}>
                          MQTT Communication Protocol Specification
                        </h2>
                        <p className={`text-xs ${vintage.textMuted}`}>
                          Topic Taxonomy, Telemetry Payload Schema, and Heartbeat Guarantees
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyLink('mqtt-protocol-spec')}
                      className={`p-1.5 rounded-md border ${vintage.innerBoxBorder} ${vintage.innerBoxBg} ${vintage.textMuted} hover:${vintage.textHeading}`}
                    >
                      {copiedSection === 'mqtt-protocol-spec' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <p className={vintage.textBody}>
                      Stations transmit observations via MQTT over TCP port 1883 with QoS 1 to guarantee at-least-once delivery.
                    </p>
                    <div className={`p-3 rounded-lg border ${vintage.innerBoxBorder} ${vintage.innerBoxBg} font-mono text-xs overflow-x-auto text-slate-300`}>
                      <pre>{`{
  "station_id": "PUNE_001",
  "temperature": 28.45,
  "relative_humidity": 62.10,
  "pressure": 951.20,
  "battery_voltage": 3.92,
  "wifi_rssi": -64,
  "sequence_id": 14082,
  "timestamp": "2026-09-26T14:30:00Z"
}`}</pre>
                    </div>
                  </div>
                </section>

                {/* CHAPTER 7: DATA LINEAGE & PROVENANCE */}
                <section id="doc-sec-data-lineage-provenance" className={`rounded-xl border ${vintage.cardBorder} ${vintage.cardBg} p-6 sm:p-8 shadow-sm`}>
                  <div className="flex items-center justify-between border-b border-stone-300/40 dark:border-white/[0.06] pb-4 mb-5">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-mono font-bold text-sm">
                        07
                      </span>
                      <div>
                        <h2 className={`text-lg sm:text-xl font-bold ${vintage.textHeading}`}>
                          Data Lineage &amp; Provenance Specification
                        </h2>
                        <p className={`text-xs ${vintage.textMuted}`}>
                          Audit Trail Integrity, Payload Hashing, and Storage Strategy
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyLink('data-lineage-provenance')}
                      className={`p-1.5 rounded-md border ${vintage.innerBoxBorder} ${vintage.innerBoxBg} ${vintage.textMuted} hover:${vintage.textHeading}`}
                    >
                      {copiedSection === 'data-lineage-provenance' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <p className={vintage.textBody}>
                      Every incoming packet is tagged with an immutable provenance record:
                    </p>
                    <ul className={`text-xs space-y-1.5 ${vintage.textMuted}`}>
                      <li>&bull; <strong>Source Origin:</strong> SIMULATED | OPEN_METEO | ESP32_HARDWARE</li>
                      <li>&bull; <strong>Cryptographic Payload Hash:</strong> SHA-256 digest of raw payload</li>
                      <li>&bull; <strong>Validation Verdict:</strong> PASS | FLAG_ANOMALY | SUSPECT | REJECT</li>
                      <li>&bull; <strong>Storage Architecture:</strong> SQLite WAL database with write indexing and transaction safety.</li>
                    </ul>
                  </div>
                </section>

                {/* CHAPTER 8: COMPLETE MATHEMATICAL FORMULATIONS */}
                <section id="doc-sec-math-formulations" className={`rounded-xl border ${vintage.cardBorder} ${vintage.cardBg} p-6 sm:p-8 shadow-sm`}>
                  <div className="flex items-center justify-between border-b border-stone-300/40 dark:border-white/[0.06] pb-4 mb-5">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-mono font-bold text-sm">
                        08
                      </span>
                      <div>
                        <h2 className={`text-lg sm:text-xl font-bold ${vintage.textHeading}`}>
                          Mathematical Formulations &amp; Quality Control Pipeline
                        </h2>
                        <p className={`text-xs ${vintage.textMuted}`}>
                          Dual-Phase Magnus-Tetens, Mahalanobis Distance &amp; Reliability Index
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyLink('math-formulations')}
                      className={`p-1.5 rounded-md border ${vintage.innerBoxBorder} ${vintage.innerBoxBg} ${vintage.textMuted} hover:${vintage.textHeading}`}
                    >
                      {copiedSection === 'math-formulations' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* FORMULA 1 */}
                    <div className={`p-4 rounded-xl border ${vintage.innerBoxBorder} ${vintage.innerBoxBg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-500 font-mono">1. Dual-Phase Magnus-Tetens Saturation Vapor Pressure</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${vintage.cardBg} ${vintage.textMuted}`}>Thermodynamics</span>
                      </div>
                      <div className="my-3 p-3 rounded-lg bg-black/40 border border-white/10 font-mono text-xs sm:text-sm text-center text-amber-300">
                        e<sub>s</sub>(T) = 6.1078 &times; exp( (17.27 &times; T) / (237.3 + T) ) &nbsp; [for T &ge; 0&deg;C]
                        <br />
                        e<sub>s</sub>(T) = 6.1078 &times; exp( (21.875 &times; T) / (265.5 + T) ) &nbsp; [for T &lt; 0&deg;C]
                      </div>
                      <p className={`text-xs ${vintage.textMuted}`}>
                        Calculates saturation vapor pressure in hPa as a function of dry-bulb ambient temperature T (&deg;C).
                      </p>
                    </div>

                    {/* FORMULA 2 */}
                    <div className={`p-4 rounded-xl border ${vintage.innerBoxBorder} ${vintage.innerBoxBg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-500 font-mono">2. Thermodynamic Dew Point Inversion</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${vintage.cardBg} ${vintage.textMuted}`}>Psychrometrics</span>
                      </div>
                      <div className="my-3 p-3 rounded-lg bg-black/40 border border-white/10 font-mono text-xs sm:text-sm text-center text-emerald-300">
                        T<sub>dew</sub> = (237.3 &times; &gamma;(T, RH)) / (17.27 - &gamma;(T, RH))
                        <br />
                        where &gamma;(T, RH) = ln(RH / 100) + (17.27 &times; T) / (237.3 + T)
                      </div>
                      <p className={`text-xs ${vintage.textMuted}`}>
                        Calculates dew point from ambient temperature T and relative humidity RH. Physical boundary condition: T<sub>dew</sub> &le; T.
                      </p>
                    </div>

                    {/* FORMULA 3 */}
                    <div className={`p-4 rounded-xl border ${vintage.innerBoxBorder} ${vintage.innerBoxBg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-sky-500 font-mono">3. Ridge-Regularized Mahalanobis Distance</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${vintage.cardBg} ${vintage.textMuted}`}>Multivariate Matrix</span>
                      </div>
                      <div className="my-3 p-3 rounded-lg bg-black/40 border border-white/10 font-mono text-xs sm:text-sm text-center text-sky-300">
                        D<sub>M</sub>(x) = &radic;( (x - &mu;)<sup>T</sup> &times; (&Sigma; + &lambda;I)<sup>-1</sup> &times; (x - &mu;) ), &nbsp; &lambda; = 10<sup>-5</sup>
                      </div>
                      <p className={`text-xs ${vintage.textMuted}`}>
                        Measures statistical deviation of telemetry vector x = [T, P, RH] against historical covariance &Sigma;. An anomaly is flagged when D<sub>M</sub><sup>2</sup> &gt; &chi;<sup>2</sup><sub>3, 0.999</sub> = 16.27.
                      </p>
                    </div>

                    {/* FORMULA 4 */}
                    <div className={`p-4 rounded-xl border ${vintage.innerBoxBorder} ${vintage.innerBoxBg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-indigo-400 font-mono">4. Sensor Health Index (SHI) EMA</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${vintage.cardBg} ${vintage.textMuted}`}>Fleet Prognostics</span>
                      </div>
                      <div className="my-3 p-3 rounded-lg bg-black/40 border border-white/10 font-mono text-xs sm:text-sm text-center text-indigo-300">
                        SHI<sub>t</sub> = &alpha; &times; H<sub>raw</sub>(t) + (1 - &alpha;) &times; SHI<sub>t-1</sub>, &nbsp; &alpha; = 0.10
                      </div>
                      <p className={`text-xs ${vintage.textMuted}`}>
                        Smooths real-time hardware health metrics to distinguish temporary transmission spikes from ongoing sensor hardware degradation.
                      </p>
                    </div>
                  </div>
                </section>

                {/* CHAPTER 9: OPERATIONAL RULES */}
                <section id="doc-sec-operational-rules" className={`rounded-xl border ${vintage.cardBorder} ${vintage.cardBg} p-6 sm:p-8 shadow-sm`}>
                  <div className="flex items-center justify-between border-b border-stone-300/40 dark:border-white/[0.06] pb-4 mb-5">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-mono font-bold text-sm">
                        09
                      </span>
                      <div>
                        <h2 className={`text-lg sm:text-xl font-bold ${vintage.textHeading}`}>
                          Operational Rules &amp; State Isolation Policies
                        </h2>
                        <p className={`text-xs ${vintage.textMuted}`}>
                          Core Real-Time System Integrity &amp; Strict Cadence Guarantees
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyLink('operational-rules')}
                      className={`p-1.5 rounded-md border ${vintage.innerBoxBorder} ${vintage.innerBoxBg} ${vintage.textMuted} hover:${vintage.textHeading}`}
                    >
                      {copiedSection === 'operational-rules' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className={`p-3 rounded-lg border ${vintage.innerBoxBorder} ${vintage.innerBoxBg}`}>
                      <strong className="text-amber-500 block mb-1">1. Exact 10-Second Telemetry Cadence</strong>
                      <p className={vintage.textMuted}>Charts and gauges update on a strict 10-second interval. When telemetry values remain constant across intervals, graphs render true horizontal flatlines rather than generating artificial drift.</p>
                    </div>
                    <div className={`p-3 rounded-lg border ${vintage.innerBoxBorder} ${vintage.innerBoxBg}`}>
                      <strong className="text-emerald-500 block mb-1">2. Complete Station-Isolated State</strong>
                      <p className={vintage.textMuted}>Selecting a station in the top navigation synchronizes all pages (Synoptic, Telemetry, Alerts, Forensics, Sensors, Diagnostics) across the entire application.</p>
                    </div>
                    <div className={`p-3 rounded-lg border ${vintage.innerBoxBorder} ${vintage.innerBoxBg}`}>
                      <strong className="text-sky-500 block mb-1">3. Zero Mock Fallback</strong>
                      <p className={vintage.textMuted}>Every route, telemetry packet, and anomaly calculation is computed deterministically from real database observations and model inference pipelines.</p>
                    </div>
                  </div>
                </section>

                {/* CHAPTER 10: VERIFICATION AUDIT */}
                <section id="doc-sec-verification-audit" className={`rounded-xl border ${vintage.cardBorder} ${vintage.cardBg} p-6 sm:p-8 shadow-sm`}>
                  <div className="flex items-center justify-between border-b border-stone-300/40 dark:border-white/[0.06] pb-4 mb-5">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-mono font-bold text-sm">
                        10
                      </span>
                      <div>
                        <h2 className={`text-lg sm:text-xl font-bold ${vintage.textHeading}`}>
                          System Verification Audit &amp; Test Matrix
                        </h2>
                        <p className={`text-xs ${vintage.textMuted}`}>
                          15-Scenario Test Matrix &amp; Performance Verification Benchmarks
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyLink('verification-audit')}
                      className={`p-1.5 rounded-md border ${vintage.innerBoxBorder} ${vintage.innerBoxBg} ${vintage.textMuted} hover:${vintage.textHeading}`}
                    >
                      {copiedSection === 'verification-audit' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="overflow-x-auto my-3">
                    <table className={`w-full text-left text-xs border-collapse font-mono`}>
                      <thead>
                        <tr className={`border-b ${vintage.innerBoxBorder} ${vintage.innerBoxBg}`}>
                          <th className="py-2.5 px-3 font-semibold">Test Case</th>
                          <th className="py-2.5 px-3 font-semibold">Verification Goal</th>
                          <th className="py-2.5 px-3 font-semibold">Expected Outcome</th>
                          <th className="py-2.5 px-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${vintage.innerBoxBorder} ${vintage.textMuted}`}>
                        <tr>
                          <td className="py-2 px-3 font-medium text-slate-200">TC-01</td>
                          <td className="py-2 px-3">Physical Plausibility Limits (Temp &gt; 60&deg;C)</td>
                          <td className="py-2 px-3">Flagged Tier 1 Physical Violation</td>
                          <td className="py-2 px-3 text-emerald-400 font-bold">PASS</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-slate-200">TC-02</td>
                          <td className="py-2 px-3">Dew Point Inversion Violation (Td &gt; T)</td>
                          <td className="py-2 px-3">Flagged Psychrometric Inversion</td>
                          <td className="py-2 px-3 text-emerald-400 font-bold">PASS</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-slate-200">TC-03</td>
                          <td className="py-2 px-3">Persistence Check (Frozen flatline &gt; 60 min)</td>
                          <td className="py-2 px-3">Flagged Sensor Freeze / Low Variance</td>
                          <td className="py-2 px-3 text-emerald-400 font-bold">PASS</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-slate-200">TC-04</td>
                          <td className="py-2 px-3">Spatial Neighbor Anomaly (Outlier &gt; 4.0&sigma;)</td>
                          <td className="py-2 px-3">Flagged Spatial Inconsistency</td>
                          <td className="py-2 px-3 text-emerald-400 font-bold">PASS</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-slate-200">TC-05</td>
                          <td className="py-2 px-3">Multivariate Mahalanobis (D_M^2 &gt; 16.27)</td>
                          <td className="py-2 px-3">Flagged Covariance Breakdown</td>
                          <td className="py-2 px-3 text-emerald-400 font-bold">PASS</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            ) : (
              /* ══ MODE 2: WEBPAGES & UI MANUAL ══════════════════════════════ */
              <>
                {[
                  {
                    id: 'page-synoptic',
                    num: '01',
                    path: '/synoptic',
                    title: 'Synoptic Station Overview',
                    badge: 'Mission Control',
                    purpose: 'Macro geographic surveillance and network health across all weather stations.',
                    features: [
                      'Interactive geospatial station map with color-coded operational status (Nominal, Degraded, Anomaly).',
                      'Active anomaly alerts summary banner with one-click navigation to root cause analysis.',
                      'Fleet health distribution chart showing sensor reliability metrics across all stations.',
                      'Quick station selector cards for rapid switching.',
                    ],
                    instructions: 'Use this dashboard to monitor national weather stations, assess critical alerts, and select stations for detailed analysis.',
                  },
                  {
                    id: 'page-telemetry',
                    num: '02',
                    path: '/telemetry',
                    title: 'Live Sensor Telemetry Stream',
                    badge: 'Real-Time Stream',
                    purpose: 'High-frequency telemetry stream with live charting on a strict 10-second cadence.',
                    features: [
                      'Live line charts for Ambient Temperature, Relative Humidity, Pressure, and Dew Point.',
                      'Thermodynamic gauges displaying live instantaneous readings with warning threshold bands.',
                      'WebSocket live connection monitor showing packet throughput and network latency.',
                      'Export telemetry buffer directly to CSV or JSON format.',
                    ],
                    instructions: 'Monitor live data stream. Verify that charts update every 10 seconds and reflect flatlines when atmospheric conditions are stable.',
                  },
                  {
                    id: 'page-alerts',
                    num: '03',
                    path: '/alerts',
                    title: 'Anomaly Intelligence & Alerts',
                    badge: 'Anomaly Engine',
                    purpose: 'Triage and investigation feed for automated quality control detections.',
                    features: [
                      'Tier-based severity filters: Critical (Physical Violations), High (Multivariate), Medium (Drift).',
                      'Automated root-cause diagnostic cards detailing why an anomaly was triggered.',
                      'Operator action buttons: Acknowledge alert, Dismiss false positive, or Flag for maintenance.',
                      'Historical anomaly logs with search and date range filtering.',
                    ],
                    instructions: 'Review unacknowledged alerts, inspect the automated explanation cards, and take corrective operational actions.',
                  },
                  {
                    id: 'page-forensics',
                    num: '04',
                    path: '/forensics',
                    title: 'Physical Constraint Forensics',
                    badge: 'Physics Validation',
                    purpose: 'Detailed physical and thermodynamic constraint evaluation for meteorological data.',
                    features: [
                      'Psychrometric validation curves comparing dry-bulb temperature against saturation vapor pressure.',
                      'Barometric lapse rate cross-referencing surface pressure against altitude.',
                      'Multi-sensor thermal coupling plots validating relative humidity vs temperature correlations.',
                      'Raw physical limit audit logs with rule-by-rule pass/fail indicators.',
                    ],
                    instructions: 'Use when investigating complex anomalies to determine whether an anomaly is an instrument defect or a severe atmospheric event.',
                  },
                  {
                    id: 'page-diagnostics',
                    num: '05',
                    path: '/diagnostics',
                    title: 'Explainable AI & SHAP Diagnostics',
                    badge: 'Model Transparency',
                    purpose: 'Transparent decision-making insights using TreeSHAP and multivariate feature attribution.',
                    features: [
                      'TreeSHAP feature importance waterfall chart showing individual parameter contributions.',
                      'Isolation Forest decision tree path visualizer.',
                      'Confidence score gauges for anomaly predictions.',
                      'Comparison view against baseline historical weather distributions.',
                    ],
                    instructions: 'Examine feature weights to understand why machine learning algorithms classified a specific reading as anomalous.',
                  },
                  {
                    id: 'page-sensors',
                    num: '06',
                    path: '/sensors',
                    title: 'Sensor Fleet Health & Reliability',
                    badge: 'Prognostics',
                    purpose: 'Predictive maintenance tracking and wear degradation index across sensor hardware.',
                    features: [
                      'Dynamic Sensor Health Index (SHI) calculated via exponential moving averages.',
                      'Calibration drift radar showing slow degradation trends over weeks.',
                      'Estimated Remaining Useful Life (RUL) and maintenance urgency warnings.',
                      'Component-by-component diagnostic breakdown (BME280 sensor, I2C bus, power supply).',
                    ],
                    instructions: 'Check sensor degradation scores regularly to schedule hardware recalibration before physical failure occurs.',
                  },
                  {
                    id: 'page-simulator',
                    num: '07',
                    path: '/simulator',
                    title: 'Simulator & Fault Injection Lab',
                    badge: 'Interactive Lab',
                    purpose: 'Controlled testing environment for synthetic data generation and empirical fault injection.',
                    features: [
                      'Interactive weather simulator generating realistic diurnal temperature, pressure, and humidity cycles.',
                      'On-demand fault injection: Sensor Freeze, Drift, Spike, Calibration Offset, or Physical Inversion.',
                      'Live observation of how the 5-Tier QC pipeline detects and flags injected faults in real-time.',
                      'Reset to baseline nominal conditions with one click.',
                    ],
                    instructions: 'Select a station, choose a fault type (e.g. Spike +15&deg;C), click "Inject Fault", and verify instant detection across all monitoring views.',
                  },
                  {
                    id: 'page-archive',
                    num: '08',
                    path: '/archive',
                    title: 'Archive & Batch Inference',
                    badge: 'Historical Data',
                    purpose: 'Historical dataset exploration, batch CSV validation, and data export.',
                    features: [
                      'Query historical observation records by station and custom date ranges.',
                      'Batch CSV file upload to run the entire 5-Tier QC validation pipeline on external datasets.',
                      'Detailed anomaly detection summary report for uploaded datasets.',
                      'Export filtered historical data to CSV for offline analysis.',
                    ],
                    instructions: 'Upload historical CSV records or query stored observations to analyze long-term trends and validate archive integrity.',
                  },
                  {
                    id: 'page-misty',
                    num: '09',
                    path: '/synoptic',
                    title: 'Ask Misty — Meteorological Assistant',
                    badge: 'Local AI Copilot',
                    purpose: 'Conversational assistant for real-time diagnostics, anomaly explanations, and operational queries.',
                    features: [
                      'Context-aware chat powered by local LLM integration analyzing current station telemetry.',
                      'Quick question buttons for common inquiries (e.g. "Explain current anomaly", "Check sensor health").',
                      'Text-selection popup allowing operators to highlight telemetry data and ask questions directly.',
                      'Sleep/Awake toggle to manage background processing.',
                    ],
                    instructions: 'Click the "Ask Misty" button in the top navigation bar or highlight any text on screen to open the diagnostic drawer.',
                  },
                  {
                    id: 'page-settings',
                    num: '10',
                    path: '/settings',
                    title: 'Configuration & Data Sources',
                    badge: 'Settings Center',
                    purpose: 'Centralized control for data sources, network presets, and quality control parameters.',
                    features: [
                      '1-Click Data Source Switcher: Simulated AWS, Open-Meteo REST Feed, or Physical ESP32 MQTT.',
                      'Preset selector for 22 Indian regional weather stations (Pune, Delhi, Leh, Mumbai, Chennai, etc.).',
                      'Adjustable quality control thresholds (temperature limits, persistence floors, Mahalanobis sensitivity).',
                      'Theme mode selector (Dark / Light) and system status audit.',
                    ],
                    instructions: 'Open settings via the top-right gear icon to switch data sources, select regional presets, or adjust QC tolerances.',
                  },
                ].map((page) => (
                  <section
                    key={page.id}
                    id={`doc-sec-${page.id}`}
                    className={`rounded-xl border ${vintage.cardBorder} ${vintage.cardBg} p-6 sm:p-8 shadow-sm`}
                  >
                    <div className="flex items-center justify-between border-b border-stone-300/40 dark:border-white/[0.06] pb-4 mb-5">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-mono font-bold text-sm">
                          {page.num}
                        </span>
                        <div>
                          <h2 className={`text-lg sm:text-xl font-bold ${vintage.textHeading}`}>
                            {page.title}
                          </h2>
                          <p className={`text-xs ${vintage.textMuted}`}>Route: {page.path}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(page.path)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer`}
                        >
                          <span>Open Page</span>
                          <ArrowUpRight size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 text-sm">
                      <p className={`font-medium ${vintage.textHeading}`}>{page.purpose}</p>

                      <div className={`p-4 rounded-lg border ${vintage.innerBoxBorder} ${vintage.innerBoxBg}`}>
                        <h4 className="font-bold text-xs text-amber-500 uppercase tracking-wider mb-2">Key Features &amp; Components</h4>
                        <ul className={`text-xs space-y-2 ${vintage.textMuted}`}>
                          {page.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 size={13} className="text-amber-500 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className={`p-3 rounded-lg border ${vintage.cardBorder} ${vintage.cardBg}`}>
                        <span className={`text-xs font-bold ${vintage.textHeading} block mb-1`}>Operational Instructions</span>
                        <p className={`text-xs ${vintage.textMuted}`}>{page.instructions}</p>
                      </div>
                    </div>
                  </section>
                ))}
              </>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default DocumentationView;
