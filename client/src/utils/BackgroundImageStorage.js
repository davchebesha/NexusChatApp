/**
 * BackgroundImageStorage - Enhanced storage solution for background images
 * CRITICAL: Fixes QuotaExceededError by using IndexedDB instead of localStorage
 * Supports large images without storage size restrictions
 */

class BackgroundImageStorage {
  constructor() {
    this.dbName = 'NexusChatAppDB';
    this.dbVersion = 1;
    this.storeName = 'backgroundImages';
    this.db = null;
  }

  // CRITICAL: Initialize IndexedDB for large file storage
  async init() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('BackgroundImageStorage: Failed to open IndexedDB', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ BackgroundImageStorage: IndexedDB initialized');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store for background images
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          console.log('✅ BackgroundImageStorage: Object store created');
        }
      };
    });
  }

  // CRITICAL: Store background image without size limitations
  async storeBackgroundImage(file, options = {}) {
    try {
      await this.init();

      // Compress image if needed
      const compressedFile = await this.compressImage(file, options);
      
      // Convert to base64 for storage
      const base64Data = await this.fileToBase64(compressedFile);
      
      const imageData = {
        id: options.id || `bg_${Date.now()}`,
        name: file.name,
        originalName: file.name,
        size: compressedFile.size,
        originalSize: file.size,
        type: compressedFile.type,
        base64Data,
        createdAt: new Date().toISOString(),
        isCustom: true,
        compressed: compressedFile.size < file.size
      };

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.put(imageData);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      console.log('✅ BackgroundImageStorage: Image stored successfully', {
        id: imageData.id,
        originalSize: this.formatFileSize(file.size),
        compressedSize: this.formatFileSize(compressedFile.size),
        compressionRatio: ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%'
      });

      return imageData.id;
    } catch (error) {
      console.error('❌ BackgroundImageStorage: Failed to store image', error);
      throw error;
    }
  }

  // CRITICAL: Retrieve background image by ID
  async getBackgroundImage(id) {
    try {
      await this.init();

      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const imageData = await new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (imageData) {
        return {
          ...imageData,
          dataUrl: imageData.base64Data
        };
      }

      return null;
    } catch (error) {
      console.error('❌ BackgroundImageStorage: Failed to retrieve image', error);
      return null;
    }
  }

  // Get all stored background images
  async getAllBackgroundImages() {
    try {
      await this.init();

      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const images = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      return images.map(img => ({
        id: img.id,
        name: img.name,
        size: img.size,
        createdAt: img.createdAt,
        isCustom: img.isCustom,
        compressed: img.compressed
      }));
    } catch (error) {
      console.error('❌ BackgroundImageStorage: Failed to get all images', error);
      return [];
    }
  }

  // Delete background image
  async deleteBackgroundImage(id) {
    try {
      await this.init();

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log('✅ BackgroundImageStorage: Image deleted', id);
      return true;
    } catch (error) {
      console.error('❌ BackgroundImageStorage: Failed to delete image', error);
      return false;
    }
  }

  // CRITICAL: Compress image to reduce storage size
  async compressImage(file, options = {}) {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'image/jpeg'
    } = options;

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
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
        
        canvas.toBlob((blob) => {
          resolve(blob || file);
        }, format, quality);
      };

      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  }

  // Convert file to base64
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // CRITICAL: Clear all stored images (cleanup)
  async clearAllImages() {
    try {
      await this.init();

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log('✅ BackgroundImageStorage: All images cleared');
      return true;
    } catch (error) {
      console.error('❌ BackgroundImageStorage: Failed to clear images', error);
      return false;
    }
  }

  // Get storage usage statistics
  async getStorageStats() {
    try {
      const images = await this.getAllBackgroundImages();
      const totalSize = images.reduce((sum, img) => sum + img.size, 0);
      
      return {
        totalImages: images.length,
        totalSize,
        formattedSize: this.formatFileSize(totalSize),
        images
      };
    } catch (error) {
      console.error('❌ BackgroundImageStorage: Failed to get storage stats', error);
      return {
        totalImages: 0,
        totalSize: 0,
        formattedSize: '0 Bytes',
        images: []
      };
    }
  }
}

// CRITICAL: Singleton instance for global use
const backgroundImageStorage = new BackgroundImageStorage();

export default backgroundImageStorage;