# SkyGuard AI — Intelligent Meteorological Anomaly Detection & Sensor Health Platform

**SkyGuard AI (v2.0 PRO)** is a multi-tiered, physics-guided artificial intelligence platform engineered for real-time automatic weather station (AWS) quality control, sensor fault classification, explainability, predictive maintenance, and meteorological copilot assistance.

---

## 📂 Modular Architecture Overview

The repository is structured into distinct, decoupled subsystems:

```
skyguard-ai/
├── backend/            # FastAPI Web Server, REST Endpoints, WebSockets, DB & Data Sources
├── frontend/           # React 18, TypeScript, Tailwind CSS, 3D Earth Twin & Synoptic UI
├── gen_ai/             # Misty AI Meteorological Assistant, RAG & Multi-LLM Reasoning Engine
├── machine_learning/   # 5-Tier ML Quality Control Pipeline, Pre-trained Models & Benchmarks
├── hardware/           # ESP32 Firmware, IoT MQTT Telemetry Client & Circuit Schematics
├── docs/               # Unified Master Technical Documentation (FINAL_DOCUMENTATION.md)
├── tests/              # End-to-End, Unit, and Adversarial Stress Test Suite
├── docker-compose.yml  # Containerized Full-Stack Deployment
├── requirements.txt    # Python Backend & ML Dependencies
└── run.bat             # 1-Click Windows Full System Launcher
```

---

## 🌟 Core Subsystems

### 1. 🖥️ `backend/`
- **FastAPI Core**: Async REST API and low-latency WebSocket streaming.
- **Multi-Source Ingestion**: Interchangeable feeds (`SIMULATED`, `EXTERNAL_API` Open-Meteo, `PHYSICAL_AWS` MQTT).
- **Spatial Consensus Engine**: Tier 3.5 spatial buddy-checks across 34 synoptic stations.
- **Async SQLite / aiosqlite**: High-throughput telemetry and incident logging in WAL mode.

### 2. 🎨 `frontend/`
- **Synoptic Ops Command Center**: Interactive 3D Digital Earth Twin, 2D Consensus Doppler radar, and quick station triage.
- **High-Frequency Telemetry**: Live multi-parameter diurnal oscilloscopes (1.5s refresh).
- **Incident Forensics & XAI**: Deep-dive event traces with TreeSHAP waterfall feature attributions.
- **Interactive AWS Simulator**: Real-time sensor fault injection laboratory.

### 3. 🧠 `machine_learning/`
- **Tier 1**: Deterministic WMO physical bounds, step limits, and frozen value detection.
- **Tier 2**: Scikit-Learn `IsolationForest` (Point ML) + PyTorch 2-layer GRU Autoencoder (Temporal ML).
- **Tier 3**: Clausius-Clapeyron thermodynamic consistency + Mahalanobis covariance distance.
- **Tier 4**: Random Forest 7-Class Fault Taxonomy Classifier (Disambiguating hardware faults from convective storms).
- **Tier 5**: Dynamic Sensor Health Index (SHI 0–100) + TreeSHAP explainability engine.
- **Pre-trained Weights & Training Scripts**: Stored in `machine_learning/models/` and `machine_learning/training/`.

### 4. 🤖 `gen_ai/`
- **Misty AI Meteorological Copilot**: Conversational AI assistant for sensor fault triage and diagnostics.
- **Multi-Provider Support**: Seamlessly routes between Google Gemini 1.5 Flash, Groq, OpenAI, and local offline heuristic reasoning.
- **Contextual Grounding**: Live RAG grounding on current synoptic station telemetry and active alerts.

### 5. 📟 `hardware/`
- **ESP32 Edge Microcontroller**: Real-time sampling of DHT22/AM2302 (Temp/RH), BMP280 (Pressure), Rain Gauge, and Anemometer.
- **MQTT Protocol**: Lightweight JSON telemetry streaming to HiveMQ/AWS IoT brokers.
- **Full Schematics**: Detailed wiring tables and pinouts in `hardware/README.md`.

---

## 🚀 Quickstart Guide

### 1-Click Launch (Windows)
```cmd
run.bat
```

### Manual Backend Launch
```bash
pip install -r requirements.txt
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8899 --reload
```

### Manual Frontend Launch
```bash
cd frontend
npm install
npm run dev
```

---

## 📚 Master Documentation

All PRDs, system architectures, mathematical formulas, API specifications, and benchmark reports have been compiled into one authoritative document:

👉 **[docs/FINAL_DOCUMENTATION.md](docs/FINAL_DOCUMENTATION.md)**

---
*SkyGuard AI — Intelligent Meteorological Anomaly Detection Platform.*
