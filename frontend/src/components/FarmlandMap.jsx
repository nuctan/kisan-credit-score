import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const farmIcon = L.divIcon({
  className: 'custom-farm-pin',
  html: `<div style="background-color: #E8630A; border: 3px solid white; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">🌾</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={farmIcon}>
      <Popup>
        <div className="text-center font-sans p-1">
          <strong className="text-[#E8630A] text-sm">चयनित Sentinel-2 सैटेलाइट क्षेत्र</strong><br />
          <span className="text-xs text-gray-600">
            GPS: {position[0].toFixed(4)}° N, {position[1].toFixed(4)}° E
          </span>
        </div>
      </Popup>
    </Marker>
  );
}

const FarmlandMap = ({ selectedPos, setSelectedPos, onConfirmSelection, areaHectares = 2.5 }) => {
  const [pos, setPos] = useState(selectedPos || [19.0958, 74.7496]);
  const [mapType, setMapType] = useState('satellite');

  useEffect(() => {
    if (selectedPos) setPos(selectedPos);
  }, [selectedPos]);

  const handleConfirm = () => {
    setSelectedPos(pos);
    if (onConfirmSelection) onConfirmSelection(pos);
  };

  const areaBigha = (parseFloat(areaHectares) * 3.95).toFixed(2);

  // Sentinel-2 spectral band simulation for selected coordinates
  const b8_nir = (0.42 + (abs_hash(pos[0]) % 15) / 100).toFixed(2);
  const b4_red = (0.08 + (abs_hash(pos[1]) % 8) / 100).toFixed(2);
  const simulatedNDVI = ((b8_nir - b4_red) / (parseFloat(b8_nir) + parseFloat(b4_red))).toFixed(2);

  function abs_hash(val) {
    return Math.floor(Math.abs(val) * 1000);
  }

  const tileUrl = mapType === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className="relative w-full h-[400px] md:h-[480px] rounded-2xl overflow-hidden shadow-xl border-2 border-[#E8630A]/30">
      {/* Map Top Bar Header */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-[#E8630A]/20 flex items-center gap-3">
        <span className="text-2xl">🛰️</span>
        <div>
          <h4 className="text-sm font-extrabold text-[#3D2C1E]">Sentinel-2 L2A सैटेलाइट मैपिंग</h4>
          <div className="flex items-center gap-2 text-[11px] text-[#2D6A4F] font-bold">
            <span>B8 (NIR): {b8_nir}</span>
            <span>|</span>
            <span>B4 (Red): {b4_red}</span>
            <span>|</span>
            <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded">NDVI: {simulatedNDVI}</span>
          </div>
        </div>
      </div>

      {/* Map Control Toggle */}
      <div className="absolute top-3 right-3 z-[1000] flex gap-2">
        <button
          type="button"
          onClick={() => setMapType(mapType === 'satellite' ? 'street' : 'satellite')}
          className="bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl shadow text-xs font-bold text-[#2D6A4F] hover:bg-white transition cursor-pointer border border-gray-200"
        >
          {mapType === 'satellite' ? '🗺️ स्ट्रीट व्यू' : '🛰️ Sentinel-2 HD View'}
        </button>
      </div>

      {/* Leaflet Satellite Map */}
      <MapContainer
        center={pos}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer attribution="Tiles &copy; Esri &mdash; Sentinel-2 RGB Imagery" url={tileUrl} />
        <LocationMarker position={pos} setPosition={setPos} />
      </MapContainer>

      {/* Bottom Selection Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-5 py-3.5 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-3 border border-[#E8630A]/30">
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-gray-500 font-semibold block">GPS स्थान:</span>
            <span className="font-bold text-[#3D2C1E]">
              {pos[0].toFixed(4)}° N, {pos[1].toFixed(4)}° E
            </span>
          </div>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
            <span className="text-gray-500 font-semibold block">क्षेत्रफल (Land Size):</span>
            <span className="font-bold text-[#E8630A]">
              {areaHectares} हेक्टेयर ({areaBigha} बीघा)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          className="px-6 py-2.5 bg-[#E8630A] hover:bg-[#d55809] text-white font-bold text-sm rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2"
        >
          <span>🎯 संपूर्ण 1-वर्षीय रिपोर्ट जनरेट करें</span>
        </button>
      </div>
    </div>
  );
};

export default FarmlandMap;
