import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';

// Eager load critical components
import Login from './components/Login';
import Layout from './components/Layout';

// Lazy load feature modules to improve initial load time
const Dashboard = lazy(() => import('./components/Dashboard'));
const Clients = lazy(() => import('./components/Clients'));
const Cases = lazy(() => import('./components/Cases'));
const Tasks = lazy(() => import('./components/Tasks'));
const Documents = lazy(() => import('./components/Documents'));
const Workplace = lazy(() => import('./components/Workplace'));
const Settings = lazy(() => import('./components/Settings'));

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">Loading workspace...</p>
    </div>
  </div>
);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session simulation
    const session = localStorage.getItem('lexflow_session');
    if (session) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('lexflow_session', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('lexflow_session');
    setIsAuthenticated(false);
  };

  if (loading) return <LoadingFallback />;

  return (
    <DataProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
            />
            
            {/* Protected Routes */}
            <Route path="/" element={isAuthenticated ? <Layout onLogout={handleLogout}><Dashboard /></Layout> : <Navigate to="/login" />} />
            <Route path="/workplace" element={isAuthenticated ? <Layout onLogout={handleLogout}><Workplace /></Layout> : <Navigate to="/login" />} />
            <Route path="/clients" element={isAuthenticated ? <Layout onLogout={handleLogout}><Clients /></Layout> : <Navigate to="/login" />} />
            <Route path="/cases" element={isAuthenticated ? <Layout onLogout={handleLogout}><Cases /></Layout> : <Navigate to="/login" />} />
            <Route path="/tasks" element={isAuthenticated ? <Layout onLogout={handleLogout}><Tasks /></Layout> : <Navigate to="/login" />} />
            <Route path="/documents" element={isAuthenticated ? <Layout onLogout={handleLogout}><Documents /></Layout> : <Navigate to="/login" />} />
            <Route path="/settings" element={isAuthenticated ? <Layout onLogout={handleLogout}><Settings /></Layout> : <Navigate to="/login" />} />
            
            {/* Fallback */}
            <Route path="*" element={isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />} />
          </Routes>
        </Suspense>
      </Router>
    </DataProvider>
  );
};

export default App;