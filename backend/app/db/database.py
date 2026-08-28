"""
backend/app/db/database.py
SkyGuard AI — Async Database Engine, Sessionmaker, and Lifecycle Management.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy import event
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
from sqlite3 import Connection as SQLite3Connection

from backend.app.config import settings

logger = logging.getLogger(__name__)

# Ensure data directory exists if a relative/absolute sqlite path is used
if settings.DATABASE_URL.startswith("sqlite+aiosqlite:///"):
    db_raw_path = settings.DATABASE_URL.replace("sqlite+aiosqlite:///", "")
    if db_raw_path and not db_raw_path.startswith(":memory:"):
        db_file = Path(db_raw_path)
        db_file.parent.mkdir(parents=True, exist_ok=True)


class Base(DeclarativeBase):
    """Declarative Base class for all SQLAlchemy 2.0 ORM models."""
    pass


# Create Async Engine
engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
    pool_pre_ping=True,
)


@event.listens_for(engine.sync_engine, "connect")
def set_sqlite_pragmas(dbapi_connection, connection_record) -> None:
    """Configures SQLite connection pragmas for high concurrency, durability, and referential integrity."""
    if isinstance(dbapi_connection, SQLite3Connection) or hasattr(dbapi_connection, "cursor"):
        cursor = dbapi_connection.cursor()
        try:
            cursor.execute("PRAGMA journal_mode=WAL;")
            cursor.execute("PRAGMA synchronous=NORMAL;")
            cursor.execute("PRAGMA foreign_keys=ON;")
            cursor.execute("PRAGMA busy_timeout=10000;")
            cursor.execute("PRAGMA cache_size=-64000;")
            cursor.execute("PRAGMA mmap_size=268435456;")
            cursor.execute("PRAGMA temp_store=MEMORY;")
        finally:
            cursor.close()


# Async Session Factory
async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI Dependency yielding an isolated AsyncSession per request."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_db_context() -> AsyncGenerator[AsyncSession, None]:
    """Async context manager for background workers, services, and simulation loops."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Creates all database tables, applies non-breaking schema migrations, and seeds default stations if empty."""
    from backend.app.db import models  # noqa: F401
    from sqlalchemy import text
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # Check and safely add new columns to existing SQLite tables if missing
        migration_statements = [
            "ALTER TABLE observations ADD COLUMN source_type VARCHAR(32) DEFAULT 'SIMULATED';",
            "ALTER TABLE observations ADD COLUMN source_id VARCHAR(64);",
            "ALTER TABLE observations ADD COLUMN provider VARCHAR(64);",
            "ALTER TABLE observations ADD COLUMN device_id VARCHAR(64);",
            "ALTER TABLE anomaly_events ADD COLUMN source_type VARCHAR(32) DEFAULT 'SIMULATED';",
            "ALTER TABLE anomaly_events ADD COLUMN source_id VARCHAR(64);",
        ]
        for stmt in migration_statements:
            try:
                await conn.execute(text(stmt))
            except Exception:
                # Column already exists
                pass
    
    # Seed default AWS and City Preset stations if not present
    async with get_db_context() as session:
        from backend.app.db.models import Station
        from sqlalchemy import select
        
        seed_stations = [
            # ── Indian IMD Synoptic Network ──
            {"station_id": "DELHI-AWS-001", "name": "Safdarjung Regional HQ (New Delhi)", "latitude": 28.5847, "longitude": 77.2066, "elevation": 216.0, "status": "ACTIVE"},
            {"station_id": "SHIMLA-AWS-002", "name": "Himalayan High Altitude Observatory (Shimla)", "latitude": 31.1048, "longitude": 77.1734, "elevation": 2205.0, "status": "ACTIVE"},
            {"station_id": "SRINAGAR-AWS-003", "name": "Kashmir Valley Meteorological Site (Srinagar)", "latitude": 34.0837, "longitude": 74.7973, "elevation": 1585.0, "status": "ACTIVE"},
            {"station_id": "LEH-AWS-004", "name": "Cold Desert Trans-Himalayan Outpost (Leh)", "latitude": 34.1526, "longitude": 77.5771, "elevation": 3500.0, "status": "ACTIVE"},
            {"station_id": "MUMBAI-AWS-005", "name": "Colaba Marine Weather Tower (Mumbai)", "latitude": 18.8987, "longitude": 72.8090, "elevation": 14.0, "status": "ACTIVE"},
            {"station_id": "PUNE-AWS-006", "name": "Shivajinagar Climate Research Center (Pune)", "latitude": 18.5314, "longitude": 73.8446, "elevation": 560.0, "status": "ACTIVE"},
            {"station_id": "JAISALMER-AWS-007", "name": "Thar Desert Extreme Arid Outpost (Jaisalmer)", "latitude": 26.9124, "longitude": 70.9022, "elevation": 225.0, "status": "ACTIVE"},
            {"station_id": "AHMEDABAD-AWS-008", "name": "Sabarmati Synoptic Base (Ahmedabad)", "latitude": 23.0225, "longitude": 72.5714, "elevation": 53.0, "status": "ACTIVE"},
            {"station_id": "BENGALURU-AWS-009", "name": "Deccan Plateau Atmospheric Lab (Bengaluru)", "latitude": 12.9716, "longitude": 77.5946, "elevation": 920.0, "status": "ACTIVE"},
            {"station_id": "CHENNAI-AWS-010", "name": "Meenambakkam Doppler Radar Site (Chennai)", "latitude": 12.9941, "longitude": 80.1709, "elevation": 16.0, "status": "ACTIVE"},
            {"station_id": "HYDERABAD-AWS-011", "name": "Begumpet Central Plateau AWS (Hyderabad)", "latitude": 17.4435, "longitude": 78.4682, "elevation": 545.0, "status": "ACTIVE"},
            {"station_id": "KOCHI-AWS-012", "name": "Monsoon Entry Marine Point (Kochi)", "latitude": 9.9312, "longitude": 76.2673, "elevation": 5.0, "status": "ACTIVE"},
            {"station_id": "KOLKATA-AWS-013", "name": "Alipore Gangetic Delta Synoptic Hub (Kolkata)", "latitude": 22.5332, "longitude": 88.3242, "elevation": 9.0, "status": "ACTIVE"},
            {"station_id": "CHERRAPUNJI-AWS-014", "name": "Sohra Extreme Precipitation Station (Cherrapunji)", "latitude": 25.2702, "longitude": 91.7323, "elevation": 1430.0, "status": "ACTIVE"},
            {"station_id": "GUWAHATI-AWS-015", "name": "Brahmaputra Valley Riverine Station (Guwahati)", "latitude": 26.1445, "longitude": 91.7362, "elevation": 55.0, "status": "ACTIVE"},
            {"station_id": "PORT-BLAIR-AWS-016", "name": "Andaman Tropical Oceanic Sentinel (Port Blair)", "latitude": 11.6234, "longitude": 92.7265, "elevation": 16.0, "status": "ACTIVE"},

            # ── Global WMO Synoptic Reference Anchors ──
            {"station_id": "LONDON-WMO-017", "name": "Heathrow Meteorological Center (London)", "latitude": 51.4700, "longitude": -0.4543, "elevation": 25.0, "status": "ACTIVE"},
            {"station_id": "TOKYO-WMO-018", "name": "JMA Central Synoptic Station (Tokyo)", "latitude": 35.6895, "longitude": 139.6917, "elevation": 40.0, "status": "ACTIVE"},
            {"station_id": "DEATH-VALLEY-019", "name": "Furnace Creek Extreme Heat Station (Death Valley)", "latitude": 36.4622, "longitude": -116.8669, "elevation": -58.0, "status": "ACTIVE"},
            {"station_id": "SINGAPORE-WMO-020", "name": "Changi Equatorial Climate Station (Singapore)", "latitude": 1.3644, "longitude": 103.9915, "elevation": 7.0, "status": "ACTIVE"},
            {"station_id": "SYDNEY-WMO-021", "name": "Observatory Hill Coastal Station (Sydney)", "latitude": -33.8596, "longitude": 151.2048, "elevation": 39.0, "status": "ACTIVE"},
            {"station_id": "REYKJAVIK-WMO-022", "name": "Sub-Arctic Coastal Station (Reykjavik)", "latitude": 64.1265, "longitude": -21.9042, "elevation": 52.0, "status": "ACTIVE"},

            # ── Regional Agro-Met & Experimental Network ──
            {"station_id": "AWS-001", "name": "Northern Plains Met Base (Chandigarh)", "latitude": 30.7333, "longitude": 76.7794, "elevation": 321.0, "status": "ACTIVE"},
            {"station_id": "AWS-002", "name": "Central Arid Agro-Met Station (Nagpur)", "latitude": 21.1458, "longitude": 79.0882, "elevation": 310.0, "status": "ACTIVE"},
            {"station_id": "AWS-003", "name": "Plateau Highland Station (Dharamshala)", "latitude": 32.2190, "longitude": 76.3234, "elevation": 1457.0, "status": "ACTIVE"},
            {"station_id": "AWS-004", "name": "Gangetic Alluvial Base (Varanasi)", "latitude": 25.3176, "longitude": 82.9739, "elevation": 81.0, "status": "ACTIVE"},
            {"station_id": "PUNE-EXT-001", "name": "Pune Experimental High-Frequency AWS", "latitude": 18.5204, "longitude": 73.8567, "elevation": 560.0, "status": "ACTIVE"},
            {"station_id": "DELHI-EXT-001", "name": "New Delhi Safdarjung Synoptic Site", "latitude": 28.5850, "longitude": 77.2100, "elevation": 216.0, "status": "ACTIVE"},
            {"station_id": "LONDON-EXT-001", "name": "London Heathrow Synoptic Station", "latitude": 51.4700, "longitude": -0.4540, "elevation": 25.0, "status": "ACTIVE"},
            {"station_id": "TOKYO-EXT-001", "name": "Tokyo JMA Observation Station", "latitude": 35.6900, "longitude": 139.6900, "elevation": 40.0, "status": "ACTIVE"},
            {"station_id": "DV-EXT-001", "name": "Badwater Basin Salt Flat Sensor (Death Valley)", "latitude": 36.2503, "longitude": -116.8258, "elevation": -86.0, "status": "ACTIVE"},
            {"station_id": "BHOPAL-AWS-023", "name": "Central Highland Synoptic Observatory (Bhopal)", "latitude": 23.2599, "longitude": 77.4126, "elevation": 527.0, "status": "ACTIVE"},
            {"station_id": "LUCKNOW-AWS-024", "name": "Awadh Meteorological Radar Node (Lucknow)", "latitude": 26.8467, "longitude": 80.9462, "elevation": 123.0, "status": "ACTIVE"},
            {"station_id": "PATNA-AWS-025", "name": "Middle Ganges Flood Monitoring AWS (Patna)", "latitude": 25.5941, "longitude": 85.1376, "elevation": 53.0, "status": "ACTIVE"},
        ]

        for s_data in seed_stations:
            result = await session.execute(select(Station).where(Station.station_id == s_data["station_id"]))
            existing = result.scalars().first()
            if not existing:
                st_obj = Station(**s_data)
                session.add(st_obj)
        
        await session.commit()
        logger.info("Synchronized all 34 Synoptic Array stations in SQLite database.")


async def close_db() -> None:
    """Gracefully disposes database connection pool on application shutdown."""
    await engine.dispose()
    logger.info("Database connection pool closed.")
