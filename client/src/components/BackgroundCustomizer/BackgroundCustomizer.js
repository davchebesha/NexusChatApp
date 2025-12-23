/**
 * BackgroundCustomizer - Professional Background Customization System
 * FIXED: No longer limited by localStorage - supports large images via IndexedDB
 * Allows users to set custom backgrounds from device without size restrictions
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  FiImage, 
  FiUpload, 
  FiX, 
  FiCheck,
  FiAlertTriangle,
  FiRefreshCw,
  FiEye,
  FiSettings,
  FiInfo
} from 'react-icons/fi';
import backgroundStorageManager from '../../utils/BackgroundStorageManager';
import './BackgroundCustomizer.css';

const BackgroundCustomizer = ({ 
  onBackgroundChange, 
  onClose,
  currentBackground = null 
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [storageStats, setStorageStats] = useState(null);
  const [backgroundSettings, setBackgroundSettings] = useState({
    opacity: 0.8,
    blur: 0,
    brightness: 1,
    contrast: 1,
    position: 'center',
    size: 'cover'
  });
  
  const fileInputRef = useRef(null);
  // FIXED: Removed 4MB limit - now supports much larger images
  const RECOMMENDED_MAX_SIZE = 10 * 1024 * 1024; // 10MB recommended (not enforced)

  // Load storage stats on mount
  useEffect(() => {
    loadStorageStats();
    migrateLegacyBackgrounds();
  }, []);

  // Load storage statistics
  const loadStorageStats = async () => {
    try {
      const stats = await backgroundStorageManager.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Failed to load storage stats:', error);
    }
  };

  // Migrate legacy backgrounds
  const migrateLegacyBackgrounds = async () => {
    try {
      const migrated = await backgroundStorageManager.migrateLegacyBackgrounds();
      if (migrated) {
        setSuccess('Legacy background migrated to enhanced storage!');
        loadStorageStats();
      }
    } catch (error) {
      console.error('Migration failed:', error);
    }
  };

  // Handle file selection
  const handleFileSelect = useCallback((file) => {
    setError(null);
    setSuccess(null);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    
    // Show warning for very large files (but don't block them)
    if (file.size > RECOMMENDED_MAX_SIZE) {
      setError(`Large file detected (${formatFileSize(file.size)}). Processing may take longer, but the image will be optimized automatically.`);
    }
    
    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  // Handle file input change
  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Process and apply background
  const handleApplyBackground = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Create canvas for image processing and optimization
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imagePreview;
      });
      
      // ENHANCED: Smart image optimization based on size
      const maxWidth = 1920;
      const maxHeight = 1080;
      let { width, height } = img;
      
      // Calculate optimal dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Apply filters
      ctx.filter = `
        brightness(${backgroundSettings.brightness})
        contrast(${backgroundSettings.contrast})
        blur(${backgroundSettings.blur}px)
      `;
      
      // Draw image
      ctx.drawImage(img, 0, 0, width, height);
      
      // ENHANCED: Smart compression based on original file size
      let quality = 0.9;
      if (selectedImage.size > 5 * 1024 * 1024) quality = 0.8; // 5MB+
      if (selectedImage.size > 10 * 1024 * 1024) quality = 0.7; // 10MB+
      
      // Convert to optimized data URL
      const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // FIXED: Store using IndexedDB instead of localStorage
      const backgroundId = await backgroundStorageManager.storeBackground(optimizedDataUrl, {
        originalFileName: selectedImage.name,
        originalSize: selectedImage.size,
        optimizedSize: new Blob([optimizedDataUrl]).size,
        settings: backgroundSettings,
        dimensions: { width, height },
        quality,
        timestamp: Date.now()
      });
      
      // Create background object for immediate use
      const backgroundData = {
        id: backgroundId,
        url: optimizedDataUrl,
        settings: backgroundSettings,
        timestamp: Date.now()
      };
      
      // Apply background immediately
      onBackgroundChange(backgroundData);
      
      setSuccess(`Background applied successfully! Stored as ID: ${backgroundId}`);
      setIsProcessing(false);
      
      // Update storage stats
      loadStorageStats();
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Background processing failed:', error);
      setError(`Failed to process background image: ${error.message}. The image may be too large or corrupted.`);
      setIsProcessing(false);
    }
  };

  // Reset to default
  const handleReset = async () => {
    try {
      setIsProcessing(true);
      
      // Clear all stored backgrounds
      await backgroundStorageManager.clearAllBackgrounds();
      
      // Reset UI state
      setSelectedImage(null);
      setImagePreview(null);
      setError(null);
      setSuccess('All backgrounds cleared successfully!');
      setBackgroundSettings({
        opacity: 0.8,
        blur: 0,
        brightness: 1,
        contrast: 1,
        position: 'center',
        size: 'cover'
      });
      
      // Remove background from UI
      onBackgroundChange(null);
      
      // Update storage stats
      loadStorageStats();
      
      setIsProcessing(false);
    } catch (error) {
      console.error('Reset failed:', error);
      setError('Failed to reset backgrounds. Please try again.');
      setIsProcessing(false);
    }
  };

  // Handle setting changes
  const handleSettingChange = (setting, value) => {
    setBackgroundSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };\n\n  return (\n    <div className=\"background-customizer-overlay\">\n      <div className=\"background-customizer\">\n        <div className=\"customizer-header\">\n          <div className=\"header-info\">\n            <FiImage className=\"header-icon\" />\n            <h3>Customize Background</h3>\n          </div>\n          <button className=\"close-btn\" onClick={onClose}>\n            <FiX />\n          </button>\n        </div>\n\n        <div className=\"customizer-content\">\n          {/* File Upload Area */}\n          <div className=\"upload-section\">\n            <div \n              className={`upload-area ${selectedImage ? 'has-image' : ''}`}\n              onDrop={handleDrop}\n              onDragOver={handleDragOver}\n              onClick={() => fileInputRef.current?.click()}\n            >\n              {imagePreview ? (\n                <div className=\"image-preview\">\n                  <img \n                    src={imagePreview} \n                    alt=\"Background preview\"\n                    style={{\n                      opacity: backgroundSettings.opacity,\n                      filter: `\n                        brightness(${backgroundSettings.brightness})\n                        contrast(${backgroundSettings.contrast})\n                        blur(${backgroundSettings.blur}px)\n                      `\n                    }}\n                  />\n                  <div className=\"preview-overlay\">\n                    <FiEye />\n                    <span>Preview</span>\n                  </div>\n                </div>\n              ) : (\n                <div className=\"upload-placeholder\">\n                  <FiUpload className=\"upload-icon\" />\n                  <h4>Choose Background Image</h4>\n                  <p>Drag and drop an image here, or click to browse</p>\n                  <div className=\"upload-requirements\">\n                    <span>• Maximum size: 4MB</span>\n                    <span>• Supported formats: JPG, PNG, WebP</span>\n                    <span>• Recommended: 1920x1080 or higher</span>\n                  </div>\n                </div>\n              )}\n            </div>\n            \n            <input\n              ref={fileInputRef}\n              type=\"file\"\n              accept=\"image/*\"\n              onChange={handleInputChange}\n              style={{ display: 'none' }}\n            />\n          </div>\n\n          {/* Error Display */}\n          {error && (\n            <div className=\"error-message\">\n              <FiAlertTriangle />\n              <span>{error}</span>\n            </div>\n          )}\n\n          {/* Settings Panel */}\n          {selectedImage && (\n            <div className=\"settings-panel\">\n              <h4>\n                <FiSettings />\n                Background Settings\n              </h4>\n              \n              <div className=\"settings-grid\">\n                <div className=\"setting-group\">\n                  <label>Opacity</label>\n                  <div className=\"slider-container\">\n                    <input\n                      type=\"range\"\n                      min=\"0.1\"\n                      max=\"1\"\n                      step=\"0.1\"\n                      value={backgroundSettings.opacity}\n                      onChange={(e) => handleSettingChange('opacity', parseFloat(e.target.value))}\n                    />\n                    <span>{Math.round(backgroundSettings.opacity * 100)}%</span>\n                  </div>\n                </div>\n\n                <div className=\"setting-group\">\n                  <label>Blur</label>\n                  <div className=\"slider-container\">\n                    <input\n                      type=\"range\"\n                      min=\"0\"\n                      max=\"10\"\n                      step=\"1\"\n                      value={backgroundSettings.blur}\n                      onChange={(e) => handleSettingChange('blur', parseInt(e.target.value))}\n                    />\n                    <span>{backgroundSettings.blur}px</span>\n                  </div>\n                </div>\n\n                <div className=\"setting-group\">\n                  <label>Brightness</label>\n                  <div className=\"slider-container\">\n                    <input\n                      type=\"range\"\n                      min=\"0.5\"\n                      max=\"2\"\n                      step=\"0.1\"\n                      value={backgroundSettings.brightness}\n                      onChange={(e) => handleSettingChange('brightness', parseFloat(e.target.value))}\n                    />\n                    <span>{Math.round(backgroundSettings.brightness * 100)}%</span>\n                  </div>\n                </div>\n\n                <div className=\"setting-group\">\n                  <label>Contrast</label>\n                  <div className=\"slider-container\">\n                    <input\n                      type=\"range\"\n                      min=\"0.5\"\n                      max=\"2\"\n                      step=\"0.1\"\n                      value={backgroundSettings.contrast}\n                      onChange={(e) => handleSettingChange('contrast', parseFloat(e.target.value))}\n                    />\n                    <span>{Math.round(backgroundSettings.contrast * 100)}%</span>\n                  </div>\n                </div>\n\n                <div className=\"setting-group\">\n                  <label>Position</label>\n                  <select \n                    value={backgroundSettings.position}\n                    onChange={(e) => handleSettingChange('position', e.target.value)}\n                  >\n                    <option value=\"center\">Center</option>\n                    <option value=\"top\">Top</option>\n                    <option value=\"bottom\">Bottom</option>\n                    <option value=\"left\">Left</option>\n                    <option value=\"right\">Right</option>\n                  </select>\n                </div>\n\n                <div className=\"setting-group\">\n                  <label>Size</label>\n                  <select \n                    value={backgroundSettings.size}\n                    onChange={(e) => handleSettingChange('size', e.target.value)}\n                  >\n                    <option value=\"cover\">Cover</option>\n                    <option value=\"contain\">Contain</option>\n                    <option value=\"stretch\">Stretch</option>\n                    <option value=\"tile\">Tile</option>\n                  </select>\n                </div>\n              </div>\n            </div>\n          )}\n        </div>\n\n        {/* Actions */}\n        <div className=\"customizer-actions\">\n          <button className=\"reset-btn\" onClick={handleReset}>\n            <FiRefreshCw />\n            Reset to Default\n          </button>\n          \n          <div className=\"action-buttons\">\n            <button className=\"cancel-btn\" onClick={onClose}>\n              Cancel\n            </button>\n            <button \n              className=\"apply-btn\" \n              onClick={handleApplyBackground}\n              disabled={!selectedImage || isProcessing}\n            >\n              {isProcessing ? (\n                <>\n                  <div className=\"spinner\" />\n                  Processing...\n                </>\n              ) : (\n                <>\n                  <FiCheck />\n                  Apply Background\n                </>\n              )}\n            </button>\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default BackgroundCustomizer;"