# 🌾 Kisan Credit AI: Agricultural Risk & Yield Intelligence (Phase 3 Release)

**Kisan Credit AI** is an end-to-end, AI-powered agricultural credit assessment and crop intelligence platform designed specifically for Indian farmers (*Kisans*). The platform leverages satellite imagery (Sentinel-2), historical crop yield datasets, real-time meteorological data (IMD), and modern LLM capabilities to accurately project crop revenue and evaluate loan repayment capacities.

---

## 🚀 Key Features (Phase 3 Release)

### 🗺️ 1. Sentinel-2 Interactive Farmland Map
- **High-Resolution Satellite View:** Powered by Leaflet & Esri World Imagery tile layers.
- **GPS Coordinates Picker:** Farmers can click/tap directly on the map to select their farmland boundaries.

### ⛅ 2. Live IMD Weather Integration (`imd_service.py`)
- **IMD Telemetry:** Connects to `/api/v1/cityforecastloc` to fetch 7-day temperature forecasts and 24-hr rainfall data.
- **Automatic Fallback:** Includes Open-Meteo Satellite API failover if IMD servers experience latency.

### 📄 3. Bank Credit Assessment PDF Report Generator
- **Printable Bank Report:** Generates an official printable PDF credit report with Kisan details, GPS coordinates, NDVI vegetation health, IMD climate forecasts, revenue projections, and safe credit limit (60% rule).

### 🔄 4. Multi-Season Crop Rotation Planner
- **Soil & Revenue Optimization:** Recommends Rabi -> Kharif -> Zaid crop rotation pairs to naturally replenish soil nitrogen and maximize annual income.

### 🤖 5. Localized Hindi AI Assistant (`Groq LLaMA 3.3`)
- **Hindi-First Interaction:** Built to ensure ease of access for Indian farmers.
- **Dynamic ML Context Injection:** Automatically injects Python ML predictions into the AI chat context.

---

## 🛠️ Technology Stack

| Component | Framework / Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Leaflet Map, Framer Motion |
| **Backend Orchestrator** | Node.js, Express.js, JWT Authentication, Axios |
| **ML Engine** | Python 3.14, FastAPI, Pandas, Scikit-learn, NumPy |
| **Telemetry APIs** | IMD Weather API, Open-Meteo Satellite API, Sentinel-2 Map Tiles |
| **LLM Inference** | Groq API (`llama-3.1-8b-instant` / `llama-3.3-70b-versatile`) |
| **Database** | MongoDB Atlas / In-Memory Mongo Fallback |

---

## 📂 Project Structure

```text
kisaanai/
├── frontend/               # React 19 + Vite + Leaflet Frontend UI
│   ├── src/
│   │   ├── components/     # FarmlandMap, LandAnalysisCard, FinancialRevenueCard, PDFReportButton, CropRotationPlanner
│   │   ├── pages/          # LandingPage, Login, Register, Dashboard
│   ├── vite.config.js
├── backend/                # Express.js REST API & Auth Orchestrator
│   ├── config/             # Database connection & Admin seeders
│   ├── controllers/        # AI & Auth Controllers
│   ├── routes/             # API routes (/api/auth, /api/ai)
│   └── server.js
├── ml_service/             # Python FastAPI Microservice & Datasets
│   ├── data/               # Agricultural CSV & Excel Datasets
│   ├── data_loader.py      # Pandas data processing pipeline
│   ├── imd_service.py      # IMD & Open-Meteo weather API caller
│   ├── scoring.py          # NDVI, Weather, Soil scoring algorithms
│   └── main.py             # FastAPI entrypoint
└── README.md
```

---

## ⚡ Quickstart Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Start the Python ML Service
```bash
cd ml_service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. Start the Backend API
```bash
cd backend
npm install
node server.js
```

### 3. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```

Open your browser at **`http://localhost:3000`** to launch the application.

---

## 📄 License
This project is licensed under the MIT License.
