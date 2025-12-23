import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FiMenu, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './DualSidebarLayout.css';

const DualSidebarLayout = ({ 
  leftSidebar, 
  rightSidebar, 
  children, 
  leftSidebarWidth = 280,
  rightSidebarWidth = 320,
  showRightSidebar = false 
}) => {
  const { theme } = useTheme();
  // Desktop collapsed state (controls layout/margins)
  const [leftCollapsedDesktop, setLeftCollapsedDesktop] = useState(false);
  const [rightCollapsedDesktop, setRightCollapsedDesktop] = useState(!showRightSidebar);
  // Mobile overlay state (independent from desktop)
  const [leftMobileOpen, setLeftMobileOpen] = useState(false);
  const [rightMobileOpen, setRightMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // Preserve desktop collapsed state when switching to mobile; mobile overlay
      // is separate and should be closed on breakpoint changes
      if (mobile) {
        setLeftMobileOpen(false);
        setRightMobileOpen(false);
      } else {
        // ensure mobile overlays are closed when returning to desktop
        setLeftMobileOpen(false);
        setRightMobileOpen(false);
        // keep desktop collapsed defaults (don't force open/close)
        setLeftCollapsedDesktop((v) => v);
        setRightCollapsedDesktop((v) => v);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [showRightSidebar]);

  const toggleLeftSidebar = () => {
    if (isMobile) {
      setLeftMobileOpen((open) => !open);
    } else {
      setLeftCollapsedDesktop((c) => !c);
    }
  };

  const toggleRightSidebar = () => {
    if (isMobile) {
      setRightMobileOpen((open) => !open);
    } else {
      setRightCollapsedDesktop((c) => !c);
    }
  };

  const closeMobileMenus = () => {
    if (isMobile) {
      setLeftMobileOpen(false);
      setRightMobileOpen(false);
    }
  };

  return (
    <div className="dual-sidebar-layout" data-theme={theme?.name}>
      {/* Mobile Overlay */}
      {isMobile && (leftMobileOpen || rightMobileOpen) && (
        <div className="mobile-overlay" onClick={closeMobileMenus} />
      )}

      {/* Left Sidebar */}
      <div 
        className={`left-sidebar ${leftCollapsedDesktop ? 'collapsed' : ''} ${isMobile && leftMobileOpen ? 'mobile-open' : ''}`}
        style={{ 
          width: isMobile ? (leftMobileOpen ? `${leftSidebarWidth}px` : '0px') : (leftCollapsedDesktop ? '60px' : `${leftSidebarWidth}px`)
        }}
        aria-hidden={isMobile && !leftMobileOpen}
      >
        <div className="sidebar-content">
          {leftSidebar}
        </div>
        
        {!isMobile && (
          <button 
            className="sidebar-toggle left-toggle"
            onClick={toggleLeftSidebar}
            title={leftCollapsedDesktop ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {leftCollapsedDesktop ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div 
        className="main-content"
        style={{
          marginLeft: isMobile ? '0' : (leftCollapsedDesktop ? '60px' : `${leftSidebarWidth}px`),
          marginRight: isMobile ? '0' : (rightCollapsedDesktop ? '0' : `${rightSidebarWidth}px`)
        }}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="mobile-header">
            <button className="mobile-menu-btn" onClick={toggleLeftSidebar}>
              {leftMobileOpen ? <FiX /> : <FiMenu />}
            </button>
            <h1>Nexus ChatApp</h1>
            {showRightSidebar && (
              <button className="mobile-menu-btn" onClick={toggleRightSidebar}>
                {rightMobileOpen ? <FiX /> : <FiMenu />}
              </button>
            )}
          </div>
        )}

        <div className="content-wrapper">
          {children}
        </div>
      </div>

      {/* Right Sidebar */}
      {showRightSidebar && (
        <div 
          className={`right-sidebar ${rightCollapsed ? 'collapsed' : ''}`}
          style={{ 
            width: rightCollapsed ? '0' : `${rightSidebarWidth}px` 
          }}
        >
          <div className="sidebar-content">
            {rightSidebar}
          </div>
          
          {!isMobile && (
            <button 
              className="sidebar-toggle right-toggle"
              onClick={toggleRightSidebar}
              title={rightCollapsed ? 'Show sidebar' : 'Hide sidebar'}
            >
              {rightCollapsed ? <FiChevronLeft /> : <FiChevronRight />}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DualSidebarLayout;