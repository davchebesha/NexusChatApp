/**
 * NexusChatApp - Complete Integration Example
 * Shows all implemented features working together
 */

import React, { useState, useEffect } from 'react';
import { 
  NavigationGuardProvider,
  LinearNavigationExample 
} from '../Navigation';
import { SmartFileManager } from '../FileManagement';
import { MediaViewer } from '../MediaViewer';
import { BackgroundCustomizer } from '../BackgroundCustomizer';
import { TelegramVoiceRecorder } from '../Voice';
import './NexusChatApp.css';

const NexusChatApp = () => {
  const [currentView, setCurrentView] = useState('onboarding'); // 'onboarding' | 'chat' | 'files'
  const [customBackground, setCustomBackground] = useState(null);
  const [files, setFiles] = useState([
    // Sample files for demonstration
    {
      id: 'sample1',
      name: 'Sample Image.jpg',
      type: 'image/jpeg',
      size: 1024000,
      url: 'https://picsum.photos/800/600?random=1',
      timestamp: Date.now() - 3600000
    },
    {
      id: 'sample2',
      name: 'Sample Video.mp4',
      type: 'video/mp4',
      size: 5120000,
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      timestamp: Date.now() - 7200000
    }
  ]);

  // Load saved background on mount
  useEffect(() => {
    const savedBackground = localStorage.getItem('nexus-custom-background');
    if (savedBackground) {
      try {
        const backgroundData = JSON.parse(savedBackground);
        setCustomBackground(backgroundData);
        applyBackground(backgroundData);
      } catch (error) {
        console.error('Failed to load saved background:', error);
      }
    }
  }, []);

  // Apply background to the app
  const applyBackground = (backgroundData) => {
    if (!backgroundData) {
      // Reset to default background
      document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
      return;
    }

    const { url, settings } = backgroundData;
    document.body.style.background = `
      linear-gradient(rgba(0,0,0,${1 - settings.opacity}), rgba(0,0,0,${1 - settings.opacity})),
      url(${url})
    `;
    document.body.style.backgroundSize = settings.size;
    document.body.style.backgroundPosition = settings.position;
    document.body.style.backgroundAttachment = 'fixed';
  };

  // Handle background change
  const handleBackgroundChange = (backgroundData) => {
    setCustomBackground(backgroundData);
    applyBackground(backgroundData);
  };

  // Handle onboarding completion
  const handleOnboardingComplete = (data) => {
    console.log('Onboarding completed:', data);
    setCurrentView('chat');
  };

  // Handle file actions
  const handleFileAction = (action, file, data) => {
    console.log('File action:', action, file, data);
    
    switch (action) {
      case 'voice_message':
        setFiles(prev => [file, ...prev]);
        break;
      case 'download_complete':
        console.log('Download completed:', data);
        break;
      case 'more':
        console.log('More options for:', file);
        break;
      default:
        break;
    }
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'onboarding':
        return (
          <NavigationGuardProvider>
            <LinearNavigationExample 
              onComplete={handleOnboardingComplete}
            />
          </NavigationGuardProvider>
        );
      
      case 'chat':
        return (
          <div className=\"chat-view\">\n            <div className=\"chat-header\">\n              <h2>Nexus ChatApp</h2>\n              <div className=\"view-switcher\">\n                <button \n                  className={`view-btn ${currentView === 'chat' ? 'active' : ''}`}\n                  onClick={() => setCurrentView('chat')}\n                >\n                  Chat\n                </button>\n                <button \n                  className={`view-btn ${currentView === 'files' ? 'active' : ''}`}\n                  onClick={() => setCurrentView('files')}\n                >\n                  Files\n                </button>\n              </div>\n            </div>\n            \n            <div className=\"chat-content\">\n              <div className=\"messages-area\">\n                <div className=\"welcome-message\">\n                  <h3>🎉 Welcome to Nexus ChatApp!</h3>\n                  <p>Your setup is complete. Start chatting or manage your files.</p>\n                </div>\n              </div>\n              \n              <div className=\"chat-input-area\">\n                <TelegramVoiceRecorder\n                  onVoiceMessage={(voiceData) => {\n                    const voiceFile = {\n                      id: `voice_${Date.now()}`,\n                      name: `Voice Message ${new Date().toLocaleTimeString()}`,\n                      type: 'audio/webm',\n                      size: voiceData.blob.size,\n                      url: voiceData.url,\n                      duration: voiceData.duration,\n                      waveform: voiceData.waveform,\n                      isVoiceMessage: true,\n                      timestamp: voiceData.timestamp\n                    };\n                    setFiles(prev => [voiceFile, ...prev]);\n                  }}\n                  onCancel={() => console.log('Voice recording cancelled')}\n                />\n              </div>\n            </div>\n          </div>\n        );\n      \n      case 'files':\n        return (\n          <div className=\"files-view\">\n            <div className=\"files-header\">\n              <h2>Files & Media</h2>\n              <div className=\"view-switcher\">\n                <button \n                  className={`view-btn ${currentView === 'chat' ? 'active' : ''}`}\n                  onClick={() => setCurrentView('chat')}\n                >\n                  Chat\n                </button>\n                <button \n                  className={`view-btn ${currentView === 'files' ? 'active' : ''}`}\n                  onClick={() => setCurrentView('files')}\n                >\n                  Files\n                </button>\n              </div>\n            </div>\n            \n            <SmartFileManager\n              files={files}\n              onFileAction={handleFileAction}\n              onBackgroundChange={handleBackgroundChange}\n              currentBackground={customBackground}\n            />\n          </div>\n        );\n      \n      default:\n        return null;\n    }\n  };\n\n  return (\n    <div className=\"nexus-chat-app\">\n      {renderCurrentView()}\n      \n      {/* Debug Panel */}\n      <div className=\"debug-panel\">\n        <h4>🛠️ Debug Controls</h4>\n        <div className=\"debug-buttons\">\n          <button onClick={() => setCurrentView('onboarding')}>Reset Onboarding</button>\n          <button onClick={() => setCurrentView('chat')}>Go to Chat</button>\n          <button onClick={() => setCurrentView('files')}>Go to Files</button>\n          <button onClick={() => handleBackgroundChange(null)}>Reset Background</button>\n        </div>\n        <div className=\"debug-info\">\n          <p><strong>Current View:</strong> {currentView}</p>\n          <p><strong>Files Count:</strong> {files.length}</p>\n          <p><strong>Custom Background:</strong> {customBackground ? 'Yes' : 'No'}</p>\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default NexusChatApp;"