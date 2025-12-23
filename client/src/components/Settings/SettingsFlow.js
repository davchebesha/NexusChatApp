import React, { useEffect } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useNavigate } from 'react-router-dom';
import NavigationProgress from '../Navigation/NavigationProgress';
import ThemeSettings from './ThemeSettings';
import ProfileSettings from './ProfileSettings';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';
import { FiArrowLeft } from 'react-icons/fi';
import './SettingsFlow.css';

const SettingsFlow = ({ onExit }) => {
  const { 
    startFlow, 
    getCurrentFlowInfo, 
    isLinearMode, 
    currentFlow,
    completeFlow,
    cancelFlow 
  } = useNavigation();
  const navigate = useNavigate();

  useEffect(() => {
    // Start settings flow if not already in linear mode
    if (!isLinearMode || currentFlow !== 'settings') {
      startFlow('settings');
    }
  }, [startFlow, isLinearMode, currentFlow]);

  const flowInfo = getCurrentFlowInfo();

  const handleExit = () => {
    cancelFlow();
    if (onExit) {
      onExit();
    } else {
      navigate('/settings');
    }
  };

  const handleComplete = () => {
    completeFlow({ settingsConfigured: true });
    if (onExit) {
      onExit();
    } else {
      navigate('/settings');
    }
  };

  const renderCurrentStep = () => {
    if (!flowInfo) return null;

    switch (flowInfo.currentStepInfo.id) {
      case 'theme':
        return <ThemeSettings />;
      case 'profile':
        return <ProfileSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'privacy':
        return <PrivacySettings />;
      default:
        return null;
    }
  };

  if (!isLinearMode || currentFlow !== 'settings') {
    return null;
  }

  return (
    <div className="settings-flow">
      <div className="settings-flow-header">
        <button 
          className="exit-flow-btn"
          onClick={handleExit}
          title="Exit guided setup"
        >
          <FiArrowLeft />
          Exit Setup
        </button>
        
        <div className="flow-title">
          <h2>Settings Configuration</h2>
          <p>Let's configure your Nexus ChatApp preferences</p>
        </div>
      </div>

      <div className="settings-flow-progress">
        <NavigationProgress 
          showControls={true}
          showProgress={true}
          showSteps={true}
          onCancel={handleExit}
        />
      </div>

      <div className="settings-flow-content">
        <div className="step-container">
          <div className="step-header">
            <h3>{flowInfo?.currentStepInfo.title}</h3>
            <p>Configure your {flowInfo?.currentStepInfo.title.toLowerCase()} preferences</p>
          </div>
          
          <div className="step-content">
            {renderCurrentStep()}
          </div>
        </div>
      </div>

      {flowInfo?.isLastStep && (
        <div className="settings-flow-completion">
          <div className="completion-prompt">
            <h4>Configuration Complete!</h4>
            <p>Your settings have been configured. You can always change them later.</p>
            <button 
              className="btn btn-primary"
              onClick={handleComplete}
            >
              Finish Setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsFlow;