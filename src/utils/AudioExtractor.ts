import { NativeModules, Platform } from 'react-native';

/**
 * Processed audio result returned by native module
 */
export interface ProcessedAudio {
  path: string; // absolute path
  size: number; // bytes
  duration: number; // seconds
  format: string; // e.g., "m4a"
  sampleRate: number; // Hz
  processed: boolean; // whether enhanced/cleaned
}

// Native module type
interface AudioModuleType {
  extractCleanAudio(videoPath: string): Promise<ProcessedAudio>;
  transcribeAudio(audioPath: string): Promise<string | null>;
}

const { AudioModule } = NativeModules as { AudioModule: AudioModuleType };

// --- Custom error for better debugging ---
export class AudioExtractionError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AudioExtractionError';
    this.code = code;
  }
}

/**
 * Extracts and cleans audio from a video file
 */
export async function extractCleanAudioFromVideo(
  videoPath: string,
): Promise<ProcessedAudio> {
  if (!videoPath || typeof videoPath !== 'string') {
    throw new AudioExtractionError('Invalid video path', 'INVALID_PATH');
  }

  if (!AudioModule || typeof AudioModule.extractCleanAudio !== 'function') {
    const platformError =
      Platform.OS === 'ios'
        ? 'AudioModule native module not found. Run "cd ios && pod install".'
        : 'AudioModule native module not found. Rebuild the Android app.';
    throw new AudioExtractionError(platformError, 'MODULE_NOT_FOUND');
  }

  try {
    console.log('🎵 Starting audio extraction & cleaning:', videoPath);
    const result = await AudioModule.extractCleanAudio(videoPath);

    if (!result || !result.path) {
      throw new AudioExtractionError(
        'Invalid response from native module',
        'INVALID_RESPONSE',
      );
    }

    console.log('✅ Audio processed successfully:', result);
    return result;
  } catch (err: any) {
    console.error('❌ Audio processing failed:', err);

    const code = err?.code || 'UNKNOWN_ERROR';
    const message =
      err?.message || 'Unknown error occurred during audio processing';

    throw new AudioExtractionError(message, code);
  }
}

/**
 * Transcribe audio using native module
 */
export async function transcribeAudio(
  audioPath: string,
): Promise<string | null> {
  if (!audioPath || typeof audioPath !== 'string') return null;
  if (!AudioModule || typeof AudioModule.transcribeAudio !== 'function')
    return null;

  try {
    const transcription = await AudioModule.transcribeAudio(audioPath);
    return transcription || null;
  } catch (err) {
    console.error('❌ Transcription failed:', err);
    return null;
  }
}

/**
 * Checks if audio extraction is supported
 */
export function isAudioExtractionSupported(): boolean {
  return !!AudioModule && typeof AudioModule.extractCleanAudio === 'function';
}
