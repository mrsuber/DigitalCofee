import { useState, useEffect } from 'react';
import { TrendingUp, Users, Activity, Clock, Target, Award } from 'lucide-react';
import { apiService } from '../services/api';

interface EngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  sessionFrequency: number;
  retentionRate: number;
  churnRate: number;
  engagementScore: number;
}

interface CohortData {
  cohort: string;
  users: number;
  retention: number[];
}

interface FeatureUsage {
  feature: string;
  users: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export const UserEngagement = () => {
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    loadEngagementData();
  }, [timeRange]);

  const loadEngagementData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getEngagementMetrics(timeRange);
      setMetrics(data.metrics);
      setCohorts(data.cohorts || []);
      setFeatureUsage(data.featureUsage || []);
    } catch (error) {
      console.error('Error loading engagement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', color: '#667eea' }}>Loading engagement metrics...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', color: '#ef4444' }}>Failed to load engagement metrics</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
            User Engagement Analytics
          </h1>
          <p style={{ color: '#6b7280' }}>Track user behavior, retention, and feature adoption</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontWeight: '600'
          }}
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* Key Metrics Grid */}
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
          <Users style={{ width: '24px', height: '24px', marginBottom: '0.5rem', opacity: 0.9 }} />
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{metrics.dailyActiveUsers}</div>
          <div style={{ opacity: 0.9 }}>Daily Active Users</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '1.5rem',
          borderRadius: '1rem',
          color: 'white'
        }}>
          <Activity style={{ width: '24px', height: '24px', marginBottom: '0.5rem', opacity: 0.9 }} />
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{metrics.weeklyActiveUsers}</div>
          <div style={{ opacity: 0.9 }}>Weekly Active Users</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '1.5rem',
          borderRadius: '1rem',
          color: 'white'
        }}>
          <TrendingUp style={{ width: '24px', height: '24px', marginBottom: '0.5rem', opacity: 0.9 }} />
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{metrics.monthlyActiveUsers}</div>
          <div style={{ opacity: 0.9 }}>Monthly Active Users</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          padding: '1.5rem',
          borderRadius: '1rem',
          color: 'white'
        }}>
          <Clock style={{ width: '24px', height: '24px', marginBottom: '0.5rem', opacity: 0.9 }} />
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {formatDuration(metrics.averageSessionDuration)}
          </div>
          <div style={{ opacity: 0.9 }}>Avg Session Duration</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
          padding: '1.5rem',
          borderRadius: '1rem',
          color: 'white'
        }}>
          <Target style={{ width: '24px', height: '24px', marginBottom: '0.5rem', opacity: 0.9 }} />
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{metrics.retentionRate.toFixed(1)}%</div>
          <div style={{ opacity: 0.9 }}>Retention Rate</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ff9a56 0%, #ff6a00 100%)',
          padding: '1.5rem',
          borderRadius: '1rem',
          color: 'white'
        }}>
          <Award style={{ width: '24px', height: '24px', marginBottom: '0.5rem', opacity: 0.9 }} />
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{metrics.engagementScore}/100</div>
          <div style={{ opacity: 0.9 }}>Engagement Score</div>
        </div>
      </div>

      {/* Feature Usage */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '1rem',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#667eea' }}>
          Feature Usage
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Feature</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Users</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Adoption</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Trend</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {featureUsage.map((feature, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem', fontWeight: '600' }}>{feature.feature}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{feature.users}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{feature.percentage}%</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '1.25rem' }}>
                    {getTrendIcon(feature.trend)}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{
                      height: '8px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                      width: '100%'
                    }}>
                      <div style={{
                        width: `${feature.percentage}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cohort Analysis */}
      {cohorts.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#667eea' }}>
            Cohort Retention Analysis
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Cohort</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>Users</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Week 1</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Week 2</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Week 3</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Week 4</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>{cohort.cohort}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>{cohort.users}</td>
                    {cohort.retention.map((rate, i) => (
                      <td key={i} style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          backgroundColor: rate > 50 ? '#d1fae5' : rate > 30 ? '#fef3c7' : '#fee2e2',
                          color: rate > 50 ? '#065f46' : rate > 30 ? '#92400e' : '#991b1b'
                        }}>
                          {rate}%
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Engagement Insights */}
      <div style={{
        marginTop: '2rem',
        backgroundColor: '#ede9fe',
        padding: '1.5rem',
        borderRadius: '1rem',
        border: '1px solid #c4b5fd'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#5b21b6' }}>
          💡 Engagement Insights
        </h3>
        <ul style={{ marginLeft: '1.5rem', color: '#5b21b6', fontSize: '0.875rem', lineHeight: '1.8' }}>
          <li>
            <strong>Retention:</strong> {metrics.retentionRate > 40
              ? 'Great retention! Users are finding value in the app.'
              : 'Focus on improving onboarding and core feature adoption.'}
          </li>
          <li>
            <strong>Session Duration:</strong> {metrics.averageSessionDuration > 300
              ? 'Users are highly engaged with long sessions.'
              : 'Consider adding more engaging content or features.'}
          </li>
          <li>
            <strong>Churn Risk:</strong> {metrics.churnRate > 10
              ? `${metrics.churnRate.toFixed(1)}% churn rate detected. Implement win-back campaigns.`
              : 'Low churn rate - users are satisfied.'}
          </li>
          <li>
            <strong>Engagement Score:</strong> {metrics.engagementScore > 70
              ? 'Excellent engagement levels across all metrics!'
              : 'Opportunities to improve user engagement through targeted features.'}
          </li>
        </ul>
      </div>
    </div>
  );
};
