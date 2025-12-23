import { EventEmitter } from 'events';

/**
 * PlaybackStateManager - Manages playback state synchronization across devices
 * Handles voice message playback position, volume, and other playback properties
 */
class PlaybackStateManager extends EventEmitter {
  constructor(crossDeviceSyncManager) {
    super();
    
    this.syncManager = crossDeviceSyncManager;
    this.playbackStates = new Map();
    this.activePlaybacks = new Map();
    this.syncDebounceTimers = new Map();
    this.conflictResolutionEnabled = true;
    
    this.options = {
      syncDebounceDelay: 500, // ms
      conflictResolutionTimeout: 2000, // ms
      maxSyncRetries: 3,
      stateExpirationTime: 300000 // 5 minutes
    };
    
    this.setupSyncListeners();
    this.startCleanupTimer();
  }

  /**
   * Setup listeners for cross-device sync events
   */
  setupSyncListeners() {
    if (this.syncManager) {
      this.syncManager.on('playback_state_synced', this.handleRemotePlaybackState.bind(this));
      this.syncManager.on('connected', this.handleSyncConnected.bind(this));
      this.syncManager.on('disconnected', this.handleSyncDisconnected.bind(this));
    }
  }

  /**
   * Update playback state for a voice message
   */
  async updatePlaybackState(messageId, playbackState, options = {}) {
    const {
      syncToDevices = true,
      debounce = true,
      priority = 'normal'
    } = options;

    try {
      // Store local state
      const stateData = {
        messageId,
        deviceId: this.syncManager?.deviceId,
        playbackState: {
          ...playbackState,
          timestamp: Date.now()
        },
        priority,
        lastUpdated: Date.now()
      };

      this.playbackStates.set(messageId, stateData);
      this.emit('playback_state_updated', stateData);

      // Sync to other devices if enabled
      if (syncToDevices && this.syncManager) {
        if (debounce) {
          this.debouncedSync(messageId, stateData);
        } else {
          await this.syncManager.syncPlaybackState(messageId, playbackState);
        }
      }

      return stateData;
    } catch (error) {
      console.error('Failed to update playback state:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get current playback state for a message
   */
  getPlaybackState(messageId) {
    const state = this.playbackStates.get(messageId);
    
    if (state && this.isStateExpired(state)) {
      this.playbackStates.delete(messageId);
      return null;
    }
    
    return state;
  }

  /**
   * Set active playback (only one can be active at a time per device)
   */
  setActivePlayback(messageId, playbackState) {
    // Pause any other active playbacks on this device
    for (const [activeMessageId, activeState] of this.activePlaybacks) {
      if (activeMessageId !== messageId && activeState.playbackState.isPlaying) {
        this.updatePlaybackState(activeMessageId, {
          ...activeState.playbackState,
          isPlaying: false
        }, { priority: 'high' });
      }
    }

    // Set new active playback
    this.activePlaybacks.set(messageId, {
      messageId,
      playbackState,
      startedAt: Date.now()
    });

    this.updatePlaybackState(messageId, playbackState, { priority: 'high' });
    this.emit('active_playback_changed', messageId, playbackState);
  }

  /**
   * Clear active playback
   */
  clearActivePlayback(messageId) {
    if (this.activePlaybacks.has(messageId)) {
      this.activePlaybacks.delete(messageId);
      this.emit('active_playback_cleared', messageId);
    }
  }

  /**
   * Handle device switching - restore playback state
   */
  async handleDeviceSwitch(messageId, targetDeviceId) {
    const state = this.getPlaybackState(messageId);
    if (!state) return null;

    try {
      // Create device switch event
      const switchData = {
        messageId,
        fromDevice: this.syncManager?.deviceId,
        toDevice: targetDeviceId,
        playbackState: state.playbackState,
        timestamp: Date.now()
      };

      this.emit('device_switch_initiated', switchData);

      // Sync the current state to the target device
      if (this.syncManager) {
        await this.syncManager.syncPlaybackState(messageId, state.playbackState);
      }

      return switchData;
    } catch (error) {
      console.error('Failed to handle device switch:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Restore playback state from another device
   */
  restorePlaybackState(messageId, fromDeviceId) {
    const remoteState = this.syncManager?.getPlaybackState(messageId);
    
    if (remoteState && remoteState.deviceId === fromDeviceId) {
      this.playbackStates.set(messageId, {
        ...remoteState,
        restored: true,
        restoredAt: Date.now()
      });

      this.emit('playback_state_restored', messageId, remoteState);
      return remoteState;
    }

    return null;
  }

  /**
   * Handle remote playback state from other devices
   */
  handleRemotePlaybackState(data) {
    const { messageId, deviceId, playbackState } = data;
    
    // Don't process our own states
    if (deviceId === this.syncManager?.deviceId) return;

    const localState = this.playbackStates.get(messageId);
    
    // Conflict resolution
    if (localState && this.conflictResolutionEnabled) {
      const resolved = this.resolvePlaybackConflict(localState, data);
      if (resolved) {
        this.playbackStates.set(messageId, resolved);
        this.emit('playback_conflict_resolved', messageId, resolved);
      }
    } else {
      // No conflict, accept remote state
      this.playbackStates.set(messageId, data);
      this.emit('remote_playback_state_received', data);
    }
  }

  /**
   * Resolve conflicts between local and remote playback states
   */
  resolvePlaybackConflict(localState, remoteState) {
    const localTimestamp = localState.playbackState.timestamp || localState.lastUpdated;
    const remoteTimestamp = remoteState.playbackState.timestamp || remoteState.lastUpdated;
    
    // Use timestamp-based precedence (most recent wins)
    if (remoteTimestamp > localTimestamp) {
      return {
        ...remoteState,
        conflictResolved: true,
        resolvedAt: Date.now(),
        resolution: 'remote_newer'
      };
    } else if (localTimestamp > remoteTimestamp) {
      return {
        ...localState,
        conflictResolved: true,
        resolvedAt: Date.now(),
        resolution: 'local_newer'
      };
    } else {
      // Same timestamp, use device priority or other criteria
      const localPriority = localState.priority === 'high' ? 2 : 1;
      const remotePriority = remoteState.priority === 'high' ? 2 : 1;
      
      if (remotePriority > localPriority) {
        return {
          ...remoteState,
          conflictResolved: true,
          resolvedAt: Date.now(),
          resolution: 'remote_priority'
        };
      } else {
        return {
          ...localState,
          conflictResolved: true,
          resolvedAt: Date.now(),
          resolution: 'local_priority'
        };
      }
    }
  }

  /**
   * Debounced sync to avoid too frequent updates
   */
  debouncedSync(messageId, stateData) {
    // Clear existing timer
    if (this.syncDebounceTimers.has(messageId)) {
      clearTimeout(this.syncDebounceTimers.get(messageId));
    }

    // Set new timer
    const timer = setTimeout(async () => {
      try {
        if (this.syncManager) {
          await this.syncManager.syncPlaybackState(messageId, stateData.playbackState);
        }
        this.syncDebounceTimers.delete(messageId);
      } catch (error) {
        console.error('Debounced sync failed:', error);
        this.emit('sync_error', error);
      }
    }, this.options.syncDebounceDelay);

    this.syncDebounceTimers.set(messageId, timer);
  }

  /**
   * Handle sync manager connection
   */
  handleSyncConnected() {
    this.emit('sync_connected');
    
    // Sync current active playbacks
    for (const [messageId, activeState] of this.activePlaybacks) {
      if (this.syncManager) {
        this.syncManager.syncPlaybackState(messageId, activeState.playbackState)
          .catch(error => console.error('Failed to sync active playback:', error));
      }
    }
  }

  /**
   * Handle sync manager disconnection
   */
  handleSyncDisconnected() {
    this.emit('sync_disconnected');
  }

  /**
   * Check if state is expired
   */
  isStateExpired(state) {
    const now = Date.now();
    const stateAge = now - (state.lastUpdated || state.playbackState.timestamp || 0);
    return stateAge > this.options.stateExpirationTime;
  }

  /**
   * Start cleanup timer for expired states
   */
  startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredStates();
    }, 60000); // Clean up every minute
  }

  /**
   * Clean up expired states
   */
  cleanupExpiredStates() {
    const now = Date.now();
    
    for (const [messageId, state] of this.playbackStates) {
      if (this.isStateExpired(state)) {
        this.playbackStates.delete(messageId);
        this.emit('state_expired', messageId);
      }
    }

    // Clean up old active playbacks
    for (const [messageId, activeState] of this.activePlaybacks) {
      const age = now - activeState.startedAt;
      if (age > this.options.stateExpirationTime) {
        this.activePlaybacks.delete(messageId);
        this.emit('active_playback_expired', messageId);
      }
    }
  }

  /**
   * Get all playback states
   */
  getAllPlaybackStates() {
    const states = {};
    for (const [messageId, state] of this.playbackStates) {
      if (!this.isStateExpired(state)) {
        states[messageId] = state;
      }
    }
    return states;
  }

  /**
   * Get active playbacks
   */
  getActivePlaybacks() {
    return Array.from(this.activePlaybacks.entries()).map(([messageId, state]) => ({
      messageId,
      ...state
    }));
  }

  /**
   * Pause all active playbacks
   */
  pauseAllPlaybacks() {
    for (const [messageId, activeState] of this.activePlaybacks) {
      this.updatePlaybackState(messageId, {
        ...activeState.playbackState,
        isPlaying: false
      }, { priority: 'high' });
    }
  }

  /**
   * Resume playback for a specific message
   */
  resumePlayback(messageId) {
    const state = this.getPlaybackState(messageId);
    if (state) {
      this.updatePlaybackState(messageId, {
        ...state.playbackState,
        isPlaying: true
      }, { priority: 'high' });
    }
  }

  /**
   * Seek to position in playback
   */
  seekPlayback(messageId, currentTime) {
    const state = this.getPlaybackState(messageId);
    if (state) {
      this.updatePlaybackState(messageId, {
        ...state.playbackState,
        currentTime,
        timestamp: Date.now()
      }, { priority: 'high', debounce: false });
    }
  }

  /**
   * Set volume for playback
   */
  setPlaybackVolume(messageId, volume) {
    const state = this.getPlaybackState(messageId);
    if (state) {
      this.updatePlaybackState(messageId, {
        ...state.playbackState,
        volume,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Set playback rate
   */
  setPlaybackRate(messageId, playbackRate) {
    const state = this.getPlaybackState(messageId);
    if (state) {
      this.updatePlaybackState(messageId, {
        ...state.playbackState,
        playbackRate,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get sync statistics
   */
  getSyncStats() {
    return {
      totalStates: this.playbackStates.size,
      activePlaybacks: this.activePlaybacks.size,
      pendingDebounces: this.syncDebounceTimers.size,
      isConnected: this.syncManager?.isConnected || false
    };
  }

  /**
   * Enable/disable conflict resolution
   */
  setConflictResolution(enabled) {
    this.conflictResolutionEnabled = enabled;
    this.emit('conflict_resolution_changed', enabled);
  }

  /**
   * Clear all states and active playbacks
   */
  clearAll() {
    this.playbackStates.clear();
    this.activePlaybacks.clear();
    
    // Clear debounce timers
    for (const timer of this.syncDebounceTimers.values()) {
      clearTimeout(timer);
    }
    this.syncDebounceTimers.clear();
    
    this.emit('all_states_cleared');
  }

  /**
   * Destroy the manager and clean up resources
   */
  destroy() {
    this.clearAll();
    
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    if (this.syncManager) {
      this.syncManager.off('playback_state_synced', this.handleRemotePlaybackState);
      this.syncManager.off('connected', this.handleSyncConnected);
      this.syncManager.off('disconnected', this.handleSyncDisconnected);
    }
    
    this.removeAllListeners();
  }
}

export default PlaybackStateManager;