/**
 * SecurityWarningPopup - Professional popup for security warnings
 * Displays warnings after 2nd failed login attempt and account lock notifications
 */

import React, { useState, useEffect } from 'react';
import './SecurityWarningPopup.css';

const SecurityWarningPopup = ({ 
  show, 
  type, 
  title, 
  message, 
  remainingAttempts, 
  lockUntil,
  onClose, 
  onRecovery,
  onRetry 
}) => {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (show && lockUntil && type === 'locked') {
      const updateTimer = () => {
        const now = new Date();
        const remaining = lockUntil - now;
        
        if (remaining <= 0) {
          setTimeRemaining('Account unlocked');
          setTimeout(() => {
            onClose();
          }, 2000);
          return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [show, lockUntil, type, onClose]);

  if (!show) return null;

  const getPopupConfig = () => {
    switch (type) {
      case 'warning':
        return {
          icon: '⚠️',
          className: 'security-popup warning',
          primaryAction: 'Try Again',
          secondaryAction: 'Cancel'
        };
      case 'locked':
        return {
          icon: '🔒',
          className: 'security-popup locked',
          primaryAction: 'Request Recovery',
          secondaryAction: 'Close'
        };
      case 'critical':
        return {
          icon: '🚨',
          className: 'security-popup critical',
          primaryAction: 'Contact Support',
          secondaryAction: 'Close'
        };
      default:
        return {
          icon: 'ℹ️',
          className: 'security-popup info',
          primaryAction: 'OK',
          secondaryAction: null
        };
    }
  };

  const config = getPopupConfig();

  const handlePrimaryAction = () => {
    switch (type) {
      case 'warning':
        if (onRetry) onRetry();
        break;
      case 'locked':
        if (onRecovery) onRecovery();
        break;
      case 'critical':
        // Open support contact
        window.open('mailto:security@nexuschatapp.com', '_blank');
        break;
      default:
        onClose();
    }
  };

  return (
    <div className="security-popup-overlay" onClick={onClose}>
      <div className={config.className} onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <div className="popup-icon">{config.icon}</div>
          <h3 className="popup-title">{title}</h3>
        </div>

        <div className="popup-content">
          <p className="popup-message">{message}</p>
          
          {type === 'warning' && remainingAttempts !== undefined && (
            <div className="warning-details">
              <div className="attempts-remaining">
                <strong>{remainingAttempts}</strong> attempt{remainingAttempts !== 1 ? 's' : ''} remaining
              </div>
              <div className="warning-note">
                Your account will be temporarily locked after 3 failed attempts.
              </div>
            </div>
          )}

          {type === 'locked' && (
            <div className="lock-details">
              {timeRemaining && (
                <div className="lock-timer">
                  <span className="timer-label">Time remaining:</span>
                  <span className="timer-value">{timeRemaining}</span>
                </div>
              )}
              <div className="recovery-note">
                You can request account recovery or wait for the lock to expire.
              </div>
            </div>
          )}

          {type === 'critical' && (
            <div className="critical-details">
              <div className="security-notice">
                Multiple suspicious login attempts detected. For your security, 
                please contact our support team immediately.
              </div>
            </div>
          )}
        </div>

        <div className="popup-actions">
          <button 
            className="btn btn-primary"
            onClick={handlePrimaryAction}
          >
            {config.primaryAction}
          </button>
          
          {config.secondaryAction && (
            <button 
              className="btn btn-secondary"
              onClick={onClose}
            >
              {config.secondaryAction}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityWarningPopup;