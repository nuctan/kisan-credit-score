import React from 'react';

const FullLandReport = ({ analysisData, formState, t }) => {
  if (!analysisData) return null;

  const plan = analysisData.one_year_succession_plan || {};
  const cycles = plan.succession_cycles || [];
  const nextDecision = plan.next_crop_decision || {};
  const loanTenure = formState?.loanTenureYears || plan.loan_tenure_years || 1;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-[#E8630A]/20 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <span className="text-[#2D6A4F] text-xs font-bold uppercase tracking-wider block">
            {t?.activeReport || 'सक्रिय रिपोर्ट'}
          </span>
          <h3 className="text-xl font-bold text-[#3D2C1E] flex items-center gap-2">
            <span>📅</span> {t?.successionTitle || `${loanTenure}-वर्षीय ऋण चक्र एवं फसल उत्तराधिकार रिपोर्ट`}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {t?.successionSubtitle || 'बुआई के महीने से फसल चक्र व बचे हुए ऋण अवधि का संपूर्ण आय नियोजन'}
          </p>
        </div>

        <div className="bg-[#FFF8F0] px-4 py-2 rounded-xl border border-[#E8630A]/30 text-right">
          <span className="text-xs text-gray-500 font-semibold block">{t?.total1YearRev || 'कुल ऋण अवधि संयुक्त आय'}</span>
          <span className="text-lg font-black text-[#2D6A4F]">
            ₹{plan.total_annual_combined_revenue_rs?.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* NEW FEATURE: Automatic Next Crop Sowing Decision Box */}
      {nextDecision.recommended_next_crop && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-5 rounded-2xl border-2 border-[#2D6A4F]/30 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase px-3 py-1 bg-[#2D6A4F] text-white rounded-full">
              🎯 अगली फसल बुआई निर्णय एवं समय सारणी (Next Crop Sowing Decision)
            </span>
            <span className="text-xs font-bold text-[#E8630A]">
              बुआई तिथि: {nextDecision.recommended_next_sow_date}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <span className="text-[11px] text-gray-500 font-bold block mb-1">वर्तमान फसल कटाई</span>
              <strong className="text-sm font-bold text-[#3D2C1E]">
                {nextDecision.current_crop} ➔ {nextDecision.harvest_expected}
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <span className="text-[11px] text-gray-500 font-bold block mb-1">भूमि जुताई व तैयारी</span>
              <strong className="text-xs font-bold text-[#E8630A]">
                {nextDecision.soil_prep_window}
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#2D6A4F]/40 bg-emerald-50/40">
              <span className="text-[11px] text-[#2D6A4F] font-bold block mb-1">अनुशंसित अगली फसल व बुआई</span>
              <strong className="text-sm font-black text-[#2D6A4F]">
                🌱 {nextDecision.recommended_next_crop}
              </strong>
            </div>
          </div>

          <p className="text-xs text-gray-600 font-medium italic pt-1">
            💡 <strong>वैज्ञानिक कारण:</strong> {nextDecision.agronomic_reason}
          </p>
        </div>
      )}

      {/* Succession Cycles Timeline */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-[#3D2C1E] flex items-center gap-2">
          <span>🔄</span> {loanTenure}-वर्षीय संपूर्ण फसल चक्र समय-सारणी ({cycles.length} फसलें):
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cycles.map((cycle, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                idx === 0
                  ? 'bg-amber-50/60 border-amber-300 shadow-sm'
                  : 'bg-[#FFF8F0]/40 border-gray-200 hover:border-[#E8630A]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white border text-gray-700">
                  {cycle.period}
                </span>
                <span className="text-xs font-extrabold text-[#E8630A]">
                  चक्र #{cycle.cycle_number}
                </span>
              </div>

              <h5 className="text-base font-extrabold text-[#3D2C1E] mb-1">{cycle.crop}</h5>
              <p className="text-xs text-[#2D6A4F] font-semibold mb-2">🌱 {cycle.soil_impact}</p>

              <div className="border-t border-gray-200/60 pt-2 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">{t?.estRevenue || 'अनुमानित आय'}:</span>
                <strong className="font-bold text-[#3D2C1E]">
                  ₹{cycle.estimated_revenue_rs?.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FullLandReport;
