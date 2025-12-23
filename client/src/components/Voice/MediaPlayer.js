import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiSkipBack, FiSkipForward } from 'react-icons/fi';
import './MediaPlayer.css';

const MediaPlayer = ({ 
  audioUrl, 
  waveform = [], 
  duration = 0,
  onPlaybackStateChange,
  autoPlay = false,
  showControls = true,
  compact = false 
}) => {
  const [playbackState, setPlaybackState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    buffered: 0
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [error, setError] = useState(null);
  
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeSliderRef = useRef(null);

  // Update parent component with playback state changes
  useEffect(() => {
    if (onPlaybackStateChange) {
      onPlaybackStateChange(playbackState);
    }
  }, [playbackState, onPlaybackStateChange]);

  // Initialize audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    audio.src = audioUrl;
    audio.preload = 'metadata';

    const handleLoadedMetadata = () => {
      setPlaybackState(prev => ({
        ...prev,
        duration: audio.duration || duration
      }));
      setError(null);
    };

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setPlaybackState(prev => ({
          ...prev,
          currentTime: audio.currentTime
        }));
      }
    };

    const handlePlay = () => {
      setPlaybackState(prev => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setPlaybackState(prev => ({ ...prev, isPlaying: false }));
    };

    const handleEnded = () => {
      setPlaybackState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        currentTime: 0 
      }));
      audio.currentTime = 0;
    };

    const handleVolumeChange = () => {
      setPlaybackState(prev => ({ ...prev, volume: audio.volume }));
      setIsMuted(audio.muted);
    };

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const buffered = (audio.buffered.end(0) / audio.duration) * 100;
        setPlaybackState(prev => ({ ...prev, buffered }));
      }
    };

    const handleError = (e) => {
      console.error('Audio playback error:', e);
      setError('Failed to load audio');
      setPlaybackState(prev => ({ ...prev, isPlaying: false }));
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('volumechange', handleVolumeChange);
    audio.addEventListener('progress', handleProgress);
    audio.addEventListener('error', handleError);

    // Auto play if requested
    if (autoPlay) {
      audio.play().catch(err => {
        console.error('Auto-play failed:', err);
        setError('Auto-play blocked by browser');
      });
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('volumechange', handleVolumeChange);
      audio.removeEventListener('progress', handleProgress);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl, duration, autoPlay, isDragging]);

  // Play/Pause toggle
  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playbackState.isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        console.error('Playback failed:', err);
        setError('Playback failed');
      });
    }
  }, [playbackState.isPlaying]);

  // Seek to specific time
  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio) return;

    const clampedTime = Math.max(0, Math.min(time, playbackState.duration));
    audio.currentTime = clampedTime;
    setPlaybackState(prev => ({ ...prev, currentTime: clampedTime }));
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

    const clampedRate = Math.max(0.25, Math.min(rate, 2));
    audio.playbackRate = clampedRate;
    setPlaybackState(prev => ({ ...prev, playbackRate: clampedRate }));
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

  // Handle progress bar click
  const handleProgressClick = useCallback((e) => {
    const progressBar = progressBarRef.current;
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * playbackState.duration;
    seek(newTime);
  }, [playbackState.duration, seek]);

  // Handle progress bar drag
  const handleProgressDrag = useCallback((e) => {
    if (!isDragging) return;

    const progressBar = progressBarRef.current;
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const dragX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = dragX / rect.width;
    const newTime = percentage * playbackState.duration;
    
    setPlaybackState(prev => ({ ...prev, currentTime: newTime }));
  }, [isDragging, playbackState.duration]);

  // Handle volume slider change
  const handleVolumeChange = useCallback((e) => {
    const volume = parseFloat(e.target.value);
    setVolume(volume);
  }, [setVolume]);

  // Format time for display
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = playbackState.duration > 0 
    ? (playbackState.currentTime / playbackState.duration) * 100 
    : 0;

  // Generate waveform visualization
  const renderWaveform = () => {
    if (!waveform.length) return null;

    return (
      <div className="media-player-waveform">
        {waveform.map((amplitude, index) => {
          const isPlayed = (index / waveform.length) * 100 <= progressPercentage;
          return (
            <div
              key={index}
              className={`waveform-bar ${isPlayed ? 'played' : ''}`}
              style={{ height: `${Math.max(amplitude * 100, 2)}%` }}
            />
          );
        })}
      </div>
    );
  };

  if (error) {
    return (
      <div className="media-player error">
        <span className="error-message">{error}</span>
      </div>
    );
  }

  return (
    <div className={`media-player ${compact ? 'compact' : ''}`}>
      <audio ref={audioRef} />
      
      {showControls && (
        <div className="media-controls">
          {!compact && (
            <button
              className="control-btn skip-btn"
              onClick={() => skip(-10)}
              title="Skip back 10s"
            >
              <FiSkipBack />
            </button>
          )}
          
          <button
            className="control-btn play-btn"
            onClick={togglePlayback}
            title={playbackState.isPlaying ? 'Pause' : 'Play'}
          >
            {playbackState.isPlaying ? <FiPause /> : <FiPlay />}
          </button>
          
          {!compact && (
            <button
              className="control-btn skip-btn"
              onClick={() => skip(10)}
              title="Skip forward 10s"
            >
              <FiSkipForward />
            </button>
          )}
        </div>
      )}
      
      <div className="media-progress-section">
        {!compact && (
          <span className="time-display current">
            {formatTime(playbackState.currentTime)}
          </span>
        )}
        
        <div className="progress-container">
          {waveform.length > 0 ? (
            renderWaveform()
          ) : (
            <div
              ref={progressBarRef}
              className="progress-bar"
              onClick={handleProgressClick}
              onMouseDown={() => setIsDragging(true)}
              onMouseMove={handleProgressDrag}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              <div 
                className="progress-buffered"
                style={{ width: `${playbackState.buffered}%` }}
              />
              <div 
                className="progress-played"
                style={{ width: `${progressPercentage}%` }}
              />
              <div 
                className="progress-thumb"
                style={{ left: `${progressPercentage}%` }}
              />
            </div>
          )}
        </div>
        
        {!compact && (
          <span className="time-display duration">
            {formatTime(playbackState.duration)}
          </span>
        )}
      </div>
      
      {showControls && !compact && (
        <div className="volume-controls">
          <button
            className="control-btn volume-btn"
            onClick={toggleMute}
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || playbackState.volume === 0 ? <FiVolumeX /> : <FiVolume2 />}
          </button>
          
          {showVolumeSlider && (
            <div 
              className="volume-slider-container"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <input
                ref={volumeSliderRef}
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={playbackState.volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
            </div>
          )}
        </div>
      )}
      
      {!compact && (
        <div className="playback-rate-controls">
          <select
            value={playbackState.playbackRate}
            onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
            className="playback-rate-select"
            title="Playback Speed"
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default MediaPlayer;