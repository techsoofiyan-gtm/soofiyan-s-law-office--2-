import React from 'react';
import { Scale, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
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

        <div className="p-8 flex flex-col items-center space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600 mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Secure Access</h2>
            <p className="text-sm text-slate-500">
              Please sign in to access your dashboard.
            </p>
          </div>

          <button
            onClick={() => {
              console.log('Button clicked in component!');
              onLogin();
            }}
            className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition-colors focus:ring-4 focus:ring-slate-900/20 flex items-center justify-center gap-2 relative z-50"
          >
            Sign In with Netlify Identity
          </button>

          <div className="text-center text-xs text-slate-400 mt-4 max-w-xs mx-auto">
            Secure authentication powered by Netlify Identity.
            <br />
            Supports 2FA with Google Authenticator.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;