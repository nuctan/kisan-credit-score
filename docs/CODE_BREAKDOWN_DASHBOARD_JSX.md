# Line-by-Line Code Breakdown: `frontend/src/pages/Dashboard.jsx`

## File Overview
- **File Location**: `frontend/src/pages/Dashboard.jsx`
- **Total Lines**: 666
- **Purpose**: Main single-page controller orchestrating GIS map rendering, form inputs, backend API analysis requests, real-time context syncing, Web Speech API voice input, and top-level language selection.

---

## Detailed Line-by-Line Explanation

```jsx
1: import React, { useState, useEffect, useRef } from 'react';
4: import FarmlandMap from '../components/FarmlandMap';
5: import LandAnalysisCard from '../components/LandAnalysisCard';
7: import CalculationBreakdown from '../components/CalculationBreakdown';
8: import PDFReportButton from '../components/PDFReportButton';
10: import SatelliteTrendChart from '../components/SatelliteTrendChart';
11: import { translations } from '../utils/translations';
12: import { INDIA_STATES_DISTRICTS } from '../utils/indiaDistricts';
```
- **Lines 1–12**: Imports React hooks, child view components, bilingual translation dictionary (`translations.js`), and Maharashtra 36 district GPS coordinate mapping (`indiaDistricts.js`).

```jsx
45: const Dashboard = () => {
53:   const [formState, setFormState] = useState({
54:     state: 'Maharashtra', district: '', crop: '', areaHectares: '',
58:     loanTenureYears: 1, startMonthIndex: 10, cropDurationMonths: 4
59:   });
63:   const [selectedPos, setSelectedPos] = useState([19.0958, 74.7496]);
66:   const [lang, setLang] = useState('hi');
67:   const [chatLang, setChatLang] = useState('hi');
68:   const [isListening, setIsListening] = useState(false);
```
- **Lines 45–70**: Component state initialization:
  - `formState`: User farm selections (unselected defaults for new users).
  - `selectedPos`: Centroid GPS coordinates (default: Ahilyanagar `[19.0958, 74.7496]`).
  - `lang`: Project-wide language (`hi`/`en`).
  - `chatLang`: Chatbot voice language (5 regional languages).
  - `isListening`: Web Speech API mic active boolean indicator.

```jsx
110: const handleDistrictChange = (newDistrictName) => {
112:   const distObj = currentDistricts.find(d => d.name === newDistrictName);
114:   if (distObj && distObj.coords) setSelectedPos(distObj.coords);
115: };
```
- **Lines 110–117**: District Dropdown Controller — Auto-centers satellite map (`setSelectedPos`) to district centroid GPS upon selection.

```jsx
120: const handleCropChange = (newCrop) => {
121:   const autoDur = AUTO_CROP_DURATIONS[newCrop] || 4;
123:   setFormState(prev => ({ ...prev, crop: newCrop, cropDurationMonths: autoDur }));
127: };
```
- **Lines 120–127**: Auto Crop Duration Lookup — Automatically assigns biological duration (e.g. Wheat = 4 months, Sugarcane = 12 months) when crop is selected.

```jsx
182: const handleConfirmSelection = async (posCoords, hectaresFromMap) => {
200:   const res = await axios.post(`${API_URL}/ai/analyze`, payload);
201:   setAnalysisData(res.data);
205:   await axios.put(`${API_URL}/auth/profile`, { ...formState, suggestedLoanLimit: res.data.predictions.suggested_loan_limit_rs }, ...);
208: };
```
- **Lines 182–208**: **Main Analysis Controller**:
  Dispatches POST request to `/api/ai/analyze`, receives satellite telemetry & scoring payload, updates `analysisData` state to render cards, and updates user profile in MongoDB.

---

### Web Speech API Voice Recognition Handler (Lines 590-625)

```jsx
595: const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
602: if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
603:   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
605:   stream.getTracks().forEach(track => track.stop());
606: }
```
- **Lines 595–606**: **Browser Microphone Permission Trigger**:
  Calls `navigator.mediaDevices.getUserMedia({ audio: true })` first to force native browser permission prompt (`Allow Microphone`).

```jsx
607: const recognition = new SpeechRecognition();
608: const langCodes = { hi: 'hi-IN', en: 'en-US', mr: 'mr-IN', gu: 'gu-IN', ta: 'ta-IN' };
609: recognition.lang = langCodes[chatLang] || 'hi-IN';
616: recognition.onresult = (event) => {
617:   const transcript = event.results[0][0].transcript;
618:   setInput(prev => (prev ? prev + ' ' + transcript : transcript));
619: };
621: recognition.start();
```
- **Lines 607–621**: Configures Web Speech API recognition language based on `chatLang`, captures spoken voice transcript, and appends text directly to chatbot input field.
