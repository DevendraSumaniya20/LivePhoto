import { NativeModules, Platform } from 'react-native';

/**
 * Extracted audio result returned by native module
 */
export interface ExtractedAudio {
  path: string; // absolute path to the audio file
  size: number; // file size in bytes
  duration: number; // duration in seconds
}

// Native module type
interface AudioExtractorModule {
  extractAudio(videoPath: string): Promise<ExtractedAudio>;
}

const { AudioExtractor } = NativeModules as {
  AudioExtractor: AudioExtractorModule;
};

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
 * Extracts audio from a video file and saves it as M4A format
 * @param videoPath - The absolute path to the video file
 * @returns Promise<ExtractedAudio> - The extracted audio info
 * @throws AudioExtractionError - If extraction fails
 */
export async function extractAudioFromVideo(
  videoPath: string,
): Promise<ExtractedAudio> {
  // Input validation
  if (!videoPath || typeof videoPath !== 'string') {
    throw new AudioExtractionError(
      'Invalid video path provided',
      'INVALID_PATH',
    );
  }

  // Check if the native module is available
  if (!AudioExtractor) {
    const platformError =
      Platform.OS === 'ios'
        ? 'AudioExtractor native module not found. Run "cd ios && pod install".'
        : 'AudioExtractor native module not found. Rebuild the Android app.';
    throw new AudioExtractionError(platformError, 'MODULE_NOT_FOUND');
  }

  try {
    console.log('🎵 Starting audio extraction from:', videoPath);

    const result = await AudioExtractor.extractAudio(videoPath);

    if (
      !result ||
      typeof result.path !== 'string' ||
      typeof result.size !== 'number' ||
      typeof result.duration !== 'number'
    ) {
      throw new AudioExtractionError(
        'Invalid response from native module',
        'INVALID_RESPONSE',
      );
    }

    console.log('✅ Audio extracted successfully:', result);
    return result;
  } catch (err: any) {
    console.error('❌ Audio extraction failed:', err);

    if (err?.code) {
      switch (err.code) {
        case 'no_audio':
          throw new AudioExtractionError(
            'No audio track found in the video file',
            'NO_AUDIO_TRACK',
          );
        case 'export_failed':
          throw new AudioExtractionError(
            'Failed to export audio from video',
            'EXPORT_FAILED',
          );
        case 'extract_error':
          throw new AudioExtractionError(
            'Error occurred during audio extraction',
            'EXTRACTION_ERROR',
          );
        default:
          throw new AudioExtractionError(
            `Audio extraction failed: ${err.message}`,
            err.code,
          );
      }
    }

    if (err instanceof Error) {
      throw new AudioExtractionError(
        `Audio extraction failed: ${err.message}`,
        'UNKNOWN_ERROR',
      );
    }

    throw new AudioExtractionError(
      'Unknown error occurred during audio extraction',
      'UNKNOWN_ERROR',
    );
  }
}

/**
 * Checks if the AudioExtractor native module is available
 */
export function isAudioExtractionSupported(): boolean {
  return !!AudioExtractor && typeof AudioExtractor.extractAudio === 'function';
}

/**
 * Gets information about the audio extraction capability
 */
export function getAudioExtractionInfo() {
  return {
    platform: Platform.OS,
    supported: isAudioExtractionSupported(),
    moduleAvailable: !!AudioExtractor,
  };
}
