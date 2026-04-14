import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  alphaSessions: number;
  betaSessions: number;
  currentStreak: number;
  longestStreak: number;
}

interface UserSubscription {
  tier: 'free' | 'premium' | 'elite' | 'lifetime';
  status: string;
}

interface User {
  userId: string;
  email: string;
  name: string;
  emailVerified: boolean;
  disabled: boolean;
  createdAt: string;
  lastLogin: string;
  stats: UserStats;
  subscription: UserSubscription;
  isAdmin: boolean;
}

interface UserDetailModal {
  userId: string;
  email: string;
  name: string;
  emailVerified: boolean;
  disabled: boolean;
  createdAt: string;
  lastLogin: string;
  stats: UserStats;
  subscription: UserSubscription;
  isAdmin: boolean;
  recentSessions: any[];
}

export const Customers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [selectedUser, setSelectedUser] = useState<UserDetailModal | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [searchQuery, tierFilter, activityFilter, currentPage, pageSize]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const offset = (currentPage - 1) * pageSize;

      const response = await axios.get('https://digitalcoffee.cafe/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: searchQuery || undefined,
          tier: tierFilter !== 'all' ? tierFilter : undefined,
          limit: pageSize,
          offset
        }
      });

      let filteredUsers = response.data.users || [];

      // Apply activity filter (client-side)
      if (activityFilter !== 'all') {
        const now = new Date();
        filteredUsers = filteredUsers.filter((user: User) => {
          if (!user.lastLogin) return false;
          const lastLoginDate = new Date(user.lastLogin);
          const daysDiff = (now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24);

          switch (activityFilter) {
            case '7days':
              return daysDiff <= 7;
            case '30days':
              return daysDiff <= 30;
            case '90days':
              return daysDiff <= 90;
            default:
              return true;
          }
        });
      }

      setUsers(filteredUsers);
      setTotalUsers(response.data.pagination?.total || filteredUsers.length);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load users:', error);
      setLoading(false);
    }
  };

  const viewUserDetails = async (userId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`https://digitalcoffee.cafe/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedUser(response.data);
      setShowUserModal(true);
    } catch (error) {
      console.error('Failed to load user details:', error);
      alert('Failed to load user details');
    }
  };

  const grantPremium = async (userId: string, tier: string) => {
    if (!confirm(`Grant ${tier} access to this user?`)) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('authToken');
      await axios.post(
        `https://digitalcoffee.cafe/api/admin/users/${userId}/grant-premium`,
        { tier },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`${tier} access granted successfully!`);
      loadUsers();
      if (showUserModal && selectedUser?.userId === userId) {
        viewUserDetails(userId);
      }
    } catch (error: any) {
      console.error('Failed to grant premium:', error);
      alert(error.response?.data?.error || 'Failed to grant premium access');
    } finally {
      setActionLoading(false);
    }
  };

  const banUser = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user?')) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('authToken');
      await axios.post(
        `https://digitalcoffee.cafe/api/admin/users/${userId}/ban`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('User banned successfully');
      loadUsers();
      setShowUserModal(false);
    } catch (error: any) {
      console.error('Failed to ban user:', error);
      alert(error.response?.data?.error || 'Failed to ban user');
    } finally {
      setActionLoading(false);
    }
  };

  const unbanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to unban this user?')) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('authToken');
      await axios.post(
        `https://digitalcoffee.cafe/api/admin/users/${userId}/unban`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('User unbanned successfully');
      loadUsers();
      if (showUserModal && selectedUser?.userId === userId) {
        viewUserDetails(userId);
      }
    } catch (error: any) {
      console.error('Failed to unban user:', error);
      alert(error.response?.data?.error || 'Failed to unban user');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    const confirmText = prompt('Type "DELETE" to confirm user deletion:');
    if (confirmText !== 'DELETE') return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('authToken');
      await axios.delete(`https://digitalcoffee.cafe/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User deleted successfully');
      loadUsers();
      setShowUserModal(false);
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      alert(error.response?.data?.error || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'elite':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'lifetime':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 100) return 'text-purple-600 font-bold';
    if (streak >= 30) return 'text-yellow-600 font-semibold';
    if (streak >= 7) return 'text-green-600 font-medium';
    return 'text-gray-600';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Users (Customers)</h1>
        <p className="text-gray-600 mt-1">Manage your user base and subscriptions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tier Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subscription Tier
            </label>
            <select
              value={tierFilter}
              onChange={(e) => {
                setTierFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tiers</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="elite">Elite</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </div>

          {/* Activity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Active
            </label>
            <select
              value={activityFilter}
              onChange={(e) => {
                setActivityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
            </select>
          </div>

          {/* Page Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Show per page
            </label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Free Users</div>
          <div className="text-2xl font-bold text-gray-500">
            {users.filter(u => u.subscription.tier === 'free').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Premium</div>
          <div className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.subscription.tier === 'premium').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Elite</div>
          <div className="text-2xl font-bold text-yellow-600">
            {users.filter(u => u.subscription.tier === 'elite').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Lifetime</div>
          <div className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.subscription.tier === 'lifetime').length}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Streak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {user.name}
                            {user.isAdmin && (
                              <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-800 border border-red-200 rounded">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getTierBadgeColor(
                          user.subscription.tier
                        )}`}
                      >
                        {user.subscription.tier.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.stats.totalSessions} sessions
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.stats.totalMinutes} min
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${getStreakColor(user.stats.currentStreak)}`}>
                        🔥 {user.stats.currentStreak} days
                      </div>
                      <div className="text-xs text-gray-500">
                        Best: {user.stats.longestStreak}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.disabled ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Banned
                        </span>
                      ) : user.emailVerified ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => viewUserDetails(user.userId)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      {user.subscription.tier === 'free' && (
                        <button
                          onClick={() => grantPremium(user.userId, 'premium')}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Grant
                        </button>
                      )}
                      {user.disabled ? (
                        <button
                          onClick={() => unbanUser(user.userId)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => banUser(user.userId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Ban
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, totalUsers)}
                    </span>{' '}
                    of <span className="font-medium">{totalUsers}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowUserModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl leading-6 font-bold text-gray-900">
                    User Details
                  </h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div>
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Profile</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-600">Name:</span>
                          <span className="ml-2 text-sm font-medium">{selectedUser.name}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Email:</span>
                          <span className="ml-2 text-sm font-medium">{selectedUser.email}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">User ID:</span>
                          <span className="ml-2 text-xs font-mono text-gray-500">{selectedUser.userId}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Joined:</span>
                          <span className="ml-2 text-sm">{formatDateTime(selectedUser.createdAt)}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Last Login:</span>
                          <span className="ml-2 text-sm">{formatDateTime(selectedUser.lastLogin)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Subscription</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-600">Tier:</span>
                          <span className={`ml-2 px-3 py-1 inline-flex text-xs font-semibold rounded-full border ${getTierBadgeColor(selectedUser.subscription.tier)}`}>
                            {selectedUser.subscription.tier.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className="ml-2 text-sm capitalize">{selectedUser.subscription.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Statistics</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded p-3">
                          <div className="text-2xl font-bold text-gray-900">{selectedUser.stats.totalSessions}</div>
                          <div className="text-xs text-gray-600">Total Sessions</div>
                        </div>
                        <div className="bg-gray-50 rounded p-3">
                          <div className="text-2xl font-bold text-gray-900">{selectedUser.stats.totalMinutes}</div>
                          <div className="text-xs text-gray-600">Total Minutes</div>
                        </div>
                        <div className="bg-purple-50 rounded p-3">
                          <div className="text-2xl font-bold text-purple-600">{selectedUser.stats.alphaSessions}</div>
                          <div className="text-xs text-gray-600">Alpha Sessions</div>
                        </div>
                        <div className="bg-blue-50 rounded p-3">
                          <div className="text-2xl font-bold text-blue-600">{selectedUser.stats.betaSessions}</div>
                          <div className="text-xs text-gray-600">Beta Sessions</div>
                        </div>
                        <div className="bg-green-50 rounded p-3">
                          <div className="text-2xl font-bold text-green-600">{selectedUser.stats.currentStreak}</div>
                          <div className="text-xs text-gray-600">Current Streak</div>
                        </div>
                        <div className="bg-yellow-50 rounded p-3">
                          <div className="text-2xl font-bold text-yellow-600">{selectedUser.stats.longestStreak}</div>
                          <div className="text-xs text-gray-600">Longest Streak</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Sessions */}
                {selectedUser.recentSessions.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Recent Sessions</h4>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                      {selectedUser.recentSessions.map((session, index) => (
                        <div key={session.id} className={`flex justify-between py-2 ${index > 0 ? 'border-t border-gray-200' : ''}`}>
                          <div>
                            <span className="text-sm font-medium">
                              {session.waveType === 'alpha' ? '🌊 Alpha' : '⚡ Beta'}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {formatDateTime(session.startTime)}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{session.duration} min</span>
                            {session.completed && (
                              <span className="ml-2 text-green-600">✓</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                {selectedUser.subscription.tier === 'free' && (
                  <>
                    <button
                      onClick={() => grantPremium(selectedUser.userId, 'premium')}
                      disabled={actionLoading}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      Grant Premium
                    </button>
                    <button
                      onClick={() => grantPremium(selectedUser.userId, 'elite')}
                      disabled={actionLoading}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      Grant Elite
                    </button>
                  </>
                )}
                {selectedUser.disabled ? (
                  <button
                    onClick={() => unbanUser(selectedUser.userId)}
                    disabled={actionLoading}
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    Unban User
                  </button>
                ) : (
                  <button
                    onClick={() => banUser(selectedUser.userId)}
                    disabled={actionLoading}
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    Ban User
                  </button>
                )}
                <button
                  onClick={() => deleteUser(selectedUser.userId)}
                  disabled={actionLoading}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Delete User
                </button>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
