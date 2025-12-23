import React, { useState, useEffect, useRef } from 'react';
import { useBranding } from '../../contexts/BrandingContext';
import './BackgroundVideo.css';

const BackgroundVideo = ({ videoSrc, children }) => {
  const { isDarkMode } = useBranding();
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  // Handle video loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      video.play().catch(error => {
        console.warn('Video autoplay failed:', error);
        setShowFallback(true);
      });
    };

    const handleError = () => {
      console.error('Error loading video, falling back to gradient');
      setShowFallback(true);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // Cleanup
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [videoSrc]);

  // Toggle mute state
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  // Fallback gradient based on theme
  const fallbackGradient = isDarkMode
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d0b0b 50%, #3a0f0f 100%)'
    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)';

  return (
    <div className="background-video-container">
      {!showFallback ? (
        <>
          <video
            ref={videoRef}
            className="background-video"
            loop
            muted={isMuted}
            playsInline
            autoPlay
            preload="auto"
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay" />
        </>
      ) : (
        <div 
          className="background-fallback" 
          style={{ background: fallbackGradient }}
        />
      )}
      
      <div className="background-content">
        {children}
      </div>
      
      {!showFallback && (
        <button 
          className="mute-toggle" 
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute background' : 'Mute background'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      )}
    </div>
  );
};

export default BackgroundVideo;
