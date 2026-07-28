import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FarmlandMap from '../components/FarmlandMap';
import LandAnalysisCard from '../components/LandAnalysisCard';
import FinancialRevenueCard from '../components/FinancialRevenueCard';
import CalculationBreakdown from '../components/CalculationBreakdown';
import PDFReportButton from '../components/PDFReportButton';
import CropRotationPlanner from '../components/CropRotationPlanner';
import FullLandReport from '../components/FullLandReport';
import { translations } from '../utils/translations';

const API_URL = 'http://localhost:5000/api';

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

  // Language State ('hi' for Hindi, 'en' for English)
  const [lang, setLang] = useState('hi');
  const t = translations[lang];

  // User auth state
  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;

  useEffect(() => {
    if (!user || (!user.token && !user._id)) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Form states for Land & Loan Selection
  const [formState, setFormState] = useState({
    state: 'Maharashtra',
    district: 'Ahilyanagar',
    crop: 'Wheat',
    areaHectares: 3.37,
    loanTenureYears: 1,
    startMonthIndex: 10, // November
    cropDurationMonths: 4
  });

  const [selectedPos, setSelectedPos] = useState([19.0958, 74.7496]);
  const [analysisData, setAnalysisData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

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
  const areaHa = parseFloat(formState.areaHectares) || 2.5;
  const estBaseRev = areaHa * 3.5 * 10 * 2275;
  const estCombinedRev = estBaseRev * 2.2;
  const estSafeLoanCap = Math.round(estCombinedRev * 0.60);

  // Construct Dynamic Welcome Message that SYNCs automatically with Form Inputs
  const getDynamicWelcomeMessage = () => {
    const monthName = MONTHS_LIST[formState.startMonthIndex]?.[lang] || 'November';
    if (lang === 'en') {
      return {
        role: 'assistant',
        content: `Hello! 🙏 I am KrishiAI. Based on your land details (**${formState.crop}**, **${formState.areaHectares} Ha** in **${formState.district}, ${formState.state}**), **you are eligible for a loan amount of ₹${estSafeLoanCap.toLocaleString('en-IN')}**.`
      };
    }
    return {
      role: 'assistant',
      content: `नमस्ते! 🙏 मैं किसानAI हूँ। आपके भूमि विवरण (**${formState.crop}**, **${formState.areaHectares} हेक्टेयर** - **${formState.district}, ${formState.state}**) के अनुसार, **आप ₹${estSafeLoanCap.toLocaleString('en-IN')} की ऋण राशि के लिए पात्र हैं (You are eligible for loan amount ₹${estSafeLoanCap.toLocaleString('en-IN')})।**`
    };
  };

  const [messages, setMessages] = useState([getDynamicWelcomeMessage()]);
  const [input, setInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);

  // Synchronize AI Chat Welcome Message when form inputs or language change
  useEffect(() => {
    setMessages(prev => {
      const updated = [...prev];
      updated[0] = getDynamicWelcomeMessage();
      return updated;
    });
  }, [formState.crop, formState.areaHectares, formState.district, formState.state, formState.startMonthIndex, formState.loanTenureYears, lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingChat]);

  // Handle Dynamic Area Change from Map Polygon
  const handleAreaChange = (newHectares) => {
    setFormState(prev => ({ ...prev, areaHectares: newHectares }));
  };

  // Trigger ML Analysis via Backend & Python Service
  const handleAnalyzeLand = async (coords = selectedPos, customArea = formState.areaHectares) => {
    setAnalyzing(true);
    try {
      const token = user?.token || localStorage.getItem('token');
      const areaToUse = parseFloat(customArea) || parseFloat(formState.areaHectares) || 2.5;

      const res = await axios.post(
        `${API_URL}/ai/analyze`,
        {
          state: formState.state,
          district: formState.district,
          crop: formState.crop,
          area_hectares: areaToUse,
          lat: coords[0],
          lon: coords[1],
          loan_tenure_years: parseInt(formState.loanTenureYears),
          start_month_index: parseInt(formState.startMonthIndex),
          current_crop_duration: parseInt(formState.cropDurationMonths)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAnalysisData(res.data);

      const pred = res.data.predictions;
      const totalCombinedRev = pred?.total_1year_combined_revenue_rs || pred?.adjusted_estimated_revenue_rs * 2.2;
      const loanCap = pred?.suggested_loan_limit_rs;

      const summaryMsg = lang === 'en'
        ? `🌾 **You are eligible for a loan amount of ₹${Math.round(loanCap).toLocaleString('en-IN')}**\n\n1. Current ${formState.crop} Income: ₹${pred?.adjusted_estimated_revenue_rs?.toLocaleString('en-IN')}\n2. Total Combined Income (${formState.loanTenureYears} Years): ₹${Math.round(totalCombinedRev).toLocaleString('en-IN')}\n3. Harvest Month: ${MONTHS_LIST[(formState.startMonthIndex + formState.cropDurationMonths) % 12].en}\n\nWould you like assistance with PM Fasal Bima crop insurance or SBI/NABARD KCC loan application?`
        : `🌾 **आप ₹${Math.round(loanCap).toLocaleString('en-IN')} की ऋण राशि के लिए पात्र हैं (You are eligible for loan amount ₹${Math.round(loanCap).toLocaleString('en-IN')})**\n\n1. वर्तमान ${formState.crop} फसल आय: ₹${pred?.adjusted_estimated_revenue_rs?.toLocaleString('en-IN')}\n2. ${formState.loanTenureYears}-वर्षीय कुल संयुक्त आय: ₹${Math.round(totalCombinedRev).toLocaleString('en-IN')}\n3. कटाई का महीना: ${MONTHS_LIST[(formState.startMonthIndex + formState.cropDurationMonths) % 12].hi}\n\nक्या आप पीएम फसल बीमा योजना या स्टेट बैंक/नाबार्ड केसीसी ऋण आवेदन में सहायता चाहते हैं?`;

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

      // Always send verified inputs + calculated loan limits so AI never asks again
      const payloadContext = analysisData || {
        inputs: {
          state: formState.state,
          district: formState.district,
          crop: formState.crop,
          area_hectares: formState.areaHectares,
        },
        predictions: {
          adjusted_estimated_revenue_rs: Math.round(estBaseRev),
          total_1year_combined_revenue_rs: Math.round(estCombinedRev),
          suggested_loan_limit_rs: estSafeLoanCap,
          risk_level: 'Medium'
        },
        one_year_succession_plan: {
          loan_tenure_years: formState.loanTenureYears,
          start_month: MONTHS_LIST[formState.startMonthIndex].en
        }
      };

      const res = await axios.post(
        `${API_URL}/ai/chat`,
        {
          message: userMessage,
          chatId,
          landContext: payloadContext,
          lang: lang
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChatId(res.data.chatId);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
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
      {/* Top Navbar with Language Switcher */}
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

        {/* Language Switcher Toggle */}
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
                lang === 'en' ? 'bg-[#2D6A4F] text-white shadow-sm' : 'text-gray-600 hover:text-black'
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

      {/* Main Single-Page Unified Dashboard View */}
      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Input Details Header */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-[#E8630A]/15 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-lg font-bold text-[#3D2C1E] flex items-center gap-2">
              <span>📝</span> {t.enterDetailsTitle}
            </h3>
            <span className="text-xs text-gray-500">{t.step1}</span>
          </div>

          {/* Simplified 3-Question Agricultural Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t.state}</label>
              <input
                type="text"
                value={formState.state}
                onChange={e => setFormState({ ...formState, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#E8630A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t.district}</label>
              <input
                type="text"
                value={formState.district}
                onChange={e => setFormState({ ...formState, district: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#E8630A] focus:outline-none"
              />
            </div>

            {/* Q1: What Crop? */}
            <div>
              <label className="block text-xs font-bold text-[#E8630A] mb-1">1. कौन सी फसल? (What Crop?)</label>
              <select
                value={formState.crop}
                onChange={e => handleCropChange(e.target.value)}
                className="w-full px-3 py-2 border-2 border-[#E8630A]/40 rounded-xl text-sm font-bold text-[#3D2C1E] focus:border-[#E8630A] focus:outline-none"
              >
                <option value="Wheat">{t.wheat} (4 Months)</option>
                <option value="Rice">{t.rice} (5 Months)</option>
                <option value="Cotton">{t.cotton} (6 Months)</option>
                <option value="Sugarcane">{t.sugarcane} (12 Months)</option>
                <option value="Maize">{t.maize} (3 Months)</option>
              </select>
            </div>

            {/* Q2: When Planted? */}
            <div>
              <label className="block text-xs font-bold text-[#2D6A4F] mb-1">2. बुआई कब की? (When Planted?)</label>
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

            {/* Q3: Loan Till When? */}
            <div>
              <label className="block text-xs font-bold text-[#E8630A] mb-1">3. कितना ऋण? (Loan Tenure)</label>
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

            {/* Auto Calculated Land Area */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {t.areaHectares} <span className="text-[10px] text-[#2D6A4F]">({t.calculatedFromMap})</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={formState.areaHectares}
                onChange={e => setFormState({ ...formState, areaHectares: e.target.value })}
                className="w-full px-3 py-2 border border-[#2D6A4F] bg-green-50/50 rounded-xl text-sm font-bold text-[#2D6A4F] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Interactive Sentinel-2 Map with Dynamic Polygon Area Measurement */}
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
            areaHectares={formState.areaHectares}
            lang={lang}
            t={t}
          />
        </div>

        {/* Step 3: Land & Climate Analysis Card */}
        {analysisData && <LandAnalysisCard analysis={analysisData} t={t} />}

        {/* Step 4: Step-by-Step Mathematical Calculation Breakdown Card */}
        {analysisData && (
          <CalculationBreakdown
            analysisData={analysisData}
            formState={formState}
            t={t}
          />
        )}

        {/* Step 5: Multi-Year Crop Succession & Loan Timeline Report */}
        {analysisData && (
          <FullLandReport
            analysisData={analysisData}
            formState={formState}
            t={t}
          />
        )}

        {/* Step 6: Financial Revenue & Safe Credit Cap Card */}
        {analysisData && (
          <FinancialRevenueCard
            predictions={analysisData.predictions}
            baselineMetrics={analysisData.baseline_metrics}
            t={t}
          />
        )}

        {/* Step 7: PDF Report Button & Crop Rotation Planner */}
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

        <CropRotationPlanner areaHectares={parseFloat(formState.areaHectares) || 2.5} t={t} />

        {/* Step 8: Embedded AI Chat Assistant on Main Dashboard */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#E8630A]/20 h-[520px] flex flex-col overflow-hidden">
          <div className="p-4 bg-[#2D6A4F] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌾</span>
              <h3 className="font-bold text-lg">{t.chatHeader}</h3>
            </div>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">Groq LLaMA 3.3 Engine ({lang.toUpperCase()})</span>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#FFF8F0] to-[#fcf3e8]">
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
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendChat} className="p-3 bg-[#FFF8F0] border-t flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t.chatPlaceholder}
              className="flex-1 px-4 py-3 bg-white border border-[#E8630A]/20 rounded-xl text-sm focus:outline-none focus:border-[#E8630A]"
            />
            <button
              type="submit"
              disabled={loadingChat || !input.trim()}
              className="px-5 bg-[#E8630A] text-white rounded-xl hover:bg-[#d55809] transition flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
