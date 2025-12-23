import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigation } from '../../contexts/NavigationContext';
import { useNotification } from '../../contexts/NotificationContext';
import NavigationGuard from './NavigationGuard';

const RouteGuard = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isNavigationAllowed, isLinearMode, getCurrentFlowInfo } = useNavigation();
  const { addNotification } = useNotification();

  // CRITICAL: Enhanced route protection with Navigation Guard
  useEffect(() => {
    if (isLinearMode && !isNavigationAllowed(location.pathname)) {
      const flowInfo = getCurrentFlowInfo();
      
      if (flowInfo) {
        // Redirect to current step in flow
        const currentStepPath = flowInfo.currentStepInfo.path;
        
        console.warn('🚫 RouteGuard: Unauthorized navigation blocked', {
          attempted: location.pathname,
          redirectTo: currentStepPath,
          flow: flowInfo.flowId
        });
        
        addNotification({
          type: 'warning',
          title: 'Navigation Restricted',
          message: `Please complete the current step: ${flowInfo.currentStepInfo.title}`,
          duration: 4000
        });
        
        navigate(currentStepPath, { replace: true });
      } else {
        // No active flow but linear mode is on - this shouldn't happen
        console.error('RouteGuard: Linear mode active but no current flow found');
        addNotification({
          type: 'error',
          title: 'Navigation Error',
          message: 'Navigation flow error. Please try again.',
          duration: 5000
        });
      }
    }
  }, [location.pathname, isLinearMode, isNavigationAllowed, getCurrentFlowInfo, navigate, addNotification]);

  return (
    <NavigationGuard>
      {children}
    </NavigationGuard>
  );
};

export default RouteGuard;