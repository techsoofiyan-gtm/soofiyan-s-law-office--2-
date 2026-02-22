import React from 'react';
import { User, Bell, Calendar, CheckCircle, XCircle, Loader, AlertTriangle, Database, Wifi } from 'lucide-react';
import { useData } from '../context/DataContext';
import { isGCalConfigured } from '../lib/googleCalendar';

const Settings = () => {
    const [activeTab, setActiveTab] = React.useState('profile');
    const {
        gcalConnected, gcalConnecting, gcalError,
        connectGoogleCalendar, disconnectGoogleCalendar,
        supabaseReady,
    } = useData();

    const gcalConfigured = isGCalConfigured();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-500 mt-1">Manage your account preferences and integrations.</p>
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
                            <button
                                onClick={() => setActiveTab('integrations')}
                                className={`px-4 py-3 text-left text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === 'integrations' ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'}`}
                            >
                                <Calendar className="w-4 h-4" /> Integrations
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-4">

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

                    {activeTab === 'integrations' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">

                            {/* ── Supabase Status ── */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                                        <Database className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Supabase Database</h3>
                                        <p className="text-xs text-slate-500">Persistent cloud storage for all your data</p>
                                    </div>
                                    <div className="ml-auto">
                                        {supabaseReady ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                <Wifi className="w-3 h-3" /> Connected
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                <AlertTriangle className="w-3 h-3" /> Not configured
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {!supabaseReady && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                                        <p className="font-medium text-amber-800 mb-2">⚙️ Setup Required</p>
                                        <ol className="text-amber-700 space-y-1 list-decimal list-inside text-xs">
                                            <li>Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline font-medium">supabase.com</a></li>
                                            <li>Run the SQL schema from the implementation plan</li>
                                            <li>Add <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to <code className="bg-amber-100 px-1 rounded">.env.local</code></li>
                                            <li>Restart the dev server</li>
                                        </ol>
                                    </div>
                                )}

                                {supabaseReady && (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700">
                                        ✅ All data (Clients, Cases, Tasks, Documents) is being saved to Supabase cloud database.
                                    </div>
                                )}
                            </div>

                            {/* ── Google Calendar ── */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Google Calendar</h3>
                                        <p className="text-xs text-slate-500">Auto-sync hearings & task deadlines</p>
                                    </div>
                                    <div className="ml-auto">
                                        {gcalConnected ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                <CheckCircle className="w-3 h-3" /> Connected
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                <XCircle className="w-3 h-3" /> Not connected
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* What gets synced */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                    {[
                                        { icon: '⚖️', label: 'Hearing Dates', desc: 'All case next-hearing dates' },
                                        { icon: '📋', label: 'Task Deadlines', desc: 'Task due dates & deadlines' },
                                        { icon: '🔔', label: 'Reminders', desc: '1 day + 1 hour before reminders' },
                                    ].map(item => (
                                        <div key={item.label} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <div className="text-xl mb-1">{item.icon}</div>
                                            <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                {!gcalConfigured && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm mb-4">
                                        <p className="font-medium text-amber-800 mb-2">⚙️ Google Cloud Setup Required</p>
                                        <ol className="text-amber-700 space-y-1 list-decimal list-inside text-xs">
                                            <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="underline font-medium">console.cloud.google.com</a></li>
                                            <li>Enable <strong>Google Calendar API</strong></li>
                                            <li>Create OAuth 2.0 credentials (Web application type)</li>
                                            <li>Add your site URL to authorized origins</li>
                                            <li>Add <code className="bg-amber-100 px-1 rounded">VITE_GOOGLE_CLIENT_ID=your-client-id</code> to <code className="bg-amber-100 px-1 rounded">.env.local</code></li>
                                            <li>Restart the dev server</li>
                                        </ol>
                                    </div>
                                )}

                                {gcalError && (
                                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-700 mb-4 flex items-start gap-2">
                                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                        {gcalError}
                                    </div>
                                )}

                                {gcalConnected ? (
                                    <div className="space-y-3">
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium">✅ Connected to Google Calendar</p>
                                                <p className="mt-0.5">All new hearing dates and task deadlines will automatically appear on your calendar as events with reminders.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={disconnectGoogleCalendar}
                                            className="w-full py-2.5 px-4 rounded-lg border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 transition-colors"
                                        >
                                            Disconnect Google Calendar
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={connectGoogleCalendar}
                                        disabled={gcalConnecting || !gcalConfigured}
                                        className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                                    >
                                        {gcalConnecting ? (
                                            <><Loader className="w-4 h-4 animate-spin" /> Connecting...</>
                                        ) : (
                                            <><Calendar className="w-4 h-4" /> Connect Google Calendar (adv.soofiyan@gmail.com)</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;