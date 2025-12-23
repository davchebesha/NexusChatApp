import React, { useState } from 'react';
import { FiSettings, FiDroplet, FiUser, FiBell, FiShield, FiInfo, FiMessageSquare, FiChevronRight, FiChevronDown, FiArrowLeft, FiNavigation } from 'react-icons/fi';
import ThemeSettings from './ThemeSettings';
import ProfileSettings from './ProfileSettings';
import NotificationSettings from './NotificationSettings';
import ChattingSettings from './ChattingSettings';
import AboutNexus from './AboutNexus';
import PrivacySettings from './PrivacySettings';
import SettingsFlow from './SettingsFlow';
import { useNavigation } from '../../contexts/NavigationContext';
import './SettingsPage.css';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [expandedTab, setExpandedTab] = useState(null);
  const [showGuidedSetup, setShowGuidedSetup] = useState(false);
  const { startFlow } = useNavigation();

  const tabs = [
    { id: 'theme', label: 'Theme & Appearance', icon: <FiDroplet /> },
    { id: 'profile', label: 'Profile', icon: <FiUser /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
    { id: 'chatting', label: 'Chatting Settings', icon: <FiMessageSquare /> },
    { id: 'privacy', label: 'Privacy & Security', icon: <FiShield /> },
    { id: 'about', label: 'About Nexus', icon: <FiInfo /> }
  ];

  const handleTabClick = (tabId) => {
    if (expandedTab === tabId) {
      // If clicking on already expanded tab, collapse it
      setExpandedTab(null);
      setActiveTab(null);
    } else {
      // Expand the clicked tab
      setExpandedTab(tabId);
      setActiveTab(tabId);
    }
  };

  const handleBackToList = () => {
    setExpandedTab(null);
    setActiveTab(null);
  };

  const handleStartGuidedSetup = () => {
    setShowGuidedSetup(true);
  };

  const handleExitGuidedSetup = () => {
    setShowGuidedSetup(false);
  };

  const renderTabContent = (tabId) => {
    switch (tabId) {
      case 'theme':
        return <ThemeSettings />;
      case 'profile':
        return <ProfileSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'chatting':
        return <ChattingSettings />;
      case 'privacy':
        return <PrivacySettings />;
      case 'about':
        return <AboutNexus />;
      default:
        return null;
    }
  };

  // Show guided setup if requested
  if (showGuidedSetup) {
    return <SettingsFlow onExit={handleExitGuidedSetup} />;
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <FiSettings className="settings-icon" />
        <h1>Settings</h1>
      </div>
      
      <div className="settings-container">
        <div className="settings-sidebar">
          {!expandedTab ? (
            // Main settings list
            <div className="settings-list">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  <div className="tab-content">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                  <FiChevronRight className="tab-arrow" />
                </button>
              ))}
            </div>
          ) : (
            // Expanded tab content within sidebar
            <div className="expanded-tab-content">
              <div className="expanded-tab-header">
                <button className="back-btn" onClick={handleBackToList}>
                  <FiArrowLeft />
                </button>
                <div className="expanded-tab-info">
                  {tabs.find(tab => tab.id === expandedTab)?.icon}
                  <span>{tabs.find(tab => tab.id === expandedTab)?.label}</span>
                </div>
              </div>
              <div className="expanded-tab-body">
                {renderTabContent(expandedTab)}
              </div>
            </div>
          )}
        </div>
        
        <div className="settings-main">
          {!expandedTab ? (
            <div className="settings-welcome">
              <div className="welcome-content">
                <FiSettings className="welcome-icon" />
                <h2>Settings</h2>
                <p>Select a setting from the sidebar to configure your Nexus ChatApp experience.</p>
                
                <div className="guided-setup-prompt">
                  <button 
                    className="btn btn-primary guided-setup-btn"
                    onClick={handleStartGuidedSetup}
                  >
                    <FiNavigation />
                    Start Guided Setup
                  </button>
                  <p className="guided-setup-description">
                    Let us walk you through configuring your preferences step by step
                  </p>
                </div>
                
                <div className="settings-overview">
                  <div className="overview-item">
                    <FiDroplet />
                    <span>Customize themes and appearance</span>
                  </div>
                  <div className="overview-item">
                    <FiUser />
                    <span>Manage your profile information</span>
                  </div>
                  <div className="overview-item">
                    <FiBell />
                    <span>Configure notification preferences</span>
                  </div>
                  <div className="overview-item">
                    <FiMessageSquare />
                    <span>Adjust chatting and messaging settings</span>
                  </div>
                  <div className="overview-item">
                    <FiShield />
                    <span>Control privacy and security options</span>
                  </div>
                  <div className="overview-item">
                    <FiInfo />
                    <span>Learn about Nexus ChatApp</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="settings-main-content">
              {renderTabContent(expandedTab)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;