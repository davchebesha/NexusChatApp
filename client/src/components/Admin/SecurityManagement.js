/**
 * SecurityManagement - Admin component for managing security and locked accounts
 * Part of the 3-strike security rule system
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import accountLockManager from '../../services/AccountLockManager';
import loginAttemptTracker from '../../services/LoginAttemptTracker';
import './SecurityManagement.css';

const SecurityManagement = () => {
  const [lockedAccounts, setLockedAccounts] = useState([]);
  const [securityStats, setSecurityStats] = useState({
    totalLocked: 0,
    averageLockDuration: 15,
    activeRecoveryTokens: 0
  });
  const [loading, setLoading] = useState(true);
  const [unlockingAccount, setUnlockingAccount] = useState(null);

  useEffect(() => {
    loadSecurityData();
    
    // Set up periodic refresh
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      const locked = accountLockManager.getLockedAccounts();
      const stats = accountLockManager.getLockStatistics();
      
      setLockedAccounts(locked);
      setSecurityStats(stats);
    } catch (error) {
      console.error('Error loading security data:', error);
      toast.error('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockAccount = async (userId) => {
    const reason = prompt('Enter reason for unlocking this account:');
    if (!reason) return;

    setUnlockingAccount(userId);

    try {
      const result = await accountLockManager.adminUnlock(
        userId,
        'admin_user', // In production, get from auth context
        reason
      );

      if (result.success) {
        toast.success(`Account ${userId} has been unlocked`);
        loadSecurityData(); // Refresh data
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error unlocking account:', error);
      toast.error('Failed to unlock account');
    } finally {
      setUnlockingAccount(null);
    }
  };

  const formatTimeRemaining = (lockUntil) => {
    const now = new Date();
    const remaining = lockUntil - now;
    
    if (remaining <= 0) {
      return 'Expired';
    }

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getSecurityLevelColor = (attemptCount) => {
    if (attemptCount >= 3) return 'critical';
    if (attemptCount >= 2) return 'warning';
    return 'normal';
  };

  if (loading) {
    return (
      <div className="security-management loading">
        <div className="loading-spinner"></div>
        <p>Loading security data...</p>
      </div>
    );
  }

  return (
    <div className="security-management">
      <div className="security-header">
        <h2>Security Management</h2>
        <p>Monitor and manage account security, locked accounts, and login attempts</p>
      </div>

      {/* Security Statistics */}
      <div className="security-stats">
        <div className="stat-card">
          <div className="stat-icon">🔒</div>
          <div className="stat-content">
            <div className="stat-value">{securityStats.totalLocked}</div>
            <div className="stat-label">Locked Accounts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">{securityStats.averageLockDuration}m</div>
            <div className="stat-label">Lock Duration</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔑</div>
          <div className="stat-content">
            <div className="stat-value">{securityStats.activeRecoveryTokens}</div>
            <div className="stat-label">Recovery Tokens</div>
          </div>
        </div>
      </div>

      {/* Locked Accounts Table */}
      <div className="locked-accounts-section">
        <div className="section-header">
          <h3>Locked Accounts</h3>
          <button 
            className="btn btn-secondary"
            onClick={loadSecurityData}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {lockedAccounts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h4>No Locked Accounts</h4>
            <p>All accounts are currently accessible. The 3-strike security system is active and monitoring login attempts.</p>
          </div>
        ) : (
          <div className="accounts-table">
            <div className="table-header">
              <div className="col-user">User</div>
              <div className="col-attempts">Attempts</div>
              <div className="col-locked">Locked Until</div>
              <div className="col-remaining">Time Remaining</div>
              <div className="col-actions">Actions</div>
            </div>

            {lockedAccounts.map((account) => (
              <div key={account.userId} className="table-row">
                <div className="col-user">
                  <div className="user-info">
                    <div className="user-email">{account.userId}</div>
                    <div className="user-meta">
                      Last attempt: {account.lastAttempt?.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="col-attempts">
                  <span className={`attempt-badge ${getSecurityLevelColor(account.attemptCount)}`}>
                    {account.attemptCount}/3
                  </span>
                </div>

                <div className="col-locked">
                  {account.lockUntil?.toLocaleString()}
                </div>

                <div className="col-remaining">
                  <span className="time-remaining">
                    {formatTimeRemaining(account.lockUntil)}
                  </span>
                </div>

                <div className="col-actions">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleUnlockAccount(account.userId)}
                    disabled={unlockingAccount === account.userId}
                  >
                    {unlockingAccount === account.userId ? 'Unlocking...' : 'Unlock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Information */}
      <div className="security-info">
        <h3>3-Strike Security Rule</h3>
        <div className="info-grid">
          <div className="info-item">
            <strong>Strike 1:</strong> Invalid credentials message
          </div>
          <div className="info-item">
            <strong>Strike 2:</strong> Warning popup with remaining attempts
          </div>
          <div className="info-item">
            <strong>Strike 3:</strong> Account locked for 15 minutes
          </div>
          <div className="info-item">
            <strong>Recovery:</strong> Users can request recovery tokens or wait for expiration
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityManagement;