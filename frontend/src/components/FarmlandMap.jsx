import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polygon } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon issues in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom farm pin icon
const farmIcon = L.divIcon({
  className: 'custom-farm-pin',
  html: `<div style="background-color: #E8630A; border: 3px solid white; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 10px rgba(0,0,0,0.4);">🌾</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Helper component for map clicks
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={farmIcon}>
      <Popup>
        <div className="text-center font-sans">
          <strong className="text-[#E8630A]">चयनित खेत का स्थान</strong><br />
          अक्षांश (Lat): {position[0].toFixed(4)}<br />
          रेखांश (Lon): {position[1].toFixed(4)}
        </div>
      </Popup>
    </Marker>
  );
}

const FarmlandMap = ({ selectedPos, setSelectedPos, onConfirmSelection }) => {
  // Default centered near Ahilyanagar/Maharashtra (19.0958, 74.7496)
  const [pos, setPos] = useState(selectedPos || [19.0958, 74.7496]);
  const [mapType, setMapType] = useState('satellite');

  useEffect(() => {
    if (selectedPos) {
      setPos(selectedPos);
    }
  }, [selectedPos]);

  const handleConfirm = () => {
    setSelectedPos(pos);
    if (onConfirmSelection) {
      onConfirmSelection(pos);
    }
  };

  // Satellite tile vs Standard OpenStreetMap tile
  const tileUrl = mapType === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const attribution = mapType === 'satellite'
    ? 'Tiles &copy; Esri &mdash; Sentinel-2 High Res Satellite Data'
    : '&copy; OpenStreetMap contributors';

  return (
    <div className="relative w-full h-[380px] md:h-[450px] rounded-2xl overflow-hidden shadow-lg border-2 border-[#E8630A]/20">
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-md border border-[#E8630A]/20 flex items-center gap-3">
        <span className="text-xl">🛰️</span>
        <div>
          <h4 className="text-sm font-bold text-[#3D2C1E]">Sentinel-2 सैटेलाइट मैप</h4>
          <p className="text-xs text-gray-600">नक्शे पर क्लिक करके अपने खेत का चयन करें</p>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex gap-2">
        <button
          type="button"
          onClick={() => setMapType(mapType === 'satellite' ? 'street' : 'satellite')}
          className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow text-xs font-bold text-[#2D6A4F] hover:bg-white transition"
        >
          {mapType === 'satellite' ? '🗺️ स्ट्रीट व्यू' : '🛰️ सैटेलाइट व्यू'}
        </button>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={pos}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer attribution={attribution} url={tileUrl} />
        <LocationMarker position={pos} setPosition={setPos} />
      </MapContainer>

      {/* Bottom Floating Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-5 py-3 rounded-xl shadow-xl flex flex-wrap items-center justify-between gap-3 border border-[#E8630A]/30">
        <div>
          <span className="text-xs text-gray-500 font-semibold block">चयनित निर्देशांक (Coordinates):</span>
          <span className="text-sm font-bold text-[#3D2C1E]">
            {pos[0].toFixed(4)}° N, {pos[1].toFixed(4)}° E
          </span>
        </div>
        <button
          type="button"
          onClick={handleConfirm}
          className="px-5 py-2.5 bg-[#E8630A] hover:bg-[#d55809] text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
        >
          <span>🎯 इस भूमि का विश्लेषण करें</span>
        </button>
      </div>
    </div>
  );
};

export default FarmlandMap;
