/**
 * LoginAttemptTracker - Monitors and tracks failed login attempts
 * Implements the 3-strike security rule for Nexus ChatApp
 */

class LoginAttemptTracker {
  constructor() {
    this.attempts = new Map(); // userId -> attempt data
    this.maxAttempts = 3;
    this.lockDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
  }

  /**
   * Record a login attempt
   * @param {string} userId - User identifier (email or username)
   * @param {boolean} success - Whether the attempt was successful
   * @param {string} ipAddress - IP address of the attempt
   * @param {string} userAgent - User agent string
   * @returns {Object} Attempt result with warning information
   */
  recordAttempt(userId, success, ipAddress, userAgent) {
    const now = new Date();
    
    if (!this.attempts.has(userId)) {
      this.attempts.set(userId, {
        count: 0,
        attempts: [],
        isLocked: false,
        lockUntil: null,
        lastAttempt: null
      });
    }

    const userAttempts = this.attempts.get(userId);

    // If successful login, reset attempts
    if (success) {
      this.resetAttempts(userId);
      return {
        success: true,
        isLocked: false,
        remainingAttempts: this.maxAttempts,
        showWarning: false
      };
    }

    // Check if account is currently locked
    if (this.isAccountLocked(userId)) {
      return {
        success: false,
        isLocked: true,
        lockUntil: userAttempts.lockUntil,
        remainingAttempts: 0,
        showWarning: false,
        message: `Account is locked until ${userAttempts.lockUntil.toLocaleString()}`
      };
    }

    // Record failed attempt
    userAttempts.count++;
    userAttempts.lastAttempt = now;
    userAttempts.attempts.push({
      timestamp: now,
      ipAddress,
      userAgent,
      success: false
    });

    // Check if account should be locked (3rd attempt)
    if (userAttempts.count >= this.maxAttempts) {
      userAttempts.isLocked = true;
      userAttempts.lockUntil = new Date(now.getTime() + this.lockDuration);
      
      // Trigger security event
      this.triggerSecurityEvent(userId, 'account_locked', {
        attemptCount: userAttempts.count,
        ipAddress,
        userAgent,
        lockUntil: userAttempts.lockUntil
      });

      return {
        success: false,
        isLocked: true,
        lockUntil: userAttempts.lockUntil,
        remainingAttempts: 0,
        showWarning: false,
        message: `Account locked after ${this.maxAttempts} failed attempts. Try again after ${userAttempts.lockUntil.toLocaleString()}`
      };
    }

    // Show warning after 2nd attempt
    const remainingAttempts = this.maxAttempts - userAttempts.count;
    const showWarning = userAttempts.count === 2;

    if (showWarning) {
      this.triggerSecurityEvent(userId, 'login_warning', {
        attemptCount: userAttempts.count,
        remainingAttempts,
        ipAddress,
        userAgent
      });
    }

    return {
      success: false,
      isLocked: false,
      remainingAttempts,
      showWarning,
      attemptCount: userAttempts.count,
      message: showWarning 
        ? `Warning: ${remainingAttempts} attempt(s) remaining before account lock`
        : `Invalid credentials. ${remainingAttempts} attempt(s) remaining`
    };
  }

  /**
   * Check if an account is currently locked
   * @param {string} userId - User identifier
   * @returns {boolean} Whether the account is locked
   */
  isAccountLocked(userId) {
    if (!this.attempts.has(userId)) {
      return false;
    }

    const userAttempts = this.attempts.get(userId);
    
    if (!userAttempts.isLocked || !userAttempts.lockUntil) {
      return false;
    }

    // Check if lock has expired
    if (new Date() > userAttempts.lockUntil) {
      this.resetAttempts(userId);
      return false;
    }

    return true;
  }

  /**
   * Get current attempt status for a user
   * @param {string} userId - User identifier
   * @returns {Object} Current status information
   */
  getAttemptStatus(userId) {
    if (!this.attempts.has(userId)) {
      return {
        count: 0,
        isLocked: false,
        remainingAttempts: this.maxAttempts,
        lockUntil: null
      };
    }

    const userAttempts = this.attempts.get(userId);
    const isLocked = this.isAccountLocked(userId);

    return {
      count: userAttempts.count,
      isLocked,
      remainingAttempts: Math.max(0, this.maxAttempts - userAttempts.count),
      lockUntil: userAttempts.lockUntil,
      lastAttempt: userAttempts.lastAttempt
    };
  }

  /**
   * Reset attempts for a user (called on successful login)
   * @param {string} userId - User identifier
   */
  resetAttempts(userId) {
    if (this.attempts.has(userId)) {
      this.attempts.delete(userId);
    }
  }

  /**
   * Manually unlock an account (admin function)
   * @param {string} userId - User identifier
   * @param {string} adminId - Admin who performed the unlock
   */
  unlockAccount(userId, adminId) {
    if (this.attempts.has(userId)) {
      const userAttempts = this.attempts.get(userId);
      userAttempts.isLocked = false;
      userAttempts.lockUntil = null;
      userAttempts.count = 0;

      this.triggerSecurityEvent(userId, 'account_unlocked', {
        unlockedBy: adminId,
        timestamp: new Date()
      });
    }
  }

  /**
   * Get all locked accounts (admin function)
   * @returns {Array} List of locked accounts
   */
  getLockedAccounts() {
    const lockedAccounts = [];
    
    for (const [userId, attempts] of this.attempts.entries()) {
      if (this.isAccountLocked(userId)) {
        lockedAccounts.push({
          userId,
          lockUntil: attempts.lockUntil,
          attemptCount: attempts.count,
          lastAttempt: attempts.lastAttempt
        });
      }
    }

    return lockedAccounts;
  }

  /**
   * Trigger security event (to be handled by security monitoring)
   * @param {string} userId - User identifier
   * @param {string} eventType - Type of security event
   * @param {Object} details - Event details
   */
  triggerSecurityEvent(userId, eventType, details) {
    // Emit event for security monitoring system
    const event = {
      userId,
      eventType,
      timestamp: new Date(),
      details,
      severity: this.getEventSeverity(eventType)
    };

    // Dispatch custom event for security monitoring
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('securityEvent', { detail: event }));
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', event);
    }
  }

  /**
   * Get severity level for security events
   * @param {string} eventType - Type of event
   * @returns {string} Severity level
   */
  getEventSeverity(eventType) {
    const severityMap = {
      'login_warning': 'medium',
      'account_locked': 'high',
      'account_unlocked': 'low',
      'suspicious_activity': 'critical'
    };

    return severityMap[eventType] || 'low';
  }

  /**
   * Clean up expired locks (maintenance function)
   */
  cleanupExpiredLocks() {
    const now = new Date();
    
    for (const [userId, attempts] of this.attempts.entries()) {
      if (attempts.isLocked && attempts.lockUntil && now > attempts.lockUntil) {
        this.resetAttempts(userId);
      }
    }
  }
}

// Create singleton instance
const loginAttemptTracker = new LoginAttemptTracker();

// Set up periodic cleanup of expired locks
if (typeof window !== 'undefined') {
  setInterval(() => {
    loginAttemptTracker.cleanupExpiredLocks();
  }, 60000); // Clean up every minute
}

export default loginAttemptTracker;