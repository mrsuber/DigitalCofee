import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut } from 'lucide-react';
import { authService } from '../../services/auth';

export const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
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
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
