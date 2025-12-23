import React, { useState } from 'react';
import { 
  FiBell, FiMail, FiSmartphone, FiVolume2, FiVolumeX, 
  FiToggleLeft, FiToggleRight, FiClock, FiUsers, FiMessageSquare,
  FiSettings, FiMoon, FiSun
} from 'react-icons/fi';
import { useNotification } from '../../contexts/NotificationContext';
import './NotificationSettings.css';

const NotificationSettings = () => {
  const { showNotification } = useNotification();
  const [settings, setSettings] = useState({
    // General Notifications
    enableNotifications: true,
    enableSounds: true,
    enableVibration: true,
    enableDesktop: true,
    
    // Message Notifications
    messageNotifications: true,
    groupMessageNotifications: true,
    mentionNotifications: true,
    replyNotifications: true,
    
    // Email Notifications
    emailDigest: true,
    emailMentions: true,
    emailSummary: 'daily', // daily, weekly, never
    
    // Do Not Disturb
    doNotDisturb: false,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    
    // Advanced Settings
    notificationPreview: true,
    showSenderName: true,
    groupNotifications: true,
    notificationSound: 'default',
    customSounds: false
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    showNotification(`${setting} ${!settings[setting] ? 'enabled' : 'disabled'}`, 'success');
  };

  const handleSelectChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const ToggleSwitch = ({ enabled, onToggle, label, description }) => (
    <div className="toggle-item">
      <div className="toggle-info">
        <div className="toggle-label">{label}</div>
        {description && <div className="toggle-description">{description}</div>}
      </div>
      <button 
        className={`toggle-switch ${enabled ? 'enabled' : 'disabled'}`}
        onClick={onToggle}
      >
        {enabled ? <FiToggleRight /> : <FiToggleLeft />}
      </button>
    </div>
  );

  const soundOptions = [
    { value: 'default', label: 'Default' },
    { value: 'chime', label: 'Chime' },
    { value: 'bell', label: 'Bell' },
    { value: 'pop', label: 'Pop' },
    { value: 'whistle', label: 'Whistle' },
    { value: 'none', label: 'None' }
  ];

  return (
    <div className="notification-settings">
      <div className="settings-header">
        <h2>Notification Settings</h2>
        <p>Customize how and when you receive notifications</p>
      </div>

      <div className="settings-sections">
        {/* General Notifications */}
        <div className="settings-section">
          <div className="section-header">
            <FiBell className="section-icon" />
            <h3>General Notifications</h3>
          </div>
          
          <div className="section-content">
            <ToggleSwitch
              enabled={settings.enableNotifications}
              onToggle={() => handleToggle('enableNotifications')}
              label="Enable Notifications"
              description="Receive notifications for messages and activities"
            />
            
            <ToggleSwitch
              enabled={settings.enableSounds}
              onToggle={() => handleToggle('enableSounds')}
              label="Notification Sounds"
              description="Play sounds when receiving notifications"
            />
            
            <ToggleSwitch
              enabled={settings.enableVibration}
              onToggle={() => handleToggle('enableVibration')}
              label="Vibration"
              description="Vibrate device for notifications (mobile only)"
            />
            
            <ToggleSwitch
              enabled={settings.enableDesktop}
              onToggle={() => handleToggle('enableDesktop')}
              label="Desktop Notifications"
              description="Show notifications on desktop when app is minimized"
            />
          </div>
        </div>

        {/* Message Notifications */}
        <div className="settings-section">
          <div className="section-header">
            <FiMessageSquare className="section-icon" />
            <h3>Message Notifications</h3>
          </div>
          
          <div className="section-content">
            <ToggleSwitch
              enabled={settings.messageNotifications}
              onToggle={() => handleToggle('messageNotifications')}
              label="Direct Messages"
              description="Notifications for private messages"
            />
            
            <ToggleSwitch
              enabled={settings.groupMessageNotifications}
              onToggle={() => handleToggle('groupMessageNotifications')}
              label="Group Messages"
              description="Notifications for group chat messages"
            />
            
            <ToggleSwitch
              enabled={settings.mentionNotifications}
              onToggle={() => handleToggle('mentionNotifications')}
              label="Mentions"
              description="Notifications when you're mentioned in a message"
            />
            
            <ToggleSwitch
              enabled={settings.replyNotifications}
              onToggle={() => handleToggle('replyNotifications')}
              label="Replies"
              description="Notifications for replies to your messages"
            />
          </div>
        </div>

        {/* Email Notifications */}
        <div className="settings-section">
          <div className="section-header">
            <FiMail className="section-icon" />
            <h3>Email Notifications</h3>
          </div>
          
          <div className="section-content">
            <ToggleSwitch
              enabled={settings.emailDigest}
              onToggle={() => handleToggle('emailDigest')}
              label="Email Digest"
              description="Receive email summaries of your activity"
            />
            
            <ToggleSwitch
              enabled={settings.emailMentions}
              onToggle={() => handleToggle('emailMentions')}
              label="Email for Mentions"
              description="Send email when you're mentioned"
            />
            
            <div className="form-group">
              <label>Email Summary Frequency</label>
              <select
                value={settings.emailSummary}
                onChange={(e) => handleSelectChange('emailSummary', e.target.value)}
                className="settings-select"
              >
                <option value="never">Never</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Do Not Disturb */}
        <div className="settings-section">
          <div className="section-header">
            <FiMoon className="section-icon" />
            <h3>Do Not Disturb</h3>
          </div>
          
          <div className="section-content">
            <ToggleSwitch
              enabled={settings.doNotDisturb}
              onToggle={() => handleToggle('doNotDisturb')}
              label="Do Not Disturb"
              description="Temporarily disable all notifications"
            />
            
            <ToggleSwitch
              enabled={settings.quietHoursEnabled}
              onToggle={() => handleToggle('quietHoursEnabled')}
              label="Quiet Hours"
              description="Automatically enable do not disturb during specific hours"
            />
            
            {settings.quietHoursEnabled && (
              <div className="quiet-hours-config">
                <div className="time-inputs">
                  <div className="time-input-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={settings.quietHoursStart}
                      onChange={(e) => handleSelectChange('quietHoursStart', e.target.value)}
                      className="time-input"
                    />
                  </div>
                  <div className="time-input-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={settings.quietHoursEnd}
                      onChange={(e) => handleSelectChange('quietHoursEnd', e.target.value)}
                      className="time-input"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="settings-section">
          <div className="section-header">
            <FiSettings className="section-icon" />
            <h3>Advanced Settings</h3>
          </div>
          
          <div className="section-content">
            <ToggleSwitch
              enabled={settings.notificationPreview}
              onToggle={() => handleToggle('notificationPreview')}
              label="Message Preview"
              description="Show message content in notifications"
            />
            
            <ToggleSwitch
              enabled={settings.showSenderName}
              onToggle={() => handleToggle('showSenderName')}
              label="Show Sender Name"
              description="Display sender name in notifications"
            />
            
            <ToggleSwitch
              enabled={settings.groupNotifications}
              onToggle={() => handleToggle('groupNotifications')}
              label="Group Similar Notifications"
              description="Combine multiple notifications from the same chat"
            />
            
            <div className="form-group">
              <label>Notification Sound</label>
              <select
                value={settings.notificationSound}
                onChange={(e) => handleSelectChange('notificationSound', e.target.value)}
                className="settings-select"
              >
                {soundOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <ToggleSwitch
              enabled={settings.customSounds}
              onToggle={() => handleToggle('customSounds')}
              label="Custom Sounds per Chat"
              description="Allow different notification sounds for each chat"
            />
          </div>
        </div>

        {/* Test Notifications */}
        <div className="settings-section">
          <div className="section-header">
            <FiSmartphone className="section-icon" />
            <h3>Test Notifications</h3>
          </div>
          
          <div className="section-content">
            <div className="test-buttons">
              <button 
                className="test-btn"
                onClick={() => showNotification('This is a test notification!', 'info')}
              >
                Test Notification
              </button>
              <button 
                className="test-btn"
                onClick={() => showNotification('Test message notification', 'message')}
              >
                Test Message
              </button>
              <button 
                className="test-btn"
                onClick={() => showNotification('Test mention notification', 'mention')}
              >
                Test Mention
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;