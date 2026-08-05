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
      const msg = err.response?.data?.detail || err.response?.data?.error || err.response?.data?.message || err.message || 'रजिस्ट्रेशन विफल। कृपया बाद में प्रयास करें।';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex flex-col font-sans">
      <header className="p-6 bg-white shadow-sm">
        <Link to="/" className="text-3xl font-bold text-secondary inline-block">
          किसान<span className="text-primary">AI</span>
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-secondary"
        >
          <h2 className="text-3xl font-bold text-center text-secondary mb-8">नया खाता बनाएं</h2>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-lg font-semibold text-text-main mb-2">पूरा नाम</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-lg"
                placeholder="अपना पूरा नाम दर्ज करें"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-text-main mb-2">फ़ोन नंबर</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-lg"
                placeholder="अपना मोबाइल नंबर दर्ज करें"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-text-main mb-2">ईमेल</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-lg"
                placeholder="अपना ईमेल दर्ज करें"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-text-main mb-2">पासवर्ड</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-lg"
                placeholder="नया पासवर्ड बनाएं"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-2 text-xl font-bold text-white bg-secondary rounded-xl shadow-md hover:bg-green-800 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'प्रतीक्षा करें...' : 'रजिस्टर करें'}
            </button>
          </form>

          <div className="mt-8 text-center text-lg">
            <span className="text-gray-600">पहले से खाता है? </span>
            <Link to="/login" className="text-primary font-bold hover:text-orange-700 transition-colors">
              लॉग इन करें
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Register;
