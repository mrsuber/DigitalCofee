import { useState, useEffect } from 'react';
import { Server, Database, Cpu, Wifi, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface SystemMetrics {
  server: {
    uptime: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  database: {
    connections: number;
    queryPerformance: number;
    storageUsed: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  api: {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  firebase: {
    authUsers: number;
    firestoreReads: number;
    firestoreWrites: number;
    storageUsed: number;
    status: 'healthy' | 'warning' | 'critical';
  };
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  lastCheck: string;
  responseTime: number;
}

export const SystemHealth = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadMetrics();

    if (autoRefresh) {
      const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadMetrics = async () => {
    try {
      const data = await apiService.getSystemMetrics();
      setMetrics(data.metrics);
      setServices(data.services);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return '#10b981';
      case 'warning':
      case 'degraded':
        return '#f59e0b';
      case 'critical':
      case 'offline':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle style={{ width: '20px', height: '20px', color: '#f59e0b' }} />;
      case 'critical':
      case 'offline':
        return <XCircle style={{ width: '20px', height: '20px', color: '#ef4444' }} />;
      default:
        return null;
    }
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', color: '#667eea' }}>Loading system metrics...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', color: '#ef4444' }}>Failed to load system metrics</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
            System Health Monitor
          </h1>
          <p style={{ color: '#6b7280' }}>Real-time system performance and health status</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh (30s)</span>
          </label>
          <button
            onClick={loadMetrics}
            style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* Server Status */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${getStatusColor(metrics.server.status)}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <Server style={{ width: '32px', height: '32px', color: '#667eea' }} />
            {getStatusIcon(metrics.server.status)}
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Server</h3>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Uptime: {formatUptime(metrics.server.uptime)}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            CPU: {metrics.server.cpuUsage}% | RAM: {metrics.server.memoryUsage}%
          </div>
        </div>

        {/* Database Status */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${getStatusColor(metrics.database.status)}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <Database style={{ width: '32px', height: '32px', color: '#667eea' }} />
            {getStatusIcon(metrics.database.status)}
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Database</h3>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Connections: {metrics.database.connections}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Query Time: {metrics.database.queryPerformance}ms
          </div>
        </div>

        {/* API Status */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${getStatusColor(metrics.api.status)}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <Wifi style={{ width: '32px', height: '32px', color: '#667eea' }} />
            {getStatusIcon(metrics.api.status)}
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>API</h3>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            {metrics.api.requestsPerMinute} req/min
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Avg Response: {metrics.api.averageResponseTime}ms
          </div>
        </div>

        {/* Firebase Status */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${getStatusColor(metrics.firebase.status)}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <Database style={{ width: '32px', height: '32px', color: '#667eea' }} />
            {getStatusIcon(metrics.firebase.status)}
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Firebase</h3>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Auth Users: {metrics.firebase.authUsers}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Storage: {formatBytes(metrics.firebase.storageUsed)}
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* CPU & Memory Usage */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu style={{ width: '20px', height: '20px', color: '#667eea' }} />
            Resource Usage
          </h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>CPU</span>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{metrics.server.cpuUsage}%</span>
            </div>
            <div style={{
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${metrics.server.cpuUsage}%`,
                height: '100%',
                backgroundColor: metrics.server.cpuUsage > 80 ? '#ef4444' : metrics.server.cpuUsage > 60 ? '#f59e0b' : '#10b981',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Memory</span>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{metrics.server.memoryUsage}%</span>
            </div>
            <div style={{
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${metrics.server.memoryUsage}%`,
                height: '100%',
                backgroundColor: metrics.server.memoryUsage > 80 ? '#ef4444' : metrics.server.memoryUsage > 60 ? '#f59e0b' : '#10b981',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Disk</span>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{metrics.server.diskUsage}%</span>
            </div>
            <div style={{
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${metrics.server.diskUsage}%`,
                height: '100%',
                backgroundColor: metrics.server.diskUsage > 80 ? '#ef4444' : metrics.server.diskUsage > 60 ? '#f59e0b' : '#10b981',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        </div>

        {/* API Performance */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wifi style={{ width: '20px', height: '20px', color: '#667eea' }} />
            API Performance
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ fontWeight: '600' }}>Requests/Minute</span>
            <span style={{ color: '#667eea', fontWeight: 'bold' }}>{metrics.api.requestsPerMinute}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ fontWeight: '600' }}>Avg Response Time</span>
            <span style={{ color: metrics.api.averageResponseTime > 500 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
              {metrics.api.averageResponseTime}ms
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0' }}>
            <span style={{ fontWeight: '600' }}>Error Rate</span>
            <span style={{ color: metrics.api.errorRate > 5 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
              {metrics.api.errorRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Services Status Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Service Status</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Service</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Response Time</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Last Checked</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>{service.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getStatusIcon(service.status)}
                      <span style={{ textTransform: 'capitalize' }}>{service.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>{service.responseTime}ms</td>
                  <td style={{ padding: '1rem', color: '#6b7280' }}>{service.lastCheck}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
