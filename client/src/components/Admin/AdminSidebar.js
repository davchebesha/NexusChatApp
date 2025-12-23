import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiShield, 
  FiMonitor, 
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiLock
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar = ({ collapsed, currentPath }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: FiHome,
      label: 'Dashboard',
      description: 'Overview & Analytics'
    },
    {
      path: '/admin/users',
      icon: FiUsers,
      label: 'User Management',
      description: 'Manage Users & Roles'
    },
    {
      path: '/admin/security',
      icon: FiLock,
      label: 'Security Management',
      description: '3-Strike Rule & Locked Accounts'
    },
    {
      path: '/admin/moderation',
      icon: FiShield,
      label: 'Content Moderation',
      description: 'Chat & Content Review'
    },
    {
      path: '/admin/monitoring',
      icon: FiMonitor,
      label: 'System Monitoring',
      description: 'Server Health & Metrics'
    },
    {
      path: '/admin/settings',
      icon: FiSettings,
      label: 'Admin Settings',
      description: 'System Configuration'
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <h2>{collapsed ? 'NA' : 'NexusChat Admin'}</h2>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <li key={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
                <Link to={item.path} className="nav-link">
                  <Icon className="nav-icon" />
                  {!collapsed && (
                    <div className="nav-text">
                      <span className="nav-label">{item.label}</span>
                      <span className="nav-description">{item.description}</span>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button 
          onClick={handleLogout}
          className="logout-btn"
          title="Logout"
        >
          <FiLogOut className="logout-icon" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;