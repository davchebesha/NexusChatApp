/**
 * ProgressIndicator - Visual feedback for linear navigation progress
 * Shows current step, available next steps, and navigation controls
 */

import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { FiChevronLeft, FiChevronRight, FiCheck, FiCircle, FiLock } from 'react-icons/fi';
import './ProgressIndicator.css';

const ProgressIndicator = ({ 
  showControls = true, 
  showStepNames = true, 
  compact = false,
  className = '' 
}) => {
  const { 
    getCurrentFlowInfo, 
    nextStep, 
    previousStep, 
    isLinearMode 
  } = useNavigation();

  const flowInfo = getCurrentFlowInfo();

  // Don't render if not in linear mode or no flow
  if (!isLinearMode || !flowInfo) {
    return null;
  }

  const {
    flowName,
    currentStep,
    totalSteps,
    currentStepInfo,
    progress,
    canGoNext,
    canGoPrevious,
    isLastStep
  } = flowInfo;

  const handleNext = () => {
    if (canGoNext) {
      nextStep();
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      previousStep();
    }
  };

  return (
    <div className={`progress-indicator ${compact ? 'compact' : ''} ${className}`}>
      {/* Flow Header */}
      <div className="progress-header">
        <h3 className="flow-name">{flowName}</h3>
        <div className="progress-stats">
          Step {currentStep + 1} of {totalSteps} • {Math.round(progress)}% Complete
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="progress-percentage">{Math.round(progress)}%</div>
      </div>

      {/* Step Indicators */}
      <div className="step-indicators">
        {Array.from({ length: totalSteps }, (_, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLocked = index > currentStep;

          return (
            <div 
              key={index}
              className={`step-indicator ${
                isCompleted ? 'completed' : 
                isCurrent ? 'current' : 
                'locked'
              }`}
            >
              <div className="step-icon">
                {isCompleted ? (
                  <FiCheck />
                ) : isCurrent ? (
                  <FiCircle />
                ) : (
                  <FiLock />
                )}
              </div>
              {showStepNames && !compact && (
                <div className="step-name">
                  Step {index + 1}
                  {isCurrent && (
                    <div className="current-step-title">
                      {currentStepInfo.title}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Info */}
      {!compact && (
        <div className="current-step-info">
          <h4>{currentStepInfo.title}</h4>
          <div className="step-description">
            Complete this step to continue to the next part of the process.
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      {showControls && (
        <div className="navigation-controls">
          <button 
            className="nav-btn prev-btn"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            title="Previous Step"
          >
            <FiChevronLeft />
            {!compact && 'Previous'}
          </button>

          <div className="step-counter">
            {currentStep + 1} / {totalSteps}
          </div>

          <button 
            className="nav-btn next-btn"
            onClick={handleNext}
            disabled={!canGoNext}
            title={isLastStep ? "Complete Flow" : "Next Step"}
          >
            {!compact && (isLastStep ? 'Complete' : 'Next')}
            <FiChevronRight />
          </button>
        </div>
      )}

      {/* Linear Mode Indicator */}
      <div className="linear-mode-indicator">
        <div className="linear-badge">
          🔒 Linear Navigation Active
        </div>
        <div className="linear-description">
          Complete steps in order. Use popups/modals for temporary actions.
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;