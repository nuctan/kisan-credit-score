import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CONTENT = {
  hi: {
    logo: 'किसानAI',
    login: 'लॉग इन करें',
    start: 'शुरू करें',
    headline: 'किसान साथी — AI से फसल मूल्यांकन',
    subheading: 'आपकी फसल का सही मूल्य जानें और आसानी से कृषि ऋण प्राप्त करें। हम तकनीक के माध्यम से किसानों की प्रगति सुनिश्चित करते हैं।',
    getStarted: 'शुरू करें (Get Started)',
    features: [
      { icon: '🛰️', title: 'सैटेलाइट फसल जाँच', desc: 'अंतरिक्ष उपग्रह (Sentinel-2) से आपके खेत की फसल का स्वास्थ्य जाँचें — बिना खेत जाए।' },
      { icon: '💰', title: 'ऋण सहायता', desc: 'AI से सुरक्षित कृषि लोन की सटीक गणना, 60% सेफ क्रेडिट कैप के साथ।' },
      { icon: '🤖', title: 'AI चैटबॉट', desc: 'पीएम-किसान, केसीसी, फसल बीमा — किसी भी सरकारी योजना के बारे में तुरंत जानकारी।' },
    ],
    footer: 'किसानAI — भारतीय किसानों के लिए',
    copyright: '© 2026 KishiAI. All rights reserved.',
  },
  en: {
    logo: 'KisanAI',
    login: 'Login',
    start: 'Get Started',
    headline: "Farmer's Companion — AI Crop Assessment",
    subheading: 'Get the true value of your crop and easily obtain agricultural loans. We use technology to ensure farmer prosperity.',
    getStarted: 'Get Started',
    features: [
      { icon: '🛰️', title: 'Satellite Crop Health Check', desc: 'Use Sentinel-2 space satellite to check your farm crop health — without visiting the field.' },
      { icon: '💰', title: 'Loan Support', desc: 'AI-powered accurate agricultural loan calculation with a safe 60% credit cap.' },
      { icon: '🤖', title: 'AI Chatbot', desc: 'PM-Kisan, KCC, Crop Insurance — get instant answers about any government scheme.' },
    ],
    footer: 'KisanAI — For Indian Farmers',
    copyright: '© 2026 KishiAI. All rights reserved.',
  }
};

const LandingPage = () => {
  const [lang, setLang] = useState('hi');
  const c = CONTENT[lang];

  return (
    <div className="min-h-screen bg-bg-light text-text-main flex flex-col font-sans">
      <header className="p-6 flex justify-between items-center bg-white shadow-sm">
        <div className="text-3xl font-bold text-secondary">
          {lang === 'hi' ? 'किसान' : 'Kisan'}<span className="text-primary">AI</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-secondary text-secondary font-bold text-sm hover:bg-secondary hover:text-white transition-all"
          >
            🌐 {lang === 'hi' ? 'English' : 'हिंदी'}
          </button>
          <Link to="/login" className="px-5 py-2 font-semibold text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
            {c.login}
          </Link>
          <Link to="/register" className="px-5 py-2 font-semibold text-white bg-primary rounded-lg hover:bg-orange-700 transition-colors">
            {c.start}
          </Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          key={lang}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-secondary mb-6 leading-tight">
            {lang === 'hi'
              ? <>किसान साथी — <span className="text-primary">AI से फसल मूल्यांकन</span></>
              : <>Farmer's Companion — <span className="text-primary">AI Crop Assessment</span></>
            }
          </h1>
          <p className="text-xl md:text-2xl text-text-main mb-10">
            {c.subheading}
          </p>
          <div className="flex justify-center gap-6">
            <Link to="/register" className="px-8 py-4 text-xl font-bold text-white bg-primary rounded-xl shadow-lg hover:bg-orange-700 hover:shadow-xl transition-all transform hover:-translate-y-1">
              {c.getStarted}
            </Link>
          </div>
        </motion.div>

        <motion.div
          key={`features-${lang}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full max-w-6xl"
        >
          {c.features.map((f, i) => (
            <div key={i} className={`bg-white p-8 rounded-2xl shadow-md border-t-4 hover:shadow-lg transition-shadow ${i === 0 ? 'border-primary' : i === 1 ? 'border-secondary' : 'border-accent'}`}>
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="text-2xl font-bold text-secondary mb-3">{f.title}</h3>
              <p className="text-lg text-gray-600">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      <footer className="bg-bg-dark text-white p-8 text-center mt-auto">
        <p className="text-xl text-accent font-semibold mb-2">{c.footer}</p>
        <p className="text-sm opacity-80">{c.copyright}</p>
      </footer>
    </div>
  );
};

export default LandingPage;
