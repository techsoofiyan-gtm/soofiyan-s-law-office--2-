import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, CheckSquare,
  Calendar, FileText, Bot, Settings, Bell, Search, Menu, MapPin, X, FileEdit
} from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { useData } from '../context/DataContext';

const IconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Users, Briefcase, CheckSquare,
  Calendar, FileText, Bot, Settings, MapPin, FileEdit
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { clients, cases, tasks, documents, supabaseReady } = useData();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsSearchOpen(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleResultClick = (path: string, query: string) => {
    navigate(`${path}?q=${encodeURIComponent(query)}`);
    clearSearch();
  };

  // Filter Results - Memoized for performance
  const filteredResults = useMemo(() => {
    if (!searchQuery) return { clients: [], cases: [], tasks: [], docs: [] };
    const q = searchQuery.toLowerCase();
    return {
      clients: clients.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)),
      cases: cases.filter(c => c.title.toLowerCase().includes(q) || c.caseNumber.toLowerCase().includes(q)),
      tasks: tasks.filter(t => t.title.toLowerCase().includes(q)),
      docs: documents.filter(d => d.name.toLowerCase().includes(q))
    };
  }, [searchQuery, clients, cases, tasks, documents]);

  const hasResults = filteredResults.clients.length > 0 || filteredResults.cases.length > 0 || filteredResults.tasks.length > 0 || filteredResults.docs.length > 0;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <div className="w-8 h-8 bg-amber-500 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-slate-900 font-bold text-lg">S</span>
            </div>
            <span className="text-lg font-bold tracking-tight truncate">Soofiyan's Law Office</span>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = IconMap[item.icon];
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-amber-500 text-slate-900'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                AS
              </div>
              <div>
                <p className="text-sm font-medium text-white">Adv. Soofiyan</p>
                <p className="text-xs text-slate-400">Senior Partner</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-10">
          <button
            className="lg:hidden p-2 text-slate-600"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 max-w-xl mx-4 lg:mx-0 hidden md:block" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search cases, clients, tasks or documents..."
                className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchOpen(true)}
              />
              {searchQuery && (
                <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Search Results Dropdown */}
              {isSearchOpen && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 max-h-[400px] overflow-y-auto">
                  {!hasResults ? (
                    <div className="p-4 text-sm text-slate-500 text-center">No results found for "{searchQuery}"</div>
                  ) : (
                    <div className="py-2">
                      {filteredResults.clients.length > 0 && (
                        <div className="px-2 mb-2">
                          <div className="text-xs font-semibold text-slate-400 uppercase px-2 py-1">Clients</div>
                          {filteredResults.clients.slice(0, 3).map(c => (
                            <button key={c.id} onClick={() => handleResultClick('/clients', c.name)} className="w-full text-left px-2 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                              <Users className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-700 truncate">{c.name}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {filteredResults.cases.length > 0 && (
                        <div className="px-2 mb-2">
                          <div className="text-xs font-semibold text-slate-400 uppercase px-2 py-1">Cases</div>
                          {filteredResults.cases.slice(0, 3).map(c => (
                            <button key={c.id} onClick={() => handleResultClick('/cases', c.title)} className="w-full text-left px-2 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-slate-400" />
                              <div className="min-w-0">
                                <div className="text-sm text-slate-700 truncate">{c.title}</div>
                                <div className="text-xs text-slate-400">{c.caseNumber}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {filteredResults.tasks.length > 0 && (
                        <div className="px-2 mb-2">
                          <div className="text-xs font-semibold text-slate-400 uppercase px-2 py-1">Tasks</div>
                          {filteredResults.tasks.slice(0, 3).map(t => (
                            <button key={t.id} onClick={() => handleResultClick('/tasks', t.title)} className="w-full text-left px-2 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                              <CheckSquare className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-700 truncate">{t.title}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {filteredResults.docs.length > 0 && (
                        <div className="px-2 mb-2">
                          <div className="text-xs font-semibold text-slate-400 uppercase px-2 py-1">Documents</div>
                          {filteredResults.docs.slice(0, 3).map(d => (
                            <button key={d.id} onClick={() => handleResultClick('/documents', d.name)} className="w-full text-left px-2 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-700 truncate">{d.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${supabaseReady ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              <div className={`w-2 h-2 rounded-full ${supabaseReady ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
              {supabaseReady ? 'Supabase Connected' : 'Local Storage Mode'}
            </div>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;