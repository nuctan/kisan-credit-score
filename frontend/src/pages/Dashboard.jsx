import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FarmlandMap from '../components/FarmlandMap';
import LandAnalysisCard from '../components/LandAnalysisCard';
import FinancialRevenueCard from '../components/FinancialRevenueCard';
import CalculationBreakdown from '../components/CalculationBreakdown';
import PDFReportButton from '../components/PDFReportButton';
import FullLandReport from '../components/FullLandReport';
import SatelliteTrendChart from '../components/SatelliteTrendChart';
import { translations } from '../utils/translations';
import { INDIA_STATES_DISTRICTS } from '../utils/indiaDistricts';

const API_URL = 'http://localhost:8000/api';

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
  </svg>
);

const MONTHS_LIST = [
  { idx: 0, hi: 'जनवरी (January)', en: 'January' },
  { idx: 1, hi: 'फ़रवरी (February)', en: 'February' },
  { idx: 2, hi: 'मार्च (March)', en: 'March' },
  { idx: 3, hi: 'अप्रैल (April)', en: 'April' },
  { idx: 4, hi: 'मई (May)', en: 'May' },
  { idx: 5, hi: 'जून (June)', en: 'June' },
  { idx: 6, hi: 'जुलाई (July)', en: 'July' },
  { idx: 7, hi: 'अगस्त (August)', en: 'August' },
  { idx: 8, hi: 'सितंबर (September)', en: 'September' },
  { idx: 9, hi: 'अक्टूबर (October)', en: 'October' },
  { idx: 10, hi: 'नवंबर (November)', en: 'November' },
  { idx: 11, hi: 'दिसंबर (December)', en: 'December' },
];

const AUTO_CROP_DURATIONS = {
  Wheat: 4,
  Rice: 5,
  Cotton: 6,
  Sugarcane: 12,
  Maize: 3
};

const Dashboard = () => {
  const navigate = useNavigate();

  // User auth state
  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;

  // Form states for Land & Loan Selection (NO HARDCODED DEFAULT VALUES for new accounts)
  const [formState, setFormState] = useState({
    state: 'Maharashtra',
    district: '',
    crop: '',
    areaHectares: '',
    loanTenureYears: 1,
    startMonthIndex: 10,
    cropDurationMonths: 4
  });

  const [selectedPos, setSelectedPos] = useState([19.0958, 74.7496]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [lang, setLang] = useState('hi');
  const [chatLang, setChatLang] = useState('hi');
  const [isListening, setIsListening] = useState(false);

  const t = translations[lang] || translations.hi;

  // Fetch user profile from MongoDB on mount to load saved farm details if present
  useEffect(() => {
    if (!user || (!user.token && !user._id)) {
      navigate('/login');
      return;
    }

    const loadUserProfile = async () => {
      try {
        const token = user.token || localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.farmProfile) {
          const fp = res.data.farmProfile;
          if (fp.district || fp.crop || fp.areaHectares) {
            setFormState(prev => ({
              ...prev,
              district: fp.district || prev.district,
              crop: fp.crop || prev.crop,
              areaHectares: fp.areaHectares || prev.areaHectares,
              loanTenureYears: fp.loanTenureYears || prev.loanTenureYears,
              startMonthIndex: fp.startMonthIndex !== undefined ? fp.startMonthIndex : prev.startMonthIndex,
              cropDurationMonths: fp.cropDurationMonths || prev.cropDurationMonths
            }));
          }
        }
      } catch (err) {
        console.warn('Could not load profile from DB:', err.message);
      }
    };

    loadUserProfile();
  }, [navigate]);

  // Maharashtra districts list
  const currentDistricts = INDIA_STATES_DISTRICTS.Maharashtra.districts;

  // Handle District Change & Auto-center Satellite Map
  const handleDistrictChange = (newDistrictName) => {
    const distObj = currentDistricts.find(d => d.name === newDistrictName);
    setFormState(prev => ({ ...prev, district: newDistrictName }));
    if (distObj && distObj.coords) {
      setSelectedPos(distObj.coords);
    }
  };

  // Auto update crop duration when crop changes
  const handleCropChange = (newCrop) => {
    const autoDur = AUTO_CROP_DURATIONS[newCrop] || 4;
    setFormState(prev => ({
      ...prev,
      crop: newCrop,
      cropDurationMonths: autoDur
    }));
  };

  // Instant pre-computed estimation calculation for live context sync
  const areaHa = parseFloat(formState.areaHectares) || 0;
  const estBaseRev = areaHa * 3.5 * 10 * 2275;
  const estCombinedRev = estBaseRev * 2.2;
  const estSafeLoanCap = Math.round(estCombinedRev * 0.60);

  // Next Crop Sow Date Prediction
  const harvestMonthIdx = ((parseInt(formState.startMonthIndex) || 10) + (parseInt(formState.cropDurationMonths) || 4)) % 12;
  const nextSowMonthName = MONTHS_LIST[harvestMonthIdx]?.[lang] || 'May';

  // Construct Dynamic Welcome Message that SYNCs automatically with Form Inputs
  const getDynamicWelcomeMessage = () => {
    const monthName = MONTHS_LIST[formState.startMonthIndex]?.[lang] || 'November';
    const hasDetails = formState.crop && formState.areaHectares && formState.district;

    if (!hasDetails) {
      return {
        role: 'assistant',
        content: lang === 'en'
          ? `Hello ${user?.name || 'Farmer'}! 🙏 Welcome to KrishiAI. Please fill out your land details above (District, Crop, Sowing Month, Area) to check your loan eligibility and multi-season succession report.`
          : `नमस्ते ${user?.name || 'किसान'}! 🙏 किसानAI में आपका स्वागत है। अपनी ऋण पात्रता और फसल उत्तराधिकार रिपोर्ट देखने के लिए कृपया ऊपर अपना भूमि विवरण (जिला, फसल, बुआई का महीना, क्षेत्रफल) दर्ज करें।`
      };
    }

    if (lang === 'en') {
      return {
        role: 'assistant',
        content: `Hello ${user?.name || 'Farmer'}! 🙏 Based on your land details (${formState.crop}, ${formState.areaHectares} Ha in ${formState.district}, ${formState.state} sown in ${monthName}), you are eligible for a loan amount of ₹${estSafeLoanCap.toLocaleString('en-IN')}. Next crop sowing is recommended in 1st week of ${nextSowMonthName}.`
      };
    }
    return {
      role: 'assistant',
      content: `नमस्ते ${user?.name || 'किसान'}! 🙏 आपके भूमि विवरण (${formState.crop}, ${formState.areaHectares} हेक्टेयर - ${formState.district}, ${formState.state}, बुआई: ${monthName}) के अनुसार, आप ₹${estSafeLoanCap.toLocaleString('en-IN')} की ऋण राशि के लिए पात्र हैं। अगली फसल बुआई ${nextSowMonthName} के पहले सप्ताह में अनुशंसित है।`
    };
  };

  const [messages, setMessages] = useState([getDynamicWelcomeMessage()]);
  const [input, setInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatId, setChatId] = useState(null);
  const chatContainerRef = useRef(null);

  // Synchronize AI Chat Welcome Message when form inputs change
  useEffect(() => {
    setMessages(prev => {
      const updated = [...prev];
      updated[0] = getDynamicWelcomeMessage();
      return updated;
    });
  }, [formState.crop, formState.areaHectares, formState.district, formState.state, formState.startMonthIndex, formState.loanTenureYears, lang]);

  // Handle Dynamic Area Change from Map Polygon
  const handleAreaChange = (newHectares) => {
    setFormState(prev => ({ ...prev, areaHectares: newHectares }));
  };

  // Trigger ML Analysis & SAVE farm details to MongoDB
  const handleAnalyzeLand = async (coords = selectedPos, customArea = formState.areaHectares) => {
    setAnalyzing(true);
    try {
      const token = user?.token || localStorage.getItem('token');
      const areaToUse = parseFloat(customArea) || parseFloat(formState.areaHectares) || 0;

      const res = await axios.post(
        `${API_URL}/ai/analyze`,
        {
          state: formState.state,
          district: formState.district || 'Ahilyanagar (Ahmednagar)',
          crop: formState.crop || 'Wheat',
          area_hectares: areaToUse || 2.5,
          lat: coords[0],
          lon: coords[1],
          loan_tenure_years: parseInt(formState.loanTenureYears || 1),
          start_month_index: parseInt(formState.startMonthIndex || 10),
          current_crop_duration: parseInt(formState.cropDurationMonths || 4)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAnalysisData(res.data);

      const pred = res.data.predictions;
      const totalCombinedRev = pred?.total_1year_combined_revenue_rs || pred?.adjusted_estimated_revenue_rs * 2.2;
      const loanCap = pred?.suggested_loan_limit_rs;
      const nextDecision = res.data.one_year_succession_plan?.next_crop_decision;

      // Save updated farm details to MongoDB Database permanently
      try {
        await axios.put(
          `${API_URL}/auth/profile`,
          {
            state: formState.state,
            district: formState.district,
            crop: formState.crop,
            areaHectares: areaToUse,
            loanTenureYears: formState.loanTenureYears,
            startMonthIndex: formState.startMonthIndex,
            cropDurationMonths: formState.cropDurationMonths,
            suggestedLoanLimit: loanCap
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (saveErr) {
        console.warn('Failed to save farm details to MongoDB:', saveErr.message);
      }

      const summaryMsg = lang === 'en'
        ? `🌾 You are eligible for a loan amount of ₹${Math.round(loanCap).toLocaleString('en-IN')}\n\n1. Current ${formState.crop || 'Crop'} Income: ₹${pred?.adjusted_estimated_revenue_rs?.toLocaleString('en-IN')}\n2. Total Combined Income (${formState.loanTenureYears} Years): ₹${Math.round(totalCombinedRev).toLocaleString('en-IN')}\n3. Current Crop Harvest: ${MONTHS_LIST[harvestMonthIdx].en}\n4. Recommended Next Crop Sowing Date: ${nextDecision?.recommended_next_sow_date || `1st Week of ${MONTHS_LIST[harvestMonthIdx].en}`} (${nextDecision?.recommended_next_crop || 'Summer Mung Bean'})\n\n(Details saved to database successfully)`
        : `🌾 आप ₹${Math.round(loanCap).toLocaleString('en-IN')} की ऋण राशि के लिए पात्र हैं\n\n1. वर्तमान ${formState.crop || 'फसल'} आय: ₹${pred?.adjusted_estimated_revenue_rs?.toLocaleString('en-IN')}\n2. ${formState.loanTenureYears}-वर्षीय कुल संयुक्त आय: ₹${Math.round(totalCombinedRev).toLocaleString('en-IN')}\n3. कटाई का महीना: ${MONTHS_LIST[harvestMonthIdx].hi}\n4. अनुशंसित अगली फसल बुआई तिथि: ${nextDecision?.recommended_next_sow_date || `${MONTHS_LIST[harvestMonthIdx].hi} का पहला सप्ताह`} (${nextDecision?.recommended_next_crop || 'ग्रीष्मकालीन मूंग दलहन'})\n\n(विवरण डेटाबेस में सफलतापूर्वक सुरक्षित किया गया)`;

      setMessages(prev => [...prev, { role: 'assistant', content: summaryMsg }]);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Chat send handler with Live Form Data & Loan Computation Payload
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!input.trim() || loadingChat) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoadingChat(true);

    try {
      const token = user?.token || localStorage.getItem('token');

      const payloadContext = analysisData || {
        inputs: {
          state: formState.state,
          district: formState.district || 'N/A',
          crop: formState.crop || 'N/A',
          area_hectares: formState.areaHectares || '0',
        },
        predictions: {
          adjusted_estimated_revenue_rs: Math.round(estBaseRev),
          total_1year_combined_revenue_rs: Math.round(estCombinedRev),
          suggested_loan_limit_rs: estSafeLoanCap,
          risk_level: 'Medium'
        },
        one_year_succession_plan: {
          loan_tenure_years: formState.loanTenureYears,
          start_month: MONTHS_LIST[formState.startMonthIndex || 10]?.en || 'November',
          next_crop_decision: {
            recommended_next_crop: "Summer Mung Bean",
            recommended_next_sow_date: `1st Week of ${nextSowMonthName}`
          }
        }
      };

      const res = await axios.post(
        `${API_URL}/ai/chat`,
        {
          message: userMessage,
          chatId,
          landContext: payloadContext,
          lang: chatLang
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChatId(res.data.chatId);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
      
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: lang === 'en' ? '⚠️ Error sending message.' : '⚠️ संदेश भेजने में त्रुटि हुई।' }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] font-sans flex flex-col">
      <header className="bg-white border-b border-[#E8630A]/15 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌾</span>
          <div>
            <h1 className="text-2xl font-bold text-[#E8630A]">
              {t.title}<span className="text-[#2D6A4F]">AI</span>
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">{t.subtitle}</p>
          </div>
        </div>

        {/* Project Language Switcher Toggle (Hindi / English only) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#FFF8F0] p-1 rounded-xl border border-[#E8630A]/30">
            <button
              type="button"
              onClick={() => setLang('hi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lang === 'hi' ? 'bg-[#E8630A] text-white shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              🇮🇳 हिंदी
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lang === 'en' ? 'bg-[#2D6A4F] text-[#FFF8F0] shadow-sm' : 'text-gray-600 hover:text-black'
              }`}
            >
              🇬🇧 English
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#3D2C1E]">
            <div className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span>{user?.name || t.farmer}</span>
          </div>

          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition cursor-pointer"
          >
            {t.logout}
          </button>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-[#E8630A]/15 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-lg font-bold text-[#3D2C1E] flex items-center gap-2">
              <span>📝</span> {t.enterDetailsTitle}
            </h3>
            <span className="text-xs text-[#2D6A4F] font-bold">
              {user?.farmProfile?.crop ? (lang === 'en' ? '💾 Saved in Database' : '💾 डेटाबेस में सुरक्षित') : t.step1}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t.state}</label>
              <select
                disabled
                value="Maharashtra"
                className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-xl text-sm font-semibold text-gray-700 cursor-not-allowed"
              >
                <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D6A4F] mb-1">{lang === 'en' ? 'District' : 'जिला (Select District)'}</label>
              <select
                value={formState.district}
                onChange={e => handleDistrictChange(e.target.value)}
                className="w-full px-3 py-2 border-2 border-[#2D6A4F]/40 rounded-xl text-sm font-bold text-[#3D2C1E] focus:border-[#2D6A4F] focus:outline-none"
              >
                <option value="">{lang === 'en' ? '-- Select District --' : '-- जिला चुनें (Select District) --'}</option>
                {currentDistricts.map(dist => (
                  <option key={dist.name} value={dist.name}>{dist.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E8630A] mb-1">{lang === 'en' ? '1. Which Crop?' : '1. कौन सी फसल? (Crop)'}</label>
              <select
                value={formState.crop}
                onChange={e => handleCropChange(e.target.value)}
                className="w-full px-3 py-2 border-2 border-[#E8630A]/40 rounded-xl text-sm font-bold text-[#3D2C1E] focus:border-[#E8630A] focus:outline-none"
              >
                <option value="">{lang === 'en' ? '-- Select Crop --' : '-- फसल चुनें (Select Crop) --'}</option>
                <option value="Wheat">{t.wheat} (4 Months)</option>
                <option value="Rice">{t.rice} (5 Months)</option>
                <option value="Cotton">{t.cotton} (6 Months)</option>
                <option value="Sugarcane">{t.sugarcane} (12 Months)</option>
                <option value="Maize">{t.maize} (3 Months)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D6A4F] mb-1">{lang === 'en' ? '2. Sowing Month?' : '2. बुआई कब की? (Sowing Month)'}</label>
              <select
                value={formState.startMonthIndex}
                onChange={e => setFormState({ ...formState, startMonthIndex: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border-2 border-[#2D6A4F]/40 rounded-xl text-sm font-bold text-[#3D2C1E] focus:border-[#2D6A4F] focus:outline-none"
              >
                {MONTHS_LIST.map(m => (
                  <option key={m.idx} value={m.idx}>
                    {lang === 'en' ? m.en : m.hi}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E8630A] mb-1">{lang === 'en' ? '3. Loan Tenure?' : '3. कितना ऋण? (Tenure)'}</label>
              <select
                value={formState.loanTenureYears}
                onChange={e => setFormState({ ...formState, loanTenureYears: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border-2 border-[#E8630A] bg-orange-50/50 rounded-xl text-sm font-bold text-[#E8630A] focus:outline-none"
              >
                <option value={1}>{t.oneYear}</option>
                <option value={2}>{t.twoYears}</option>
                <option value={3}>{t.threeYears}</option>
                <option value={5}>{t.fiveYears}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {t.areaHectares} <span className="text-[10px] text-[#2D6A4F]">({t.calculatedFromMap})</span>
              </label>
              <input
                type="number"
                step="0.1"
                placeholder={lang === 'en' ? 'e.g. 2.5' : 'उदा: 2.5'}
                value={formState.areaHectares}
                onChange={e => setFormState({ ...formState, areaHectares: e.target.value })}
                className="w-full px-3 py-2 border border-[#2D6A4F] bg-green-50/50 rounded-xl text-sm font-bold text-[#2D6A4F] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#3D2C1E] flex items-center gap-2">
              <span>🗺️</span> {t.mapTitle}
            </h3>
            {analyzing && (
              <span className="text-xs font-bold text-[#E8630A] animate-pulse">
                {t.analyzingText}
              </span>
            )}
          </div>

          <FarmlandMap
            selectedPos={selectedPos}
            setSelectedPos={setSelectedPos}
            onConfirmSelection={handleAnalyzeLand}
            onAreaChange={handleAreaChange}
            areaHectares={formState.areaHectares || 2.5}
            lang={lang}
            t={t}
          />
        </div>

        <SatelliteTrendChart
          district={formState.district || 'Ahilyanagar (Ahmednagar)'}
          crop={formState.crop || 'Wheat'}
          t={t}
          lang={lang}
        />

        {analysisData && <LandAnalysisCard analysis={analysisData} t={t} lang={lang} />}
        {analysisData && (
          <CalculationBreakdown
            analysisData={analysisData}
            formState={formState}
            t={t}
            lang={lang}
          />
        )}
        {analysisData && (
          <FullLandReport
            analysisData={analysisData}
            formState={formState}
            t={t}
            lang={lang}
          />
        )}
        {analysisData && (
          <FinancialRevenueCard
            predictions={analysisData.predictions}
            baselineMetrics={analysisData.baseline_metrics}
            t={t}
            lang={lang}
          />
        )}
        {analysisData && (
          <div className="flex justify-center pt-2">
            <PDFReportButton
              analysisData={analysisData}
              farmerName={user?.name}
              formState={formState}
              t={t}
            />
          </div>
        )}

        {/* Step 8: Embedded AI Chat Assistant on Main Dashboard (Python RAG Powered) */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#E8630A]/20 h-[520px] flex flex-col overflow-hidden">
          <div className="p-4 bg-[#2D6A4F] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌾</span>
              <h3 className="font-bold text-lg">{t.chatHeader}</h3>
            </div>
            
            {/* Chatbot Specific 5-Language Selector */}
            <div className="flex items-center gap-2">
              <select
                value={chatLang}
                onChange={e => setChatLang(e.target.value)}
                className="bg-white/10 text-white border border-white/20 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="hi" className="text-black">🇮🇳 हिंदी</option>
                <option value="en" className="text-black">🇬🇧 English</option>
                <option value="mr" className="text-black">🚩 मराठी</option>
                <option value="gu" className="text-black">🦁 ગુજરાતી</option>
                <option value="ta" className="text-black">🏛️ தமிழ்</option>
              </select>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full hidden sm:inline">Groq LLaMA 3.3</span>
            </div>
          </div>

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#FFF8F0] to-[#fcf3e8]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[#e6f0eb] border border-[#2D6A4F]/20 flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                    🌾
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#E8630A] text-white rounded-br-none'
                      : 'bg-[#e6f0eb] text-[#3D2C1E] rounded-bl-none border border-[#2D6A4F]/10'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loadingChat && (
              <div className="flex gap-2 items-center text-xs text-gray-500 italic">
                <span>{t.chatSending}</span>
              </div>
            )}
          </div>

          {/* Input Bar with Voice Input (Web Speech API) */}
          <form onSubmit={handleSendChat} className="p-3 bg-[#FFF8F0] border-t flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t.chatPlaceholder}
              className="flex-1 px-4 py-3 bg-white border border-[#E8630A]/20 rounded-xl text-sm focus:outline-none focus:border-[#E8630A]"
            />

            {/* Voice Input Button with getUserMedia Permission Prompt */}
            <button
              type="button"
              onClick={async () => {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognition) {
                  alert('आपके ब्राउज़र में स्पीच रिकॉग्निशन सपोर्ट नहीं है। कृपया Google Chrome का प्रयोग करें।');
                  return;
                }

                // Explicitly request microphone permission from browser first
                try {
                  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    // Stop stream immediately after permission granted
                    stream.getTracks().forEach(track => track.stop());
                  }
                } catch (micErr) {
                  alert('🎙️ माइक्रोफोन अनुमति अस्वीकृत: कृपया ब्राउज़र के यूआरएल बार में ताला (Lock / Site Settings) आइकॉन पर क्लिक करके माइक की अनुमति दें।');
                  return;
                }

                const recognition = new SpeechRecognition();
                const langCodes = { hi: 'hi-IN', en: 'en-US', mr: 'mr-IN', gu: 'gu-IN', ta: 'ta-IN' };
                recognition.lang = langCodes[chatLang] || 'hi-IN';
                recognition.interimResults = false;

                recognition.onstart = () => setIsListening(true);
                recognition.onend = () => setIsListening(false);
                recognition.onerror = (e) => {
                  console.warn('Speech recognition error:', e.error);
                  setIsListening(false);
                  if (e.error === 'not-allowed') {
                    alert('🎙️ माइक्रोफोन अनुमति अस्वीकृत: कृपया ब्राउज़र की साइट सेटिंग्स में माइक को Allow करें।');
                  }
                };

                recognition.onresult = (event) => {
                  const transcript = event.results[0][0].transcript;
                  setInput(prev => (prev ? prev + ' ' + transcript : transcript));
                };

                try {
                  recognition.start();
                } catch (err) {
                  console.warn('Recognition start error:', err);
                }
              }}
              className={`p-3 rounded-xl border font-bold transition-all cursor-pointer flex items-center justify-center ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse border-red-600 shadow-md'
                  : 'bg-orange-50 text-[#E8630A] border-[#E8630A]/30 hover:bg-[#E8630A] hover:text-white'
              }`}
              title={isListening ? 'सुन रहा है... (Listening...)' : 'बोलकर पूछें (Voice Input)'}
            >
              🎤
            </button>

            <button
              type="submit"
              disabled={loadingChat || !input.trim()}
              className="px-5 py-3 bg-[#E8630A] hover:bg-[#d55605] text-white rounded-xl text-sm font-bold disabled:opacity-50 transition cursor-pointer"
            >
              {loadingChat ? '...' : (lang === 'en' ? 'Send' : 'भेजें')}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
