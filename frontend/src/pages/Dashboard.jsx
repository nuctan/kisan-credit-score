import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FarmlandMap from '../components/FarmlandMap';
import LandAnalysisCard from '../components/LandAnalysisCard';
import FinancialRevenueCard from '../components/FinancialRevenueCard';
import PDFReportButton from '../components/PDFReportButton';
import CropRotationPlanner from '../components/CropRotationPlanner';

const API_URL = 'http://localhost:5000/api';

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
  </svg>
);

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: 'नमस्ते! 🙏 मैं किसानAI हूँ। जब आप अपनी जमीन का चयन करते हैं, तो मैं आपकी फसल की अनुमानित आय, IMD मौसम अलर्ट, NDVI स्वास्थ्य और ऋण पात्रता के बारे में आपकी सहायता कर सकता हूँ।'
};

const Dashboard = () => {
  const navigate = useNavigate();

  // User auth state
  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;

  useEffect(() => {
    if (!user || (!user.token && !user._id)) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Form states for Land Selection
  const [formState, setFormState] = useState({
    state: 'Maharashtra',
    district: 'Ahilyanagar',
    crop: 'Wheat',
    areaHectares: 2.5
  });

  const [selectedPos, setSelectedPos] = useState([19.0958, 74.7496]);
  const [analysisData, setAnalysisData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Chat states
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'chat'
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingChat]);

  // Trigger ML Analysis via Backend & Python Service
  const handleAnalyzeLand = async (coords = selectedPos) => {
    setAnalyzing(true);
    try {
      const token = user?.token || localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/ai/analyze`,
        {
          state: formState.state,
          district: formState.district,
          crop: formState.crop,
          area_hectares: parseFloat(formState.areaHectares),
          lat: coords[0],
          lon: coords[1]
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAnalysisData(res.data);

      // Add a summary message into the chat assistant
      const pred = res.data.predictions;
      const weatherText = res.data.ai_scores?.weather?.description || '';
      const summaryMsg = `🌾 **विश्लेषण पूर्ण हुआ!**\n\nआपकी ${formState.areaHectares} हेक्टेयर ${formState.crop} की फसल से अनुमानित आय: ₹${pred?.adjusted_estimated_revenue_rs?.toLocaleString('en-IN')}\n\nमौसम (IMD): ${weatherText}\nअनुशंसित सुरक्षित ऋण सीमा: ₹${pred?.suggested_loan_limit_rs?.toLocaleString('en-IN')}\nजोखिम स्तर: ${pred?.risk_level}.\n\nक्या आप इस पर और चर्चा करना चाहते हैं?`;
      
      setMessages(prev => [...prev, { role: 'assistant', content: summaryMsg }]);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Chat send handler
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!input.trim() || loadingChat) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoadingChat(true);

    try {
      const token = user?.token || localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/ai/chat`,
        {
          message: userMessage,
          chatId,
          landContext: analysisData
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChatId(res.data.chatId);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ संदेश भेजने में त्रुटि हुई।' }]);
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
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#E8630A]/15 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌾</span>
          <div>
            <h1 className="text-2xl font-bold text-[#E8630A]">
              किसान<span className="text-[#2D6A4F]">AI</span>
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">Sentinel-2 व IMD लाइव मौसम ऋण मूल्यांकन</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 bg-[#FFF8F0] p-1.5 rounded-xl border border-[#E8630A]/20">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#E8630A] text-white shadow-sm'
                : 'text-[#3D2C1E] hover:bg-white'
            }`}
          >
            📊 डैशबोर्ड व नक्शा
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-[#E8630A] text-white shadow-sm'
                : 'text-[#3D2C1E] hover:bg-white'
            }`}
          >
            💬 AI सहायक
          </button>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#3D2C1E]">
            <div className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span>{user?.name || 'किसान'}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition cursor-pointer"
          >
            लॉग आउट
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {activeTab === 'dashboard' ? (
          <>
            {/* Step 1: Input Details Header */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-[#E8630A]/15 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-[#3D2C1E] flex items-center gap-2">
                  <span>📝</span> फसल एवं खेत का विवरण दर्ज करें
                </h3>
                <span className="text-xs text-gray-500">चरण 1 / 2</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">राज्य (State)</label>
                  <input
                    type="text"
                    value={formState.state}
                    onChange={e => setFormState({ ...formState, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#E8630A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">जिला (District)</label>
                  <input
                    type="text"
                    value={formState.district}
                    onChange={e => setFormState({ ...formState, district: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#E8630A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">फसल (Crop)</label>
                  <select
                    value={formState.crop}
                    onChange={e => setFormState({ ...formState, crop: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#E8630A] focus:outline-none"
                  >
                    <option value="Wheat">गेहूं (Wheat)</option>
                    <option value="Rice">चावल / धान (Rice)</option>
                    <option value="Cotton">कपास (Cotton)</option>
                    <option value="Sugarcane">गन्ना (Sugarcane)</option>
                    <option value="Maize">मक्का (Maize)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">क्षेत्रफल (हेक्टेयर में)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formState.areaHectares}
                    onChange={e => setFormState({ ...formState, areaHectares: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#E8630A] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Interactive Sentinel-2 Map */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#3D2C1E] flex items-center gap-2">
                  <span>🗺️</span> Sentinel-2 मैप पर खेत चुनें
                </h3>
                {analyzing && (
                  <span className="text-xs font-bold text-[#E8630A] animate-pulse">
                    ⚡ ML इंजन एवं IMD मौसम डेटा विश्लेषण कर रहा है...
                  </span>
                )}
              </div>

              <FarmlandMap
                selectedPos={selectedPos}
                setSelectedPos={setSelectedPos}
                onConfirmSelection={handleAnalyzeLand}
              />
            </div>

            {/* Step 3: Land & Climate Analysis Card */}
            {analysisData && <LandAnalysisCard analysis={analysisData} />}

            {/* Step 4: Revenue Projections & Financial Assessment */}
            {analysisData && (
              <FinancialRevenueCard
                predictions={analysisData.predictions}
                baselineMetrics={analysisData.baseline_metrics}
              />
            )}

            {/* Step 5: Download Official Bank Credit PDF Report Button */}
            {analysisData && (
              <div className="flex justify-center pt-2">
                <PDFReportButton
                  analysisData={analysisData}
                  farmerName={user?.name}
                  formState={formState}
                />
              </div>
            )}

            {/* Step 6: Multi-Season Crop Rotation Planner */}
            <CropRotationPlanner areaHectares={parseFloat(formState.areaHectares) || 2.5} />
          </>
        ) : (
          /* Dedicated AI Chat Assistant Tab */
          <div className="bg-white rounded-2xl shadow-lg border border-[#E8630A]/15 h-[650px] flex flex-col overflow-hidden">
            <div className="p-4 bg-[#2D6A4F] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌾</span>
                <h3 className="font-bold text-lg">किसानAI सहायक चैट</h3>
              </div>
              <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">Groq LLaMA 3.3 Engine</span>
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
                  <span>🌾 AI सोच रहा है...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChat} className="p-3 bg-white border-t flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="फसल, आय या ऋण से जुड़ें सवाल पूछें..."
                className="flex-1 px-4 py-3 bg-[#FFF8F0] border rounded-xl text-sm focus:outline-none focus:border-[#E8630A]"
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
        )}
      </main>
    </div>
  );
};

export default Dashboard;
