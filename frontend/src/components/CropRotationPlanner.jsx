import React, { useState } from 'react';

const CROP_ROTATION_CYCLES = [
  {
    season: 'रबी सीजन (Rabi - Nov to Mar)',
    crop: 'गेहूं (Wheat)',
    soilBenefit: 'उच्च बाजार मांग, संतुलित नाइट्रोजन अवशोषण',
    estRevenuePerHectare: 85000,
    icon: '🌾',
    color: 'border-amber-400 bg-amber-50/50'
  },
  {
    season: 'खरीफ सीजन (Kharif - Jul to Oct)',
    crop: 'धान / मूंग (Rice / Mung Bean)',
    soilBenefit: 'जैविक दलहन नाइट्रोजन निर्धारण (Soil N-Fixation)',
    estRevenuePerHectare: 92000,
    icon: '🌱',
    color: 'border-green-400 bg-green-50/50'
  },
  {
    season: 'जायद सीजन (Zaid - Mar to Jun)',
    crop: 'मक्का / मकी (Maize / Vegetables)',
    soilBenefit: 'कम पानी की खपत, मिट्टी की नमी संरक्षण',
    estRevenuePerHectare: 45000,
    icon: '🌽',
    color: 'border-yellow-400 bg-yellow-50/50'
  }
];

const CropRotationPlanner = ({ areaHectares = 2.5 }) => {
  const [selectedCrop, setSelectedCrop] = useState('गेहूं (Wheat)');

  const totalAnnualProjectedRevenue = CROP_ROTATION_CYCLES.reduce(
    (sum, cycle) => sum + (cycle.estRevenuePerHectare * areaHectares),
    0
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E8630A]/15 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔄</span>
          <div>
            <h3 className="text-xl font-bold text-[#3D2C1E]">फसल चक्र व वार्षिक आय योजक (Crop Rotation Planner)</h3>
            <p className="text-xs text-gray-500">मिट्टी की उर्वरता बनाए रखने एवं अधिकतम वार्षिक आय हेतु अनुशंसित चक्र</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 font-semibold block">वार्षिक कुल संभावित आय</span>
          <span className="text-xl font-black text-[#2D6A4F]">
            ₹{Math.round(totalAnnualProjectedRevenue).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Rotation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CROP_ROTATION_CYCLES.map((cycle, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl border-2 transition-all hover:shadow-md ${cycle.color}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-600 bg-white/80 px-2.5 py-1 rounded-md shadow-xs">
                {cycle.season}
              </span>
              <span className="text-2xl">{cycle.icon}</span>
            </div>

            <h4 className="text-lg font-extrabold text-[#3D2C1E] mb-1">{cycle.crop}</h4>
            <p className="text-xs text-gray-600 font-medium mb-3 min-h-[32px]">
              {cycle.soilBenefit}
            </p>

            <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-semibold">अनुमानित आय ({areaHectares} Ha):</span>
              <strong className="text-sm font-bold text-[#E8630A]">
                ₹{Math.round(cycle.estRevenuePerHectare * areaHectares).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        ))}
      </div>

      {/* Crop Rotation Tip */}
      <div className="bg-[#FFF8F0] p-4 rounded-xl border border-[#E8630A]/20 flex items-start gap-3 text-xs text-[#3D2C1E]">
        <span className="text-xl">💡</span>
        <div>
          <strong className="font-bold text-[#E8630A] block mb-0.5">कृषि विशेषज्ञ सुझाव:</strong>
          गेहूं के बाद दलहन (दलहनी फसलें जैसे मूंग या चना) उगाने से हवा में मौजूद नाइट्रोजन प्राकृतिक रूप से मिट्टी में जम जाती है। इससे अगली फसल के लिए यूरिया की लागत में 25% तक की बचत होती है और रीपेमेंट क्षमता बढ़ती है।
        </div>
      </div>
    </div>
  );
};

export default CropRotationPlanner;
