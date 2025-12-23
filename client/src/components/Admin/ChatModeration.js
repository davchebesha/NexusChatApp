import React, { useState, useEffect } from 'react';
import { 
  FiMessageSquare, 
  FiFlag, 
  FiEye, 
  FiTrash2, 
  FiUser,
  FiClock,
  FiFilter,
  FiSearch
} from 'react-icons/fi';

const ChatModeration = () => {
  const [reports, setReports] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports');
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    fetchModerationData();
  }, []);

  const fetchModerationData = async () => {
    try {
      setLoading(true);
      // Fetch reports and flagged messages
      const [reportsRes, messagesRes] = await Promise.all([
        fetch('/api/admin/moderation/reports', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/admin/moderation/messages', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (reportsRes.ok && messagesRes.ok) {
        const reportsData = await reportsRes.json();
        const messagesData = await messagesRes.json();
        setReports(reportsData);
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Error fetching moderation data:', error);
      // Mock data for development
      setReports(generateMockReports());
      setMessages(generateMockMessages());
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId, action) => {
    try {
      const response = await fetch(`/api/admin/moderation/reports/${reportId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        fetchModerationData();
      }
    } catch (error) {
      console.error(`Error ${action} report:`, error);
    }
  };

  const handleMessageAction = async (messageId, action) => {
    try {
      const response = await fetch(`/api/admin/moderation/messages/${messageId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        fetchModerationData();
      }
    } catch (error) {
      console.error(`Error ${action} message:`, error);
    }
  };

  const getSeverityBadge = (severity) => {
    const config = {
      low: { color: 'success', label: 'Low' },
      medium: { color: 'warning', label: 'Medium' },
      high: { color: 'danger', label: 'High' },
      critical: { color: 'critical', label: 'Critical' }
    };
    
    const { color, label } = config[severity] || config.low;
    
    return (
      <span className={`severity-badge ${color}`}>
        {label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'warning', label: 'Pending' },
      reviewed: { color: 'info', label: 'Reviewed' },
      resolved: { color: 'success', label: 'Resolved' },
      dismissed: { color: 'secondary', label: 'Dismissed' }
    };
    
    const { color, label } = config[status] || config.pending;
    
    return (
      <span className={`status-badge ${color}`}>
        {label}
      </span>
    );
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="moderation-loading">
        <div className="loading-spinner"></div>
        <p>Loading moderation data...</p>
      </div>
    );
  }

  return (
    <div className="chat-moderation">
      <div className="page-header">
        <div className="header-left">
          <h1>Content Moderation</h1>
          <p>Review reported content and manage chat moderation</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="moderation-stats">
        <div className="stat-card">
          <div className="stat-icon danger">
            <FiFlag />
          </div>
          <div className="stat-content">
            <span className="stat-value">{reports.filter(r => r.status === 'pending').length}</span>
            <span className="stat-label">Pending Reports</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <FiMessageSquare />
          </div>
          <div className="stat-content">
            <span className="stat-value">{messages.filter(m => m.flagged).length}</span>
            <span className="stat-label">Flagged Messages</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <FiEye />
          </div>
          <div className="stat-content">
            <span className="stat-value">{reports.filter(r => r.status === 'resolved').length}</span>
            <span className="stat-label">Resolved Today</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="moderation-tabs">
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <FiFlag />
          User Reports ({reports.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          <FiMessageSquare />
          Flagged Messages ({messages.length})
        </button>
      </div>

      {/* Content */}
      <div className="moderation-content">
        {activeTab === 'reports' ? (
          <div className="reports-section">
            <div className="section-header">
              <h3>User Reports</h3>
              <div className="section-actions">
                <button className="btn secondary">
                  <FiFilter />
                  Filter
                </button>
              </div>
            </div>
            
            <div className="reports-list">
              {reports.map((report) => (
                <div key={report.id} className="report-card">
                  <div className="report-header">
                    <div className="report-info">
                      <div className="reporter">
                        <FiUser className="user-icon" />
                        <span>Reported by: {report.reporterUsername}</span>
                      </div>
                      <div className="report-time">
                        <FiClock className="time-icon" />
                        <span>{formatTimeAgo(report.createdAt)}</span>
                      </div>
                    </div>
                    <div className="report-badges">
                      {getSeverityBadge(report.severity)}
                      {getStatusBadge(report.status)}
                    </div>
                  </div>
                  
                  <div className="report-content">
                    <div className="report-reason">
                      <strong>Reason:</strong> {report.reason}
                    </div>
                    <div className="report-description">
                      {report.description}
                    </div>
                    <div className="reported-user">
                      <strong>Reported User:</strong> {report.reportedUsername}
                    </div>
                  </div>
                  
                  <div className="report-actions">
                    <button 
                      className="action-btn view"
                      onClick={() => handleReportAction(report.id, 'view')}
                    >
                      <FiEye />
                      View Details
                    </button>
                    <button 
                      className="action-btn resolve"
                      onClick={() => handleReportAction(report.id, 'resolve')}
                    >
                      Resolve
                    </button>
                    <button 
                      className="action-btn dismiss"
                      onClick={() => handleReportAction(report.id, 'dismiss')}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-section">
            <div className="section-header">
              <h3>Flagged Messages</h3>
              <div className="section-actions">
                <button className="btn secondary">
                  <FiFilter />
                  Filter
                </button>
              </div>
            </div>
            
            <div className="messages-list">
              {messages.map((message) => (
                <div key={message.id} className="message-card">
                  <div className="message-header">
                    <div className="message-user">
                      <div className="user-avatar">
                        {message.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <span className="username">{message.username}</span>
                        <span className="message-time">{formatTimeAgo(message.timestamp)}</span>
                      </div>
                    </div>
                    <div className="message-flags">
                      {message.autoFlagged && (
                        <span className="flag-badge auto">Auto-flagged</span>
                      )}
                      {message.userReported && (
                        <span className="flag-badge user">User reported</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="message-content">
                    <div className="message-text">
                      {message.content}
                    </div>
                    {message.flagReason && (
                      <div className="flag-reason">
                        <strong>Flag Reason:</strong> {message.flagReason}
                      </div>
                    )}
                  </div>
                  
                  <div className="message-actions">
                    <button 
                      className="action-btn approve"
                      onClick={() => handleMessageAction(message.id, 'approve')}
                    >
                      Approve
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleMessageAction(message.id, 'delete')}
                    >
                      <FiTrash2 />
                      Delete
                    </button>
                    <button 
                      className="action-btn warn"
                      onClick={() => handleMessageAction(message.id, 'warn')}
                    >
                      Warn User
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock data generators
const generateMockReports = () => {
  const reasons = ['Spam', 'Harassment', 'Inappropriate Content', 'Hate Speech'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
  
  return Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    reporterUsername: `user${i + 1}`,
    reportedUsername: `reported_user${i + 1}`,
    reason: reasons[Math.floor(Math.random() * reasons.length)],
    description: `This user has been engaging in inappropriate behavior...`,
    severity: severities[Math.floor(Math.random() * severities.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
  }));
};

const generateMockMessages = () => {
  const flagReasons = ['Spam detection', 'Profanity filter', 'User report', 'Suspicious pattern'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    username: `user${i + 1}`,
    content: `This is a flagged message content that may contain inappropriate material...`,
    flagReason: flagReasons[Math.floor(Math.random() * flagReasons.length)],
    autoFlagged: Math.random() > 0.5,
    userReported: Math.random() > 0.7,
    flagged: true,
    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
  }));
};

export default ChatModeration;