# Document 1: Project Overview

## 1.1 The Problem
Indian farmers — especially small and marginal ones — face two major problems with bank loans:

1. **Banks reject them** because farmers have no formal credit history
2. **Banks over-lend** based on inaccurate land assessments, pushing farmers into debt traps

Traditional bank process:
- A field officer physically visits the farm
- He estimates the crop, land area, and projected yield
- This is **slow** (weeks), **expensive** (₹5,000–10,000 per visit), and **subjective** (different officers give different results)

## 1.2 What KisanAI Does
KisanAI replaces the physical inspection with a **mathematical, satellite-verified process**:

```
Farmer enters details on phone
        ↓
Draws farm boundary on satellite map (auto-calculates Hectares)
        ↓
Python backend fetches real satellite data for that exact location
        ↓
ML engine computes adjusted revenue across multiple crop seasons
        ↓
60% safe credit cap formula gives the exact maximum loan amount
        ↓
AI chatbot explains everything and answers government scheme questions
```

Result: Any farmer can get a precise, data-backed loan eligibility report in **under 30 seconds**, from anywhere, on any phone browser.

---

## 1.3 Who Did What (Team Contributions)

### Nuctan (Tanishq) — Frontend, GIS, Dashboard, Documentation
**Files owned:**
- `frontend/src/pages/Dashboard.jsx` — Main unified dashboard page
- `frontend/src/pages/LandingPage.jsx` — Bilingual landing page
- `frontend/src/components/FarmlandMap.jsx` — Leaflet interactive satellite map
- `frontend/src/components/SatelliteTrendChart.jsx` — 12-month NDVI + rainfall chart
- `frontend/src/components/LandAnalysisCard.jsx` — Telemetry result card
- `frontend/src/components/CalculationBreakdown.jsx` — 4-step math breakdown card
- `frontend/src/components/FullLandReport.jsx` — Multi-year succession report
- `frontend/src/components/FinancialRevenueCard.jsx` — Safe credit cap card
- `frontend/src/utils/translations.js` — Full Hindi/English translation system
- `docs/` — All 5 documentation files

**Key features built:**
- Interactive polygon drawing on satellite map with auto area calculation
- Bilingual EN/HI language toggle across all 15+ components
- 12-month NDVI trend chart with NDVI health badge
- Harvest-month mandi price prediction display
- Multi-year crop succession timeline UI
- Complete documentation

---

### Akshat — Satellite Pipeline, Backend Architecture
**Files owned:**
- `ml_service/ndvi_real.py` — Real Sentinel-2 NDVI API integration
- `ml_service/trend_analytics.py` — 12-month NDVI + rainfall trend engine
- `ml_service/schemes_rag.py` — Government schemes RAG engine
- `ml_service/crop_succession.py` — Multi-year crop succession calculator
- `ml_service/auth.py` — Authentication system

**Key features built:**
- Real Sentinel-2 L2A NDVI via Sentinel Hub API with 7-day caching
- 12-month district-level NDVI + Open-Meteo rainfall analytics
- Government Kisan Schemes knowledge base and RAG retrieval
- Full Python FastAPI backend migration from Node.js

---

### Radhika — ML Formulas, Credit Scoring, Weather, DevOps
**Files owned:**
- `ml_service/scoring.py` — Risk weighting formula (45/35/20)
- `ml_service/data_loader.py` — CSV datasets + seasonal price forecasting
- `ml_service/imd_service.py` — IMD weather data integration
- `ml_service/main.py` — FastAPI server + Groq LLaMA chat endpoint
- `ml_service/db.py` — MongoDB + fallback database layer

**Key features built:**
- Composite risk multiplier formula (NDVI 45% + Weather 35% + Soil 20%)
- Seasonal harvest-month mandi price prediction model
- Groq LLaMA 3.3 70B AI chatbot with Hindi/English system prompt
- Security cleanup (removed hardcoded secrets, .env.example)
- MongoDB user/profile persistence with in-memory fallback

---

## 1.4 Technology Choices at a Glance

| Requirement | Technology Chosen | Why Not Alternative |
|---|---|---|
| Interactive map | Leaflet (free, open-source) | Google Maps = requires billing credit card |
| Satellite imagery | Esri World Imagery (free tiles) | Google Satellite = paid API |
| Crop health analysis | Sentinel Hub + Sentinel-2 | Landsat = lower resolution (30m vs 10m) |
| AI chatbot | Groq LLaMA 3.3 70B | OpenAI GPT-4 = costs money per token |
| Backend | Python FastAPI | Node.js = can't run ML code directly |
| Database | MongoDB | SQL = rigid schema, bad for nested farm docs |
| UI Framework | React 18 + Vite | Next.js = overkill for single-page dashboard |

---

## 1.5 States Currently Supported
- **Maharashtra only** (36 districts, with GPS coordinates for map auto-centering)

## 1.6 Crops Supported

| Crop | Duration | Typical Sow Month |
|---|---|---|
| Wheat | 4 months | November |
| Rice / Paddy | 5 months | June |
| Cotton | 6 months | June |
| Sugarcane | 12 months | February |
| Maize | 3 months | June |
