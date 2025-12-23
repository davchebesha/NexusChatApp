/**
 * NavigationWizard - Professional Step-by-Step Wizard Component
 * Implements modern wizard patterns with smart validation and UX
 */

import React, { useState, useCallback } from 'react';
import { 
  FiCheck, 
  FiAlertCircle, 
  FiInfo, 
  FiChevronRight,
  FiChevronLeft,
  FiSkipForward,
  FiRotateCcw
} from 'react-icons/fi';
import LinearNavigation from './LinearNavigation';
import useLinearNavigation from '../../hooks/useLinearNavigation';
import './NavigationWizard.css';

const NavigationWizard = ({
  steps = [],
  onComplete,
  onCancel,
  title = 'Setup Wizard',
  subtitle = 'Complete the following steps to get started',
  allowSkip = false,
  showProgress = true,
  autoSave = true,
  className = '',
  ...props
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    currentStep,
    completedSteps,
    visitedSteps,
    stepData,
    errors,
    progress,
    navigateToStep,
    goNext,
    goBack,
    updateStepData,
    validateStep,
    markStepCompleted,
    isStepAccessible,
    reset,
    canGoNext,
    canGoBack,
    isNavigating
  } = useLinearNavigation({
    steps,
    autoSave,
    storageKey: `wizard-${title.toLowerCase().replace(/\s+/g, '-')}`,
    onComplete: (data) => {
      setShowConfirmation(true);
    }
  });

  const currentStepConfig = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Handle step completion
  const handleStepComplete = useCallback(async (data) => {
    if (data) {
      updateStepData(currentStep, data);
    }
    
    markStepCompleted(currentStep);
    
    if (isLastStep) {
      setShowConfirmation(true);
    } else {
      goNext();
    }
  }, [currentStep, updateStepData, markStepCompleted, isLastStep, goNext]);

  // Handle wizard completion
  const handleWizardComplete = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      const allStepData = {};
      steps.forEach((_, index) => {
        const data = stepData[index];
        if (data) {
          allStepData[index] = data;
        }
      });

      await onComplete?.({
        stepData: allStepData,
        completedSteps: Array.from(completedSteps),
        totalSteps: steps.length
      });
      
      setShowConfirmation(false);
    } catch (error) {
      console.error('Wizard completion failed:', error);
      // Handle error (show notification, etc.)
    } finally {
      setIsSubmitting(false);
    }
  }, [stepData, completedSteps, steps, onComplete]);

  // Handle step validation
  const handleStepValidation = useCallback((stepIndex) => {
    const validation = validateStep(stepIndex);
    return validation.isValid;
  }, [validateStep]);

  // Render step content
  const renderStepContent = () => {
    if (!currentStepConfig) return null;

    const StepComponent = currentStepConfig.component;
    
    if (!StepComponent) {
      return (
        <div className="step-placeholder">
          <FiInfo size={48} />
          <h3>{currentStepConfig.title}</h3>
          <p>{currentStepConfig.description || 'No content configured for this step.'}</p>
        </div>
      );
    }

    return (
      <StepComponent
        stepIndex={currentStep}
        stepData={stepData[currentStep]}
        allStepData={stepData}
        onComplete={handleStepComplete}
        onNext={goNext}
        onBack={goBack}
        onUpdateData={(data) => updateStepData(currentStep, data)}
        isCompleted={completedSteps.has(currentStep)}
        canProceed={canGoNext}
        error={errors[currentStep]}
        {...currentStepConfig.props}
      />
    );
  };

  // Render confirmation dialog
  const renderConfirmation = () => (
    <div className="wizard-confirmation-overlay">
      <div className="wizard-confirmation">
        <div className="confirmation-header">
          <FiCheck className="confirmation-icon" />
          <h2>Complete Setup</h2>
          <p>You've completed all steps. Ready to finish?</p>
        </div>
        
        <div className="confirmation-summary">
          <h3>Summary</h3>
          <div className="summary-items">
            {steps.map((step, index) => (
              <div key={index} className="summary-item">
                <div className="summary-icon">
                  {completedSteps.has(index) ? (
                    <FiCheck className="completed" />
                  ) : (
                    <FiAlertCircle className="incomplete" />
                  )}
                </div>
                <div className="summary-content">
                  <strong>{step.title}</strong>
                  <span className={completedSteps.has(index) ? 'completed' : 'incomplete'}>
                    {completedSteps.has(index) ? 'Completed' : 'Incomplete'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="confirmation-actions">
          <button
            className="btn btn-outline"
            onClick={() => setShowConfirmation(false)}
            disabled={isSubmitting}
          >
            Review Steps
          </button>
          <button
            className="btn btn-primary"
            onClick={handleWizardComplete}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Completing...' : 'Complete Setup'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`navigation-wizard ${className}`} {...props}>
      {/* Wizard Header */}
      <div className="wizard-header">
        <div className="wizard-title-section">
          <h1 className="wizard-title">{title}</h1>
          {subtitle && <p className="wizard-subtitle">{subtitle}</p>}
        </div>
        
        {showProgress && (
          <div className="wizard-progress-section">
            <div className="progress-stats">
              <span className="progress-text">
                Step {progress.current} of {progress.total}
              </span>
              <span className="completion-text">
                {Math.round(progress.completionRate)}% Complete
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Step Navigation */}
      <div className="wizard-navigation">
        <div className="step-indicators">
          {steps.map((step, index) => (
            <button
              key={index}
              className={`step-indicator ${
                index === currentStep ? 'active' : ''
              } ${
                completedSteps.has(index) ? 'completed' : ''
              } ${
                visitedSteps.has(index) ? 'visited' : ''
              } ${
                !isStepAccessible(index) ? 'disabled' : ''
              }`}
              onClick={() => {
                if (isStepAccessible(index)) {
                  navigateToStep(index);
                }
              }}
              disabled={!isStepAccessible(index)}
              title={step.description || step.title}
            >
              <div className="indicator-icon">
                {completedSteps.has(index) ? (
                  <FiCheck />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="indicator-content">
                <span className="indicator-title">{step.title}</span>
                {step.isOptional && (
                  <span className="indicator-optional">Optional</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="wizard-content">
        <div className="step-header">
          <h2 className="step-title">{currentStepConfig?.title}</h2>
          {currentStepConfig?.description && (
            <p className="step-description">{currentStepConfig.description}</p>
          )}
          {errors[currentStep] && (
            <div className="step-error">
              <FiAlertCircle />
              <span>{errors[currentStep]}</span>
            </div>
          )}
        </div>
        
        <div className="step-body">
          {renderStepContent()}
        </div>
      </div>

      {/* Wizard Controls */}
      <div className="wizard-controls">
        <div className="control-group left">
          <button
            className="btn btn-outline"
            onClick={goBack}
            disabled={!canGoBack || isNavigating}
          >
            <FiChevronLeft />
            Back
          </button>
          
          {allowSkip && !completedSteps.has(currentStep) && !isLastStep && (
            <button
              className="btn btn-ghost"
              onClick={() => goNext({ skipValidation: true })}
              disabled={isNavigating}
            >
              <FiSkipForward />
              Skip
            </button>
          )}
        </div>

        <div className="control-group center">
          <button
            className="btn btn-ghost"
            onClick={() => reset()}
            title="Reset wizard"
          >
            <FiRotateCcw />
            Reset
          </button>
        </div>

        <div className="control-group right">
          {onCancel && (
            <button
              className="btn btn-outline"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          
          <button
            className="btn btn-primary"
            onClick={() => {
              if (isLastStep) {
                setShowConfirmation(true);
              } else {
                goNext();
              }
            }}
            disabled={!canGoNext && !isLastStep || isNavigating}
          >
            {isLastStep ? 'Complete' : 'Next'}
            {!isLastStep && <FiChevronRight />}
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && renderConfirmation()}
    </div>
  );
};

export default NavigationWizard;