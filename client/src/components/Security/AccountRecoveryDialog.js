/**
 * AccountRecoveryDialog - Dialog for account recovery process
 * Handles recovery token generation and verification
 */

import React, { useState } from 'react';
import accountLockManager from '../../services/AccountLockManager';
import './AccountRecoveryDialog.css';

const AccountRecoveryDialog = ({ show, userId, email, onClose, onSuccess }) => {
  const [step, setStep] = useState('request'); // 'request', 'verify', 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [tokenInput, setTokenInput] = useState('');

  const handleRequestRecovery = async () => {
    if (!email) {
      setError('Email is required for account recovery.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await accountLockManager.generateRecoveryToken(userId, email);
      
      if (result.success) {
        setRecoveryToken(result.token);
        setStep('verify');
      } else {
        setError(result.message || 'Failed to generate recovery token.');
      }
    } catch (err) {
      setError('An error occurred while requesting recovery. Please try again.');
      console.error('Recovery request error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    if (!tokenInput.trim()) {
      setError('Please enter the recovery token.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await accountLockManager.verifyRecoveryToken(userId, tokenInput.trim());
      
      if (result.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      } else {
        setError(result.message || 'Invalid recovery token.');
      }
    } catch (err) {
      setError('An error occurred while verifying the token. Please try again.');
      console.error('Token verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('request');
    setError('');
    setRecoveryToken('');
    setTokenInput('');
    setLoading(false);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="recovery-dialog-overlay" onClick={handleClose}>
      <div className="recovery-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3>Account Recovery</h3>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="dialog-content">
          {step === 'request' && (
            <div className="recovery-step">
              <div className="step-icon">🔓</div>
              <h4>Request Account Recovery</h4>
              <p>
                Your account is temporarily locked due to multiple failed login attempts. 
                We can send you a recovery token to unlock your account.
              </p>
              
              <div className="email-display">
                <label>Recovery will be sent to:</label>
                <div className="email-value">{email}</div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="step-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleRequestRecovery}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Recovery Token'}
                </button>
                <button className="btn btn-secondary" onClick={handleClose}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === 'verify' && (
            <div className="recovery-step">
              <div className="step-icon">📧</div>
              <h4>Enter Recovery Token</h4>
              <p>
                A recovery token has been generated. In a production environment, 
                this would be sent to your email address.
              </p>

              {/* Development mode - show token */}
              {process.env.NODE_ENV === 'development' && recoveryToken && (
                <div className="dev-token-display">
                  <strong>Development Token:</strong> {recoveryToken}
                </div>
              )}

              <div className="token-input-group">
                <label htmlFor="recovery-token">Recovery Token:</label>
                <input
                  id="recovery-token"
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Enter recovery token"
                  className="token-input"
                  autoComplete="off"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="step-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleVerifyToken}
                  disabled={loading || !tokenInput.trim()}
                >
                  {loading ? 'Verifying...' : 'Unlock Account'}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setStep('request')}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="recovery-step">
              <div className="step-icon success">✅</div>
              <h4>Account Unlocked</h4>
              <p>
                Your account has been successfully unlocked. You can now log in normally.
              </p>
              
              <div className="success-message">
                Redirecting to login...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountRecoveryDialog;