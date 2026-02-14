import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';

// Eager load critical components
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
  return (
    <DataProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Direct access to all routes without authentication */}
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/workplace" element={<Layout><Workplace /></Layout>} />
            <Route path="/clients" element={<Layout><Clients /></Layout>} />
            <Route path="/cases" element={<Layout><Cases /></Layout>} />
            <Route path="/tasks" element={<Layout><Tasks /></Layout>} />
            <Route path="/documents" element={<Layout><Documents /></Layout>} />
            <Route path="/settings" element={<Layout><Settings /></Layout>} />

            {/* Fallback to Dashboard */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Router>
    </DataProvider>
  );
};

export default App;