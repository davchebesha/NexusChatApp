import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiArrowRight, FiUsers, FiMessageSquare } from 'react-icons/fi';
import Logo from '../Common/Logo';
import './Onboarding.css';

const OnboardingComplete = () => {
  const { completeFlow } = useNavigation();
  const navigate = useNavigate();

  const handleComplete = () => {
    completeFlow({ onboardingCompleted: true });
    navigate('/chat');
  };

  const handleStartChat = () => {
    completeFlow({ onboardingCompleted: true, startNewChat: true });
    navigate('/chat');
  };

  return (
    <div className="onboarding-complete">
      <div className="onboarding-container">
        <div className="completion-content">
          <div className="success-icon">
            <FiCheck />
          </div>
          
          <Logo size="lg" showText={true} />
          
          <h2>You're All Set!</h2>
          <p className="completion-message">
            Welcome to Nexus ChatApp! Your account has been configured and you're ready to start connecting with others.
          </p>

          <div className="completion-summary">
            <div className="summary-item">
              <FiCheck className="check-icon" />
              <span>Profile setup complete</span>
            </div>
            <div className="summary-item">
              <FiCheck className="check-icon" />
              <span>Preferences configured</span>
            </div>
            <div className="summary-item">
              <FiCheck className="check-icon" />
              <span>Security settings applied</span>
            </div>
          </div>

          <div className="next-steps">
            <h3>What's Next?</h3>
            <div className="next-steps-grid">
              <div className="next-step-card">
                <FiUsers />
                <h4>Find Friends</h4>
                <p>Search for friends and start conversations</p>
              </div>
              <div className="next-step-card">
                <FiMessageSquare />
                <h4>Create Groups</h4>
                <p>Set up group chats for teams and communities</p>
              </div>
            </div>
          </div>

          <div className="completion-actions">
            <button 
              className="btn btn-primary btn-large"
              onClick={handleComplete}
            >
              Go to Chat
              <FiArrowRight />
            </button>
            <button 
              className="btn btn-outline"
              onClick={handleStartChat}
            >
              <FiUsers />
              Start New Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingComplete;