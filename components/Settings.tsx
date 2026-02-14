import React, { useState } from 'react';
import { Save, User, Bell } from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [loading, setLoading] = useState(false);

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