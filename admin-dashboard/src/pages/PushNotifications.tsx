import React, { useState, useEffect } from 'react';
import { Send, Bell, Users, History, AlertCircle, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface Notification {
  id: string;
  title: string;
  body: string;
  target: string;
  sentAt: string;
  sentBy: string;
  recipientCount: number;
  status: string;
}

export const PushNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');
  const [specificUserEmail, setSpecificUserEmail] = useState('');

  useEffect(() => {
    loadNotificationHistory();
  }, []);

  const loadNotificationHistory = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotificationHistory();
      if (response.data) {
        setNotifications(response.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notification history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !body.trim()) {
      setError('Title and message are required');
      return;
    }

    if (target === 'specific' && !specificUserEmail.trim()) {
      setError('Please enter a user email for specific targeting');
      return;
    }

    try {
      setSending(true);
      const payload = {
        title,
        body,
        target,
        ...(target === 'specific' && { userEmail: specificUserEmail })
      };

      const response = await apiService.sendPushNotification(payload);

      if (response.success) {
        setSuccess(`Notification sent successfully to ${response.data?.recipientCount || 0} users!`);
        setTitle('');
        setBody('');
        setTarget('all');
        setSpecificUserEmail('');
        loadNotificationHistory();
      } else {
        setError(response.error || 'Failed to send notification');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Push Notifications</h1>
        <p className="text-gray-600 mt-1">Send announcements and updates to your users</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">{success}</p>
          </div>
          <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
            ×
          </button>
        </div>
      )}

      {/* Send Notification Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Send className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Compose Notification</h2>
        </div>

        <form onSubmit={handleSendNotification} className="space-y-4">
          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Users</option>
              <option value="premium">Premium Users Only</option>
              <option value="free">Free Users Only</option>
              <option value="specific">Specific User</option>
            </select>
          </div>

          {/* Specific User Email */}
          {target === 'specific' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Email
              </label>
              <input
                type="email"
                value={specificUserEmail}
                onChange={(e) => setSpecificUserEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
              placeholder="e.g., New Feature Available!"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/50 characters</p>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={200}
              rows={4}
              placeholder="Write your notification message here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{body.length}/200 characters</p>
          </div>

          {/* Preview */}
          {(title || body) && (
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preview
              </label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{title || 'Notification Title'}</h4>
                    <p className="text-sm text-gray-600 mt-1">{body || 'Your message will appear here...'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Send Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={sending || !title.trim() || !body.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
            <button
              type="button"
              onClick={() => {
                setTitle('');
                setBody('');
                setTarget('all');
                setSpecificUserEmail('');
                setError('');
                setSuccess('');
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Quick Templates */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setTitle('New Alpha Track Available');
              setBody('We just added a new relaxing alpha wave track. Check it out in the app!');
            }}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition"
          >
            <h4 className="font-medium text-gray-900 mb-1">New Content</h4>
            <p className="text-sm text-gray-600">Announce new audio tracks</p>
          </button>

          <button
            onClick={() => {
              setTitle('Premium Benefits Await');
              setBody('Upgrade to premium and unlock unlimited sessions, exclusive content, and more!');
              setTarget('free');
            }}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition"
          >
            <h4 className="font-medium text-gray-900 mb-1">Promote Premium</h4>
            <p className="text-sm text-gray-600">Encourage upgrades</p>
          </button>

          <button
            onClick={() => {
              setTitle('Keep Your Streak Going!');
              setBody("You're doing great! Come back today to maintain your listening streak.");
            }}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition"
          >
            <h4 className="font-medium text-gray-900 mb-1">Engagement Reminder</h4>
            <p className="text-sm text-gray-600">Encourage daily usage</p>
          </button>

          <button
            onClick={() => {
              setTitle('System Maintenance Notice');
              setBody('The app will be undergoing maintenance tonight from 12-2 AM. Thank you for your patience!');
            }}
            className="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition"
          >
            <h4 className="font-medium text-gray-900 mb-1">Maintenance</h4>
            <p className="text-sm text-gray-600">Inform about downtime</p>
          </button>
        </div>
      </div>

      {/* Notification History */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Notification History</h3>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No notifications sent yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                        <div className="text-sm text-gray-500">{notification.body}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                        {notification.target.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <Users className="w-4 h-4" />
                        {notification.recipientCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {notification.sentBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(notification.sentAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {notification.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">About Push Notifications</h4>
            <p className="text-sm text-blue-700">
              Push notifications are sent through Firebase Cloud Messaging. Make sure users have granted notification
              permissions in the mobile app. Test notifications on a specific user before sending to all users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
