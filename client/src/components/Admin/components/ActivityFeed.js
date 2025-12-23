import React, { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiMessageSquare, 
  FiUserPlus, 
  FiUserMinus,
  FiAlertTriangle,
  FiSettings
} from 'react-icons/fi';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
    
    // Set up real-time updates
    const interval = setInterval(fetchRecentActivities, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch('/api/admin/activities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Mock data for development
      setActivities(generateMockActivities());
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_joined': return FiUserPlus;
      case 'user_left': return FiUserMinus;
      case 'message_sent': return FiMessageSquare;
      case 'user_reported': return FiAlertTriangle;
      case 'settings_changed': return FiSettings;
      default: return FiUser;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user_joined': return 'success';
      case 'user_left': return 'warning';
      case 'message_sent': return 'info';
      case 'user_reported': return 'danger';
      case 'settings_changed': return 'primary';
      default: return 'secondary';
    }
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
      <div className="activity-feed loading">
        <h3>Recent Activity</h3>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      <div className="feed-header">
        <h3>Recent Activity</h3>
        <button className="refresh-btn" onClick={fetchRecentActivities}>
          Refresh
        </button>
      </div>
      
      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="no-activities">
            <p>No recent activities</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);
            
            return (
              <div key={activity.id} className={`activity-item ${colorClass}`}>
                <div className="activity-icon">
                  <Icon />
                </div>
                <div className="activity-content">
                  <div className="activity-message">
                    {activity.message}
                  </div>
                  <div className="activity-meta">
                    <span className="activity-user">{activity.user}</span>
                    <span className="activity-time">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <div className="feed-footer">
        <button className="view-all-btn">
          View All Activities
        </button>
      </div>
    </div>
  );
};

// Generate mock activities for development
const generateMockActivities = () => {
  const activities = [
    {
      id: 1,
      type: 'user_joined',
      message: 'New user registered',
      user: 'john_doe',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: 2,
      type: 'message_sent',
      message: 'High message volume detected in #general',
      user: 'system',
      timestamp: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: 3,
      type: 'user_reported',
      message: 'User reported for inappropriate content',
      user: 'jane_smith',
      timestamp: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: 4,
      type: 'settings_changed',
      message: 'Chat moderation settings updated',
      user: 'admin',
      timestamp: new Date(Date.now() - 45 * 60 * 1000)
    },
    {
      id: 5,
      type: 'user_left',
      message: 'User account deactivated',
      user: 'inactive_user',
      timestamp: new Date(Date.now() - 60 * 60 * 1000)
    }
  ];
  
  return activities;
};

export default ActivityFeed;