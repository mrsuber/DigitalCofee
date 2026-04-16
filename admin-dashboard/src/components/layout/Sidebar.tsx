import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Music,
  Coffee,
  MessageSquare,
  CreditCard,
  BarChart3,
  Settings
} from 'lucide-react';

export const Sidebar: React.FC = () => (
  <div className="bg-gray-900 text-white w-64 min-h-screen p-4 flex flex-col">
    {/* Logo & Brand */}
    <div className="flex items-center mb-8 p-2">
      <Coffee className="w-8 h-8 mr-2 text-purple-400" />
      <span className="text-xl font-bold">Digital Coffee</span>
    </div>

    {/* Main Navigation */}
    <nav className="space-y-1 flex-1">
      {[
        { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { to: '/users', icon: Users, label: 'Users' },
        { to: '/audio', icon: Music, label: 'Audio Tracks' },
        { to: '/feedback', icon: MessageSquare, label: 'Feedback' },
        { to: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
        { to: '/analytics', icon: BarChart3, label: 'Analytics' },
      ].map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({isActive}) =>
            `flex items-center px-3 py-2.5 rounded-lg transition-colors ${
              isActive
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`
          }
        >
          <item.icon className="w-5 h-5 mr-3" />
          {item.label}
        </NavLink>
      ))}
    </nav>

    {/* Bottom Section */}
    <div className="border-t border-gray-800 pt-4">
      <NavLink
        to="/settings"
        className={({isActive}) =>
          `flex items-center px-3 py-2.5 rounded-lg transition-colors ${
            isActive
              ? 'bg-purple-600 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`
        }
      >
        <Settings className="w-5 h-5 mr-3" />
        Settings
      </NavLink>
    </div>
  </div>
);
