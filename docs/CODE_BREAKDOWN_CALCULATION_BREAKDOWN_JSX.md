# Line-by-Line Code Breakdown: `frontend/src/components/CalculationBreakdown.jsx`

## File Overview
- **File Location**: `frontend/src/components/CalculationBreakdown.jsx`
- **Total Lines**: 142
- **Purpose**: Displays a transparent 4-step mathematical breakdown card explaining how loan eligibility was calculated (Base Revenue $\rightarrow$ Telemetry Risk Adjustment $\rightarrow$ Multi-Year Succession $\rightarrow$ 60% DSCR Safe Credit Cap).

---

## Detailed Line-by-Line Explanation

```jsx
3: const CalculationBreakdown = ({ analysisData, formState, t, lang = 'hi' }) => {
4:   if (!analysisData) return null;
6:   const { baseline_metrics, ai_scores, predictions, one_year_succession_plan } = analysisData;
```
- **Lines 3–6**: Component definition. Checks if `analysisData` exists; if empty, renders `null`. Destructures response payloads.

```jsx
10:   const areaHectares = parseFloat(formState?.areaHectares) || 2.5;
11:   const yieldTonnes = baseline_metrics?.historical_yield_tonnes_per_hectare || 3.5;
12:   const mandiPrice = baseline_metrics?.market_price_rs_per_quintal || 2275;
```
- **Lines 10–12**: Extracts land area, historical yield (Tonnes/Ha), and harvest-month mandi price (₹/Quintal).

```jsx
14:   const baseRev = baseline_metrics?.base_estimated_revenue_rs || (areaHectares * yieldTonnes * 10 * mandiPrice);
15:   const adjustedRev = predictions?.adjusted_estimated_revenue_rs || baseRev;
16:   const totalCombinedRev = predictions?.total_1year_combined_revenue_rs || (adjustedRev * 2.2);
17:   const safeLoanCap = predictions?.suggested_loan_limit_rs || Math.round(totalCombinedRev * 0.60);
```
- **Lines 14–17**: **Core Financial Variables**:
  - `baseRev`: $10 \times \text{Area} \times \text{Yield} \times \text{Price}$.
  - `adjustedRev`: Base Rev multiplied by composite risk factor.
  - `totalCombinedRev`: Total multi-season rotation income across loan tenure.
  - `safeLoanCap`: Final 60% safe loan limit cap.

---

### Step-by-Step UI Render (Lines 26-140)

```jsx
31: <h2 className="text-4xl font-black text-white mt-1">
32:   ₹{Math.round(safeLoanCap).toLocaleString('en-IN')}
33: </h2>
```
- **Lines 31–33**: Top Green Banner displaying the final **Bank Approved Maximum Loan Amount** formatted in Indian Rupee locale format (`en-IN`).

```jsx
73: Formula: Area ({areaHectares} Ha) × Hist Yield ({yieldTonnes} T) × 10 Quintals × Estimated Price (₹{mandiPrice})
85: = ₹{Math.round(baseRev).toLocaleString('en-IN')}
```
- **Lines 73–85**: **Step 1 Card**: Displays base revenue calculation and predicted harvest-month mandi price trend badge.

```jsx
97: Formula: Base Rev × [ (NDVI: {ndviScore} × 45%) + (IMD Weather: {weatherScore} × 35%) + (Soil: {soilScore} × 20%) ]
101: = ₹{Math.round(adjustedRev).toLocaleString('en-IN')}
```
- **Lines 97–101**: **Step 2 Card**: Displays Telemetry Composite Risk Multiplier formula combining satellite NDVI (45%), IMD weather (35%), and soil N-P-K (20%).

```jsx
114: Combined revenue of succession crop cycles across {formState?.loanTenureYears || 1}-year tenure
118: = ₹{Math.round(totalCombinedRev).toLocaleString('en-IN')}
```
- **Lines 114–118**: **Step 3 Card**: Displays total multi-season rotation income across loan tenure.

```jsx
131: Formula: Total Combined Income (₹{Math.round(totalCombinedRev).toLocaleString('en-IN')}) × 60% Safe Credit Cap
136: = ₹{Math.round(safeLoanCap).toLocaleString('en-IN')}
```
- **Lines 131–136**: **Step 4 Card**: Displays final **60% Safe Credit Cap (DSCR Rule)** formula enforcing a 40% margin of safety to absorb market shocks.
