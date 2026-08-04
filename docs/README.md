# KisanAI — Master Learning & Reading Roadmap (Ordered Guide)

> **Interview & Presentation Preparation Guide**: Read these documents in exact sequential order (from Step 1 to Step 4) to master the complete project from theory to line-by-line code logic.

---

## 📌 PHASE 1: High-Level Concepts & Project Fundamentals (Read First)

Start here to understand the problem, business logic, map technology, scoring formulas, and architecture.

| Order | Document | Purpose & Key Topics |
|:---:|---|---|
| **01** | 📄 **[01_PROJECT_OVERVIEW.md](./01_PROJECT_OVERVIEW.md)** | Mission statement, financial inclusion problem, individual team member roles (Tanishq, Akshat, Radhika), and tech stack rationale. |
| **02** | 📄 **[02_MAP_AND_SATELLITE.md](./02_MAP_AND_SATELLITE.md)** | Mapping stack: Leaflet vs Esri vs Sentinel Hub. Explanation of NDVI formula ($(B_{08} - B_{04})/(B_{08} + B_{04})$) and Spherical Excess area math. |
| **03** | 📄 **[03_CREDIT_SCORING_ENGINE.md](./03_CREDIT_SCORING_ENGINE.md)** | The 4-step financial loan formula: Base Revenue $\rightarrow$ Telemetry Risk Adjustment ($0.45\cdot\text{NDVI} + 0.35\cdot\text{Weather} + 0.20\cdot\text{Soil}$) $\rightarrow$ Multi-Year Succession $\rightarrow$ 60% DSCR Safe Cap. |
| **04** | 📄 **[04_AI_CHATBOT_AND_RAG.md](./04_AI_CHATBOT_AND_RAG.md)** | Groq LLaMA 3.3 70B AI Chatbot, Python RAG keyword search engine, 7 government schemes knowledge base, and prompt grounding. |
| **05** | 📄 **[05_TECH_STACK_AND_ARCHITECTURE.md](./05_TECH_STACK_AND_ARCHITECTURE.md)** | Complete System Architecture Diagram, MongoDB vs In-Memory Fallback, Web Mercator XYZ Tile formula, and installation guides. |

---

## 🐍 PHASE 2: Backend Python Code Breakdown (Read Second)

Read these in order to understand how data flows through the FastAPI microservice (`ml_service/`).

| Order | Document | File Analyzed | Key Functions & Concepts |
|:---:|---|---|---|
| **06** | 📄 **[CODE_BREAKDOWN_SCORING_PY.md](./CODE_BREAKDOWN_SCORING_PY.md)** | `ml_service/scoring.py` | Composite risk multiplier formula ($(0.45\cdot\text{NDVI}) + (0.35\cdot\text{Weather}) + (0.20\cdot\text{Soil})$) & soil hashing. |
| **07** | 📄 **[CODE_BREAKDOWN_DATA_LOADER_PY.md](./CODE_BREAKDOWN_DATA_LOADER_PY.md)** | `ml_service/data_loader.py` | Historical yield CSV parsing & seasonal harvest-month price prediction ($t_{\text{harvest}} = (t_{\text{sow}} + d) \bmod 12$). |
| **08** | 📄 **[CODE_BREAKDOWN_NDVI_REAL_PY.md](./CODE_BREAKDOWN_NDVI_REAL_PY.md)** | `ml_service/ndvi_real.py` | Sentinel Hub API v3 integration, EvalScript cloud masking `SCL`, raw NDVI calculation, and 7-day JSON caching. |
| **09** | 📄 **[CODE_BREAKDOWN_CROP_SUCCESSION_PY.md](./CODE_BREAKDOWN_CROP_SUCCESSION_PY.md)** | `ml_service/crop_succession.py` | Multi-season agronomic rotation, nitrogen-fixing legume recommendations post-Wheat, and the 60% DSCR Safe Credit Cap. |
| **10** | 📄 **[CODE_BREAKDOWN_SCHEMES_RAG_PY.md](./CODE_BREAKDOWN_SCHEMES_RAG_PY.md)** | `ml_service/schemes_rag.py` | 7 government scheme metadata vector store, token overlap relevance scoring algorithm, and top-4 prompt injection. |
| **11** | 📄 **[CODE_BREAKDOWN_IMD_SERVICE_PY.md](./CODE_BREAKDOWN_IMD_SERVICE_PY.md)** | `ml_service/imd_service.py` | IMD weather API, Open-Meteo REST API fallback, and precipitation risk scoring. |
| **12** | 📄 **[CODE_BREAKDOWN_TREND_ANALYTICS_PY.md](./CODE_BREAKDOWN_TREND_ANALYTICS_PY.md)** | `ml_service/trend_analytics.py` | Sentinel Hub Statistical API 12-month aggregation & Open-Meteo Archive historical rainfall curve builder. |
| **13** | 📄 **[CODE_BREAKDOWN_DB_PY.md](./CODE_BREAKDOWN_DB_PY.md)** | `ml_service/db.py` | PyMongo client initialization, 3s connection timeout, Atlas/local fallback to Python in-memory dictionary, and admin auto-seeding. |
| **14** | 📄 **[CODE_BREAKDOWN_AUTH_PY.md](./CODE_BREAKDOWN_AUTH_PY.md)** | `ml_service/auth.py` | PBKDF2-HMAC-SHA256 password hashing with salt (100,000 iterations), 30-day JWT encoding/decoding, and user profiles. |
| **15** | 📄 **[CODE_BREAKDOWN_MAIN_PY.md](./CODE_BREAKDOWN_MAIN_PY.md)** | `ml_service/main.py` | FastAPI ASGI server bootstrap, CORS middleware, `/api/ai/analyze` route, and dynamic Groq LLaMA 3.3 70B prompt assembly. |

---

## ⚛️ PHASE 3: Frontend React Code Breakdown (Read Third)

Read these to understand how the React components render interactive maps, SVG charts, and voice input.

| Order | Document | File Analyzed | Key Components & Concepts |
|:---:|---|---|---|
| **16** | 📄 **[CODE_BREAKDOWN_FARMLAND_MAP_JSX.md](./CODE_BREAKDOWN_FARMLAND_MAP_JSX.md)** | `FarmlandMap.jsx` | React-Leaflet GIS map, Esri World Imagery tiles, Spherical Excess Geodesic surface area formula, and Maharashtra restriction validation. |
| **17** | 📄 **[CODE_BREAKDOWN_CALCULATION_BREAKDOWN_JSX.md](./CODE_BREAKDOWN_CALCULATION_BREAKDOWN_JSX.md)** | `CalculationBreakdown.jsx` | 4-Step transparent mathematical breakdown UI card explaining how loan cap was computed. |
| **18** | 📄 **[CODE_BREAKDOWN_SATELLITE_TREND_CHART_JSX.md](./CODE_BREAKDOWN_SATELLITE_TREND_CHART_JSX.md)** | `SatelliteTrendChart.jsx` | Dual-axis interactive SVG chart renderer (NDVI polyline + rainfall rect bars). |
| **19** | 📄 **[CODE_BREAKDOWN_DASHBOARD_JSX.md](./CODE_BREAKDOWN_DASHBOARD_JSX.md)** | `Dashboard.jsx` | Main single-page controller, global language state (`lang`), chatbot language selector (`chatLang`), and Web Speech API `getUserMedia` microphone logic. |

---

## 🎓 PHASE 4: College Presentation & Defense Preparation (Read Last)

Read these final documents to prepare for your viva, synopsis defense, and spiral-bound project report submission.

| Order | Document | Purpose & Contents |
|:---:|---|---|
| **20** | 📄 **[PROJECT_REPORT.md](./PROJECT_REPORT.md)** | **Complete Academic Project Report** formatted line-by-line to match CDAC PDF standards (Title Page, Certificate, Abstract, Acknowledgement, Chapters 1–9, References). |
| **21** | 📊 **[PRESENTATION_SLIDES.json](./PRESENTATION_SLIDES.json)** | **10-Slide PPT Presentation Schema** formatted for 5–10 minute synopsis presentation (Problem, Objectives, Methodology, Math, Future Scope, Conclusion). |

---

### 💡 Quick Summary Checklist for Interview / Viva

- **Map Engine**: Leaflet.js (Engine) + Esri World Imagery (Tiles) $\rightarrow$ *100% Free, zero Google API billing*.
- **Satellite Health (NDVI)**: Computed from Sentinel-2 L2A Band 8 (NIR) & Band 4 (Red): $\text{NDVI} = (B_{08} - B_{04}) / (B_{08} + B_{04})$.
- **Area Calculation**: Uses **Spherical Excess Geodesic Math** on Earth's curved surface: $\text{Area} = (R^2/4) \sum (\Delta\lambda)(2 + \sin\phi_1 + \sin\phi_2)$.
- **Risk Weighting**: $0.45 \cdot \text{NDVI} + 0.35 \cdot \text{Weather} + 0.20 \cdot \text{Soil}$.
- **Seasonal Price Model**: Forecasts price at harvest month: $t_{\text{harvest}} = (t_{\text{sow}} + d) \bmod 12$.
- **Credit Limit Safety**: Capped at **60% of total multi-season revenue** (DSCR corporate solvency rule).
- **AI Chatbot**: Meta LLaMA 3.3 70B on Groq LPU + RAG grounding over 7 government schemes.
- **Voice Support**: Web Speech API with explicit `getUserMedia` microphone permission handling in 5 regional languages.
