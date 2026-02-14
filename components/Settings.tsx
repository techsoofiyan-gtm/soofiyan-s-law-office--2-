import React, { useState } from 'react';
import { Save, Lock, User, Bell, Shield, Key } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('security');

  // Password Form State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwords.new !== passwords.confirm) {
        setMessage({ type: 'error', text: 'New passwords do not match.' });
        return;
    }
    if (passwords.new.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
        return;
    }
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        setLoading(false);
        setMessage({ type: 'success', text: 'Password updated successfully.' });
        setPasswords({ current: '', new: '', confirm: '' });
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
                <nav className="flex flex-col">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 py-3 text-left text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
                    >
                        <User className="w-4 h-4" /> Profile
                    </button>
                    <button 
                         onClick={() => setActiveTab('security')}
                         className={`px-4 py-3 text-left text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
                    >
                        <Shield className="w-4 h-4" /> Security
                    </button>
                    <button 
                         onClick={() => setActiveTab('notifications')}
                         className={`px-4 py-3 text-left text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === 'notifications' ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
                    >
                        <Bell className="w-4 h-4" /> Notifications
                    </button>
                </nav>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
            {activeTab === 'security' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Key className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Password & Security</h2>
                            <p className="text-xs text-slate-500">Manage your password and sign-in options</p>
                        </div>
                    </div>
                    
                    {message && (
                        <div className={`p-3 rounded-lg text-sm mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                            <input 
                                type="password" 
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                value={passwords.current}
                                onChange={e => setPasswords({...passwords, current: e.target.value})}
                                placeholder="Enter current password"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                            <input 
                                type="password" 
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                value={passwords.new}
                                onChange={e => setPasswords({...passwords, new: e.target.value})}
                                placeholder="Min. 6 characters"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                            <input 
                                type="password" 
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                value={passwords.confirm}
                                onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                placeholder="Re-enter new password"
                            />
                        </div>
                        
                        <div className="pt-4 border-t border-slate-100 mt-6">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <>Processing...</>
                                ) : (
                                    <><Save className="w-4 h-4" /> Update Password</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {activeTab === 'profile' && (
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <User className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">Profile Settings</h3>
                    <p className="text-slate-500 text-sm mt-1">User profile management options will appear here.</p>
                 </div>
            )}
             {activeTab === 'notifications' && (
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Bell className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">Notification Preferences</h3>
                    <p className="text-slate-500 text-sm mt-1">Email and alert settings will appear here.</p>
                 </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Settings;