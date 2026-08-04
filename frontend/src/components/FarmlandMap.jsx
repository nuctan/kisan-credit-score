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

// Bounding box bounds for Maharashtra State (Lat: 15.60 to 22.05, Lon: 72.60 to 80.90)
const MAHARASHTRA_BOUNDS = {
  minLat: 15.60,
  maxLat: 22.05,
  minLon: 72.60,
  maxLon: 80.90
};

function isInsideMaharashtra(lat, lon) {
  return (
    lat >= MAHARASHTRA_BOUNDS.minLat &&
    lat <= MAHARASHTRA_BOUNDS.maxLat &&
    lon >= MAHARASHTRA_BOUNDS.minLon &&
    lon <= MAHARASHTRA_BOUNDS.maxLon
  );
}

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

function PolygonDrawer({ polygonPoints, setPolygonPoints, lang = 'hi' }) {
  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;
      const newPt = [lat, lon];
      setPolygonPoints(prev => [...prev, newPt]);
    },
  });

  return (
    <>
      {polygonPoints.map((pt, idx) => (
        <Marker key={idx} position={pt} icon={farmIcon}>
          <Popup>
            <div className="text-center text-xs">
              <strong>{lang === 'en' ? `Point #${idx + 1}` : `बिंदु #${idx + 1}`}</strong><br />
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
    // Check if selected points fall outside Maharashtra state boundary
    const isOutside = polygonPoints.some(pt => !isInsideMaharashtra(pt[0], pt[1])) || !isInsideMaharashtra(pos[0], pos[1]);

    if (isOutside) {
      alert(
        lang === 'en'
          ? 'ℹ️ We are currently working on expanding our ML calculation model to your state! Right now, complete satellite valuation models are active for Maharashtra.'
          : 'ℹ️ हम वर्तमान में आपके राज्य के लिए अपने ML मॉडल का विस्तार कर रहे हैं! अभी के लिए, संपूर्ण सैटेलाइट क्रेडिट मूल्यांकन मॉडल केवल महाराष्ट्र के लिए सक्रिय हैं।'
      );
      return;
    }

    setSelectedPos(pos);
    if (onConfirmSelection) {
      onConfirmSelection(pos, parseFloat(calculatedHectares));
    }
  };

  const tileUrl = mapType === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  // Strict Maharashtra Bounds for Map Container
  const maharashtraBounds = [
    [15.60, 72.60],
    [22.05, 80.90]
  ];

  return (
    <div className="relative w-full h-[420px] md:h-[480px] rounded-2xl overflow-hidden shadow-xl border-2 border-[#E8630A]/30">
      {/* Top Left Header Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-[#E8630A]/20 flex items-center gap-3">
        <span className="text-2xl">🛰️</span>
        <div>
          <h4 className="text-sm font-extrabold text-[#3D2C1E]">
            {t?.mapTitle || (lang === 'en' ? 'Sentinel-2 L2A Satellite Mapping' : 'Sentinel-2 L2A सैटेलाइट मैपिंग')}
          </h4>
          <p className="text-[11px] text-gray-500 font-semibold">
            {lang === 'en' ? '📍 Land selection restricted strictly to Maharashtra boundaries' : '📍 केवल महाराष्ट्र राज्य की सीमाओं के भीतर चयन करें'}
          </p>
        </div>
      </div>

      {/* Top Right Map Layer Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMapType('satellite')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
            mapType === 'satellite' ? 'bg-[#E8630A] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {t?.satelliteView || '🛰️ Satellite View'}
        </button>
        <button
          type="button"
          onClick={() => setMapType('street')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
            mapType === 'street' ? 'bg-[#2D6A4F] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {t?.streetView || '🗺️ Street View'}
        </button>
      </div>

      {/* Leaflet Map Engine - Unbound Panning with Friendly State Notice */}
      <MapContainer
        center={pos}
        zoom={12}
        minZoom={3}
        maxZoom={18}
        style={{ width: '100%', height: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution="&copy; Esri World Imagery & OpenStreetMap"
          url={tileUrl}
        />
        <FlyToLocation position={selectedPos} />
        <PolygonDrawer
          polygonPoints={polygonPoints}
          setPolygonPoints={setPolygonPoints}
          lang={lang}
        />
      </MapContainer>

      {/* Bottom Floating Farm Statistics & Boundary Actions Toolbar */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border border-[#E8630A]/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#3D2C1E]">
          <div className="bg-[#FFF8F0] px-3 py-1.5 rounded-xl border border-[#E8630A]/30">
            <span className="text-gray-500 font-semibold">{t?.selectedGps || 'GPS'}:</span>{' '}
            <span className="text-[#E8630A]">{pos[0].toFixed(4)}° N, {pos[1].toFixed(4)}° E</span>
          </div>

          <div className="bg-green-50 px-3 py-1.5 rounded-xl border border-green-300">
            <span className="text-[#2D6A4F] font-semibold">{t?.calculatedArea || 'Area'}:</span>{' '}
            <span className="text-[#2D6A4F] text-sm font-black">{calculatedHectares} Ha</span>{' '}
            <span className="text-xs text-gray-500">({calculatedBigha} Bigha)</span>
          </div>

          <span className="text-[11px] text-gray-500 hidden lg:inline">
            {t?.drawInstruction || 'Click points to draw farm polygon'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {polygonPoints.length > 0 && (
            <button
              type="button"
              onClick={handleClearPolygon}
              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold border border-red-200 transition cursor-pointer"
            >
              {t?.clearPolygon || '🧹 Clear Boundary'}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-gradient-to-r from-[#E8630A] to-[#d55605] text-white rounded-xl text-xs font-extrabold shadow-md hover:brightness-110 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>🎯</span> {t?.confirmLand || 'Analyze Selected Farmland'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FarmlandMap;
