import React, { useEffect } from 'react';
import { Scale, LogIn } from 'lucide-react';
import * as netlifyIdentity from 'netlify-identity-widget';

interface LoginProps {
    onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    useEffect(() => {
        // Initialize Netlify Identity with the correct API URL
        netlifyIdentity.init({
            locale: 'en',
            APIUrl: 'https://offfice.netlify.app/.netlify/identity'
        });

        // Handle login event
        netlifyIdentity.on('login', (user) => {
            console.log('Logged in via widget:', user);

            // Strict email restriction to the single authorized email
            if (user.email.toLowerCase() !== 'tech.soofiyan@gmail.com') {
                alert("Access restricted. Only tech.soofiyan@gmail.com can sign in.");
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

    const handleLoginClick = () => {
        netlifyIdentity.open();
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background patterns */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]"></div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/20 p-8 relative z-10">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <Scale className="w-10 h-10 text-slate-900" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Soofiyan's Law Office</h2>
                    <p className="text-slate-400 mt-2 font-medium">Professional Practice Management</p>
                </div>

                <div className="space-y-6">
                    <button
                        onClick={handleLoginClick}
                        className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-100 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 shadow-xl"
                    >
                        <LogIn className="w-5 h-5" />
                        Sign In with Google
                    </button>

                    <div className="flex items-center gap-4 py-2">
                        <div className="h-[1px] flex-1 bg-white/10"></div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Secure Connection</span>
                        <div className="h-[1px] flex-1 bg-white/10"></div>
                    </div>

                    <p className="text-center text-xs text-slate-500 font-medium">
                        Authorized Personnel Only. Strictly Monitored Access.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
