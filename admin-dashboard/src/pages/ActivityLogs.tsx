import React, { useState, useEffect } from 'react';
import { FileText, Filter, Download, Search, Calendar, User, Activity } from 'lucide-react';
import { apiService } from '../services/api';
import { format } from 'date-fns';

interface ActivityLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  adminEmail: string;
  adminId: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
  status: 'success' | 'failed';
}

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    loadActivityLogs();
  }, [currentPage, filterAction, filterStatus, dateFrom, dateTo]);

  const loadActivityLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        action: filterAction !== 'all' ? filterAction : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
      };

      const response = await apiService.getActivityLogs(params);
      if (response.data) {
        setLogs(response.data.logs || []);
        setTotalPages(Math.ceil((response.data.total || 0) / ITEMS_PER_PAGE));
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiService.exportActivityLogs({
        action: filterAction !== 'all' ? filterAction : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
      });

      if (response.success && response.data) {
        // Create download link
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to export logs:', err);
      alert('Failed to export activity logs');
    }
  };

  const getActionBadgeColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create')) return 'bg-green-100 text-green-800 border-green-200';
    if (actionLower.includes('update') || actionLower.includes('edit')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (actionLower.includes('delete') || actionLower.includes('ban')) return 'bg-red-100 text-red-800 border-red-200';
    if (actionLower.includes('login') || actionLower.includes('auth')) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusBadge = (status: string) => {
    return status === 'success'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM d, yyyy HH:mm:ss');
    } catch {
      return timestamp;
    }
  };

  const filteredLogs = logs.filter(log => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        log.action.toLowerCase().includes(search) ||
        log.resource.toLowerCase().includes(search) ||
        log.adminEmail.toLowerCase().includes(search) ||
        log.details?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const actionTypes = [
    'all',
    'create_user',
    'update_user',
    'delete_user',
    'ban_user',
    'grant_premium',
    'upload_audio',
    'delete_audio',
    'send_notification',
    'create_promo',
    'update_feedback',
    'login',
    'logout'
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-1">Audit trail of all admin actions</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-medium text-gray-600">Total Actions</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">{logs.length}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-medium text-gray-600">Successful</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {logs.filter(l => l.status === 'success').length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-medium text-gray-600">Failed</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {logs.filter(l => l.status === 'failed').length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-600">Active Admins</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {new Set(logs.map(l => l.adminEmail)).size}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Action Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Type
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {actionTypes.map(action => (
                <option key={action} value={action}>
                  {action === 'all' ? 'All Actions' : action.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterAction('all');
              setFilterStatus('all');
              setDateFrom('');
              setDateTo('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
          >
            Clear Filters
          </button>
          <button
            onClick={() => {
              setCurrentPage(1);
              loadActivityLogs();
            }}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-lg shadow-md">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="font-medium">No activity logs found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="text-sm text-gray-900">{log.adminEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getActionBadgeColor(log.action)}`}>
                          {log.action.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.resource}
                        {log.resourceId && (
                          <div className="text-xs text-gray-500 font-mono">{log.resourceId.substring(0, 8)}...</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {log.details || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {log.ipAddress || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(log.status)}`}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">About Activity Logs</h4>
            <p className="text-sm text-blue-700">
              All admin actions are automatically logged for security and compliance. Logs are retained for 90 days.
              Export logs regularly for long-term archival.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
