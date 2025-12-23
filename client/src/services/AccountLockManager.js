/**
 * AccountLockManager - Manages account locking and recovery
 * Works with LoginAttemptTracker to enforce 3-strike security rule
 */

import loginAttemptTracker from './LoginAttemptTracker';

class AccountLockManager {
  constructor() {
    this.lockDuration = 15 * 60 * 1000; // 15 minutes
    this.recoveryTokens = new Map(); // userId -> recovery token
    this.tokenExpiration = 60 * 60 * 1000; // 1 hour
  }

  /**
   * Check if account is locked and return lock status
   * @param {string} userId - User identifier
   * @returns {Object} Lock status information
   */
  checkLockStatus(userId) {
    const status = loginAttemptTracker.getAttemptStatus(userId);
    
    if (status.isLocked) {
      const timeRemaining = status.lockUntil - new Date();
      const minutesRemaining = Math.ceil(timeRemaining / 60000);

      return {
        isLocked: true,
        lockUntil: status.lockUntil,
        timeRemaining,
        minutesRemaining,
        message: `Account is locked. Please try again in ${minutesRemaining} minute(s).`,
        canRecover: true
      };
    }

    return {
      isLocked: false,
      remainingAttempts: status.remainingAttempts,
      message: null
    };
  }

  /**
   * Generate recovery token for locked account
   * @param {string} userId - User identifier
   * @param {string} email - User email for verification
   * @returns {Object} Recovery token information
   */
  async generateRecoveryToken(userId, email) {
    // Generate secure random token
    const token = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + this.tokenExpiration);

    this.recoveryTokens.set(userId, {
      token,
      email,
      expiresAt,
      used: false,
      createdAt: new Date()
    });

    // In production, this would send an email
    // For now, return token for testing
    return {
      success: true,
      token,
      expiresAt,
      message: 'Recovery token generated. Check your email for instructions.'
    };
  }

  /**
   * Verify and use recovery token to unlock account
   * @param {string} userId - User identifier
   * @param {string} token - Recovery token
   * @returns {Object} Recovery result
   */
  async verifyRecoveryToken(userId, token) {
    if (!this.recoveryTokens.has(userId)) {
      return {
        success: false,
        message: 'No recovery token found for this account.'
      };
    }

    const recoveryData = this.recoveryTokens.get(userId);

    // Check if token has expired
    if (new Date() > recoveryData.expiresAt) {
      this.recoveryTokens.delete(userId);
      return {
        success: false,
        message: 'Recovery token has expired. Please request a new one.'
      };
    }

    // Check if token has already been used
    if (recoveryData.used) {
      return {
        success: false,
        message: 'Recovery token has already been used.'
      };
    }

    // Verify token matches
    if (recoveryData.token !== token) {
      return {
        success: false,
        message: 'Invalid recovery token.'
      };
    }

    // Mark token as used
    recoveryData.used = true;

    // Unlock the account
    loginAttemptTracker.unlockAccount(userId, 'recovery_system');

    // Clean up token
    this.recoveryTokens.delete(userId);

    return {
      success: true,
      message: 'Account successfully unlocked. You can now log in.'
    };
  }

  /**
   * Admin unlock account (bypass recovery process)
   * @param {string} userId - User identifier
   * @param {string} adminId - Admin performing the unlock
   * @param {string} reason - Reason for unlock
   * @returns {Object} Unlock result
   */
  async adminUnlock(userId, adminId, reason) {
    const status = this.checkLockStatus(userId);

    if (!status.isLocked) {
      return {
        success: false,
        message: 'Account is not locked.'
      };
    }

    // Unlock account
    loginAttemptTracker.unlockAccount(userId, adminId);

    // Log admin action
    this.logAdminAction(adminId, 'account_unlock', {
      targetUserId: userId,
      reason,
      timestamp: new Date()
    });

    return {
      success: true,
      message: 'Account unlocked by administrator.',
      unlockedBy: adminId
    };
  }

  /**
   * Get all currently locked accounts (admin function)
   * @returns {Array} List of locked accounts with details
   */
  getLockedAccounts() {
    return loginAttemptTracker.getLockedAccounts();
  }

  /**
   * Get lock statistics (admin function)
   * @returns {Object} Statistics about account locks
   */
  getLockStatistics() {
    const lockedAccounts = this.getLockedAccounts();
    
    return {
      totalLocked: lockedAccounts.length,
      accounts: lockedAccounts,
      averageLockDuration: this.lockDuration / 60000, // in minutes
      activeRecoveryTokens: this.recoveryTokens.size
    };
  }

  /**
   * Generate secure random token
   * @returns {string} Secure token
   */
  generateSecureToken() {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for Node.js environment
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Log admin action for audit trail
   * @param {string} adminId - Admin identifier
   * @param {string} action - Action performed
   * @param {Object} details - Action details
   */
  logAdminAction(adminId, action, details) {
    const logEntry = {
      adminId,
      action,
      details,
      timestamp: new Date()
    };

    // Dispatch event for audit logging system
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adminAction', { detail: logEntry }));
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Admin Action:', logEntry);
    }
  }

  /**
   * Clean up expired recovery tokens
   */
  cleanupExpiredTokens() {
    const now = new Date();
    
    for (const [userId, tokenData] of this.recoveryTokens.entries()) {
      if (now > tokenData.expiresAt || tokenData.used) {
        this.recoveryTokens.delete(userId);
      }
    }
  }

  /**
   * Send recovery email (placeholder for actual email service)
   * @param {string} email - User email
   * @param {string} token - Recovery token
   * @returns {Promise<Object>} Email send result
   */
  async sendRecoveryEmail(email, token) {
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    // For now, just log the token
    console.log(`Recovery email would be sent to ${email} with token: ${token}`);
    
    return {
      success: true,
      message: 'Recovery email sent successfully.'
    };
  }
}

// Create singleton instance
const accountLockManager = new AccountLockManager();

// Set up periodic cleanup of expired tokens
if (typeof window !== 'undefined') {
  setInterval(() => {
    accountLockManager.cleanupExpiredTokens();
  }, 5 * 60000); // Clean up every 5 minutes
}

export default accountLockManager;
