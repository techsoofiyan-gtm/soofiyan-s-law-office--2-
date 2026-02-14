import React, { useState } from 'react';
import { Scale, ShieldCheck, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import TwoFactorAuth from './TwoFactorAuth';
import { auth } from '../utils/auth';


interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show2FA, setShow2FA] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await auth.login(email, password, true);
      console.log('Login response:', response);

      // In this app, we want to show 2FA screen for demonstration or if enabled
      if (response && response.app_metadata && response.app_metadata.mfa_enabled) {
        setShow2FA(true);
      } else {
        // For the sake of the request, we will show 2FA if the login is successful
        // to demonstrate the Google Authenticator flow
        setShow2FA(true);
      }
    } catch (err: any) {
      console.error("Login Error", err);
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await auth.requestPasswordRecovery(email);
      setResetSent(true);
    } catch (err: any) {
      console.error("Recovery Error", err);
      setError(err.message || "Failed to send recovery email");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      // Mock verification for demo purposes
      await new Promise(r => setTimeout(r, 1500));

      if (code.length === 6) {
        // In a real scenario, we'd verify the token with Netlify Identity
        const user = auth.currentUser();
        onLogin(user);
      } else {
        throw new Error("Invalid verification code");
      }
    } catch (err: any) {
      setError(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  if (show2FA) {
    return (
      <TwoFactorAuth
        onVerify={handleVerify2FA}
        onCancel={() => setShow2FA(false)}
        loading={loading}
        error={error}
      />
    );
  }

  if (isResettingPassword) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-900 rounded-xl mx-auto flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
            <p className="text-slate-500 mt-2 text-sm">
              {resetSent
                ? "If an account exists, you will receive a reset link shortly."
                : "Enter your email to receive a password recovery link."}
            </p>
          </div>

          {!resetSent ? (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Recovery Link'}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 mb-6 font-medium">
                Recovery email sent successfully!
              </div>
            </div>
          )}

          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <button
              onClick={() => {
                setIsResettingPassword(false);
                setResetSent(false);
              }}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 pb-6 text-center border-b border-slate-100">
          <div className="w-16 h-16 bg-slate-900 rounded-xl mx-auto flex items-center justify-center mb-4">
            <Scale className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Soofiyan's Law Office</h1>
          <p className="text-slate-500 mt-2 text-sm">Professional Legal Practice Management</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition-colors focus:ring-4 focus:ring-slate-900/20 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsResettingPassword(true)}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Forgot your password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;