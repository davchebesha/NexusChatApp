import React from 'react';
import { FiFilter, FiX } from 'react-icons/fi';

const UserFilters = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      role: 'all',
      dateRange: 'all'
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all');

  return (
    <div className="user-filters">
      <div className="filters-header">
        <div className="filters-title">
          <FiFilter className="filter-icon" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            <FiX />
            Clear All
          </button>
        )}
      </div>

      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="role-filter">Role</label>
          <select
            id="role-filter"
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="date-filter">Registration Date</label>
          <select
            id="date-filter"
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="active-filters">
          <span className="active-filters-label">Active filters:</span>
          <div className="filter-tags">
            {filters.status !== 'all' && (
              <span className="filter-tag">
                Status: {filters.status}
                <button onClick={() => handleFilterChange('status', 'all')}>
                  <FiX />
                </button>
              </span>
            )}
            {filters.role !== 'all' && (
              <span className="filter-tag">
                Role: {filters.role}
                <button onClick={() => handleFilterChange('role', 'all')}>
                  <FiX />
                </button>
              </span>
            )}
            {filters.dateRange !== 'all' && (
              <span className="filter-tag">
                Date: {filters.dateRange}
                <button onClick={() => handleFilterChange('dateRange', 'all')}>
                  <FiX />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFilters;