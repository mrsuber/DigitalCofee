import React, { useState, useEffect } from 'react';
import { MessageSquare, Filter, X, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

interface FeedbackItem {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  responses?: Array<{
    message: string;
    respondedBy: string;
    respondedAt: string;
  }>;
  adminNotes?: string;
}

export const Feedback: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, [statusFilter, categoryFilter]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const response = await axios.get(
        `https://digitalcoffee.cafe/api/admin/feedback?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFeedback(response.data.feedback || []);
    } catch (error) {
      console.error('Failed to load feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (feedbackId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `https://digitalcoffee.cafe/api/admin/feedback/${feedbackId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedFeedback(response.data);
      setShowDetailsModal(true);
      setResponseMessage('');
    } catch (error) {
      console.error('Failed to load feedback details:', error);
      alert('Failed to load feedback details');
    }
  };

  const updateStatus = async (feedbackId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(
        `https://digitalcoffee.cafe/api/admin/feedback/${feedbackId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setFeedback(prev =>
        prev.map(item => (item.id === feedbackId ? { ...item, status: newStatus } : item))
      );

      if (selectedFeedback && selectedFeedback.id === feedbackId) {
        setSelectedFeedback({ ...selectedFeedback, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const sendResponse = async () => {
    if (!selectedFeedback || !responseMessage.trim()) return;

    try {
      setSending(true);
      const token = localStorage.getItem('authToken');
      await axios.post(
        `https://digitalcoffee.cafe/api/admin/feedback/${selectedFeedback.id}/respond`,
        {
          message: responseMessage,
          sendEmail: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Response sent successfully!');
      setResponseMessage('');
      await viewDetails(selectedFeedback.id); // Refresh details
      loadFeedback(); // Refresh list
    } catch (error) {
      console.error('Failed to send response:', error);
      alert('Failed to send response');
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug':
        return '🐛';
      case 'feature':
        return '💡';
      case 'help':
        return '❓';
      default:
        return '💬';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Feedback & Support</h1>
        <p className="text-gray-600 mt-1">Manage user feedback and support requests</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="help">Help</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-2xl font-bold text-gray-900">
                {feedback.filter(f => f.status === 'pending').length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-sm text-gray-600">In Progress</div>
              <div className="text-2xl font-bold text-gray-900">
                {feedback.filter(f => f.status === 'in-progress').length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-sm text-gray-600">Resolved</div>
              <div className="text-2xl font-bold text-gray-900">
                {feedback.filter(f => f.status === 'resolved').length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-gray-600" />
            <div>
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl font-bold text-gray-900">{feedback.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          </div>
        ) : feedback.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No feedback found</p>
            <p className="text-sm">Feedback from users will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {feedback.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition"
                onClick={() => viewDetails(item.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{item.subject}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.message}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>From: {item.userName || item.userEmail}</span>
                      <span>•</span>
                      <span>{formatDate(item.createdAt)}</span>
                      <span>•</span>
                      <span className={`font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority} priority
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {item.responses && item.responses.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {item.responses.length} response{item.responses.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedFeedback && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowDetailsModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              {/* Header */}
              <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{getCategoryIcon(selectedFeedback.category)}</span>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedFeedback.subject}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        From: <span className="font-medium">{selectedFeedback.userName}</span> ({selectedFeedback.userEmail})
                      </span>
                      <span>•</span>
                      <span className="text-sm text-gray-600">{formatDate(selectedFeedback.createdAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="bg-white px-6 py-4 max-h-96 overflow-y-auto">
                {/* Original Message */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Original Message</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedFeedback.message}</p>
                  </div>
                </div>

                {/* Responses */}
                {selectedFeedback.responses && selectedFeedback.responses.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Responses</h4>
                    <div className="space-y-3">
                      {selectedFeedback.responses.map((response, index) => (
                        <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-gray-900 mb-2">{response.message}</p>
                          <div className="text-xs text-gray-600">
                            By {response.respondedBy} • {formatDate(response.respondedAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Response */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Add Response</h4>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Type your response here..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 sm:flex sm:flex-row-reverse gap-3">
                <button
                  onClick={sendResponse}
                  disabled={sending || !responseMessage.trim()}
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Sending...' : 'Send Response'}
                </button>

                <div className="flex gap-2">
                  {selectedFeedback.status !== 'resolved' && (
                    <button
                      onClick={() => updateStatus(selectedFeedback.id, 'resolved')}
                      className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none"
                    >
                      Mark Resolved
                    </button>
                  )}

                  {selectedFeedback.status !== 'in-progress' && (
                    <button
                      onClick={() => updateStatus(selectedFeedback.id, 'in-progress')}
                      className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none"
                    >
                      Mark In Progress
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
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
