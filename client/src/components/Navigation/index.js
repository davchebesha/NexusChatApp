/**
 * Navigation Components - Professional Linear Navigation System
 * Export all navigation components and utilities
 */

// Core Components
export { default as LinearNavigation } from './LinearNavigation';
export { default as NavigationWizard } from './NavigationWizard';
export { default as NavigationProgress } from './NavigationProgress';
export { default as StepNavigation } from './StepNavigation';
export { default as OnboardingTrigger } from './OnboardingTrigger';
export { default as RouteGuard } from './RouteGuard';

// New Professional Linear Navigation System Components
export { 
  NavigationGuardProvider, 
  useNavigationGuard, 
  withNavigationGuard 
} from './NavigationGuard';
export { default as NavigationFlowManager } from './NavigationFlowManager';
export { default as ProgressIndicator } from './ProgressIndicator';
export { default as LinearNavigationExample } from './LinearNavigationExample';

// Hooks
export { default as useLinearNavigation } from '../../hooks/useLinearNavigation';

// Example Components for demonstration
export { default as NavigationExamples } from './NavigationExamples';

// Navigation Utilities
export * from './navigationUtils';