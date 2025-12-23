import React, { useState } from 'react';
import { 
  FiWifi, 
  FiWifiOff, 
  FiRefreshCw, 
  FiAlertCircle, 
  FiCheck,
  FiClock,
  FiSmartphone,
  FiMonitor
} from 'react-icons/fi';
import { useCrossDeviceSync } from '../../hooks/useCrossDeviceSync';
import './SyncStatusIndicator.css';

const SyncStatusIndicator = ({ 
  compact = false, 
  showDetails = false,
  position = 'bottom-right' 
}) => {
  const { syncStatus, syncEvents, getSyncStats, reconnect } = useCrossDeviceSync();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      await reconnect();
    } catch (error) {
      console.error('Reconnection failed:', error);
    } finally {
      setIsReconnecting(false);
    }
  };

  const getStatusIcon = () => {
    if (isReconnecting || syncStatus.isConnecting) {
      return <FiRefreshCw className="sync-icon spinning" />;
    }
    
    if (syncStatus.error) {
      return <FiAlertCircle className="sync-icon error" />;
    }
    
    if (syncStatus.isConnected) {
      return <FiWifi className="sync-icon connected" />;
    }
    
    return <FiWifiOff className="sync-icon disconnected" />;
  };

  const getStatusText = () => {
    if (isReconnecting) return 'Reconnecting...';
    if (syncStatus.isConnecting) return 'Connecting...';
    if (syncStatus.error) return 'Sync Error';
    if (syncStatus.isConnected) return 'Synced';
    return 'Offline';
  };

  const getStatusClass = () => {
    if (isReconnecting || syncStatus.isConnecting) return 'connecting';
    if (syncStatus.error) return 'error';
    if (syncStatus.isConnected) return 'connected';
    return 'disconnected';
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return time.toLocaleDateString();
  };

  const syncStats = getSyncStats();

  if (compact) {
    return (
      <div className={`sync-status-indicator compact ${getStatusClass()}`}>
        {getStatusIcon()}
        {syncStatus.queuedSyncs > 0 && (
          <span className="sync-queue-badge">{syncStatus.queuedSyncs}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`sync-status-indicator ${position} ${getStatusClass()}`}>
      <div 
        className="sync-status-main"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="sync-status-content">
          {getStatusIcon()}
          <div className="sync-status-text">
            <span className="sync-status-label">{getStatusText()}</span>
            {syncStatus.deviceId && (
              <span className="sync-device-id">
                Device: {syncStatus.deviceId.slice(-8)}
              </span>
            )}
          </div>
        </div>
        
        {syncStatus.queuedSyncs > 0 && (
          <div className="sync-queue-indicator">
            <FiClock className="queue-icon" />
            <span>{syncStatus.queuedSyncs}</span>
          </div>
        )}
      </div>

      {showDropdown && (
        <div className="sync-status-dropdown">
          <div className="sync-dropdown-header">
            <h4>Sync Status</h4>
            <button 
              className="sync-close-btn"
              onClick={() => setShowDropdown(false)}
            >
              ×
            </button>
          </div>

          <div className="sync-dropdown-content">
            {/* Connection Status */}
            <div className="sync-section">
              <h5>Connection</h5>
              <div className="sync-info-row">
                <span>Status:</span>
                <span className={`sync-status-badge ${getStatusClass()}`}>
                  {getStatusText()}
                </span>
              </div>
              {syncStatus.error && (
                <div className="sync-info-row error">
                  <span>Error:</span>
                  <span>{syncStatus.error}</span>
                </div>
              )}
              {!syncStatus.isConnected && (
                <button 
                  className="sync-reconnect-btn"
                  onClick={handleReconnect}
                  disabled={isReconnecting}
                >
                  {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
                </button>
              )}
            </div>

            {/* Sync Statistics */}
            <div className="sync-section">
              <h5>Statistics</h5>
              <div className="sync-stats-grid">
                <div className="sync-stat">
                  <span className="sync-stat-label">Queued</span>
                  <span className="sync-stat-value">{syncStats.queuedSyncs || 0}</span>
                </div>
                <div className="sync-stat">
                  <span className="sync-stat-label">Active</span>
                  <span className="sync-stat-value">{syncStats.activePlaybacks || 0}</span>
                </div>
                <div className="sync-stat">
                  <span className="sync-stat-label">States</span>
                  <span className="sync-stat-value">{syncStats.totalStates || 0}</span>
                </div>
              </div>
            </div>

            {/* Recent Events */}
            {showDetails && syncEvents.length > 0 && (
              <div className="sync-section">
                <h5>Recent Events</h5>
                <div className="sync-events-list">
                  {syncEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="sync-event">
                      <div className="sync-event-content">
                        <span className={`sync-event-type ${event.type}`}>
                          {event.type.replace('_', ' ')}
                        </span>
                        <span className="sync-event-message">{event.message}</span>
                      </div>
                      <span className="sync-event-time">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Device Info */}
            <div className="sync-section">
              <h5>Device</h5>
              <div className="sync-device-info">
                <div className="sync-device-row">
                  <FiSmartphone className="device-icon" />
                  <span>ID: {syncStatus.deviceId?.slice(-12) || 'Unknown'}</span>
                </div>
                <div className="sync-device-row">
                  <FiMonitor className="device-icon" />
                  <span>Type: {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDropdown && (
        <div 
          className="sync-dropdown-overlay"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default SyncStatusIndicator;