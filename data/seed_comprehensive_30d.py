"""
backend/scripts/seed_comprehensive_30d.py
Seeds full 30-day continuous synoptic observations and realistic multi-tier anomaly events
for all 31 Automatic Weather Stations in skyguard.db.
"""

import sqlite3
import random
import math
from datetime import datetime, timedelta, timezone

def seed_database():
    conn = sqlite3.connect('skyguard.db')
    cur = conn.cursor()

    # 1. Ensure all 31 stations exist
    stations_data = [
        ("DELHI-AWS-001", "Safdarjung Regional HQ (New Delhi)", 28.5847, 77.2066, 216.0, "ACTIVE"),
        ("SHIMLA-AWS-002", "Himalayan High Altitude Observatory (Shimla)", 31.1048, 77.1734, 2205.0, "ACTIVE"),
        ("SRINAGAR-AWS-003", "Kashmir Valley Meteorological Site (Srinagar)", 34.0837, 74.7973, 1585.0, "ACTIVE"),
        ("LEH-AWS-004", "Cold Desert Trans-Himalayan Outpost (Leh)", 34.1526, 77.5771, 3500.0, "ACTIVE"),
        ("MUMBAI-AWS-005", "Colaba Marine Weather Tower (Mumbai)", 18.8987, 72.8090, 14.0, "ACTIVE"),
        ("PUNE-AWS-006", "Shivajinagar Climate Research Center (Pune)", 18.5314, 73.8446, 560.0, "ACTIVE"),
        ("JAISALMER-AWS-007", "Thar Desert Extreme Arid Outpost (Jaisalmer)", 26.9124, 70.9022, 225.0, "ACTIVE"),
        ("AHMEDABAD-AWS-008", "Sabarmati Synoptic Base (Ahmedabad)", 23.0225, 72.5714, 53.0, "ACTIVE"),
        ("BENGALURU-AWS-009", "Deccan Plateau Atmospheric Lab (Bengaluru)", 12.9716, 77.5946, 920.0, "ACTIVE"),
        ("CHENNAI-AWS-010", "Meenambakkam Doppler Radar Site (Chennai)", 12.9941, 80.1709, 16.0, "ACTIVE"),
        ("HYDERABAD-AWS-011", "Begumpet Central Plateau AWS (Hyderabad)", 17.4435, 78.4682, 545.0, "ACTIVE"),
        ("KOCHI-AWS-012", "Monsoon Entry Marine Point (Kochi)", 9.9312, 76.2673, 5.0, "ACTIVE"),
        ("KOLKATA-AWS-013", "Alipore Gangetic Delta Synoptic Hub (Kolkata)", 22.5332, 88.3242, 9.0, "ACTIVE"),
        ("CHERRAPUNJI-AWS-014", "Sohra Extreme Precipitation Station (Cherrapunji)", 25.2702, 91.7323, 1430.0, "ACTIVE"),
        ("GUWAHATI-AWS-015", "Brahmaputra Valley Riverine Station (Guwahati)", 26.1445, 91.7362, 55.0, "ACTIVE"),
        ("PORT-BLAIR-AWS-016", "Andaman Tropical Oceanic Sentinel (Port Blair)", 11.6234, 92.7265, 16.0, "ACTIVE"),
        ("LONDON-WMO-017", "Heathrow Meteorological Center (London)", 51.4700, -0.4543, 25.0, "ACTIVE"),
        ("TOKYO-WMO-018", "JMA Central Synoptic Station (Tokyo)", 35.6895, 139.6917, 40.0, "ACTIVE"),
        ("DEATH-VALLEY-019", "Furnace Creek Extreme Heat Station (Death Valley)", 36.4622, -116.8669, -58.0, "ACTIVE"),
        ("SINGAPORE-WMO-020", "Changi Equatorial Climate Station (Singapore)", 1.3644, 103.9915, 7.0, "ACTIVE"),
        ("SYDNEY-WMO-021", "Observatory Hill Coastal Station (Sydney)", -33.8596, 151.2048, 39.0, "ACTIVE"),
        ("REYKJAVIK-WMO-022", "Sub-Arctic Coastal Station (Reykjavik)", 64.1265, -21.9042, 52.0, "ACTIVE"),
        ("AWS-001", "Northern Plains Met Base (Chandigarh)", 30.7333, 76.7794, 321.0, "ACTIVE"),
        ("AWS-002", "Central Arid Agro-Met Station (Nagpur)", 21.1458, 79.0882, 310.0, "ACTIVE"),
        ("AWS-003", "Plateau Highland Station (Dharamshala)", 32.2190, 76.3234, 1457.0, "ACTIVE"),
        ("AWS-004", "Gangetic Alluvial Base (Varanasi)", 25.3176, 82.9739, 81.0, "ACTIVE"),
        ("PUNE-EXT-001", "Pune Experimental High-Frequency AWS", 18.5204, 73.8567, 560.0, "ACTIVE"),
        ("DV-EXT-001", "Badwater Basin Salt Flat Sensor (Death Valley)", 36.2503, -116.8258, -86.0, "ACTIVE"),
        ("BHOPAL-AWS-023", "Central Highland Synoptic Observatory (Bhopal)", 23.2599, 77.4126, 527.0, "ACTIVE"),
        ("LUCKNOW-AWS-024", "Awadh Meteorological Radar Node (Lucknow)", 26.8467, 80.9462, 123.0, "ACTIVE"),
        ("PATNA-AWS-025", "Middle Ganges Flood Monitoring AWS (Patna)", 25.5941, 85.1376, 53.0, "ACTIVE"),
    ]

    for st_id, name, lat, lon, elev, status in stations_data:
        cur.execute("""
            INSERT INTO stations (station_id, name, latitude, longitude, elevation, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            ON CONFLICT(station_id) DO UPDATE SET
                name=excluded.name,
                latitude=excluded.latitude,
                longitude=excluded.longitude,
                elevation=excluded.elevation
        """, (st_id, name, lat, lon, elev, status))

    print(f"Ensured all {len(stations_data)} synoptic stations are present in database.")

    # 2. Seed 30-day observations & anomalies for each station
    now = datetime.now(timezone.utc)
    base_temps = {
        "DELHI-AWS-001": 28.0, "SHIMLA-AWS-002": 15.0, "SRINAGAR-AWS-003": 14.0,
        "LEH-AWS-004": -2.0, "MUMBAI-AWS-005": 29.0, "PUNE-AWS-006": 24.0,
        "JAISALMER-AWS-007": 36.0, "AHMEDABAD-AWS-008": 31.0, "BENGALURU-AWS-009": 22.0,
        "CHENNAI-AWS-010": 30.0, "HYDERABAD-AWS-011": 26.0, "KOCHI-AWS-012": 28.0,
        "KOLKATA-AWS-013": 29.0, "CHERRAPUNJI-AWS-014": 18.0, "GUWAHATI-AWS-015": 25.0,
        "PORT-BLAIR-AWS-016": 28.0, "LONDON-WMO-017": 16.0, "TOKYO-WMO-018": 20.0,
        "DEATH-VALLEY-019": 46.0, "SINGAPORE-WMO-020": 29.0, "SYDNEY-WMO-021": 19.0,
        "REYKJAVIK-WMO-022": 6.0, "AWS-001": 25.0, "AWS-002": 27.0,
        "AWS-003": 12.0, "AWS-004": 26.0, "PUNE-EXT-001": 24.0, "DV-EXT-001": 48.0,
        "BHOPAL-AWS-023": 25.0, "LUCKNOW-AWS-024": 27.0, "PATNA-AWS-025": 26.0,
    }

    anom_types = [
        ("Step Spike & Transducer Jump", "HARDWARE_TRANSDUCER_FAULT", "CRITICAL", True, "Instantaneous sensor reading jump of +18.4°C within a single cycle, exceeding WMO physical limit (dT/dt > 5.0°C/min).", "Dispatch calibration unit to inspect PT100 probe bridge."),
        ("Barometric Sensor Drift", "SENSOR_DRIFT", "HIGH", True, "Barometer consistently reporting 12.4 hPa below neighboring spatial consensus stations.", "Engage Neural Spatial Consensus Imputation and schedule field calibration."),
        ("Frozen Hygrometer Output (Stuck Value)", "PERSISTENCE_FAULT", "MEDIUM", True, "Relative humidity channel invariant for 120 consecutive cycles despite rapid wind and pressure fluctuations.", "Perform remote diagnostic pulse and check membrane for moisture accumulation."),
        ("Squall Front & Pressure Plunge", "CLIMATOLOGICAL_EXTREME", "HIGH", False, "Severe barometric pressure drop (-4.8 hPa / 10 min) synchronized with 100% RH and high wind velocity. Validated as genuine atmospheric storm phenomenon.", "Preserve observation packet in WMO archive with Flag 0."),
        ("High-Frequency Transducer Noise", "NOISE_BURST", "MEDIUM", True, "Rapid jitter and signal noise detected on secondary temperature probe.", "Inspect ground wire shielding during next routine maintenance visit."),
        ("Multivariate Thermodynamic Decoupling", "MULTIVARIATE_INCONSISTENCY", "MEDIUM", True, "Calculated dew point exceeds ambient dry-bulb temperature, indicating sensor calibration offset.", "Apply WMO QC-4 flag and trigger virtual spatial consensus."),
    ]

    obs_records = []
    anom_records = []

    # Generate 1 observation every 3 hours over 30 days = 240 observations per station
    for st_id, name, lat, lon, elev, _ in stations_data:
        base_t = base_temps.get(st_id, 24.0)
        base_p = 1013.25 * math.exp(-elev / 8500.0)
        base_rh = 55.0

        for step in range(240):
            t_offset = (240 - step) * 3 # hours ago
            obs_time = now - timedelta(hours=t_offset)
            ts_str = obs_time.strftime("%Y-%m-%d %H:%M:%S")

            # Diurnal sine wave
            hour_val = obs_time.hour
            diurnal = 5.0 * math.sin((hour_val - 8) * math.pi / 12.0)
            noise_t = random.uniform(-0.8, 0.8)
            noise_p = random.uniform(-1.2, 1.2)
            noise_rh = random.uniform(-3.0, 3.0)

            temp = round(base_t + diurnal + noise_t, 1)
            pres = round(base_p + noise_p, 1)
            hum = max(10.0, min(100.0, round(base_rh - diurnal * 2.0 + noise_rh, 1)))

            # Inject occasional anomalies (approx 5-8 per station across 30 days)
            is_anom = False
            if random.random() < 0.035 or step in (235, 220, 180, 140, 80, 30):
                is_anom = True
                clf_info = random.choice(anom_types)
                if clf_info[1] == "HARDWARE_TRANSDUCER_FAULT":
                    temp = round(temp + random.choice([25.0, -35.0]), 1)
                elif clf_info[1] == "SENSOR_DRIFT":
                    pres = round(pres - 16.5, 1)
                elif clf_info[1] == "PERSISTENCE_FAULT":
                    hum = 99.0

            obs_records.append((st_id, ts_str, temp, pres, hum, "QC_FLAGGED" if is_anom else "VALID", "SIMULATED", "seed_30d", None, None))

    cur.executemany("""
        INSERT INTO observations (station_id, timestamp, temperature, pressure, humidity, validation_status, source_type, source_id, provider, device_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    """, obs_records)

    print(f"Inserted {len(obs_records)} historical 30-day observations across all 31 stations.")

    # Now link realistic anomaly events
    for st_id, _, _, _, _, _ in stations_data:
        # Fetch the flagged observations for this station
        cur.execute("SELECT id, timestamp, temperature, pressure, humidity FROM observations WHERE station_id = ? AND validation_status = 'QC_FLAGGED' ORDER BY timestamp DESC LIMIT 12", (st_id,))
        flagged = cur.fetchall()

        for obs_id, ts_str, temp, pres, hum in flagged:
            clf_name, anom_type, sev, is_fault, reason, action = random.choice(anom_types)
            score = round(random.uniform(0.78, 0.98), 2)
            conf = round(random.uniform(0.88, 0.99), 2)

            anom_records.append((
                obs_id, st_id, ts_str, 1, score, conf, sev, anom_type, clf_name, 1 if is_fault else 0,
                "SIMULATED", "seed_30d", reason, None, None, action, None
            ))

    cur.executemany("""
        INSERT INTO anomaly_events (
            observation_id, station_id, timestamp, is_anomaly, anomaly_score, confidence,
            severity, anomaly_type, classification, is_fault, source_type, source_id,
            reason, explanation, tier_scores, recommended_action, raw_values, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    """, anom_records)

    print(f"Inserted {len(anom_records)} multi-tier anomaly events covering all 31 stations.")

    conn.commit()
    conn.close()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_database()
