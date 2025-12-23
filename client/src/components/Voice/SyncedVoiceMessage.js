import React, { useState, useEffect, useCallback } from 'react';
import { FiMic, FiPlay, FiPause, FiSmartphone, FiMonitor } from 'react-icons/fi';
import VoiceRecorder from './VoiceRecorder';
import MediaPlayer from './MediaPlayer';
import { useCrossDeviceSync } from '../../hooks/useCrossDeviceSync';
import './SyncedVoiceMessage.css';

const SyncedVoiceMessage = ({ 
  message = null, 
  onSendVoiceMessage, 
  disabled = false,
  compact = false,
  showRecorder = true,
  chatId,
  currentUserId 
}) => {
  const [showRecorder, setShowRecorder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [localPlaybackState, setLocalPlaybackState] = useState(null);
  const [showDeviceSync, setShowDeviceSync] = useState(false);
  
  const {
    syncVoiceMessage,
    updatePlaybackState,
    setActivePlayback,
    getPlaybackState,
    handleDeviceSwitch,
    restorePlaybackState,
    syncStatus,
    playbackStates
  } = useCrossDeviceSync();

  // Get synced playback state for this message
  const syncedPlaybackState = message?.id ? playbackStates[message.id] : null;

  // Handle recording completion with sync
  const handleRecordingComplete = useCallback(async (recording) => {
    try {
      // Create voice message object
      const voiceMessage = {
        ...recording,
        chatId,
        senderId: currentUserId,
        audioUrl: URL.createObjectURL(recording.audioBlob)
      };

      // Sync to other devices
      if (syncStatus.isConnected) {
        await syncVoiceMessage(voiceMessage);
      }

      // Send to parent component
      if (onSendVoiceMessage) {
        onSendVoiceMessage(voiceMessage);
      }

      setShowRecorder(false);
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to send voice message:', error);
      // Still send locally even if sync fails
      if (onSendVoiceMessage) {
        onSendVoiceMessage({
          ...recording,
          chatId,
          senderId: currentUserId,
          audioUrl: URL.createObjectURL(recording.audioBlob)
        });
      }
    }
  }, [chatId, currentUserId, syncVoiceMessage, onSendVoiceMessage, syncStatus.isConnected]);

  // Handle recording cancellation
  const handleRecordingCancel = useCallback(() => {
    setShowRecorder(false);
    setIsRecording(false);
  }, []);

  // Handle playback state changes with sync
  const handlePlaybackStateChange = useCallback(async (playbackState) => {
    if (!message?.id) return;

    setLocalPlaybackState(playbackState);

    // Sync playback state to other devices
    if (syncStatus.isConnected) {
      try {
        await updatePlaybackState(message.id, playbackState, {
          debounce: true,
          priority: playbackState.isPlaying ? 'high' : 'normal'
        });

        // Set as active playback if playing
        if (playbackState.isPlaying) {
          setActivePlayback(message.id, playbackState);
        }
      } catch (error) {
        console.error('Failed to sync playback state:', error);
      }
    }
  }, [message?.id, syncStatus.isConnected, updatePlaybackState, setActivePlayback]);

  // Handle device switch
  const handleSwitchDevice = useCallback(async (targetDeviceId) => {
    if (!message?.id) return;

    try {
      await handleDeviceSwitch(message.id, targetDeviceId);
      setShowDeviceSync(false);
    } catch (error) {
      console.error('Failed to switch device:', error);
    }
  }, [message?.id, handleDeviceSwitch]);

  // Restore playback state from another device
  const handleRestoreFromDevice = useCallback((fromDeviceId) => {
    if (!message?.id) return;

    const restoredState = restorePlaybackState(message.id, fromDeviceId);
    if (restoredState) {
      setLocalPlaybackState(restoredState.playbackState);
    }
  }, [message?.id, restorePlaybackState]);

  // Toggle recorder visibility
  const toggleRecorder = useCallback(() => {
    setShowRecorder(prev => !prev);
  }, []);

  // Use synced playback state if available, otherwise use local state
  const effectivePlaybackState = syncedPlaybackState?.playbackState || localPlaybackState;

  // Show sync indicator if message is from another device
  const showSyncIndicator = syncedPlaybackState && 
    syncedPlaybackState.deviceId !== syncStatus.deviceId;

  // If we have a voice message to display
  if (message && message.audioUrl) {
    return (
      <div className={`synced-voice-message ${compact ? 'compact' : ''}`}>
        <div className="voice-message-content">
          <div className="voice-message-info">
            <div className="voice-message-icon">
              <FiPlay />
            </div>
            {!compact && (
              <div className="voice-message-details">
                <span className="voice-message-duration">
                  {formatDuration(message.duration)}
                </span>
                <span className="voice-message-timestamp">
                  {formatTimestamp(message.timestamp)}
                </span>
                {showSyncIndicator && (
                  <div className="sync-indicator">
                    <FiSmartphone className="sync-icon" />
                    <span>Synced from device</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <MediaPlayer
            audioUrl={message.audioUrl}
            waveform={message.waveform}
            duration={message.duration}
            compact={compact}
            showControls={true}
            onPlaybackStateChange={handlePlaybackStateChange}
            // Use synced state if available
            initialState={effectivePlaybackState}
          />

          {/* Device Sync Controls */}
          {syncStatus.isConnected && !compact && (
            <div className="device-sync-controls">
              <button
                className="device-sync-btn"
                onClick={() => setShowDeviceSync(!showDeviceSync)}
                title="Device Sync Options"
              >
                <FiMonitor />
              </button>
              
              {showDeviceSync && (
                <div className="device-sync-dropdown">
                  <div className="sync-dropdown-header">
                    <span>Device Sync</span>
                    <button onClick={() => setShowDeviceSync(false)}>×</button>
                  </div>
                  <div className="sync-dropdown-content">
                    <button
                      className="sync-option"
                      onClick={() => handleSwitchDevice('mobile')}
                    >
                      <FiSmartphone />
                      Continue on Mobile
                    </button>
                    <button
                      className="sync-option"
                      onClick={() => handleSwitchDevice('desktop')}
                    >
                      <FiMonitor />
                      Continue on Desktop
                    </button>
                    {syncedPlaybackState && (
                      <button
                        className="sync-option"
                        onClick={() => handleRestoreFromDevice(syncedPlaybackState.deviceId)}
                      >
                        <FiPlay />
                        Restore from {syncedPlaybackState.deviceId.slice(-8)}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sync Status Indicator */}
        {syncStatus.isConnected && (
          <div className="voice-sync-status">
            <div className="sync-status-dot connected" title="Synced across devices" />
          </div>
        )}
      </div>
    );
  }

  // If we're in recorder mode
  if (showRecorder) {
    return (
      <div className={`synced-voice-message recorder ${compact ? 'compact' : ''}`}>
        <VoiceRecorder
          onRecordingComplete={handleRecordingComplete}
          onCancel={handleRecordingCancel}
          disabled={disabled}
        />
        
        {/* Sync Status during recording */}
        {syncStatus.isConnected && (
          <div className="recording-sync-status">
            <FiSmartphone className="sync-icon" />
            <span>Will sync to all devices</span>
          </div>
        )}
      </div>
    );
  }

  // Default state - show record button
  if (showRecorder) {
    return (
      <div className={`synced-voice-message trigger ${compact ? 'compact' : ''}`}>
        <button
          className="voice-trigger-btn"
          onClick={toggleRecorder}
          disabled={disabled}
          title="Record Voice Message"
        >
          <FiMic />
          {!compact && <span>Record</span>}
        </button>
        
        {/* Sync indicator */}
        {syncStatus.isConnected && (
          <div className="trigger-sync-indicator">
            <div className="sync-status-dot connected" />
          </div>
        )}
      </div>
    );
  }

  return null;
};

// Helper function to format duration
const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  
  // Same day
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  // Different day
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export default SyncedVoiceMessage;