# Line-by-Line Code Breakdown: `frontend/src/components/FarmlandMap.jsx`

## File Overview
- **File Location**: `frontend/src/components/FarmlandMap.jsx`
- **Total Lines**: 266
- **Purpose**: Implements the interactive React-Leaflet GIS map component supporting Esri satellite imagery rendering, interactive polygon field drawing, Spherical Excess geodesic surface area calculation, and Maharashtra calculation model bounds validation.

---

## Detailed Line-by-Line Explanation

```jsx
1: import React, { useState, useEffect } from 'react';
2: import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents, useMap } from 'react-leaflet';
3: import L from 'leaflet';
```
- **Lines 1–3**: Imports React hooks, React-Leaflet container components, and Leaflet core GIS library.

```jsx
5: delete L.Icon.Default.prototype._getIconUrl;
6: L.Icon.Default.mergeOptions({
7:   iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
8:   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
9:   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
10: });
```
- **Lines 5–10**: Fixes Leaflet default icon asset paths broken by Webpack/Vite bundlers.

```jsx
12: const farmIcon = L.divIcon({
13:   className: 'custom-farm-pin',
14:   html: `<div style="background-color: #E8630A; border: 3px solid white; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 10px rgba(0,0,0,0.4);">🌾</div>`,
15:   iconSize: [36, 36], iconAnchor: [18, 18],
16: });
```
- **Lines 12–16**: Defines custom circular HTML DivIcon displaying a wheat emoji `🌾` with saffron background (`#E8630A`).

```jsx
20: const MAHARASHTRA_BOUNDS = { minLat: 15.60, maxLat: 22.05, minLon: 72.60, maxLon: 80.90 };
27: function isInsideMaharashtra(lat, lon) {
28:   return (lat >= MAHARASHTRA_BOUNDS.minLat && lat <= MAHARASHTRA_BOUNDS.maxLat && lon >= MAHARASHTRA_BOUNDS.minLon && lon <= MAHARASHTRA_BOUNDS.maxLon);
29: }
```
- **Lines 20–34**: Bounding box check function testing if GPS coordinates lie inside Maharashtra state boundaries.

---

### Spherical Excess Geodesic Area Calculation (Lines 37-58) — Core GIS Math

```jsx
37: function computePolygonAreaSqMeters(coords) {
38:   if (!coords || coords.length < 3) return 0;
40:   const RAD = Math.PI / 180;
41:   const EARTH_RADIUS = 6378137; // Earth radius in meters
42:   let area = 0;
44:   for (let i = 0; i < coords.length; i++) {
45:     const p1 = coords[i];
46:     const p2 = coords[(i + 1) % coords.length];
48:     const lon1 = p1[1] * RAD; const lat1 = p1[0] * RAD;
50:     const lon2 = p2[1] * RAD; const lat2 = p2[0] * RAD;
53:     area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
54:   }
56:   area = (area * EARTH_RADIUS * EARTH_RADIUS) / 4.0;
57:   return Math.abs(area);
58: }
```
- **Lines 37–58**: **Spherical Excess Geodesic Area Formula**:
  $$\text{Area} = \frac{R^2}{4} \sum_{i=1}^{n} (\lambda_{i+1} - \lambda_i) (2 + \sin\phi_i + \sin\phi_{i+1})$$
  Computes exact surface ground area in square meters on an oblate spheroid Earth ($R = 6,378,137\text{ m}$).

---

### Map Event Drawer & Component (Lines 60-265)

```jsx
60: function PolygonDrawer({ polygonPoints, setPolygonPoints, lang = 'hi' }) {
61:   useMapEvents({
62:     click(e) {
65:       const newPt = [e.latlng.lat, e.latlng.lng];
66:       setPolygonPoints(prev => [...prev, newPt]);
67:     },
68:   });
```
- **Lines 60–68**: Registers Leaflet click event listener. Appends new GPS coordinate points to `polygonPoints` state array without triggering pan animations.

```jsx
146: const handleConfirm = () => {
148:   const isOutside = polygonPoints.some(pt => !isInsideMaharashtra(pt[0], pt[1])) || !isInsideMaharashtra(pos[0], pos[1]);
149:   if (isOutside) {
150:     alert('ℹ️ We are currently working on expanding our ML calculation model to your state! Right now, complete satellite valuation models are active for Maharashtra.');
151:     return;
152:   }
```
- **Lines 146–152**: Validates if selected farm points fall outside Maharashtra upon clicking **"Analyze Selected Farmland"**. Displays friendly expansion notice if outside.

```jsx
156: const tileUrl = mapType === 'satellite'
157:   ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
158:   : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
```
- **Lines 156–158**: Tile URL switcher toggling between **Esri World Imagery** satellite tiles and **OpenStreetMap** street tiles.

```jsx
202: <MapContainer center={pos} zoom={12} minZoom={3} maxZoom={18} style={{ width: '100%', height: '100%' }}>
210:   <TileLayer url={tileUrl} />
214:   <FlyToLocation position={selectedPos} />
215:   <PolygonDrawer polygonPoints={polygonPoints} setPolygonPoints={setPolygonPoints} lang={lang} />
220: </MapContainer>
```
- **Lines 202–220**: Instantiates MapContainer with smooth fly-to animations on district selection.
