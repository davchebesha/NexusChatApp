/**
 * ModalNavigationHandler - Handles temporary deviations (Jump Out) with Return Path preservation
 * CRITICAL: Ensures users don't lose their place when returning from popups/modals
 */

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiArrowLeft } from 'react-icons/fi';
import './ModalNavigationHandler.css';

const ModalNavigationHandler = ({
  isOpen,
  onClose,
  title,
  children,
  deviationType = 'modal', // 'modal', 'popup', 'notification', 'error'
  preserveNavigation = true,
  showReturnButton = true,
  className = ''
}) => {
  const [deviationId, setDeviationId] = React.useState(null);

  // CRITICAL: Start temporary deviation when modal opens
  useEffect(() => {
    if (isOpen && preserveNavigation && window.nexusNavigationGuard) {
      const id = window.nexusNavigationGuard.startTemporaryDeviation(
        deviationType,
        window.location.pathname,
        { title, timestamp: new Date().toISOString() }
      );
      
      if (id) {
        setDeviationId(id);
        console.log('🔄 Modal Navigation: Started deviation', { id, type: deviationType, title });
      }
    }
  }, [isOpen, preserveNavigation, deviationType, title]);

  // CRITICAL: Return from deviation when modal closes
  const handleClose = useCallback(() => {
    if (deviationId && window.nexusNavigationGuard) {
      const success = window.nexusNavigationGuard.returnFromDeviation(deviationId);
      if (success) {
        console.log('✅ Modal Navigation: Returned from deviation', deviationId);
      }
      setDeviationId(null);
    }
    
    if (onClose) {
      onClose();
    }
  }, [deviationId, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className={`modal-navigation-overlay ${className}`}>
      <div className="modal-navigation-backdrop" onClick={handleClose} />
      
      <div className={`modal-navigation-container ${deviationType}`}>
        {/* Modal Header */}
        <div className="modal-navigation-header">
          <div className="modal-title-section">
            {showReturnButton && deviationId && (
              <button 
                className="return-button"
                onClick={handleClose}
                title="Return to previous location"
              >
                <FiArrowLeft />
              </button>
            )}
            <h2 className="modal-title">{title}</h2>
          </div>
          
          <button 
            className="close-button"
            onClick={handleClose}
            title="Close"
          >
            <FiX />
          </button>
        </div>

        {/* Navigation Preservation Indicator */}
        {preserveNavigation && deviationId && (
          <div className="navigation-preservation-indicator">
            <div className="preservation-badge">
              🔄 Navigation preserved - you can return to your previous location
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="modal-navigation-content">
          {children}
        </div>

        {/* Modal Footer with Return Option */}
        {showReturnButton && deviationId && (
          <div className="modal-navigation-footer">
            <button 
              className="return-navigation-button"
              onClick={handleClose}
            >
              <FiArrowLeft />
              Return to Previous Step
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// CRITICAL: Enhanced Modal Hook with Navigation Preservation
export const useModalNavigation = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [modalProps, setModalProps] = React.useState({});

  const openModal = useCallback((props = {}) => {
    setModalProps(props);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalProps({});
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    modalProps,
    ModalComponent: (props) => (
      <ModalNavigationHandler
        isOpen={isOpen}
        onClose={closeModal}
        {...modalProps}
        {...props}
      />
    )
  };
};

export default ModalNavigationHandler;