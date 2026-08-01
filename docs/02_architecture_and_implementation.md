# 02. System Architecture & Technical Implementation

## 1. System Architecture Overview
The platform follows a modern **Decoupled 3-Tier Microservices Architecture**:

```
[ React 18 + Vite + Tailwind Frontend ] (Port 3000)
                │
                │ HTTP REST / JSON
                ▼
[ Node.js + Express API Gateway / Auth ] (Port 5000)
        │                               │
        │ Internal Proxy / Axios        │ Groq SDK / Cloud
        ▼                               ▼
[ Python FastAPI ML Service ] (Port 8000)   [ Groq LLaMA 3.3 70B AI Engine ]
   ├── Pandas Historical Analytics
   ├── Sentinel-2 NDVI Telemetry
   ├── IMD Climate & Weather Engine
   └── Multi-Year Succession Plan
```

---

## 2. Component Breakdowns

### Component A: Frontend (`frontend/src/`)
- **Technology:** React 18, Vite, Tailwind CSS v4, Framer Motion, Leaflet.js / React-Leaflet.
- **Key Modules:**
  - `Dashboard.jsx`: Single-page unified layout hosting interactive polygon map, telemetry cards, calculation breakdown, succession timeline, PDF report button, and live AI Chatbot.
  - `FarmlandMap.jsx`: Leaflet satellite view supporting multi-point polygon boundary drawing and geodesic area computation ($m^2 \to \text{Ha} \to \text{Bigha}$).
  - `CalculationBreakdown.jsx`: Step-by-step mathematical breakdown showing Base Yield, Telemetry Multipliers, Succession Revenue, and 60% Safe Credit Cap Formula.
  - `FullLandReport.jsx`: 12-to-60 month visual timeline of crop rotations and harvest schedules.
  - `PDFReportButton.jsx`: Client-side printable Bank Assessment Letterhead for loan officer documentation.
  - `translations.js`: Bilingual English ↔ Hindi dictionary.

### Component B: Backend API Gateway (`backend/`)
- **Technology:** Node.js, Express, Mongoose / In-Memory MongoDB, Groq SDK.
- **Key Modules:**
  - `server.js`: Entry point starting Express on port 5000.
  - `controllers/authController.js`: Handles JWT token generation, bcrypt password hashing, login, registration.
  - `controllers/aiController.js`: 
    - `/api/ai/analyze`: Proxies land telemetry requests to the FastAPI Python service (`http://127.0.0.1:8000`).
    - `/api/ai/chat`: Manages Groq LLaMA 3.3 70B stateful chat sessions, auto-detects language (English / Hindi), and injects verified land context into system prompt.

### Component C: Python ML Microservice (`ml_service/`)
- **Technology:** FastAPI, Python 3.10+, Pandas, NumPy, Uvicorn.
- **Key Modules:**
  - `main.py`: FastAPI server running on `0.0.0.0:8000` exposing `/api/predict-revenue`.
  - `data_loader.py`: Uses Pandas to load `Crop Yeild Data(1).csv` and `monthy wheat , mandi price.csv` to query historical state/crop yields (Tonnes/Ha) and Mandi prices (Rs/Quintal).
  - `scoring.py`: Computes risk multipliers for NDVI vegetation index, IMD weather forecasts, and soil N-P-K metrics.
  - `crop_succession.py`: Multi-year crop rotation engine calculating 12, 24, 36, or 60-month succession revenues and 60% safe credit limits.

---

## 3. Core Algorithms & Mathematical Formulas

### 1. Geodesic Polygon Area Formula (`FarmlandMap.jsx`)
Coordinates drawn on Leaflet map are evaluated using the Haversine spherical area approximation:
$$\text{Area}_{m^2} = \text{CalculatePolygonArea}(\text{Lat/Lon Points})$$
$$\text{Area}_{\text{Hectares}} = \frac{\text{Area}_{m^2}}{10,000}$$
$$\text{Area}_{\text{Bigha}} = \text{Area}_{\text{Hectares}} \times 3.95$$

### 2. Base Crop Revenue Benchmark
$$\text{Base Revenue (₹)} = \text{Area (Ha)} \times \text{Historical Yield (Tonnes/Ha)} \times 10 \text{ (Quintals/Tonne)} \times \text{Mandi Price (₹/Quintal)}$$

### 3. Telemetry Multiplier Calculation
$$\text{Composite Multiplier} = (\text{NDVI Score} \times 0.45) + (\text{IMD Weather Score} \times 0.35) + (\text{Soil Score} \times 0.20)$$
$$\text{Adjusted Current Revenue (₹)} = \text{Base Revenue} \times \text{Composite Multiplier}$$

### 4. Multi-Year Loan Eligibility Cap (60% Rule)
$$\text{Total Combined Revenue} = \text{Adjusted Current Revenue} + \sum_{i=2}^{N} \text{Succession Cycle Revenue}_i$$
$$\text{Maximum Safe Loan Amount (₹)} = \text{Total Combined Revenue} \times 0.60$$
