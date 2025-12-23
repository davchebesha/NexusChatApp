/**
 * NavigationGuard - Enhanced Navigation Guard/Stack for Linear Navigation
 * CRITICAL: Implements strict step-by-step progression with Navigation Stack
 * Users must move sequentially, with preserved Return Path for popups/modals
 */

import React, { useEffect, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigation } from '../../contexts/NavigationContext';
import { useNotification } from '../../contexts/NotificationContext';

const NavigationGuard = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    isNavigationAllowed, 
    isLinearMode, 
    getCurrentFlowInfo,
    saveCurrentState,
    restoreState 
  } = useNavigation();
  const { addNotification } = useNotification();

  // CRITICAL: Navigation Stack for Return Path preservation
  const [navigationStack, setNavigationStack] = useState([]);
  const [temporaryDeviations, setTemporaryDeviations] = useState(new Map());

  // CRITICAL: Handle temporary deviations (Jump Out) with Return Path preservation
  const handleTemporaryDeviation = useCallback((deviationType, targetPath, context = {}) => {
    if (!isLinearMode) return false;

    const flowInfo = getCurrentFlowInfo();
    if (!flowInfo) return false;

    // Save current state for Return Path
    const stateId = saveCurrentState();
    if (!stateId) return false;

    // Create deviation record
    const deviation = {
      id: `deviation_${Date.now()}`,
      type: deviationType, // 'popup', 'modal', 'notification', 'error'
      originalPath: location.pathname,
      originalFlow: flowInfo.flowId,
      originalStep: flowInfo.currentStep,
      targetPath,
      stateId,
      context,
      timestamp: new Date().toISOString()
    };

    // Add to navigation stack
    setNavigationStack(prev => [...prev, deviation]);
    setTemporaryDeviations(prev => new Map(prev).set(deviation.id, deviation));

    console.log('🔄 Navigation Guard: Temporary deviation started', {
      type: deviationType,
      from: location.pathname,
      to: targetPath,
      deviationId: deviation.id
    });

    return deviation.id;
  }, [isLinearMode, getCurrentFlowInfo, saveCurrentState, location.pathname]);

  // CRITICAL: Return from temporary deviation (Jump In) - restore exact state
  const returnFromDeviation = useCallback((deviationId) => {
    const deviation = temporaryDeviations.get(deviationId);
    if (!deviation) {
      console.error('Navigation Guard: Deviation not found', deviationId);
      return false;
    }

    // Restore saved state
    const restored = restoreState(deviation.stateId);
    if (!restored) {
      console.error('Navigation Guard: Failed to restore state', deviation.stateId);
      return false;
    }

    // Remove from stack and deviations
    setNavigationStack(prev => prev.filter(d => d.id !== deviationId));
    setTemporaryDeviations(prev => {
      const newMap = new Map(prev);
      newMap.delete(deviationId);
      return newMap;
    });

    console.log('✅ Navigation Guard: Returned from deviation', {
      deviationId,
      restoredTo: deviation.originalPath,
      flow: deviation.originalFlow,
      step: deviation.originalStep
    });

    addNotification({
      type: 'success',
      title: 'Navigation Restored',
      message: 'Returned to your previous location',
      duration: 2000
    });

    return true;
  }, [temporaryDeviations, restoreState, addNotification]);

  // CRITICAL: Strict step-by-step navigation enforcement
  useEffect(() => {
    if (!isLinearMode) return;

    const currentPath = location.pathname;
    
    // Check if current path is allowed in linear mode
    if (!isNavigationAllowed(currentPath)) {
      const flowInfo = getCurrentFlowInfo();
      
      if (flowInfo) {
        const currentStepPath = flowInfo.currentStepInfo.path;
        
        console.warn('🚫 Navigation Guard: Unauthorized navigation attempt', {
          attempted: currentPath,
          allowed: currentStepPath,
          flow: flowInfo.flowId,
          step: flowInfo.currentStep
        });

        // CRITICAL: Redirect to current step (enforce step-by-step)
        addNotification({
          type: 'warning',
          title: 'Navigation Restricted',
          message: `Please complete step ${flowInfo.currentStep + 1}: ${flowInfo.currentStepInfo.title}`,
          duration: 4000
        });
        
        navigate(currentStepPath, { replace: true });
      } else {
        console.error('Navigation Guard: Linear mode active but no flow found');
        addNotification({
          type: 'error',
          title: 'Navigation Error',
          message: 'Navigation flow error. Resetting navigation.',
          duration: 5000
        });
      }
    }
  }, [location.pathname, isLinearMode, isNavigationAllowed, getCurrentFlowInfo, navigate, addNotification]);

  // CRITICAL: Expose navigation guard functions globally
  useEffect(() => {
    // Make functions available globally for modal/popup components
    window.nexusNavigationGuard = {
      startTemporaryDeviation: handleTemporaryDeviation,
      returnFromDeviation,
      getCurrentStack: () => [...navigationStack],
      getActiveDeviations: () => Array.from(temporaryDeviations.values())
    };

    return () => {
      delete window.nexusNavigationGuard;
    };
  }, [handleTemporaryDeviation, returnFromDeviation, navigationStack, temporaryDeviations]);

  // CRITICAL: Navigation Stack debugging (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📍 Navigation Guard State:', {
        isLinearMode,
        currentPath: location.pathname,
        stackSize: navigationStack.length,
        activeDeviations: temporaryDeviations.size,
        flowInfo: getCurrentFlowInfo()
      });
    }
  }, [isLinearMode, location.pathname, navigationStack.length, temporaryDeviations.size, getCurrentFlowInfo]);

  return (
    <>
      {children}
      
      {/* CRITICAL: Navigation Stack Indicator (development) */}
      {process.env.NODE_ENV === 'development' && navigationStack.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(16, 185, 129, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 10000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          📍 Nav Stack: {navigationStack.length} | Deviations: {temporaryDeviations.size}
        </div>
      )}
    </>
  );
};

export default NavigationGuard;