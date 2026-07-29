# 🌾 Kisan Credit AI (किसानAI)
> **AI-Powered Agricultural Credit Assessment, Sentinel-2 Satellite Intelligence & Crop Succession Platform**

[![Stack](https://img.shields.io/badge/Stack-100%25%20Python%20%2B%20React%2019-E8630A.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-2D6A4F.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://www.python.org/)

---

## 📌 Overview

**Kisan Credit AI** is an intelligent agricultural fintech and geospatial risk platform built for Indian farmers and credit assessment officers (SBI, NABARD). It replaces traditional paper-heavy land inspections with **Sentinel-2 Satellite Earth Observation**, **Machine Learning Yield Scoring**, **Multi-Year Crop Succession Planning**, and a **Groq LLaMA 3.3 70B RAG AI Assistant**.

---

## 🔥 Key Features

- **🛰️ Sentinel-2 L2A Satellite Intelligence:** Real-time B08 (NIR) and B04 (Red) spectral band processing for exact **NDVI Vegetation Health** scoring ($\text{NDVI} = \frac{B08 - B04}{B08 + B04}$).
- **🗺️ Interactive GIS Polygon Math:** Leaflet satellite map interface with automatic geodesic field area calculations ($m^2 \to \text{Hectares} \to \text{Bigha}$).
- **📈 12-Month Satellite & Weather Analytics:** Real monthly NDVI curves via Sentinel Hub Statistical API and historical rainfall trends via Open-Meteo Archive API.
- **🤖 Groq LLaMA 3.3 70B RAG Assistant:** Python RAG knowledge engine covering **PM-KISAN**, **KCC**, **PMFBY**, **PM-KUSUM**, **Soil Health Card**, and **Maharashtra Karjmukti Yojna**.
- **📊 60% Safe Credit Limit Cap:** Multi-year revenue model calculating maximum safe loan eligibility to prevent farmer over-indebtedness.
- **📄 PDF Credit Assessment Export:** Instant generation of official bank loan evaluation letters.
- **🌐 100% Pure Python Stack:** Unified FastAPI server on port 8000 handling Auth, PyMongo, Pandas telemetry, and RAG.

---

## 💻 Tech Stack

- **Frontend:** React 19, Vite 8, TailwindCSS v4, Leaflet GIS, jsPDF, Framer Motion
- **Backend:** Python 3.14, FastAPI, Uvicorn, Pydantic v2, PyJWT
- **Database:** MongoDB Atlas / PyMongo (with zero-dependency local/memory fallback)
- **ML & Telemetry:** Pandas, NumPy, Sentinel Hub Python SDK, Open-Meteo API
- **AI & RAG:** Groq LLaMA 3.3 70B Versatile Model (`llama-3.3-70b-versatile`)

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/Tanishqkathed/kisaanai.git
cd kisaanai
```

### 2. Configure Environment Variables
Copy the environment template in `ml_service/`:
```bash
cp ml_service/.env.example ml_service/.env
```
Fill in your credentials in `ml_service/.env`:
```env
SENTINELHUB_CLIENT_ID=your_id
SENTINELHUB_CLIENT_SECRET=your_secret
GROQ_API_KEY=your_groq_key
JWT_SECRET=your_secret_key
MONGO_URI=mongodb://127.0.0.1:27017/kisaanai
```

### 3. One-Click Launch
```bash
bash start.sh
```
- 🌐 **Frontend Web App:** [http://localhost:3000](http://localhost:3000)
- 🐍 **FastAPI Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- 🔑 **Default Admin Login:** `admin` / `admin`

---

## 🛡️ Security & Privacy Notice
All sensitive API keys and database connection strings are isolated in local `.env` files and strictly excluded from git tracking via `.gitignore`.
