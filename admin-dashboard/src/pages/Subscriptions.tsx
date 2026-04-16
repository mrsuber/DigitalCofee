import React, { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, Users, DollarSign, Calendar, Crown } from 'lucide-react';
import axios from 'axios';
import { StatsCard } from '../components/common/StatsCard';
import { format } from 'date-fns';

interface User {
  userId: string;
  email: string;
  name: string;
  subscription: {
    tier: string;
    status: string;
    startDate?: string;
    endDate?: string;
  };
  createdAt: string;
}

export const Subscriptions: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState('all');

  useEffect(() => {
    loadSubscriptions();
  }, [tierFilter]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      const params = new URLSearchParams();
      if (tierFilter !== 'all') params.append('tier', tierFilter);

      const response = await axios.get(
        `https://digitalcoffee.cafe/api/admin/users?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'N/A';
    }
  };

  // Calculate stats
  const totalUsers = users.length;
  const premiumUsers = users.filter(u => u.subscription?.tier === 'premium').length;
  const eliteUsers = users.filter(u => u.subscription?.tier === 'elite').length;
  const lifetimeUsers = users.filter(u => u.subscription?.tier === 'lifetime').length;
  const freeUsers = users.filter(u => u.subscription?.tier === 'free' || !u.subscription).length;

  // Calculate estimated revenue (placeholder values - replace with real pricing)
  const premiumPrice = 9.99;
  const elitePrice = 19.99;
  const lifetimePrice = 99.99;

  const monthlyRevenue = (premiumUsers * premiumPrice) + (eliteUsers * elitePrice);
  const lifetimeRevenue = lifetimeUsers * lifetimePrice;
  const conversionRate = totalUsers > 0 ? ((totalUsers - freeUsers) / totalUsers * 100).toFixed(1) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscriptions & Revenue</h1>
        <p className="text-gray-600 mt-1">Monitor subscription tiers and revenue metrics</p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Monthly Revenue"
          value={`$${monthlyRevenue.toFixed(2)}`}
          icon={DollarSign}
          subtitle="Recurring monthly"
          colorClass="bg-green-500"
        />
        <StatsCard
          title="Lifetime Revenue"
          value={`$${lifetimeRevenue.toFixed(2)}`}
          icon={TrendingUp}
          subtitle="One-time purchases"
          colorClass="bg-purple-500"
        />
        <StatsCard
          title="Premium Users"
          value={totalUsers - freeUsers}
          icon={Crown}
          subtitle={`${conversionRate}% conversion`}
          colorClass="bg-amber-500"
        />
        <StatsCard
          title="Free Users"
          value={freeUsers}
          icon={Users}
          subtitle="Potential customers"
          colorClass="bg-gray-500"
        />
      </div>

      {/* Tier Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Free Tier</h3>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{freeUsers}</div>
          <div className="text-sm text-gray-600">
            {totalUsers > 0 ? ((freeUsers / totalUsers) * 100).toFixed(1) : 0}% of total
          </div>
          <div className="mt-4 text-xs text-gray-500">
            $0.00/month
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Premium</h3>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">{premiumUsers}</div>
          <div className="text-sm text-gray-600">
            {totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : 0}% of total
          </div>
          <div className="mt-4 text-xs text-gray-500">
            ${premiumPrice}/month • ${(premiumUsers * premiumPrice).toFixed(2)} MRR
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Elite</h3>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-yellow-600 mb-2">{eliteUsers}</div>
          <div className="text-sm text-gray-600">
            {totalUsers > 0 ? ((eliteUsers / totalUsers) * 100).toFixed(1) : 0}% of total
          </div>
          <div className="mt-4 text-xs text-gray-500">
            ${elitePrice}/month • ${(eliteUsers * elitePrice).toFixed(2)} MRR
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Lifetime</h3>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">{lifetimeUsers}</div>
          <div className="text-sm text-gray-600">
            {totalUsers > 0 ? ((lifetimeUsers / totalUsers) * 100).toFixed(1) : 0}% of total
          </div>
          <div className="mt-4 text-xs text-gray-500">
            ${lifetimePrice} one-time • ${lifetimeRevenue.toFixed(2)} total
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Tier:</label>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Tiers</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
            <option value="elite">Elite</option>
            <option value="lifetime">Lifetime</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member Since
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No subscriptions found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const tier = user.subscription?.tier || 'free';
                    let revenue = 0;
                    if (tier === 'premium') revenue = premiumPrice;
                    else if (tier === 'elite') revenue = elitePrice;
                    else if (tier === 'lifetime') revenue = lifetimePrice;

                    return (
                      <tr key={user.userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getTierBadgeColor(
                              tier
                            )}`}
                          >
                            {tier.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {tier === 'lifetime' ? (
                            <span>${revenue.toFixed(2)} (one-time)</span>
                          ) : tier !== 'free' ? (
                            <span>${revenue.toFixed(2)}/mo</span>
                          ) : (
                            <span className="text-gray-400">$0.00</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <CreditCard className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Revenue Calculation Note</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Revenue calculations are based on the current pricing model. Integrate with Stripe or RevenueCat
                for real-time revenue tracking and subscription management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
