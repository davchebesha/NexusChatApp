import React, { useState } from 'react';
import { 
  FiMessageSquare, FiSend, FiImage, FiFile, FiMic, FiVideo,
  FiToggleLeft, FiToggleRight, FiClock, FiEye, FiDownload,
  FiTrash2, FiLock, FiGlobe, FiUsers, FiSmile
} from 'react-icons/fi';
import { useNotification } from '../../contexts/NotificationContext';
import './ChattingSettings.css';

const ChattingSettings = () => {
  const { showNotification } = useNotification();
  const [settings, setSettings] = useState({
    // Message Settings
    enterToSend: true,
    showTypingIndicator: true,
    showReadReceipts: true,
    showOnlineStatus: true,
    autoDownloadMedia: true,
    
    // Media Settings
    autoPlayVideos: false,
    autoPlayGifs: true,
    compressImages: true,
    maxFileSize: '50', // MB
    allowedFileTypes: ['image', 'document', 'video', 'audio'],
    
    // Chat Behavior
    groupChatNotifications: true,
    mentionNotifications: true,
    soundOnMessage: true,
    vibrationOnMessage: true,
    showMessagePreview: true,
    
    // Privacy Settings
    lastSeenVisibility: 'everyone', // everyone, contacts, nobody
    profilePhotoVisibility: 'everyone',
    statusVisibility: 'everyone',
    readReceiptVisibility: 'everyone',
    
    // Advanced Features
    messageEncryption: true,
    backupMessages: true,
    deleteMessagesAfter: 'never', // never, 1day, 7days, 30days
    archiveChatsAfter: 'never',
    
    // Emoji & Reactions
    enableEmojis: true,
    enableReactions: true,
    enableStickers: true,
    emojiSuggestions: true,
    
    // Voice & Video
    enableVoiceMessages: true,
    enableVideoMessages: true,
    voiceMessageQuality: 'medium', // low, medium, high
    videoCallQuality: 'auto' // auto, low, medium, high
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    showNotification(`${setting} ${!settings[setting] ? 'enabled' : 'disabled'}`, 'success');
  };

  const handleSelectChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleFileTypeToggle = (fileType) => {
    setSettings(prev => ({
      ...prev,
      allowedFileTypes: prev.allowedFileTypes.includes(fileType)
        ? prev.allowedFileTypes.filter(type => type !== fileType)
        : [...prev.allowedFileTypes, fileType]
    }));
  };

  const ToggleSwitch = ({ enabled, onToggle, label, description }) => (
    <div className="toggle-item">
      <div className="toggle-info">
        <div className="toggle-label">{label}</div>
        {description && <div className="toggle-description">{description}</div>}
      </div>
      <button 
        className={`toggle-switch ${enabled ? 'enabled' : 'disabled'}`}
        onClick={onToggle}
      >
        {enabled ? <FiToggleRight /> : <FiToggleLeft />}
      </button>
    </div>
  );

  const fileTypeOptions = [
    { type: 'image', label: 'Images', icon: <FiImage /> },
    { type: 'document', label: 'Documents', icon: <FiFile /> },
    { type: 'video', label: 'Videos', icon: <FiVideo /> },
    { type: 'audio', label: 'Audio', icon: <FiMic /> }
  ];

  const visibilityOptions = [
    { value: 'everyone', label: 'Everyone' },
    { value: 'contacts', label: 'My Contacts' },
    { value: 'nobody', label: 'Nobody' }
  ];

  const deleteOptions = [
    { value: 'never', label: 'Never' },
    { value: '1day', label: 'After 1 Day' },
    { value: '7days', label: 'After 7 Days' },
    { value: '30days', label: 'After 30 Days' }
  ];

  const qualityOptions = [
    { value: 'auto', label: 'Auto' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  return (
    <div className="chatting-settings">
      <div className="settings-header">
        <h2>Chatting Settings</h2>
        <p>Customize your messaging experience and chat behavior</p>
      </div>

      <div className="settings-sections">
        {/* Message Settings */}
        <div className="settings-section">
          <div className="section-header">
            <FiMessageSquare className="section-icon" />
            <h3>Message Settings</h3>
          </div>
          
          <div className="section-content">
            <ToggleSwitch
              enabled={settings.enterToSend}
              onToggle={() => handleToggle('enterToSend')}
              label="Enter to Send"
              description="Press Enter to send messages (Shift+Enter for new line)"
            />
            
            <ToggleSwitch
              enabled={settings.showTypingIndicator}
              onToggle={() => handleToggle('showTypingIndicator')}
              label="Show Typing Indicator"
              description="Let others know when you're typing"
            />
            
            <ToggleSwitch
              enabled={settings.showReadReceipts}
              onToggle={() => handleToggle('showReadReceipts')}
              label="Read Receipts"
              description="Show when messages have been read"
            />
            
            <ToggleSwitch
              enabled={settings.showOnlineStatus}
              onToggle={() => handleToggle('showOnlineStatus')}
              label="Online Status"
              description="Show your online/offline status to others"
            />
            
            <ToggleSwitch
              enabled={settings.showMessagePreview}
              onToggle={() => handleToggle('showMessagePreview')}
              label="Message Preview"
              description="Show message content in notifications"
            />
          </div>
        </div>

        {/* Media Settings */}
        <div className="settings-section">
          <div className="section-header">
            <FiImage className="section-icon" />
            <h3>Media & Files</h3>
          </div>
          
          <div className="section-content">
            <ToggleSwitch
              enabled={settings.autoDownloadMedia}
              onToggle={() => handleToggle('autoDownloadMedia')}
              label="Auto-download Media"
              description="Automatically download images and videos"
            />
            
            <ToggleSwitch
              enabled={settings.autoPlayVideos}
              onToggle={() => handleToggle('autoPlayVideos')}
              label="Auto-play Videos"
              description="Automatically play videos in chat"
            />
            
            <ToggleSwitch
              enabled={settings.autoPlayGifs}
              onToggle={() => handleToggle('autoPlayGifs')}
              label="Auto-play GIFs"
              description="Automatically play animated GIFs"
            />
            
            <ToggleSwitch
              enabled={settings.compressImages}
              onToggle={() => handleToggle('compressImages')}
              label="Compress Images"
              description="Reduce image file sizes for faster sending"
            />
            
            <div className="form-group">
              <label>Maximum File Size (MB)</label>
              <select
                value={settings.maxFileSize}
                onChange={(e) => handleSelectChange('maxFileSize', e.target.value)}
                className="settings-select"
              >
                <option value="10">10 MB</option>
                <option value="25">25 MB</option>
                <option value="50">50 MB</option>
                <option value="100">100 MB</option>
              </select>
            </div>
            
            <div className="file-types-section">
              <label>Allowed File Types</label>
              <div className="file-types-grid">
                {fileTypeOptions.map(option => (
                  <div 
                    key={option.type}
                    className={`file-type-item ${settings.allowedFileTypes.includes(option.type) ? 'enabled' : 'disabled'}`}
                    onClick={() => handleFileTypeToggle(option.type)}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="settings-section">
          <div className="section-header">
            <FiLock className="section-icon" />
            <h3>Privacy Settings</h3>
          </div>
          
          <div className="section-content">
            <div className="form-group">
              <label>Last Seen Visibility</label>
              <select
                value={settings.lastSeenVisibility}
                onChange={(e) => handleSelectChange('lastSeenVisibility', e.target.value)}
                className="settings-select"
              >
                {visibilityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Profile Photo Visibility</label>
              <select
                value={settings.profilePhotoVisibility}
                onChange={(e) => handleSelectChange('profilePhotoVisibility', e.target.value)}
                className="settings-select"
              >
                {visibilityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Read Receipt Visibility</label>
              <select
                value={settings.readReceiptVisibility}
                onChange={(e) => handleSelectChange('readReceiptVisibility', e.target.value)}
                className="settings-select"
              >
                {visibilityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Features */}
        <div className="settings-section">
          <div className="section-header">
            <FiLock className="section-icon" />
            <h3>Advanced Features</h3>
          </div>
          
          <div className="section-content">
            <ToggleSwitch
              enabled={settings.messageEncryption}
              onToggle={() => handleToggle('messageEncryption')}
              label="End-to-End Encryption"
              description="Encrypt messages for maximum security"
            />
            
            <ToggleSwitch
              enabled={settings.backupMessages}
              onToggle={() => handleToggle('backupMessages')}
              label="Backup Messages"
              description="Automatically backup your chat history"
            />
            
            <div className="form-group">
              <label>Auto-delete Messages</label>
              <select
                value={settings.deleteMessagesAfter}
                onChange={(e) => handleSelectChange('deleteMessagesAfter', e.target.value)}
                className="settings-select"
              >
                {deleteOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Archive Chats After</label>
              <select
                value={settings.archiveChatsAfter}
                onChange={(e) => handleSelectChange('archiveChatsAfter', e.target.value)}
                className="settings-select"
              >
                {deleteOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Emoji & Reactions */}
        <div className="settings-section">
          <div className="section-header">
            <FiSmile className="section-icon" />
            <h3>Emoji & Reactions</h3>
          </div>
          
          <div className="section-content">
            <ToggleSwitch
              enabled={settings.enableEmojis}
              onToggle={() => handleToggle('enableEmojis')}
              label="Enable Emojis"
              description="Use emojis in messages"
            />
            
            <ToggleSwitch
              enabled={settings.enableReactions}
              onToggle={() => handleToggle('enableReactions')}
              label="Message Reactions"
              description="React to messages with emojis"
            />
            
            <ToggleSwitch
              enabled={settings.enableStickers}
              onToggle={() => handleToggle('enableStickers')}
              label="Stickers"
              description="Send and receive sticker messages"
            />
            
            <ToggleSwitch
              enabled={settings.emojiSuggestions}
              onToggle={() => handleToggle('emojiSuggestions')}
              label="Emoji Suggestions"
              description="Show emoji suggestions while typing"
            />
          </div>
        </div>

        {/* Voice & Video */}
        <div className="settings-section">
          <div className="section-header">
            <FiMic className="section-icon" />
            <h3>Voice & Video</h3>
          </div>
          
          <div className="section-content">
            <ToggleSwitch
              enabled={settings.enableVoiceMessages}
              onToggle={() => handleToggle('enableVoiceMessages')}
              label="Voice Messages"
              description="Send and receive voice messages"
            />
            
            <ToggleSwitch
              enabled={settings.enableVideoMessages}
              onToggle={() => handleToggle('enableVideoMessages')}
              label="Video Messages"
              description="Send and receive video messages"
            />
            
            <div className="form-group">
              <label>Voice Message Quality</label>
              <select
                value={settings.voiceMessageQuality}
                onChange={(e) => handleSelectChange('voiceMessageQuality', e.target.value)}
                className="settings-select"
              >
                {qualityOptions.filter(q => q.value !== 'auto').map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Video Call Quality</label>
              <select
                value={settings.videoCallQuality}
                onChange={(e) => handleSelectChange('videoCallQuality', e.target.value)}
                className="settings-select"
              >
                {qualityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChattingSettings;