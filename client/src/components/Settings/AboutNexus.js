import React from 'react';
import { FiCheck, FiHeart } from 'react-icons/fi';
import Logo from '../Common/Logo';
import './AboutNexus.css';

const AboutNexus = () => {
  const features = [
    { name: 'Professional Branding', status: 'completed' },
    { name: 'Landing Page with Footer', status: 'completed' },
    { name: 'Logo & Favicon', status: 'completed' },
    { name: 'Theme Customization', status: 'completed' },
    { name: 'Password Visibility Toggle', status: 'completed' },
    { name: 'Enhanced Authentication UI', status: 'completed' },
    { name: 'Settings Management', status: 'completed' },
    { name: 'Profile Management', status: 'completed' },
    { name: 'Notification System', status: 'completed' },
    { name: 'Responsive Design', status: 'completed' },
    { name: 'CSS Variables Theming', status: 'completed' },
    { name: 'Admin Dashboard', status: 'completed' },
    { name: '3-Strike Security Rule', status: 'completed' },
    { name: 'Voice Recording', status: 'completed' },
    { name: 'Cross-Device Sync', status: 'completed' },
    { name: 'Dual-Sidebar Layout', status: 'planned' },
    { name: 'Linear Navigation', status: 'planned' },
    { name: 'Google Drive Integration', status: 'planned' }
  ];

  const completedFeatures = features.filter(f => f.status === 'completed').length;
  const totalFeatures = features.length;
  const progressPercentage = Math.round((completedFeatures / totalFeatures) * 100);

  return (
    <div className="about-nexus">
      <div className="about-header">
        <Logo size="lg" />
        <div className="about-info">
          <h2>Nexus ChatApp</h2>
          <p>Professional messaging platform with advanced features</p>
          <div className="version-info">
            <span className="version">Version 2.0.0</span>
            <span className="build">Build: Transformation Phase</span>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <h3>Transformation Progress</h3>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="progress-stats">
          <span>{completedFeatures} of {totalFeatures} features completed</span>
          <span className="progress-percentage">{progressPercentage}%</span>
        </div>
      </div>

      <div className="features-section">
        <h3>Feature Status</h3>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className={`feature-item ${feature.status}`}>
              <div className="feature-status-icon">
                {feature.status === 'completed' ? (
                  <FiCheck className="completed-icon" />
                ) : (
                  <div className="planned-dot"></div>
                )}
              </div>
              <span className="feature-name">{feature.name}</span>
              <span className={`feature-badge ${feature.status}`}>
                {feature.status === 'completed' ? 'Done' : 'Planned'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="about-footer">
        <div className="footer-section">
          <h4>What's New</h4>
          <ul>
            <li>✨ Complete visual rebrand to "Nexus ChatApp"</li>
            <li>🎨 5 beautiful themes with custom backgrounds</li>
            <li>🔐 Enhanced authentication with password visibility</li>
            <li>⚙️ Comprehensive settings management</li>
            <li>👤 Advanced profile customization</li>
            <li>🔔 Smart notification system</li>
            <li>📱 Fully responsive design</li>
            <li>📋 Admin dashboard for user management</li>
            <li>🔒 3-strike security system with account locking</li>
            <li>🎤 Voice message recording and playback</li>
            <li>🔄 Cross-device voice synchronization</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Coming Soon</h4>
          <ul>
            <li>☁️ Google Drive file integration</li>
            <li>📐 Telegram-style dual sidebar layout</li>
            <li>🧭 Linear navigation system</li>
            <li>📊 Enhanced system monitoring</li>
            <li>🔧 Advanced admin controls</li>
          </ul>
        </div>
      </div>

      <div className="credits">
        <div className="credits-content">
          <FiHeart className="heart-icon" />
          <p>Built with passion for modern communication</p>
          <div className="tech-stack">
            <span>React</span>
            <span>Node.js</span>
            <span>MongoDB</span>
            <span>Socket.io</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutNexus;