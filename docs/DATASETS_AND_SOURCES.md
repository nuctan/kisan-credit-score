# 📊 KisanAI — Complete Datasets & Data Sources Documentation

This document provides a complete inventory of all **CSV/Excel datasets**, **external REST/API sources**, and **knowledge bases** used in **KisanAI**, along with their official data sources, file paths, and exact role in the system.

---

## 📂 1. Local CSV / Excel Datasets (Stored in `ml_service/data/`)

| Dataset File Name | File Path | Data Description & Parameters | Official Government / Provider Source | Role in KisanAI System |
|---|---|---|---|---|
| **Crop Yield Dataset** | `ml_service/data/Crop Yeild Data(1).csv` | State-wise, district-wise, and crop-wise historical production statistics and yields measured in **Tonnes per Hectare (T/Ha)** across Indian states. | **DES (Directorate of Economics and Statistics)**, Ministry of Agriculture & Farmers Welfare, Govt. of India (data.gov.in) | Loaded in `data_loader.py` (`load_crop_yield_data()`) to compute historical average baseline yield for the farmer's state and crop. |
| **Monthly Mandi Price Dataset** | `ml_service/data/monthy wheat , mandi price.csv` | Historical monthly wholesale mandi modal prices measured in **Rupees per Quintal (₹/Quintal)** for Wheat and cereal crops. | **AGMARKNET (Agricultural Marketing Information Network)** / Directorate of Marketing & Inspection (DMI), Govt. of India | Loaded in `data_loader.py` (`load_mandi_price_data()`) to get base market prices before applying seasonal harvest-month forecasting. |
| **Agmarknet All Grades Report** | `ml_service/data/All_Type_of_Report_(All_Grades)_15-06-2026_02-27-02_AM(3).csv` | Real-time commodity arrival quantities and grade-wise modal price transactions across APMC mandis in Maharashtra. | **Agmarknet Portal / APMC Mandi Records** (agmarknet.gov.in) | Used for calibrating regional commodity baseline prices across Maharashtra districts. |
| **State Wheat Production Dataset** | `ml_service/data/production , yearly , maharashtra .csv` | Multi-year historical crop production figures (in Metric Tonnes) for Maharashtra districts. | **Department of Agriculture, Govt. of Maharashtra** (krishi.maharashtra.gov.in) | Benchmarks district-level yield potential across Kharif and Rabi seasons. |
| **National Wheat Yield Index** | `ml_service/data/Wheat Yield for whole India.xlsx` & `Wheat Production(1).csv` | Pan-India state-wise wheat yield averages and annual growth rates. | **ICAR (Indian Council of Agricultural Research)** & DAC&FW Annual Reports | National fallback benchmark for yield calculations if district CSV data is incomplete. |
| **Pradhan Mantri Fasal Bima Insurance Dataset** | `ml_service/data/Rajya_Sabha_Session_234_AU2595_1, num of farmer insauranced .csv` | Official Rajya Sabha Session 234 unstarred question data detailing state-wise farmer crop insurance coverage statistics. | **Rajya Sabha Official Question Database / Ministry of Agriculture** (sansad.in/rs) | Used in `schemes_rag.py` to substantiate PMFBY crop insurance policy parameters and coverage rules. |

---

## 🛰️ 2. Live Satellite Remote Sensing Datasets (External APIs)

| Data Source Provider | Spectral Bands / Instrument | Spatial / Temporal Resolution | Official Provider Source | Role in KisanAI System |
|---|---|---|---|---|
| **Sentinel-2 L2A Multispectral Satellite** | Band 4 (Red: ~665nm) & Band 8 (Near-Infrared / NIR: ~842nm) + SCL (Scene Classification Layer) | 10-meter spatial resolution; 5-day global revisit time | **ESA (European Space Agency)** Copernicus Open Access Hub / Sentinel Hub API v3 | Processed in `ndvi_real.py` (`get_real_ndvi()`) to compute real-time photosynthetic vegetation health: $\text{NDVI} = (B_{08} - B_{04}) / (B_{08} + B_{04})$. |
| **Sentinel Hub Statistical API** | 12-Month Historical Surface Reflectance Raster Aggregations | 1km bounding box surrounding district centroid | **Sentinel Hub / Sinergise Ltd** (services.sentinel-hub.com) | Processed in `trend_analytics.py` (`_fetch_real_ndvi_12months()`) to generate the 12-month historical NDVI vegetation curve. |

---

## ⛅ 3. Meteorological & Climate Datasets (External APIs)

| Data Source Provider | Data Parameters | Coverage / Resolution | Official Provider Source | Role in KisanAI System |
|---|---|---|---|---|
| **IMD (India Meteorological Department)** | Max/Min Temperature (°C), 24-hour accumulated rainfall (mm), and local weather forecast text. | Station-level observations across India | **IMD / Ministry of Earth Sciences (MoES)**, Govt. of India (api.imd.gov.in) | Fetched in `imd_service.py` (`fetch_imd_weather()`) to evaluate weather risk scores and heavy rainfall thresholds (>50mm). |
| **Open-Meteo Weather REST API** | Surface temperature at 2m, daily precipitation sum (mm), wind speed, and relative humidity. | Global 11km resolution; 0.25° grid | **Open-Meteo Global Weather Archive** (open-meteo.com) | Secondary fallback endpoint in `imd_service.py` and historical 365-day rainfall bar chart provider in `trend_analytics.py`. |

---

## 📜 4. Government Welfare Schemes Dataset (RAG Vector Store)

| Knowledge Base Name | Content Description | Source Repository | Role in KisanAI System |
|---|---|---|---|
| **Kisan Govt Schemes Knowledge Base** | Hardcoded structured JSON array in `ml_service/schemes_rag.py` containing official eligibility, benefit amounts, and application steps for **PM-KISAN, KCC, PMFBY, PM-KUSUM, Soil Health Card, SMAM, and Karjmukti**. | Official Portal Documentation (`pmkisan.gov.in`, `pmfby.gov.in`, `kusum.mnre.gov.in`, `agrimachinery.nic.in`) | Queried by the Python RAG Engine (`query_kisan_schemes()`) to inject ground-truth policy facts into the Groq LLaMA 3.3 70B system prompt, eliminating AI hallucinations. |

---

## 🎯 Summary Matrix: Dataset $\rightarrow$ Code Module Mapping

```
Crop Yeild Data(1).csv ─────────────► data_loader.py ──┐
monthy wheat mandi price.csv ────────► data_loader.py ──┼──► main.py (/api/ai/analyze)
Sentinel-2 L2A Satellite Bands ─────► ndvi_real.py ────┤
IMD & Open-Meteo Weather ───────────► imd_service.py ──┘
                             
Schemes Knowledge Base ─────────────► schemes_rag.py ───► main.py (/api/ai/chat) ──► Groq LLaMA 3.3 70B
```
