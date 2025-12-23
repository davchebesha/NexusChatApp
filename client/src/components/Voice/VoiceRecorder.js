import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiMic, FiMicOff, FiPlay, FiPause, FiSquare, FiTrash2, FiSend } from 'react-icons/fi';
import './VoiceRecorder.css';

const VoiceRecorder = ({ onRecordingComplete, onCancel, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [waveform, setWaveform] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const animationRef = useRef(null);

  // Initialize audio context and analyzer for waveform visualization
  const initializeAudioContext = useCallback(async () => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    } catch (err) {
      console.error('Failed to initialize audio context:', err);
      setError('Audio context initialization failed');
    }
  }, []);

  // Generate waveform data from audio analysis
  const generateWaveform = useCallback(() => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Convert to normalized waveform data (0-1)
    const waveformData = Array.from(dataArray).map(value => value / 255);
    setWaveform(prev => [...prev.slice(-50), Math.max(...waveformData)]);
    
    if (isRecording && !isPaused) {
      animationRef.current = requestAnimationFrame(generateWaveform);
    }
  }, [isRecording, isPaused]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      
      // Initialize audio context if not already done
      if (!audioContextRef.current) {
        await initializeAudioContext();
      }
      
      // Connect stream to analyzer for waveform
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        setHasRecording(true);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      
      setIsRecording(true);
      setIsPaused(false);
      setWaveform([]);
      
      // Start duration timer
      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
      
      // Start waveform generation
      generateWaveform();
      
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  }, [initializeAudioContext, generateWaveform]);

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
        setDuration(pausedDuration + Math.floor((Date.now() - resumeTime) / 1000));
      }, 100);
      
      // Resume waveform generation
      generateWaveform();
    }
  }, [isRecording, isPaused, duration, generateWaveform]);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }
    
    setHasRecording(false);
    setAudioBlob(null);
    setDuration(0);
    setWaveform([]);
    setIsPlaying(false);
    setError(null);
    
    if (onCancel) {
      onCancel();
    }
  }, [isRecording, stopRecording, onCancel]);

  // Play recorded audio
  const playRecording = useCallback(() => {
    if (audioBlob && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioBlob]);

  // Pause playback
  const pausePlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Send recording
  const sendRecording = useCallback(() => {
    if (audioBlob && onRecordingComplete) {
      const recording = {
        id: `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        duration,
        audioBlob,
        waveform: [...waveform],
        timestamp: new Date()
      };
      
      onRecordingComplete(recording);
      
      // Reset state
      setHasRecording(false);
      setAudioBlob(null);
      setDuration(0);
      setWaveform([]);
      setIsPlaying(false);
    }
  }, [audioBlob, duration, waveform, onRecordingComplete]);

  // Format duration for display
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Handle audio playback events
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setIsPlaying(false);
      const handlePause = () => setIsPlaying(false);
      
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('pause', handlePause);
      
      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('pause', handlePause);
      };
    }
  }, [audioBlob]);

  return (
    <div className="voice-recorder">
      <audio ref={audioRef} />
      
      {error && (
        <div className="voice-recorder-error">
          <span>{error}</span>
        </div>
      )}
      
      {!hasRecording && !isRecording && (
        <div className="voice-recorder-start">
          <button
            className="voice-recorder-btn record-btn"
            onClick={startRecording}
            disabled={disabled}
            title="Start Recording"
          >
            <FiMic />
          </button>
          <span className="voice-recorder-hint">Hold to record</span>
        </div>
      )}
      
      {isRecording && (
        <div className="voice-recorder-recording">
          <div className="recording-controls">
            <button
              className="voice-recorder-btn stop-btn"
              onClick={stopRecording}
              title="Stop Recording"
            >
              <FiSquare />
            </button>
            
            <button
              className="voice-recorder-btn pause-btn"
              onClick={isPaused ? resumeRecording : pauseRecording}
              title={isPaused ? "Resume Recording" : "Pause Recording"}
            >
              {isPaused ? <FiPlay /> : <FiPause />}
            </button>
            
            <button
              className="voice-recorder-btn cancel-btn"
              onClick={cancelRecording}
              title="Cancel Recording"
            >
              <FiTrash2 />
            </button>
          </div>
          
          <div className="recording-info">
            <div className="recording-duration">
              {formatDuration(duration)}
            </div>
            <div className="recording-status">
              {isPaused ? 'Paused' : 'Recording...'}
            </div>
          </div>
          
          <div className="waveform-container">
            <div className="waveform">
              {waveform.map((amplitude, index) => (
                <div
                  key={index}
                  className="waveform-bar"
                  style={{ height: `${Math.max(amplitude * 100, 2)}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {hasRecording && !isRecording && (
        <div className="voice-recorder-playback">
          <div className="playback-controls">
            <button
              className="voice-recorder-btn play-btn"
              onClick={isPlaying ? pausePlayback : playRecording}
              title={isPlaying ? "Pause Playback" : "Play Recording"}
            >
              {isPlaying ? <FiPause /> : <FiPlay />}
            </button>
            
            <button
              className="voice-recorder-btn cancel-btn"
              onClick={cancelRecording}
              title="Delete Recording"
            >
              <FiTrash2 />
            </button>
            
            <button
              className="voice-recorder-btn send-btn"
              onClick={sendRecording}
              title="Send Recording"
            >
              <FiSend />
            </button>
          </div>
          
          <div className="playback-info">
            <div className="playback-duration">
              {formatDuration(duration)}
            </div>
          </div>
          
          <div className="waveform-container">
            <div className="waveform static">
              {waveform.map((amplitude, index) => (
                <div
                  key={index}
                  className="waveform-bar"
                  style={{ height: `${Math.max(amplitude * 100, 2)}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;