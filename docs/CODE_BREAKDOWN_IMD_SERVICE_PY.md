# Line-by-Line Code Breakdown: `ml_service/imd_service.py`

## File Overview
- **File Location**: `ml_service/imd_service.py`
- **Total Lines**: 90
- **Purpose**: Fetches meteorological telemetry (temperature, precipitation, 24h rainfall) from the India Meteorological Department (IMD) API, with automatic fallback to Open-Meteo API and regional baseline estimates.

---

## Detailed Line-by-Line Explanation

```python
1: import urllib.request
2: import json
3: import logging
```
- **Lines 1–3**: Imports Python standard `urllib.request` for HTTP GET calls without external dependencies, `json` for response parsing, and `logging` for warning tracking.

```python
5: IMD_CITY_LOC_URL = "https://api.imd.gov.in/api/v1/cityforecastloc"
6: OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
```
- **Lines 5–6**: Defines primary IMD endpoint URL and secondary Open-Meteo REST endpoint URL.

---

### Main Weather Telemetry Router (Lines 11-89)

```python
11: def fetch_imd_weather(lat: float, lon: float) -> dict:
18:     url = f"{IMD_CITY_LOC_URL}?lat={lat}&lon={lon}"
19:     req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
20:     with urllib.request.urlopen(req, timeout=4) as response:
```
- **Lines 11–20**: Primary Stage 1 — Constructs HTTP request to IMD city forecast endpoint for target coordinates with a 4-second timeout.

```python
25:     max_temp = float(station_data.get("Today_Max_temp", 32.0))
26:     min_temp = float(station_data.get("Today_Min_temp", 22.0))
27:     rainfall = float(station_data.get("Past_24_hrs_Rainfall", 0.0))
28:     forecast = station_data.get("Todays_Forecast", "Clear sky")
```
- **Lines 25–28**: Parses maximum temperature, minimum temperature, 24h accumulated rainfall (mm), and text forecast from IMD JSON response payload.

```python
30:     score = 1.0
31:     if rainfall > 50.0:
32:         score = 0.85  # Heavy rain risk
33:     elif rainfall > 5.0:
34:         score = 1.05  # Good irrigation rainfall
```
- **Lines 30–35**: **IMD Meteorological Risk Multiplier Rules**:
  - Heavy rainfall (>50mm): Reduces score to `0.85` due to flood/waterlogging risk.
  - Good irrigation rainfall (5–50mm): Increases score to `1.05`.
  - Normal/dry weather: Baseline `1.0`.

```python
46: except Exception as e:
47:     logger.warning(f"IMD API call failed/timed out: {e}. Switching to Open-Meteo fallback.")
```
- **Lines 46–47**: Catches timeouts/connection drops; logs warning and routes to Open-Meteo fallback.

```python
51:     om_url = f"{OPEN_METEO_URL}?latitude={lat}&longitude={lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto"
53:     with urllib.request.urlopen(req, timeout=5) as response:
59:         temp = current.get("temperature", 28.0)
62:         precip = daily.get("precipitation_sum", [0.0])[0] if daily.get("precipitation_sum") else 0.0
64:         score = 1.02 if (18.0 <= temp <= 35.0 and precip < 40.0) else 0.92
```
- **Lines 51–64**: Stage 2 Fallback — Queries Open-Meteo API. Evaluates growing season thermal bounds ($18^\circ\text{C} \le T \le 35^\circ\text{C}$) and rainfall limits ($<40\text{mm}$).

```python
79: # 3. Ultimate Fallback
80: return {
81:     "source": "Historical Regional Climate Benchmark",
83:     "max_temp_c": 32.0, "min_temp_c": 22.0, "rainfall_24h_mm": 2.5,
87:     "score": 1.0,
88:     "description": "Seasonal normal temperatures and rainfall expected."
89: }
```
- **Lines 79–89**: Stage 3 Ultimate Fallback — If both external network endpoints fail or timing out, returns regional historical benchmark payload (`score = 1.0`), guaranteeing zero backend downtime.
