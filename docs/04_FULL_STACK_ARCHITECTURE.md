# 🏛️ Document 4: Full Stack Architecture & System Integration

---

## 📌 Executive Overview
This document outlines the **Full-Stack Architecture**, component communications, database management, and deployment structure of **KisanAI**. It explains how the React frontend, Python FastAPI backend, PyMongo database, and external GIS/AI APIs form a cohesive end-to-end web platform.

---

## 1. 🔍 WHAT Are We Using?

| Layer | Technology | Version / Tool | Purpose |
|---|---|---|---|
| **Frontend** | React + Vite | React 18, Vite 6 | Fast, modular component architecture with instant HMR. |
| **Styling** | TailwindCSS + Framer Motion | Tailwind 3.4 | Modern dark/light UI tokens, responsive grids, and micro-animations. |
| **Mapping Engine** | Leaflet + React-Leaflet | Leaflet 1.9.4 | Interactive satellite map rendering and polygon boundary drawing. |
| **Backend Engine** | Python FastAPI | FastAPI 0.110+ | High-performance asynchronous REST API backend. |
| **Database** | MongoDB / PyMongo | PyMongo 4.6+ | Document store for users, farm profiles, and chat transcripts + Python In-Memory fallback. |
| **External APIs** | Sentinel Hub, IMD, Open-Meteo, Groq | REST / HTTP | Satellite imagery, meteorological data, weather archive, and LLaMA 3.3 LLM. |

---

## 2. ⚙️ HOW Are We Using It?

### 🔄 End-to-End System Architecture Diagram
```mermaid
graph TB
    subgraph Frontend Client (Browser)
        A[Landing Page / Register / Login] --> B[Dashboard View]
        B --> C[Leaflet Farmland Map]
        B --> D[Satellite Trend Chart Component]
        B --> E[AI Assistant Chat Widget]
    end

    subgraph Backend Server (Python FastAPI - Port 8000)
        F[API Gateway / Router] --> G[Auth Controller]
        F --> H[ML Analysis Controller]
        F --> I[Trend Analytics Controller]
        F --> J[RAG Chat Controller]
    end

    subgraph Database Layer
        K[(MongoDB - kisaanai db)]
        L[(Python In-Memory Fallback)]
    end

    subgraph External Cloud Services
        M[Sentinel Hub API v3]
        N[Open-Meteo Historical Archive]
        O[Groq LLaMA 3.3 LPU Inference]
        P[IMD Weather Service]
    end

    C -->|GeoJSON Polygon & GPS| H
    D -->|District & Crop| I
    E -->|User Prompt + Context| J
    G <-->|PyMongo CRUD| K
    G <-->|Fallback Store| L
    H -->|Calculate Risk & Succession| H
    I -->|Fetch Stats & Rainfall| M
    I -->|Fetch Rainfall Archive| N
    H -->|Fetch Soil & Weather| P
    J -->|Query Vector RAG & Call LLM| O
```

---

## 3. 🎯 WHY Are We Using It?

1. **100% Python Machine Learning Core**: By unifying auth, ML scoring, and RAG into Python FastAPI, there are zero translation bridges or cross-language IPC bottlenecks between Node.js and Python.
2. **Zero-Downtime Database Fallback**: If MongoDB connection is absent or local MongoDB service stops, `db.py` automatically falls back to an **In-Memory Python dictionary store** so the web app runs seamlessly without crashing.
3. **Optimized Network Footprint**: District 12-month NDVI trends are cached in `ndvi_cache.json` for 30 days, avoiding repetitive external API rate-limit usage.
4. **Instant Build & Dev Experience**: Vite builds the entire bundle in ~300ms, ensuring fast iteration and minimal resource consumption.

---

## 4. 📍 WHERE Are We Using It?

### 📂 Directory & File Map
```text
kisaanai/
├── frontend/                     # React + Vite Frontend Application
│   ├── src/
│   │   ├── components/           # Reusable UI Components
│   │   │   ├── FarmlandMap.jsx           # Satellite Leaflet Map & Polygon Measurement
│   │   │   ├── SatelliteTrendChart.jsx   # Dual-Axis 12-Month NDVI & Weather Chart
│   │   │   ├── LandAnalysisCard.jsx      # Telemetry Remote Sensing Card
│   │   │   ├── CalculationBreakdown.jsx  # 4-Step Transparent Math Card
│   │   │   ├── FullLandReport.jsx        # Multi-Year Succession & Sowing Decision
│   │   │   └── FinancialRevenueCard.jsx  # Safe Credit Cap Highlight Card
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx           # Bilingual EN/HI Landing Page
│   │   │   └── Dashboard.jsx             # Unified Main Dashboard & Chatbot Widget
│   │   └── utils/
│   │       ├── translations.js           # Full Hindi/English Dictionary
│   │       └── indiaDistricts.js         # Maharashtra Districts Coordinate Registry
├── ml_service/                   # 100% Pure Python FastAPI Backend
│   ├── main.py                   # Server Entrypoint & API Endpoints
│   ├── db.py                     # MongoDB & In-Memory Fallback Layer
│   ├── scoring.py                # Composite Telemetry Risk Formula (45/35/20)
│   ├── data_loader.py            # Mandi Price Datasets & Seasonal Price Forecasting
│   ├── trend_analytics.py        # Sentinel Hub & Open-Meteo 12-Month Trend Fetcher
│   ├── crop_recommendation.py    # Multi-Year Succession Timeline Engine
│   ├── rag_engine.py             # Government Kisan Schemes RAG Knowledge Vector Engine
│   └── ndvi_real.py              # Real Sentinel-2 L2A API Satellite Query
└── docs/                         # Project Documentation Directory
    ├── 01_SATELLITE_REMOTE_SENSING.md
    ├── 02_CREDIT_SCORING_AND_MLOPS.md
    ├── 03_RAG_AND_GROQ_AI.md
    └── 04_FULL_STACK_ARCHITECTURE.md
```
