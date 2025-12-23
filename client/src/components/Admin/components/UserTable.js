import React from 'react';
import { 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiUserCheck, 
  FiUserX,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

const UserTable = ({ 
  users, 
  loading, 
  pagination, 
  onPageChange, 
  onUserAction, 
  onEditUser 
}) => {
  const { currentPage, itemsPerPage, totalItems } = pagination;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const displayedUsers = users.slice(startIndex, endIndex);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'success', label: 'Active' },
      inactive: { color: 'warning', label: 'Inactive' },
      suspended: { color: 'danger', label: 'Suspended' }
    };
    
    const config = statusConfig[status] || { color: 'secondary', label: status };
    
    return (
      <span className={`status-badge ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'primary', label: 'Admin' },
      moderator: { color: 'info', label: 'Moderator' },
      user: { color: 'secondary', label: 'User' }
    };
    
    const config = roleConfig[role] || { color: 'secondary', label: role };
    
    return (
      <span className={`role-badge ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="user-table-container">
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No users found
                </td>
              </tr>
            ) : (
              displayedUsers.map((user) => (
                <tr key={user.id} className="user-row">
                  <td className="user-cell">
                    <div className="user-info">
                      <div className="user-avatar">
                        <img 
                          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                          alt={user.username}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="avatar-fallback" style={{ display: 'none' }}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="user-details">
                        <span className="username">{user.username}</span>
                        <span className="full-name">{user.fullName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="email-cell">{user.email}</td>
                  <td className="role-cell">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="status-cell">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="date-cell">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="date-cell">
                    {user.lastActive ? formatDate(user.lastActive) : 'Never'}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        className="action-btn view"
                        onClick={() => onEditUser(user)}
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                      <button
                        className="action-btn edit"
                        onClick={() => onEditUser(user)}
                        title="Edit User"
                      >
                        <FiEdit />
                      </button>
                      {user.status === 'active' ? (
                        <button
                          className="action-btn suspend"
                          onClick={() => onUserAction('suspend', user.id)}
                          title="Suspend User"
                        >
                          <FiUserX />
                        </button>
                      ) : (
                        <button
                          className="action-btn activate"
                          onClick={() => onUserAction('activate', user.id)}
                          title="Activate User"
                        >
                          <FiUserCheck />
                        </button>
                      )}
                      <button
                        className="action-btn delete"
                        onClick={() => onUserAction('delete', user.id)}
                        title="Delete User"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="table-pagination">
        <div className="pagination-info">
          Showing {startIndex + 1} to {endIndex} of {totalItems} users
        </div>
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FiChevronLeft />
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            className="pagination-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTable;