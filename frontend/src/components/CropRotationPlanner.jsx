import React from 'react';

const MONTH_NAMES_HI = [
  "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", 
  "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"
];

const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const DYNAMIC_TIPS = {
  Wheat: {
    hi: 'गेहूं की कटाई के बाद ग्रीष्मकालीन मूंग (दलहन) बोने से मिट्टी में नाइट्रोजन का प्राकृतिक संचयन होता है एवं उर्वरक लागत 25% तक घटती है।',
    en: 'Planting Summer Mung Bean (Pulses) after Wheat harvest naturally fixes Nitrogen in the soil, reducing fertilizer costs by 25%.'
  },
  Rice: {
    hi: 'धान (चावल) कटाई के बाद रबी सरसों या चना बोने से मिट्टी की अवशिष्ट नमी का पूर्ण उपयोग होता है एवं अतिरिक्त मंडी आय मिलती है।',
    en: 'Sowing Rabi Mustard or Chickpea right after Paddy harvest utilizes residual soil moisture, maximizing off-season revenue.'
  },
  Cotton: {
    hi: 'कपास की फसल के बाद गहरी जड़ों वाली दलहन फसल उगाने से मिट्टी का जैविक संतुलन सुधरता है और कीट संक्रमण घटता है।',
    en: 'Rotating Cotton with deep-rooted pulses improves soil organic structure and breaks pest infestation cycles.'
  },
  Sugarcane: {
    hi: 'गन्ने की शुरुआती कतारों के बीच अंतर-फसल (Intercropping) के रूप में आलू, मूंगफली या धनिया उगाने से त्वरित नकद आय मिलती है।',
    en: 'Intercropping vegetables, groundnut, or coriander between Sugarcane rows generates immediate early cash flow.'
  },
  Maize: {
    hi: 'मक्का के बाद शीतकालीन गेहूं या सरसों उगाने से चक्र संतुलित रहता है और वर्षभर नियमित रीपेमेंट क्षमता बनी रहती है।',
    en: 'Following Maize with winter Wheat or Mustard maintains a balanced soil nutrient cycle and steady multi-season revenue.'
  }
};

const CROP_DURATIONS = {
  Wheat: 4,
  Rice: 5,
  Cotton: 6,
  Sugarcane: 12,
  Maize: 3
};

const CropRotationPlanner = ({ formState, areaHectares = 2.5, t }) => {
  const currentCrop = formState?.crop || 'Wheat';
  const startMonthIdx = formState?.startMonthIndex !== undefined ? formState.startMonthIndex : 10;
  const area = parseFloat(formState?.areaHectares || areaHectares) || 2.5;

  const monthList = t?.lang === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_HI;

  // Calculate Cycle 1 (Current Crop)
  const currentDur = CROP_DURATIONS[currentCrop] || 4;
  const c1EndIdx = (startMonthIdx + currentDur) % 12;

  // Calculate Cycle 2 (Next Rotation Crop)
  const c2StartIdx = c1EndIdx;
  const c2Dur = currentCrop === 'Wheat' ? 3 : 4;
  const c2EndIdx = (c2StartIdx + c2Dur) % 12;
  const c2CropName = currentCrop === 'Wheat' ? 'ग्रीष्मकालीन मूंग (Summer Mung)' : 'गेहूं / सरसों (Rabi Wheat/Mustard)';

  // Calculate Cycle 3 (Third Rotation Crop)
  const c3StartIdx = c2EndIdx;
  const c3Dur = 5;
  const c3EndIdx = (c3StartIdx + c3Dur) % 12;
  const c3CropName = 'मानसून धान / मक्का (Kharif Paddy/Maize)';

  const cycles = [
    {
      season: `चक्र 1 (${monthList[startMonthIdx]} से ${monthList[c1EndIdx]})`,
      crop: `${currentCrop} (वर्तमान)`,
      soilBenefit: 'मुख्य फसल पैदावार एवं मंडी आय',
      revPerHa: 85000,
      icon: '🌾',
      color: 'border-amber-400 bg-amber-50/60'
    },
    {
      season: `चक्र 2 (${monthList[c2StartIdx]} से ${monthList[c2EndIdx]})`,
      crop: c2CropName,
      soilBenefit: 'मिट्टी में नाइट्रोजन स्थिरीकरण (N-Fixation)',
      revPerHa: 48000,
      icon: '🌱',
      color: 'border-green-400 bg-green-50/60'
    },
    {
      season: `चक्र 3 (${monthList[c3StartIdx]} से ${monthList[c3EndIdx]})`,
      crop: c3CropName,
      soilBenefit: 'मानसून बारिश का अधिकतम उपयोग',
      revPerHa: 88000,
      icon: '🌽',
      color: 'border-yellow-400 bg-yellow-50/60'
    }
  ];

  const totalAnnualProjectedRevenue = cycles.reduce(
    (sum, cycle) => sum + (cycle.revPerHa * area),
    0
  );

  const customTip = DYNAMIC_TIPS[currentCrop] || DYNAMIC_TIPS['Wheat'];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E8630A]/15 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔄</span>
          <div>
            <h3 className="text-xl font-bold text-[#3D2C1E]">
              {t?.cropRotationTitle || 'फसल चक्र व वार्षिक आय योजक (Crop Rotation Planner)'}
            </h3>
            <p className="text-xs text-gray-500">
              चुनी गई बुआई अवधि ({monthList[startMonthIdx]}) एवं {currentCrop} फसल के अनुसार गतिशील चक्र
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 font-semibold block">{t?.total1YearRev || 'वार्षिक कुल संभावित आय'}</span>
          <span className="text-xl font-black text-[#2D6A4F]">
            ₹{Math.round(totalAnnualProjectedRevenue).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Dynamic Rotation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cycles.map((cycle, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl border-2 transition-all hover:shadow-md ${cycle.color}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-700 bg-white/90 px-2.5 py-1 rounded-md shadow-xs">
                {cycle.season}
              </span>
              <span className="text-2xl">{cycle.icon}</span>
            </div>

            <h4 className="text-lg font-extrabold text-[#3D2C1E] mb-1">{cycle.crop}</h4>
            <p className="text-xs text-gray-600 font-medium mb-3 min-h-[32px]">
              {cycle.soilBenefit}
            </p>

            <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-semibold">{t?.estRevenue || 'अनुमानित आय'} ({area} Ha):</span>
              <strong className="text-sm font-bold text-[#E8630A]">
                ₹{Math.round(cycle.revPerHa * area).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Crop Rotation Tip tailored to chosen crop */}
      <div className="bg-[#FFF8F0] p-4 rounded-xl border border-[#E8630A]/20 flex items-start gap-3 text-xs text-[#3D2C1E]">
        <span className="text-xl">💡</span>
        <div>
          <strong className="font-bold text-[#E8630A] block mb-0.5">
            {t?.expertTip || 'कृषि विशेषज्ञ सुझाव:'} ({currentCrop})
          </strong>
          {t?.lang === 'en' ? customTip.en : customTip.hi}
        </div>
      </div>
    </div>
  );
};

export default CropRotationPlanner;
