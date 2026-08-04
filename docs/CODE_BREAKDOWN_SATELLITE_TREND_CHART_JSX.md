# Line-by-Line Code Breakdown: `frontend/src/components/SatelliteTrendChart.jsx`

## File Overview
- **File Location**: `frontend/src/components/SatelliteTrendChart.jsx`
- **Total Lines**: 212
- **Purpose**: Fetches 12-month district satellite NDVI and precipitation data from `/api/ndvi-weather-trends` and renders a dual-axis interactive SVG chart comparing greenness curves against rainfall bars.

---

## Detailed Line-by-Line Explanation

```jsx
1: import React, { useState, useEffect } from 'react';
2: import axios from 'axios';
```
- **Lines 1–2**: Imports React hooks and `axios` HTTP client.

```jsx
4: const SatelliteTrendChart = ({ district = 'Ahilyanagar (Ahmednagar)', crop = 'Wheat', t, lang = 'hi' }) => {
9:     const fetchTrends = async () => {
12:         const res = await axios.post('http://localhost:8000/api/ndvi-weather-trends', {
13:           district, crop
14:         });
16:         setTrendData(res.data);
```
- **Lines 4–25**: Accepts district, crop, and language props. Queries Python FastAPI backend endpoint `/api/ndvi-weather-trends` on district prop updates.

```jsx
47: if (ndvi >= 0.65) {
48:   badge = lang === 'en' ? '🟢 Excellent' : '🟢 उत्कृष्ट (Excellent)';
50:   impact = 'Dense, healthy vegetation. High yield expected. Most favorable for bank loan approval.';
53: } else if (ndvi >= 0.40) { ... }
```
- **Lines 44–65**: Agronomic interpretation rules assigning health badges (Excellent $\ge 0.65$, Moderate $\ge 0.40$, Stress $< 0.40$) and bank loan risk explanations.

```jsx
83: <p className="text-[10px] text-blue-600 font-semibold">
84:   📍 This is 12-month district historical NDVI average — Land Report NDVI is your farm's real-time satellite reading
85: </p>
```
- **Lines 83–87**: Explains the difference between district historical 12-month chart average vs. real-time farm plot satellite NDVI.

---

### SVG Dual-Axis Chart Renderer (Lines 100-210)

```jsx
120: {monthly.map((m, idx) => {
121:   const barHeight = (m.rainfall_mm / maxRain) * 120;
122:   return (
123:     <rect key={idx} x={idx * 40 + 20} y={150 - barHeight} width="16" height={barHeight} fill="#60A5FA" opacity="0.65" />
124:   );
125: })}
```
- **Lines 120–125**: **Rainfall Bar SVG Renderer**: Scales monthly rainfall millimeters (`m.rainfall_mm`) to SVG Y-coordinates and draws light blue `<rect>` bars.

```jsx
130: const points = monthly.map((m, idx) => {
131:   const x = idx * 40 + 28;
132:   const y = 150 - (m.ndvi * 120);
133:   return `${x},${y}`;
134: }).join(' ');
```
- **Lines 130–134**: **Satellite NDVI Curve Coordinate Generator**: Converts 12 monthly NDVI float values ($0.0 \dots 1.0$) into SVG coordinate pairs `(x, y)`.

```jsx
140: <polyline fill="none" stroke="#2D6A4F" strokeWidth="3" points={points} />
```
- **Line 140**: Draws continuous forest green (`#2D6A4F`) `<polyline>` curve visualizing the 12-month NDVI trajectory across seasons.
