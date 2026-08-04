# Line-by-Line Code Breakdown: `ml_service/data_loader.py`

## File Overview
- **File Location**: `ml_service/data_loader.py`
- **Total Lines**: 125
- **Purpose**: Parses agricultural yield CSV datasets, loads historical mandi price datasets, implements seasonal harvest-month price prediction algorithms, and computes regional base yield metrics.

---

## Detailed Line-by-Line Explanation

```python
1: import pandas as pd
2: import os
3: import numpy as np
```
- **Line 1**: Imports `pandas` library for reading and manipulating tabular CSV datasets.
- **Line 2**: Imports `os` module for constructing cross-platform directory paths.
- **Line 3**: Imports `numpy` for mathematical arrays and NaN value handling.

```python
5: DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
```
- **Line 5**: Constructs absolute filepath pointing to the `ml_service/data/` folder containing CSV datasets.

---

### Constant Declarations (Lines 10-27)

```python
10: SEASONAL_PRICE_INDEX = {
11:     "Wheat":     [1.15, 1.10, 1.05, 0.88, 0.85, 0.90, 0.92, 0.95, 1.00, 1.05, 1.08, 1.12],
12:     "Rice":      [0.95, 0.98, 1.00, 1.05, 1.08, 1.10, 1.05, 0.90, 0.85, 0.88, 0.92, 0.95],
13:     "Cotton":    [1.00, 1.02, 1.05, 1.08, 1.10, 1.12, 1.05, 0.95, 0.90, 0.88, 0.92, 0.98],
14:     "Sugarcane": [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00],
15:     "Maize":     [1.05, 1.08, 1.10, 1.12, 1.08, 1.00, 0.92, 0.88, 0.90, 0.95, 1.00, 1.03],
16: }
```
- **Lines 10–16**: **Seasonal Commodity Price Index Matrix**:
  Contains 12 monthly price multipliers (Jan=idx 0 ... Dec=idx 11). For instance, Wheat in March (`idx 2`) has multiplier `1.05` (+5% premium) reflecting high market demand at harvest commencement.

```python
18: CROP_DURATION_MONTHS = {
19:     "Wheat": 4,
20:     "Rice": 5,
21:     "Cotton": 6,
22:     "Sugarcane": 12,
23:     "Maize": 3,
24: }
```
- **Lines 18–24**: Dictionary storing standard agronomic growing durations (in months) for supported crops.

```python
26: MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
27:                "July", "August", "September", "October", "November", "December"]
```
- **Lines 26–27**: Array mapping integer month indices (0–11) to English month names.

---

### Dataset Loaders (Lines 29-47)

```python
29: def load_crop_yield_data():
32:         df = pd.read_csv(os.path.join(DATA_DIR, 'Crop Yeild Data(1).csv'))
33:         df.columns = df.columns.str.strip().str.lower()
34:         return df
```
- **Lines 29–37**: Reads `Crop Yeild Data(1).csv` containing historical state/crop yield records in **Tonnes per Hectare (T/Ha)**. Cleans column headers by stripping whitespace and converting to lowercase.

```python
39: def load_mandi_price_data():
42:         df = pd.read_csv(os.path.join(DATA_DIR, 'monthy wheat , mandi price.csv'), skiprows=1)
43:         df.columns = df.columns.str.strip().str.lower()
44:         return df
```
- **Lines 39–47**: Reads `monthy wheat , mandi price.csv` containing monthly agricultural wholesale market modal prices in **Rupees per Quintal (₹/Quintal)**. Skips metadata header line.

---

### Function 3: `get_predicted_harvest_price` (Lines 49-87) — Seasonal Prediction Engine

```python
49: def get_predicted_harvest_price(crop: str, sow_month_idx: int, crop_duration_months: int = None) -> dict:
55:     duration = crop_duration_months or CROP_DURATION_MONTHS.get(crop, 4)
56:     harvest_month_idx = (sow_month_idx + duration) % 12
57:     harvest_month_name = MONTH_NAMES[harvest_month_idx]
```
- **Line 55**: Gets crop growing duration in months.
- **Line 56**: **Modulus Harvest Month Formula**:
  $$t_{\text{harvest}} = (t_{\text{sow}} + d) \bmod 12$$
  *Example*: Wheat planted in November (`idx 10`) + 4 months = `14 mod 12 = 2` $\rightarrow$ **March**.

```python
60:     price_df = load_mandi_price_data()
63:         price_col = [col for col in price_df.columns if 'modal price' in col]
65:             mask = price_df['commodity'].str.lower() == crop.lower()
68:                 base_price = float(filtered[price_col[0]].mean())
```
- **Lines 60–68**: Filters mandi price CSV for matching crop commodity and calculates baseline mean modal price.

```python
70:     if base_price == 0 or pd.isna(base_price):
72:         defaults = {"Wheat": 2200, "Rice": 2100, "Cotton": 6000, "Sugarcane": 350, "Maize": 1800}
73:         base_price = defaults.get(crop, 2200)
```
- **Lines 70–73**: Applies sensible historical commodity price fallbacks if CSV dataset is empty or unreadable.

```python
76:     seasonal_idx = SEASONAL_PRICE_INDEX.get(crop, [1.0] * 12)
77:     multiplier = seasonal_idx[harvest_month_idx]
78:     predicted_price = round(base_price * multiplier, 2)
```
- **Lines 76–78**: **Seasonal Forecast Price Calculation**:
  $$\text{Predicted Harvest Price} = \text{Base Price} \times \text{Seasonal Multiplier}[t_{\text{harvest}}]$$

```python
80:     return {
81:         "sow_month": MONTH_NAMES[sow_month_idx],
82:         "harvest_month": harvest_month_name,
83:         "base_historical_price": round(base_price, 2),
84:         "seasonal_multiplier": round(multiplier, 3),
85:         "predicted_harvest_price_rs_per_quintal": predicted_price,
86:         "price_trend": "📈 Higher than average" if multiplier > 1.02 else ("📉 Lower than average" if multiplier < 0.95 else "➡️ Near average"),
87:     }
```
- **Lines 80–87**: Returns dictionary containing sowing month, harvest month, seasonal multiplier, predicted price in ₹/Quintal, and price trend badge.

---

### Function 4: `get_historical_averages` (Lines 89-124)

```python
89: def get_historical_averages(state: str, crop: str, sow_month_idx: int = 10, crop_duration_months: int = None):
94:     yield_df = load_crop_yield_data()
100:        mask = (
101:            (yield_df['state'].str.lower() == state.lower()) &
102:            (yield_df['crop'].str.lower() == crop.lower())
103:        )
106:            avg_yield = filtered_yield['yield'].mean()
```
- **Lines 89–106**: Filters crop yield dataset by state and crop name, computing mean historical yield in **Tonnes per Hectare (T/Ha)**.

```python
117:    harvest_price_data = get_predicted_harvest_price(crop, sow_month_idx, crop_duration_months)
118:    predicted_price = harvest_price_data["predicted_harvest_price_rs_per_quintal"]
120:    return {
121:        "historical_yield_tonnes_per_hectare": round(float(avg_yield), 2),
122:        "price_rs_per_quintal": predicted_price,
123:        "price_prediction": harvest_price_data,
124:    }
```
- **Lines 117–124**: Combines historical yield T/Ha with predicted harvest-month mandi price into a unified baseline metric payload.
