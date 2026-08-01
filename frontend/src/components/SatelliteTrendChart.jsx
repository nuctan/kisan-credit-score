import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SatelliteTrendChart = ({ district = 'Ahilyanagar (Ahmednagar)', crop = 'Wheat', t }) => {
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const res = await axios.post('http://localhost:8000/api/ndvi-weather-trends', {
          district,
          crop
        });
        setTrendData(res.data);
      } catch (err) {
        console.error('Error fetching trend data from Python service:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [district, crop]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-md border border-[#E8630A]/20 flex items-center justify-center h-48">
        <span className="text-[#E8630A] font-bold text-sm animate-pulse">
          ⏳ पायथन मून-सैटेलाइट एवं मौसम ट्रेंड्स लोड हो रहे हैं... (Loading Python 12-Month NDVI & Weather Trends)
        </span>
      </div>
    );
  }

  if (!trendData || !trendData.monthly_trends) return null;

  const monthly = trendData.monthly_trends;
  const maxRain = Math.max(...monthly.map(m => m.rainfall_mm)) || 250;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-[#E8630A]/20 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📊</span>
          <div>
            <h3 className="text-xl font-bold text-[#3D2C1E]">
              12-माह सैटेलाइट NDVI व वर्षा रुझान (12-Month Satellite NDVI & Weather Chart)
            </h3>
            <p className="text-xs text-gray-500">
              जिला: <strong className="text-[#E8630A]">{trendData.district}</strong> | फसल: <strong className="text-[#2D6A4F]">{trendData.crop}</strong>
            </p>
            {/* Clarification note */}
            <p className="text-[10px] text-blue-600 font-semibold mt-0.5 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
              📍 यह जिले का 12-माह ऐतिहासिक NDVI औसत है — Land Report का NDVI आपके खेत का रियल-टाइम सैटेलाइट रीडिंग है
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#2D6A4F] inline-block"></span>
            <span className="text-gray-600">NDVI वनस्पति स्वास्थ्य (0.0-1.0)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-md bg-blue-400 inline-block"></span>
            <span className="text-gray-600">वर्षा (Rainfall mm)</span>
          </div>
        </div>
      </div>

      {/* NDVI Interpretation Banner */}
      {(() => {
        const ndvi = trendData.mean_ndvi || 0;
        let badge, color, impact;
        if (ndvi >= 0.65) {
          badge = '🟢 उत्कृष्ट (Excellent)';
          color = 'bg-green-50 border-green-300 text-green-800';
          impact = 'फसल घनी और हरी है। उत्पादन अधिक होने की संभावना है। बैंक ऋण के लिए सबसे अनुकूल स्थिति।';
        } else if (ndvi >= 0.40) {
          badge = '🟡 सामान्य (Moderate)';
          color = 'bg-yellow-50 border-yellow-300 text-yellow-800';
          impact = 'फसल सामान्य रूप से बढ़ रही है। उत्पादन ठीक रहेगा लेकिन सिंचाई या उर्वरक से सुधार संभव।';
        } else {
          badge = '🔴 कम (Stress / Low Vegetation)';
          color = 'bg-red-50 border-red-300 text-red-800';
          impact = 'खेत में कम हरियाली है — संभावित कारण: सूखा, बुआई नहीं हुई, या फसल कटाई के बाद का समय। ऋण जोखिम अधिक।';
        }
        return (
          <div className={`p-3 rounded-xl border text-xs font-semibold ${color}`}>
            <span className="font-black text-sm">{badge}</span>
            <p className="mt-1 font-medium opacity-90">फसल पर प्रभाव: {impact}</p>
          </div>
        );
      })()}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#FFF8F0] p-3 rounded-xl border border-[#E8630A]/20">
          <span className="text-[11px] text-gray-500 font-bold block mb-0.5">औसत वार्षिक NDVI (Mean NDVI)</span>
          <strong className="text-base font-black text-[#2D6A4F]">
            {typeof trendData.mean_ndvi === 'number' ? trendData.mean_ndvi.toFixed(2) : trendData.mean_ndvi}
          </strong>
          <span className="text-[10px] text-gray-500 block">उच्चतम हरियाली: {trendData.peak_vegetation_month}</span>
        </div>

        <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200">
          <span className="text-[11px] text-blue-700 font-bold block mb-0.5">कुल वार्षिक वर्षा (Annual Rainfall)</span>
          <strong className="text-base font-black text-blue-800">{trendData.total_annual_rainfall_mm} मिमी (mm)</strong>
          <span className="text-[10px] text-blue-600 block">आईएमडी (IMD) ऐतिहासिक वर्षा डेटा</span>
        </div>

        <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
          <span className="text-[11px] text-emerald-700 font-bold block mb-0.5">फसल स्वास्थ्य स्थिति (Crop Health)</span>
          <strong className="text-base font-black text-emerald-800">
            {trendData.mean_ndvi > 0.65 ? 'उत्कृष्ट (Optimal)' : 'सामान्य (Moderate)'}
          </strong>
          <span className="text-[10px] text-emerald-600 block">सेंटिनल-2 (Sentinel-2 L2A) उपग्रह</span>
        </div>
      </div>

      {/* Visual Dual Axis Chart (Bars + SVG Spline Curve) */}
      <div className="relative pt-6 pb-2">
        <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 px-2 border-b border-gray-300 relative">
          
          {/* SVG Line Curve connecting NDVI green dots using viewBox */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1200 100" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="#2D6A4F"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={monthly.map((m, i) => {
                const x = (i + 0.5) * 100;
                const y = 100 - (m.ndvi * 100);
                return `${x},${y}`;
              }).join(' ')}
            />
          </svg>

          {monthly.map((m, idx) => {
            const rainHeightPct = Math.round((m.rainfall_mm / maxRain) * 100);
            const ndviHeightPct = Math.round(m.ndvi * 100);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative z-20">
                {/* Tooltip on Hover */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-gray-900 text-white text-[10px] p-2 rounded-lg z-30 shadow-lg whitespace-nowrap">
                  <span className="font-bold text-amber-300">{m.month}: {m.health_status}</span>
                  <span>🌿 NDVI: {m.ndvi}</span>
                  <span>🌧️ वर्षा: {m.rainfall_mm} mm</span>
                </div>

                {/* Combined Bars Container */}
                <div className="w-full max-w-[28px] h-full flex items-end justify-center relative">
                  {/* Weather Rainfall Bar (Blue) */}
                  <div
                    style={{ height: `${rainHeightPct}%` }}
                    className="w-full bg-gradient-to-t from-blue-500 to-sky-300 rounded-t-sm opacity-60 transition-all group-hover:opacity-90"
                  />

                  {/* NDVI Vegetation Line Marker Pill (Green) */}
                  <div
                    style={{ bottom: `${ndviHeightPct}%` }}
                    className="absolute w-3.5 h-3.5 bg-[#2D6A4F] border-2 border-white rounded-full shadow-md z-20 transform -translate-y-1/2 group-hover:scale-125 transition-all"
                  />
                </div>

                {/* Month Label */}
                <span className="text-[11px] font-bold text-[#3D2C1E] mt-2">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SatelliteTrendChart;
