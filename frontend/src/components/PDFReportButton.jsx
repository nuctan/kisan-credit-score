import React, { useState } from 'react';

const PDFReportButton = ({ analysisData, farmerName, formState }) => {
  const [showModal, setShowModal] = useState(false);

  if (!analysisData) return null;

  const { baseline_metrics, ai_scores, predictions } = analysisData;
  const currentDate = new Date().toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="w-full sm:w-auto px-6 py-3 bg-[#2D6A4F] hover:bg-[#22533c] text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 border border-green-700"
      >
        <span>📄</span>
        <span>बैंक ऋण रिपोर्ट डाउनलोड करें (Download Official PDF Report)</span>
      </button>

      {/* Printable Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[5000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-[#3D2C1E] text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📄</span>
                <h3 className="font-bold text-lg">किसान AI आधिकारिक ऋण मूल्यांकन रिपोर्ट</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 bg-[#E8630A] hover:bg-[#d55809] text-white font-bold text-xs rounded-lg shadow cursor-pointer flex items-center gap-1.5"
                >
                  <span>🖨️</span> प्रिंट / PDF सहेजें (Print / Save as PDF)
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-300 hover:text-white font-bold text-lg px-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Report Content Container */}
            <div className="flex-1 overflow-y-auto p-8 font-sans space-y-6 bg-white text-[#3D2C1E] print-container">
              {/* Report Letterhead */}
              <div className="border-b-4 border-[#E8630A] pb-6 flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-black text-[#E8630A]">
                    किसान<span className="text-[#2D6A4F]">AI</span>
                  </h1>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                    Agricultural Credit Risk & Yield Intelligence Report
                  </p>
                  <p className="text-xs text-gray-400">सत्यापित सैटेलाइट एवं मौसम आधारित ऋण पात्रता दस्तावेज</p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-green-100 text-green-800 font-extrabold text-xs rounded-full border border-green-300">
                    स्थिति: बैंक स्वीकृति हेतु अनुशंसित
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-medium">दिनांक: {currentDate}</p>
                  <p className="text-xs text-gray-400 font-mono">ID: KAI-{Math.floor(100000 + Math.random() * 900000)}</p>
                </div>
              </div>

              {/* Section 1: Farmer & Land Metadata */}
              <div>
                <h4 className="text-sm font-bold text-[#2D6A4F] uppercase tracking-wider mb-3 border-l-4 border-[#2D6A4F] pl-2">
                  1. किसान एवं भूमि का विवरण (Farmer & Land Profile)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#FFF8F0] p-4 rounded-xl border border-[#E8630A]/20 text-xs">
                  <div>
                    <span className="text-gray-500 block font-medium">किसान का नाम:</span>
                    <strong className="text-sm font-bold text-[#3D2C1E]">{farmerName || 'प्रशासक किसान'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block font-medium">राज्य व जिला:</span>
                    <strong className="text-sm font-bold text-[#3D2C1E]">{formState?.state || 'महाराष्ट्र'}, {formState?.district || 'अहिल्यानगर'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block font-medium">चयनित फसल:</span>
                    <strong className="text-sm font-bold text-[#E8630A]">{formState?.crop || 'गेहूं (Wheat)'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block font-medium">क्षेत्रफल (Land Area):</span>
                    <strong className="text-sm font-bold text-[#3D2C1E]">{formState?.areaHectares || 2.5} हेक्टेयर</strong>
                  </div>
                </div>
              </div>

              {/* Section 2: Remote Sensing & Climate Telemetry */}
              <div>
                <h4 className="text-sm font-bold text-[#2D6A4F] uppercase tracking-wider mb-3 border-l-4 border-[#2D6A4F] pl-2">
                  2. सैटेलाइट एवं मौसम विश्लेषण (Remote Sensing & Climate Analysis)
                </h4>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="border p-3 rounded-xl bg-gray-50">
                    <span className="text-gray-500 block mb-1">Sentinel-2 वनस्पति स्वास्थ्य (NDVI)</span>
                    <span className="text-lg font-bold text-[#2D6A4F]">{ai_scores?.ndvi?.score || 1.0}</span>
                    <p className="text-[11px] text-gray-600 mt-1">{ai_scores?.ndvi?.description}</p>
                  </div>
                  <div className="border p-3 rounded-xl bg-gray-50">
                    <span className="text-gray-500 block mb-1">IMD मौसम पूर्वानुमान स्कोर</span>
                    <span className="text-lg font-bold text-[#E8630A]">{ai_scores?.weather?.score || 1.0}</span>
                    <p className="text-[11px] text-gray-600 mt-1">{ai_scores?.weather?.description}</p>
                  </div>
                  <div className="border p-3 rounded-xl bg-gray-50">
                    <span className="text-gray-500 block mb-1">मिट्टी उर्वरता सूचकांक (N-P-K)</span>
                    <span className="text-lg font-bold text-[#3D2C1E]">{ai_scores?.soil?.score || 1.0}</span>
                    <p className="text-[11px] text-gray-600 mt-1">{ai_scores?.soil?.description}</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Financial & Credit Eligibility Assessment */}
              <div>
                <h4 className="text-sm font-bold text-[#2D6A4F] uppercase tracking-wider mb-3 border-l-4 border-[#2D6A4F] pl-2">
                  3. वित्तीय एवं ऋण पात्रता विश्लेषण (Financial & Credit Assessment)
                </h4>
                <div className="bg-[#2D6A4F] text-white p-5 rounded-2xl space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-b border-white/20 pb-4 text-xs">
                    <div>
                      <span className="text-white/70 block">वर्तमान फसल अनुमानित आय:</span>
                      <strong className="text-xl font-bold text-[#D4A017]">
                        ₹{predictions?.adjusted_estimated_revenue_rs?.toLocaleString('en-IN') || 0}
                      </strong>
                    </div>
                    <div>
                      <span className="text-white/70 block">ऐतिहासिक औसत उपज:</span>
                      <strong className="text-lg font-bold">
                        {baseline_metrics?.historical_yield_tonnes_per_hectare} टन/हेक्टेयर
                      </strong>
                    </div>
                    <div>
                      <span className="text-white/70 block">जोखिम श्रेणी (Risk Level):</span>
                      <strong className="text-lg font-bold text-emerald-300">
                        {predictions?.risk_level || 'Medium'} Risk
                      </strong>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-white text-[#3D2C1E] p-4 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-[#2D6A4F] block">अनुशंसित अधिकतम सुरक्षित ऋण सीमा (Safe Credit Limit Cap)</span>
                      <p className="text-[11px] text-gray-500">किसान आय की 60% सुरक्षित रीपेमेंट क्षमता पर आधारित</p>
                    </div>
                    <span className="text-3xl font-black text-[#E8630A]">
                      ₹{predictions?.suggested_loan_limit_rs?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 4: Bank Sign-off Block */}
              <div className="border-t pt-6 grid grid-cols-2 gap-8 text-xs text-gray-500">
                <div>
                  <p className="font-bold text-[#3D2C1E] mb-8">किसान के हस्ताक्षर (Farmer Signature):</p>
                  <div className="border-b border-dashed border-gray-400 w-3/4"></div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#3D2C1E] mb-8">ऋण अधिकारी / बैंक मोहर (Bank Credit Officer):</p>
                  <div className="border-b border-dashed border-gray-400 w-3/4 ml-auto"></div>
                </div>
              </div>

              {/* Disclaimer Footer */}
              <p className="text-[10px] text-gray-400 text-center pt-4 border-t">
                यह रिपोर्ट किसानAI ML इंजन, IMD मौसम डेटा एवं Sentinel-2 सैटेलाइट डेटा द्वारा तैयार की गई है। वित्तीय स्वीकृति बैंक के अंतिम विवेक पर निर्भर है।
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PDFReportButton;
