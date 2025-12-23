/**
 * BackgroundStorageManager - Enhanced storage solution for background images
 * Fixes QuotaExceededError by using IndexedDB instead of localStorage
 * Supports large images without size restrictions
 */

class BackgroundStorageManager {
  constructor() {
    this.dbName = 'NexusChatAppDB';
    this.dbVersion = 1;
    this.storeName = 'backgroundImages';
    this.db = null;
  }

  /**
   * Initialize IndexedDB
   */
  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store for background images
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Store background image
   * @param {string} imageData - Base64 image data or blob
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<string>} - Storage ID
   */
  async storeBackground(imageData, metadata = {}) {
    try {
      await this.init();
      
      const id = `bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const backgroundRecord = {
        id,
        imageData,
        metadata: {
          ...metadata,
          timestamp: Date.now(),
          size: this.calculateSize(imageData),
          type: 'background'
        }
      };

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.add(backgroundRecord);

        request.onsuccess = () => {
          // Store reference in localStorage (small data)
          localStorage.setItem('nexus-current-background-id', id);
          localStorage.setItem('nexus-background-metadata', JSON.stringify(metadata));
          resolve(id);
        };

        request.onerror = () => {
          console.error('Failed to store background:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Background storage failed:', error);
      // Fallback to compressed localStorage for smaller images
      return this.fallbackStorage(imageData, metadata);
    }
  }

  /**
   * Retrieve background image
   * @param {string} id - Storage ID
   * @returns {Promise<Object>} - Background data
   */
  async getBackground(id) {
    try {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(id);

        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result);
          } else {
            // Try fallback storage
            const fallbackData = this.getFallbackStorage();
            resolve(fallbackData);
          }
        };

        request.onerror = () => {
          console.error('Failed to retrieve background:', request.error);
          // Try fallback storage
          const fallbackData = this.getFallbackStorage();
          resolve(fallbackData);
        };
      });
    } catch (error) {
      console.error('Background retrieval failed:', error);
      return this.getFallbackStorage();
    }
  }

  /**
   * Get current background
   * @returns {Promise<Object>} - Current background data
   */
  async getCurrentBackground() {
    const currentId = localStorage.getItem('nexus-current-background-id');
    if (currentId) {
      return this.getBackground(currentId);
    }
    return null;
  }

  /**
   * Remove background
   * @param {string} id - Storage ID
   * @returns {Promise<boolean>} - Success status
   */
  async removeBackground(id) {
    try {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(id);

        request.onsuccess = () => {
          // Clean up localStorage references
          if (localStorage.getItem('nexus-current-background-id') === id) {
            localStorage.removeItem('nexus-current-background-id');
            localStorage.removeItem('nexus-background-metadata');
          }
          resolve(true);
        };

        request.onerror = () => {
          console.error('Failed to remove background:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Background removal failed:', error);
      return false;
    }
  }

  /**
   * Clear all backgrounds
   * @returns {Promise<boolean>} - Success status
   */
  async clearAllBackgrounds() {
    try {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();

        request.onsuccess = () => {
          // Clean up localStorage
          localStorage.removeItem('nexus-current-background-id');
          localStorage.removeItem('nexus-background-metadata');
          localStorage.removeItem('customChatBg'); // Legacy cleanup
          resolve(true);
        };

        request.onerror = () => {
          console.error('Failed to clear backgrounds:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Background clearing failed:', error);
      return false;
    }
  }

  /**
   * Compress image for storage
   * @param {string} imageData - Base64 image data
   * @param {number} quality - Compression quality (0-1)
   * @returns {Promise<string>} - Compressed image data
   */
  async compressImage(imageData, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate optimal size (max 1920x1080 for backgrounds)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedData = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedData);
      };

      img.src = imageData;
    });
  }

  /**
   * Fallback storage for smaller images (localStorage with compression)
   * @param {string} imageData - Image data
   * @param {Object} metadata - Metadata
   * @returns {Promise<string>} - Storage ID
   */
  async fallbackStorage(imageData, metadata) {
    try {
      // Compress image aggressively for localStorage
      const compressedData = await this.compressImage(imageData, 0.6);
      
      // Check if it fits in localStorage (leave 1MB buffer)
      const estimatedSize = compressedData.length * 0.75; // Base64 overhead
      const maxSize = 4 * 1024 * 1024; // 4MB limit
      
      if (estimatedSize < maxSize) {
        const id = `fallback_${Date.now()}`;
        localStorage.setItem(`nexus-bg-${id}`, compressedData);
        localStorage.setItem('nexus-current-background-id', id);
        localStorage.setItem('nexus-background-metadata', JSON.stringify(metadata));
        return id;
      } else {
        throw new Error('Image too large even after compression');
      }
    } catch (error) {
      console.error('Fallback storage failed:', error);
      throw error;
    }
  }

  /**
   * Get fallback storage data
   * @returns {Object} - Fallback background data
   */
  getFallbackStorage() {
    const currentId = localStorage.getItem('nexus-current-background-id');
    if (currentId && currentId.startsWith('fallback_')) {
      const imageData = localStorage.getItem(`nexus-bg-${currentId}`);
      const metadata = JSON.parse(localStorage.getItem('nexus-background-metadata') || '{}');
      
      if (imageData) {
        return {
          id: currentId,
          imageData,
          metadata
        };
      }
    }

    // Check legacy storage
    const legacyBg = localStorage.getItem('customChatBg');
    if (legacyBg) {
      return {
        id: 'legacy',
        imageData: legacyBg,
        metadata: { type: 'legacy' }
      };
    }

    return null;
  }

  /**
   * Calculate data size
   * @param {string} data - Data string
   * @returns {number} - Size in bytes
   */
  calculateSize(data) {
    return new Blob([data]).size;
  }

  /**
   * Get storage statistics
   * @returns {Promise<Object>} - Storage stats
   */
  async getStorageStats() {
    try {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          const backgrounds = request.result;
          const totalSize = backgrounds.reduce((sum, bg) => sum + (bg.metadata?.size || 0), 0);
          
          resolve({
            count: backgrounds.length,
            totalSize,
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            backgrounds: backgrounds.map(bg => ({
              id: bg.id,
              timestamp: bg.metadata?.timestamp,
              size: bg.metadata?.size,
              sizeMB: ((bg.metadata?.size || 0) / (1024 * 1024)).toFixed(2)
            }))
          });
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return { count: 0, totalSize: 0, totalSizeMB: '0.00', backgrounds: [] };
    }
  }

  /**
   * Migrate legacy localStorage backgrounds to IndexedDB
   * @returns {Promise<boolean>} - Migration success
   */
  async migrateLegacyBackgrounds() {
    try {
      const legacyBg = localStorage.getItem('customChatBg');
      if (legacyBg && legacyBg.length > 0) {
        console.log('Migrating legacy background to IndexedDB...');
        
        const id = await this.storeBackground(legacyBg, {
          type: 'migrated',
          source: 'legacy_localStorage'
        });
        
        // Remove legacy storage
        localStorage.removeItem('customChatBg');
        
        console.log('Legacy background migrated successfully:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Legacy migration failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const backgroundStorageManager = new BackgroundStorageManager();

export default backgroundStorageManager;