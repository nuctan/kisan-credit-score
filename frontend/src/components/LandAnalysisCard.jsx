import React from 'react';

const LandAnalysisCard = ({ analysis, t, lang = 'hi' }) => {
  if (!analysis) return null;

  const { baseline_metrics, ai_scores } = analysis;

  const ndviScore = ai_scores?.ndvi?.score || 1.0;
  const ndviDesc = ai_scores?.ndvi?.description || 'Normal Vegetation';

  const weatherDesc = ai_scores?.weather?.description || 'Favorable Weather';
  const weatherScore = ai_scores?.weather?.score || 1.0;

  const soilDesc = ai_scores?.soil?.description || 'Optimal Soil Nutrients';
  const soilScore = ai_scores?.soil?.score || 1.0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E8630A]/15 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌱</span>
          <div>
            <h3 className="text-xl font-bold text-[#3D2C1E]">
              {t?.landAnalysisTitle || (lang === 'en' ? 'Land & Telemetry Analysis' : 'भूमि एवं फसल विश्लेषण')}
            </h3>
            <p className="text-xs text-gray-500">
              {t?.remoteSensingSubtitle || (lang === 'en' ? 'Remote sensing report based on Sentinel-2 & IMD climate data' : 'Sentinel-2 व IMD डेटा पर आधारित रिमोट सेंसिंग रिपोर्ट')}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-800 font-bold text-xs rounded-full border border-green-200">
          {t?.activeReport || (lang === 'en' ? 'Active Report' : 'सक्रिय रिपोर्ट')}
        </span>
      </div>

      {/* Parameter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. NDVI */}
        <div className="bg-[#FFF8F0] p-4 rounded-xl border border-[#E8630A]/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">{t?.ndviTitle || (lang === 'en' ? 'Vegetation Health (NDVI)' : 'वनस्पति स्वास्थ्य (NDVI)')}</span>
            <span className="text-lg">🌿</span>
          </div>
          <div className="my-2">
            <span className="text-2xl font-extrabold text-[#2D6A4F]">
              {ndviScore} <span className="text-xs font-normal text-gray-500">/ 1.20</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="bg-[#2D6A4F] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (ndviScore / 1.2) * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 font-medium">{ndviDesc}</p>
          <span className="text-[10px] text-blue-600 font-bold mt-1 bg-blue-50 px-1.5 py-0.5 rounded">
            {lang === 'en' ? '📍 Real-time farm GPS satellite reading (Sentinel-2)' : '📍 आपके खेत का रियल-टाइम GPS रीडिंग (Sentinel-2)'}
          </span>
        </div>

        {/* 2. Weather */}
        <div className="bg-[#FFF8F0] p-4 rounded-xl border border-[#E8630A]/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">{t?.weatherTitle || (lang === 'en' ? 'Weather Forecast (IMD)' : 'मौसम पूर्वानुमान (IMD)')}</span>
            <span className="text-lg">⛅</span>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold text-[#E8630A]">
              {weatherScore > 1.0 ? (lang === 'en' ? 'Favorable' : 'Favorable / अनुकूल') : (lang === 'en' ? 'Risk Warning' : 'जोखिम चेतावनी')}
            </span>
          </div>
          <p className="text-xs text-gray-600 font-medium">{weatherDesc}</p>
        </div>

        {/* 3. Soil */}
        <div className="bg-[#FFF8F0] p-4 rounded-xl border border-[#E8630A]/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">{t?.soilTitle || (lang === 'en' ? 'Soil Quality (N-P-K)' : 'मिट्टी की गुणवत्ता (N-P-K)')}</span>
            <span className="text-lg">🧪</span>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold text-[#3D2C1E]">
              {soilScore > 1.0 ? 'Optimal' : 'Moderate'}
            </span>
          </div>
          <p className="text-xs text-gray-600 font-medium">{soilDesc}</p>
        </div>

        {/* 4. Baseline Yield */}
        <div className="bg-[#FFF8F0] p-4 rounded-xl border border-[#E8630A]/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">{t?.baselineYieldTitle || (lang === 'en' ? 'Historical Avg Yield' : 'ऐतिहासिक औसत उपज')}</span>
            <span className="text-lg">🌾</span>
          </div>
          <div className="my-2">
            <span className="text-2xl font-extrabold text-[#E8630A]">
              {baseline_metrics?.historical_yield_tonnes_per_hectare || 0}{' '}
              <span className="text-xs font-medium text-[#3D2C1E]">{t?.perHectare || (lang === 'en' ? 'Tonnes/Ha' : 'टन/हेक्टेयर')}</span>
            </span>
          </div>
          <p className="text-xs text-gray-600 font-medium">
            {t?.mandiPrice || (lang === 'en' ? 'Mandi Price' : 'मंडी भाव')}: ₹{baseline_metrics?.market_price_rs_per_quintal || 0} / {t?.perQuintal || (lang === 'en' ? 'Quintal' : 'क्विंटल')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandAnalysisCard;
