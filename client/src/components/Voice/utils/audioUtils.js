/**
 * Audio utility functions for voice recording and playback
 */

/**
 * Convert audio blob to different formats
 */
export const convertAudioBlob = async (blob, targetMimeType) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    audio.onloadeddata = () => {
      try {
        // This is a simplified conversion - in production you'd use a proper audio conversion library
        const convertedBlob = new Blob([blob], { type: targetMimeType });
        resolve(convertedBlob);
      } catch (error) {
        reject(error);
      }
    };
    
    audio.onerror = reject;
    audio.src = URL.createObjectURL(blob);
  });
};

/**
 * Generate waveform data from audio buffer
 */
export const generateWaveformFromBuffer = (audioBuffer, samples = 100) => {
  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / samples);
  const waveform = [];
  
  for (let i = 0; i < samples; i++) {
    const start = i * blockSize;
    const end = start + blockSize;
    let sum = 0;
    
    for (let j = start; j < end; j++) {
      sum += Math.abs(channelData[j]);
    }
    
    waveform.push(sum / blockSize);
  }
  
  return waveform;
};

/**
 * Analyze audio blob and extract metadata
 */
export const analyzeAudioBlob = async (blob) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    
    audio.onloadedmetadata = () => {
      resolve({
        duration: audio.duration,
        size: blob.size,
        type: blob.type,
        bitrate: Math.round((blob.size * 8) / audio.duration),
        sampleRate: 44100 // Default, would need Web Audio API for actual detection
      });
    };
    
    audio.onerror = () => {
      reject(new Error('Failed to analyze audio blob'));
    };
    
    audio.src = URL.createObjectURL(blob);
  });
};

/**
 * Compress audio blob
 */
export const compressAudioBlob = async (blob, quality = 0.7) => {
  try {
    // This is a simplified compression - in production you'd use a proper audio compression library
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Reduce sample rate for compression (simplified approach)
    const compressedSampleRate = Math.floor(audioBuffer.sampleRate * quality);
    const compressedBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      Math.floor(audioBuffer.length * quality),
      compressedSampleRate
    );
    
    // Copy and downsample data
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const originalData = audioBuffer.getChannelData(channel);
      const compressedData = compressedBuffer.getChannelData(channel);
      
      for (let i = 0; i < compressedData.length; i++) {
        const originalIndex = Math.floor(i / quality);
        compressedData[i] = originalData[originalIndex] || 0;
      }
    }
    
    // Convert back to blob (simplified - would need proper encoding in production)
    return blob; // Return original for now
  } catch (error) {
    console.error('Audio compression failed:', error);
    return blob; // Return original on error
  }
};

/**
 * Create audio URL from blob with cleanup
 */
export const createAudioURL = (blob) => {
  const url = URL.createObjectURL(blob);
  
  // Return URL with cleanup function
  return {
    url,
    cleanup: () => URL.revokeObjectURL(url)
  };
};

/**
 * Download audio blob as file
 */
export const downloadAudioBlob = (blob, filename = 'voice-recording') => {
  const { url, cleanup } = createAudioURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${getFileExtensionFromMimeType(blob.type)}`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Cleanup after a short delay
  setTimeout(cleanup, 1000);
};

/**
 * Get file extension from MIME type
 */
export const getFileExtensionFromMimeType = (mimeType) => {
  const mimeToExt = {
    'audio/webm': 'webm',
    'audio/webm;codecs=opus': 'webm',
    'audio/mp4': 'm4a',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg'
  };
  
  return mimeToExt[mimeType] || 'webm';
};

/**
 * Check if audio format is supported
 */
export const isAudioFormatSupported = (mimeType) => {
  if (!window.MediaRecorder) return false;
  return MediaRecorder.isTypeSupported(mimeType);
};

/**
 * Get best supported audio format
 */
export const getBestSupportedAudioFormat = () => {
  const formats = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/mpeg',
    'audio/wav'
  ];
  
  for (const format of formats) {
    if (isAudioFormatSupported(format)) {
      return format;
    }
  }
  
  return null;
};

/**
 * Format duration in human-readable format
 */
export const formatDuration = (seconds, showHours = false) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (showHours || hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Calculate audio bitrate
 */
export const calculateBitrate = (fileSize, duration) => {
  if (!fileSize || !duration) return 0;
  return Math.round((fileSize * 8) / duration / 1000); // kbps
};

/**
 * Validate audio constraints
 */
export const validateAudioConstraints = (constraints) => {
  const defaultConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 44100,
    channelCount: 1
  };
  
  return { ...defaultConstraints, ...constraints };
};

/**
 * Check microphone permissions
 */
export const checkMicrophonePermission = async () => {
  try {
    if (!navigator.permissions) {
      // Fallback: try to access microphone directly
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return 'granted';
    }
    
    const permission = await navigator.permissions.query({ name: 'microphone' });
    return permission.state;
  } catch (error) {
    console.error('Error checking microphone permission:', error);
    return 'denied';
  }
};

/**
 * Request microphone permission
 */
export const requestMicrophonePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
};

/**
 * Get available audio input devices
 */
export const getAudioInputDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'audioinput');
  } catch (error) {
    console.error('Error getting audio input devices:', error);
    return [];
  }
};

/**
 * Create audio context with proper browser compatibility
 */
export const createAudioContext = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    throw new Error('AudioContext not supported');
  }
  return new AudioContext();
};

/**
 * Normalize waveform data
 */
export const normalizeWaveform = (waveform, targetLength = 100) => {
  if (!waveform || waveform.length === 0) return [];
  
  if (waveform.length === targetLength) return waveform;
  
  const normalized = [];
  const ratio = waveform.length / targetLength;
  
  for (let i = 0; i < targetLength; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.floor((i + 1) * ratio);
    
    let sum = 0;
    let count = 0;
    
    for (let j = start; j < end && j < waveform.length; j++) {
      sum += waveform[j];
      count++;
    }
    
    normalized.push(count > 0 ? sum / count : 0);
  }
  
  return normalized;
};