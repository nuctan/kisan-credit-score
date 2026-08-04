# Line-by-Line Code Breakdown: `ml_service/trend_analytics.py`

## File Overview
- **File Location**: `ml_service/trend_analytics.py`
- **Total Lines**: 289
- **Purpose**: Computes 12-month historical satellite NDVI curves (via Sentinel Hub Statistical API) and 12-month precipitation accumulation bar data (via Open-Meteo Archive API) for district visualization.

---

## Detailed Line-by-Line Explanation

```python
27: MAHARASHTRA_DISTRICTS = {
28:     "ahilyanagar (ahmednagar)": (19.0958, 74.7496),
29:     "pune":       (18.5204, 73.8567),
30:     "nashik":     (19.9975, 73.7898),
31:     "solapur":    (17.6599, 75.9064),
    ...
41: }
```
- **Lines 27–41**: Dictionary mapping 36 Maharashtra district names to exact centroid GPS coordinates (Latitude, Longitude).

---

### Function 1: `_fetch_real_ndvi_12months` (Lines 64-162)

```python
64: def _fetch_real_ndvi_12months(lat: float, lon: float) -> list:
71:     from sentinelhub import SHConfig, SentinelHubStatistical, DataCollection, BBox, CRS
88:     end_date   = datetime.now().replace(day=1) - timedelta(days=1)
89:     start_date = (end_date - relativedelta(months=11)).replace(day=1)
```
- **Lines 64–89**: Queries Sentinel Hub Statistical API for past 12 full calendar months using a 1km bounding box around target district center.

```python
91:     evalscript = """
92: //VERSION=3
93: function setup() { return { input: [{ bands: ["B04", "B08", "SCL"] }], output: [...] }; }
103: function evaluatePixel(sample) {
104:   if (sample.SCL >= 8 && sample.SCL <= 10) return { ndvi: [-9999], dataMask: [0] };
105:   let ndvi = (sample.B08 + sample.B04) === 0 ? 0 : (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
106:   return { ndvi: [ndvi], dataMask: [1] };
107: }"""
```
- **Lines 91–107**: EvalScript executing cloud-masking (`SCL 8..10`) and computing per-pixel NDVI across 12 monthly aggregations.

---

### Function 2: `_fetch_real_rainfall_12months` (Lines 164-210)

```python
164: def _fetch_real_rainfall_12months(lat: float, lon: float) -> list:
171:     archive_url = f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date={start_str}&end_date={end_str}&daily=precipitation_sum&timezone=auto"
172:     req = urllib.request.Request(archive_url, headers={"User-Agent": "Mozilla/5.0"})
```
- **Lines 164–172**: Queries Open-Meteo Historical Archive REST API to get daily precipitation totals over the past 365 days.

```python
182:     monthly_precip = [0.0] * 12
183:     for date_str, mm in zip(dates, precip_list):
186:         month_idx = dt.month - 1
187:         monthly_precip[month_idx] += mm
```
- **Lines 182–187**: Groups daily precipitation values by month index (0–11) to sum monthly accumulated rainfall in millimeters.

---

### Function 3: `get_12month_ndvi_weather_trends` (Lines 215-288)

```python
215: def get_12month_ndvi_weather_trends(district: str, crop: str = "Wheat") -> dict:
221:     cache_key = f"trends_{district.strip().lower()}"
224:     if cache_key in cache: return cache[cache_key]
```
- **Lines 215–224**: Primary API controller. Checks `ndvi_cache.json` for 7-day valid district trend payloads before querying external satellite APIs.

```python
242:     return {
243:         "district": district.title(),
244:         "crop": crop,
245:         "months": MONTH_LABELS,
246:         "ndvi_trend": ndvi_series,
247:         "rainfall_mm": rainfall_series,
248:         "peak_ndvi_month": MONTH_LABELS[int(np.argmax(ndvi_series))],
249:         "source": "Sentinel-2 L2A (Statistical API) + Open-Meteo Archive"
250:     }
```
- **Lines 242–250**: Returns formatted 12-month array object consumed directly by `SatelliteTrendChart.jsx` to render SVG satellite curves and rainfall bars.
