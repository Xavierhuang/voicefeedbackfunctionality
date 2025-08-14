/**
 * Audio Recording Utility for Spanish Pronunciation Analysis
 * 
 * This module provides functionality to record audio from the user's microphone
 * and convert it to the format needed for AI pronunciation analysis.
 */

export interface AudioRecorderConfig {
  sampleRate?: number;
  channels?: number;
  bitDepth?: number;
  maxDuration?: number; // in seconds
}

export interface RecordedAudio {
  audioData: string; // Base64 encoded
  duration: number; // in seconds
  format: string;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private config: Required<AudioRecorderConfig>;
  private startTime: number = 0;

  constructor(config: AudioRecorderConfig = {}) {
    this.config = {
      sampleRate: config.sampleRate || 48000,
      channels: config.channels || 1,
      bitDepth: config.bitDepth || 16,
      maxDuration: config.maxDuration || 10,
    };
  }

  /**
   * Initialize the audio recorder with microphone access
   */
  async initialize(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Use WAV format for better quality and compatibility
      const options: MediaRecorderOptions = {
        mimeType: this.getSupportedMimeType(),
      };

      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.setupEventListeners();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw new Error('Could not access microphone. Please check permissions.');
    }
  }

  /**
   * Get the best supported audio format
   */
  private getSupportedMimeType(): string {
    const mimeTypes = [
      'audio/wav',
      'audio/webm;codecs=opus',
      'audio/mp4',
      'audio/mpeg',
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }

    throw new Error('No supported audio format found');
  }

  /**
   * Setup event listeners for the media recorder
   */
  private setupEventListeners(): void {
    if (!this.mediaRecorder) return;

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      // Audio processing happens in getRecordedAudio()
    };

    this.mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event);
    };
  }

  /**
   * Start recording audio
   */
  async startRecording(): Promise<void> {
    if (!this.mediaRecorder) {
      throw new Error('Audio recorder not initialized');
    }

    if (this.mediaRecorder.state !== 'inactive') {
      throw new Error('Recording already in progress');
    }

    this.audioChunks = [];
    this.startTime = Date.now();
    this.mediaRecorder.start(100); // Collect data every 100ms
  }

  /**
   * Stop recording audio
   */
  stopRecording(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
      return;
    }

    this.mediaRecorder.stop();
  }

  /**
   * Get the recorded audio as base64 encoded data
   */
  async getRecordedAudio(): Promise<RecordedAudio> {
    if (this.audioChunks.length === 0) {
      throw new Error('No audio data recorded');
    }

    const mimeType = this.mediaRecorder?.mimeType || 'audio/wav';
    const audioBlob = new Blob(this.audioChunks, { type: mimeType });
    const duration = (Date.now() - this.startTime) / 1000;

    // Convert to base64
    const audioData = await this.blobToBase64(audioBlob);
    
    // Extract format from mime type
    const format = mimeType.split('/')[1].split(';')[0];

    return {
      audioData: audioData.split(',')[1], // Remove data:audio/wav;base64, prefix
      duration,
      format,
    };
  }

  /**
   * Convert blob to base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Check if recording is currently active
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  /**
   * Get current recording duration
   */
  getCurrentDuration(): number {
    if (!this.isRecording()) return 0;
    return (Date.now() - this.startTime) / 1000;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.mediaRecorder) {
      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.audioChunks = [];
    this.mediaRecorder = null;
  }

  /**
   * Check if audio recording is supported
   */
  static isSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder
    );
  }
}

/**
 * Simple utility function to create and use audio recorder
 */
export async function recordAudio(
  config: AudioRecorderConfig = {}
): Promise<{
  start: () => Promise<void>;
  stop: () => Promise<RecordedAudio>;
  isRecording: () => boolean;
  cleanup: () => void;
}> {
  const recorder = new AudioRecorder(config);
  await recorder.initialize();

  return {
    start: () => recorder.startRecording(),
    stop: () => recorder.getRecordedAudio(),
    isRecording: () => recorder.isRecording(),
    cleanup: () => recorder.cleanup(),
  };
}
