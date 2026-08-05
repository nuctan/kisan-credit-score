import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md border-t-8 border-[#E8630A]">
            <span className="text-5xl">⚠️</span>
            <h2 className="text-2xl font-bold text-[#3D2C1E] mt-4 mb-2">कुछ गलत हो गया (Application Error)</h2>
            <p className="text-sm text-gray-600 mb-6">{this.state.error?.toString() || 'अज्ञात त्रुटि हुई।'}</p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="w-full py-3 px-6 bg-[#2D6A4F] text-white font-bold rounded-xl shadow hover:bg-green-800 transition-colors"
            >
              पुनः प्रयास करें (Reset & Reload)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route wrapper with safe JSON parsing
const ProtectedRoute = ({ children }) => {
  let user = null;
  try {
    const raw = localStorage.getItem('user');
    user = raw && raw !== 'undefined' ? JSON.parse(raw) : null;
  } catch (e) {
    localStorage.removeItem('user');
    user = null;
  }

  if (!user?.token && !user?._id) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-[#FFF8F0] text-[#3D2C1E] font-sans selection:bg-primary/30">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
