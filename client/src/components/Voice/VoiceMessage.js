import React, { useState, useCallback } from 'react';
import { FiMic, FiPlay } from 'react-icons/fi';
import VoiceRecorder from './VoiceRecorder';
import MediaPlayer from './MediaPlayer';
import './VoiceMessage.css';

const VoiceMessage = ({ 
  message = null, 
  onSendVoiceMessage, 
  disabled = false,
  compact = false,
  showRecorder = true 
}) => {
  const [showRecorder, setShowRecorder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Handle recording completion
  const handleRecordingComplete = useCallback((recording) => {
    if (onSendVoiceMessage) {
      onSendVoiceMessage(recording);
    }
    setShowRecorder(false);
    setIsRecording(false);
  }, [onSendVoiceMessage]);

  // Handle recording cancellation
  const handleRecordingCancel = useCallback(() => {
    setShowRecorder(false);
    setIsRecording(false);
  }, []);

  // Toggle recorder visibility
  const toggleRecorder = useCallback(() => {
    setShowRecorder(prev => !prev);
  }, []);

  // If we have a voice message to display
  if (message && message.audioUrl) {
    return (
      <div className={`voice-message ${compact ? 'compact' : ''}`}>
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
              </div>
            )}
          </div>
          
          <MediaPlayer
            audioUrl={message.audioUrl}
            waveform={message.waveform}
            duration={message.duration}
            compact={compact}
            showControls={true}
          />
        </div>
      </div>
    );
  }

  // If we're in recorder mode
  if (showRecorder) {
    return (
      <div className={`voice-message recorder ${compact ? 'compact' : ''}`}>
        <VoiceRecorder
          onRecordingComplete={handleRecordingComplete}
          onCancel={handleRecordingCancel}
          disabled={disabled}
        />
      </div>
    );
  }

  // Default state - show record button
  if (showRecorder) {
    return (
      <div className={`voice-message trigger ${compact ? 'compact' : ''}`}>
        <button
          className="voice-trigger-btn"
          onClick={toggleRecorder}
          disabled={disabled}
          title="Record Voice Message"
        >
          <FiMic />
          {!compact && <span>Record</span>}
        </button>
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

export default VoiceMessage;