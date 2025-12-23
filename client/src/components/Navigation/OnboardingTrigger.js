import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiArrowRight, FiX } from 'react-icons/fi';
import './OnboardingTrigger.css';

const OnboardingTrigger = () => {
  const { user } = useAuth();
  const { startFlow, savedState } = useNavigation();
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user needs onboarding
    const needsOnboarding = () => {
      if (!user) return false;
      
      // Check if onboarding was completed
      const onboardingCompleted = savedState.onboarding?.completed;
      if (onboardingCompleted) return false;
      
      // Check if user is new (created within last 24 hours)
      const userCreated = new Date(user.createdAt || user.created || Date.now());
      const now = new Date();
      const hoursSinceCreation = (now - userCreated) / (1000 * 60 * 60);
      
      return hoursSinceCreation < 24;
    };

    if (needsOnboarding()) {
      // Show prompt after a short delay
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user, savedState]);

  const handleStartOnboarding = () => {
    setShowPrompt(false);
    startFlow('onboarding');
    navigate('/onboarding/welcome');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Mark as dismissed for this session
    localStorage.setItem('onboarding-dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="onboarding-trigger-overlay">
      <div className="onboarding-trigger-modal">
        <button 
          className="close-btn"
          onClick={handleDismiss}
          title="Dismiss"
        >
          <FiX />
        </button>
        
        <div className="trigger-content">
          <div className="trigger-icon">
            <FiUser />
          </div>
          
          <h3>Welcome to Nexus ChatApp!</h3>
          <p>
            Let's take a few minutes to set up your profile and preferences 
            to get the most out of your messaging experience.
          </p>
          
          <div className="trigger-benefits">
            <div className="benefit-item">
              ✨ Personalize your profile
            </div>
            <div className="benefit-item">
              🎨 Choose your preferred theme
            </div>
            <div className="benefit-item">
              🔔 Configure notifications
            </div>
            <div className="benefit-item">
              🔒 Set privacy preferences
            </div>
          </div>
          
          <div className="trigger-actions">
            <button 
              className="btn btn-outline"
              onClick={handleDismiss}
            >
              Maybe Later
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleStartOnboarding}
            >
              Get Started
              <FiArrowRight />
            </button>
          </div>
          
          <p className="trigger-note">
            This will only take about 2 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTrigger;