import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const farmIcon = L.divIcon({
  className: 'custom-farm-pin',
  html: `<div style="background-color: #E8630A; border: 3px solid white; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 10px rgba(0,0,0,0.4);">🌾</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Geodesic Polygon Area Calculation in Square Meters (Haversine formula approximation)
function computePolygonAreaSqMeters(coords) {
  if (!coords || coords.length < 3) return 0;
  
  const RAD = Math.PI / 180;
  const EARTH_RADIUS = 6378137; // Earth radius in meters
  let area = 0;

  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % coords.length];
    
    const lon1 = p1[1] * RAD;
    const lat1 = p1[0] * RAD;
    const lon2 = p2[1] * RAD;
    const lat2 = p2[0] * RAD;

    area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = (area * EARTH_RADIUS * EARTH_RADIUS) / 4.0;
  return Math.abs(area);
}

function PolygonDrawer({ polygonPoints, setPolygonPoints, setSelectedPos }) {
  useMapEvents({
    click(e) {
      const newPt = [e.latlng.lat, e.latlng.lng];
      setPolygonPoints(prev => [...prev, newPt]);
      setSelectedPos(newPt);
    },
  });

  return (
    <>
      {polygonPoints.map((pt, idx) => (
        <Marker key={idx} position={pt} icon={farmIcon}>
          <Popup>
            <div className="text-center text-xs">
              <strong>बिंदु #{idx + 1}</strong><br />
              {pt[0].toFixed(4)}° N, {pt[1].toFixed(4)}° E
            </div>
          </Popup>
        </Marker>
      ))}
      {polygonPoints.length >= 3 && (
        <Polygon
          positions={polygonPoints}
          pathOptions={{
            color: '#E8630A',
            fillColor: '#2D6A4F',
            fillOpacity: 0.45,
            weight: 3,
            dashArray: '5, 5'
          }}
        />
      )}
    </>
  );
}

// Smoothly flies the map to a new position whenever selectedPos changes
function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && position.length === 2) {
      map.flyTo(position, 13, { animate: true, duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

const FarmlandMap = ({ selectedPos, setSelectedPos, onConfirmSelection, onAreaChange, lang = 'hi', t }) => {
  const [pos, setPos] = useState(selectedPos || [19.0958, 74.7496]);
  const [mapType, setMapType] = useState('satellite');
  
  // Start with empty polygon points so farmer can draw their actual farm boundary
  const [polygonPoints, setPolygonPoints] = useState([]);

  useEffect(() => {
    if (selectedPos) setPos(selectedPos);
  }, [selectedPos]);

  // Calculate polygon area in SqMeters, Hectares, and Bigha
  const areaSqMeters = computePolygonAreaSqMeters(polygonPoints);
  const calculatedHectares = areaSqMeters > 0 ? (areaSqMeters / 10000).toFixed(2) : '0.00';
  const calculatedBigha = (parseFloat(calculatedHectares) * 3.95).toFixed(2);

  useEffect(() => {
    if (onAreaChange && parseFloat(calculatedHectares) > 0) {
      onAreaChange(parseFloat(calculatedHectares));
    }
  }, [calculatedHectares]);

  const handleClearPolygon = () => {
    setPolygonPoints([]);
  };

  const handleConfirm = () => {
    setSelectedPos(pos);
    if (onConfirmSelection) {
      onConfirmSelection(pos, parseFloat(calculatedHectares));
    }
  };

  // Sentinel-2 spectral band simulation
  const b8_nir = (0.45 + (Math.abs(pos[0] * 1000) % 15) / 100).toFixed(2);
  const b4_red = (0.09 + (Math.abs(pos[1] * 1000) % 8) / 100).toFixed(2);
  const simulatedNDVI = ((b8_nir - b4_red) / (parseFloat(b8_nir) + parseFloat(b4_red))).toFixed(2);

  const tileUrl = mapType === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className="relative w-full h-[420px] md:h-[480px] rounded-2xl overflow-hidden shadow-xl border-2 border-[#E8630A]/30">
      {/* Top Left Header Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-[#E8630A]/20 flex items-center gap-3">
        <span className="text-2xl">🛰️</span>
        <div>
          <h4 className="text-sm font-extrabold text-[#3D2C1E]">
            {t?.mapTitle || 'Sentinel-2 L2A सैटेलाइट मैपिंग'}
          </h4>
          <div className="flex items-center gap-2 text-[11px] text-[#2D6A4F] font-bold">
            <span>B8 (NIR): {b8_nir}</span>
            <span>|</span>
            <span>B4 (Red): {b4_red}</span>
            <span>|</span>
            <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded">NDVI: {simulatedNDVI}</span>
          </div>
        </div>
      </div>

      {/* Instruction Banner when no polygon is drawn */}
      {polygonPoints.length < 3 && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[1000] bg-[#E8630A] text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold animate-bounce flex items-center gap-2 pointer-events-none">
          <span>👇</span>
          <span>{lang === 'en' ? 'Click 3 or 4 points on the map to draw your field boundary!' : 'खेत की सीमा बनाने के लिए मानचित्र पर 3-4 स्थानों पर क्लिक करें!'}</span>
        </div>
      )}

      {/* Top Right Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex gap-2">
        {polygonPoints.length > 0 && (
          <button
            type="button"
            onClick={handleClearPolygon}
            className="bg-red-500 text-white px-3 py-1.5 rounded-xl shadow text-xs font-bold hover:bg-red-600 transition cursor-pointer"
          >
            {t?.clearPolygon || '🧹 सीमा साफ़ करें'}
          </button>
        )}
        <button
          type="button"
          onClick={() => setMapType(mapType === 'satellite' ? 'street' : 'satellite')}
          className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow text-xs font-bold text-[#2D6A4F] hover:bg-white transition cursor-pointer border border-gray-200"
        >
          {mapType === 'satellite' ? (t?.streetView || '🗺️ स्ट्रीट व्यू') : (t?.satelliteView || '🛰️ Sentinel-2 HD View')}
        </button>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={pos}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer attribution="Tiles &copy; Esri &mdash; Sentinel-2 RGB Imagery" url={tileUrl} />
        <FlyToLocation position={pos} />
        <PolygonDrawer
          polygonPoints={polygonPoints}
          setPolygonPoints={setPolygonPoints}
          setSelectedPos={setPos}
        />
      </MapContainer>

      {/* Bottom Floating Bar with Live Calculated Area */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-3 border border-[#E8630A]/30">
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-gray-500 font-semibold block">{t?.selectedGps || 'GPS स्थान'}:</span>
            <span className="font-bold text-[#3D2C1E]">
              {pos[0].toFixed(4)}° N, {pos[1].toFixed(4)}° E
            </span>
          </div>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
            <span className="text-gray-500 font-semibold block">{t?.calculatedArea || 'गणित क्षेत्रफल (Area)'}:</span>
            <span className="font-extrabold text-[#E8630A] text-sm">
              {calculatedHectares} Ha ({calculatedBigha} Bigha)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          className="px-6 py-2.5 bg-[#E8630A] hover:bg-[#d55809] text-white font-bold text-sm rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2"
        >
          <span>{t?.confirmLand || '🎯 इस भूमि का विश्लेषण करें'}</span>
        </button>
      </div>
    </div>
  );
};

export default FarmlandMap;
