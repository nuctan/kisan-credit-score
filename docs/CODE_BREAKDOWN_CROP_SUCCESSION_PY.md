# Line-by-Line Code Breakdown: `ml_service/crop_succession.py`

## File Overview
- **File Location**: `ml_service/crop_succession.py`
- **Total Lines**: 158
- **Purpose**: Computes multi-year agronomic crop rotation cycles across loan tenure (1–5 years), calculates next optimal sowing dates post-harvest, recommends nitrogen-fixing leguminous crops, and enforces the **60% Safe Credit Cap (DSCR Rule)**.

---

## Detailed Line-by-Line Explanation

```python
1: MONTH_NAMES = [
2:     "जनवरी (January)", "फ़रवरी (February)", "मार्च (March)", "अप्रैल (April)",
3:     "मई (May)", "जून (June)", "जुलाई (July)", "अगस्त (August)",
4:     "सितंबर (September)", "अक्टूबर (October)", "नवंबर (November)", "दिसंबर (December)"
5: ]
```
- **Lines 1–5**: Bilingual month name lookup array indexed 0 to 11.

```python
12: DEFAULT_CROP_DURATIONS = {
13:     "wheat": 4,      # ~120 days
14:     "rice": 5,       # ~150 days
15:     "cotton": 6,     # ~180 days
16:     "sugarcane": 12, # ~365 days
17:     "maize": 3       # ~90 days
18: }
```
- **Lines 12–18**: Standard agronomic growing durations in months for baseline crops.

```python
20: def get_default_crop_duration(crop_name: str) -> int:
22:     crop_lower = crop_name.lower().strip()
23:     for key, duration in DEFAULT_CROP_DURATIONS.items():
24:         if key in crop_lower:
25:             return duration
26:     return 4  # Default fallback 4 months
```
- **Lines 20–26**: Helper function parsing crop names and returning biological growth duration.

---

### Function 2: `get_multiyear_crop_succession_plan` (Lines 28-157) — Core Rotation Engine

```python
28: def get_multiyear_crop_succession_plan(
29:     current_crop: str, 
30:     area_hectares: float, 
31:     current_crop_revenue: float,
32:     loan_tenure_years: int = 1,
33:     start_month_index: int = 10, # default November (idx 10)
34:     current_crop_duration: int = None
35: ):
```
- **Lines 28–35**: Main function definition accepting current crop, land area, current cycle revenue, loan tenure (1–5 years), and sowing month index.

```python
43:     total_months = loan_tenure_years * 12
46:     first_harvest_month_idx = (start_month_index + current_crop_duration) % 12
```
- **Line 43**: Converts loan tenure years into total loan months (e.g. 2 years = 24 months).
- **Line 46**: Computes first crop harvest month using modulus arithmetic:
  $$t_{\text{harvest}} = (t_{\text{sow}} + d) \bmod 12$$

```python
52:     next_crop_decision = {
53:         "current_crop": current_crop,
54:         "sowing_start": MONTH_NAMES[start_month_index],
55:         "harvest_expected": MONTH_NAMES[first_harvest_month_idx],
56:         "soil_prep_window": f"15-20 दिन भूमि सुधार अवधिक ({MONTH_NAMES[first_harvest_month_idx]} अंत)",
57:         "recommended_next_crop": "ग्रीष्मकालीन मूंग दलहन (Summer Mung Bean / Pulses)" if "wheat" in current_crop.lower() else "गेहूं / सरसों (Rabi Wheat/Mustard)",
58:         "recommended_next_sow_date": f"1st Week of {MONTH_NAMES[next_sow_month_idx]} ({MONTH_NAMES[next_sow_month_idx]} का पहला सप्ताह)",
60:         "agronomic_reason": "गेहूं कटाई के बाद दलहन उगाने से मिट्टी में प्राकृतिक नाइट्रोजन जमता है एवं कम पानी में 65 दिनों में नकद आय मिलती है।"
61:     }
```
- **Lines 52–61**: Constructs **Next Sowing Decision Engine**: Recommends planting leguminous Mung Beans post-Wheat. Legumes fix atmospheric Nitrogen into the soil, reducing subsequent fertilizer expenses by ~25%.

```python
66:     succession_cycles.append({
67:         "cycle_number": 1,
68:         "year": 1,
69:         "period": f"महीने 1 - {current_crop_duration} ({MONTH_NAMES[start_month_index]} बुआई ➔ {MONTH_NAMES[first_harvest_month_idx]} कटाई)",
70:         "crop": f"{current_crop} (वर्तमान फसल)",
74:         "estimated_revenue_rs": round(current_crop_revenue, 2),
76:         "status": "वर्तमान में उगाई जा रही है"
77:     })
```
- **Lines 66–77**: Appends Cycle 1 (current crop) to succession cycles array with telemetry-adjusted revenue.

```python
84:     rotation_pool = [
85:         {"crop": "मूंग दलहन (Mung Bean / Pulses)", "rev_per_ha": 38000, "duration": 3, "impact": "मिट्टी में नाइट्रोजन निर्धारण (N-Fixation)"},
93:         {"crop": "धान / मक्का (Paddy / Maize)", "rev_per_ha": 86000, "duration": 5, "impact": "उच्च मानसून पैदावार"},
100:        {"crop": "गेहूं / सरसों (Wheat / Mustard)", "rev_per_ha": 82000, "duration": 4, "impact": "रबी सीजन उच्च बाजार मूल्य"},
107:        {"crop": "सूरजमुखी / सब्जियां (Sunflower / Vegetables)", "rev_per_ha": 45000, "duration": 3, "impact": "त्वरित नकद आय एवं नमी संरक्षण"}
113:    ]
```
- **Lines 84–113**: Agronomic Crop Rotation Pool definitions containing seasonal duration, revenue per hectare, and soil impact properties.

```python
116:    while remaining_months > 0:
117:        rot = rotation_pool[pool_idx % len(rotation_pool)]
118:        duration = min(rot["duration"], remaining_months)
119:        end_month_idx = (current_month_cursor + duration) % 12
122:        cycle_rev = round(area_hectares * rot["rev_per_ha"] * (1 + (year_num * 0.03)), 2)
```
- **Lines 116–122**: Iterates across remaining loan months, building crop rotation timelines. Applies a 3% annual compound productivity inflation multiplier $(1 + 0.03 \cdot \text{year})$.

```python
143:    total_combined_revenue = sum(c["estimated_revenue_rs"] for c in succession_cycles)
145:    safe_loan_cap = round(total_combined_revenue * 0.60, 2)
```
- **Lines 143–145**: **The 60% Safe Credit Cap Formula**:
  $$\text{Max Approved Credit Limit} = \left( \sum_{i=1}^{\text{Cycles}} \text{Revenue}_i \right) \times 0.60$$
  Enforces a 40% safety margin based on corporate Debt Service Coverage Ratio (DSCR) rules to absorb price drops or yield shortfalls.

```python
147:    return {
148:        "loan_tenure_years": loan_tenure_years,
154:        "total_annual_combined_revenue_rs": round(total_combined_revenue, 2),
155:        "one_year_loan_eligibility_cap_rs": safe_loan_cap,
156:        "repayment_capacity_score": "उच्च (High Repayment Capacity)" if safe_loan_cap > 150000 else "सामान्य"
157:    }
```
- **Lines 147–157**: Returns complete multi-year succession plan payload to backend API controller.
