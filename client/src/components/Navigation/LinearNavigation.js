/**
 * LinearNavigation - Professional Linear Navigation System
 * Implements modern UX patterns with smart navigation flow
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiHome, 
  FiMessageSquare, 
  FiUsers, 
  FiSettings, 
  FiSearch,
  FiMoreHorizontal,
  FiX,
  FiCheck
} from 'react-icons/fi';
import './LinearNavigation.css';

const LinearNavigation = ({ 
  items = [], 
  currentStep = 0, 
  onStepChange, 
  showProgress = true,
  showBreadcrumbs = true,
  allowSkip = false,
  orientation = 'horizontal', // 'horizontal' | 'vertical'
  variant = 'default', // 'default' | 'minimal' | 'cards' | 'timeline'
  className = '',
  ...props 
}) => {
  const [activeStep, setActiveStep] = useState(currentStep);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [visitedSteps, setVisitedSteps] = useState(new Set([currentStep]));
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('forward');

  // Memoized navigation items with enhanced metadata
  const navigationItems = useMemo(() => {
    return items.map((item, index) => ({
      id: item.id || `step-${index}`,
      title: item.title || `Step ${index + 1}`,
      subtitle: item.subtitle || '',
      icon: item.icon || null,
      component: item.component || null,
      isOptional: item.isOptional || false,
      isDisabled: item.isDisabled || false,
      validation: item.validation || (() => true),
      ...item
    }));
  }, [items]);

  // Update active step when currentStep prop changes
  useEffect(() => {
    if (currentStep !== activeStep) {
      handleStepChange(currentStep);
    }
  }, [currentStep]);

  // Smart step change handler with validation and animation
  const handleStepChange = useCallback((newStep, skipValidation = false) => {
    if (isAnimating) return;

    const targetStep = Math.max(0, Math.min(newStep, navigationItems.length - 1));
    const currentItem = navigationItems[activeStep];
    
    // Validate current step before moving (unless skipping or going backward)
    if (!skipValidation && newStep > activeStep && currentItem?.validation) {
      const isValid = currentItem.validation();
      if (!isValid) {
        // Trigger validation error feedback
        return false;
      }
    }

    // Determine animation direction
    setDirection(newStep > activeStep ? 'forward' : 'backward');
    setIsAnimating(true);

    // Update state
    setActiveStep(targetStep);
    setVisitedSteps(prev => new Set([...prev, targetStep]));
    
    // Mark previous steps as completed when moving forward
    if (newStep > activeStep) {
      setCompletedSteps(prev => new Set([...prev, activeStep]));
    }

    // Call external handler
    onStepChange?.(targetStep, direction);

    // Reset animation state
    setTimeout(() => setIsAnimating(false), 300);
    
    return true;
  }, [activeStep, navigationItems, onStepChange, isAnimating]);

  // Navigation controls
  const canGoBack = activeStep > 0;
  const canGoForward = activeStep < navigationItems.length - 1;
  const currentItem = navigationItems[activeStep];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          if (canGoBack) handleStepChange(activeStep - 1, true);
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          if (canGoForward) handleStepChange(activeStep + 1);
          break;
        case 'Home':
          e.preventDefault();
          handleStepChange(0, true);
          break;
        case 'End':
          e.preventDefault();
          handleStepChange(navigationItems.length - 1, true);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeStep, canGoBack, canGoForward, handleStepChange, navigationItems.length]);

  // Progress calculation
  const progress = ((activeStep + 1) / navigationItems.length) * 100;
  const completionRate = (completedSteps.size / navigationItems.length) * 100;

  return (
    <div 
      className={`linear-navigation ${orientation} ${variant} ${className}`}
      data-step={activeStep}
      data-direction={direction}
      {...props}
    >
      {/* Progress Bar */}
      {showProgress && (
        <div className="navigation-progress">
          <div className="progress-track">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
            <div 
              className="progress-completion"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="progress-label">
            {activeStep + 1} of {navigationItems.length}
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <div className="navigation-breadcrumbs">
          {navigationItems.map((item, index) => (
            <button
              key={item.id}
              className={`breadcrumb-item ${
                index === activeStep ? 'active' : ''
              } ${
                completedSteps.has(index) ? 'completed' : ''
              } ${
                visitedSteps.has(index) ? 'visited' : ''
              } ${
                item.isDisabled ? 'disabled' : ''
              }`}
              onClick={() => {
                if (!item.isDisabled && (allowSkip || visitedSteps.has(index))) {
                  handleStepChange(index, true);
                }
              }}
              disabled={item.isDisabled}
              title={item.subtitle || item.title}
            >
              <div className="breadcrumb-icon">
                {completedSteps.has(index) ? (
                  <FiCheck />
                ) : item.icon ? (
                  <item.icon />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="breadcrumb-title">{item.title}</span>
              {item.isOptional && (
                <span className="breadcrumb-optional">Optional</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Navigation Controls */}
      <div className="navigation-controls">
        <button
          className="nav-btn nav-btn-back"
          onClick={() => handleStepChange(activeStep - 1, true)}
          disabled={!canGoBack || isAnimating}
          title="Previous step"
        >
          <FiChevronLeft />
          <span>Back</span>
        </button>

        <div className="nav-info">
          <h3 className="nav-title">{currentItem?.title}</h3>
          {currentItem?.subtitle && (
            <p className="nav-subtitle">{currentItem.subtitle}</p>
          )}
        </div>

        <button
          className="nav-btn nav-btn-forward"
          onClick={() => handleStepChange(activeStep + 1)}
          disabled={!canGoForward || isAnimating || currentItem?.isDisabled}
          title="Next step"
        >
          <span>Next</span>
          <FiChevronRight />
        </button>
      </div>

      {/* Step Content */}
      <div className={`navigation-content ${isAnimating ? 'animating' : ''}`}>
        {currentItem?.component && (
          <div className="step-component">
            {React.isValidElement(currentItem.component) 
              ? currentItem.component 
              : React.createElement(currentItem.component, {
                  step: activeStep,
                  item: currentItem,
                  onNext: () => handleStepChange(activeStep + 1),
                  onBack: () => handleStepChange(activeStep - 1, true),
                  onComplete: () => setCompletedSteps(prev => new Set([...prev, activeStep]))
                })
            }
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="navigation-actions">
        {allowSkip && !completedSteps.has(activeStep) && (
          <button
            className="action-btn skip-btn"
            onClick={() => handleStepChange(activeStep + 1, true)}
            disabled={!canGoForward}
          >
            Skip
          </button>
        )}
        
        <button
          className="action-btn reset-btn"
          onClick={() => {
            setActiveStep(0);
            setCompletedSteps(new Set());
            setVisitedSteps(new Set([0]));
            onStepChange?.(0, 'reset');
          }}
          title="Reset to beginning"
        >
          <FiHome />
        </button>
      </div>
    </div>
  );
};

export default LinearNavigation;