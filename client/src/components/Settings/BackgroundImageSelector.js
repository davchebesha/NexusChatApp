/**
 * BackgroundImageSelector - Enhanced background image selection with unlimited storage
 * CRITICAL: Fixes 5MB localStorage limitation using IndexedDB storage
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import backgroundImageStorage from '../../utils/BackgroundImageStorage';
import { FiUpload, FiTrash2, FiImage, FiInfo, FiCheck, FiX } from 'react-icons/fi';
import './BackgroundImageSelector.css';

const BackgroundImageSelector = () => {
  const { currentBackground, changeBackground, backgrounds } = useTheme();
  const [customImages, setCustomImages] = useState([]);
  const [selectedCustomImage, setSelectedCustomImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [storageStats, setStorageStats] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  // Load custom images on component mount
  useEffect(() => {
    loadCustomImages();
    loadStorageStats();
  }, []);

  // Load current custom background
  useEffect(() => {
    if (currentBackground.startsWith('custom_')) {
      loadCurrentCustomBackground();
    }
  }, [currentBackground]);

  const loadCustomImages = async () => {
    try {
      const images = await backgroundImageStorage.getAllBackgroundImages();
      setCustomImages(images);
    } catch (error) {
      console.error('Failed to load custom images:', error);
      setError('Failed to load custom images');
    }
  };

  const loadStorageStats = async () => {
    try {
      const stats = await backgroundImageStorage.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Failed to load storage stats:', error);
    }
  };

  const loadCurrentCustomBackground = async () => {
    try {
      const imageId = currentBackground.replace('custom_', '');
      const imageData = await backgroundImageStorage.getBackgroundImage(imageId);
      if (imageData) {
        setSelectedCustomImage(imageData);
      }
    } catch (error) {
      console.error('Failed to load current custom background:', error);
    }
  };

  // CRITICAL: Handle file upload without localStorage limitations
  const handleFileUpload = a