import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CrossDeviceSyncManager from '../services/CrossDeviceSyncManager';
import PlaybackStateManager from '../services/PlaybackStateManager';

/**
 * Custom hook for cross-device synchronization
 * Provides voice message sync, playback state sync, and general message sync
 */
export const useCrossDeviceSync = (options = {}) => {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState({
    isConnected: false,
    isConnecting: false,
    error: null,
    queuedSyncs: 0,
    deviceId: null
  });
  
  const syncManagerRef = useRef(null);
  const playbackManagerRef = useRef(null);
  const [syncEvents, setSyncEvents] = useState([]);
  const [playbackStates, setPlaybackStates] = useState({});

  // Initialize sync managers
  useEffect(() => {
    if (!user) return;

    const initializeSync = async () => {
      try {
        setSyncStatus(prev => ({ ...prev, isConnecting: true, error: null }));

        // Create sync manager
        syncManagerRef.current = new CrossDeviceSyncManager({
          serverUrl: options.serverUrl,
          reconnectAttempts: options.reconnectAttempts || 5,
          heartbeatInterval: options.heartbeatInterval || 30000,
          ...options
        });

        // Create playback state manager
        playbackManagerRef.current = new PlaybackStateManager(syncManagerRef.current);

        // Setup event listeners
        setupSyncEventListeners();
        setupPlaybackEventListeners();

        // Connect with user authentication
        await syncManagerRef.current.connect(user.id, user.token);

        setSyncStatus(prev => ({
          ...prev,
          isConnecting: false,
          deviceId: syncManagerRef.current.deviceId
        }));

      } catch (error) {
        console.error('Failed to initialize cross-device sync:', error);
        setSyncStatus(prev => ({
          ...prev,
          isConnecting: false,
          error: error.message
        }));
      }
    };

    initializeSync();

    // Cleanup on unmount or user change
    return () => {
      if (syncManagerRef.current) {
        syncManagerRef.current.destroy();
        syncManagerRef.current = null;
      }
      if (playbackManagerRef.current) {
        playbackManagerRef.current.destroy();
        playbackManagerRef.current = null;
      }
    };
  }, [user, options]);

  // Setup sync event listeners
  const setupSyncEventListeners = useCallback(() => {
    const syncManager = syncManagerRef.current;
    if (!syncManager) return;

    syncManager.on('connected', () => {
      setSyncStatus(prev => ({ ...prev, isConnected: true, error: null }));
      addSyncEvent('connected', 'Connected to sync server');
    });

    syncManager.on('disconnected', (reason) => {
      setSyncStatus(prev => ({ ...prev, isConnected: false }));
      addSyncEvent('disconnected', `Disconnected: ${reason}`);
    });

    syncManager.on('error', (error) => {
      setSyncStatus(prev => ({ ...prev, error: error.message }));
      addSyncEvent('error', error.message);
    });

    syncManager.on('voice_message_synced', (data) => {
      addSyncEvent('voice_message_synced', `Voice message synced from ${data.deviceId}`);
    });

    syncManager.on('message_synced', (data) => {
      addSyncEvent('message_synced', `Message synced from ${data.deviceId}`);
    });

    syncManager.on('sync_queued', (data) => {
      setSyncStatus(prev => ({ ...prev, queuedSyncs: prev.queuedSyncs + 1 }));
      addSyncEvent('sync_queued', `Sync queued: ${data.type}`);
    });

  }, []);

  // Setup playback event listeners
  const setupPlaybackEventListeners = useCallback(() => {
    const playbackManager = playbackManagerRef.current;
    if (!playbackManager) return;

    playbackManager.on('playback_state_updated', (data) => {
      setPlaybackStates(prev => ({
        ...prev,
        [data.messageId]: data
      }));
    });

    playbackManager.on('remote_playback_state_received', (data) => {
      setPlaybackStates(prev => ({
        ...prev,
        [data.messageId]: data
      }));
      addSyncEvent('playback_synced', `Playback state synced from ${data.deviceId}`);
    });

    playbackManager.on('playback_conflict_resolved', (messageId, resolvedState) => {
      setPlaybackStates(prev => ({
        ...prev,
        [messageId]: resolvedState
      }));
      addSyncEvent('conflict_resolved', `Playback conflict resolved for message ${messageId}`);
    });

    playbackManager.on('active_playback_changed', (messageId, playbackState) => {
      addSyncEvent('active_playback_changed', `Active playback changed to ${messageId}`);
    });

  }, []);

  // Add sync event to history
  const addSyncEvent = useCallback((type, message) => {
    const event = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date()
    };
    
    setSyncEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
  }, []);

  // Sync voice message
  const syncVoiceMessage = useCallback(async (voiceMessage) => {
    if (!syncManagerRef.current) {
      throw new Error('Sync manager not initialized');
    }

    try {
      const result = await syncManagerRef.current.syncVoiceMessage(voiceMessage);
      addSyncEvent('voice_message_sent', `Voice message ${voiceMessage.id} synced`);
      return result;
    } catch (error) {
      addSyncEvent('sync_error', `Failed to sync voice message: ${error.message}`);
      throw error;
    }
  }, [addSyncEvent]);

  // Sync regular message
  const syncMessage = useCallback(async (message) => {
    if (!syncManagerRef.current) {
      throw new Error('Sync manager not initialized');
    }

    try {
      const result = await syncManagerRef.current.syncMessage(message);
      addSyncEvent('message_sent', `Message ${message.id} synced`);
      return result;
    } catch (error) {
      addSyncEvent('sync_error', `Failed to sync message: ${error.message}`);
      throw error;
    }
  }, [addSyncEvent]);

  // Update playback state
  const updatePlaybackState = useCallback(async (messageId, playbackState, options = {}) => {
    if (!playbackManagerRef.current) {
      throw new Error('Playback manager not initialized');
    }

    try {
      const result = await playbackManagerRef.current.updatePlaybackState(
        messageId, 
        playbackState, 
        options
      );
      return result;
    } catch (error) {
      addSyncEvent('sync_error', `Failed to update playback state: ${error.message}`);
      throw error;
    }
  }, [addSyncEvent]);

  // Set active playback
  const setActivePlayback = useCallback((messageId, playbackState) => {
    if (!playbackManagerRef.current) return;

    playbackManagerRef.current.setActivePlayback(messageId, playbackState);
  }, []);

  // Handle device switch
  const handleDeviceSwitch = useCallback(async (messageId, targetDeviceId) => {
    if (!playbackManagerRef.current) {
      throw new Error('Playback manager not initialized');
    }

    try {
      const result = await playbackManagerRef.current.handleDeviceSwitch(messageId, targetDeviceId);
      addSyncEvent('device_switch', `Switched playback to device ${targetDeviceId}`);
      return result;
    } catch (error) {
      addSyncEvent('sync_error', `Failed to switch device: ${error.message}`);
      throw error;
    }
  }, [addSyncEvent]);

  // Restore playback state
  const restorePlaybackState = useCallback((messageId, fromDeviceId) => {
    if (!playbackManagerRef.current) return null;

    const result = playbackManagerRef.current.restorePlaybackState(messageId, fromDeviceId);
    if (result) {
      addSyncEvent('state_restored', `Playback state restored from device ${fromDeviceId}`);
    }
    return result;
  }, [addSyncEvent]);

  // Sync read status
  const syncReadStatus = useCallback(async (messageId, userId, timestamp) => {
    if (!syncManagerRef.current) {
      throw new Error('Sync manager not initialized');
    }

    try {
      const result = await syncManagerRef.current.syncReadStatus(messageId, userId, timestamp);
      return result;
    } catch (error) {
      addSyncEvent('sync_error', `Failed to sync read status: ${error.message}`);
      throw error;
    }
  }, [addSyncEvent]);

  // Get playback state for a message
  const getPlaybackState = useCallback((messageId) => {
    if (!playbackManagerRef.current) return null;
    return playbackManagerRef.current.getPlaybackState(messageId);
  }, []);

  // Get all active playbacks
  const getActivePlaybacks = useCallback(() => {
    if (!playbackManagerRef.current) return [];
    return playbackManagerRef.current.getActivePlaybacks();
  }, []);

  // Pause all playbacks
  const pauseAllPlaybacks = useCallback(() => {
    if (!playbackManagerRef.current) return;
    playbackManagerRef.current.pauseAllPlaybacks();
  }, []);

  // Get sync statistics
  const getSyncStats = useCallback(() => {
    const syncStats = syncManagerRef.current?.getSyncStatus() || {};
    const playbackStats = playbackManagerRef.current?.getSyncStats() || {};
    
    return {
      ...syncStats,
      ...playbackStats,
      eventsCount: syncEvents.length
    };
  }, [syncEvents.length]);

  // Clear sync events
  const clearSyncEvents = useCallback(() => {
    setSyncEvents([]);
  }, []);

  // Reconnect manually
  const reconnect = useCallback(async () => {
    if (!syncManagerRef.current || !user) return;

    try {
      setSyncStatus(prev => ({ ...prev, isConnecting: true, error: null }));
      await syncManagerRef.current.connect(user.id, user.token);
    } catch (error) {
      setSyncStatus(prev => ({ 
        ...prev, 
        isConnecting: false, 
        error: error.message 
      }));
    }
  }, [user]);

  return {
    // Status
    syncStatus,
    syncEvents,
    playbackStates,
    
    // Voice message sync
    syncVoiceMessage,
    
    // Regular message sync
    syncMessage,
    syncReadStatus,
    
    // Playback state management
    updatePlaybackState,
    setActivePlayback,
    getPlaybackState,
    getActivePlaybacks,
    pauseAllPlaybacks,
    
    // Device switching
    handleDeviceSwitch,
    restorePlaybackState,
    
    // Utilities
    getSyncStats,
    clearSyncEvents,
    reconnect,
    
    // Direct access to managers (for advanced usage)
    syncManager: syncManagerRef.current,
    playbackManager: playbackManagerRef.current
  };
};