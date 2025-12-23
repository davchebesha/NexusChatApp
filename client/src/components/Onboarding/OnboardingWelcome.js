import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useAuth } from '../../contexts/AuthContext';
import { FiArrowRight, FiUsers, FiShield, FiZap, FiGlobe } from 'react-icons/fi';
import Logo from '../Common/Logo';
import './Onboarding.css';

const OnboardingWelcome = () => {
  const { nextStep } = useNavigation();
  const { user } = useAuth();

  const handleGetStarted = () => {
    nextStep({ welcomeCompleted: true });
  };

  return (
    <div className="onboarding-welcome">
      <div className="welcome-container">
        <div className="welcome-header">
          <Logo size="xl" showText={true} />
          <h1>Welcome to Nexus ChatApp, {user?.username}!</h1>
          <p className="welcome-subtitle">
            Let's get you set up with the most advanced messaging platform
          </p>
        </div>

        <div className="welcome-features">
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FiShield />
              </div>
              <h3>End-to-End Encryption</h3>
              <p>Your messages are secured with military-grade encryption</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FiZap />
              </div>
              <h3>Real-time Messaging</h3>
              <p>Instant delivery with read receipts and typing indicators</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FiUsers />
              </div>
              <h3>Group Conversations</h3>
              <p>Create groups with up to 1000 members and advanced admin controls</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FiGlobe />
              </div>
              <h3>Cross-Platform Sync</h3>
              <p>Access your chats seamlessly across all your devices</p>
            </div>
          </div>
        </div>

        <div className="welcome-actions">
          <button 
            className="btn btn-primary btn-large"
            onClick={handleGetStarted}
          >
            Get Started
            <FiArrowRight />
          </button>
          <p className="setup-info">
            This will take about 2 minutes to complete
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWelcome;