#!/bin/bash

# Create Dashboard page
cat > src/pages/Dashboard.tsx << 'DASH'
import React from 'react';
import { Users, Music, TrendingUp, Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const stats = [
    { icon: Users, label: 'Total Users', value: 150, color: 'bg-blue-500' },
    { icon: TrendingUp, label: 'Active Users', value: 95, color: 'bg-green-500' },
    { icon: Clock, label: 'Total Sessions', value: 450, color: 'bg-purple-500' },
    { icon: Music, label: 'Audio Files', value: 4, color: 'bg-coffee-500' },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
DASH

# Create Customers page
cat > src/pages/Customers.tsx << 'CUST'
import React from 'react';
export const Customers: React.FC = () => (
  <div>
    <h2 className="text-3xl font-bold text-gray-800 mb-6">Customers</h2>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Customer list will appear here</p>
    </div>
  </div>
);
CUST

# Create Audio Management page
cat > src/pages/AudioManagement.tsx << 'AUDIO'
import React from 'react';
import { Upload, Music } from 'lucide-react';

export const AudioManagement: React.FC = () => (
  <div>
    <div className="flex justify-between mb-6">
      <h2 className="text-3xl font-bold text-gray-800">Audio Management</h2>
      <button className="flex items-center px-4 py-2 bg-coffee-600 text-white rounded-lg">
        <Upload className="w-5 h-5 mr-2" />Upload Audio
      </button>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Alpha Waves</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Music className="w-5 h-5 text-purple-500 mr-3" />
            <div><p className="font-medium">Morning Creative Flow</p><p className="text-sm text-gray-500">10 min</p></div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Beta Waves</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Music className="w-5 h-5 text-orange-500 mr-3" />
            <div><p className="font-medium">Focus Boost</p><p className="text-sm text-gray-500">20 min</p></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
AUDIO

# Create Sidebar
cat > src/components/layout/Sidebar.tsx << 'SIDE'
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Music, Coffee } from 'lucide-react';

export const Sidebar: React.FC = () => (
  <div className="bg-coffee-800 text-white w-64 min-h-screen p-4">
    <div className="flex items-center mb-8 p-2">
      <Coffee className="w-8 h-8 mr-2" />
      <span className="text-xl font-bold">Digital Coffee</span>
    </div>
    <nav className="space-y-2">
      {[
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/customers', icon: Users, label: 'Customers' },
        { to: '/audio', icon: Music, label: 'Audio' },
      ].map(item => (
        <NavLink key={item.to} to={item.to} className={({isActive}) => 
          `flex items-center p-3 rounded-lg ${isActive ? 'bg-coffee-700' : 'hover:bg-coffee-700'}`
        }>
          <item.icon className="w-5 h-5 mr-3" />{item.label}
        </NavLink>
      ))}
    </nav>
  </div>
);
SIDE

# Create Header
cat > src/components/layout/Header.tsx << 'HEAD'
import React from 'react';
import { Bell, User } from 'lucide-react';

export const Header: React.FC = () => (
  <header className="bg-white shadow-sm border-b px-6 py-4">
    <div className="flex justify-between">
      <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
      <div className="flex items-center space-x-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-full">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="w-8 h-8 bg-coffee-600 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  </header>
);
HEAD

# Create Dashboard Layout
cat > src/components/layout/DashboardLayout.tsx << 'LAYOUT'
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const DashboardLayout: React.FC = () => (
  <div className="flex h-screen bg-gray-50">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto p-6"><Outlet /></main>
    </div>
  </div>
);
LAYOUT

# Create App.tsx
cat > src/App.tsx << 'APP'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { AudioManagement } from './pages/AudioManagement';
import { DashboardLayout } from './components/layout/DashboardLayout';

function App() {
  const isAuthenticated = localStorage.getItem('adminToken');
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/audio" element={<AudioManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
APP

# Update main.tsx
cat > src/main.tsx << 'MAIN'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
MAIN

echo "Files created successfully!"
