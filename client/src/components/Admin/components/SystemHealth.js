import React from 'react';
import { 
  FiCpu, 
  FiHardDrive, 
  FiActivity, 
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle
} from 'react-icons/fi';

const SystemHealth = ({ data }) => {
  const getHealthStatus = (value, thresholds = { good: 70, warning: 85 }) => {
    if (value < thresholds.good) return 'good';
    if (value < thresholds.warning) return 'warning';
    return 'critical';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return FiCheckCircle;
      case 'warning': return FiAlertTriangle;
      case 'critical': return FiXCircle;
      default: return FiActivity;
    }
  };

  const metrics = [
    {
      label: 'CPU Usage',
      value: data.cpu,
      unit: '%',
      icon: FiCpu,
      status: getHealthStatus(data.cpu)
    },
    {
      label: 'Memory Usage',
      value: data.memory,
      unit: '%',
      icon: FiActivity,
      status: getHealthStatus(data.memory)
    },
    {
      label: 'Disk Usage',
      value: data.disk,
      unit: '%',
      icon: FiHardDrive,
      status: getHealthStatus(data.disk)
    },
    {
      label: 'Uptime',
      value: data.uptime,
      unit: '%',
      icon: FiClock,
      status: getHealthStatus(100 - data.uptime, { good: 1, warning: 5 })
    }
  ];

  const overallHealth = () => {
    const criticalCount = metrics.filter(m => m.status === 'critical').length;
    const warningCount = metrics.filter(m => m.status === 'warning').length;
    
    if (criticalCount > 0) return 'critical';
    if (warningCount > 0) return 'warning';
    return 'good';
  };

  const overallStatus = overallHealth();
  const OverallIcon = getStatusIcon(overallStatus);

  return (
    <div className="system-health">
      <div className="health-header">
        <h3>System Health</h3>
        <div className={`overall-status ${overallStatus}`}>
          <OverallIcon className="status-icon" />
          <span className="status-text">
            {overallStatus === 'good' ? 'All Systems Operational' :
             overallStatus === 'warning' ? 'Some Issues Detected' :
             'Critical Issues Found'}
          </span>
        </div>
      </div>

      <div className="health-metrics">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const StatusIcon = getStatusIcon(metric.status);
          
          return (
            <div key={metric.label} className={`metric-item ${metric.status}`}>
              <div className="metric-header">
                <div className="metric-icon">
                  <Icon />
                </div>
                <div className="metric-info">
                  <span className="metric-label">{metric.label}</span>
                  <div className="metric-status">
                    <StatusIcon className="status-icon" />
                  </div>
                </div>
              </div>
              
              <div className="metric-value">
                <span className="value-number">{metric.value}</span>
                <span className="value-unit">{metric.unit}</span>
              </div>
              
              <div className="metric-bar">
                <div 
                  className={`bar-fill ${metric.status}`}
                  style={{ width: `${metric.value}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="health-footer">
        <div className="health-summary">
          <div className="summary-item good">
            <span className="summary-count">
              {metrics.filter(m => m.status === 'good').length}
            </span>
            <span className="summary-label">Good</span>
          </div>
          <div className="summary-item warning">
            <span className="summary-count">
              {metrics.filter(m => m.status === 'warning').length}
            </span>
            <span className="summary-label">Warning</span>
          </div>
          <div className="summary-item critical">
            <span className="summary-count">
              {metrics.filter(m => m.status === 'critical').length}
            </span>
            <span className="summary-label">Critical</span>
          </div>
        </div>
        
        <button className="view-details-btn">
          View Detailed Metrics
        </button>
      </div>
    </div>
  );
};

export default SystemHealth;