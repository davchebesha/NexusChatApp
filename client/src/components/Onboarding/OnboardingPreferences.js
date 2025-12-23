import React, { useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FiMoon, FiSun, FiBell, FiShield, FiGlobe } from 'react-icons/fi';
import './Onboarding.css';

const OnboardingPreferences = () => {
  const { nextStep, previousStep } = useNavigation();
  const { themes, setTheme, currentTheme } = useTheme();
  
  const [preferences, setPreferences] = useState({
    theme: currentTheme,
    notifications: true,
    privacy: 'friends',
    language: 'en'
  });

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    
    if (key === 'theme') {
      setTheme(value);
    }
  };

  const handleNext = () => {
    nextStep({ preferences });
  };

  const handleBack = () => {
    previousStep();
  };

  return (
    <div className="onboarding-preferences">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h2>Customize Your Experience</h2>
          <p>Set your preferences to make Nexus ChatApp yours</p>
        </div>

        <div className="preferences-form">
          {/* Theme Selection */}
          <div className="preference-section">
            <div className="section-header">
              <FiSun />
              <h3>Theme</h3>
            </div>
            <div className="theme-options">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  className={`theme-option ${preferences.theme === key ? 'selected' : ''}`}
                  onClick={() => handlePreferenceChange('theme', key)}
                >
                  <div 
                    className="theme-preview"
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` 
                    }}
                  />
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="preference-section">
            <div className="section-header">
              <FiBell />
              <h3>Notifications</h3>
            </div>
            <div className="toggle-option">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={preferences.notifications}
                  onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                Enable push notifications
              </label>
              <p className="option-description">
                Get notified about new messages and important updates
              </p>
            </div>
          </div>

          {/* Privacy */}
          <div className="preference-section">
            <div className="section-header">
              <FiShield />
              <h3>Privacy</h3>
            </div>
            <div className="radio-options">
              <label className="radio-option">
                <input
                  type="radio"
                  name="privacy"
                  value="everyone"
                  checked={preferences.privacy === 'everyone'}
                  onChange={(e) => handlePreferenceChange('privacy', e.target.value)}
                />
                <span className="radio-custom"></span>
                <div className="option-content">
                  <strong>Everyone</strong>
                  <span>Anyone can find and message you</span>
                </div>
              </label>
              
              <label className="radio-option">
                <input
                  type="radio"
                  name="privacy"
                  value="friends"
                  checked={preferences.privacy === 'friends'}
                  onChange={(e) => handlePreferenceChange('privacy', e.target.value)}
                />
                <span className="radio-custom"></span>
                <div className="option-content">
                  <strong>Friends Only</strong>
                  <span>Only your contacts can message you</span>
                </div>
              </label>
              
              <label className="radio-option">
                <input
                  type="radio"
                  name="privacy"
                  value="private"
                  checked={preferences.privacy === 'private'}
                  onChange={(e) => handlePreferenceChange('privacy', e.target.value)}
                />
                <span className="radio-custom"></span>
                <div className="option-content">
                  <strong>Private</strong>
                  <span>You control who can find and message you</span>
                </div>
              </label>
            </div>
          </div>

          {/* Language */}
          <div className="preference-section">
            <div className="section-header">
              <FiGlobe />
              <h3>Language</h3>
            </div>
            <select
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              className="language-select"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="pt">Português</option>
            </select>
          </div>
        </div>

        <div className="onboarding-actions">
          <button 
            className="btn btn-outline"
            onClick={handleBack}
          >
            Back
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleNext}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPreferences;