import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiFilter, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiEye,
  FiUserCheck,
  FiUserX,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';
import UserTable from './components/UserTable';
import UserModal from './components/UserModal';
import UserFilters from './components/UserFilters';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    role: 'all',
    dateRange: 'all'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(prev => ({ ...prev, totalItems: data.total }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Mock data for development
      setUsers(generateMockUsers());
      setPagination(prev => ({ ...prev, totalItems: 50 }));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      
      if (filters.dateRange !== 'all') {
        filtered = filtered.filter(user => new Date(user.createdAt) >= filterDate);
      }
    }

    setFilteredUsers(filtered);
  };

  const handleUserAction = async (action, userId) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getToken()}`
        }
      });

      if (response.ok) {
        fetchUsers(); // Refresh the user list
      }
    } catch (error) {
      console.error(`Error ${action} user:`, error);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleExportUsers = () => {
    // Implementation for exporting users to CSV
    const csvContent = generateCSV(filteredUsers);
    downloadCSV(csvContent, 'users-export.csv');
  };

  const generateCSV = (users) => {
    const headers = ['Username', 'Email', 'Full Name', 'Role', 'Status', 'Created At', 'Last Active'];
    const rows = users.map(user => [
      user.username,
      user.email,
      user.fullName,
      user.role,
      user.status,
      new Date(user.createdAt).toLocaleDateString(),
      user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="user-management">
      <div className="page-header">
        <div className="header-left">
          <h1>User Management</h1>
          <p>Manage users, roles, and permissions</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            Filters
          </button>
          <button 
            className="btn secondary"
            onClick={handleExportUsers}
          >
            <FiDownload />
            Export
          </button>
          <button 
            className="btn secondary"
            onClick={fetchUsers}
          >
            <FiRefreshCw />
            Refresh
          </button>
          <button 
            className="btn primary"
            onClick={handleCreateUser}
          >
            <FiPlus />
            Add User
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-section">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users by username, email, or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        {showFilters && (
          <UserFilters 
            filters={filters}
            onFiltersChange={setFilters}
          />
        )}
      </div>

      {/* User Statistics */}
      <div className="user-stats">
        <div className="stat-card">
          <span className="stat-value">{users.length}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {users.filter(u => u.status === 'active').length}
          </span>
          <span className="stat-label">Active Users</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {users.filter(u => u.role === 'admin').length}
          </span>
          <span className="stat-label">Administrators</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {users.filter(u => u.status === 'suspended').length}
          </span>
          <span className="stat-label">Suspended</span>
        </div>
      </div>

      {/* User Table */}
      <div className="table-section">
        <UserTable
          users={filteredUsers}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
          onUserAction={handleUserAction}
          onEditUser={handleEditUser}
        />
      </div>

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={selectedUser}
          onClose={() => setShowUserModal(false)}
          onSave={() => {
            setShowUserModal(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
};

// Generate mock users for development
const generateMockUsers = () => {
  const roles = ['user', 'moderator', 'admin'];
  const statuses = ['active', 'inactive', 'suspended'];
  const users = [];

  for (let i = 1; i <= 50; i++) {
    users.push({
      id: i,
      username: `user${i}`,
      email: `user${i}@example.com`,
      fullName: `User ${i}`,
      role: roles[Math.floor(Math.random() * roles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      lastActive: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`
    });
  }

  return users;
};

export default UserManagement;