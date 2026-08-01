# 01. Project Overview & Development Challenges

## 1. Project Overview
**Project Name:** Kisan Credit AI: Agricultural Risk & Yield Intelligence  
**Target Domain:** Agritech / FinTech / Rural Banking (Kisan Credit Card - KCC)  
**Primary Goal:** To revolutionize rural agricultural lending in India by combining satellite remote sensing (Sentinel-2 NDVI), real-time IMD weather data, historical crop yield analytics, multi-year crop succession planning, and LLM-powered AI assistance.

### The Real-World Problem Solved
1. **Traditional KCC Under-Borrowing / Over-Borrowing:**
   Traditional banks in India calculate Kisan Credit Card (KCC) limits based solely on static land record documents (7/12 extract) or manual human inspector visits. This leads to inaccurate credit limits, high NPA (Non-Performing Assets) rates, and farmer debt traps.
2. **Lack of Multi-Year Crop Rotation Planning:**
   A farmer growing Wheat in Rabi season will harvest in April and leave the land fallow or rotate to Mung Bean / Paddy. Traditional credit scoring only evaluates the current 4-month crop, ignoring the 12 to 60-month loan cycle revenue potential.
3. **Language & Digital Literacy Barriers:**
   Rural farmers struggle with complex banking documentation. Bank officers lack quick satellite verification tools.

---

## 2. Problems & Technical Challenges Faced During Development

During the engineering phase of this project, several critical technical, architectural, and algorithmic challenges were encountered and solved:

### Challenge 1: Authentication & Schema Field Mismatch
- **Symptom:** User registration was failing with `User validation failed: name: Path 'name' is required`, and login returned `Invalid user ID / password`.
- **Root Cause:** The React frontend was submitting `{ fullName, phone, email, password }`, whereas the Mongoose schema required `name` and `username`.
- **Resolution:** Updated `authController.js` and `Register.jsx` to map `fullName` $\to$ `name`, automatically generate fallback `username = email.split('@')[0]`, store JWT token in `localStorage`, and redirect directly to `/dashboard`.

### Challenge 2: Decommissioned LLaMA Model Names & Groq API Key Setup
- **Symptom:** AI chat failed or stalled when querying Groq API.
- **Root Cause:** Older LLaMA models (like `llama3-8b-8192` or `llama-3-70b`) were decommissioned by Groq in favor of updated model aliases (`llama-3.3-70b-versatile` and `llama-3.1-8b-instant`).
- **Resolution:** Configured live Groq API key in `.env` and upgraded model references across `aiController.js` to `llama-3.3-70b-versatile`.

### Challenge 3: Port Binding & Local Browser Network Reachability
- **Symptom:** Frontend server started on Vite default, but Zen/Chrome browser on `http://localhost:3000` could not reach the app.
- **Root Cause:** Vite dev server bound to IPv6 `::1` or `127.0.0.1` by default without exposing `host: true`.
- **Resolution:** Modified `vite.config.js` to explicitly set `server: { host: true, port: 3000 }`, allowing seamless local network binding.

### Challenge 4: Interactive Polygon Land Measurement vs Static Input
- **Symptom:** The initial design relied on static text inputs for land area, leading to user error or fake inputs.
- **Root Cause:** Map markers provided single lat/lon points without field boundary polygon measurement.
- **Resolution:** Implemented Leaflet Draw / Polygon tools in `FarmlandMap.jsx`. Used Haversine-based geodesic area calculation ($m^2 \to \text{Hectares} \to \text{Bigha}$) so that drawing a polygon on satellite imagery dynamically calculates field area and recalculates loan limits.

### Challenge 5: Multi-Year Loan Tenure & Custom Sowing Timelines
- **Symptom:** The system originally only calculated a fixed 1-year cycle starting in November.
- **Root Cause:** Farmers take loans for 1, 2, 3, or 5 years and sow crops at different months (e.g. July for Kharif Paddy, November for Rabi Wheat).
- **Resolution:** Rewrote `crop_succession.py` in the Python ML service to accept `loan_tenure_years` (1, 2, 3, 5) and `start_month_index` (0–11). Designed a multi-year crop rotation pool that schedules sequential harvests over 12 to 60 months.

### Challenge 6: Groq AI Chatbot Redundant Questions & Dual-Language Sync
- **Symptom:** Chatbot kept re-asking "How much land do you have?" and "What crop are you growing?" even though the farmer already selected them on the dashboard, and forced Hindi when asked in English.
- **Root Cause:** The system prompt forced rigid Hindi and lacked live synchronization with `formState`.
- **Resolution:** Implemented real-time form state sync in `Dashboard.jsx`. Updated `aiController.js` to perform language auto-detection and inject `CONFIRMED FARMER FORM DATA` into Groq LLaMA, instructing it to NEVER re-ask entered inputs and immediately state: *"You are eligible for loan amount ₹X,XX,XXX"*.
