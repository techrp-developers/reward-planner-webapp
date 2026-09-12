// src/modules/auth/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import rpLogo from '../../assets/rplogo_nobg.svg';
import './LoginPage.css';



export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);

  // If already logged in, redirect immediately to target screen or home
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirectPath = location.state?.from?.pathname || '/';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouchedEmail(true);
    setTouchedPassword(true);
    setInfoMsg('');

    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setErrorMsg('Email/phone and password are required');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await login(cleanId, cleanPass);
      // On success, navigate to home screen
      const redirectPath = location.state?.from?.pathname || '/';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Invalid email/phone or password. Please try again.';
      setErrorMsg(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInfoAction = (msg) => {
    setErrorMsg('');
    setInfoMsg(msg);
    setTimeout(() => {
      setInfoMsg('');
    }, 6000);
  };

  return (
    <div className="auth-shell login-shell">
      <div className="auth-card login-card">
        {/* Left Column: Showcase Panel with attached card linear gradient & logo taking half space */}
        <section className="auth-showcase">
          <div className="brand-block">
            <div className="brand-logo-wrap">
              <img src={rpLogo} className="brand-logo" alt="Reward Planners Logo" />
            </div>
            <div className="brand-name">REWARDS PLANNER</div>
          </div>

          <div className="showcase-copy">
            <h1>Hello, Welcome!</h1>
            <p>Access your corporate perks, rewards and benefits</p>
          </div>
        </section>

        {/* Right Column: Clean Auth Panel with soft ambient glassmorphic glow */}
        <section className="auth-panel">
          {/* Subtle Ambient Glow Orbs */}
          <div className="ambient-glow glow-top" aria-hidden="true" />
          <div className="ambient-glow glow-bottom" aria-hidden="true" />

          <div className="panel-intro">
            <h2>Login to continue</h2>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <input
                id="login-email"
                type="text"
                placeholder="Email or Mobile"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errorMsg) setErrorMsg('');
                  if (infoMsg) setInfoMsg('');
                  if (touchedEmail && e.target.value.trim()) setTouchedEmail(false);
                }}
                onBlur={() => setTouchedEmail(true)}
                autoComplete="off"
              />
              {touchedEmail && !identifier.trim() && (
                <small className="error">Valid email or mobile is required</small>
              )}
            </div>

            <div className="form-group">
              <div className="password-box">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                    if (infoMsg) setInfoMsg('');
                    if (touchedPassword && e.target.value.trim()) setTouchedPassword(false);
                  }}
                  onBlur={() => setTouchedPassword(true)}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {touchedPassword && !password.trim() && (
                <small className="error">Password is required</small>
              )}
            </div>

            <div className="options">
              <a
                href="#forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  handleInfoAction('Please contact your administrator to reset your password.');
                }}
              >
                Forgot password?
              </a>
            </div>

            {errorMsg && <p className="error message-text">{errorMsg}</p>}
            {infoMsg && (
              <p
                className="message-text"
                style={{
                  color: '#6d4592',
                  background: 'rgba(234, 73, 136, 0.12)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  marginBottom: '14px',
                }}
              >
                {infoMsg}
              </p>
            )}

            <button type="submit" className="auth-btn" disabled={submitting}>
              {submitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
