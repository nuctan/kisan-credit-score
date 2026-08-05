import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
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
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: formData.username,
        password: formData.password,
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/dashboard');
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.response?.data?.message || err.message ||
        (lang === 'en' ? 'Login failed. Please check your credentials.' : 'लॉग इन विफल। कृपया अपने विवरण की जांच करें।');
      setError(errMsg);
      console.error('Login error:', err.response?.data || err.message);
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
          className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-primary"
        >
          <h2 className="text-3xl font-bold text-center text-secondary mb-8">
            {lang === 'en' ? 'Sign In' : 'लॉग इन करें'}
          </h2>

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 font-medium text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-base font-semibold text-text-main mb-2">
                {lang === 'en' ? 'Username or Email' : 'उपयोगकर्ता नाम या ईमेल'}
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-base"
                placeholder={lang === 'en' ? 'Enter username or email' : 'अपना उपयोगकर्ता नाम दर्ज करें'}
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-base"
                placeholder={lang === 'en' ? 'Enter password' : 'अपना पासवर्ड दर्ज करें'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-xl font-bold text-white bg-primary rounded-xl shadow-md hover:bg-orange-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading
                ? (lang === 'en' ? 'Please wait...' : 'कृपया प्रतीक्षा करें...')
                : (lang === 'en' ? 'Sign In' : 'लॉग इन करें')}
            </button>
          </form>

          <div className="mt-8 text-center text-base">
            <span className="text-gray-600">
              {lang === 'en' ? "Don't have an account? " : 'खाता नहीं है? '}
            </span>
            <Link to="/register" className="text-secondary font-bold hover:text-primary transition-colors">
              {lang === 'en' ? 'Register Now' : 'रजिस्टर करें'}
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Login;
