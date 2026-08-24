import { useState } from 'react';
import { Users, Mail, Tag, Trash2, Award, Ban, Upload, Download } from 'lucide-react';
import { apiService } from '../services/api';

type OperationType =
  | 'grant-premium'
  | 'revoke-premium'
  | 'send-email'
  | 'apply-promo'
  | 'ban-users'
  | 'unban-users'
  | 'delete-users'
  | 'export-users';

export const BulkOperations = () => {
  const [selectedOperation, setSelectedOperation] = useState<OperationType>('grant-premium');
  const [userInput, setUserInput] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const operations = [
    { id: 'grant-premium', label: 'Grant Premium Access', icon: Award, color: '#10b981' },
    { id: 'revoke-premium', label: 'Revoke Premium Access', icon: Award, color: '#ef4444' },
    { id: 'send-email', label: 'Send Bulk Email', icon: Mail, color: '#3b82f6' },
    { id: 'apply-promo', label: 'Apply Promo Code', icon: Tag, color: '#f59e0b' },
    { id: 'ban-users', label: 'Ban Users', icon: Ban, color: '#ef4444' },
    { id: 'unban-users', label: 'Unban Users', icon: Users, color: '#10b981' },
    { id: 'delete-users', label: 'Delete Users', icon: Trash2, color: '#991b1b' },
    { id: 'export-users', label: 'Export User Data', icon: Download, color: '#667eea' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emails = userInput
      .split('\n')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emails.length === 0) {
      alert('Please enter at least one email address');
      return;
    }

    if (selectedOperation === 'delete-users' || selectedOperation === 'ban-users') {
      const confirmMessage = `Are you sure you want to ${selectedOperation === 'delete-users' ? 'DELETE' : 'BAN'} ${emails.length} user(s)? This action cannot be undone!`;
      if (!confirm(confirmMessage)) return;
    }

    try {
      setProcessing(true);
      setResults(null);

      let result;
      switch (selectedOperation) {
        case 'grant-premium':
          result = await apiService.bulkGrantPremium(emails);
          break;
        case 'revoke-premium':
          result = await apiService.bulkRevokePremium(emails);
          break;
        case 'send-email':
          if (!emailSubject || !emailContent) {
            alert('Please provide email subject and content');
            return;
          }
          result = await apiService.bulkSendEmail(emails, emailSubject, emailContent);
          break;
        case 'apply-promo':
          if (!promoCode) {
            alert('Please enter a promo code');
            return;
          }
          result = await apiService.bulkApplyPromo(emails, promoCode);
          break;
        case 'ban-users':
          result = await apiService.bulkBanUsers(emails);
          break;
        case 'unban-users':
          result = await apiService.bulkUnbanUsers(emails);
          break;
        case 'delete-users':
          result = await apiService.bulkDeleteUsers(emails);
          break;
        case 'export-users':
          result = await apiService.bulkExportUsers(emails);
          if (result.csvData) {
            const blob = new Blob([result.csvData], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
          }
          break;
      }

      setResults(result);

      if (selectedOperation !== 'export-users') {
        alert(`Operation completed successfully! Processed ${emails.length} user(s).`);
      }
    } catch (error: any) {
      alert(error.message || 'Operation failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      // Parse CSV and extract emails
      const lines = content.split('\n');
      const emails = lines
        .map(line => {
          const parts = line.split(',');
          return parts[0]?.trim(); // Assume email is first column
        })
        .filter(email => email && email.includes('@'));

      setUserInput(emails.join('\n'));
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
          Bulk Operations
        </h1>
        <p style={{ color: '#6b7280' }}>Perform operations on multiple users simultaneously</p>
      </div>

      {/* Operation Selection */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '1rem',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#667eea' }}>
          Select Operation
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {operations.map((op) => {
            const Icon = op.icon;
            const isSelected = selectedOperation === op.id;
            return (
              <button
                key={op.id}
                onClick={() => setSelectedOperation(op.id as OperationType)}
                style={{
                  padding: '1.5rem',
                  border: isSelected ? `2px solid ${op.color}` : '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  backgroundColor: isSelected ? `${op.color}10` : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
              >
                <Icon style={{ width: '24px', height: '24px', color: op.color, marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{op.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Operation Form */}
      <form onSubmit={handleSubmit}>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#667eea' }}>
            User Selection
          </h2>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
              Enter Email Addresses (one per line)
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              required
              rows={8}
              placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}
            />
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
              {userInput.split('\n').filter(e => e.trim()).length} email(s) entered
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f3f4f6',
              border: '2px dashed #d1d5db',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}>
              <Upload style={{ width: '20px', height: '20px' }} />
              Upload CSV File
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
              Upload a CSV file with email addresses in the first column
            </div>
          </div>

          {/* Additional Fields Based on Operation */}
          {selectedOperation === 'send-email' && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Email Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Email Content
                </label>
                <textarea
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  required
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </>
          )}

          {selectedOperation === 'apply-promo' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Promo Code
              </label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                required
                placeholder="PROMO2024"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  textTransform: 'uppercase'
                }}
              />
            </div>
          )}

          {/* Warning for Destructive Operations */}
          {(selectedOperation === 'delete-users' || selectedOperation === 'ban-users') && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b', fontWeight: '600' }}>
                ⚠️ Warning: Destructive Operation
              </div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#7f1d1d' }}>
                {selectedOperation === 'delete-users'
                  ? 'This will permanently delete the selected users and all their data. This action cannot be undone.'
                  : 'This will ban the selected users from accessing the application.'}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={processing}
            style={{
              width: '100%',
              padding: '1rem',
              background: processing
                ? '#9ca3af'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: processing ? 'not-allowed' : 'pointer'
            }}
          >
            {processing ? 'Processing...' : `Execute Operation`}
          </button>
        </div>
      </form>

      {/* Results */}
      {results && (
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#667eea' }}>
            Operation Results
          </h2>
          <div style={{
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Usage Guidelines */}
      <div style={{
        backgroundColor: '#ede9fe',
        padding: '1.5rem',
        borderRadius: '1rem',
        border: '1px solid #c4b5fd',
        marginTop: '2rem'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#5b21b6' }}>
          💡 Usage Guidelines
        </h3>
        <ul style={{ marginLeft: '1.5rem', color: '#5b21b6', fontSize: '0.875rem', lineHeight: '1.8' }}>
          <li>Always verify the email list before performing destructive operations</li>
          <li>Use CSV upload for large batches (recommended for 50+ users)</li>
          <li>Test operations with a small group first before bulk execution</li>
          <li>Bulk email sending respects rate limits to avoid spam filters</li>
          <li>Export user data before deletion for backup purposes</li>
        </ul>
      </div>
    </div>
  );
};
