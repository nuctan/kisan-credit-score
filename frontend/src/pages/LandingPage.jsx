import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-bg-light text-text-main flex flex-col font-sans">
      <header className="p-6 flex justify-between items-center bg-white shadow-sm">
        <div className="text-3xl font-bold text-secondary">
          किसान<span className="text-primary">AI</span>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="px-5 py-2 font-semibold text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
            लॉग इन करें
          </Link>
          <Link to="/register" className="px-5 py-2 font-semibold text-white bg-primary rounded-lg hover:bg-orange-700 transition-colors">
            शुरू करें
          </Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-secondary mb-6 leading-tight">
            किसान साथी — <span className="text-primary">AI से फसल मूल्यांकन</span>
          </h1>
          <p className="text-xl md:text-2xl text-text-main mb-10">
            आपकी फसल का सही मूल्य जानें और आसानी से कृषि ऋण प्राप्त करें। हम तकनीक के माध्यम से किसानों की प्रगति सुनिश्चित करते हैं।
          </p>
          <div className="flex justify-center gap-6">
            <Link to="/register" className="px-8 py-4 text-xl font-bold text-white bg-primary rounded-xl shadow-lg hover:bg-orange-700 hover:shadow-xl transition-all transform hover:-translate-y-1">
              शुरू करें (Get Started)
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full max-w-6xl"
        >
          <div className="bg-white p-8 rounded-2xl shadow-md border-t-4 border-primary hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">🌾</div>
            <h3 className="text-2xl font-bold text-secondary mb-3">फसल मूल्यांकन</h3>
            <p className="text-lg">AI की मदद से अपनी फसल का सटीक मूल्य जानें और सही दाम पाएं।</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-md border-t-4 border-secondary hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-secondary mb-3">ऋण सहायता</h3>
            <p className="text-lg">आसानी से कृषि लोन के लिए आवेदन करें, बिना किसी परेशानी के।</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md border-t-4 border-accent hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-2xl font-bold text-secondary mb-3">AI चैटबॉट</h3>
            <p className="text-lg">खेती से जुड़े किसी भी सवाल का तुरंत जवाब पाएं हमारे स्मार्ट असिस्टेंट से।</p>
          </div>
        </motion.div>
      </main>

      <footer className="bg-bg-dark text-white p-8 text-center mt-auto">
        <p className="text-xl text-accent font-semibold mb-2">किसानAI — भारतीय किसानों के लिए</p>
        <p className="text-sm opacity-80">&copy; 2026 KrishiAI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
