/**
 * useSecurityLogin - Hook for secure login with 3-strike rule
 * Integrates LoginAttemptTracker and SecurityWarningPopup
 */

import { useState, useCallback } from 'react';
import loginAttemptTracker from '../services/LoginAttemptTracker';
import accountLockManager from '../services/AccountLockManager';

export const useSecurityLogin = () => {
  const [securityState, setSecurityState] = useState({
    showWarning: false,
    showRecovery: false,
    warningType: null,
    warningTitle: '',
    warningMessage: '',
    remainingAttempts: 3,
    lockUntil: null,
    isLocked: false
  });

  const [loading, setLoading] = useState(false);

  /**
   * Perform secure login with 3-strike tracking
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Function} loginFunction - Actual login function to call
   * @returns {Object} Login result
   */
  const secureLogin = useCallback(async (email, password, loginFunction) => {
    setLoading(true);

    try {
      // Check if account is locked before attempting login
      const lockStatus = accountLockManager.checkLockStatus(email);
      
      if (lockStatus.isLocked) {
        setSecurityState({
          showWarning: true,
          showRecovery: false,
          warningType: 'locked',
          warningTitle: 'Account Locked',
          warningMessage: lockStatus.message,
          remainingAttempts: 0,
          lockUntil: lockStatus.lockUntil,
          isLocked: true
        });

        return {
          success: false,
          message: lockStatus.message,
          isLocked: true
        };
      }

      // Attempt login
      const loginResult = await loginFunction(email, password);
      
      // Get client info for tracking
      const clientInfo = {
        ipAddress: await getClientIP(),
        userAgent: navigator.userAgent
      };

      // Record the attempt
      const attemptResult = loginAttemptTracker.recordAttempt(
        email,
        loginResult.success,
        clientInfo.ipAddress,
        clientInfo.userAgent
      );

      if (loginResult.success) {
        // Successful login - clear any security state
        setSecurityState({
          showWarning: false,
          showRecovery: false,
          warningType: null,
          warningTitle: '',
          warningMessage: '',
          remainingAttempts: 3,
          lockUntil: null,
          isLocked: false
        });

        return loginResult;
      }

      // Failed login - handle security warnings
      if (attemptResult.isLocked) {
        setSecurityState({
          showWarning: true,
          showRecovery: false,
          warningType: 'locked',
          warningTitle: 'Account Locked',
          warningMessage: attemptResult.message,
          remainingAttempts: 0,
          lockUntil: attemptResult.lockUntil,
          isLocked: true
        });
      } else if (attemptResult.showWarning) {
        setSecurityState({
          showWarning: true,
          showRecovery: false,
          warningType: 'warning',
          warningTitle: 'Login Warning',
          warningMessage: attemptResult.message,
          remainingAttempts: attemptResult.remainingAttempts,
          lockUntil: null,
          isLocked: false
        });
      }

      return {
        success: false,
        message: attemptResult.message,
        remainingAttempts: attemptResult.remainingAttempts,
        isLocked: attemptResult.isLocked
      };

    } catch (error) {
      console.error('Secure login error:', error);
      return {
        success: false,
        message: 'An error occurred during login. Please try again.',
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Close security warning popup
   */
  const closeSecurityWarning = useCallback(() => {
    setSecurityState(prev => ({
      ...prev,
      showWarning: false
    }));
  }, []);

  /**
   * Show recovery dialog
   */
  const showRecoveryDialog = useCallback(() => {
    setSecurityState(prev => ({
      ...prev,
      showWarning: false,
      showRecovery: true
    }));
  }, []);

  /**
   * Close recovery dialog
   */
  const closeRecoveryDialog = useCallback(() => {
    setSecurityState(prev => ({
      ...prev,
      showRecovery: false
    }));
  }, []);

  /**
   * Handle successful recovery
   */
  const handleRecoverySuccess = useCallback(() => {
    setSecurityState({
      showWarning: false,
      showRecovery: false,
      warningType: null,
      warningTitle: '',
      warningMessage: '',
      remainingAttempts: 3,
      lockUntil: null,
      isLocked: false
    });
  }, []);

  /**
   * Get current security status for a user
   * @param {string} email - User email
   * @returns {Object} Security status
   */
  const getSecurityStatus = useCallback((email) => {
    return loginAttemptTracker.getAttemptStatus(email);
  }, []);

  /**
   * Check if account is locked
   * @param {string} email - User email
   * @returns {Object} Lock status
   */
  const checkLockStatus = useCallback((email) => {
    return accountLockManager.checkLockStatus(email);
  }, []);

  return {
    securityState,
    loading,
    secureLogin,
    closeSecurityWarning,
    showRecoveryDialog,
    closeRecoveryDialog,
    handleRecoverySuccess,
    getSecurityStatus,
    checkLockStatus
  };
};

/**
 * Get client IP address (simplified for demo)
 * In production, this would be handled server-side
 */
async function getClientIP() {
  try {
    // In production, get IP from server or use a service
    // For demo purposes, return a placeholder
    return '127.0.0.1';
  } catch (error) {
    return 'unknown';
  }
}

export default useSecurityLogin;