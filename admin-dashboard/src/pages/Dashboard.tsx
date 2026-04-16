import React, { useState, useEffect } from 'react';
import {
  Users,
  Music,
  TrendingUp,
  Clock,
  Crown,
  Activity,
  Zap,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../services/api';
import { StatsCard } from '../components/common/StatsCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  sessionsToday: number;
  totalListeningTime: number;
  avgSessionTime: number;
  premiumUsers: number;
  freeUsers: number;
  totalTracks: number;
  alphaTracks: number;
  betaTracks: number;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch comprehensive stats from backend
      const statsResponse = await apiService.getAdminStats();

      if (statsResponse.error) {
        setError(statsResponse.error);
        return;
      }

      setStats(statsResponse.data);
    } catch (err: any) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format time in hours and minutes
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Error loading dashboard</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Data for charts
  const waveTypeData = [
    { name: 'Alpha Waves', value: stats.alphaTracks, color: '#8B5CF6' },
    { name: 'Beta Waves', value: stats.betaTracks, color: '#06B6D4' },
  ];

  const userTypeData = [
    { name: 'Premium Users', value: stats.premiumUsers, color: '#F59E0B' },
    { name: 'Free Users', value: stats.freeUsers, color: '#6B7280' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your app.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          subtitle={`${stats.activeUsers} active`}
          colorClass="bg-blue-500"
        />
        <StatsCard
          title="Premium Users"
          value={stats.premiumUsers.toLocaleString()}
          icon={Crown}
          subtitle={`${Math.round((stats.premiumUsers / stats.totalUsers) * 100)}% of users`}
          colorClass="bg-amber-500"
        />
        <StatsCard
          title="Total Sessions"
          value={stats.totalSessions.toLocaleString()}
          icon={Activity}
          subtitle={`${stats.sessionsToday} today`}
          colorClass="bg-purple-500"
        />
        <StatsCard
          title="Audio Tracks"
          value={stats.totalTracks.toLocaleString()}
          icon={Music}
          subtitle={`${stats.alphaTracks} alpha, ${stats.betaTracks} beta`}
          colorClass="bg-cyan-500"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Listening Time"
          value={formatTime(stats.totalListeningTime)}
          icon={Clock}
          subtitle="All users combined"
          colorClass="bg-green-500"
        />
        <StatsCard
          title="Avg Session Time"
          value={formatTime(stats.avgSessionTime)}
          icon={Zap}
          subtitle="Per session"
          colorClass="bg-indigo-500"
        />
        <StatsCard
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          icon={TrendingUp}
          subtitle={`${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total`}
          colorClass="bg-emerald-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wave Type Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Track Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={waveTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {waveTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* User Type Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Subscriptions</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={userTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real-time indicator */}
      <div className="flex items-center justify-center text-sm text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
        <span>Live data from API</span>
      </div>
    </div>
  );
};
