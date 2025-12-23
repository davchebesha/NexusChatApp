import React, { useState, useEffect } from 'react';
import { 
  FiServer, 
  FiCpu, 
  FiHardDrive, 
  FiActivity,
  FiUsers,
  FiDatabase,
  FiWifi
} from 'react-icons/fi';
import './SystemMonitoring.css';

const SystemMonitoring = () => {
  const [systemStats, setSystemStats] = useState({
    server: {
      status: 'online',
      uptime: '2d 14h 32m',
      cpu: 45,
      memory: 68,
      disk: 32
    },
    database: {
      status: 'connected',
      connections: 12,
      queries: 1247,
      responseTime: 23
    },
    users: {
      online: 156,
      total: 2341,
      peak: 289
    },
    network: {
      incoming: 2.4,
      outgoing: 1.8,
      latency: 12
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading system stats
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    // Set up periodic updates
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        server: {
          ...prev.server,
          cpu: Math.max(20, Math.min(80, prev.server.cpu + (Math.random() - 0.5) * 10)),
          memory: Math.max(30, Math.min(90, prev.server.memory + (Math.random() - 0.5) * 5))
        },
        users: {
          ...prev.users,
          online: Math.max(50, Math.min(300, prev.users.online + Math.floor((Math.random() - 0.5) * 20)))
        }
      }));
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
      case 'connected':
        return 'success';
      case 'warning':
        return 'warning';
      case 'offline':
      case 'error':
        return 'error';
      default:
        return 'normal';
    }
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 80) return 'error';
    if (percentage >= 60) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <div className="system-monitoring loading">
        <div className="loading-spinner"></div>
        <p>Loading system metrics...</p>
      </div>
    );
  }

  return (
    <div className="system-monitoring">
      <div className="monitoring-header">
        <h2>System Monitoring</h2>
        <p>Real-time system health and performance metrics</p>
      </div>

      {/* Server Status */}
      <div className="metrics-section">
        <h3>Server Status</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <FiServer className="metric-icon" />
              <div className="metric-info">
                <h4>Server Status</h4>
                <span className={`status-badge ${getStatusColor(systemStats.server.status)}`}>
                  {systemStats.server.status}
                </span>
              </div>
            </div>
            <div className="metric-details">
              <div className="detail-item">
                <span>Uptime:</span>
                <span>{systemStats.server.uptime}</span>
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <FiCpu className="metric-icon" />
              <div className="metric-info">
                <h4>CPU Usage</h4>
                <span className="metric-value">{systemStats.server.cpu}%</span>
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className={`progress-fill ${getUsageColor(systemStats.server.cpu)}`}
                style={{ width: `${systemStats.server.cpu}%` }}
              ></div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <FiActivity className="metric-icon" />
              <div className="metric-info">
                <h4>Memory Usage</h4>
                <span className="metric-value">{systemStats.server.memory}%</span>
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className={`progress-fill ${getUsageColor(systemStats.server.memory)}`}
                style={{ width: `${systemStats.server.memory}%` }}
              ></div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <FiHardDrive className="metric-icon" />
              <div className="metric-info">
                <h4>Disk Usage</h4>
                <span className="metric-value">{systemStats.server.disk}%</span>
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className={`progress-fill ${getUsageColor(systemStats.server.disk)}`}
                style={{ width: `${systemStats.server.disk}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Status */}
      <div className="metrics-section">
        <h3>Database Performance</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <FiDatabase className="metric-icon" />
              <div className="metric-info">
                <h4>Database Status</h4>
                <span className={`status-badge ${getStatusColor(systemStats.database.status)}`}>
                  {systemStats.database.status}
                </span>
              </div>
            </div>
            <div className="metric-details">
              <div className="detail-item">
                <span>Connections:</span>
                <span>{systemStats.database.connections}</span>
              </div>
              <div className="detail-item">
                <span>Queries/min:</span>
                <span>{systemStats.database.queries}</span>
              </div>
              <div className="detail-item">
                <span>Response Time:</span>
                <span>{systemStats.database.responseTime}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Statistics */}
      <div className="metrics-section">
        <h3>User Activity</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <FiUsers className="metric-icon" />
              <div className="metric-info">
                <h4>Online Users</h4>
                <span className="metric-value">{systemStats.users.online}</span>
              </div>
            </div>
            <div className="metric-details">
              <div className="detail-item">
                <span>Total Users:</span>
                <span>{systemStats.users.total}</span>
              </div>
              <div className="detail-item">
                <span>Peak Today:</span>
                <span>{systemStats.users.peak}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Network Statistics */}
      <div className="metrics-section">
        <h3>Network Activity</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <FiWifi className="metric-icon" />
              <div className="metric-info">
                <h4>Network Traffic</h4>
                <span className="metric-value">{systemStats.network.incoming + systemStats.network.outgoing} MB/s</span>
              </div>
            </div>
            <div className="metric-details">
              <div className="detail-item">
                <span>Incoming:</span>
                <span>{systemStats.network.incoming} MB/s</span>
              </div>
              <div className="detail-item">
                <span>Outgoing:</span>
                <span>{systemStats.network.outgoing} MB/s</span>
              </div>
              <div className="detail-item">
                <span>Latency:</span>
                <span>{systemStats.network.latency}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitoring;