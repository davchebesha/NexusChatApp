import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { 
  FiSettings, 
  FiSave, 
  FiRefreshCw,
  FiShield,
  FiMail,
  FiDatabase,
  FiServer
} from 'react-icons/fi';
import './AdminSettings.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Nexus ChatApp',
      siteDescription: 'Professional messaging platform',
      maintenanceMode: false,
      registrationEnabled: true,
      maxUsersPerGroup: 100
    },
    security: {
      maxLoginAttempts: 3,
      lockoutDuration: 15,
      passwordMinLength: 8,
      requireSpecialChars: true,
      sessionTimeout: 24
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@nexuschatapp.com',
      emailEnabled: false
    },
    database: {
      connectionPoolSize: 10,
      queryTimeout: 30,
      backupEnabled: true,
      backupInterval: 24
    }
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      setSettings({
        general: {
          siteName: 'Nexus ChatApp',
          siteDescription: 'Professional messaging platform',
          maintenanceMode: false,
          registrationEnabled: true,
          maxUsersPerGroup: 100
        },
        security: {
          maxLoginAttempts: 3,
          lockoutDuration: 15,
          passwordMinLength: 8,
          requireSpecialChars: true,
          sessionTimeout: 24
        },
        email: {
          smtpHost: '',
          smtpPort: 587,
          smtpUser: '',
          smtpPassword: '',
          fromEmail: 'noreply@nexuschatapp.com',
          emailEnabled: false
        },
        database: {
          connectionPoolSize: 10,
          queryTimeout: 30,
          backupEnabled: true,
          backupInterval: 24
        }
      });
      toast.info('Settings reset to default values');
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'email', label: 'Email', icon: FiMail },
    { id: 'database', label: 'Database', icon: FiDatabase }
  ];

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <h2>Admin Settings</h2>
        <p>Configure system-wide settings and preferences</p>
      </div>

      <div className="settings-container">
        {/* Settings Tabs */}
        <div className="settings-tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="tab-icon" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>General Settings</h3>
              
              <div className="form-group">
                <label>Site Name</label>
                <input
                  type="text"
                  value={settings.general.siteName}
                  onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Site Description</label>
                <textarea
                  value={settings.general.siteDescription}
                  onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Max Users per Group</label>
                <input
                  type="number"
                  value={settings.general.maxUsersPerGroup}
                  onChange={(e) => handleInputChange('general', 'maxUsersPerGroup', parseInt(e.target.value))}
                  className="form-input"
                  min="1"
                  max="1000"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.general.maintenanceMode}
                    onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
                  />
                  <span>Maintenance Mode</span>
                </label>
                <small>When enabled, only admins can access the application</small>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.general.registrationEnabled}
                    onChange={(e) => handleInputChange('general', 'registrationEnabled', e.target.checked)}
                  />
                  <span>Allow New Registrations</span>
                </label>
                <small>Allow new users to register accounts</small>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h3>Security Settings</h3>
              
              <div className="form-group">
                <label>Max Login Attempts</label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  className="form-input"
                  min="1"
                  max="10"
                />
                <small>Number of failed attempts before account lockout</small>
              </div>

              <div className="form-group">
                <label>Lockout Duration (minutes)</label>
                <input
                  type="number"
                  value={settings.security.lockoutDuration}
                  onChange={(e) => handleInputChange('security', 'lockoutDuration', parseInt(e.target.value))}
                  className="form-input"
                  min="1"
                  max="1440"
                />
                <small>How long accounts remain locked after max attempts</small>
              </div>

              <div className="form-group">
                <label>Minimum Password Length</label>
                <input
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  className="form-input"
                  min="4"
                  max="50"
                />
              </div>

              <div className="form-group">
                <label>Session Timeout (hours)</label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="form-input"
                  min="1"
                  max="168"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.security.requireSpecialChars}
                    onChange={(e) => handleInputChange('security', 'requireSpecialChars', e.target.checked)}
                  />
                  <span>Require Special Characters in Passwords</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="settings-section">
              <h3>Email Settings</h3>
              
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.email.emailEnabled}
                    onChange={(e) => handleInputChange('email', 'emailEnabled', e.target.checked)}
                  />
                  <span>Enable Email Notifications</span>
                </label>
              </div>

              <div className="form-group">
                <label>SMTP Host</label>
                <input
                  type="text"
                  value={settings.email.smtpHost}
                  onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
                  className="form-input"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="form-group">
                <label>SMTP Port</label>
                <input
                  type="number"
                  value={settings.email.smtpPort}
                  onChange={(e) => handleInputChange('email', 'smtpPort', parseInt(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>SMTP Username</label>
                <input
                  type="text"
                  value={settings.email.smtpUser}
                  onChange={(e) => handleInputChange('email', 'smtpUser', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>SMTP Password</label>
                <input
                  type="password"
                  value={settings.email.smtpPassword}
                  onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>From Email Address</label>
                <input
                  type="email"
                  value={settings.email.fromEmail}
                  onChange={(e) => handleInputChange('email', 'fromEmail', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="settings-section">
              <h3>Database Settings</h3>
              
              <div className="form-group">
                <label>Connection Pool Size</label>
                <input
                  type="number"
                  value={settings.database.connectionPoolSize}
                  onChange={(e) => handleInputChange('database', 'connectionPoolSize', parseInt(e.target.value))}
                  className="form-input"
                  min="1"
                  max="100"
                />
                <small>Maximum number of concurrent database connections</small>
              </div>

              <div className="form-group">
                <label>Query Timeout (seconds)</label>
                <input
                  type="number"
                  value={settings.database.queryTimeout}
                  onChange={(e) => handleInputChange('database', 'queryTimeout', parseInt(e.target.value))}
                  className="form-input"
                  min="1"
                  max="300"
                />
              </div>

              <div className="form-group">
                <label>Backup Interval (hours)</label>
                <input
                  type="number"
                  value={settings.database.backupInterval}
                  onChange={(e) => handleInputChange('database', 'backupInterval', parseInt(e.target.value))}
                  className="form-input"
                  min="1"
                  max="168"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.database.backupEnabled}
                    onChange={(e) => handleInputChange('database', 'backupEnabled', e.target.checked)}
                  />
                  <span>Enable Automatic Backups</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="settings-actions">
        <button
          className="btn btn-secondary"
          onClick={handleResetSettings}
          disabled={loading}
        >
          <FiRefreshCw className="btn-icon" />
          Reset to Defaults
        </button>
        
        <button
          className="btn btn-primary"
          onClick={handleSaveSettings}
          disabled={loading}
        >
          <FiSave className="btn-icon" />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;