import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, Key } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('alex@taskflow.io');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [particles, setParticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Generate particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 20,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 15 + 15,
      color: ['rgba(108,92,231,0.4)', 'rgba(162,155,254,0.3)', 'rgba(232,67,147,0.3)', 'rgba(0,184,148,0.3)'][i % 4]
    }));
    setParticles(newParticles);
    
    // Auth redirect if already logged in
    if (api.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { token, user } = await api.login(email, password);
      api.setToken(token);
      api.setUser(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-gradient"></div>
      <div className="login-particles">
        {particles.map(p => (
          <div 
            key={p.id}
            className="login-particle" 
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}
      </div>

      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="login-logo">
          <div className="login-logo-icon">
            <Zap size={32} fill="currentColor" />
          </div>
          <h1>TaskFlow Pro</h1>
          <p>Modern Project Management Platform</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <AnimatePresence>
            {error && (
              <motion.div 
                className="login-error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="form-group">
            <label className="form-label" htmlFor="loginEmail">Email Address</label>
            <input 
              className="form-input" 
              id="loginEmail" 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email" 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="loginPassword">Password</label>
            <input 
              className="form-input" 
              id="loginPassword" 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password" 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg btn-block" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-sm">
                <Loader2 className="animate-spin" size={20} />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="demo-credentials">
          <p><Key size={14} className="inline mr-xs" /> <strong>Demo:</strong> alex@taskflow.io / password123</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
