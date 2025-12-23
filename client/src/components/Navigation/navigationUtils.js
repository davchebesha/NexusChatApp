/**
 * Navigation Utilities - Helper functions for navigation components
 */

// Navigation step validation utilities
export const createValidator = (rules) => {
  return (data, stepIndex) => {
    const errors = {};
    let isValid = true;

    for (const [field, rule] of Object.entries(rules)) {
      const value = data?.[field];
      
      if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors[field] = rule.message || `${field} is required`;
        isValid = false;
        continue;
      }

      if (value && rule.pattern && !rule.pattern.test(value)) {
        errors[field] = rule.message || `${field} format is invalid`;
        isValid = false;
        continue;
      }

      if (value && rule.minLength && value.length < rule.minLength) {
        errors[field] = rule.message || `${field} must be at least ${rule.minLength} characters`;
        isValid = false;
        continue;
      }

      if (value && rule.maxLength && value.length > rule.maxLength) {
        errors[field] = rule.message || `${field} must be no more than ${rule.maxLength} characters`;
        isValid = false;
        continue;
      }

      if (value && rule.custom && !rule.custom(value, data, stepIndex)) {
        errors[field] = rule.message || `${field} validation failed`;
        isValid = false;
      }
    }

    return { isValid, errors, message: isValid ? null : 'Please fix the errors above' };
  };
};

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  url: /^https?:\/\/.+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

// Step configuration helpers
export const createStep = ({
  id,
  title,
  subtitle,
  description,
  component,
  icon,
  validation,
  isOptional = false,
  isDisabled = false,
  props = {}
}) => ({
  id: id || `step-${Date.now()}`,
  title,
  subtitle,
  description,
  component,
  icon,
  validation,
  isOptional,
  isDisabled,
  props
});

// Navigation flow helpers
export const createNavigationFlow = (steps) => {
  return steps.map((step, index) => ({
    ...step,
    index,
    isFirst: index === 0,
    isLast: index === steps.length - 1,
    next: index < steps.length - 1 ? steps[index + 1] : null,
    previous: index > 0 ? steps[index - 1] : null
  }));
};

// Progress calculation utilities
export const calculateProgress = (currentStep, totalSteps, completedSteps = []) => {
  const current = currentStep + 1;
  const percentage = (current / totalSteps) * 100;
  const completed = completedSteps.length;
  const completionRate = (completed / totalSteps) * 100;
  const remaining = totalSteps - current;

  return {
    current,
    total: totalSteps,
    percentage: Math.round(percentage),
    completed,
    completionRate: Math.round(completionRate),
    remaining,
    isComplete: current === totalSteps && completed === totalSteps
  };
};

// Navigation state persistence
export const saveNavigationState = (key, state) => {
  try {
    const serializedState = {
      ...state,
      completedSteps: Array.from(state.completedSteps || []),
      visitedSteps: Array.from(state.visitedSteps || []),
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(serializedState));
    return true;
  } catch (error) {
    console.warn('Failed to save navigation state:', error);
    return false;
  }
};

export const loadNavigationState = (key) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;

    const state = JSON.parse(saved);
    return {
      ...state,
      completedSteps: new Set(state.completedSteps || []),
      visitedSteps: new Set(state.visitedSteps || [])
    };
  } catch (error) {
    console.warn('Failed to load navigation state:', error);
    return null;
  }
};

export const clearNavigationState = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('Failed to clear navigation state:', error);
    return false;
  }
};

// Accessibility helpers
export const getAriaLabel = (step, index, isActive, isCompleted) => {
  let label = `Step ${index + 1}: ${step.title}`;
  
  if (isCompleted) {
    label += ' (completed)';
  } else if (isActive) {
    label += ' (current)';
  }
  
  if (step.isOptional) {
    label += ' (optional)';
  }
  
  return label;
};

export const getStepStatus = (step, index, currentStep, completedSteps, visitedSteps) => {
  const isActive = index === currentStep;
  const isCompleted = completedSteps.has(index);
  const isVisited = visitedSteps.has(index);
  const isAccessible = isVisited || index <= currentStep + 1;

  return {
    isActive,
    isCompleted,
    isVisited,
    isAccessible,
    isPending: !isVisited && !isCompleted,
    isDisabled: step.isDisabled || !isAccessible
  };
};

// Animation and transition helpers
export const getTransitionDirection = (fromStep, toStep) => {
  if (fromStep < toStep) return 'forward';
  if (fromStep > toStep) return 'backward';
  return 'none';
};

export const createTransitionConfig = (direction, duration = 300) => {
  const baseConfig = {
    duration,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  };

  switch (direction) {
    case 'forward':
      return {
        ...baseConfig,
        enter: { opacity: 0, transform: 'translateX(20px)' },
        exit: { opacity: 0, transform: 'translateX(-20px)' }
      };
    case 'backward':
      return {
        ...baseConfig,
        enter: { opacity: 0, transform: 'translateX(-20px)' },
        exit: { opacity: 0, transform: 'translateX(20px)' }
      };
    default:
      return {
        ...baseConfig,
        enter: { opacity: 0 },
        exit: { opacity: 0 }
      };
  }
};

// Form integration helpers
export const createFormStep = (formConfig) => {
  return {
    ...formConfig,
    validation: formConfig.validation || createValidator(formConfig.rules || {}),
    component: formConfig.component || 'FormStep'
  };
};

// Navigation analytics helpers
export const trackNavigationEvent = (eventType, data) => {
  // Integration point for analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventType, {
      event_category: 'Navigation',
      ...data
    });
  }
  
  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('Navigation Event:', eventType, data);
  }
};

// URL synchronization helpers
export const syncWithURL = (currentStep, steps, history) => {
  if (!history || typeof window === 'undefined') return;

  const stepSlug = steps[currentStep]?.id || `step-${currentStep}`;
  const currentPath = window.location.pathname;
  const newPath = `${currentPath}?step=${stepSlug}`;
  
  if (window.location.search !== `?step=${stepSlug}`) {
    history.replace(newPath);
  }
};

export const getStepFromURL = (steps) => {
  if (typeof window === 'undefined') return 0;

  const params = new URLSearchParams(window.location.search);
  const stepParam = params.get('step');
  
  if (!stepParam) return 0;

  const stepIndex = steps.findIndex(step => step.id === stepParam);
  return stepIndex >= 0 ? stepIndex : 0;
};

// Keyboard navigation helpers
export const handleKeyboardNavigation = (event, navigation) => {
  const { currentStep, canGoNext, canGoBack, goNext, goBack, navigateToStep, steps } = navigation;

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      if (canGoNext) goNext();
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault();
      if (canGoBack) goBack();
      break;
    case 'Home':
      event.preventDefault();
      navigateToStep(0);
      break;
    case 'End':
      event.preventDefault();
      navigateToStep(steps.length - 1);
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (canGoNext) goNext();
      break;
    default:
      // Number keys for direct navigation
      const num = parseInt(event.key);
      if (num >= 1 && num <= steps.length) {
        event.preventDefault();
        navigateToStep(num - 1);
      }
      break;
  }
};

// Export all utilities as a single object for convenience
export const NavigationUtils = {
  createValidator,
  validationPatterns,
  createStep,
  createNavigationFlow,
  calculateProgress,
  saveNavigationState,
  loadNavigationState,
  clearNavigationState,
  getAriaLabel,
  getStepStatus,
  getTransitionDirection,
  createTransitionConfig,
  createFormStep,
  trackNavigationEvent,
  syncWithURL,
  getStepFromURL,
  handleKeyboardNavigation
};