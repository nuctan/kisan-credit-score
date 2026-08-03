# Document 2: Map, GIS & Satellite Remote Sensing

---

## 2.1 Three Technologies — Three Different Jobs

Most people think the map is "one thing." It is actually **three completely separate systems**:

```
┌─────────────────────────────────────────────────────┐
│                  What the Farmer Sees                │
│                                                     │
│   ┌─────────────────────────────────────────────┐   │
│   │   Leaflet (Map Engine)                      │   │
│   │   - Makes the map interactive               │   │
│   │   - Handles zoom, pan, drag                 │   │
│   │   - Draws polygon on top                    │   │
│   │   - Calculates field area in Hectares       │   │
│   │                                             │   │
│   │   Inside Leaflet, the images come from:     │   │
│   │   → Esri World Imagery (satellite photos)  │   │
│   │   → OpenStreetMap (street map option)      │   │
│   └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘

After farmer clicks "Analyze Land":

┌─────────────────────────────────────────────────────┐
│              Python Backend (Invisible)              │
│                                                     │
│   GPS coordinates → Sentinel Hub API                │
│   → Sentinel-2 satellite scans invisible NIR light  │
│   → NDVI formula applied → health score returned    │
└─────────────────────────────────────────────────────┘
```

---

## 2.2 Leaflet — The Map Engine

**What it is:** An open-source JavaScript library that creates interactive maps inside web browsers. It is the most widely used mapping library in the world (used by Wikipedia, Craigslist, GitHub).

**What it does in KisanAI:**
- Renders the satellite image tiles from Esri as a seamless, pannable map
- Lets the farmer click on the map to place points around their field (polygon)
- Draws the orange polygon boundary on top of the satellite image
- Calculates the exact field area using spherical geometry

**File:** `frontend/src/components/FarmlandMap.jsx`

**How it is set up:**
```jsx
// Two tile sources — farmer can toggle between them
const tileUrl = mapType === 'satellite'
  ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
```

**No API key needed. No payment required. Free forever.**

---

## 2.3 Esri World Imagery — The Satellite Photos

**What it is:** Esri (a GIS company) provides free satellite photograph tiles through their ArcGIS REST API. These are actual satellite and aerial photos stitched together into a global map.

**Resolution:** Sub-meter to 1–2 meter resolution over India (much clearer than what a normal camera phone could see).

**Why not Google Maps?**
- Google Maps API requires a credit card and billing account
- After ₹14,000/month free quota, every 1,000 map loads costs money
- Esri World Imagery: **completely free, no limits, no account needed**

---

## 2.4 Sentinel-2 Satellite — The Scientific Scanner

**What it is:** Two satellites (Sentinel-2A and Sentinel-2B) launched by the European Space Agency (ESA) as part of the Copernicus programme. They orbit Earth at 786 km altitude.

**Key facts:**
- Revisits every point on Earth every **5 days**
- **10-meter resolution** — can distinguish individual farm plots
- Captures **13 spectral bands** including invisible Near-Infrared (NIR) light
- **Free to use** — publicly funded by EU taxpayers, open access for all

**Why NIR matters for agriculture:**
- Plants absorb Red light (Band 4, ~665 nm) for photosynthesis (chlorophyll)
- Plants reflect Near-Infrared light (Band 8, ~842 nm) to prevent overheating
- A healthy crop absorbs lots of Red → NDVI high
- A stressed/dead crop reflects Red same as NIR → NDVI near zero

**Data Level used: L2A (Level-2A)**
- "L2A" means the raw satellite data has been processed to remove atmospheric interference
- Clouds, aerosols, and water vapour are corrected using the Sen2Cor processor
- We get true **Bottom-of-Atmosphere (BOA) reflectance** — the actual surface value

---

## 2.5 Sentinel Hub — The API Gateway

**What it is:** A commercial platform (by Sinergise, Slovenia) that provides programmatic access to ESA Sentinel satellite data through a REST API.

**What we use it for:**
1. **Real-time NDVI** — for the farmer's exact GPS coordinates (in `ndvi_real.py`)
2. **12-Month Historical NDVI trends** — district-level monthly averages (in `trend_analytics.py`)

**Authentication:** OAuth2 client credentials flow using `SENTINELHUB_CLIENT_ID` and `SENTINELHUB_CLIENT_SECRET` stored in `ml_service/.env`

**Fallback:** If Sentinel Hub API is unavailable (offline/cloudy/rate-limited), the system uses a **deterministic mathematical estimate** based on latitude/season, so the app never crashes.

---

## 2.6 The NDVI Formula — Explained Simply

**NDVI = Normalized Difference Vegetation Index**

It is a number between -1 and +1 that measures how green and healthy vegetation is, derived purely from satellite light measurements.

$$\text{NDVI} = \frac{B_8 \text{ (NIR)} - B_4 \text{ (Red)}}{B_8 \text{ (NIR)} + B_4 \text{ (Red)}}$$

From code (`ndvi_real.py` + `scoring.py`):
```python
# Band values fetched from Sentinel Hub
b8_nir  = 0.45   # example: how much NIR the crop reflects
b4_red  = 0.09   # example: how much Red the crop reflects (low = absorbed)

ndvi = (b8_nir - b4_red) / (b8_nir + b4_red)
# ndvi = (0.45 - 0.09) / (0.45 + 0.09) = 0.36 / 0.54 = 0.67
```

**Interpreting NDVI scores:**

| NDVI Score | What It Means | Crop Condition | Credit Impact |
|---|---|---|---|
| 0.70 – 1.00 | Dense, healthy vegetation 🌿 | Excellent crop | Maximum score |
| 0.50 – 0.70 | Good vegetation cover 🌱 | Healthy growth | High score |
| 0.30 – 0.50 | Moderate vegetation 🌾 | Needs attention | Medium score |
| 0.10 – 0.30 | Sparse vegetation 🟡 | Early stage or thin | Reduced score |
| 0.00 – 0.10 | Bare / fallow land 🟤 | No active crop | Minimum score |
| Negative | Water, cloud, or snow | N/A | Not applicable |

**Two NDVI scores in the dashboard — what is the difference?**

| Location | Source | What It Measures |
|---|---|---|
| Land & Telemetry Report | Today's Sentinel-2 pass, exact farm GPS | Your farm right now |
| 12-Month Satellite Chart | Sentinel Hub Statistical API, district average | Historical seasonal pattern |

They are **different measurements** and both are useful.

---

## 2.7 Field Area Calculation — The Geodesic Formula

When the farmer draws their polygon on the map, we cannot use simple school geometry (length × width) because the **Earth is round**, not flat. Even for a 2-hectare farm, ignoring Earth's curvature introduces a small but meaningful error.

We use the **Spherical Excess formula** from geodesy:

$$\text{Area} = \frac{R^2}{4} \sum_{i=0}^{n-1} (\lambda_{i+1} - \lambda_i)(2 + \sin\phi_i + \sin\phi_{i+1})$$

Where:
- $R = 6{,}378{,}137$ meters (Earth's mean radius)
- $\lambda$ = longitude in radians
- $\phi$ = latitude in radians

From code (`FarmlandMap.jsx`):
```js
function computePolygonAreaSqMeters(coords) {
  const RAD = Math.PI / 180;
  const EARTH_RADIUS = 6378137;
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % coords.length];
    area += (p2[1] - p1[1]) * RAD
          * (2 + Math.sin(p1[0] * RAD) + Math.sin(p2[0] * RAD));
  }
  area = (area * EARTH_RADIUS * EARTH_RADIUS) / 4.0;
  return Math.abs(area);  // in square meters
}

// Convert to units:
const hectares = areaSqMeters / 10000;
const bigha    = hectares * 3.95;
```

---

## 2.8 NDVI Caching (Smart Cost Management)

Calling Sentinel Hub API for every request is expensive and slow. We cache results:

```python
# ndvi_real.py — Cache key rounds GPS to ~1km grid
def _cache_key(lat, lon):
    return f"{round(lat, 2)}_{round(lon, 2)}"

# Valid for 7 days — crop health doesn't change daily
if age_days < 7:
    return cached_result  # instant response
```

Cache is stored in `ml_service/ndvi_cache.json`.
