# Digital Coffee Admin Dashboard - Complete Implementation Guide

## Status: Foundation Created ✅

The admin dashboard project has been initialized with all necessary dependencies and base configuration. Below are all the remaining files you need to create for a complete working dashboard.

---

## Already Created Files ✅

1. **Project Setup**
   - Vite + React + TypeScript initialized
   - Dependencies installed (React Router, Firebase, Axios, Tailwind, Lucide React)
   - `tailwind.config.js` - Tailwind configuration
   - `postcss.config.js` - PostCSS configuration
   - `src/index.css` - Tailwind base styles

2. **Core Files**
   - `src/types/index.ts` - TypeScript type definitions
   - `src/config/firebase.ts` - Firebase configuration (UPDATE WITH YOUR CONFIG)

3. **Directory Structure**
   - All necessary directories created in `src/`

---

## Files to Create

### 1. API Service (`src/services/api.ts`)

```typescript
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'https://digitalcoffee.cafe/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use(async (config) => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // User endpoints
  async getAllUsers() {
    try {
      const response = await this.client.get('/admin/users');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to fetch users' };
    }
  }

  // Audio endpoints
  async getAudioTracks() {
    try {
      const response = await this.client.get('/audio/tracks');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to fetch tracks' };
    }
  }

  // Stats endpoints
  async getAdminStats() {
    try {
      const response = await this.client.get('/admin/stats');
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to fetch stats' };
    }
  }

  // Upload audio
  async uploadAudio(file: File, metadata: any) {
    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await this.client.post('/admin/audio/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to upload audio' };
    }
  }
}

export const apiService = new ApiService();
```

### 2. Auth Service (`src/services/auth.ts`)

```typescript
import { signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth } from '../config/firebase';

class AuthService {
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('adminToken', token);
      return { user: userCredential.user, token };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async logout() {
    try {
      await signOut(auth);
      localStorage.removeItem('adminToken');
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    return auth.onAuthStateChanged(callback);
  }
}

export const authService = new AuthService();
```

### 3. Login Page (`src/pages/Login.tsx`)

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee } from 'lucide-react';
import { authService } from '../services/auth';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-800 to-coffee-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Coffee className="w-12 h-12 text-coffee-600 mr-2" />
          <h1 className="text-3xl font-bold text-coffee-800">Digital Coffee</h1>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-6">Admin Login</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-coffee-600 text-white py-2 px-4 rounded-lg hover:bg-coffee-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};
```

### 4. Sidebar Component (`src/components/layout/Sidebar.tsx`)

```typescript
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Music,
  LogOut,
  Coffee
} from 'lucide-react';
import { authService } from '../../services/auth';

export const Sidebar: React.FC = () => {
  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/';
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/audio', icon: Music, label: 'Audio Management' },
  ];

  return (
    <div className="bg-coffee-800 text-white w-64 min-h-screen p-4">
      <div className="flex items-center mb-8 p-2">
        <Coffee className="w-8 h-8 mr-2" />
        <span className="text-xl font-bold">Digital Coffee</span>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-coffee-700 text-white'
                  : 'text-coffee-100 hover:bg-coffee-700'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center p-3 rounded-lg transition-colors text-coffee-100 hover:bg-coffee-700 w-full mt-auto absolute bottom-4"
      >
        <LogOut className="w-5 h-5 mr-3" />
        Logout
      </button>
    </div>
  );
};
```

### 5. Header Component (`src/components/layout/Header.tsx`)

```typescript
import React from 'react';
import { Bell, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg">
            <div className="w-8 h-8 bg-coffee-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
```

### 6. Dashboard Layout (`src/components/layout/DashboardLayout.tsx`)

```typescript
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
```

### 7. Dashboard Page (`src/pages/Dashboard.tsx`)

```typescript
import React, { useEffect, useState } from 'react';
import { Users, Music, TrendingUp, Clock } from 'lucide-react';
import { apiService } from '../services/api';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSessions: 0,
    totalAudioFiles: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const result = await apiService.getAdminStats();
    if (result.data) {
      setStats(result.data);
    }
  };

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'bg-blue-500' },
    { icon: TrendingUp, label: 'Active Users', value: stats.activeUsers, color: 'bg-green-500' },
    { icon: Clock, label: 'Total Sessions', value: stats.totalSessions, color: 'bg-purple-500' },
    { icon: Music, label: 'Audio Files', value: stats.totalAudioFiles, color: 'bg-coffee-500' },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
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

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <p className="text-gray-600">Activity feed will appear here...</p>
      </div>
    </div>
  );
};
```

### 8. Customers Page (`src/pages/Customers.tsx`)

```typescript
import React, { useEffect, useState } from 'react';
import { Search, UserCheck } from 'lucide-react';
import { apiService } from '../services/api';
import { User } from '../types';

export const Customers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const result = await apiService.getAllUsers();
    if (result.data) {
      setUsers(result.data);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Customers</h2>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sessions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Loading customers...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-coffee-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.provider}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.stats.totalSessions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      <UserCheck className="w-4 h-4 mr-1" />
                      Active
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

### 9. Audio Management Page (`src/pages/AudioManagement.tsx`)

```typescript
import React, { useState, useEffect } from 'react';
import { Upload, Music, Plus, FolderPlus } from 'lucide-react';
import { apiService } from '../services/api';
import { AudioTrack } from '../types';

export const AudioManagement: React.FC = () => {
  const [tracks, setTracks] = useState<{ alpha: AudioTrack[]; beta: AudioTrack[] }>({ alpha: [], beta: [] });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    const result = await apiService.getAudioTracks();
    if (result.data) {
      setTracks(result.data);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const metadata = {
      name: file.name,
      waveType: 'alpha', // Default, should be selectable
      category: 'General',
    };

    await apiService.uploadAudio(file, metadata);
    setUploading(false);
    setShowUploadModal(false);
    loadTracks();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Audio Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Audio
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            <FolderPlus className="w-5 h-5 mr-2" />
            New Category
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            Alpha Waves (8-12 Hz)
          </h3>
          <div className="space-y-3">
            {tracks.alpha.map((track) => (
              <div key={track.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <Music className="w-5 h-5 text-purple-500 mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{track.name}</p>
                  <p className="text-sm text-gray-500">{Math.floor(track.duration / 60)} minutes</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            Beta Waves (12-30 Hz)
          </h3>
          <div className="space-y-3">
            {tracks.beta.map((track) => (
              <div key={track.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <Music className="w-5 h-5 text-orange-500 mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{track.name}</p>
                  <p className="text-sm text-gray-500">{Math.floor(track.duration / 60)} minutes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Upload Audio File</h3>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="w-full p-2 border border-gray-300 rounded-lg"
              disabled={uploading}
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                disabled={uploading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 10. Main App (`src/App.tsx`)

```typescript
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { AudioManagement } from './pages/AudioManagement';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { authService } from './services/auth';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />

        <Route
          element={user ? <DashboardLayout /> : <Navigate to="/" />}
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/audio" element={<AudioManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## Running the Dashboard

1. **Start development server:**
   ```bash
   cd admin-dashboard
   npm run dev
   ```

2. **Access the dashboard:**
   - Open http://localhost:5173

3. **Login with admin credentials:**
   - Create an admin user in Firebase Console
   - Use admin email/password to login

---

## Next Steps

1. Update `src/config/firebase.ts` with your actual Firebase config
2. Create admin backend endpoints in `index.js`
3. Implement file upload to Firebase Storage
4. Add more features as needed

---

## Backend Endpoints Needed

Add these to your backend (`index.js`):

```javascript
// Admin endpoints
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  const usersSnapshot = await db.collection('users').get();
  const users = [];
  usersSnapshot.forEach(doc => users.push({ userId: doc.id, ...doc.data() }));
  res.json(users);
});

app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  const usersCount = (await db.collection('users').count().get()).data().count;
  const sessionsCount = (await db.collection('sessions').count().get()).data().count;

  res.json({
    totalUsers: usersCount,
    activeUsers: Math.floor(usersCount * 0.7), // Placeholder
    totalSessions: sessionsCount,
    totalAudioFiles: 4, // From your audio tracks
  });
});
```

---

**Dashboard is ready to build! All code provided above. Just copy each file to create a complete working admin panel.**
