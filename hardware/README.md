# SkyGuard AI — Hardware & IoT Sensor Module

This directory contains the firmware, pinout schematics, MQTT communication protocols, and deployment instructions for physical **Automatic Weather Stations (AWS)** powered by ESP32 microcontrollers.

---

## 1. Supported Hardware & Sensor Specifications

| Sensor Component | Measured Parameter | Measurement Range | Accuracy / Resolution | Interface |
| :--- | :--- | :--- | :--- | :--- |
| **DHT22 / AM2302** | Air Temperature | -40°C to +80°C | ±0.5°C | Single-Bus Digital (GPIO 4) |
| **DHT22 / AM2302** | Relative Humidity | 0% to 100% RH | ±2% to 5% RH | Single-Bus Digital (GPIO 4) |
| **BMP280 / BME280** | Atmospheric Pressure | 300 to 1100 hPa | ±1.0 hPa / 0.16 Pa | I2C (SDA: GPIO 21, SCL: GPIO 22) |
| **Tipping Bucket** | Precipitation / Rainfall | 0 to 500 mm/hr | 0.2 mm per tip | Interrupt (GPIO 14) |
| **Hall Effect Anemometer** | Wind Speed | 0 to 60 m/s | ±0.5 m/s | Pulse Counter (GPIO 13) |
| **Optical Wind Vane** | Wind Direction | 0° to 360° | ±5° (16-point Gray code) | ADC (GPIO 34) |

---

## 2. ESP32 Pinout Mapping

```
ESP32 NodeMCU Pinout:
─────────────────────────────────────────────────────────────
[3V3]   ──────> VCC (BMP280 / BME280)
[5V/VIN]──────> VCC (DHT22, Anemometer, Rain Gauge)
[GND]   ──────> Common System Ground
[GPIO 21] ────> I2C SDA (BMP280 Pressure Sensor)
[GPIO 22] ────> I2C SCL (BMP280 Pressure Sensor)
[GPIO 4]  ────> DHT22 Data (with 4.7kΩ pullup to 3.3V)
[GPIO 14] ────> Tipping Bucket Rain Gauge Reed Switch (Pullup)
[GPIO 13] ────> Anemometer Pulse Interrupt
[GPIO 34] ────> Wind Vane Voltage Divider (Analog Input)
[GPIO 2]  ────> Status LED (Blinks on telemetry transmission)
─────────────────────────────────────────────────────────────
```

---

## 3. MQTT Telemetry Protocol & Payload Schema

The ESP32 publishes telemetry packets to the broker every **1.5 to 5.0 seconds**.

### Topic Format
- **Telemetry Topic**: `skyguard/aws/{STATION_ID}/telemetry` (e.g. `skyguard/aws/AWS-ESP32-001/telemetry`)
- **Heartbeat Topic**: `skyguard/aws/{STATION_ID}/heartbeat`
- **Command Topic**: `skyguard/aws/{STATION_ID}/cmd`

### JSON Payload Schema
```json
{
  "station_id": "AWS-ESP32-001",
  "timestamp": "2026-09-26T17:30:00Z",
  "uptime_seconds": 14520,
  "battery_voltage": 4.12,
  "rssi_dbm": -62,
  "temperature": 24.85,
  "pressure": 1013.25,
  "humidity": 65.4,
  "wind_speed": 3.2,
  "wind_direction": 180,
  "rainfall": 0.0,
  "firmware_version": "v1.4.0"
}
```

---

## 4. Firmware Flashing Guide

1. Open Arduino IDE or PlatformIO.
2. Open `hardware/esp32/skyguard_aws/skyguard_aws.ino`.
3. Copy `config.example.h` to `config.h` and update:
   - `WIFI_SSID` and `WIFI_PASSWORD`
   - `MQTT_BROKER_HOST` (e.g. `broker.hivemq.com` or private IP)
   - `STATION_ID` (e.g. `AWS-ESP32-001`)
4. Select Board: **ESP32 Dev Module**.
5. Install required Arduino libraries: `PubSubClient`, `DHT sensor library`, `Adafruit BMP280 Library`, `ArduinoJson`.
6. Compile and flash to the ESP32.
