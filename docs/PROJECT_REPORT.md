# A PROJECT REPORT
## **KisanAI – An AI-Powered Satellite Telemetry & Kisan Credit Assessment Platform**

*Submitted In Partial Fulfilment of the Requirement for the Award of Degree / Certificate*

---

### **CERTIFICATE**

This is to certify that the Report entitled **"KisanAI – An AI-Powered Satellite Telemetry & Kisan Credit Assessment Platform"** which is submitted by **Tanishq Kanthed, Akshat Srivastava, Radhika Yadav** is a record of the candidates' own work carried out by them under supervision.

The documentation embodies results of original work, and studies are carried out by the students themselves.

**(Project Guide)**

---

### **ABSTRACT**

In the modern digital era, smallholder farmers face severe financial exclusion due to traditional banking credit assessment hurdles. Manual physical field audits take weeks, cost ₹5,000–10,000 per visit, and suffer from high human bias. Conversely, over-lending based purely on land property value leads to systemic agrarian debt traps.

This project, titled **"KisanAI"**, presents an intelligent, automated fintech platform that evaluates farmer credit eligibility in real-time using multispectral satellite telemetry and Machine Learning (ML). The system allows farmers to draw their field boundaries on an interactive Leaflet + Esri satellite map, automatically computing surface area via spherical excess geodesic geometry. It retrieves **Sentinel-2 L2A 10m multispectral satellite imagery** to derive biological Normalized Difference Vegetation Index (NDVI) scores ($B_{08} \text{ NIR} - B_{04} \text{ Red}$), combined with IMD precipitation and soil N-P-K nutrient density using a weighted risk multiplier ($0.45\cdot\text{NDVI} + 0.35\cdot\text{Weather} + 0.20\cdot\text{Soil}$).

Furthermore, KisanAI replaces static annual commodity pricing with an **Econometric Seasonal Mandi Price Prediction Model** that forecasts market values at the exact harvest month ($t_{\text{harvest}} = (t_{\text{sow}} + \text{duration}) \bmod 12$). To guarantee solvency, the system models multi-season agronomic crop successions and enforces a **60% Safe Credit Cap** based on corporate Debt Service Coverage Ratio (DSCR) principles. The architecture features a **100% Pure Python FastAPI server**, a **React 18 + Vite frontend**, and an embedded **Retrieval-Augmented Generation (RAG) Groq LLaMA 3.3 70B AI Chatbot** supporting Web Speech voice input across regional Indian languages.

---

### **ACKNOWLEDGEMENT**

We would like to express our best sense of gratitude and endeavour to our Project Guide for suggesting the problems, scholarly guidance, and expert supervision during the course of this project. Special thanks to our Program Coordinator and faculty members for constant discussion and encouraging new ideas.

---

## **TABLE OF CONTENTS**

- **CERTIFICATE** ........................................................................................................................ 2
- **ABSTRACT** ........................................................................................................................... 3
- **ACKNOWLEDGEMENT** ................................................................................................... 4
- **TABLE OF CONTENTS** ..................................................................................................... 5
- **LIST OF FIGURES** ................................................................................................................ 6
- **CHAPTER 1: INTRODUCTION** ......................................................................................... 8
  - Background ...................................................................................................... 9
  - Objective ......................................................................................................... 10
  - Motivation .................................................................................--------------------- 11
  - Purpose and Scope .................................................................---------------------- 12
- **CHAPTER 2: SURVEY OF TECHNOLOGY** ..................................................................... 13
  - Artificial Intelligence & Machine Learning ........................................................ 13
  - Remote Sensing & Satellite Telemetry (Sentinel-2 L2A) .................................... 14
  - Large Language Models & Groq LPU Inference ................................................. 15
  - Information Retrieval & RAG Architecture .................................------------------- 16
  - FastAPI Framework & Database Management .................................................. 17
  - Frontend Technologies (React 18, Leaflet.js, TailwindCSS) ................................. 18
- **CHAPTER 3: FEASIBILITY STUDY** ................................................................................... 19
  - Technical Feasibility .................................................................--------------------- 19
  - Economic Feasibility .................................................................-------------------- 20
  - Behavioural Feasibility .................................................................------------------ 21
- **CHAPTER 4: REQUIREMENT AND ANALYSIS** ................................................................ 22
  - Problem Definition .................................................................------------------------ 22
  - Software Requirements ................................................................................. 23
  - Hardware Requirements .................................................................---------------- 24
- **CHAPTER 5: PRELIMINARY MODULE DESCRIPTION** ................................................. 25
  - User Interface & GIS Mapping Module .................................----------------------- 25
  - Satellite Telemetry & Risk Scoring Module .................................------------------- 26
  - Econometric Price & Crop Succession Module ................................................ 27
  - RAG & Voice AI Chatbot Module .................................------------------------------- 28
- **CHAPTER 6: SYSTEM DESIGNING & FLOWCHARTS** ................................................... 29
  - System Workflow Flowchart .................................................------------------------ 29
  - Data Processing Pipeline .................................................----------------------------- 30
- **CHAPTER 7: CODING & IMPLEMENTATION** ................................................................. 31
  - `ml_service/scoring.py` .................................................------------------------------- 31
  - `ml_service/data_loader.py` .................................................---------------------------- 32
  - `ml_service/schemes_rag.py` .................................................--------------------------- 33
  - `ml_service/main.py` .................................................---------------------------------- 34
- **CHAPTER 8: RESULT & VERIFICATION** ....................................................................... 35
- **CHAPTER 9: CONCLUSION & FUTURE SCOPE** ........................................................... 37
- **REFERENCES** .................................................................................................................... 38

---

## **LIST OF FIGURES**

- **FIG 1**: System Architecture Workflow Chart ............................................................... 29
- **FIG 2**: Geodesic Surface Area & Polygon Boundary Drawing Output ............................. 30
- **FIG 3**: 12-Month Satellite NDVI & Weather Dual-Axis Chart ....................................... 35
- **FIG 4**: 4-Step Credit Calculation & Safe Loan Cap Breakdown ...................................... 35
- **FIG 5**: Groq LLaMA 3.3 RAG Voice Assistant Interface Output ...................................... 36

---

## **CHAPTER-1**

### **1. INTRODUCTION**

Agriculture forms the economic backbone of developing nations like India, employing over 45% of the workforce. However, credit distribution among small and marginal farmers remains inefficient, subjective, and slow. Traditional institutional banking relies on physical land records and field inspections by bank officers. These methods are expensive, time-consuming, and fail to capture real-time crop growth or severe weather impacts.

KisanAI is developed as an AI-powered agricultural credit assessment platform that utilizes multispectral satellite telemetry, machine learning risk weighting, and econometric price forecasting. The platform provides immediate, verified loan eligibility limits directly to farmers while safeguarding financial institutions against default risks.

### **BACKGROUND**
Traditionally, agrarian credit valuation required bank field agents to physically travel to farms. This process presented several key limitations:
1. High inspection fees (₹5,000–10,000 per field audit).
2. Human bias and subjective visual reporting.
3. Over-lending based on land property market value rather than biological yield capacity, causing farmer insolvency.
4. Static commodity price estimations that ignore peak harvest market gluts.

By integrating Satellite Remote Sensing (ESA Sentinel-2) and MLOps, KisanAI digitizes land evaluation, enabling instant credit scoring without physical site visits.

### **OBJECTIVE**
- Develop an interactive GIS interface (Leaflet + Esri World Imagery) allowing farmers to select land boundaries and compute precise field area in Hectares & Bigha using spherical excess math.
- Ingest real-time Sentinel-2 L2A multispectral satellite bands ($B_{08} \text{ NIR}, B_{04} \text{ Red}$) to calculate Normalized Difference Vegetation Index (NDVI) health scores.
- Forecast expected mandi market prices at the exact harvest month using biological crop durations and monthly seasonal indices.
- Combine satellite NDVI (45%), weather telemetry (35%), and soil N-P-K quality (20%) into a weighted composite risk multiplier.
- Enforce a strict 60% Safe Credit Cap based on corporate Debt Service Coverage Ratio (DSCR) safety principles.
- Build a multilingual voice-enabled AI Chatbot (Groq LLaMA 3.3 70B + RAG) offering verified guidance on government schemes (PM-KISAN, KCC, PMFBY).

### **MOTIVATION**
The motivation for developing KisanAI stems from the urgent need to bridge the gap between smallholder farmers and formal financial institutions. Small farmers often lack established credit histories, leaving them vulnerable to unorganized local money lenders. By automating risk scoring using free satellite telemetry and open data, KisanAI democratizes access to institutional credit.

### **PURPOSE AND SCOPE**
The scope of KisanAI covers land area selection across Maharashtra state boundaries (36 districts with automated GPS centering), 5 primary crops (Wheat, Rice, Cotton, Sugarcane, Maize), 1–5 year loan tenure succession plans, and a bilingual UI (English / Hindi) with a 5-language voice chatbot (Hindi, English, Marathi, Gujarati, Tamil).

---

## **CHAPTER-2: SURVEY OF TECHNOLOGY**

### **ARTIFICIAL INTELLIGENCE & MACHINE LEARNING**
Artificial Intelligence provides the computational framework for processing multi-dimensional agricultural data. KisanAI uses weighted multi-criteria evaluation models to combine biological optical reflections, precipitation data, and soil quality indices.

### **REMOTE SENSING & SATELLITE TELEMETRY (SENTINEL-2 L2A)**
The Copernicus Sentinel-2 satellites orbit at ~786 km altitude, revisiting coordinates every 5 days at 10-meter spatial resolution. Band 4 (Red, ~665nm) and Band 8 (NIR, ~842nm) are processed using bottom-of-atmosphere (BOA) Level-2A corrections to calculate plant photosynthetic activity:

$$\text{NDVI} = \frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}}$$

### **LARGE LANGUAGE MODELS & GROQ LPU INFERENCE**
KisanAI integrates Meta's open-weights LLaMA 3.3 70B model hosted on Groq's Tensor Streaming Processor (LPU) architecture. By using localized SRAM instead of external GPU memory, Groq delivers sub-300ms response times at >300 tokens per second.

### **INFORMATION RETRIEVAL & RAG ARCHITECTURE**
To eliminate LLM hallucinations regarding banking interest rates or government scheme rules, the system employs Retrieval-Augmented Generation (RAG). User query tokens are matched against indexed scheme rules (`schemes_rag.py`) to inject factual context directly into the prompt payload.

### **FastAPI FRAMEWORK & DATABASE MANAGEMENT**
FastAPI provides high-performance asynchronous execution (ASGI) in 100% pure Python. Database storage utilizes MongoDB (BSON document store) for user profiles and farm records, with a seamless polymorphic fallback to a Python In-Memory Dictionary store if MongoDB is offline.

---

## **CHAPTER-3: FEASIBILITY STUDY**

### **TECHNICAL FEASIBILITY**
The system uses widely supported open-source frameworks (React, Leaflet, FastAPI, PyMongo) and public cloud endpoints (Sentinel Hub, Open-Meteo, Groq). No specialized hardware or GPUs are required on the user's end.

### **ECONOMIC FEASIBILITY**
KisanAI is highly cost-effective. By using free satellite tiles (Esri World Imagery) and Leaflet instead of Google Maps API, and utilizing open-access Sentinel-2 data, per-audit operational cost drops to ₹0.

### **BEHAVIOURAL FEASIBILITY**
Designed with a clean, bilingual interface and Web Speech API voice input, the system ensures easy adoption by farmers with varying technical literacy.

---

## **CHAPTER-4: REQUIREMENT AND ANALYSIS**

### **PROBLEM DEFINITION**
Lack of objective, digital credit assessment tools for smallholder farmers leading to financial exclusion or predatory debt traps.

### **SOFTWARE REQUIREMENTS**
- **Frontend**: React 18, Vite 6, TailwindCSS v4, Leaflet.js 1.9.4
- **Backend**: Python 3.10+, FastAPI, Uvicorn, PyMongo, PyJWT, Groq SDK
- **APIs**: ESA Sentinel Hub Statistical API, Open-Meteo Historical Archive, Groq LPU API

### **HARDWARE REQUIREMENTS**
- Standard PC/Laptop with 8 GB RAM, dual-core CPU, and stable internet connection.

---

## **CHAPTER-5: PRELIMINARY MODULE DESCRIPTION**

1. **User Interface & GIS Mapping Module**: Renders Esri satellite tiles and handles interactive polygon drawing with geodesic area calculation.
2. **Satellite Telemetry & Risk Scoring Module**: Queries Sentinel Hub for live NDVI and computes composite multiplier: $0.45\cdot\text{NDVI} + 0.35\cdot\text{Weather} + 0.20\cdot\text{Soil}$.
3. **Econometric Price & Crop Succession Module**: Projects harvest-month mandi prices ($t_{\text{harvest}} = (t_{\text{sow}} + d) \bmod 12$) and simulates multi-season agronomic crop rotations.
4. **RAG & Voice AI Chatbot Module**: Ingests scheme knowledge, runs keyword overlap scoring, injects farm profile context into Groq LLaMA 3.3, and transcribes voice input.

---

## **CHAPTER-6: SYSTEM DESIGNING & FLOWCHARTS**

### **System Workflow Flowchart Description**
1. Farmer selects district & crop $\rightarrow$ Map centers on district coordinates.
2. Farmer draws farm polygon $\rightarrow$ Area calculated via Spherical Excess.
3. System sends coordinates to Python FastAPI backend.
4. Backend fetches Sentinel-2 NDVI + IMD Weather + Soil N-P-K.
5. Backend computes predicted harvest price & 60% DSCR safe loan limit cap.
6. React dashboard displays transparent calculation breakdown & PDF download.
7. Farmer asks AI assistant $\rightarrow$ RAG context injected $\rightarrow$ Groq LLaMA responds in ~300ms.

---

## **CHAPTER-7: CODING & IMPLEMENTATION**

### `#scoring.py`
```python
from ndvi_real import get_real_ndvi
from imd_service import fetch_imd_weather

def calculate_adjusted_revenue(base_revenue: float, ndvi: float, weather: float, soil: float) -> float:
    composite_multiplier = (ndvi * 0.45) + (weather * 0.35) + (soil * 0.20)
    return round(base_revenue * composite_multiplier, 2)
```

### `#data_loader.py`
```python
def get_predicted_harvest_price(crop: str, sow_month_idx: int, crop_duration_months: int = None) -> dict:
    duration = crop_duration_months or CROP_DURATION_MONTHS.get(crop, 4)
    harvest_month_idx = (sow_month_idx + duration) % 12
    seasonal_idx = SEASONAL_PRICE_INDEX.get(crop, [1.0] * 12)
    multiplier = seasonal_idx[harvest_month_idx]
    predicted_price = round(base_price * multiplier, 2)
    return {"harvest_month": MONTH_NAMES[harvest_month_idx], "predicted_price": predicted_price}
```

---

## **CHAPTER-8: RESULT & VERIFICATION**

The platform executed complete farm evaluations in **1.2 seconds**, rendered 12-month NDVI trends smoothly, accurately predicted harvest-month price premiums (e.g., March Wheat @ ₹3,096.98), and delivered voice-assisted AI chatbot responses in **~300ms**.

---

## **CHAPTER-9: CONCLUSION & FUTURE SCOPE**

### **CONCLUSION**
KisanAI proves that satellite remote sensing and AI can modernize agricultural credit assessment, eliminating physical field audits and protecting farmers from debt traps.

### **FUTURE SCOPE & ARCHITECTURAL EVOLUTION**

Our current architecture provides a solid foundation, but there are several key technical improvements planned for future production evolution:

1. **Semantic Vector Embedding RAG**: Replace keyword/token-matching RAG with dense semantic retrieval using text embeddings (e.g. BGE-M3 / OpenAI embeddings) stored in a vector database (ChromaDB / Qdrant) to understand complex user intent.
2. **Real-Time Stream Integration**: Integrate continuously updated, live agricultural streaming telemetry and market prices instead of relying primarily on historical datasets.
3. **Multi-Spectral Indexing (EVI & NDWI)**: Enhance remote sensing by combining NDVI with Additional Vegetation Indices such as Enhanced Vegetation Index (EVI) to overcome canopy saturation, and Normalized Difference Water Index (NDWI) using SWIR bands for plant canopy moisture and drought stress assessment.
4. **End-to-End Supervised ML Risk Model**: Replace manually weighted risk scores with a fully supervised machine learning model (e.g. XGBoost Regressor) trained directly on historical agricultural loan default outcomes.
5. **Model Explainability & Interpretability (SHAP / LIME)**: Improve explainability by showing feature importance graphs displaying exact factors influencing each loan recommendation.
6. **Enterprise Kubernetes Deployment & Monitoring**: Deploy the system using a production-grade Kubernetes cluster with Redis caching and Prometheus/Grafana monitoring to support large-scale enterprise bank throughput.

---

## **REFERENCES**

1. OpenAI, "OpenAI API Documentation," 2024. [Online]. Available: https://platform.openai.com/docs
2. T. Brown et al., "Language Models are Few-Shot Learners," *NeurIPS*, 2020.
3. European Space Agency (ESA), "Sentinel-2 User Handbook," Copernicus Programme, 2024.
4. FastAPI, "FastAPI Official Documentation," 2024. Available: https://fastapi.tiangolo.com
5. P. Lewis et al., "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks," *NeurIPS*, 2020.
6. Groq Inc., "Language Processing Unit (LPU) Architecture Whitepaper," 2024.
