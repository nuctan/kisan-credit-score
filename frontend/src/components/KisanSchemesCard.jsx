import React, { useState, useEffect } from 'react';
import axios from 'axios';

const KisanSchemesCard = ({ crop = 'Wheat', state = 'Maharashtra', lang = 'hi', t }) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      try {
        const res = await axios.post('http://localhost:8000/api/kisan-schemes', {
          query: crop,
          crop,
          state,
          lang
        });
        if (res.data && res.data.matched_schemes) {
          setSchemes(res.data.matched_schemes);
        }
      } catch (err) {
        console.error('Error fetching schemes from Python RAG service:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [crop, state, lang]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-md border border-[#2D6A4F]/20 flex items-center justify-center h-36">
        <span className="text-[#2D6A4F] font-bold text-sm animate-pulse">
          📜 पायथन RAG इंजन से सरकारी किसान योजनाएं लोड हो रही हैं... (Loading Government Kisan Schemes)
        </span>
      </div>
    );
  }

  if (!schemes || schemes.length === 0) return null;

  const isEng = lang === 'en';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-[#2D6A4F]/20 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📜</span>
          <div>
            <h3 className="text-xl font-bold text-[#3D2C1E]">
              {isEng ? 'Government Kisan Schemes & Subsidies (RAG Knowledge Engine)' : 'सरकारी किसान योजनाएं एवं सब्सिडी (पायथन RAG ज्ञान)'}
            </h3>
            <p className="text-xs text-gray-500">
              {isEng 
                ? 'Government of India & Maharashtra agricultural benefits matched for your farm' 
                : 'आपकी फसल व भूमि हेतु केंद्र व महाराष्ट्र सरकार की पात्र प्रोत्साहन योजनाएं'}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-[#2D6A4F] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          🐍 Python RAG Powered ({schemes.length} Schemes)
        </span>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schemes.map((s, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50/40 to-white hover:border-[#2D6A4F]/40 transition-all shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-base font-extrabold text-[#2D6A4F] flex items-center gap-2">
                <span>🏛️</span> {isEng ? s.title_en : s.title_hi}
              </h4>
            </div>

            <div className="space-y-1.5 text-xs text-[#3D2C1E]">
              <p className="font-semibold text-emerald-900 bg-white/80 p-2 rounded-lg border border-emerald-200">
                🎁 <strong>{isEng ? 'Benefit:' : 'लाभ:'}</strong> {isEng ? s.benefit_en : s.benefit_hi}
              </p>

              <p className="text-gray-700">
                👥 <strong>{isEng ? 'Eligibility:' : 'पात्रता:'}</strong> {isEng ? s.eligibility_en : s.eligibility_hi}
              </p>

              <p className="text-gray-600 italic">
                📝 <strong>{isEng ? 'How to Apply:' : 'आवेदन प्रक्रिया:'}</strong> {isEng ? s.apply_steps_en : s.apply_steps_hi}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KisanSchemesCard;
