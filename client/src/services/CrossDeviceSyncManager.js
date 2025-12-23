import { io } from 'socket.io-client';
import { EventEmitter } from 'events';

/**
 * CrossDeviceSyncManager - Handles real-time synchronization across devices
 * Manages voice messages, playback states, and general message sync
 */
class CrossDeviceSyncManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      serverUrl: options.serverUrl || process.env.REACT_APP_SERVER_URL || 'http://localhost:5000',
      reconnectAttempts: options.reconnectAttempts || 5,
      reconnectDelay: options.reconnectDelay || 1000,
      heartbeatInterval: options.heartbeatInterval || 30000,
      syncTimeout: options.syncTimeout || 10000,
      ...options
    };
    
    this.socket = null;
    this.isConnected = false;
    this.deviceId = this.generateDeviceId();
    this.userId = null;
    this.syncQueue = new Map();
    this.pendingOperations = new Map();
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    
    // Sync state
    this.voiceMessageStates = new Map();
    this.playbackStates = new Map();
    this.messageStates = new Map();
    
    this.initialize();
  }

  /**
   * Initialize the sync manager
   */
  initialize() {
    this.setupSocket();
    this.setupEventHandlers();
    this.startHeartbeat();
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Setup socket connection
   */
  setupSocket() {
    try {
      this.socket = io(this.options.serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: this.options.syncTimeout,
        reconnection: true,
        reconnectionAttempts: this.options.reconnectAttempts,
        reconnectionDelay: this.options.reconnectDelay,
        auth: {
          deviceId: this.deviceId,
          userId: this.userId
        }
      });
      
      this.setupSocketEvents();
    } catch (error) {
      console.error('Failed to setup socket:', error);
      this.emit('error', error);
    }
  }

  /**
   * Setup socket event handlers
   */
  setupSocketEvents() {
    this.socket.on('connect', this.handleConnect.bind(this));
    this.socket.on('disconnect', this.handleDisconnect.bind(this));
    this.socket.on('reconnect', this.handleReconnect.bind(this));
    this.socket.on('connect_error', this.handleConnectError.bind(this));
    
    // Sync events
    this.socket.on('voice_message_sync', this.handleVoiceMessageSync.bind(this));
    this.socket.on('playback_state_sync', this.handlePlaybackStateSync.bind(this));
    this.socket.on('message_sync', this.handleMessageSync.bind(this));
    this.socket.on('device_sync', this.handleDeviceSync.bind(this));
    
    // Acknowledgments
    this.socket.on('sync_ack', this.handleSyncAck.bind(this));
    this.socket.on('sync_error', this.handleSyncError.bind(this));
  }

  /**
   * Setup general event handlers
   */
  setupEventHandlers() {
    // Handle browser tab focus/blur for sync optimization
    this.handleVisibilityChange = () => {
      if (document.hidden) {
        this.pauseSync();
      } else {
        this.resumeSync();
      }
    };
  }

  /**
   * Connect with user authentication
   */
  async connect(userId, authToken) {
    this.userId = userId;
    
    if (this.socket) {
      this.socket.auth = {
        deviceId: this.deviceId,
        userId: this.userId,
        token: authToken
      };
      
      if (!this.isConnected) {
        this.socket.connect();
      } else {
        // Re-authenticate if already connected
        this.socket.emit('authenticate', {
          deviceId: this.deviceId,
          userId: this.userId,
          token: authToken
        });
      }
    }
  }

  /**
   * Disconnect from sync
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    this.stopHeartbeat();
    this.clearReconnectTimer();
    this.isConnected = false;
    this.userId = null;
  }

  /**
   * Sync voice message across devices
   */
  async syncVoiceMessage(voiceMessage) {
    const syncData = {
      id: voiceMessage.id,
      chatId: voiceMessage.chatId,
      senderId: voiceMessage.senderId,
      duration: voiceMessage.duration,
      audioUrl: voiceMessage.audioUrl,
      waveform: voiceMessage.waveform,
      timestamp: voiceMessage.timestamp,
      deviceId: this.deviceId,
      syncId: this.generateSyncId()
    };
    
    return this.performSync('voice_message', syncData);
  }

  /**
   * Sync playback state across devices
   */
  async syncPlaybackState(messageId, playbackState) {
    const syncData = {
      messageId,
      deviceId: this.deviceId,
      playbackState: {
        isPlaying: playbackState.isPlaying,
        currentTime: playbackState.currentTime,
        volume: playbackState.volume,
        playbackRate: playbackState.playbackRate,
        timestamp: Date.now()
      },
      syncId: this.generateSyncId()
    };
    
    return this.performSync('playback_state', syncData);
  }

  /**
   * Sync general message across devices
   */
  async syncMessage(message) {
    const syncData = {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      type: message.type,
      timestamp: message.timestamp,
      readBy: message.readBy || [],
      deviceId: this.deviceId,
      syncId: this.generateSyncId()
    };
    
    return this.performSync('message', syncData);
  }

  /**
   * Sync read status across devices
   */
  async syncReadStatus(messageId, userId, timestamp) {
    const syncData = {
      messageId,
      userId,
      timestamp,
      deviceId: this.deviceId,
      syncId: this.generateSyncId()
    };
    
    return this.performSync('read_status', syncData);
  }

  /**
   * Perform sync operation with retry logic
   */
  async performSync(type, data) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        // Queue for later if offline
        this.queueSync(type, data);
        resolve({ queued: true });
        return;
      }
      
      const syncId = data.syncId;
      const timeout = setTimeout(() => {
        this.pendingOperations.delete(syncId);
        reject(new Error('Sync timeout'));
      }, this.options.syncTimeout);
      
      this.pendingOperations.set(syncId, {
        resolve,
        reject,
        timeout,
        type,
        data,
        timestamp: Date.now()
      });
      
      this.socket.emit('sync_request', {
        type,
        data,
        syncId
      });
    });
  }

  /**
   * Queue sync operation for later
   */
  queueSync(type, data) {
    const queueKey = `${type}_${data.syncId}`;
    this.syncQueue.set(queueKey, {
      type,
      data,
      timestamp: Date.now()
    });
    
    this.emit('sync_queued', { type, data });
  }

  /**
   * Process queued sync operations
   */
  async processQueuedSyncs() {
    if (!this.isConnected || this.syncQueue.size === 0) return;
    
    const queuedSyncs = Array.from(this.syncQueue.values());
    this.syncQueue.clear();
    
    for (const sync of queuedSyncs) {
      try {
        await this.performSync(sync.type, sync.data);
      } catch (error) {
        console.error('Failed to process queued sync:', error);
        // Re-queue if failed
        this.queueSync(sync.type, sync.data);
      }
    }
  }

  /**
   * Handle socket connection
   */
  handleConnect() {
    console.log('CrossDeviceSync connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.clearReconnectTimer();
    
    this.emit('connected');
    
    // Process any queued syncs
    this.processQueuedSyncs();
  }

  /**
   * Handle socket disconnection
   */
  handleDisconnect(reason) {
    console.log('CrossDeviceSync disconnected:', reason);
    this.isConnected = false;
    
    this.emit('disconnected', reason);
    
    // Start reconnection if not intentional
    if (reason !== 'io client disconnect') {
      this.startReconnection();
    }
  }

  /**
   * Handle socket reconnection
   */
  handleReconnect() {
    console.log('CrossDeviceSync reconnected');
    this.handleConnect();
  }

  /**
   * Handle connection error
   */
  handleConnectError(error) {
    console.error('CrossDeviceSync connection error:', error);
    this.emit('error', error);
    
    this.startReconnection();
  }

  /**
   * Handle voice message sync from other devices
   */
  handleVoiceMessageSync(data) {
    if (data.deviceId === this.deviceId) return; // Ignore own messages
    
    this.voiceMessageStates.set(data.id, data);
    this.emit('voice_message_synced', data);
  }

  /**
   * Handle playback state sync from other devices
   */
  handlePlaybackStateSync(data) {
    if (data.deviceId === this.deviceId) return; // Ignore own state
    
    this.playbackStates.set(data.messageId, data);
    this.emit('playback_state_synced', data);
  }

  /**
   * Handle message sync from other devices
   */
  handleMessageSync(data) {
    if (data.deviceId === this.deviceId) return; // Ignore own messages
    
    this.messageStates.set(data.id, data);
    this.emit('message_synced', data);
  }

  /**
   * Handle device sync information
   */
  handleDeviceSync(data) {
    this.emit('device_synced', data);
  }

  /**
   * Handle sync acknowledgment
   */
  handleSyncAck(data) {
    const operation = this.pendingOperations.get(data.syncId);
    if (operation) {
      clearTimeout(operation.timeout);
      this.pendingOperations.delete(data.syncId);
      operation.resolve(data);
    }
  }

  /**
   * Handle sync error
   */
  handleSyncError(data) {
    const operation = this.pendingOperations.get(data.syncId);
    if (operation) {
      clearTimeout(operation.timeout);
      this.pendingOperations.delete(data.syncId);
      operation.reject(new Error(data.error));
    }
  }

  /**
   * Handle online event
   */
  handleOnline() {
    console.log('Device came online');
    if (!this.isConnected && this.socket) {
      this.socket.connect();
    }
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    console.log('Device went offline');
    this.emit('offline');
  }

  /**
   * Start heartbeat to maintain connection
   */
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.socket.emit('heartbeat', {
          deviceId: this.deviceId,
          timestamp: Date.now()
        });
      }
    }, this.options.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Start reconnection attempts
   */
  startReconnection() {
    if (this.reconnectTimer || this.reconnectAttempts >= this.options.reconnectAttempts) {
      return;
    }
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts}`);
      
      if (this.socket) {
        this.socket.connect();
      }
      
      this.reconnectTimer = null;
      
      if (this.reconnectAttempts < this.options.reconnectAttempts) {
        this.startReconnection();
      }
    }, this.options.reconnectDelay * Math.pow(2, this.reconnectAttempts));
  }

  /**
   * Clear reconnection timer
   */
  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Pause sync operations
   */
  pauseSync() {
    this.emit('sync_paused');
  }

  /**
   * Resume sync operations
   */
  resumeSync() {
    this.emit('sync_resumed');
    this.processQueuedSyncs();
  }

  /**
   * Generate unique device ID
   */
  generateDeviceId() {
    const stored = localStorage.getItem('nexus_device_id');
    if (stored) return stored;
    
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('nexus_device_id', deviceId);
    return deviceId;
  }

  /**
   * Generate unique sync ID
   */
  generateSyncId() {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current sync status
   */
  getSyncStatus() {
    return {
      isConnected: this.isConnected,
      deviceId: this.deviceId,
      userId: this.userId,
      queuedSyncs: this.syncQueue.size,
      pendingOperations: this.pendingOperations.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Get voice message state
   */
  getVoiceMessageState(messageId) {
    return this.voiceMessageStates.get(messageId);
  }

  /**
   * Get playback state
   */
  getPlaybackState(messageId) {
    return this.playbackStates.get(messageId);
  }

  /**
   * Get message state
   */
  getMessageState(messageId) {
    return this.messageStates.get(messageId);
  }

  /**
   * Clear all states
   */
  clearStates() {
    this.voiceMessageStates.clear();
    this.playbackStates.clear();
    this.messageStates.clear();
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.disconnect();
    this.stopHeartbeat();
    this.clearReconnectTimer();
    this.clearStates();
    
    // Remove event listeners
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    this.removeAllListeners();
  }
}

export default CrossDeviceSyncManager;