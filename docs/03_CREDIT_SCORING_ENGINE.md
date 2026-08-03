# Document 3: Credit Scoring Engine — How the Loan Amount Is Calculated

---

## 3.1 The Formula at a Glance

The final loan amount is calculated in **4 steps**:

```
Step 1: Base Revenue = Area × Yield × 10 × Predicted Mandi Price

Step 2: Adjusted Revenue = Base Revenue × (NDVI×45% + Weather×35% + Soil×20%)

Step 3: Total Tenure Revenue = Sum of all crop cycle revenues over loan period

Step 4: Safe Loan Cap = Total Tenure Revenue × 60%
                        ↑
                  This is the loan amount shown to the farmer
```

Each step is shown transparently in the `CalculationBreakdown` card on the dashboard.

---

## 3.2 Step 1: Base Revenue Calculation

**Formula:**
$$\text{Base Revenue (₹)} = \text{Area (Ha)} \times \text{Yield (T/Ha)} \times 10 \times \text{Harvest Price (₹/Quintal)}$$

**Why × 10?** Because 1 Tonne = 10 Quintals. Mandi prices are quoted per Quintal.

**Where do Yield and Price come from?**

**Yield:** Loaded from a real CSV dataset (`ml_service/data/Crop Yeild Data(1).csv`) using Pandas. Filtered by State + Crop to get the historical average yield for Maharashtra.

**Price:** NOT a static number. This is a **predicted harvest-month price** (see Section 3.3).

```python
# data_loader.py — get_historical_averages()
avg_yield = yield_df[
    (yield_df['state'] == state) & (yield_df['crop'] == crop)
]['yield'].mean()
```

---

## 3.3 Seasonal Harvest-Month Price Prediction

This is one of KisanAI's most important innovations. Traditional systems use a static price like ₹2200/quintal for Wheat all year round. But mandi prices **change every month** based on supply and demand.

**The insight:** If a farmer sows Wheat in November, it will be harvested in March. The bank should lend based on what Wheat will cost **in March**, not some annual average.

**The Seasonal Price Index** (from `data_loader.py`):
```python
SEASONAL_PRICE_INDEX = {
    #              Jan   Feb   Mar   Apr   May   Jun   Jul   Aug   Sep   Oct   Nov   Dec
    "Wheat":     [1.15, 1.10, 1.05, 0.88, 0.85, 0.90, 0.92, 0.95, 1.00, 1.05, 1.08, 1.12],
    "Rice":      [0.95, 0.98, 1.00, 1.05, 1.08, 1.10, 1.05, 0.90, 0.85, 0.88, 0.92, 0.95],
    "Cotton":    [1.00, 1.02, 1.05, 1.08, 1.10, 1.12, 1.05, 0.95, 0.90, 0.88, 0.92, 0.98],
    "Sugarcane": [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00],
    "Maize":     [1.05, 1.08, 1.10, 1.12, 1.08, 1.00, 0.92, 0.88, 0.90, 0.95, 1.00, 1.03],
}
```

Index values above 1.0 = price is higher than average (good for farmer).
Index values below 1.0 = price is lower than average (oversupply at harvest).

**Harvest month calculation:**
$$t_{\text{harvest}} = (t_{\text{sow}} + \text{duration}) \bmod 12$$

**Example:**
- Sow: November = index 10
- Duration: 4 months (Wheat)
- Harvest month: (10 + 4) mod 12 = **2 = March**
- March multiplier for Wheat = **1.05** (5% above average)
- Base price from CSV = ₹2949.5
- **Predicted harvest price = ₹2949.5 × 1.05 = ₹3097**

This is shown as: *"📈 Higher than average"*

---

## 3.4 Step 2: Telemetry Risk Adjustment (The ML Part)

The base revenue assumes ideal conditions. The ML engine adjusts it based on **real-world satellite + weather + soil data**.

**The formula** (from `scoring.py` line 41 — exact code):
```python
composite_multiplier = (ndvi * 0.45) + (weather * 0.35) + (soil * 0.20)
adjusted_revenue = base_revenue * composite_multiplier
```

**Why these weights?**

| Factor | Weight | Source | Scientific Reason |
|---|---|---|---|
| **NDVI** | **45%** | Sentinel-2 satellite | If the crop is dead, nothing else matters. Biological ground truth. |
| **Weather (IMD)** | **35%** | IMD / Open-Meteo API | Drought or flood is the #1 cause of crop failure in Maharashtra. |
| **Soil (N-P-K)** | **20%** | Regional database | Important but doesn't change catastrophically year to year. |

**Where each score comes from:**

**NDVI Score** (`ndvi_real.py`):
- Fetches real B08 (NIR) and B04 (Red) values from Sentinel Hub
- Calculates NDVI = (B08 - B04) / (B08 + B04)
- Score ranges: 0.0 (dead) to 1.2 (exceptional)

**Weather Score** (`imd_service.py`):
- Fetches temperature, humidity, rainfall from IMD/Open-Meteo
- Score above 1.0 = favorable conditions, below 1.0 = stress

**Soil Score** (`scoring.py`):
- Based on district-level N-P-K data
- Score ranges: 0.95 (slight deficiency) to 1.10 (optimal)

---

## 3.5 Step 3: Multi-Year Crop Succession Engine

For a loan lasting 2 or 3 years, one crop's revenue is not enough. The engine projects the **entire sequence of crops** the farmer will grow across the loan tenure.

**File:** `ml_service/crop_succession.py`

**Why crop rotation?** Agronomic science says you cannot plant the same crop every season:
- Monoculture depletes specific soil nutrients (e.g., Wheat depletes nitrogen)
- Pests and diseases build up for the same crop
- Crop rotation is necessary for sustainable farming

**The rotation logic:**
After Wheat (Rabi season, Nov–Mar) → **Summer Mung Bean / Pulses** (Zaid season)
- Leguminous plants fix atmospheric nitrogen into the soil
- Reduces fertilizer cost by ~25% for the next season
- Ready in 65 days, giving quick cash income between main crops

**Succession plan example (1-year loan, starting November):**

| Cycle | Crop | Period | Revenue |
|---|---|---|---|
| 1 | Wheat (current) | Nov → Mar (4 months) | ₹85,000 |
| 2 | Summer Mung Bean | Mar → Jun (3 months) | ₹42,000 |
| 3 | Kharif Rice | Jun → Nov (5 months) | ₹76,000 |
| **Total** | | **12 months** | **₹2,03,000** |

---

## 3.6 Step 4: The 60% Safe Credit Cap

This is the most important safety rule in the entire system.

**The formula:**
$$\text{Maximum Loan} = \text{Total Tenure Revenue} \times 0.60$$

**Why 60%?**

Farming has real operating costs that consume revenue:
- Seeds: ~8–12% of revenue
- Fertilizer: ~10–15% of revenue
- Labour (sowing, harvesting): ~8–12% of revenue
- Water/irrigation: ~5–8% of revenue
- Transport to mandi: ~3–5% of revenue
- Total operating costs: **~34–52% of revenue**

By capping the loan at 60% of gross revenue, there is a **40% built-in safety margin**. Even if prices drop 15% or yield drops 20%, the farmer still has enough revenue to repay.

This is the agricultural equivalent of the corporate **Debt Service Coverage Ratio (DSCR)**, which banks worldwide use to ensure loan safety.

**What happens if the farmer cannot repay?** The 40% margin absorbs:
- Price shocks (mandi price drops due to oversupply)
- Yield shortfalls (drought, pest damage)
- Unexpected costs (crop disease treatment)

---

## 3.7 Complete Worked Example

**Inputs:**
- Farmer: Nashik district, Maharashtra
- Crop: Wheat, sown in November
- Land: 2.5 Hectares
- Loan tenure: 1 year

**Step 1 — Base Revenue:**
- Historical yield: 1.38 T/Ha (from CSV)
- Harvest month: March (Nov + 4 months)
- March price for Wheat: ₹2949.5 × 1.05 = ₹3097/quintal
- Base Revenue = 2.5 × 1.38 × 10 × 3097 = **₹1,06,854**

**Step 2 — Telemetry Adjustment:**
- NDVI score: 1.12 (dense vegetation)
- Weather score: 1.05 (favorable IMD)
- Soil score: 1.02 (optimal N-P-K)
- Composite = (1.12×0.45) + (1.05×0.35) + (1.02×0.20) = 0.504 + 0.368 + 0.204 = **1.076**
- Adjusted Revenue = ₹1,06,854 × 1.076 = **₹1,14,975**

**Step 3 — Total Succession Revenue:**
- Cycle 1 (Wheat): ₹1,14,975
- Cycle 2 (Mung Bean): ₹57,000
- Cycle 3 (Kharif Rice): ₹97,000
- **Total = ₹2,68,975**

**Step 4 — Safe Loan Cap:**
- ₹2,68,975 × 0.60 = **₹1,61,385** (recommended maximum loan)
