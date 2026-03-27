import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Forecast from './pages/Forecast';
import InventoryHealth from './pages/InventoryHealth';
import Alerts from './pages/Alerts';
import Reorder from './pages/Reorder';
import WhatIf from './pages/WhatIf';
import ModelPerformance from './pages/ModelPerformance';

const PAGE_TITLES = {
  '/': 'Executive Overview',
  '/forecast': 'SKU Forecast',
  '/inventory': 'Inventory Health',
  '/alerts': 'Alert Center',
  '/reorder': 'Reorder Workbench',
  '/what-if': 'What-If Simulator',
  '/models': 'Model Scorecard',
};

function AppContent() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('demandpulse-dark') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('demandpulse-dark', darkMode);
  }, [darkMode]);

  const title = PAGE_TITLES[location.pathname] || 'DemandPulse';

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`main-area ${collapsed ? 'collapsed' : ''}`}>
        <Topbar
          title={title}
          collapsed={collapsed}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(!darkMode)}
        />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/inventory" element={<InventoryHealth />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/reorder" element={<Reorder />} />
          <Route path="/what-if" element={<WhatIf />} />
          <Route path="/models" element={<ModelPerformance />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
