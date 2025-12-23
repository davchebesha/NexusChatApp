/**
 * FileDownloadManager - Professional File Download System
 * Handles file downloads with user choice for save location (Device/Google Drive)
 */

import React, { useState, useCallback } from 'react';
import { 
  FiDownload, 
  FiFolderPlus, 
  FiHardDrive, 
  FiCloud,
  FiCheck,
  FiX,
  FiFolder,
  FiFile
} from 'react-icons/fi';
import './FileDownloadManager.css';

const FileDownloadManager = ({ 
  file, 
  onDownloadComplete, 
  onCancel,
  showModal = true 
}) => {
  const [downloadLocation, setDownloadLocation] = useState('device'); // 'device' | 'googledrive' | 'both'
  const [customPath, setCustomPath] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showPathSelector, setShowPathSelector] = useState(false);

  // Handle download location selection
  const handleLocationChange = (location) => {
    setDownloadLocation(location);
    if (location === 'device') {
      setShowPathSelector(true);
    }
  };

  // Handle device path selection
  const handlePathSelection = async () => {
    try {
      // Use File System Access API for modern browsers
      if ('showDirectoryPicker' in window) {
        const dirHandle = await window.showDirectoryPicker();
        setCustomPath(dirHandle.name);
        setShowPathSelector(false);
      } else {
        // Fallback for older browsers
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.onchange = (e) => {
          if (e.target.files.length > 0) {
            const path = e.target.files[0].webkitRelativePath.split('/')[0];
            setCustomPath(path);
            setShowPathSelector(false);
          }
        };
        input.click();
      }
    } catch (error) {
      console.error('Path selection cancelled or failed:', error);
      setShowPathSelector(false);
    }
  };

  // Download to device
  const downloadToDevice = async (file, path = '') => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      
      return { success: true, path: path || 'Downloads' };
    } catch (error) {
      console.error('Device download failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Download to Google Drive
  const downloadToGoogleDrive = async (file) => {
    try {
      // Simulate Google Drive API integration
      // In real implementation, use Google Drive API
      const response = await fetch('/api/googledrive/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl: file.url,
          fileName: file.name,
          fileSize: file.size
        })
      });
      
      const result = await response.json();
      return { success: result.success, driveId: result.fileId };
    } catch (error) {
      console.error('Google Drive upload failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Handle download process
  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    const results = [];
    
    try {
      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Download to selected locations
      if (downloadLocation === 'device' || downloadLocation === 'both') {
        const deviceResult = await downloadToDevice(file, customPath);
        results.push({ location: 'device', ...deviceResult });
      }
      
      if (downloadLocation === 'googledrive' || downloadLocation === 'both') {
        const driveResult = await downloadToGoogleDrive(file);
        results.push({ location: 'googledrive', ...driveResult });
      }
      
      clearInterval(progressInterval);
      setDownloadProgress(100);
      
      // Complete download
      setTimeout(() => {
        onDownloadComplete?.(results);
      }, 500);
      
    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className=\"download-modal-overlay\">\n      <div className=\"download-modal\">\n        <div className=\"download-header\">\n          <FiDownload className=\"download-icon\" />\n          <h3>Download File</h3>\n          <button className=\"close-btn\" onClick={onCancel}>\n            <FiX />\n          </button>\n        </div>\n\n        <div className=\"file-info\">\n          <div className=\"file-preview\">\n            <FiFile className=\"file-icon\" />\n            <div className=\"file-details\">\n              <span className=\"file-name\">{file.name}</span>\n              <span className=\"file-size\">{formatFileSize(file.size)}</span>\n              <span className=\"file-type\">{file.type}</span>\n            </div>\n          </div>\n        </div>\n\n        {!isDownloading ? (\n          <>\n            <div className=\"download-options\">\n              <h4>Choose download location:</h4>\n              \n              <div className=\"location-options\">\n                <label className={`location-option ${downloadLocation === 'device' ? 'selected' : ''}`}>\n                  <input\n                    type=\"radio\"\n                    name=\"location\"\n                    value=\"device\"\n                    checked={downloadLocation === 'device'}\n                    onChange={() => handleLocationChange('device')}\n                  />\n                  <div className=\"option-content\">\n                    <FiHardDrive className=\"option-icon\" />\n                    <div className=\"option-text\">\n                      <span className=\"option-title\">This Device</span>\n                      <span className=\"option-desc\">Save to local storage</span>\n                    </div>\n                  </div>\n                </label>\n\n                <label className={`location-option ${downloadLocation === 'googledrive' ? 'selected' : ''}`}>\n                  <input\n                    type=\"radio\"\n                    name=\"location\"\n                    value=\"googledrive\"\n                    checked={downloadLocation === 'googledrive'}\n                    onChange={() => handleLocationChange('googledrive')}\n                  />\n                  <div className=\"option-content\">\n                    <FiCloud className=\"option-icon\" />\n                    <div className=\"option-text\">\n                      <span className=\"option-title\">Google Drive</span>\n                      <span className=\"option-desc\">Save to cloud storage</span>\n                    </div>\n                  </div>\n                </label>\n\n                <label className={`location-option ${downloadLocation === 'both' ? 'selected' : ''}`}>\n                  <input\n                    type=\"radio\"\n                    name=\"location\"\n                    value=\"both\"\n                    checked={downloadLocation === 'both'}\n                    onChange={() => handleLocationChange('both')}\n                  />\n                  <div className=\"option-content\">\n                    <div className=\"option-icons\">\n                      <FiHardDrive />\n                      <FiCloud />\n                    </div>\n                    <div className=\"option-text\">\n                      <span className=\"option-title\">Both Locations</span>\n                      <span className=\"option-desc\">Save to device and cloud</span>\n                    </div>\n                  </div>\n                </label>\n              </div>\n            </div>\n\n            {(downloadLocation === 'device' || downloadLocation === 'both') && (\n              <div className=\"path-selector\">\n                <label>Save Location:</label>\n                <div className=\"path-input-group\">\n                  <input\n                    type=\"text\"\n                    value={customPath || 'Downloads'}\n                    placeholder=\"Choose folder...\"\n                    readOnly\n                  />\n                  <button className=\"browse-btn\" onClick={handlePathSelection}>\n                    <FiFolderPlus />\n                    Browse\n                  </button>\n                </div>\n              </div>\n            )}\n\n            <div className=\"download-actions\">\n              <button className=\"cancel-btn\" onClick={onCancel}>\n                Cancel\n              </button>\n              <button className=\"download-btn\" onClick={handleDownload}>\n                <FiDownload />\n                Download\n              </button>\n            </div>\n          </>\n        ) : (\n          <div className=\"download-progress\">\n            <div className=\"progress-info\">\n              <span>Downloading...</span>\n              <span>{downloadProgress}%</span>\n            </div>\n            <div className=\"progress-bar\">\n              <div \n                className=\"progress-fill\" \n                style={{ width: `${downloadProgress}%` }}\n              />\n            </div>\n            <div className=\"progress-details\">\n              {downloadLocation === 'device' && (\n                <div className=\"progress-item\">\n                  <FiHardDrive />\n                  <span>Saving to device...</span>\n                </div>\n              )}\n              {downloadLocation === 'googledrive' && (\n                <div className=\"progress-item\">\n                  <FiCloud />\n                  <span>Uploading to Google Drive...</span>\n                </div>\n              )}\n              {downloadLocation === 'both' && (\n                <>\n                  <div className=\"progress-item\">\n                    <FiHardDrive />\n                    <span>Saving to device...</span>\n                  </div>\n                  <div className=\"progress-item\">\n                    <FiCloud />\n                    <span>Uploading to Google Drive...</span>\n                  </div>\n                </>\n              )}\n            </div>\n          </div>\n        )}\n      </div>\n    </div>\n  );\n};\n\n// Utility function to format file size\nconst formatFileSize = (bytes) => {\n  if (bytes === 0) return '0 Bytes';\n  const k = 1024;\n  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];\n  const i = Math.floor(Math.log(bytes) / Math.log(k));\n  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];\n};\n\nexport default FileDownloadManager;"