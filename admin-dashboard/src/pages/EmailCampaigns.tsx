import { useState, useEffect } from 'react';
import { Mail, Send, Calendar, TrendingUp, Trash2, Edit } from 'lucide-react';
import { apiService } from '../services/api';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  targetAudience: 'all' | 'free' | 'premium' | 'lifetime' | 'inactive';
  status: 'draft' | 'scheduled' | 'sent' | 'sending';
  scheduledFor?: any;
  sentAt?: any;
  recipientCount: number;
  openRate?: number;
  clickRate?: number;
  createdAt: any;
}

export const EmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    subject: string;
    content: string;
    targetAudience: 'all' | 'free' | 'premium' | 'lifetime' | 'inactive';
    scheduleType: 'now' | 'scheduled';
    scheduledDate: string;
    scheduledTime: string;
  }>({
    name: '',
    subject: '',
    content: '',
    targetAudience: 'all',
    scheduleType: 'now',
    scheduledDate: '',
    scheduledTime: ''
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await apiService.getEmailCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const campaignData: any = {
        name: formData.name,
        subject: formData.subject,
        content: formData.content,
        targetAudience: formData.targetAudience
      };

      if (formData.scheduleType === 'scheduled' && formData.scheduledDate && formData.scheduledTime) {
        campaignData.scheduledFor = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString();
      }

      if (editingCampaign) {
        await apiService.updateEmailCampaign(editingCampaign.id, campaignData);
      } else {
        await apiService.createEmailCampaign(campaignData);
      }

      setShowModal(false);
      resetForm();
      loadCampaigns();
    } catch (error: any) {
      alert(error.message || 'Failed to save campaign');
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to send this campaign now?')) return;

    try {
      await apiService.sendEmailCampaign(campaignId);
      alert('Campaign sent successfully!');
      loadCampaigns();
    } catch (error: any) {
      alert(error.message || 'Failed to send campaign');
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (!confirm('Delete this campaign?')) return;

    try {
      await apiService.deleteEmailCampaign(campaignId);
      loadCampaigns();
    } catch (error: any) {
      alert(error.message || 'Failed to delete campaign');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      content: '',
      targetAudience: 'all',
      scheduleType: 'now',
      scheduledDate: '',
      scheduledTime: ''
    });
    setEditingCampaign(null);
  };

  const getAudienceBadgeColor = (audience: string) => {
    switch (audience) {
      case 'all': return 'bg-blue-100 text-blue-800';
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'lifetime': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', color: '#667eea' }}>Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
            Email Campaigns
          </h1>
          <p style={{ color: '#6b7280' }}>Create and manage email campaigns for your users</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Mail style={{ width: '20px', height: '20px' }} />
          New Campaign
        </button>
      </div>

      {/* Campaign Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '1.5rem',
          borderRadius: '1rem',
          color: 'white'
        }}>
          <Mail style={{ width: '24px', height: '24px', marginBottom: '0.5rem', opacity: 0.9 }} />
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{campaigns.length}</div>
          <div style={{ opacity: 0.9 }}>Total Campaigns</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '1.5rem',
          borderRadius: '1rem',
          color: 'white'
        }}>
          <Send style={{ width: '24px', height: '24px', marginBottom: '0.5rem', opacity: 0.9 }} />
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {campaigns.filter(c => c.status === 'sent').length}
          </div>
          <div style={{ opacity: 0.9 }}>Sent</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '1.5rem',
          borderRadius: '1rem',
          color: 'white'
        }}>
          <Calendar style={{ width: '24px', height: '24px', marginBottom: '0.5rem', opacity: 0.9 }} />
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {campaigns.filter(c => c.status === 'scheduled').length}
          </div>
          <div style={{ opacity: 0.9 }}>Scheduled</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          padding: '1.5rem',
          borderRadius: '1rem',
          color: 'white'
        }}>
          <TrendingUp style={{ width: '24px', height: '24px', marginBottom: '0.5rem', opacity: 0.9 }} />
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {campaigns.reduce((sum, c) => sum + (c.recipientCount || 0), 0)}
          </div>
          <div style={{ opacity: 0.9 }}>Total Recipients</div>
        </div>
      </div>

      {/* Campaigns List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Campaign</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Audience</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Recipients</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Open Rate</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    No campaigns yet. Create your first campaign!
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '600' }}>{campaign.name}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{campaign.subject}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }} className={getAudienceBadgeColor(campaign.targetAudience)}>
                        {campaign.targetAudience}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }} className={getStatusBadge(campaign.status)}>
                        {campaign.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{campaign.recipientCount || 0}</td>
                    <td style={{ padding: '1rem' }}>
                      {campaign.openRate ? `${campaign.openRate.toFixed(1)}%` : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {campaign.status === 'draft' && (
                          <button
                            onClick={() => handleSendCampaign(campaign.id)}
                            style={{
                              padding: '0.5rem',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: 'pointer'
                            }}
                            title="Send Now"
                          >
                            <Send style={{ width: '16px', height: '16px' }} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingCampaign(campaign);
                            setFormData({
                              name: campaign.name,
                              subject: campaign.subject,
                              content: campaign.content,
                              targetAudience: campaign.targetAudience,
                              scheduleType: 'now',
                              scheduledDate: '',
                              scheduledTime: ''
                            });
                            setShowModal(true);
                          }}
                          style={{
                            padding: '0.5rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer'
                          }}
                          title="Edit"
                        >
                          <Edit style={{ width: '16px', height: '16px' }} />
                        </button>
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          style={{
                            padding: '0.5rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer'
                          }}
                          title="Delete"
                        >
                          <Trash2 style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Email Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Email Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Target Audience
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                >
                  <option value="all">All Users</option>
                  <option value="free">Free Tier Users</option>
                  <option value="premium">Premium Subscribers</option>
                  <option value="lifetime">Lifetime Members</option>
                  <option value="inactive">Inactive Users</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    backgroundColor: 'white'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
