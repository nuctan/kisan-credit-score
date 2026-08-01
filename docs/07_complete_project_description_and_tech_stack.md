# Kisan Credit AI — Project Description & Complete Technology Stack

## 📌 Project Overview
**Kisan Credit AI** (*Agricultural Risk & Yield Intelligence Platform*) is an AI-powered agricultural credit assessment and multi-season crop intelligence platform built for Indian farmers and bank credit officers. 

It eliminates subjective paper-based land inspections by combining **Satellite Earth Observation (Sentinel-2 L2A)**, **Machine Learning Yield Scoring (Pandas/NumPy)**, **Multi-Year Crop Succession Planning**, **Government Schemes RAG Engine**, and a **Groq LLaMA 3.3 70B AI Assistant**.

---

## 🛠️ Complete Technology Stack (Layer-by-Layer)

### 1. 🎨 Frontend Layer (Web App & GIS Mapping)
- **Framework:** React 19 + Vite 8
- **Styling:** TailwindCSS v4 (Warm Earthy Palette: `#E8630A` Saffron, `#2D6A4F` Forest Green, `#FFF8F0` Warm Cream)
- **GIS Satellite Mapping:** Leaflet, React-Leaflet, ESRI World Imagery, Sentinel-2 RGB Imagery
- **Spatial Area Math:** Custom Haversine Geodesic Math ($m^2 \to \text{Hectares} \to \text{Bigha}$)
- **Charts & Visualization:** SVG / HTML5 Canvas (12-Month NDVI & Weather Trend Chart)
- **PDF Export Engine:** jsPDF & html2canvas
- **Internationalization (i18n):** Bilingual English ↔ Hindi Engine (`translations.js`)
- **HTTP Client:** Axios

### 2. 🐍 Backend Layer (100% Pure Python Stack)
- **Programming Language:** Python 3.14
- **Web Framework:** FastAPI + Uvicorn ASGI Server
- **Data Validation:** Pydantic v2
- **Authentication:** PyJWT (JSON Web Tokens)
- **Security:** Standard Library `hashlib` & `secrets` (PBKDF2-HMAC-SHA256 with Salt)
- **Middleware:** FastAPI CORSMiddleware

### 3. 🤖 AI, Machine Learning & Telemetry Layer
- **Data Analytics:** Pandas & NumPy
- **Historical Datasets:** Indian Agricultural Yield & Agmarknet Mandi Pricing Datasets (`Crop Yeild Data(1).csv`)
- **Satellite Telemetry:** Sentinel-2 L2A Spectral Band Analysis (B8 NIR & B4 Red for NDVI $\frac{B8-B4}{B8+B4}$)
- **Weather Telemetry:** IMD (India Meteorological Department) Rainfall & Climate Risk Index
- **Soil Intelligence:** Soil Health Card Regional N-P-K Data
- **Multi-Year Succession Engine:** Calculates harvest dates, soil prep windows, and next crop sowing schedules

### 4. 🧠 LLM & RAG Engine Layer
- **LLM Engine:** Groq LLaMA 3.3 70B Versatile Model (`llama-3.3-70b-versatile`)
- **Python RAG Knowledge Base (`schemes_rag.py`):** RAG search over PM-KISAN, KCC, PMFBY, PM-KUSUM, Soil Health Card, SMAM, and Maharashtra Karjmukti Yojna
- **Python SDK:** Groq Python SDK (`groq`)

### 5. 💾 Database & Persistence Layer
- **Cloud Database:** MongoDB Atlas (Cloud NoSQL DB)
- **Local Fallback:** Local MongoDB / Python PyMongo Memory Store
- **Python Driver:** PyMongo 4.x
