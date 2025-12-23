/**
 * LinearNavigationExample - Comprehensive demo of linear navigation system
 * Shows step-by-step progression, modal handling, and return path preservation
 */

import React, { useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import ProgressIndicator from './ProgressIndicator';
import ModalNavigationHandler, { useModalNavigation } from './ModalNavigationHandler';
import { FiPlay, FiSquare, FiRotateCcw, FiInfo, FiSettings, FiAlertTriangle } from 'react-icons/fi';
import './LinearNavigationExample.css';

const LinearNavigationExample = () => {
  const { 
    startFlow, 
    completeFlow, 
    cancelFlow, 
    getCurrentFlowInfo, 
    isLinearMode,
    navigationHistory 
  } = useNavigation();

  const [demoData, setDemoData] = useState({});
  const { isOpen, openModal, closeModal, ModalComponent } = useModalNavigation();

  const handleStartDemo = () => {
    const success = startFlow('onboarding', { 
      demoMode: true, 
      startedAt: new Date().toISOString() 
    });
    
    if (success) {
      console.log('✅ Linear Navigation Demo: Started onboarding flow');
    }
  };

  const handleCompleteDemo = () => {
    const success = completeFlow({ 
      completedAt: new Date().toISOString(),
      demoData 
    });
    
    if (success) {
      console.log('✅ Linear Navigation Demo: Completed flow');
    }
  };

  const handleCancelDemo = () => {
    const success = cancelFlow();
    
    if (success) {
      console.log('🚫 Linear Navigation Demo: Cancelled flow');
    }
  };

  const handleOpenModal = (type) => {
    openModal({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Modal Demo`,
      deviationType: type,
      preserveNavigation: true,
      showReturnButton: true
    });
  };

  const flowInfo = getCurrentFlowInfo();

  return (
    <div className="linear-navigation-example">
      <div className="demo-header">
        <h1>Linear Navigation System Demo</h1>
        <p>
          This demo shows the step-by-step navigation system with Navigation Guard/Stack.
          Users must move sequentially, but can use modals for temporary actions.
        </p>
      </div>

      {/* Demo Controls */}
      <div className="demo-controls">
        <h3>Demo Controls</h3>
        <div className="control-buttons">
          <button 
            className="demo-btn start-btn"
            onClick={handleStartDemo}
            disabled={isLinearMode}
          >
            <FiPlay />
            Start Linear Flow
          </button>
          
          <button 
            className="demo-btn complete-btn"
            onClick={handleCompleteDemo}
            disabled={!isLinearMode || !flowInfo?.isLastStep}
          >
            <FiSquare />
            Complete Flow
          </button>
          
          <button 
            className="demo-btn cancel-btn"
            onClick={handleCancelDemo}
            disabled={!isLinearMode}
          >
            <FiRotateCcw />
            Cancel Flow
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      {isLinearMode && (
        <div className="demo-section">
          <h3>Progress Indicator</h3>
          <ProgressIndicator 
            showControls={true}
            showStepNames={true}
            compact={false}
          />
        </div>
      )}

      {/* Modal Demos */}
      <div className="demo-section">
        <h3>Temporary Deviation Demos (Jump Out/Jump In)</h3>
        <p>
          These modals demonstrate temporary deviations from linear flow.
          Your navigation progress is preserved and you can return exactly where you left off.
        </p>
        
        <div className="modal-demo-buttons">
          <button 
            className="demo-btn modal-btn"
            onClick={() => handleOpenModal('modal')}
          >
            <FiInfo />
            Info Modal
          </button>
          
          <button 
            className="demo-btn popup-btn"
            onClick={() => handleOpenModal('popup')}
          >
            <FiSettings />
            Settings Popup
          </button>
          
          <button 
            className="demo-btn error-btn"
            onClick={() => handleOpenModal('error')}
          >
            <FiAlertTriangle />
            Error Dialog
          </button>
        </div>
      </div>

      {/* Current State Display */}
      <div className="demo-section">
        <h3>Current Navigation State</h3>
        <div className="state-display">
          <div className="state-item">
            <strong>Linear Mode:</strong> {isLinearMode ? '✅ Active' : '❌ Inactive'}
          </div>
          
          {flowInfo && (
            <>
              <div className="state-item">
                <strong>Current Flow:</strong> {flowInfo.flowName}
              </div>
              <div className="state-item">
                <strong>Current Step:</strong> {flowInfo.currentStep + 1} of {flowInfo.totalSteps}
              </div>
              <div className="state-item">
                <strong>Step Title:</strong> {flowInfo.currentStepInfo.title}
              </div>
              <div className="state-item">
                <strong>Progress:</strong> {Math.round(flowInfo.progress)}%
              </div>
              <div className="state-item">
                <strong>Can Go Next:</strong> {flowInfo.canGoNext ? '✅' : '❌'}
              </div>
              <div className="state-item">
                <strong>Can Go Previous:</strong> {flowInfo.canGoPrevious ? '✅' : '❌'}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation History */}
      {navigationHistory.length > 0 && (
        <div className="demo-section">
          <h3>Navigation History</h3>
          <div className="history-list">
            {navigationHistory.map((entry, index) => (
              <div key={index} className="history-item">
                <div className="history-flow">Flow: {entry.flowId}</div>
                <div className="history-date">
                  Completed: {new Date(entry.completedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="demo-section">
        <h3>How to Test</h3>
        <div className="instructions">
          <ol>
            <li><strong>Start Linear Flow:</strong> Click "Start Linear Flow" to begin the demo</li>
            <li><strong>Navigate Steps:</strong> Use the progress indicator controls to move between steps</li>
            <li><strong>Try Unauthorized Navigation:</strong> Try to navigate directly to other pages - you'll be redirected</li>
            <li><strong>Test Modal Deviations:</strong> Open modals to see temporary deviation handling</li>
            <li><strong>Return Path:</strong> Notice how you return to exactly where you left off</li>
            <li><strong>Complete Flow:</strong> Finish all steps to complete the flow</li>
          </ol>
        </div>
      </div>

      {/* Modal Component */}
      <ModalComponent>
        <div className="modal-demo-content">
          <h4>Temporary Deviation Demo</h4>
          <p>
            This is a temporary deviation from the linear navigation flow.
            Your progress is preserved and you can return to exactly where you left off.
          </p>
          
          <div className="modal-features">
            <h5>Features Demonstrated:</h5>
            <ul>
              <li>✅ Navigation state preservation</li>
              <li>✅ Return path maintenance</li>
              <li>✅ No loss of progress</li>
              <li>✅ Seamless return experience</li>
            </ul>
          </div>
          
          <div className="modal-actions">
            <button className="demo-btn" onClick={closeModal}>
              Close and Return
            </button>
          </div>
        </div>
      </ModalComponent>
    </div>
  );
};

export default LinearNavigationExample;