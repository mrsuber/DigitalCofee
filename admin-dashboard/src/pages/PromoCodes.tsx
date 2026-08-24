import React, { useState, useEffect } from 'react';
import { Plus, Tag, Trash2, Copy, CheckCircle, AlertCircle, Calendar, Percent } from 'lucide-react';
import { apiService } from '../services/api';

interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  tier: string;
  maxUses: number;
  currentUses: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
  createdBy: string;
}

export const PromoCodes: React.FC = () => {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [codeInput, setCodeInput] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [tier, setTier] = useState('premium');
  const [maxUses, setMaxUses] = useState(100);
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPromoCodes();
      if (response.data) {
        setCodes(response.data.codes || []);
      }
    } catch (err) {
      console.error('Failed to load promo codes:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setCodeInput(code);
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!codeInput.trim()) {
      setError('Promo code is required');
      return;
    }

    if (discountValue <= 0) {
      setError('Discount value must be greater than 0');
      return;
    }

    if (discountType === 'percentage' && discountValue > 100) {
      setError('Percentage discount cannot exceed 100%');
      return;
    }

    try {
      const payload = {
        code: codeInput.toUpperCase(),
        description,
        discountType,
        discountValue,
        tier,
        maxUses,
        expiresAt: expiresAt || null
      };

      const response = await apiService.createPromoCode(payload);

      if (response.success) {
        setSuccess('Promo code created successfully!');
        setShowCreateModal(false);
        resetForm();
        loadPromoCodes();
      } else {
        setError(response.error || 'Failed to create promo code');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create promo code');
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) {
      return;
    }

    try {
      const response = await apiService.deletePromoCode(codeId);
      if (response.success) {
        setSuccess('Promo code deleted successfully');
        loadPromoCodes();
      } else {
        setError(response.error || 'Failed to delete promo code');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete promo code');
    }
  };

  const handleToggleActive = async (codeId: string, currentActive: boolean) => {
    try {
      const response = await apiService.togglePromoCodeStatus(codeId, !currentActive);
      if (response.success) {
        setSuccess(`Promo code ${!currentActive ? 'activated' : 'deactivated'}`);
        loadPromoCodes();
      } else {
        setError(response.error || 'Failed to update promo code');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update promo code');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setSuccess(`Code "${code}" copied to clipboard!`);
  };

  const resetForm = () => {
    setCodeInput('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue(10);
    setTier('premium');
    setMaxUses(100);
    setExpiresAt('');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const getUsagePercentage = (code: PromoCode) => {
    return (code.currentUses / code.maxUses) * 100;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotional Codes</h1>
          <p className="text-gray-600 mt-1">Create and manage discount codes for subscriptions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus className="w-4 h-4" />
          Create Code
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-green-800 flex-1">{success}</p>
          <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">×</button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-800 flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">×</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Codes</h3>
            <Tag className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{codes.length}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Active Codes</h3>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {codes.filter(c => c.active).length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Redemptions</h3>
            <Percent className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {codes.reduce((sum, code) => sum + code.currentUses, 0)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Expired Codes</h3>
            <Calendar className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {codes.filter(c => c.expiresAt && new Date(c.expiresAt) < new Date()).length}
          </div>
        </div>
      </div>

      {/* Promo Codes List */}
      <div className="bg-white rounded-lg shadow-md">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          </div>
        ) : codes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Tag className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="font-medium">No promo codes yet</p>
            <p className="text-sm mt-1">Create your first promotional code to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {codes.map((code) => (
                  <tr key={code.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-900">{code.code}</span>
                          <button
                            onClick={() => copyToClipboard(code.code)}
                            className="text-gray-400 hover:text-purple-600 transition"
                            title="Copy code"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-sm text-gray-500">{code.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        {code.discountType === 'percentage'
                          ? `${code.discountValue}% off`
                          : `$${code.discountValue} off`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                        {code.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">{code.currentUses} / {code.maxUses}</span>
                          <span className="text-gray-500">{getUsagePercentage(code).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              getUsagePercentage(code) >= 100 ? 'bg-red-500' :
                              getUsagePercentage(code) >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(getUsagePercentage(code), 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(code.expiresAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(code.id, code.active)}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          code.active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        } transition`}
                      >
                        {code.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteCode(code.id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete code"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Create Promo Code</h2>
            </div>

            <form onSubmit={handleCreateCode} className="p-6 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    placeholder="SUMMER2024"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                  >
                    Generate
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summer promotion discount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type *
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    min="1"
                    max={discountType === 'percentage' ? 100 : undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Tier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Tier *
                </label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="premium">Premium</option>
                  <option value="elite">Elite</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>

              {/* Max Uses & Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Uses *
                  </label>
                  <input
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expires At (Optional)
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Create Code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
