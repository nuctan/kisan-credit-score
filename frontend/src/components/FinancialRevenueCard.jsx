import React from 'react';

const FinancialRevenueCard = ({ predictions, baselineMetrics }) => {
  if (!predictions) return null;

  const currentRevenue = predictions?.adjusted_estimated_revenue_rs || 0;
  const baseRevenue = baselineMetrics?.base_estimated_revenue_rs || currentRevenue;
  
  // Projected future cycles (next 2 seasons, e.g. Rabi + Kharif estimate assuming 5% growth/stability)
  const futureCyclesProjected = Math.round(currentRevenue * 1.85);
  const totalExpectedRevenue = currentRevenue + futureCyclesProjected;
  
  const suggestedLoanLimit = predictions?.suggested_loan_limit_rs || Math.round(currentRevenue * 0.6);
  const riskLevel = predictions?.risk_level || 'Medium';

  const riskBadgeColor = {
    Low: 'bg-green-100 text-green-800 border-green-300',
    Medium: 'bg-amber-100 text-amber-800 border-amber-300',
    High: 'bg-red-100 text-red-800 border-red-300',
  }[riskLevel] || 'bg-amber-100 text-amber-800 border-amber-300';

  const riskLevelHindi = {
    Low: 'कम (सुरक्षित)',
    Medium: 'मध्यम',
    High: 'उच्च जोखिम',
  }[riskLevel] || 'मध्यम';

  return (
    <div className="bg-gradient-to-br from-[#2D6A4F] to-[#1b4332] rounded-2xl p-6 shadow-xl text-white space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💰</span>
          <div>
            <h3 className="text-xl font-bold">अनुमानित आय एवं ऋण पात्रता रिपोर्ट</h3>
            <p className="text-xs text-white/70">फसल पैदावार और बाजार मूल्यों पर आधारित वित्तीय विश्लेषण</p>
          </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full border text-xs font-bold ${riskBadgeColor}`}>
          जोखिम स्तर: {riskLevelHindi}
        </div>
      </div>

      {/* Revenue Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Crop Revenue */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
          <span className="text-xs text-white/80 font-medium block mb-1">वर्तमान फसल से अनुमानित आय</span>
          <div className="text-2xl font-black text-[#D4A017]">
            ₹{currentRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-white/60 mt-1 block">
            आधारित: ₹{baseRevenue.toLocaleString('en-IN')} (समायोजित)
          </span>
        </div>

        {/* Future Cycle Projections */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
          <span className="text-xs text-white/80 font-medium block mb-1">भावी चक्रों की अनुमानित आय (2 सीजन)</span>
          <div className="text-2xl font-black text-emerald-300">
            ₹{futureCyclesProjected.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-white/60 mt-1 block">अगले 2 फसल चक्रों का अनुमान</span>
        </div>

        {/* Total Expected Revenue */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
          <span className="text-xs text-white/80 font-medium block mb-1">कुल अपेक्षित आय (Total Revenue)</span>
          <div className="text-2xl font-black text-white">
            ₹{totalExpectedRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-white/60 mt-1 block">ऋण चुकाने की कुल क्षमता</span>
        </div>
      </div>

      {/* Recommended Safe Credit Capacity */}
      <div className="bg-white text-[#3D2C1E] p-5 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div>
          <span className="text-xs font-bold text-[#2D6A4F] uppercase tracking-wider block">
            स्वीकार्य अधिकतम ऋण सीमा (Maximum Safe Credit Cap)
          </span>
          <h4 className="text-3xl font-extrabold text-[#E8630A] mt-1">
            ₹{suggestedLoanLimit.toLocaleString('en-IN')}
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            आय की 60% सुरक्षित सीमा के आधार पर बैंक स्वीकृति हेतु उपयुक्त।
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2D6A4F] bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
            <span>✅ उच्च रीपेमेंट क्षमता</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialRevenueCard;
