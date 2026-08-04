# Line-by-Line Code Breakdown: `ml_service/ndvi_real.py`

## File Overview
- **File Location**: `ml_service/ndvi_real.py`
- **Total Lines**: 214
- **Purpose**: Communicates directly with ESA Sentinel Hub Process API v3, downloads Sentinel-2 L2A optical reflectance bands, applies cloud-masking (`SCL`), calculates real NDVI ($B_{08} - B_{04} / B_{08} + B_{04}$), and manages 7-day JSON caching.

---

## Detailed Line-by-Line Explanation

```python
7: import os
8: import json
9: import time
10: import numpy as np
11: from datetime import datetime, timedelta
12: from dotenv import load_dotenv
```
- **Lines 7–12**: Imports JSON parsing, system file utilities, NumPy array math, date calculations, and `load_dotenv()` to read Sentinel Hub API keys from `.env`.

```python
16: SENTINELHUB_CLIENT_ID = os.getenv("SENTINELHUB_CLIENT_ID", "")
17: SENTINELHUB_CLIENT_SECRET = os.getenv("SENTINELHUB_CLIENT_SECRET", "")
20: CACHE_FILE = os.path.join(os.path.dirname(__file__), "ndvi_cache.json")
```
- **Lines 16–20**: Loads Sentinel Hub OAuth2 Client ID and Client Secret from environment variables, and defines cache filepath `ndvi_cache.json`.

---

### Cache System (Lines 22-38)

```python
22: def _load_cache():
24:         with open(CACHE_FILE, "r") as f: return json.load(f)
```
- **Lines 22–27**: Loads stored satellite telemetry entries from `ndvi_cache.json`.

```python
36: def _cache_key(lat: float, lon: float) -> str:
38:     return f"{round(lat, 2)}_{round(lon, 2)}"
```
- **Lines 36–38**: Rounds GPS coordinates to 2 decimal places to generate a **~1km grid cell cache key** (e.g. `"20.01_73.79"`).

---

### Agronomic Label Dictionary (Lines 40-50)

```python
40: def _get_ndvi_label(ndvi: float) -> str:
41:     if ndvi >= 0.7:
42:         return "Dense, healthy vegetation — Excellent crop health 🌿"
43:     elif ndvi >= 0.5:
44:         return "Good vegetation cover — Healthy growing crop 🌱"
45:     elif ndvi >= 0.3:
46:         return "Moderate vegetation — Crop growing, needs attention 🌾"
47:     elif ndvi >= 0.1:
48:         return "Sparse vegetation — Early growth or thin cover 🟡"
49:     else:
50:         return "Bare / fallow land — No active crop detected 🟤"
```
- **Lines 40–50**: Maps raw float NDVI index values to human-readable agronomic vegetation health badges.

---

### Main Sentinel Hub Query Function (Lines 52-85)

```python
52: def get_real_ndvi(lat: float, lon: float) -> dict:
60:     cache = _load_cache()
61:     cache_key = _cache_key(lat, lon)
65:     age_days = (time.time() - entry.get("timestamp", 0)) / 86400
66:     if age_days < 7:
68:         return entry
```
- **Lines 52–68**: Checks cache file first. If a cached entry for the coordinate grid is less than 7 days old, returns it immediately without making an external API call.

```python
71:     if SENTINELHUB_CLIENT_ID and SENTINELHUB_CLIENT_SECRET:
73:         result = _fetch_sentinelhub_ndvi(lat, lon)
77:         cache[cache_key] = result
78:         _save_cache(cache)
85:     return _fallback_ndvi(lat, lon)
```
- **Lines 71–85**: Executes `_fetch_sentinelhub_ndvi()` if API keys are configured; saves result to cache. If Sentinel Hub API is unreachable, falls back to `_fallback_ndvi()`.

---

### Sentinel Hub SDK Process API Handler (Lines 87-193)

```python
87: def _fetch_sentinelhub_ndvi(lat: float, lon: float) -> dict:
92:     from sentinelhub import (
93:         SHConfig, SentinelHubRequest, DataCollection,
94:         MimeType, BBox, CRS, bbox_to_dimensions
95:     )
```
- **Lines 87–95**: Dynamically imports Sentinel Hub Python SDK classes.

```python
108:    bbox = BBox(bbox=[lon - delta, lat - delta, lon + delta, lat + delta], crs=CRS.WGS84)
112:    size = bbox_to_dimensions(bbox, resolution=60)
```
- **Lines 108–112**: Creates a $1\text{km} \times 1\text{km}$ bounding box around the target GPS coordinate at 60m resolution.

```python
115:    evalscript = """
116:    //VERSION=3
117:    function setup() {
118:        return { input: [{ bands: ["B04", "B08", "SCL"] }], output: { bands: 3, sampleType: "FLOAT32" } };
119:    }
123:    function evaluatePixel(sample) {
126:        if (sample.SCL >= 8 && sample.SCL <= 10) {
127:            return [-9999, -9999, -9999]; // Mask clouds
128:        }
129:        return [sample.B04, sample.B08, sample.SCL];
130:    }
131:    """
```
- **Lines 115–131**: **Sentinel-2 L2A EvalScript**:
  Requests Band 4 (Red), Band 8 (NIR), and Scene Classification Layer (SCL). SCL values 8–10 (cloud shadow, cloud medium, cloud high) are filtered out by returning `-9999`.

```python
137:    request = SentinelHubRequest(
141:        data_collection=DataCollection.SENTINEL2_L2A,
142:        time_interval=(start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")),
143:        mosaicking_order="leastCC"
144:    )
152:    data = request.get_data()[0]
```
- **Lines 137–152**: Queries Sentinel-2 L2A satellite dataset over the last 45 days, selecting the image scene with the least cloud cover (`leastCC`).

```python
158:    window = data[max(0, center_y-1):center_y+2, max(0, center_x-1):center_x+2, :]
169:    valid_mask = b04_values > 0
173:    b04 = float(np.median(b04_values[valid_mask]))
174:    b08 = float(np.median(b08_values[valid_mask]))
```
- **Lines 158–174**: Extracts a $3 \times 3$ pixel window around center coordinates, strips cloud-masked pixels (`-9999`), and computes median Red (B04) and NIR (B08) reflectance.

```python
180:        ndvi = (b08 - b04) / (b08 + b04)
```
- **Line 180**: **True Real-Time Satellite NDVI Formula**:
  $$\text{NDVI} = \frac{\text{Band 8 (NIR)} - \text{Band 4 (Red)}}{\text{Band 8 (NIR)} + \text{Band 4 (Red)}}$$

```python
191:        "score": round(min(1.2, max(0.7, 0.85 + ndvi * 0.35)), 2),
```
- **Line 191**: Converts raw NDVI float to a ML risk multiplier bounded between $0.70$ and $1.20$.

---

### Deterministic Fallback Function (Lines 195-213)

```python
195: def _fallback_ndvi(lat: float, lon: float) -> dict:
197:     coord_seed = (abs(lat) * 1000 + abs(lon) * 100) % 100
198:     ndvi = round(0.35 + (coord_seed / 250.0), 4)
```
- **Lines 195–213**: Generates a reproducible, deterministic NDVI estimate based on coordinate seeds if Sentinel Hub API is unreachable (offline or overcast).
