/**
 * frontend/src/utils/formatters.ts
 * SkyGuard AI — String & Label Formatters.
 * Cleans up raw database identifiers, replaces underscores with readable title-case formatting,
 * and formats physical meteorological telemetry units.
 */

/**
 * Converts snake_case, UPPERCASE_UNDERSCORES, or raw keys into clean human-readable Title Case.
 * Example: 'MULTIVARIATE_INCONSISTENCY' -> 'Multivariate Inconsistency'
 * Example: 'STEP_SPIKE' -> 'Step Spike'
 * Example: 'HARDWARE_TRANSDUCER_FAULT' -> 'Hardware Transducer Fault'
 */
export function formatClassification(text?: string | null): string {
  if (!text) return 'Sensor Anomaly Event';
  
  // Clean known common abbreviations and acronyms
  const specialWords: { [k: string]: string } = {
    qc: 'QC',
    wmo: 'WMO',
    aws: 'AWS',
    rh: 'RH',
    imd: 'IMD',
    ai: 'AI',
    gru: 'GRU',
    lstm: 'LSTM',
    idw: 'IDW',
  };

  return text
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (specialWords[lower]) return specialWords[lower];
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Formats station codes and names cleanly without raw underscore artifacts.
 */
export function formatStationLabel(stationId?: string | null, name?: string | null): string {
  if (!stationId) return 'Synoptic Station';
  const cleanId = stationId.replace(/_/g, '-');
  if (name && name !== stationId) {
    return `${cleanId} (${name.replace(/_/g, ' ')})`;
  }
  return cleanId;
}

/**
 * Formats severity levels cleanly.
 */
export function formatSeverity(sev?: string | null): string {
  if (!sev) return 'Nominal';
  return sev.charAt(0).toUpperCase() + sev.slice(1).toLowerCase();
}
