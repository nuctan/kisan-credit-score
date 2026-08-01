# Real-World Execution Example & State Breakdown
## Step-by-Step Data Flow from User Input to Final Output

This document walks through a complete real-world scenario of **Kisan Credit AI**, tracking every exact state change, backend calculation, database query, and LLM prompt transformation from the moment a farmer clicks on the map to the final loan eligibility output and chatbot answer.

---

## 📌 Scenario Input Details

| Parameter | Value |
| :--- | :--- |
| **Farmer Name** | Ramesh Patil |
| **State** | Maharashtra |
| **District** | Ahilyanagar |
| **Selected Crop** | Wheat (गेहूं) |
| **Sowing Start Month** | November (Index 10) |
| **Loan Tenure** | 2 Years (24 Months) |
| **Drawn Map Coordinates** | Latitude `19.0958`, Longitude `74.7496` |
| **Calculated Polygon Area** | $33,700 m^2$ ($\mathbf{3.37 \text{ Hectares}}$ / $\mathbf{13.31 \text{ Bigha}}$) |

---

## 🔄 Step-by-Step System Execution States

### **STATE 1: Frontend Input Capture & Geodesic Polygon Math (`FarmlandMap.jsx`)**

1. The farmer clicks 4 points on the Sentinel-2 Leaflet map drawing their field boundary around coordinates `[19.0958, 74.7496]`.
2. `FarmlandMap.jsx` triggers the Haversine spherical geodesic area algorithm:
   $$\text{Raw Polygon Area} = 33,700 \text{ m}^2$$
   $$\text{Area in Hectares} = \frac{33,700}{10,000} = \mathbf{3.37 \text{ Ha}}$$
   $$\text{Area in Bigha} = 3.37 \times 3.95 = \mathbf{13.31 \text{ Bigha}}$$
3. Auto-crop duration lookup executes: Wheat $\to$ **4 Months** growing period (Harvest in April).
4. `Dashboard.jsx` updates its local React state and triggers `handleAnalyzeLand()`.

---

### **STATE 2: API Gateway Proxy & Auth Validation (`backend/controllers/aiController.js`)**

1. Frontend fires HTTP request:
   `POST http://localhost:5000/api/ai/analyze`
   Headers: `Authorization: Bearer eyJhbGciOi... (JWT Token)`
   Payload:
   ```json
   {
     "state": "Maharashtra",
     "district": "Ahilyanagar",
     "crop": "Wheat",
     "area_hectares": 3.37,
     "lat": 19.0958,
     "lon": 74.7496,
     "loan_tenure_years": 2,
     "start_month_index": 10,
     "current_crop_duration": 4
   }
   ```
2. Express `authMiddleware.js` verifies the JWT token, attaches `req.user = decodedToken`, and passes control to `analyzeLand` in `aiController.js`.
3. Node.js Axios client proxies the payload to the Python FastAPI microservice:
   `POST http://127.0.0.1:8000/api/predict-revenue`

---

### **STATE 3: Python ML Execution Engine (`ml_service/`)**

FastAPI receives the request at `main.py` and executes 4 sequential ML sub-engines:

#### **Sub-Engine 3A: Historical Yield & Mandi Price Lookup (`data_loader.py`)**
- Queries `ml_service/data/Crop Yeild Data(1).csv` using Pandas:
  Filters `State == 'Maharashtra'` & `Crop == 'Wheat'`.  
  $\to$ Historical Mean Yield = **3.5 Tonnes per Hectare**.
- Queries `ml_service/data/monthy wheat , mandi price.csv`:
  Filters APMC Market prices for Wheat.  
  $\to$ Historical Mandi Price = **₹2,275 per Quintal**.
- **Base Benchmark Revenue Calculation:**
  $$\text{Base Revenue} = 3.37 \text{ Ha} \times 3.5 \text{ Tonnes/Ha} \times 10 \text{ Quintals/Tonne} \times ₹2,275 = \mathbf{₹2,68,333.75}$$

#### **Sub-Engine 3B: Satellite Telemetry & Climate Scoring (`scoring.py`)**
- **Sentinel-2 NDVI Score Calculation:** Queries NIR/Red reflectance bands at Lat `19.0958`, Lon `74.7496`.  
  NDVI value = `0.78` (Healthy canopy, Score Multiplier = `1.10`).
- **IMD Weather Score Calculation:** Queries IMD weather API for Ahilyanagar rainfall & temperature.  
  Weather status = Normal monsoon forecast (Score Multiplier = `1.05`).
- **Soil N-P-K Score Calculation:** Soil nitrogen/phosphorus quality = `1.00`.
- **Weighted Composite Multiplier:**
  $$\text{Composite Multiplier} = (1.10 \times 0.45) + (1.05 \times 0.35) + (1.00 \times 0.20) = \mathbf{1.0625}$$
- **Telemetry Adjusted Current Revenue:**
  $$\text{Adjusted Revenue} = ₹2,68,333.75 \times 1.0625 = \mathbf{₹2,85,104.60}$$

#### **Sub-Engine 3C: Multi-Year Crop Succession Rotation Engine (`crop_succession.py`)**
The loan tenure is **2 Years (24 Months)** starting in **November** (Month 10):
- **Cycle 1 (Nov – Apr | 4 Mos):** Wheat (Current Crop) $\to$ Revenue: **₹2,85,104.60**
- **Cycle 2 (May – Jul | 3 Mos):** Summer Mung Bean (N-Fixation Pulse) $\to$ Revenue: **₹1,28,060.00**
- **Cycle 3 (Aug – Dec | 5 Mos):** Monsoon Paddy (Kharif Season) $\to$ Revenue: **₹2,89,820.00**
- **Cycle 4 (Jan – Apr | 4 Mos):** Rabi Mustard / Wheat (Year 2) $\to$ Revenue: **₹2,85,250.00**
- **Cycle 5 (May – Dec | 8 Mos):** Summer Vegetables & Maize $\to$ Revenue: **₹4,46,097.00**
- **Total Combined 24-Month Revenue:**
  $$\text{Total 2-Year Combined Revenue} = ₹2,85,104.60 + ₹1,28,060 + ₹2,89,820 + ₹2,85,250 + ₹4,46,097 = \mathbf{₹14,34,331.60}$$

#### **Sub-Engine 3D: 60% Safe Credit Cap Formula**
$$\text{Maximum Safe Loan Eligibility Cap} = ₹14,34,331.60 \times 0.60 = \mathbf{₹8,60,598.96}$$

FastAPI bundles this into a JSON payload and returns it to Express Node Gateway.

---

### **STATE 4: Frontend UI Rendering & Card Updates**

React receives the ML response and updates component states simultaneously:
1. `LandAnalysisCard.jsx`: Displays NDVI Vegetation Score `0.78` (Healthy), IMD Weather Forecast, Soil Quality, and Baseline Yield `3.5 Tonnes/Ha`.
2. `CalculationBreakdown.jsx`: Renders the transparent 4-step math card showing:
   - Step 1 Base Yield: $3.37 \text{ Ha} \times 3.5 \times 10 \times ₹2,275 = ₹2,68,334$
   - Step 2 Telemetry Multiplier: $\times 1.0625 \to ₹2,85,105$
   - Step 3 2-Year Succession Combined Revenue: $₹14,34,332$
   - Step 4 Safe Credit Cap (60%): $\mathbf{₹8,60,599}$
3. `FullLandReport.jsx`: Displays the 24-month visual timeline card showing harvest months.
4. `FinancialRevenueCard.jsx`: Displays the safe credit limit badge.

---

### **STATE 5: AI Chatbot Execution & Language Auto-Detection (`aiController.js` & Groq LLaMA)**

1. The farmer types in English: *"how much loan will i get?"*
2. Frontend sends request: `POST http://localhost:5000/api/ai/chat` with `message` and `landContext`.
3. Express `aiController.js` processes the request:
   - **Language Detection:** Message contains English text (`"how much loan..."`) $\to$ Sets `respondInEnglish = true`.
   - **RAG Context Construction:** Extracts verified form inputs and pre-computed ML predictions:
     ```
     [CONFIRMED FARMER FORM DATA]:
     - Crop: Wheat | Area: 3.37 Ha | Location: Ahilyanagar, Maharashtra
     - Loan Tenure: 2 Years | Sowing Month: November
     
     [CONFIRMED LOAN ELIGIBILITY]:
     - MAXIMUM SAFE LOAN ELIGIBILITY CAP: ₹8,60,599
     ```
   - **Prompt Mandate:** Instructs Groq LLaMA to **NEVER** re-ask for Crop or Area, and state immediately:  
     *"Based on your land details (Wheat on 3.37 Ha in Ahilyanagar), **you are eligible for a loan amount of ₹8,60,599**."*
4. Groq LLaMA 3.3 70B processes the system prompt and generates the response in **320 milliseconds**.
5. Response returned to frontend and rendered in the chat bubble:

> 🌾 **Based on your land details (Wheat on 3.37 Hectares in Ahilyanagar), you are eligible for a maximum safe loan amount of ₹8,60,599.**
> 
> This limit is calculated based on your 2-Year loan tenure, 60% safe repayment capacity, and multi-season crop rotation plan (Wheat $\to$ Mung Bean $\to$ Paddy). 
> 
> Would you like assistance with PM Fasal Bima crop insurance or SBI/NABARD KCC bank application forms?
