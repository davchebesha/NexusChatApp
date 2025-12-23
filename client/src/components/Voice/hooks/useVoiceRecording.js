import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for voice recording functionality
 * Provides recording state management and audio processing
 */
export const useVoiceRecording = (options = {}) => {
  const {
    onRecordingComplete,
    onError,
    maxDuration = 300, // 5 minutes default
    sampleRate = 44100,
    echoCancellation = true,
    noiseSuppression = true,
    autoGainControl = true
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [waveform, setWaveform] = useState([]);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const animationRef = useRef(null);
  const chunksRef = useRef([]);

  // Check browser support
  useEffect(() => {
    const checkSupport = () => {
      const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const hasMediaRecorder = !!window.MediaRecorder;
      const hasAudioContext = !!(window.AudioContext || window.webkitAudioContext);
      
      setIsSupported(hasMediaDevices && hasMediaRecorder && hasAudioContext);
      
      if (!hasMediaDevices) {
        setError('Media devices not supported');
      } else if (!hasMediaRecorder) {
        setError('MediaRecorder not supported');
      } else if (!hasAudioContext) {
        setError('AudioContext not supported');
      }
    };

    checkSupport();
  }, []);

  // Initialize audio context and analyzer
  const initializeAudioContext = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;
      }
      
      return true;
    } catch (err) {
      console.error('Failed to initialize audio context:', err);
      setError('Audio context initialization failed');
      if (onError) onError(err);
      return false;
    }
  }, [onError]);

  // Generate waveform data
  const generateWaveform = useCallback(() => {
    if (!analyserRef.current || !isRecording || isPaused) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average amplitude
    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    const normalizedAmplitude = average / 255;
    
    setWaveform(prev => {
      const newWaveform = [...prev, normalizedAmplitude];
      // Keep only last 100 data points for performance
      return newWaveform.slice(-100);
    });
    
    animationRef.current = requestAnimationFrame(generateWaveform);
  }, [isRecording, isPaused]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Voice recording not supported');
      return false;
    }

    try {
      setError(null);
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation,
          noiseSuppression,
          autoGainControl,
          sampleRate
        }
      });

      streamRef.current = stream;

      // Initialize audio context
      const audioContextInitialized = await initializeAudioContext();
      if (!audioContextInitialized) return false;

      // Connect stream to analyzer
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Check MediaRecorder support for different formats
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = '';
          }
        }
      }

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: mimeType || 'audio/webm' 
        });
        setAudioBlob(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Create recording object
        const recording = {
          id: `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          duration,
          audioBlob: blob,
          waveform: [...waveform],
          timestamp: new Date(),
          mimeType: mimeType || 'audio/webm'
        };

        if (onRecordingComplete) {
          onRecordingComplete(recording);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms

      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setWaveform([]);

      // Start duration timer
      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        const currentDuration = Math.floor((Date.now() - startTime) / 1000);
        setDuration(currentDuration);
        
        // Auto-stop at max duration
        if (currentDuration >= maxDuration) {
          stopRecording();
        }
      }, 100);

      // Start waveform generation
      generateWaveform();

      return true;
    } catch (err) {
      console.error('Failed to start recording:', err);
      const errorMessage = err.name === 'NotAllowedError' 
        ? 'Microphone permission denied'
        : 'Failed to access microphone';
      setError(errorMessage);
      if (onError) onError(err);
      return false;
    }
  }, [
    isSupported,
    echoCancellation,
    noiseSuppression,
    autoGainControl,
    sampleRate,
    initializeAudioContext,
    generateWaveform,
    maxDuration,
    duration,
    waveform,
    onRecordingComplete,
    onError
  ]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [isRecording]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [isRecording, isPaused]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      // Resume duration timer
      const pausedDuration = duration;
      const resumeTime = Date.now();
      intervalRef.current = setInterval(() => {
        const currentDuration = pausedDuration + Math.floor((Date.now() - resumeTime) / 1000);
        setDuration(currentDuration);
        
        if (currentDuration >= maxDuration) {
          stopRecording();
        }
      }, 100);

      // Resume waveform generation
      generateWaveform();
    }
  }, [isRecording, isPaused, duration, maxDuration, generateWaveform, stopRecording]);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    if (isRecording) {
      // Stop recording without saving
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }

    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setAudioBlob(null);
    setWaveform([]);
    setError(null);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    // State
    isRecording,
    isPaused,
    duration,
    audioBlob,
    waveform,
    error,
    isSupported,
    
    // Actions
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    
    // Computed
    canRecord: isSupported && !isRecording,
    canPause: isRecording && !isPaused,
    canResume: isRecording && isPaused,
    canStop: isRecording,
    remainingTime: Math.max(0, maxDuration - duration)
  };
};