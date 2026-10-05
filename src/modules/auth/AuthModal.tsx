// src/modules/auth/AuthModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/ui/Modal';
import { GradientButton } from '../../components/ui/GradientButton';
import { activateAccount, verifyActivationOtp, setPassword } from '../../api/authApi';

// Material UI Icons
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export const AuthModal = () => {
  const {
    authModalOpen,
    authModalView,
    closeAuth,
    setAuthModalView,
    login,
    register,
    handleAcceptTerms,
    termsAccepted,
  } = useAuth();

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPasswordState] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await login(identifier, password);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Invalid credentials. Please check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await register({ name, email: identifier, phone, password });
      setAuthModalView('login');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await activateAccount({ email: identifier });
      setAuthModalView('otp');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Account activation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await verifyActivationOtp({ email: identifier, otp });
      setAuthModalView('setPassword');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await setPassword({ email: identifier, password: newPassword });
      setAuthModalView('login');
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to set password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={authModalOpen}
      onClose={closeAuth}
      showClose={termsAccepted !== false}
      title={
        authModalView === 'terms'
          ? 'Corporate Terms & Privacy Gate'
          : authModalView === 'register'
          ? 'Create Employee Account'
          : authModalView === 'activate'
          ? 'Activate Corporate Account'
          : authModalView === 'otp'
          ? 'Verify Activation OTP'
          : authModalView === 'setPassword'
          ? 'Set New Account Password'
          : 'Sign In to Reward Planners'
      }
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-semibold">
            <ErrorOutlinedIcon sx={{ fontSize: 16 }} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. TERMS GATE */}
        {authModalView === 'terms' && (
          <div className="space-y-4 text-xs">
            <p className="text-gray-600 leading-relaxed">
              To access your corporate benefits, wellness step tracker, and exclusive RP Coins discounts, please accept the Reward Planners terms of service and employee privacy policy.
            </p>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 max-h-40 overflow-y-auto text-[11px] text-gray-500 space-y-2">
              <p>1. Rewards Points are sponsored by your corporate organization and are non-transferable outside the platform.</p>
              <p>2. Fitness and step data are strictly utilized for milestone achievements and coin calculations.</p>
              <p>3. Orders are fulfilled via authorized logistics partners with ExpressBees live tracking.</p>
            </div>
            <GradientButton onClick={handleAcceptTerms} className="w-full py-3 text-xs font-bold">
              I Agree & Continue to Perks
            </GradientButton>
          </div>
        )}

        {/* 2. LOGIN VIEW */}
        {authModalView === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-gray-700 block">Work Email or Phone Number</label>
              <div className="relative">
                <MailOutlinedIcon sx={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@company.com or 10-digit mobile"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="font-bold text-gray-700">Password</label>
                <button
                  type="button"
                  onClick={() => setAuthModalView('activate')}
                  className="text-[#7C3AED] hover:underline font-bold"
                >
                  Activate Account?
                </button>
              </div>
              <div className="relative">
                <LockOutlinedIcon sx={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPasswordState(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                />
              </div>
            </div>

            <GradientButton type="submit" loading={loading} className="w-full py-3 text-xs font-bold mt-2">
              Sign In to Rewards
            </GradientButton>
          </form>
        )}

        {/* 4. ACTIVATE ACCOUNT VIEW */}
        {authModalView === 'activate' && (
          <form onSubmit={handleActivateAccount} className="space-y-3.5 text-xs">
            <p className="text-gray-500">
              Enter your corporate email address to receive an activation OTP.
            </p>
            <input
              type="email"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="name@company.com"
              className="w-full p-2.5 border border-gray-300 rounded-xl text-sm outline-none"
            />
            <GradientButton type="submit" loading={loading} className="w-full py-3 text-xs font-bold">
              Send Activation OTP
            </GradientButton>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setAuthModalView('login')}
                className="font-bold text-gray-500 hover:text-gray-900"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* 5. OTP VIEW */}
        {authModalView === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-3.5 text-xs">
            <p className="text-gray-500">
              We sent a 6-digit activation code to <strong>{identifier}</strong>.
            </p>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit OTP"
              className="w-full p-3 border-2 border-gray-300 rounded-xl text-center text-xl font-mono font-black tracking-widest outline-none focus:border-[#7C3AED]"
            />
            <GradientButton type="submit" loading={loading} className="w-full py-3 text-xs font-bold">
              Verify Code
            </GradientButton>
          </form>
        )}

        {/* 6. SET PASSWORD VIEW */}
        {authModalView === 'setPassword' && (
          <form onSubmit={handleSetNewPassword} className="space-y-3.5 text-xs">
            <p className="text-gray-500">Set a secure password for your account.</p>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full p-2.5 border border-gray-300 rounded-xl text-sm outline-none"
            />
            <GradientButton type="submit" loading={loading} className="w-full py-3 text-xs font-bold">
              Save Password & Login
            </GradientButton>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default AuthModal;
