import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import ChatInfo from './ChatInfo';
import ResizeHandle from './ResizeHandle';
import OnboardingTrigger from '../Navigation/OnboardingTrigger';
import useDualSidebarManager from './DualSidebarManager';
import { useChat } from '../../contexts/ChatContext';
import { FiInfo, FiUsers, FiSettings, FiX, FiMenu } from 'react-icons/fi';
import Logo from '../Common/Logo';
import './Chat.css';

const ChatLayout = () => {
  const { selectedChat } = useChat();
  const [showChatInfo, setShowChatInfo] = useState(false);
  
  // CRITICAL: Use the enhanced independent dual sidebar manager
  const {
    leftSidebar,
    rightSidebar,
    screenInfo,
    toggleLeftSidebar,
    toggleRightSidebar,
    resizeLeftSidebar,
    resizeRightSidebar,
    showRightSidebar,
    hideRightSidebar,
    getMainChatMargins
  } = useDualSidebarManager();

  // CRITICAL: Auto-show chat info for group chats with Telegram-style behavior
  const handleShowChatInfo = () => {
    showRightSidebar(); // This will handle mobile sidebar switching automatically
    setShowChatInfo(true);
  };

  const handleCloseChatInfo = () => {
    setShowChatInfo(false);
    hideRightSidebar();
  };

  const mainContent = selectedChat ? (
    <ChatWindow 
      onShowInfo={handleShowChatInfo}
      showChatInfo={showChatInfo}
    />
  ) : (
    <div className="no-chat-selected">
      <div className="no-chat-content">
        <Logo size="xl" showText={true} />
        <h2>Welcome to Nexus ChatApp</h2>
        <p>Select a chat to start messaging or create a new conversation</p>
        <div className="no-chat-features">
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <div className="feature-text">
              <strong>End-to-end encrypted</strong>
              <span>Your messages are secure and private</span>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <div className="feature-text">
              <strong>Real-time messaging</strong>
              <span>Instant delivery and read receipts</span>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🌐</span>
            <div className="feature-text">
              <strong>Cross-platform sync</strong>
              <span>Access your chats from any device</span>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">👥</span>
            <div className="feature-text">
              <strong>Group conversations</strong>
              <span>Chat with multiple people at once</span>
            </div>
          </div>
        </div>
        <div className="welcome-actions">
          <button className="btn btn-primary">
            <FiUsers />
            Start New Chat
          </button>
          <button className="btn btn-outline">
            <FiSettings />
            Settings
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`dual-sidebar-chat-layout ${screenInfo.isMobile ? 'mobile' : screenInfo.isTablet ? 'tablet' : 'desktop'} ${(leftSidebar.isOpen || rightSidebar.isOpen) && screenInfo.isMobile ? 'sidebar-open' : ''}`}>
      {/* CRITICAL: Mobile Overlay with Telegram-style backdrop */}
      {screenInfo.isMobile && (leftSidebar.isOpen || rightSidebar.isOpen) && (
        <div 
          className="mobile-overlay" 
          onClick={() => {
            if (leftSidebar.isOpen) toggleLeftSidebar();
            if (rightSidebar.isOpen) toggleRightSidebar();
          }}
        />
      )}
      
      {/* Onboarding Trigger */}
      <OnboardingTrigger />
      
      {/* CRITICAL: Left Sidebar - Independent State Management */}
      <div 
        className={`sidebar-container left-sidebar-container ${leftSidebar.isOpen ? 'open' : 'closed'} ${leftSidebar.isCollapsed ? 'collapsed' : ''} ${leftSidebar.isResizing ? 'resizing' : ''}`}
        style={{ 
          width: screenInfo.isMobile 
            ? (leftSidebar.isOpen ? '85%' : '0') 
            : leftSidebar.isCollapsed 
              ? '72px' 
              : `${leftSidebar.width}px`,
          maxWidth: screenInfo.isMobile ? '320px' : 'none'
        }}
      >
        <Sidebar 
          show={leftSidebar.isOpen || !screenInfo.isMobile}
          isCollapsed={leftSidebar.isCollapsed && !screenInfo.isMobile}
          showIconsOnly={leftSidebar.isCollapsed && !screenInfo.isMobile}
          className={leftSidebar.isResizing ? 'resizing' : ''}
        />
        
        {/* CRITICAL: Resize Handle for Left Sidebar - Independent Control */}
        {!screenInfo.isMobile && !leftSidebar.isCollapsed && leftSidebar.isOpen && (
          <ResizeHandle
            onResize={resizeLeftSidebar}
            minWidth={280}
            maxWidth={500}
            initialWidth={leftSidebar.width}
            side="right"
          />
        )}
      </div>

      {/* CRITICAL: Main Chat Area - Independent of Sidebar States */}
      <div className="main-chat-area">
        {/* CRITICAL: Chat Header with Enhanced Mobile/Desktop Controls */}
        <div className="chat-header-bar">
          <div className="chat-header-info">
            {/* CRITICAL: Mobile menu button with Telegram-style behavior */}
            {screenInfo.isMobile && (
              <button 
                className="header-action-btn mobile-menu-btn"
                onClick={toggleLeftSidebar}
                title="Toggle sidebar"
              >
                <FiMenu />
              </button>
            )}
            
            {/* CRITICAL: Desktop collapse button with independent control */}
            {!screenInfo.isMobile && (
              <button 
                className="header-action-btn collapse-btn"
                onClick={toggleLeftSidebar}
                title={leftSidebar.isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <FiMenu />
              </button>
            )}

            {selectedChat && (
              <>
                <img 
                  src={selectedChat.type === 'group' 
                    ? (selectedChat.avatar || '/default-group.png')
                    : (selectedChat.participants?.find(p => p._id !== selectedChat.currentUserId)?.avatar || '/default-avatar.png')
                  } 
                  alt="Chat Avatar" 
                  className="avatar avatar-sm"
                />
                <div className="chat-header-text">
                  <h3>
                    {selectedChat.type === 'group' 
                      ? selectedChat.name 
                      : selectedChat.participants?.find(p => p._id !== selectedChat.currentUserId)?.username || 'Unknown'
                    }
                  </h3>
                  <span className="chat-status">
                    {selectedChat.type === 'group' 
                      ? `${selectedChat.participants?.length || 0} members`
                      : 'Online'
                    }
                  </span>
                </div>
              </>
            )}
          </div>
          
          {selectedChat && (
            <div className="chat-header-actions">
              <button 
                className={`header-action-btn ${showChatInfo ? 'active' : ''}`}
                onClick={showChatInfo ? handleCloseChatInfo : handleShowChatInfo}
                title={showChatInfo ? 'Hide chat info' : 'Show chat info'}
              >
                {showChatInfo ? <FiX /> : <FiInfo />}
              </button>
            </div>
          )}
        </div>

        {/* CRITICAL: Chat Content - Unaffected by Sidebar State Changes */}
        <div className="chat-content-wrapper">
          {mainContent}
        </div>
      </div>

      {/* CRITICAL: Right Sidebar - Independent State Management */}
      {showChatInfo && selectedChat && (
        <div 
          className={`sidebar-container right-sidebar-container ${rightSidebar.isOpen ? 'open' : 'closed'} ${rightSidebar.isResizing ? 'resizing' : ''}`}
          style={{ 
            width: screenInfo.isMobile 
              ? (rightSidebar.isOpen ? '85%' : '0') 
              : rightSidebar.isOpen 
                ? `${rightSidebar.width}px` 
                : '0',
            maxWidth: screenInfo.isMobile ? '320px' : 'none'
          }}
        >
          {/* CRITICAL: Resize Handle for Right Sidebar - Independent Control */}
          {!screenInfo.isMobile && rightSidebar.isOpen && (
            <ResizeHandle
              onResize={resizeRightSidebar}
              minWidth={280}
              maxWidth={500}
              initialWidth={rightSidebar.width}
              side="left"
            />
          )}
          
          <div className="right-sidebar">
            <ChatInfo 
              chat={selectedChat} 
              onClose={handleCloseChatInfo}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatLayout;
