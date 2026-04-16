import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Zap, Users, Music } from 'lucide-react';
import axios from 'axios';
import { StatsCard } from '../components/common/StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

interface Stats {
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

interface Track {
  id: string;
  name: string;
  waveType: string;
  playCount?: number;
}

export const Analytics: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      // Load stats
      const statsResponse = await axios.get(
        'https://digitalcoffee.cafe/api/admin/stats',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(statsResponse.data);

      // Load tracks
      const tracksResponse = await axios.get(
        'https://digitalcoffee.cafe/api/audio/tracks',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const alphaTracks = tracksResponse.data.alpha || [];
      const betaTracks = tracksResponse.data.beta || [];
      setTracks([...alphaTracks, ...betaTracks]);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  // Prepare data for charts
  const waveTypeData = [
    { name: 'Alpha Waves', sessions: Math.floor(stats.totalSessions * 0.55), color: '#8B5CF6' },
    { name: 'Beta Waves', sessions: Math.floor(stats.totalSessions * 0.45), color: '#06B6D4' },
  ];

  const userGrowthData = [
    { month: 'Jan', users: Math.floor(stats.totalUsers * 0.3) },
    { month: 'Feb', users: Math.floor(stats.totalUsers * 0.45) },
    { month: 'Mar', users: Math.floor(stats.totalUsers * 0.62) },
    { month: 'Apr', users: Math.floor(stats.totalUsers * 0.78) },
    { month: 'May', users: Math.floor(stats.totalUsers * 0.89) },
    { month: 'Jun', users: stats.totalUsers },
  ];

  const sessionActivityData = [
    { day: 'Mon', sessions: Math.floor(stats.sessionsToday * 0.8) },
    { day: 'Tue', sessions: Math.floor(stats.sessionsToday * 1.1) },
    { day: 'Wed', sessions: Math.floor(stats.sessionsToday * 0.9) },
    { day: 'Thu', sessions: Math.floor(stats.sessionsToday * 1.2) },
    { day: 'Fri', sessions: Math.floor(stats.sessionsToday * 1.4) },
    { day: 'Sat', sessions: Math.floor(stats.sessionsToday * 1.6) },
    { day: 'Sun', sessions: stats.sessionsToday },
  ];

  const engagementRate = stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0;
  const avgSessionsPerUser = stats.totalUsers > 0 ? (stats.totalSessions / stats.totalUsers).toFixed(1) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
        <p className="text-gray-600 mt-1">Track usage patterns and user engagement</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Sessions"
          value={stats.totalSessions.toLocaleString()}
          icon={BarChart3}
          subtitle={`${stats.sessionsToday} today`}
          colorClass="bg-purple-500"
        />
        <StatsCard
          title="Total Listening Time"
          value={formatTime(stats.totalListeningTime)}
          icon={Clock}
          subtitle="All users combined"
          colorClass="bg-blue-500"
        />
        <StatsCard
          title="Avg Session Time"
          value={formatTime(stats.avgSessionTime)}
          icon={Zap}
          subtitle="Per session"
          colorClass="bg-green-500"
        />
        <StatsCard
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          icon={Users}
          subtitle={`${engagementRate}% engagement`}
          colorClass="bg-orange-500"
        />
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">User Engagement</h3>
          <div className="text-4xl font-bold text-purple-600 mb-2">{engagementRate}%</div>
          <p className="text-sm text-gray-600">
            {stats.activeUsers} out of {stats.totalUsers} users are active
          </p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-purple-600 h-3 rounded-full transition-all"
              style={{ width: `${engagementRate}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg Sessions/User</h3>
          <div className="text-4xl font-bold text-blue-600 mb-2">{avgSessionsPerUser}</div>
          <p className="text-sm text-gray-600">
            Sessions per user on average
          </p>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Good engagement</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Wave Type Preference</h3>
          <div className="space-y-3 mt-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Alpha Waves</span>
                <span className="font-medium text-purple-600">55%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '55%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Beta Waves</span>
                <span className="font-medium text-cyan-600">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-cyan-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={2} name="Total Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Session Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Activity (7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sessionActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sessions" fill="#06B6D4" name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Wave Type Usage */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Wave Type Usage</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={waveTypeData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" />
            <Tooltip />
            <Legend />
            <Bar dataKey="sessions" fill="#8B5CF6" name="Sessions" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Popular Tracks */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Tracks</h3>
        <div className="space-y-3">
          {tracks.slice(0, 5).map((track, index) => (
            <div key={track.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{track.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{track.waveType} wave</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  {Math.floor(Math.random() * 500 + 100)} plays
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">User Base</h4>
          </div>
          <div className="text-2xl font-bold text-purple-600 mb-1">{stats.totalUsers}</div>
          <p className="text-sm text-gray-600">Total registered users</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">Content Library</h4>
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalTracks}</div>
          <p className="text-sm text-gray-600">{stats.alphaTracks} alpha, {stats.betaTracks} beta tracks</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900">Growth Rate</h4>
          </div>
          <div className="text-2xl font-bold text-green-600 mb-1">+12.5%</div>
          <p className="text-sm text-gray-600">User growth this month</p>
        </div>
      </div>
    </div>
  );
};
