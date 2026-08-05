import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({ 
    fullName: '', 
    phone: '', 
    email: '', 
    password: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('hi');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://kisan-backend-wxsg.onrender.com/api';
      const response = await axios.post(`${API_URL}/auth/register`, {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || err.response?.data?.message || err.message || 
        (lang === 'en' ? 'Registration failed. Please try again.' : 'रजिस्ट्रेशन विफल। कृपया बाद में प्रयास करें।');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex flex-col font-sans">
      <header className="p-6 bg-white shadow-sm flex items-center justify-between">
        <Link to="/" className="text-3xl font-bold inline-block">
          <span className="text-primary">{lang === 'hi' ? 'किसान' : 'Kisan'}</span>
          <span className="text-secondary">AI</span>
        </Link>
        <button
          onClick={() => setLang(l => (l === 'hi' ? 'en' : 'hi'))}
          className="px-4 py-2 border-2 border-secondary text-secondary hover:bg-secondary hover:text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <span>🌐</span> {lang === 'hi' ? 'English' : 'हिंदी'}
        </button>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-secondary"
        >
          <h2 className="text-3xl font-bold text-center text-secondary mb-8">
            {lang === 'en' ? 'Create New Account' : 'नया खाता बनाएं'}
          </h2>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 font-medium text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base font-semibold text-text-main mb-2">
                {lang === 'en' ? 'Full Name' : 'पूरा नाम'}
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-base"
                placeholder={lang === 'en' ? 'Enter full name' : 'अपना पूरा नाम दर्ज करें'}
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-main mb-2">
                {lang === 'en' ? 'Phone Number' : 'फ़ोन नंबर'}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-base"
                placeholder={lang === 'en' ? 'Enter phone number' : 'अपना मोबाइल नंबर दर्ज करें'}
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-main mb-2">
                {lang === 'en' ? 'Email Address' : 'ईमेल'}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-base"
                placeholder={lang === 'en' ? 'Enter email address' : 'अपना ईमेल दर्ज करें'}
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-main mb-2">
                {lang === 'en' ? 'Password' : 'पासवर्ड'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-base"
                placeholder={lang === 'en' ? 'Create a new password' : 'नया पासवर्ड बनाएं'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-2 text-xl font-bold text-white bg-secondary rounded-xl shadow-md hover:bg-green-800 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading 
                ? (lang === 'en' ? 'Please wait...' : 'प्रतीक्षा करें...') 
                : (lang === 'en' ? 'Register Now' : 'रजिस्टर करें')}
            </button>
          </form>

          <div className="mt-8 text-center text-base">
            <span className="text-gray-600">
              {lang === 'en' ? 'Already have an account? ' : 'पहले से खाता है? '}
            </span>
            <Link to="/login" className="text-primary font-bold hover:text-orange-700 transition-colors">
              {lang === 'en' ? 'Sign In' : 'लॉग इन करें'}
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Register;
