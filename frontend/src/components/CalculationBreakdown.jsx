import React from 'react';

const CalculationBreakdown = ({ analysisData, formState, t, lang = 'hi' }) => {
  if (!analysisData) return null;

  const { baseline_metrics, ai_scores, predictions, one_year_succession_plan } = analysisData;
  const cycles = one_year_succession_plan?.succession_cycles || [];
  const pricePrediction = baseline_metrics?.price_prediction || {};

  const areaHectares = parseFloat(formState?.areaHectares) || 2.5;
  const yieldTonnes = baseline_metrics?.historical_yield_tonnes_per_hectare || 3.5;
  const mandiPrice = baseline_metrics?.market_price_rs_per_quintal || 2275;

  const baseRev = baseline_metrics?.base_estimated_revenue_rs || (areaHectares * yieldTonnes * 10 * mandiPrice);
  const adjustedRev = predictions?.adjusted_estimated_revenue_rs || baseRev;
  const totalCombinedRev = predictions?.total_1year_combined_revenue_rs || (adjustedRev * 2.2);
  const safeLoanCap = predictions?.suggested_loan_limit_rs || Math.round(totalCombinedRev * 0.60);

  const ndviScore = ai_scores?.ndvi?.score || 1.0;
  const weatherScore = ai_scores?.weather?.score || 1.0;
  const soilScore = ai_scores?.soil?.score || 1.0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-[#E8630A]/30 space-y-6">
      {/* Top Banner: Explicit Loan Eligibility Highlight */}
      <div className="bg-gradient-to-r from-[#2D6A4F] to-[#1b4332] text-white p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-lg border border-green-700">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block">
            {lang === 'en' ? 'Bank Approved Maximum Loan Amount (Safe Limit)' : 'बैंक द्वारा स्वीकृत अधिकतम ऋण राशि (Maximum Loan Amount You Can Receive)'}
          </span>
          <h2 className="text-4xl font-black text-white mt-1">
            ₹{Math.round(safeLoanCap).toLocaleString('en-IN')}
          </h2>
          <p className="text-xs text-white/80 mt-1">
            {lang === 'en'
              ? `Based on 60% safe repayment capacity over a ${formState?.loanTenureYears || 1}-year tenure`
              : `${formState?.loanTenureYears || 1}-वर्षीय ऋण अवधि के लिए 60% रीपेमेंट क्षमता पर आधारित`}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-center border border-white/20">
          <span className="text-xs text-white/80 font-bold block">
            {lang === 'en' ? 'Total Income Repayment Base' : 'कुल आय रीपेमेंट आधार'}
          </span>
          <span className="text-lg font-extrabold text-[#D4A017]">
            ₹{Math.round(totalCombinedRev).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-3">
        <span className="text-2xl">🧮</span>
        <div>
          <h3 className="text-lg font-bold text-[#3D2C1E]">
            {lang === 'en' ? 'Step-by-Step Calculation Breakdown' : 'ऋण गणना की संपूर्ण पारदर्शी प्रक्रिया (Step-by-Step Calculation Breakdown)'}
          </h3>
          <p className="text-xs text-gray-500">
            {lang === 'en' ? 'Transparent formula details showing how your credit cap was determined' : 'देखें कि आपकी ऋण राशि किस गणितीय सूत्र द्वारा तय की गई है'}
          </p>
        </div>
      </div>

      {/* 4 Steps Math Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#3D2C1E]">
        {/* Step 1 */}
        <div className="bg-[#FFF8F0] p-4 rounded-xl border border-[#E8630A]/20 space-y-2">
          <div className="flex justify-between font-bold text-[#E8630A]">
            <span>{lang === 'en' ? 'Step 1: Base Yield Calculation' : 'चरण 1: आधार पैदावार गणना (Base Yield)'}</span>
            <span>Step 1</span>
          </div>
          <p className="text-gray-600">
            {lang === 'en'
              ? `Formula: Area (${areaHectares} Ha) × Hist Yield (${yieldTonnes} T) × 10 Quintals × Estimated Price (₹${mandiPrice})`
              : `सूत्र: क्षेत्रफल (${areaHectares} Ha) × ऐतिहासिक उपज (${yieldTonnes} टन) × 10 क्विंटल × अनुमानित मंडी मूल्य (₹${mandiPrice})`}
          </p>
          {pricePrediction?.harvest_month && (
            <div className="text-[10px] text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
              <span className="font-bold">{lang === 'en' ? '📈 Predicted Harvest Price:' : '📈 अनुमानित मंडी मूल्य:'}</span>{' '}
              {lang === 'en'
                ? `Sowing (${pricePrediction.sow_month}) → Harvest (${pricePrediction.harvest_month}) | Seasonal Index: ${pricePrediction.seasonal_multiplier}x | ${pricePrediction.price_trend}`
                : `बुआई (${pricePrediction.sow_month}) → कटाई (${pricePrediction.harvest_month}) | मौसमी गुणांक: ${pricePrediction.seasonal_multiplier}x | ${pricePrediction.price_trend}`}
            </div>
          )}
          <div className="text-sm font-extrabold text-[#3D2C1E] pt-1 border-t border-gray-200">
            = ₹{Math.round(baseRev).toLocaleString('en-IN')}
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-[#FFF8F0] p-4 rounded-xl border border-[#E8630A]/20 space-y-2">
          <div className="flex justify-between font-bold text-[#2D6A4F]">
            <span>{lang === 'en' ? 'Step 2: Remote Sensing & Climate Factor' : 'चरण 2: रिमोट सेंसिंग व मौसम गुणांक'}</span>
            <span>Step 2</span>
          </div>
          <p className="text-gray-600">
            {lang === 'en'
              ? `Formula: Base Rev × [ (NDVI: ${ndviScore} × 45%) + (IMD Weather: ${weatherScore} × 35%) + (Soil: ${soilScore} × 20%) ]`
              : `सूत्र: Base Rev × [ (NDVI: ${ndviScore} × 45%) + (IMD Weather: ${weatherScore} × 35%) + (Soil: ${soilScore} × 20%) ]`}
          </p>
          <div className="text-sm font-extrabold text-[#2D6A4F] pt-1 border-t border-gray-200">
            = ₹{Math.round(adjustedRev).toLocaleString('en-IN')} ({lang === 'en' ? `Current ${formState?.crop} Crop Income` : `वर्तमान ${formState?.crop} फसल आय`})
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-[#FFF8F0] p-4 rounded-xl border border-[#E8630A]/20 space-y-2">
          <div className="flex justify-between font-bold text-[#3D2C1E]">
            <span>{lang === 'en' ? `Step 3: ${formState?.loanTenureYears || 1}-Year Crop Succession Income` : `चरण 3: ${formState?.loanTenureYears || 1}-वर्षीय उत्तराधिकार फसल आय`}</span>
            <span>Step 3</span>
          </div>
          <p className="text-gray-600">
            {lang === 'en'
              ? `Formula: Combined revenue of ${cycles.length} crop cycles across loan tenure`
              : `सूत्र: ${cycles.length} फसल चक्रों की संयुक्त आय (गेहूं + मूंग दलहन + मानसून धान)`}
          </p>
          <div className="text-sm font-extrabold text-[#3D2C1E] pt-1 border-t border-gray-200">
            = ₹{Math.round(totalCombinedRev).toLocaleString('en-IN')} ({lang === 'en' ? 'Total Combined Income' : 'कुल संयुक्त आय'})
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-orange-50 p-4 rounded-xl border border-[#E8630A] space-y-2">
          <div className="flex justify-between font-bold text-[#E8630A]">
            <span>{lang === 'en' ? 'Step 4: 60% Safe Credit Cap Formula' : 'चरण 4: 60% सुरक्षित बैंक ऋण फॉर्मूला'}</span>
            <span>Step 4</span>
          </div>
          <p className="text-gray-600">
            {lang === 'en'
              ? `Formula: Total Combined Income (₹${Math.round(totalCombinedRev).toLocaleString('en-IN')}) × 60% Safe Credit Cap`
              : `सूत्र: कुल संयुक्त आय (₹${Math.round(totalCombinedRev).toLocaleString('en-IN')}) × 60% Safe Credit Cap`}
          </p>
          <div className="text-base font-black text-[#E8630A] pt-1 border-t border-[#E8630A]/30">
            = ₹{Math.round(safeLoanCap).toLocaleString('en-IN')} ({lang === 'en' ? 'Approved Credit Limit' : 'स्वीकार्य ऋण सीमा'})
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculationBreakdown;
