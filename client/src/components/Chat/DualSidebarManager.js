/**
 * DualSidebarManager - Independent State Management for Telegram-style Dual Sidebars
 * Ensures sidebars can collapse/expand independently without affecting main chat view
 * 
 * CRITICAL FEATURES:
 * - Independent state management for each sidebar
 * - Telegram-style behavior on mobile and desktop
 * - No interference between sidebars and main chat area
 * - Smooth transitions and animations
 * - Persistent state across sessions
 */

import { useState, useEffect, useCallback } from 'react';

const useDualSidebarManager = () => {
  // Independent state management for each sidebar
  const [leftSidebar, setLeftSidebar] = useState(() => {
    const saved = localStorage.getItem('nexus-left-sidebar-state');
    return saved ? JSON.parse(saved) : {
      isOpen: true,
      isCollapsed: false,
      width: 380,
      isResizing: false,
      telegramStyle: true // Enable Telegram-style behavior
    };
  });

  const [rightSidebar, setRightSidebar] = useState(() => {
    const saved = localStorage.getItem('nexus-right-sidebar-state');
    return saved ? JSON.parse(saved) : {
      isOpen: false,
      isCollapsed: false,
      width: 380,
      isResizing: false,
      telegramStyle: true // Enable Telegram-style behavior
    };
  });

  // Screen size detection with enhanced mobile/tablet detection
  const [screenInfo, setScreenInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: window.innerWidth,
    height: window.innerHeight,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  });

  // Update screen info with enhanced detection
  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const mobile = width <= 768;
      const tablet = width > 768 && width <= 1024;
      const desktop = width > 1024;
      const orientation = width > height ? 'landscape' : 'portrait';

      setScreenInfo({
        isMobile: mobile,
        isTablet: tablet,
        isDesktop: desktop,
        width,
        height,
        orientation
      });

      // CRITICAL: Telegram-style mobile behavior - only one sidebar at a time
      if (mobile) {
        if (leftSidebar.isOpen && rightSidebar.isOpen) {
          // Close right sidebar if both are open on mobile (Telegram behavior)
          updateRightSidebar({ isOpen: false });
        }
        // Ensure sidebars are not collapsed on mobile (Telegram behavior)
        if (leftSidebar.isCollapsed) {
          updateLeftSidebar({ isCollapsed: false });
        }
        if (rightSidebar.isCollapsed) {
          updateRightSidebar({ isCollapsed: false });
        }
      }
    };

    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', updateScreenInfo);
    
    return () => {
      window.removeEventListener('resize', updateScreenInfo);
      window.removeEventListener('orientationchange', updateScreenInfo);
    };
  }, [leftSidebar.isOpen, rightSidebar.isOpen, leftSidebar.isCollapsed, rightSidebar.isCollapsed]);

  // Persist sidebar state to localStorage
  const persistLeftSidebar = useCallback((newState) => {
    localStorage.setItem('nexus-left-sidebar-state', JSON.stringify(newState));
  }, []);

  const persistRightSidebar = useCallback((newState) => {
    localStorage.setItem('nexus-right-sidebar-state', JSON.stringify(newState));
  }, []);

  // Left sidebar controls
  const updateLeftSidebar = useCallback((updates) => {
    setLeftSidebar(prev => {
      const newState = { ...prev, ...updates };
      persistLeftSidebar(newState);
      return newState;
    });
  }, [persistLeftSidebar]);

  // CRITICAL: Enhanced left sidebar controls with Telegram-style behavior
  const toggleLeftSidebar = useCallback(() => {
    if (screenInfo.isMobile) {
      // Mobile: Telegram-style toggle open/close, close right sidebar if opening left
      const newIsOpen = !leftSidebar.isOpen;
      updateLeftSidebar({ isOpen: newIsOpen });
      
      // CRITICAL: Ensure only one sidebar open at a time on mobile (Telegram behavior)
      if (newIsOpen && rightSidebar.isOpen) {
        updateRightSidebar({ isOpen: false });
      }
    } else {
      // Desktop/Tablet: Toggle collapsed state (Telegram desktop behavior)
      const newIsCollapsed = !leftSidebar.isCollapsed;
      updateLeftSidebar({ isCollapsed: newIsCollapsed });
      
      // If collapsing, ensure it's still considered "open" for layout purposes
      if (newIsCollapsed && !leftSidebar.isOpen) {
        updateLeftSidebar({ isOpen: true, isCollapsed: newIsCollapsed });
      }
    }
  }, [screenInfo.isMobile, leftSidebar.isOpen, leftSidebar.isCollapsed, rightSidebar.isOpen]);

  const resizeLeftSidebar = useCallback((newWidth) => {
    const screenWidth = screenInfo.width;
    const minChatWidth = 400;
    const rightSidebarWidth = rightSidebar.isOpen ? rightSidebar.width : 0;
    const maxAllowedWidth = screenWidth - minChatWidth - rightSidebarWidth;
    
    const constrainedWidth = Math.max(280, Math.min(500, Math.min(maxAllowedWidth, newWidth)));
    
    updateLeftSidebar({ 
      width: constrainedWidth,
      isResizing: true
    });
    
    // Clear resizing state after animation
    setTimeout(() => {
      updateLeftSidebar({ isResizing: false });
    }, 100);
  }, [screenInfo.width, rightSidebar.isOpen, rightSidebar.width]);

  // Right sidebar controls
  const updateRightSidebar = useCallback((updates) => {
    setRightSidebar(prev => {
      const newState = { ...prev, ...updates };
      persistRightSidebar(newState);
      return newState;
    });
  }, [persistRightSidebar]);

  // CRITICAL: Enhanced right sidebar controls with Telegram-style behavior
  const toggleRightSidebar = useCallback(() => {
    if (screenInfo.isMobile) {
      // Mobile: Telegram-style toggle open/close, close left sidebar if opening right
      const newIsOpen = !rightSidebar.isOpen;
      updateRightSidebar({ isOpen: newIsOpen });
      
      // CRITICAL: Ensure only one sidebar open at a time on mobile (Telegram behavior)
      if (newIsOpen && leftSidebar.isOpen) {
        updateLeftSidebar({ isOpen: false });
      }
    } else {
      // Desktop/Tablet: Toggle open/close (right sidebar doesn't collapse, just opens/closes)
      updateRightSidebar({ isOpen: !rightSidebar.isOpen });
    }
  }, [screenInfo.isMobile, rightSidebar.isOpen, leftSidebar.isOpen]);

  const resizeRightSidebar = useCallback((newWidth) => {
    const screenWidth = screenInfo.width;
    const minChatWidth = 400;
    const leftSidebarWidth = leftSidebar.isCollapsed ? 72 : leftSidebar.width;
    const maxAllowedWidth = screenWidth - minChatWidth - leftSidebarWidth;
    
    const constrainedWidth = Math.max(280, Math.min(500, Math.min(maxAllowedWidth, newWidth)));
    
    updateRightSidebar({ 
      width: constrainedWidth,
      isResizing: true
    });
    
    // Clear resizing state after animation
    setTimeout(() => {
      updateRightSidebar({ isResizing: false });
    }, 100);
  }, [screenInfo.width, leftSidebar.isCollapsed, leftSidebar.width]);

  // CRITICAL: Enhanced show/hide right sidebar with Telegram-style behavior
  const showRightSidebar = useCallback(() => {
    // CRITICAL: On mobile, close left sidebar when showing right (Telegram behavior)
    if (screenInfo.isMobile && leftSidebar.isOpen) {
      updateLeftSidebar({ isOpen: false });
    }
    updateRightSidebar({ isOpen: true });
  }, [screenInfo.isMobile, leftSidebar.isOpen]);

  const hideRightSidebar = useCallback(() => {
    updateRightSidebar({ isOpen: false });
  }, []);

  // CRITICAL: Force close sidebar (for emergency situations)
  const forceCloseSidebar = useCallback((side) => {
    if (side === 'left') {
      updateLeftSidebar({ isOpen: false, isCollapsed: false });
    } else if (side === 'right') {
      updateRightSidebar({ isOpen: false, isCollapsed: false });
    }
  }, []);

  // CRITICAL: Reset sidebars to default state
  const resetSidebars = useCallback(() => {
    updateLeftSidebar({ 
      isOpen: !screenInfo.isMobile, 
      isCollapsed: false, 
      width: 380 
    });
    updateRightSidebar({ 
      isOpen: false, 
      isCollapsed: false, 
      width: 380 
    });
  }, [screenInfo.isMobile]);

  // Calculate main chat area margins
  const getMainChatMargins = useCallback(() => {
    let leftMargin = 0;
    let rightMargin = 0;

    if (!screenInfo.isMobile) {
      // Desktop/Tablet: Calculate actual margins
      if (leftSidebar.isOpen && !leftSidebar.isCollapsed) {
        leftMargin = leftSidebar.width;
      } else if (leftSidebar.isCollapsed) {
        leftMargin = 72;
      }

      if (rightSidebar.isOpen) {
        rightMargin = rightSidebar.width;
      }
    }
    // Mobile: No margins (overlays)

    return { leftMargin, rightMargin };
  }, [screenInfo.isMobile, leftSidebar, rightSidebar]);

  return {
    // State
    leftSidebar,
    rightSidebar,
    screenInfo,
    
    // Controls
    toggleLeftSidebar,
    toggleRightSidebar,
    resizeLeftSidebar,
    resizeRightSidebar,
    showRightSidebar,
    hideRightSidebar,
    forceCloseSidebar,
    resetSidebars,
    
    // Utilities
    getMainChatMargins,
    
    // Direct state updates (for advanced use)
    updateLeftSidebar,
    updateRightSidebar
  };
};

export default useDualSidebarManager;