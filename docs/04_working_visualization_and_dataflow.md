# 04. System Working Visualization & Data Flow Diagrams

This document visualizes the complete end-to-end operational flow of **Kisan Credit AI**.

---

## 1. End-to-End System Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Farmer / Bank Officer
    participant UI as React Frontend (Port 3000)
    participant Gateway as Express Node Gateway (Port 5000)
    participant ML as FastAPI Python Service (Port 8000)
    participant Groq as Groq LLaMA 3.3 70B Cloud

    Farmer->>UI: Selects Crop, Sowing Month, Loan Tenure & Draws Polygon on Map
    UI->>UI: Calculates Geodesic Area (m² -> Hectares -> Bigha)
    UI->>Gateway: POST /api/ai/analyze {state, crop, area, lat, lon, tenure}
    Gateway->>ML: POST /api/predict-revenue {state, crop, area, tenure}
    
    Note over ML: Pandas loads historical yield & price data<br/>Calculates NDVI score, IMD weather, soil metrics<br/>Generates multi-year crop succession cycles
    
    ML-->>Gateway: Return predictions & succession_plan JSON
    Gateway-->>UI: Return Analysis Data
    UI->>UI: Render Telemetry Cards, Step-by-Step Calculation Breakdown & Timeline
    
    Farmer->>UI: Asks Chat Question ("How much loan will I get?")
    UI->>Gateway: POST /api/ai/chat {message, landContext, lang}
    Gateway->>Groq: Stream System Prompt + Form Data + Conversation
    Groq-->>Gateway: Response: "You are eligible for a loan amount of ₹3,53,607"
    Gateway-->>UI: Return AI Response
    UI-->>Farmer: Display Response in Chat UI
```

---

## 2. Dynamic Land Area & Telemetry Pipeline Data Flow

```
[ User Clicks & Draws Polygon on Sentinel-2 Satellite Map ]
                         │
                         ▼
           [ FarmlandMap.jsx Component ]
                         │
          Computes Geodesic Area via Haversine
          Area (m²) ──> Hectares ──> Bigha
                         │
                         ▼
        [ Trigger POST /api/ai/analyze ]
                         │
                         ▼
          [ FastAPI data_loader.py ]
   Filter CSV by State ("Maharashtra") & Crop ("Wheat")
   Fetch Historical Yield = 3.5 Tonnes/Ha
   Fetch Mandi Price = ₹2,275 / Quintal
                         │
                         ▼
            [ FastAPI scoring.py ]
   Calculate Satellite NIR/Red Band NDVI Score (e.g. 0.78)
   Fetch Climate Weather & Rain Score from IMD API
                         │
                         ▼
        [ FastAPI crop_succession.py ]
   Cycle 1: Current Wheat (Nov-Apr) = ₹2,39,443
   Cycle 2: Summer Mung Bean (May-Jul) = ₹1,28,060
   Cycle 3: Monsoon Paddy (Aug-Dec) = ₹2,21,901
                         │
                         ▼
           [ Safe Credit Cap Formula ]
   Total Combined Revenue = ₹5,89,404
   Loan Cap (60%) = ₹3,53,642
```

---

## 3. Groq LLaMA AI Chatbot Context Synchronization Flow

```
+-------------------------------------------------------------------+
|                     DASHBOARD FORM STATE                          |
| State: Maharashtra | District: Ahilyanagar | Crop: Wheat          |
| Area: 3.37 Ha     | Sowing: November     | Tenure: 1 Year       |
+-------------------------------------------------------------------+
                                 │
                                 ▼
+-------------------------------------------------------------------+
|               REACT FRONTEND STATE SYNC (useEffect)               |
| Injects live formState into Chat Welcome & Context Payload        |
+-------------------------------------------------------------------+
                                 │
                                 ▼
+-------------------------------------------------------------------+
|                EXPRESS AI CONTROLLER (aiController.js)            |
| Auto-detects User Language (English / Hindi)                     |
| Builds System Prompt:                                             |
| "CONFIRMED FARMER DETAILS: Wheat, 3.37 Ha, Ahilyanagar"           |
| "STRICT RULE: Never re-ask for entered details!"                 |
| "ANSWER MANDATE: 'You are eligible for loan amount ₹3,53,607'"    |
+-------------------------------------------------------------------+
                                 │
                                 ▼
+-------------------------------------------------------------------+
|                     GROQ LLAMA 3.3 70B LPU                        |
| Generates instant response in requested language                   |
+-------------------------------------------------------------------+
```
