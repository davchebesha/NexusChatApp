import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook for media player functionality
 * Provides playback state management and audio controls
 */
export const useMediaPlayer = (audioUrl, options = {}) => {
  const {
    onPlaybackStateChange,
    onEnded,
    onError,
    autoPlay = false,
    loop = false,
    preload = 'metadata'
  } = options;

  const [playbackState, setPlaybackState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    buffered: 0,
    loading: false,
    error: null
  });

  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const progressUpdateRef = useRef(null);

  // Update parent component with playback state changes
  useEffect(() => {
    if (onPlaybackStateChange) {
      onPlaybackStateChange(playbackState);
    }
  }, [playbackState, onPlaybackStateChange]);

  // Initialize audio element
  useEffect(() => {
    if (!audioUrl) return;

    const audio = audioRef.current;
    if (!audio) return;

    setPlaybackState(prev => ({ ...prev, loading: true, error: null }));

    audio.src = audioUrl;
    audio.preload = preload;
    audio.loop = loop;

    const handleLoadStart = () => {
      setPlaybackState(prev => ({ ...prev, loading: true }));
    };

    const handleLoadedMetadata = () => {
      setPlaybackState(prev => ({
        ...prev,
        duration: audio.duration,
        loading: false
      }));
    };

    const handleCanPlay = () => {
      setPlaybackState(prev => ({ ...prev, loading: false }));
      
      if (autoPlay) {
        audio.play().catch(err => {
          console.error('Auto-play failed:', err);
          setPlaybackState(prev => ({
            ...prev,
            error: 'Auto-play blocked by browser'
          }));
          if (onError) onError(err);
        });
      }
    };

    const handleTimeUpdate = () => {
      setPlaybackState(prev => ({
        ...prev,
        currentTime: audio.currentTime
      }));
    };

    const handlePlay = () => {
      setPlaybackState(prev => ({ ...prev, isPlaying: true }));
      
      // Start progress updates
      if (progressUpdateRef.current) {
        clearInterval(progressUpdateRef.current);
      }
      progressUpdateRef.current = setInterval(() => {
        if (audio && !audio.paused) {
          setPlaybackState(prev => ({
            ...prev,
            currentTime: audio.currentTime
          }));
        }
      }, 100);
    };

    const handlePause = () => {
      setPlaybackState(prev => ({ ...prev, isPlaying: false }));
      
      if (progressUpdateRef.current) {
        clearInterval(progressUpdateRef.current);
        progressUpdateRef.current = null;
      }
    };

    const handleEnded = () => {
      setPlaybackState(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: loop ? prev.currentTime : 0
      }));
      
      if (progressUpdateRef.current) {
        clearInterval(progressUpdateRef.current);
        progressUpdateRef.current = null;
      }
      
      if (!loop) {
        audio.currentTime = 0;
      }
      
      if (onEnded) onEnded();
    };

    const handleVolumeChange = () => {
      setPlaybackState(prev => ({ ...prev, volume: audio.volume }));
      setIsMuted(audio.muted);
    };

    const handleRateChange = () => {
      setPlaybackState(prev => ({ ...prev, playbackRate: audio.playbackRate }));
    };

    const handleProgress = () => {
      if (audio.buffered.length > 0 && audio.duration > 0) {
        const buffered = (audio.buffered.end(audio.buffered.length - 1) / audio.duration) * 100;
        setPlaybackState(prev => ({ ...prev, buffered }));
      }
    };

    const handleError = (e) => {
      const errorMessage = getAudioErrorMessage(audio.error);
      console.error('Audio playback error:', errorMessage, e);
      
      setPlaybackState(prev => ({
        ...prev,
        isPlaying: false,
        loading: false,
        error: errorMessage
      }));
      
      if (onError) onError(new Error(errorMessage));
    };

    const handleWaiting = () => {
      setPlaybackState(prev => ({ ...prev, loading: true }));
    };

    const handleCanPlayThrough = () => {
      setPlaybackState(prev => ({ ...prev, loading: false }));
    };

    // Add event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('volumechange', handleVolumeChange);
    audio.addEventListener('ratechange', handleRateChange);
    audio.addEventListener('progress', handleProgress);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('volumechange', handleVolumeChange);
      audio.removeEventListener('ratechange', handleRateChange);
      audio.removeEventListener('progress', handleProgress);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      
      if (progressUpdateRef.current) {
        clearInterval(progressUpdateRef.current);
        progressUpdateRef.current = null;
      }
    };
  }, [audioUrl, autoPlay, loop, preload, onPlaybackStateChange, onEnded, onError]);

  // Play/Pause toggle
  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;

    try {
      if (playbackState.isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
      return true;
    } catch (err) {
      console.error('Playback toggle failed:', err);
      setPlaybackState(prev => ({
        ...prev,
        error: 'Playback failed'
      }));
      if (onError) onError(err);
      return false;
    }
  }, [playbackState.isPlaying, onError]);

  // Play
  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;

    try {
      await audio.play();
      return true;
    } catch (err) {
      console.error('Play failed:', err);
      setPlaybackState(prev => ({
        ...prev,
        error: 'Play failed'
      }));
      if (onError) onError(err);
      return false;
    }
  }, [onError]);

  // Pause
  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
  }, []);

  // Seek to specific time
  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio) return;

    const clampedTime = Math.max(0, Math.min(time, playbackState.duration));
    audio.currentTime = clampedTime;
  }, [playbackState.duration]);

  // Set volume
  const setVolume = useCallback((volume) => {
    const audio = audioRef.current;
    if (!audio) return;

    const clampedVolume = Math.max(0, Math.min(volume, 1));
    audio.volume = clampedVolume;
    audio.muted = clampedVolume === 0;
  }, []);

  // Set playback rate
  const setPlaybackRate = useCallback((rate) => {
    const audio = audioRef.current;
    if (!audio) return;

    const clampedRate = Math.max(0.25, Math.min(rate, 4));
    audio.playbackRate = clampedRate;
  }, []);

  // Skip forward/backward
  const skip = useCallback((seconds) => {
    const newTime = playbackState.currentTime + seconds;
    seek(newTime);
  }, [playbackState.currentTime, seek]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
  }, []);

  // Reset to beginning
  const reset = useCallback(() => {
    seek(0);
    pause();
  }, [seek, pause]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressUpdateRef.current) {
        clearInterval(progressUpdateRef.current);
      }
    };
  }, []);

  return {
    // Audio element ref
    audioRef,
    
    // State
    playbackState,
    isMuted,
    
    // Actions
    play,
    pause,
    togglePlayback,
    seek,
    setVolume,
    setPlaybackRate,
    skip,
    toggleMute,
    reset,
    
    // Computed properties
    isLoading: playbackState.loading,
    hasError: !!playbackState.error,
    canPlay: !playbackState.loading && !playbackState.error && playbackState.duration > 0,
    progress: playbackState.duration > 0 ? (playbackState.currentTime / playbackState.duration) * 100 : 0,
    remainingTime: playbackState.duration - playbackState.currentTime,
    
    // Utility functions
    formatTime: (seconds) => {
      if (!seconds || isNaN(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  };
};

// Helper function to get user-friendly error messages
const getAudioErrorMessage = (error) => {
  if (!error) return 'Unknown audio error';
  
  switch (error.code) {
    case error.MEDIA_ERR_ABORTED:
      return 'Audio playback was aborted';
    case error.MEDIA_ERR_NETWORK:
      return 'Network error occurred while loading audio';
    case error.MEDIA_ERR_DECODE:
      return 'Audio format not supported or corrupted';
    case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return 'Audio format not supported';
    default:
      return 'Audio playback error occurred';
  }
};