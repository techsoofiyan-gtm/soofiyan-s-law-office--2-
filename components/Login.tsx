import React, { useEffect } from 'react';
import { Scale, LogIn } from 'lucide-react';
import * as netlifyIdentity from 'netlify-identity-widget';

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  useEffect(() => {
    // Initialize Netlify Identity
    netlifyIdentity.init({
      locale: 'en',
      APIUrl: 'https://soofiyan-law-office.netlify.app/.netlify/identity'
    });

    // Handle login event
    netlifyIdentity.on('login', (user) => {
      console.log('Logged in via widget:', user);

      // Strict email restriction
      if (user.email.toLowerCase() !== 'tech.soofiyan@gmail.com') {
        alert("Access restricted. Only authorized personnel can sign in.");
        netlifyIdentity.logout();
        return;
      }

      onLogin(user);
      netlifyIdentity.close();
    });

    // Clean up listeners on unmount
    return () => {
      netlifyIdentity.off('login');
    };
  }, [onLogin]);

  const openWidget = () => {
    netlifyIdentity.open();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
          <div className="w-16 h-16 bg-slate-900 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg">
            <Scale className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Soofiyan's Law Office</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Professional Legal Practice Management</p>
        </div>

        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold text-slate-800">Welcome Back</h2>
            <p className="text-slate-500 text-sm">Please sign in to access your workspace.</p>
          </div>

          <button
            onClick={openWidget}
            className="w-full bg-slate-900 text-white font-semibold py-4 rounded-xl hover:bg-slate-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center justify-center gap-3"
          >
            <LogIn className="w-5 h-5" />
            Sign In with Netlify Identity
          </button>

          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
            <div className="h-px w-8 bg-slate-200"></div>
            <span>Secure Connection</span>
            <div className="h-px w-8 bg-slate-200"></div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Authorized Personnel Only. Strictly Monitored Access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;