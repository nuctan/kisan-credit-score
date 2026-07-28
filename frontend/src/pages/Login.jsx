import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
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
      const API_URL = 'http://localhost:5000/api';
      // Backend expects { email, password } — sends username value in the email field
      // The backend supports login by both email or username via $or query
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: formData.username,
        password: formData.password,
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data)); // backend returns user at root, not response.data.user
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'लॉग इन विफल। कृपया अपने विवरण की जांच करें।');
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
          className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-primary"
        >
          <h2 className="text-3xl font-bold text-center text-secondary mb-8">लॉग इन करें</h2>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-text-main mb-2">उपयोगकर्ता नाम या ईमेल</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-lg"
                placeholder="अपना उपयोगकर्ता नाम दर्ज करें"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-lg"
                placeholder="अपना पासवर्ड दर्ज करें"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-xl font-bold text-white bg-primary rounded-xl shadow-md hover:bg-orange-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'कृपया प्रतीक्षा करें...' : 'लॉग इन करें'}
            </button>
          </form>

          <div className="mt-8 text-center text-lg">
            <span className="text-gray-600">खाता नहीं है? </span>
            <Link to="/register" className="text-secondary font-bold hover:text-primary transition-colors">
              रजिस्टर करें
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Login;
