/**
 * SecureLoginForm - Enhanced login form with 3-strike security
 * Integrates security warnings, account locking, and recovery
 */

import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useSecurityLogin } from '../../hooks/useSecurityLogin';
import SecurityWarningPopup from './SecurityWarningPopup';
import AccountRecoveryDialog from './AccountRecoveryDialog';
import './SecureLoginForm.css';

const SecureLoginForm = ({ onLoginSuccess, originalLoginFunction }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const {
    securityState,
    loading,
    secureLogin,
    closeSecurityWarning,
    showRecoveryDialog,
    closeRecoveryDialog,
    handleRecoverySuccess
  } = useSecurityLogin();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await secureLogin(
        formData.email,
        formData.password,
        originalLoginFunction
      );

      if (result.success) {
        onLoginSuccess(result);
      }
    } catch (error) {
      console.error('Login error:', error);
      setFormErrors({
        general: 'An unexpected error occurred. Please try again.'
      });
    }
  };

  const handleRetryLogin = () => {
    closeSecurityWarning();
    // Focus on password field for retry
    setTimeout(() => {
      const passwordField = document.getElementById('password');
      if (passwordField) {
        passwordField.focus();
        passwordField.select();
      }
    }, 100);
  };

  return (
    <>
      <form className="secure-login-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h2>Sign In to Nexus ChatApp</h2>
          <p>Enter your credentials to access your account</p>
        </div>

        {formErrors.general && (
          <div className="error-banner">
            {formErrors.general}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className={formErrors.email ? 'error' : ''}
            placeholder="Enter your email"
            autoComplete="email"
            disabled={loading}
          />
          {formErrors.email && (
            <span className="field-error">{formErrors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-input-container">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              className={formErrors.password ? 'error' : ''}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {formErrors.password && (
            <span className="field-error">{formErrors.password}</span>
          )}
        </div>

        <button
          type="submit"
          className="login-btn"
          disabled={loading || !formData.email || !formData.password}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>

        <div className="form-footer">
          <a href="/forgot-password" className="forgot-link">
            Forgot your password?
          </a>
        </div>
      </form>

      {/* Security Warning Popup */}
      <SecurityWarningPopup
        show={securityState.showWarning}
        type={securityState.warningType}
        title={securityState.warningTitle}
        message={securityState.warningMessage}
        remainingAttempts={securityState.remainingAttempts}
        lockUntil={securityState.lockUntil}
        onClose={closeSecurityWarning}
        onRecovery={showRecoveryDialog}
        onRetry={handleRetryLogin}
      />

      {/* Account Recovery Dialog */}
      <AccountRecoveryDialog
        show={securityState.showRecovery}
        userId={formData.email}
        email={formData.email}
        onClose={closeRecoveryDialog}
        onSuccess={handleRecoverySuccess}
      />
    </>
  );
};

export default SecureLoginForm;