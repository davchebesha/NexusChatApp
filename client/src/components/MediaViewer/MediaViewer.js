/**
 * MediaViewer - Professional Media Viewer Component
 * Opens photos/videos in-app with external app options like Telegram
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  FiX, 
  FiDownload, 
  FiExternalLink, 
  FiRotateCw,
  FiZoomIn,
  FiZoomOut,
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiShare2,
  FiMoreHorizontal
} from 'react-icons/fi';
import FileDownloadManager from '../FileManagement/FileDownloadManager';
import './MediaViewer.css';

const MediaViewer = ({ 
  media, 
  onClose, 
  onNext, 
  onPrevious,
  showNavigation = true 
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showExternalOptions, setShowExternalOptions] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen();
          } else {
            onClose();
          }
          break;
        case 'ArrowLeft':
          onPrevious?.();
          break;
        case 'ArrowRight':
          onNext?.();
          break;
        case ' ':
          e.preventDefault();
          if (media.type.startsWith('video')) {
            togglePlayPause();
          }
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'r':
          handleRotate();
          break;
        case 'f':
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, media.type]);

  // Video event handlers
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Image manipulation
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetTransform = () => {
    setZoom(1);
    setRotation(0);
  };

  // Fullscreen handling
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  };

  const enterFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  // External app options
  const handleOpenExternal = (appType) => {
    const url = media.url;
    
    switch (appType) {
      case 'default':
        window.open(url, '_blank');
        break;
      case 'photos':
        // Try to open with system photos app
        if (navigator.share) {
          navigator.share({
            title: media.name,
            url: url
          });
        } else {
          window.open(url, '_blank');
        }
        break;
      case 'vlc':
        // VLC protocol handler
        window.location.href = `vlc://${url}`;
        break;
      case 'system':
        // System default handler
        const link = document.createElement('a');
        link.href = url;
        link.download = media.name;
        link.click();
        break;
      default:
        window.open(url, '_blank');
    }
    setShowExternalOptions(false);
  };

  // Format time for video
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isImage = media.type.startsWith('image');
  const isVideo = media.type.startsWith('video');

  return (\n    <div \n      ref={containerRef}\n      className={`media-viewer ${isFullscreen ? 'fullscreen' : ''}`}\n      onClick={(e) => e.target === e.currentTarget && onClose()}\n    >\n      {/* Header Controls */}\n      <div className=\"media-header\">\n        <div className=\"media-info\">\n          <span className=\"media-name\">{media.name}</span>\n          <span className=\"media-size\">{formatFileSize(media.size)}</span>\n        </div>\n        \n        <div className=\"header-controls\">\n          {isImage && (\n            <>\n              <button className=\"control-btn\" onClick={handleZoomOut} title=\"Zoom Out (-)\">\n                <FiZoomOut />\n              </button>\n              <span className=\"zoom-level\">{Math.round(zoom * 100)}%</span>\n              <button className=\"control-btn\" onClick={handleZoomIn} title=\"Zoom In (+)\">\n                <FiZoomIn />\n              </button>\n              <button className=\"control-btn\" onClick={handleRotate} title=\"Rotate (R)\">\n                <FiRotateCw />\n              </button>\n            </>\n          )}\n          \n          <button className=\"control-btn\" onClick={toggleFullscreen} title=\"Fullscreen (F)\">\n            <FiMaximize />\n          </button>\n          \n          <div className=\"dropdown-container\">\n            <button \n              className=\"control-btn\" \n              onClick={() => setShowExternalOptions(!showExternalOptions)}\n              title=\"Open with...\"\n            >\n              <FiExternalLink />\n            </button>\n            \n            {showExternalOptions && (\n              <div className=\"external-options\">\n                <button onClick={() => handleOpenExternal('default')}>Open in Browser</button>\n                {isImage && <button onClick={() => handleOpenExternal('photos')}>Open with Photos</button>}\n                {isVideo && <button onClick={() => handleOpenExternal('vlc')}>Open with VLC</button>}\n                <button onClick={() => handleOpenExternal('system')}>Open with System Default</button>\n              </div>\n            )}\n          </div>\n          \n          <button className=\"control-btn\" onClick={() => setShowDownloadModal(true)} title=\"Download\">\n            <FiDownload />\n          </button>\n          \n          <button className=\"control-btn close-btn\" onClick={onClose} title=\"Close (Esc)\">\n            <FiX />\n          </button>\n        </div>\n      </div>\n\n      {/* Media Content */}\n      <div className=\"media-content\">\n        {showNavigation && onPrevious && (\n          <button className=\"nav-btn nav-prev\" onClick={onPrevious}>\n            ←\n          </button>\n        )}\n        \n        <div className=\"media-container\">\n          {isImage && (\n            <img\n              src={media.url}\n              alt={media.name}\n              className=\"media-image\"\n              style={{\n                transform: `scale(${zoom}) rotate(${rotation}deg)`,\n                transition: 'transform 0.3s ease'\n              }}\n              onDoubleClick={resetTransform}\n            />\n          )}\n          \n          {isVideo && (\n            <>\n              <video\n                ref={videoRef}\n                src={media.url}\n                className=\"media-video\"\n                onTimeUpdate={handleTimeUpdate}\n                onLoadedMetadata={handleLoadedMetadata}\n                onPlay={() => setIsPlaying(true)}\n                onPause={() => setIsPlaying(false)}\n                onClick={togglePlayPause}\n              />\n              \n              {/* Video Controls */}\n              <div className=\"video-controls\">\n                <button className=\"play-btn\" onClick={togglePlayPause}>\n                  {isPlaying ? <FiPause /> : <FiPlay />}\n                </button>\n                \n                <div className=\"time-display\">\n                  {formatTime(currentTime)} / {formatTime(duration)}\n                </div>\n                \n                <div className=\"progress-container\" onClick={handleSeek}>\n                  <div className=\"progress-bar\">\n                    <div \n                      className=\"progress-fill\" \n                      style={{ width: `${(currentTime / duration) * 100}%` }}\n                    />\n                  </div>\n                </div>\n                \n                <div className=\"volume-controls\">\n                  <button className=\"volume-btn\" onClick={toggleMute}>\n                    {isMuted ? <FiVolumeX /> : <FiVolume2 />}\n                  </button>\n                  <input\n                    type=\"range\"\n                    min=\"0\"\n                    max=\"1\"\n                    step=\"0.1\"\n                    value={isMuted ? 0 : volume}\n                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}\n                    className=\"volume-slider\"\n                  />\n                </div>\n              </div>\n            </>\n          )}\n        </div>\n        \n        {showNavigation && onNext && (\n          <button className=\"nav-btn nav-next\" onClick={onNext}>\n            →\n          </button>\n        )}\n      </div>\n\n      {/* Download Modal */}\n      {showDownloadModal && (\n        <FileDownloadManager\n          file={media}\n          onDownloadComplete={() => setShowDownloadModal(false)}\n          onCancel={() => setShowDownloadModal(false)}\n        />\n      )}\n    </div>\n  );\n};\n\n// Utility function\nconst formatFileSize = (bytes) => {\n  if (bytes === 0) return '0 Bytes';\n  const k = 1024;\n  const sizes = ['Bytes', 'KB', 'MB', 'GB'];\n  const i = Math.floor(Math.log(bytes) / Math.log(k));\n  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];\n};\n\nexport default MediaViewer;"