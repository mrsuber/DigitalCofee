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
