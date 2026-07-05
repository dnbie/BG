import { useState } from 'react';
import { Eye, EyeOff, Dumbbell, ShieldCheck, User, ArrowRight, AlertCircle } from 'lucide-react';
import type { Role } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fillDemo = (r: Role) => {
    setRole(r);
    setEmail(r === 'admin' ? 'admin@t2t.com' : 'client@t2t.com');
    setPassword(r === 'admin' ? 'admin123' : 'client123');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password, role);
      setLoading(false);
      if (result.ok) {
        navigate(role === 'admin' ? '/admin' : '/');
      } else {
        setError(result.error ?? 'Login failed.');
      }
    }, 600);
  };

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">🏋️</div>
          <div>
            <div className="login-brand-name">Train to Transform</div>
            <div className="login-brand-tag">Elite Performance Tracking</div>
          </div>
        </div>

        <div className="login-hero-text">
          <h1>Every Rep.<br />Every Set.<br /><span>Every Result.</span></h1>
          <p>Track your training, nutrition, sleep, and body transformation all in one professional platform built for serious athletes and coaches.</p>
        </div>

        <div className="login-features">
          {['Real-time performance graphs', 'Strength PR tracking', 'Nutrition & sleep analytics', 'Progress photo timeline', 'Admin coaching dashboard'].map(f => (
            <div key={f} className="login-feature-item">
              <div className="login-feature-dot" />
              {f}
            </div>
          ))}
        </div>

        <div className="login-left-footer">
          <div className="login-stat"><span>500+</span> Athletes</div>
          <div className="login-stat-div" />
          <div className="login-stat"><span>50+</span> Coaches</div>
          <div className="login-stat-div" />
          <div className="login-stat"><span>98%</span> Satisfaction</div>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          {/* Role selector */}
          <div className="role-selector">
            <button
              className={`role-btn ${role === 'client' ? 'active' : ''}`}
              onClick={() => { setRole('client'); setError(''); }}
              type="button"
            >
              <User size={16} />
              Client
            </button>
            <button
              className={`role-btn ${role === 'admin' ? 'active' : ''}`}
              onClick={() => { setRole('admin'); setError(''); }}
              type="button"
            >
              <ShieldCheck size={16} />
              Admin / Coach
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="input"
                type="email"
                placeholder={role === 'admin' ? 'admin@t2t.com' : 'client@t2t.com'}
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="pw-wrap">
                <input
                  className="input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <button className={`btn btn-primary w-full login-submit ${loading ? 'loading' : ''}`} type="submit" disabled={loading}>
              {loading ? <span className="login-spinner" /> : <><ArrowRight size={16} /> Sign In</>}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="demo-creds">
            <div className="demo-label">Demo Accounts</div>
            <div className="demo-btns">
              <button className="demo-btn" type="button" onClick={() => fillDemo('client')}>
                <User size={13} /> Client Login
              </button>
              <button className="demo-btn demo-btn-admin" type="button" onClick={() => fillDemo('admin')}>
                <ShieldCheck size={13} /> Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
