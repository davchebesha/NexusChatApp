/**
 * useLinearNavigation - Professional Navigation State Management Hook
 * Provides comprehensive navigation state and methods with smart features
 */

import { useState, useCallback, useEffect, useRef } from 'react';

const useLinearNavigation = ({
  steps = [],
  initialStep = 0,
  autoSave = true,
  storageKey = 'linear-navigation-state',
  onStepChange,
  onComplete,
  validation = {}
}) => {
  // Core state
  const [currentStep, setCurrentStep] = useState(() => {
    if (autoSave && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return Math.max(0, Math.min(parsed.currentStep || initialStep, steps.length - 1));
        } catch (e) {
          console.warn('Failed to parse saved navigation state:', e);
        }
      }
    }
    return initialStep;
  });

  const [completedSteps, setCompletedSteps] = useState(() => {
    if (autoSave && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return new Set(parsed.completedSteps || []);
        } catch (e) {
          return new Set();
        }
      }
    }
    return new Set();
  });

  const [visitedSteps, setVisitedSteps] = useState(() => {
    if (autoSave && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return new Set(parsed.visitedSteps || [initialStep]);
        } catch (e) {
          return new Set([initialStep]);
        }
      }
    }
    return new Set([initialStep]);
  });

  const [stepData, setStepData] = useState(() => {
    if (autoSave && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.stepData || {};
        } catch (e) {
          return {};
        }
      }
    }
    return {};
  });

  const [isNavigating, setIsNavigating] = useState(false);
  const [errors, setErrors] = useState({});
  const [history, setHistory] = useState([initialStep]);
  
  // Refs for performance
  const stepsRef = useRef(steps);
  const validationRef = useRef(validation);
  
  // Update refs when props change
  useEffect(() => {
    stepsRef.current = steps;
    validationRef.current = validation;
  }, [steps, validation]);

  // Auto-save state to localStorage
  useEffect(() => {
    if (autoSave && typeof window !== 'undefined') {
      const state = {
        currentStep,
        completedSteps: Array.from(completedSteps),
        visitedSteps: Array.from(visitedSteps),
        stepData,
        timestamp: Date.now()
      };
      
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (e) {
        console.warn('Failed to save navigation state:', e);
      }
    }
  }, [currentStep, completedSteps, visitedSteps, stepData, autoSave, storageKey]);

  // Validation helper
  const validateStep = useCallback((stepIndex, data = null) => {
    const step = stepsRef.current[stepIndex];
    const validator = validationRef.current[stepIndex] || step?.validation;
    
    if (!validator) return { isValid: true };
    
    try {
      const result = validator(data || stepData[stepIndex], stepIndex);
      
      if (typeof result === 'boolean') {
        return { isValid: result };
      }
      
      if (typeof result === 'object') {
        return {
          isValid: result.isValid !== false,
          message: result.message,
          errors: result.errors
        };
      }
      
      return { isValid: true };
    } catch (error) {
      console.error('Validation error:', error);
      return { 
        isValid: false, 
        message: 'Validation failed',
        errors: { validation: error.message }
      };
    }
  }, [stepData]);

  // Smart navigation with validation and history
  const navigateToStep = useCallback((targetStep, options = {}) => {
    const {
      skipValidation = false,
      force = false,
      updateHistory = true
    } = options;

    if (isNavigating && !force) return false;

    const normalizedStep = Math.max(0, Math.min(targetStep, stepsRef.current.length - 1));
    
    // Validate current step before moving forward
    if (!skipValidation && targetStep > currentStep) {
      const validation = validateStep(currentStep);
      if (!validation.isValid) {
        setErrors(prev => ({
          ...prev,
          [currentStep]: validation.message || 'Validation failed'
        }));
        return false;
      }
    }

    setIsNavigating(true);
    
    // Clear errors for target step
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[normalizedStep];
      return newErrors;
    });

    // Update state
    const previousStep = currentStep;
    setCurrentStep(normalizedStep);
    setVisitedSteps(prev => new Set([...prev, normalizedStep]));
    
    // Mark previous steps as completed when moving forward
    if (targetStep > currentStep) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }
    
    // Update history
    if (updateHistory) {
      setHistory(prev => [...prev, normalizedStep]);
    }

    // Call external handlers
    onStepChange?.(normalizedStep, previousStep, {
      direction: targetStep > currentStep ? 'forward' : 'backward',
      isValid: true
    });

    // Check for completion
    if (normalizedStep === stepsRef.current.length - 1) {
      const allCompleted = Array.from({ length: stepsRef.current.length - 1 }, (_, i) => i)
        .every(i => completedSteps.has(i) || i === currentStep);
      
      if (allCompleted) {
        onComplete?.({
          completedSteps: Array.from(completedSteps),
          stepData,
          totalSteps: stepsRef.current.length
        });
      }
    }

    setTimeout(() => setIsNavigating(false), 100);
    return true;
  }, [currentStep, isNavigating, validateStep, completedSteps, stepData, onStepChange, onComplete]);

  // Convenience navigation methods
  const goNext = useCallback((options = {}) => {
    return navigateToStep(currentStep + 1, options);
  }, [currentStep, navigateToStep]);

  const goBack = useCallback((options = {}) => {
    return navigateToStep(currentStep - 1, { ...options, skipValidation: true });
  }, [currentStep, navigateToStep]);

  const goToFirst = useCallback((options = {}) => {
    return navigateToStep(0, { ...options, skipValidation: true });
  }, [navigateToStep]);

  const goToLast = useCallback((options = {}) => {
    return navigateToStep(stepsRef.current.length - 1, options);
  }, [navigateToStep]);

  const goBackInHistory = useCallback(() => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // Remove current
      const previousStep = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      return navigateToStep(previousStep, { skipValidation: true, updateHistory: false });
    }
    return false;
  }, [history, navigateToStep]);

  // Step data management
  const updateStepData = useCallback((stepIndex, data, merge = true) => {
    setStepData(prev => ({
      ...prev,
      [stepIndex]: merge && typeof data === 'object' && typeof prev[stepIndex] === 'object'
        ? { ...prev[stepIndex], ...data }
        : data
    }));
  }, []);

  const getStepData = useCallback((stepIndex) => {
    return stepData[stepIndex];
  }, [stepData]);

  const clearStepData = useCallback((stepIndex = null) => {
    if (stepIndex === null) {
      setStepData({});
    } else {
      setStepData(prev => {
        const newData = { ...prev };
        delete newData[stepIndex];
        return newData;
      });
    }
  }, []);

  // Reset navigation state
  const reset = useCallback((options = {}) => {
    const { clearData = true, clearHistory = true } = options;
    
    setCurrentStep(initialStep);
    setCompletedSteps(new Set());
    setVisitedSteps(new Set([initialStep]));
    setErrors({});
    
    if (clearData) {
      setStepData({});
    }
    
    if (clearHistory) {
      setHistory([initialStep]);
    }

    if (autoSave && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  }, [initialStep, autoSave, storageKey]);

  // Mark step as completed
  const markStepCompleted = useCallback((stepIndex = currentStep) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
  }, [currentStep]);

  // Check if step is accessible
  const isStepAccessible = useCallback((stepIndex) => {
    const step = stepsRef.current[stepIndex];
    if (!step) return false;
    
    // Always allow access to visited steps
    if (visitedSteps.has(stepIndex)) return true;
    
    // Allow access to next step if current is completed or optional
    if (stepIndex === currentStep + 1) {
      const currentStepObj = stepsRef.current[currentStep];
      return completedSteps.has(currentStep) || currentStepObj?.isOptional;
    }
    
    return false;
  }, [visitedSteps, currentStep, completedSteps]);

  // Progress calculations
  const progress = {
    current: currentStep + 1,
    total: stepsRef.current.length,
    percentage: ((currentStep + 1) / stepsRef.current.length) * 100,
    completed: completedSteps.size,
    completionRate: (completedSteps.size / stepsRef.current.length) * 100,
    remaining: stepsRef.current.length - currentStep - 1,
    isComplete: currentStep === stepsRef.current.length - 1 && completedSteps.size === stepsRef.current.length - 1
  };

  // Navigation state
  const canGoNext = currentStep < stepsRef.current.length - 1;
  const canGoBack = currentStep > 0;
  const canGoBackInHistory = history.length > 1;

  return {
    // Current state
    currentStep,
    completedSteps,
    visitedSteps,
    stepData,
    errors,
    history,
    isNavigating,
    progress,

    // Navigation methods
    navigateToStep,
    goNext,
    goBack,
    goToFirst,
    goToLast,
    goBackInHistory,

    // Data management
    updateStepData,
    getStepData,
    clearStepData,

    // Utility methods
    validateStep,
    markStepCompleted,
    isStepAccessible,
    reset,

    // Navigation state
    canGoNext,
    canGoBack,
    canGoBackInHistory,

    // Current step info
    currentStepData: stepData[currentStep],
    currentStepError: errors[currentStep],
    isCurrentStepCompleted: completedSteps.has(currentStep),
    isCurrentStepVisited: visitedSteps.has(currentStep)
  };
};

export default useLinearNavigation;