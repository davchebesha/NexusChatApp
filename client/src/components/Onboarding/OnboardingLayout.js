import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useNavigation } from '../../contexts/NavigationContext';
import NavigationProgress from '../Navigation/NavigationProgress';
import OnboardingWelcome from './OnboardingWelcome';
import OnboardingProfile from './OnboardingProfile';
import OnboardingPreferences from './OnboardingPreferences';
import OnboardingComplete from './OnboardingComplete';
import './Onboarding.css';

const OnboardingLayout = () => {
  const { startFlow, isLinearMode, currentFlow } = useNavigation();

  useEffect(() => {
    // Start onboarding flow if not already in linear mode
    if (!isLinearMode || currentFlow !== 'onboarding') {
      startFlow('onboarding');
    }
  }, [startFlow, isLinearMode, currentFlow]);

  return (
    <div className="onboarding-layout">
      {/* Navigation Progress Bar */}
      {isLinearMode && currentFlow === 'onboarding' && (
        <div className="onboarding-progress">
          <NavigationProgress 
            showControls={false}
            showProgress={true}
            showSteps={true}
            className="onboarding-nav"
          />
        </div>
      )}

      {/* Onboarding Content */}
      <div className="onboarding-content">
        <Routes>
          <Route path="/welcome" element={<OnboardingWelcome />} />
          <Route path="/profile" element={<OnboardingProfile />} />
          <Route path="/preferences" element={<OnboardingPreferences />} />
          <Route path="/complete" element={<OnboardingComplete />} />
          <Route path="*" element={<Navigate to="/onboarding/welcome" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default OnboardingLayout;