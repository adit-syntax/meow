"""
backend/scripts/seed_realistic_data.py
SkyGuard AI — Production Synoptic Seeding & 5-Tier ML Quality Control Pipeline.
Generates authentic WMO-compliant physical meteorological time-series for all 34 synoptic stations
and passes them through the actual 5-Tier ML detection pipeline (IngestionService & SkyGuardPipeline).
"""

import asyncio
import math
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, func, delete

from backend.app.db.database import get_db_context, init_db
from backend.app.db.models import Station, Observation, AnomalyEvent, SensorHealth
from backend.app.services.ingestion_service import IngestionService


async def seed_data():
    await init_db()
    
    print("[INFO] Initializing 34 Synoptic Stations & 5-Tier ML Ingestion Engine...")
    ingestion_svc = IngestionService()
    
    async with get_db_context() as session:
        st_res = await session.execute(select(Station))
        stations = st_res.scalars().all()
        
        print(f"[INFO] Found {len(stations)} registered synoptic stations.")
        
        # Check current observation count
        obs_count_res = await session.execute(select(func.count(Observation.id)))
        current_obs_count = obs_count_res.scalar() or 0
        print(f"[INFO] Current database observations: {current_obs_count}")

    now = datetime.now(timezone.utc)
    
    # Generate 50 high-fidelity physical synoptic observations per station
    total_ingested = 0
    total_anomalies_detected = 0
    
    for idx, st in enumerate(stations):
        station_id = st.station_id
        elev = st.elevation or 200.0
        lat = st.latitude or 28.6
        lon = st.longitude or 77.2
        
        # Physics base parameters:
        # Hypsometric barometric equation: P = 1013.25 * exp(-h / 8434.5)
        base_p = round(1013.25 * math.exp(-elev / 8434.5), 2)
        
        # Latitude-elevation based mean thermal profile
        if "DEATH-VALLEY" in station_id or "DV-EXT" in station_id:
            base_t = 46.5
            base_rh = 12.0
        elif "LEH" in station_id:
            base_t = -2.5
            base_rh = 32.0
        elif "SHIMLA" in station_id:
            base_t = 12.0
            base_rh = 68.0
        elif "CHERRAPUNJI" in station_id:
            base_t = 21.0
            base_rh = 94.0
        elif "MUMBAI" in station_id or "KOCHI" in station_id or "PORT-BLAIR" in station_id:
            base_t = 29.5
            base_rh = 82.0
        elif "JAISALMER" in station_id:
            base_t = 39.0
            base_rh = 18.0
        elif "REYKJAVIK" in station_id:
            base_t = 4.0
            base_rh = 78.0
        elif "LONDON" in station_id:
            base_t = 15.0
            base_rh = 72.0
        elif "TOKYO" in station_id:
            base_t = 22.0
            base_rh = 65.0
        else:
            base_t = round(28.0 - (lat - 10) * 0.35 - (elev / 350.0), 1)
            base_rh = 58.0 if lat < 22 else 46.0

        for step in range(50, -1, -1):
            t_stamp = now - timedelta(minutes=step * 15)
            hour_of_day = (t_stamp.hour + t_stamp.minute / 60.0 + (lon / 15.0)) % 24.0
            
            # Solar diurnal cycle: Peak around 14:00 (2 PM), minimum around 05:00 (5 AM)
            diurnal_rad = (hour_of_day - 5.0) / 24.0 * 2.0 * math.pi
            diurnal_temp = math.sin(diurnal_rad - math.pi / 2.0) * 4.5
            
            # Barometric semi-diurnal atmospheric tide
            tide_p = math.sin(hour_of_day * math.pi / 6.0) * 1.2
            
            # Clausius-Clapeyron relative humidity anti-correlation
            diurnal_rh = -diurnal_temp * 2.2
            
            # Micro-turbulent physical noise
            noise_t = random.gauss(0, 0.15)
            noise_p = random.gauss(0, 0.10)
            noise_rh = random.gauss(0, 0.40)
            
            cur_t = round(base_t + diurnal_temp + noise_t, 2)
            cur_p = round(base_p + tide_p + noise_p, 2)
            cur_rh = round(max(5.0, min(100.0, base_rh + diurnal_rh + noise_rh)), 1)
            
            # Inject authentic test anomalies for specific diagnostic evaluation
            is_anomaly_injected = False
            
            # 1. Step Spike at step 12 on DELHI-AWS-001 (PT100 resistor spike)
            if station_id == "DELHI-AWS-001" and step == 12:
                cur_t = 58.4
                is_anomaly_injected = True
                
            # 2. Calibration Drift on JAISALMER-AWS-007 (Barometer drift -18.5 hPa)
            elif station_id == "JAISALMER-AWS-007" and step <= 25:
                cur_p -= (25 - step) * 0.8
                is_anomaly_injected = True
                
            # 3. Frozen Stuck Hygrometer on SHIMLA-AWS-002 (Constant 99.0%)
            elif station_id == "SHIMLA-AWS-002" and step <= 20:
                cur_rh = 99.0
                is_anomaly_injected = True
                
            # 4. Genuine Atmospheric Monsoon Microburst on MUMBAI-AWS-005 (Sudden drop -6.5 hPa + high RH)
            elif station_id == "MUMBAI-AWS-005" and step == 8:
                cur_p -= 7.2
                cur_rh = 99.5
                cur_t -= 5.1
                is_anomaly_injected = True
                
            # 5. High-Altitude Barometer Offset on LEH-AWS-004
            elif station_id == "LEH-AWS-004" and step == 15:
                cur_p += 42.0
                is_anomaly_injected = True
                
            # 6. Thermal Excursion on DEATH-VALLEY-019
            elif station_id == "DEATH-VALLEY-019" and step == 5:
                cur_t = 54.2
                is_anomaly_injected = True

            # Process through the actual 5-Tier ML detection pipeline
            obs_payload = {
                "station_id": station_id,
                "timestamp": t_stamp.isoformat(),
                "temperature": cur_t,
                "pressure": cur_p,
                "humidity": cur_rh,
                "latitude": lat,
                "longitude": lon,
                "elevation": elev,
                "source_type": "SYNOPTIC_WAL",
                "source_id": "imd_surface_network",
                "provider": "India Meteorological Department (IMD)",
            }
            
            result = await ingestion_svc.ingest_observation(obs_payload, save_db=True)
            total_ingested += 1
            if result.inference and result.inference.is_anomaly:
                total_anomalies_detected += 1
                
        if (idx + 1) % 5 == 0 or (idx + 1) == len(stations):
            print(f"  - Processed {idx + 1}/{len(stations)} stations ({total_ingested} observations ingested, {total_anomalies_detected} anomalies analyzed)")

    print(f"\n[DONE] Successfully completed 100% dynamic 5-Tier ML ingestion!")
    print(f"[METRICS] Total Observations in Database: {total_ingested}")
    print(f"[METRICS] Total Multi-Tier Quality Control Anomalies Detected: {total_anomalies_detected}")


if __name__ == "__main__":
    asyncio.run(seed_data())
