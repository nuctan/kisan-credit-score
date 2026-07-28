# 🌾 Kisan Credit AI: Agricultural Risk & Yield Intelligence (Phase 2)

**Kisan Credit AI** is an end-to-end, AI-powered agricultural credit assessment and crop intelligence platform designed specifically for Indian farmers (*Kisans*). The platform leverages satellite imagery (Sentinel-2), historical crop yield datasets, real-time meteorological data (IMD), and modern LLM capabilities to accurately project crop revenue and evaluate loan repayment capacities.

---

## 🚀 Key Features (Phase 2 Release)

### 🗺️ 1. Sentinel-2 Interactive Farmland Map
- **High-Resolution Satellite View:** Powered by Leaflet & Esri World Imagery tile layers.
- **GPS Coordinates Picker:** Farmers can click/tap directly on the map to select their farmland boundaries.

### 🌿 2. Agricultural Telemetry & Risk Analysis Engine
- **NDVI Vegetation Index:** Measures crop health and vigor from remote sensing data.
- **IMD Weather Risk Score:** Real-time weather forecasting and risk factor scoring.
- **Soil Quality Indicators:** Historical N-P-K-pH nutrient analysis.
- **Yield & Price Benchmarking:** Automated queries against historical crop yield and regional Mandi pricing datasets.

### 💰 3. Financial Revenue & Safe Credit Cap Calculator
- **Current Crop Revenue Estimation (₹):** Calculates adjusted revenue based on land area, baseline yield, and composite AI risk weights.
- **Multi-Cycle Future Revenue Projections:** Estimates expected revenue across upcoming crop seasons.
- **Safe Credit Capacity (60% Rule):** Calculates maximum recommended bank loan limits based on repayment capacity.
- **Risk Level Grading:** Automated classification into **Low**, **Medium**, or **High Risk** categories.

### 🤖 4. Localized Hindi AI Assistant (`Groq LLaMA 3.3`)
- **Hindi-First Interaction:** Built to ensure ease of access for Indian farmers.
- **Dynamic ML Context Injection:** The AI assistant automatically receives the ML analysis (revenue predictions, NDVI scores, weather alerts) to provide contextual financial guidance.

---

## 🛠️ Technology Stack

| Component | Framework / Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Leaflet Map, Framer Motion |
| **Backend Orchestrator** | Node.js, Express.js, JWT Authentication, Axios |
| **ML Engine** | Python 3.14, FastAPI, Pandas, Scikit-learn, NumPy |
| **LLM Inference** | Groq API (`llama-3.1-8b-instant` / `llama-3.3-70b-versatile`) |
| **Database** | MongoDB Atlas / In-Memory Mongo Fallback |

---

## 📂 Project Structure

```text
kisaanai/
├── frontend/               # React 19 + Vite + Leaflet Frontend UI
│   ├── src/
│   │   ├── components/     # FarmlandMap, LandAnalysisCard, FinancialRevenueCard
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
pip install -r requirements.txt # (fastapi uvicorn pandas scikit-learn numpy)
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

## 🔒 Security Note
Environment variables containing API keys (`GROQ_API_KEY`, `MONGO_URI`, `JWT_SECRET`) are strictly excluded from version control via `.gitignore`.

---

## 📄 License
This project is licensed under the MIT License.
