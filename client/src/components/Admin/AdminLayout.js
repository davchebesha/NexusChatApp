import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import SecurityManagement from './SecurityManagement';
import ChatModeration from './ChatModeration';
import SystemMonitoring from './SystemMonitoring';
import AdminSettings from './AdminSettings';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has admin privileges
    if (user && user.role !== 'admin') {
      setLoading(false);
      return;
    }
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  // Redirect non-admin users
  if (!user || user.role !== 'admin') {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar 
        collapsed={sidebarCollapsed}
        currentPath={location.pathname}
      />
      <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <AdminHeader 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="admin-content">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/security" element={<SecurityManagement />} />
            <Route path="/moderation" element={<ChatModeration />} />
            <Route path="/monitoring" element={<SystemMonitoring />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;