# 📋 KisanAI — Changelog & Updates Breakdown

> **Project**: KisanAI — AI-Powered Agricultural Credit Scoring System  
> **Team**: Tanishq Kanthed (nuctan) · Akshat Srivastava (akshat647) · Radhika Yadav (Radhikaydv-git)  
> **Repository**: https://github.com/nuctan/kisan-credit-score  
> Last Updated: August 2026

---

## 🔖 Version History

---

### ✅ v3.0 — Cloud & Production Release *(August 2026)*
**Contributors**: Tanishq Kanthed, Akshat Srivastava, Radhika Yadav

#### 🗄️ Database
- Connected **MongoDB Atlas** cloud cluster (`cluster0.4mhnecz.mongodb.net`) for persistent user and chat storage
- Auto-fallback to **in-memory Python dictionary store** when Atlas is unreachable (zero-dependency execution)
- Auto-seeds default `admin/admin` user on every startup
- Farm profile (district, crop, area, loan limit) saved to Atlas on every Analyze click

#### 🤖 ML & Backend
- Integrated **Scikit-Learn Ridge Regression** model trained on AGMARKNET monthly wheat mandi prices
- Harvest-month price prediction: harvest_month = (sow_month + duration) mod 12
- Seasonal price indexing combined with Ridge trend to improve prediction accuracy
- Crop yield data sourced from **DES Ministry of Agriculture** (`Crop Yeild Data(1).csv`)
- Mandi price data sourced from **AGMARKNET** (`monthy wheat , mandi price.csv`)

#### 🔐 Security
- Replaced exposed Groq API key in setup guides with `your_groq_api_key_here` placeholder
- Added `.env.example` template for safe onboarding of new contributors

#### 📚 Docs
- Updated **Chapter 10: Future Scope** with 6-point technical evolution roadmap:
  1. Semantic Vector Embedding RAG (ChromaDB / Qdrant)
  2. Real-Time streaming agricultural data integration
  3. Multi-Spectral Indexing — EVI + NDWI alongside NDVI
  4. End-to-End supervised ML Risk Model (XGBoost)
  5. SHAP / LIME model explainability
  6. Kubernetes + Redis + Prometheus enterprise deployment
- Added `TEAM.md` with all 3 contributor names and roles

---

### ✅ v2.5 — Academic Report & Presentation *(July–August 2026)*
**Contributor**: Tanishq Kanthed

#### 📄 Project Report (`docs/PROJECT_REPORT.docx` / `.doc` / `.md`)
- 25-page academic report following CDAC formatting guidelines
- Front cover with **KisanAI logo** embedded
- Blank signature blocks for Project Guide and HOD
- Every chapter starts on a new page (page breaks)
- Page numbers on every page
- Exported in both `.docx` and `.doc` formats

#### 📊 Presentation (`docs/KISAN_AI_PRESENTATION.pptx`)
- 10-slide 16:9 widescreen PowerPoint presentation
- Covers: Problem Statement, Solution, Architecture, ML Model, NDVI, RAG, Datasets, Results, Future Scope
- JSON slide schema: `docs/PRESENTATION_SLIDES.json`

#### 🔬 Research Paper Citations (`docs/RESEARCH_PAPER_YIELD_FORMULA.md`)
| Paper | Usage in KisanAI |
|---|---|
| Monteith RUE Model (1977) | 45% NDVI weight |
| FAO-56 Allen et al. (1998) | 35% IMD weather weight |
| Saaty AHP (1980) | Normalized weight vector [0.45, 0.35, 0.20] |

---

### ✅ v2.0 — ML Model & Satellite Integration *(July 2026)*
**Contributors**: Tanishq Kanthed, Akshat Srivastava

#### 🛰️ Satellite & Remote Sensing
- Real **Sentinel-2 NDVI** via Sentinel Hub Process API with 7-day cache
- 12-month NDVI trend analytics with SVG curve visualization
- Real rainfall data from **Open-Meteo Archive API** (IMD fallback)
- Auto-pan map to selected district coordinates

#### 📐 Credit Scoring Formula
| Component | Weight | Source |
|---|---|---|
| NDVI Score | 45% | Monteith (1977) |
| Weather Score | 35% | FAO-56 (1998) |
| Soil Score | 20% | Saaty AHP (1980) |

- **Base Revenue** = Area (Ha) x Yield (T/Ha) x 10 x ML Predicted Harvest Price
- **Adjusted Revenue** = Base Revenue x (0.45 x NDVI + 0.35 x Weather + 0.20 x Soil)
- **Safe Credit Cap** = Total Tenure Revenue x 0.60 (DSCR Rule)

#### 🌾 Crop Succession Engine
- 1-year and multi-year loan cycle crop rotation planner
- Auto-recommends next crop based on harvest month
- Supported crops: Wheat, Rice, Cotton, Sugarcane, Maize

---

### ✅ v1.5 — AI Chatbot & RAG Engine *(July 2026)*
**Contributor**: Tanishq Kanthed

#### 🤖 AI Chatbot
- **Groq LLaMA 3.3 70B** via Groq LPU API
- Bilingual system prompts (Hindi + English)
- Dynamic context injection: crop, district, area, ML loan cap
- No markdown asterisks in output (clean plain text)
- Typing indicator with bouncing dots animation

#### 📖 RAG (Retrieval-Augmented Generation)
- Keyword token scoring over 7 government schemes:
  1. PM-KISAN
  2. Kisan Credit Card (KCC)
  3. PMFBY (Crop Insurance)
  4. PM-KUSUM (Solar Pump)
  5. Soil Health Card
  6. SMAM (Farm Machinery)
  7. Karjmukti Yojana

---

### ✅ v1.0 — Full Stack Foundation *(June–July 2026)*
**Contributors**: Tanishq Kanthed, Radhika Yadav

#### 🏗️ Backend (Python FastAPI)
- 100% Pure Python stack — FastAPI + PyMongo + PyJWT
- JWT-based authentication (register / login / profile)
- Endpoints: `/api/ai/chat`, `/api/ai/analyze`, `/api/auth/*`, `/api/ndvi-weather-trends`, `/api/kisan-schemes`

#### 🎨 Frontend (React + Vite)
- Warm Indian agricultural theme — Saffron `#E8630A`, Forest Green `#2D6A4F`, Golden `#D4A017`
- Google Font: Noto Sans Devanagari for Hindi text support
- Hindi-primary bilingual UI with EN/HI language toggle
- Animated AI chat with user (saffron) and AI (green) message bubbles
- Interactive Leaflet.js satellite map with polygon land area measurement
- Components: FarmlandMap, LandAnalysisCard, FinancialRevenueCard, CalculationBreakdown, PDFReportButton, SatelliteTrendChart

#### 🚀 Launcher Scripts
- `start.sh` — One-command Linux/Mac launcher
- `start.bat` — One-command Windows launcher

---

## 📁 Key Files Reference

| File | Purpose |
|---|---|
| `ml_service/main.py` | FastAPI app — all API endpoints |
| `ml_service/data_loader.py` | Ridge Regression ML + mandi price prediction |
| `ml_service/scoring.py` | AHP-weighted credit scoring engine |
| `ml_service/ndvi_real.py` | Sentinel-2 NDVI via Sentinel Hub API |
| `ml_service/schemes_rag.py` | Government schemes RAG keyword engine |
| `ml_service/crop_succession.py` | Multi-year crop rotation planner |
| `ml_service/db.py` | MongoDB Atlas + in-memory fallback |
| `ml_service/auth.py` | JWT auth — register, login, profile |
| `frontend/src/pages/Dashboard.jsx` | Main dashboard — form, map, chat |
| `frontend/src/components/FarmlandMap.jsx` | Interactive satellite map |
| `docs/PROJECT_REPORT.docx` | 25-page academic report |
| `docs/KISAN_AI_PRESENTATION.pptx` | 10-slide presentation |
| `docs/RESEARCH_PAPER_YIELD_FORMULA.md` | Research citations |
| `docs/DATASETS_AND_SOURCES.md` | All datasets and official sources |

---

## 🔮 Upcoming (Future Scope)

- [ ] Semantic RAG with vector embeddings (BGE-M3 / ChromaDB)
- [ ] Live APMC mandi price streaming API
- [ ] EVI + NDWI multi-spectral vegetation indexing
- [ ] XGBoost supervised loan default prediction model
- [ ] SHAP feature importance explainability dashboard
- [ ] Kubernetes + Redis + Prometheus production deployment
