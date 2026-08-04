# 📖 KisanAI — Complete Codebase Line-by-Line Technical Understanding Guide

*A Comprehensive, File-by-File Line-by-Line Breakdown of Every Module in Backend & Frontend.*

---

## 📋 Table of Contents
1. [Backend Modules (`ml_service/`)](#1-backend-modules-ml_service)
   - 1.1 `scoring.py` — Telemetry Composite Risk Multiplier
   - 1.2 `data_loader.py` — Yield CSV & Seasonal Mandi Price Prediction
   - 1.3 `ndvi_real.py` — Sentinel-2 L2A Real Satellite API & 7-Day Caching
   - 1.4 `crop_succession.py` — Multi-Year Rotation & Next Sowing Decision Engine
   - 1.5 `schemes_rag.py` — Government Schemes RAG & Keyword Overlap Search
   - 1.6 `imd_service.py` — Weather Telemetry & Open-Meteo Integration
   - 1.7 `trend_analytics.py` — 12-Month District NDVI & Rainfall Curve Engine
   - 1.8 `db.py` — PyMongo Database Connection & In-Memory Fallback Store
   - 1.9 `auth.py` — PBKDF2 Hashing, JWT Authentication & User Profiles
   - 1.10 `main.py` — Python FastAPI ASGI Routing & Groq LLaMA System Prompting
2. [Frontend Core Components (`frontend/src/`)](#2-frontend-core-components-frontend-src)
   - 2.1 `FarmlandMap.jsx` — Leaflet Map, Geodesic Area Calculation & Maharashtra Restriction
   - 2.2 `CalculationBreakdown.jsx` — 4-Step Transparent Math Explanation Card
   - 2.3 `SatelliteTrendChart.jsx` — 12-Month Satellite NDVI & Rainfall SVG Chart
   - 2.4 `Dashboard.jsx` — Main State Orchestrator, Voice Input & Multilingual Selector
3. [Summary of Key Mathematical Formulas](#3-summary-of-key-mathematical-formulas)

---

# 1. Backend Modules (`ml_service/`)

---

## 1.1 `ml_service/scoring.py` (Composite Risk Weighting)
*File Purpose*: Synthesizes real-time satellite vegetation health, weather risks, and soil nutrient density into a single scalar multiplier.

```python
1: from ndvi_real import get_real_ndvi
2: from imd_service import fetch_imd_weather
```
- **Line 1**: Imports `get_real_ndvi` to fetch optical reflectance (NIR/Red) from Sentinel-2.
- **Line 2**: Imports `fetch_imd_weather` to retrieve precipitation & temperature data.

```python
4: def get_ndvi_score(lat: float, lon: float, crop: str) -> dict:
9:     result = get_real_ndvi(lat, lon)
10:    return {
11:        "score": result["score"],
12:        "ndvi": result["ndvi"],
13:        "b04_red": result.get("b04_red", 0),
14:        "b08_nir": result.get("b08_nir", 0),
15:        "description": result["description"],
16:        "source": result.get("source", "Sentinel-2 L2A")
17:    }
```
- **Lines 4–17**: Formats Sentinel-2 telemetry including raw Band 4 (Red), Band 8 (NIR), normalized score, and data source tag.

```python
25: def get_soil_score(state: str, district: str) -> dict:
29:     district_hash = sum(ord(c) for c in district) if district else 50
30:     soil_val = 0.95 + ((district_hash % 15) / 100.0)
```
- **Lines 25–30**: Computes soil score using a deterministic ASCII character checksum bounded between $0.95$ and $1.10$.

```python
37: def calculate_adjusted_revenue(base_revenue: float, ndvi: float, weather: float, soil: float) -> float:
41:     composite_multiplier = (ndvi * 0.45) + (weather * 0.35) + (soil * 0.20)
42:     return round(base_revenue * composite_multiplier, 2)
```
- **Lines 37–42**: **Core Risk Weighting Formula**:
  $$\text{Composite Multiplier} = (0.45 \cdot \text{NDVI}) + (0.35 \cdot \text{Weather}) + (0.20 \cdot \text{Soil})$$
  Multiplies base revenue by this multiplier.

---

## 1.2 `ml_service/data_loader.py` (Mandi Price & Yield Engine)
*File Purpose*: Parses yield CSV datasets and predicts harvest-month mandi prices using seasonal indices.

```python
10: SEASONAL_PRICE_INDEX = {
11:     "Wheat":     [1.15, 1.10, 1.05, 0.88, 0.85, 0.90, 0.92, 0.95, 1.00, 1.05, 1.08, 1.12],
12:     "Rice":      [0.95, 0.98, 1.00, 1.05, 1.08, 1.10, 1.05, 0.90, 0.85, 0.88, 0.92, 0.95],
13:     "Cotton":    [1.00, 1.02, 1.05, 1.08, 1.10, 1.12, 1.05, 0.95, 0.90, 0.88, 0.92, 0.98],
14:     "Sugarcane": [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00],
15:     "Maize":     [1.05, 1.08, 1.10, 1.12, 1.08, 1.00, 0.92, 0.88, 0.90, 0.95, 1.00, 1.03],
16: }
```
- **Lines 10–16**: Contains monthly price multipliers (Jan=0 ... Dec=11) reflecting market supply gluts at harvest.

```python
49: def get_predicted_harvest_price(crop: str, sow_month_idx: int, crop_duration_months: int = None) -> dict:
56:     harvest_month_idx = (sow_month_idx + duration) % 12
57:     harvest_month_name = MONTH_NAMES[harvest_month_idx]
```
- **Lines 49–57**: Calculates the exact harvest month using modulus arithmetic: $t_{\text{harvest}} = (t_{\text{sow}} + d) \bmod 12$.

```python
76:     seasonal_idx = SEASONAL_PRICE_INDEX.get(crop, [1.0] * 12)
77:     multiplier = seasonal_idx[harvest_month_idx]
78:     predicted_price = round(base_price * multiplier, 2)
```
- **Lines 76–78**: Multiplies base historical market price by harvest month seasonal index multiplier.

---

## 1.3 `ml_service/ndvi_real.py` (Sentinel Hub Satellite API & Cache)
*File Purpose*: Interacts with ESA Sentinel Hub API to fetch real Sentinel-2 L2A satellite bands and computes true NDVI.

```python
36: def _cache_key(lat: float, lon: float) -> str:
38:     return f"{round(lat, 2)}_{round(lon, 2)}"
```
- **Lines 36–38**: Rounds GPS coordinates to 2 decimal places to create a ~1km grid cache key.

```python
40: def _get_ndvi_label(ndvi: float) -> str:
41:     if ndvi >= 0.7:
42:         return "Dense, healthy vegetation — Excellent crop health 🌿"
```
- **Lines 40–50**: Translates raw NDVI float value into human-readable agronomic health badges.

```python
65:     age_days = (time.time() - entry.get("timestamp", 0)) / 86400
66:     if age_days < 7:
67:         return entry
```
- **Lines 65–67**: Checks `ndvi_cache.json`; returns cached satellite telemetry if less than 7 days old.

---

## 1.4 `ml_service/crop_succession.py` (Multi-Year Rotation Engine)
*File Purpose*: Computes crop rotation cycles across loan tenure (1–5 years) and recommends nitrogen-fixing succession crops.

```python
28: def get_multiyear_crop_succession_plan(current_crop, area_hectares, current_crop_revenue, loan_tenure_years, start_month_index, current_crop_duration):
46:     first_harvest_month_idx = (start_month_index + current_crop_duration) % 12
57:     "recommended_next_crop": "ग्रीष्मकालीन मूंग दलहन (Summer Mung Bean / Pulses)" if "wheat" in current_crop.lower() else "गेहूं / सरसों (Rabi Wheat/Mustard)",
```
- **Lines 28–60**: Calculates first harvest month and automatically recommends leguminous Mung Beans post-Wheat to naturally restore soil Nitrogen.

```python
145:   total_revenue = sum(c["estimated_revenue_rs"] for c in succession_cycles)
146:   one_year_cap = round(total_revenue * 0.60, 2)
```
- **Lines 145–146**: Sums total combined income across all rotation cycles and applies the **60% Safe Credit Cap (DSCR Rule)**.

---

## 1.5 `ml_service/schemes_rag.py` (Government Schemes RAG)
*File Purpose*: Vector/keyword knowledge database of 7 government schemes (PM-KISAN, KCC, PMFBY, etc.) and keyword scoring search.

```python
90: def query_kisan_schemes(user_query: str = "", crop: str = "", state: str = "Maharashtra", lang: str = "hi"):
95:     query_lower = (user_query + " " + crop + " " + state).lower()
100:    for kw in scheme["keywords"]:
101:        if kw in query_lower:
102:            score += 2
```
- **Lines 90–103**: Computes token overlap relevance score between user query and scheme keywords.

```python
105:    if "maharashtra" in state.lower() and scheme["id"] == "maharashtra_karjmukti":
106:        score += 3
117:    matched_schemes.sort(key=lambda x: x[0], reverse=True)
119:    top_schemes = [item[1] for item in matched_schemes[:4]]
```
- **Lines 105–119**: Applies state-level relevance boosting and extracts top 4 matching scheme objects to inject into LLM prompt.

---

## 1.6 `ml_service/db.py` (Database & Fallback)
*File Purpose*: Establishes MongoDB PyMongo connection and fallback to in-memory dictionary store if database is offline.

```python
14: in_memory_db = {"users": {}, "chats": {}}
28: db_client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
34: except Exception as e:
44:     users_col = None
45:     chats_col = None
```
- **Lines 14–46**: Attempts MongoDB connection with 3-second timeout. If connection fails, falls back cleanly to runtime `in_memory_db` dictionary store so application never crashes.

```python
51: def seed_admin_user():
72:     users_col.insert_one(admin_doc)
```
- **Lines 51–78**: Automatically seeds default admin credentials (`admin` / `admin`) into active storage layer.

---

## 1.7 `ml_service/main.py` (FastAPI Server & Groq System Prompt)
*File Purpose*: Main ASGI server routing requests, executing ML predictions, and assembling system prompts for Groq LLaMA 3.3.

```python
25: app = FastAPI(title="KrishiAI 100% Pure Python Unified Backend")
141: @app.post("/api/ai/chat")
142: def chat_with_ai(req: ChatRequest):
```
- **Lines 25–142**: Instantiates FastAPI app and defines main AI chat route.

```python
157:    system_prompt = f"""You are KrishiAI — an expert Agricultural Risk Assistant...
162:    - Land Area: {area_ha} Hectares
168:    - MAXIMUM SAFE LOAN LIMIT: ₹{pred.get('suggested_loan_limit_rs', 0):,}
171:    [GOVERNMENT KISAN SCHEMES RAG CONTEXT]: {python_rag_text}"""
```
- **Lines 157–178**: Assembles dynamic system prompt combining confirmed farm inputs, ML loan cap, and retrieved RAG scheme facts.

```python
228: @app.post("/api/ai/analyze")
245: base_revenue = req.area_hectares * yield_per_hectare * 10 * price_per_quintal
253: adjusted_revenue = calculate_adjusted_revenue(...)
```
- **Lines 228–253**: Main analysis API route executing historical yield lookup, mandi price prediction, telemetry risk scoring, and succession planning.

---

# 2. Frontend Core Components (`frontend/src/`)

---

## 2.1 `frontend/src/components/FarmlandMap.jsx` (Map & Geodesic Math)
*File Purpose*: Leaflet satellite map component supporting interactive polygon drawing, geodesic surface area calculation, and Maharashtra boundary checks.

```jsx
20: const MAHARASHTRA_BOUNDS = { minLat: 15.60, maxLat: 22.05, minLon: 72.60, maxLon: 80.90 };
27: function isInsideMaharashtra(lat, lon) {
28:   return (lat >= MAHARASHTRA_BOUNDS.minLat && lat <= MAHARASHTRA_BOUNDS.maxLat && lon >= MAHARASHTRA_BOUNDS.minLon && lon <= MAHARASHTRA_BOUNDS.maxLon);
29: }
```
- **Lines 20–34**: Bounding box helper function validating whether GPS coordinates lie within Maharashtra.

```jsx
37: function computePolygonAreaSqMeters(coords) {
44:   for (let i = 0; i < coords.length; i++) {
48:     const lon1 = p1[1] * RAD; const lat1 = p1[0] * RAD;
53:     area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
54:   }
56:   area = (area * EARTH_RADIUS * EARTH_RADIUS) / 4.0;
57:   return Math.abs(area);
58: }
```
- **Lines 37–58**: **Spherical Excess Geodesic Area Formula**:
  $$\text{Area} = \frac{R^2}{4} \sum_{i=1}^{n} (\lambda_{i+1} - \lambda_i) (2 + \sin\phi_i + \sin\phi_{i+1})$$
  Computes precise ground area in square meters, converted to Hectares (÷ 10,000) and Bigha (× 3.95).

```jsx
145: const handleConfirm = () => {
147:   const isOutside = polygonPoints.some(pt => !isInsideMaharashtra(pt[0], pt[1])) || !isInsideMaharashtra(pos[0], pos[1]);
148:   if (isOutside) {
149:     alert('ℹ️ We are currently working on expanding our ML calculation model to your state! Right now, complete satellite valuation models are active for Maharashtra.');
150:     return;
151:   }
```
- **Lines 145–152**: Allows drawing polygons anywhere on map, but displays friendly state expansion notice when land outside Maharashtra is submitted for ML calculation.

---

## 2.2 `frontend/src/components/CalculationBreakdown.jsx` (4-Step Math Transparency)
*File Purpose*: Displays transparent 4-step mathematical breakdown card explaining how loan eligibility was calculated.

- **Step 1 (Base Revenue)**: $\text{Area (Ha)} \times \text{Yield (T/Ha)} \times 10 \times \text{Predicted Mandi Price (₹/Q)}$
- **Step 2 (Telemetry Adjustment)**: $\text{Base Rev} \times \Big[ (0.45\cdot\text{NDVI}) + (0.35\cdot\text{Weather}) + (0.20\cdot\text{Soil}) \Big]$
- **Step 3 (Multi-Year Succession)**: Sums projected revenues of all rotation crop cycles across loan tenure.
- **Step 4 (60% Safe Credit Cap)**: $\text{Total Combined Income} \times 0.60$ (DSCR Rule).

---

## 2.3 `frontend/src/pages/Dashboard.jsx` (Main Orchestrator & Voice Input)

```jsx
67: const [lang, setLang] = useState('hi');
68: const [chatLang, setChatLang] = useState('hi');
69: const [isListening, setIsListening] = useState(false);
```
- **Lines 67–69**: Maintains global project language state (`lang`: English/Hindi toggle) and chatbot voice language state (`chatLang`: 5 regional languages).

```jsx
326: {/* Project Language Switcher Toggle (Hindi / English only) */}
330: <button onClick={() => setLang('hi')}>🇮🇳 हिंदी</button>
340: <button onClick={() => setLang('en')}>🇬🇧 English</button>
```
- **Lines 326–340**: Main navbar toggle restricting project-wide UI to Hindi and English.

```jsx
526: {/* Chatbot Specific 5-Language Selector */}
530: <select value={chatLang} onChange={e => setChatLang(e.target.value)}>
531:   <option value="hi">🇮🇳 हिंदी</option>
532:   <option value="en">🇬🇧 English</option>
533:   <option value="mr">🚩 मराठी</option>
534:   <option value="gu">🦁 ગુજરાતી</option>
535:   <option value="ta">🏛️ தமிழ்</option>
536: </select>
```
- **Lines 526–536**: Chatbot header language selector supporting 5 regional languages.

```jsx
595: const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
602: const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
608: const langCodes = { hi: 'hi-IN', en: 'en-US', mr: 'mr-IN', gu: 'gu-IN', ta: 'ta-IN' };
609: recognition.lang = langCodes[chatLang] || 'hi-IN';
621: recognition.start();
```
- **Lines 595–621**: Web Speech API voice input logic with explicit `getUserMedia` audio permission request.

---

# 3. Summary of Key Mathematical Formulas

| Mathematical Concept | Formula | Code File & Location |
|---|---|---|
| **Geodesic Surface Area** | $\text{Area} = \frac{R^2}{4} \sum_{i=1}^{n} (\lambda_{i+1} - \lambda_i)(2 + \sin\phi_i + \sin\phi_{i+1})$ | `FarmlandMap.jsx` line 37 |
| **NDVI Index** | $\text{NDVI} = \frac{B_{08}\text{(NIR)} - B_{04}\text{(Red)}}{B_{08}\text{(NIR)} + B_{04}\text{(Red)}}$ | `ndvi_real.py` line 12 |
| **Harvest Month Modulus** | $t_{\text{harvest}} = (t_{\text{sow}} + \text{duration}) \bmod 12$ | `data_loader.py` line 56 |
| **Predicted Harvest Price** | $\text{Price}_{\text{pred}} = \text{Base Price} \times I_{\text{seasonal}}[C, t_{\text{harvest}}]$ | `data_loader.py` line 78 |
| **Base Revenue (₹)** | $\text{Area (Ha)} \times \text{Yield (T/Ha)} \times 10 \times \text{Price}_{\text{pred}}$ | `main.py` line 245 |
| **Telemetry Risk Multiplier** | $M_{\text{Risk}} = (0.45\cdot\text{NDVI}) + (0.35\cdot\text{Weather}) + (0.20\cdot\text{Soil})$ | `scoring.py` line 41 |
| **60% Safe Credit Limit Cap** | $\text{Loan Cap} = \left(\sum_{i=1}^{\text{Cycles}} \text{Revenue}_i \right) \times 0.60$ | `crop_succession.py` line 146 |
| **RAG Keyword Overlap Score** | $\text{Score}(Q, D_i) = | \text{Tokens}(Q) \cap \text{Keywords}(D_i) |$ | `schemes_rag.py` line 101 |
