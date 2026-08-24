import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Lightbulb, Quote, Save, X } from 'lucide-react';
import { apiService } from '../services/api';

interface Content {
  id: string;
  type: 'tip' | 'quote' | 'article';
  title: string;
  content: string;
  category?: string;
  author?: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const ContentManagement: React.FC = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [type, setType] = useState<'tip' | 'quote' | 'article'>('tip');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    loadContent();
  }, [filterType]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAppContent(filterType);
      if (response.data) {
        setContents(response.data.contents || []);
      }
    } catch (err) {
      console.error('Failed to load content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      const payload = {
        type,
        title,
        content,
        category: category || undefined,
        author: author || undefined,
        active
      };

      let response;
      if (editingContent) {
        response = await apiService.updateAppContent(editingContent.id, payload);
        setSuccess('Content updated successfully!');
      } else {
        response = await apiService.createAppContent(payload);
        setSuccess('Content created successfully!');
      }

      if (response.success) {
        setShowModal(false);
        resetForm();
        loadContent();
      } else {
        setError(response.error || 'Failed to save content');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save content');
    }
  };

  const handleEdit = (item: Content) => {
    setEditingContent(item);
    setType(item.type);
    setTitle(item.title);
    setContent(item.content);
    setCategory(item.category || '');
    setAuthor(item.author || '');
    setActive(item.active);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      const response = await apiService.deleteAppContent(id);
      if (response.success) {
        setSuccess('Content deleted successfully');
        loadContent();
      } else {
        setError(response.error || 'Failed to delete content');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete content');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await apiService.toggleContentStatus(id, !currentActive);
      if (response.success) {
        setSuccess(`Content ${!currentActive ? 'activated' : 'deactivated'}`);
        loadContent();
      } else {
        setError(response.error || 'Failed to update content');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update content');
    }
  };

  const resetForm = () => {
    setEditingContent(null);
    setType('tip');
    setTitle('');
    setContent('');
    setCategory('');
    setAuthor('');
    setActive(true);
  };

  const getTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-yellow-600" />;
      case 'quote':
        return <Quote className="w-5 h-5 text-purple-600" />;
      case 'article':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (contentType: string) => {
    switch (contentType) {
      case 'tip':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'quote':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'article':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredContents = filterType === 'all'
    ? contents
    : contents.filter(c => c.type === filterType);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">Manage tips, quotes, and educational content for the app</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Content
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm font-medium text-green-800">{success}</p>
          <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">×</button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm font-medium text-red-800">{error}</p>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">×</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-600">Total Content</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">{contents.length}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <h3 className="text-sm font-medium text-gray-600">Tips</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {contents.filter(c => c.type === 'tip').length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Quote className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-medium text-gray-600">Quotes</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {contents.filter(c => c.type === 'quote').length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-600">Articles</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {contents.filter(c => c.type === 'article').length}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Type:</label>
          <div className="flex gap-2">
            {['all', 'tip', 'quote', 'article'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterType === t
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
        </div>
      ) : filteredContents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="font-medium">No content found</p>
          <p className="text-sm mt-1">Create your first piece of content to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContents.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(item.type)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(item.type)}`}>
                      {item.type.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleActive(item.id, item.active)}
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.content}</p>

                {item.category && (
                  <div className="text-xs text-gray-500 mb-2">
                    Category: <span className="font-medium">{item.category}</span>
                  </div>
                )}

                {item.author && (
                  <div className="text-xs text-gray-500 mb-4">
                    Author: <span className="font-medium">{item.author}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingContent ? 'Edit Content' : 'Add New Content'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'tip' | 'quote' | 'article')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="tip">Tip</option>
                  <option value="quote">Quote</option>
                  <option value="article">Article</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter the content"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">{content.length}/1000 characters</p>
              </div>

              {/* Category & Author */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category (Optional)
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Mindfulness, Focus"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author (Optional)
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g., John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Active (visible to users)</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  <Save className="w-4 h-4" />
                  {editingContent ? 'Update Content' : 'Create Content'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
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
