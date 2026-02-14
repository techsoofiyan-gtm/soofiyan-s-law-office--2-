import React, { useState, useRef, useEffect } from 'react';
import { Smartphone } from 'lucide-react';

interface TwoFactorAuthProps {
    onVerify: (code: string) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
    error?: string | null;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ onVerify, onCancel, loading = false, error = null }) => {
    const [code, setCode] = useState<string[]>(new Array(6).fill(''));
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return;

        const newCode = [...code];
        newCode[index] = element.value;
        setCode(newCode);

        // Focus next input
        if (element.value && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (!code[index] && index > 0) {
                inputs.current[index - 1]?.focus();
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
        if (pastedData.every(char => !isNaN(Number(char)))) {
            const newCode = [...code];
            pastedData.forEach((char, index) => {
                if (index < 6) newCode[index] = char;
            });
            setCode(newCode);
            inputs.current[Math.min(pastedData.length, 5)]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.every(digit => digit !== '')) {
            await onVerify(code.join(''));
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center">
                        <Smartphone className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-2">Security Check</h2>
                <p className="text-slate-500 mb-8">Enter the 6-digit code from your app.</p>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 text-left flex items-start gap-3">
                    <div className="mt-1">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Authenticator App</h3>
                        <p className="text-xs text-blue-600 mt-1">
                            Please open your Google Authenticator app and enter the code for Soofiyan's Law Office.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        6-Digit Code
                    </div>
                    <div className="flex justify-between gap-2 mb-8">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength={1}
                                ref={el => inputs.current[index] = el}
                                value={digit}
                                onChange={e => handleChange(e.target, index)}
                                onKeyDown={e => handleKeyDown(e, index)}
                                onPaste={handlePaste}
                                className="w-full h-12 text-center text-xl font-semibold border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 outline-none transition-all"
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="mb-4 text-red-500 text-sm bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || code.some(d => d === '')}
                        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                    >
                        {loading ? 'Verifying...' : 'Verify Identity'}
                    </button>
                </form>

                <div className="flex justify-between items-center text-sm">
                    <button
                        onClick={onCancel}
                        className="text-slate-500 font-medium hover:text-slate-900 transition-colors"
                    >
                        Back to Login
                    </button>
                    {/* Reset logic would go here if we had it */}
                    {/* <button className="text-red-400 font-medium hover:text-red-500 transition-colors flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Reset 2FA
          </button> */}
                </div>
            </div>
        </div>
    );
};

export default TwoFactorAuth;
