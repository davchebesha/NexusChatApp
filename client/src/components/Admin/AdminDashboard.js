import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiMessageSquare, 
  FiActivity, 
  FiServer,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertTriangle,
  FiCheckCircle
} from 'react-icons/fi';
import DashboardCard from './components/DashboardCard';
import ChartWidget from './components/ChartWidget';
import ActivityFeed from './components/ActivityFeed';
import SystemHealth from './components/SystemHealth';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      activeUsers: 0,
      totalMessages: 0,
      activeChats: 0
    },
    trends: {
      userGrowth: 0,
      messageGrowth: 0,
      chatGrowth: 0
    },
    systemHealth: {
      cpu: 0,
      memory: 0,
      disk: 0,
      uptime: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set mock data for development
      setDashboardData({
        stats: {
          totalUsers: 1247,
          activeUsers: 89,
          totalMessages: 15632,
          activeChats: 23
        },
        trends: {
          userGrowth: 12.5,
          messageGrowth: 8.3,
          chatGrowth: -2.1
        },
        systemHealth: {
          cpu: 45,
          memory: 67,
          disk: 23,
          uptime: 99.9
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  const { stats, trends, systemHealth } = dashboardData;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back! Here's what's happening with your chat application.</p>
      </div>

      {/* Key Metrics */}
      <div className="dashboard-metrics">
        <DashboardCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={FiUsers}
          trend={trends.userGrowth}
          trendLabel="vs last month"
          color="blue"
        />
        <DashboardCard
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          icon={FiActivity}
          trend={trends.userGrowth}
          trendLabel="currently online"
          color="green"
        />
        <DashboardCard
          title="Total Messages"
          value={stats.totalMessages.toLocaleString()}
          icon={FiMessageSquare}
          trend={trends.messageGrowth}
          trendLabel="vs last month"
          color="purple"
        />
        <DashboardCard
          title="Active Chats"
          value={stats.activeChats.toLocaleString()}
          icon={FiServer}
          trend={trends.chatGrowth}
          trendLabel="ongoing conversations"
          color="orange"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="dashboard-charts">
        <div className="chart-section">
          <ChartWidget 
            title="User Activity (Last 7 Days)"
            type="line"
            data={generateMockChartData('users')}
          />
        </div>
        <div className="chart-section">
          <ChartWidget 
            title="Message Volume (Last 24 Hours)"
            type="bar"
            data={generateMockChartData('messages')}
          />
        </div>
      </div>

      {/* System Health and Activity */}
      <div className="dashboard-bottom">
        <div className="system-health-section">
          <SystemHealth data={systemHealth} />
        </div>
        <div className="activity-feed-section">
          <ActivityFeed />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn primary">
            <FiUsers />
            Manage Users
          </button>
          <button className="action-btn secondary">
            <FiMessageSquare />
            View Recent Chats
          </button>
          <button className="action-btn warning">
            <FiAlertTriangle />
            Review Reports
          </button>
          <button className="action-btn success">
            <FiCheckCircle />
            System Status
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate mock chart data
const generateMockChartData = (type) => {
  const labels = [];
  const data = [];
  
  if (type === 'users') {
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      data.push(Math.floor(Math.random() * 100) + 50);
    }
  } else if (type === 'messages') {
    for (let i = 23; i >= 0; i--) {
      const hour = 23 - i;
      labels.push(`${hour}:00`);
      data.push(Math.floor(Math.random() * 200) + 20);
    }
  }
  
  return { labels, data };
};

export default AdminDashboard;