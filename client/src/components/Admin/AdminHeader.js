import React, { useState, useEffect } from 'react';
import { 
  FiMenu, 
  FiBell, 
  FiUser, 
  FiSearch,
  FiRefreshCw,
  FiWifi,
  FiWifiOff
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const AdminHeader = ({ onToggleSidebar, sidebarCollapsed }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update timestamp every minute
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <button 
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <FiMenu />
        </button>
        
        <div className="header-search">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search users, chats, or settings..."
            className="search-input"
          />
        </div>
      </div>

      <div className="header-right">
        <div className="header-status">
          <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? <FiWifi /> : <FiWifiOff />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          
          <button 
            className="refresh-btn"
            onClick={handleRefresh}
            title="Refresh Dashboard"
          >
            <FiRefreshCw />
          </button>
        </div>

        <div className="header-notifications">
          <button className="notification-btn">
            <FiBell />
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>
        </div>

        <div className="header-user">
          <div className="user-avatar">
            <FiUser />
          </div>
          <div className="user-info">
            <span className="user-name">{user?.username || 'Admin'}</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>

        <div className="header-timestamp">
          <span className="last-update">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;