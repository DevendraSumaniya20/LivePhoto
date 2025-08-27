import { NativeModules, Platform } from 'react-native';

const { LivePhotoManager } = NativeModules as any;

export type PickResult = {
  photo: string; // Path or base64 for the still image
  video: string; // Path or base64 for the video portion
  localIdentifier?: string; // PHAsset identifier (optional)
  creationDate?: number; // Unix timestamp (optional)
};

export type Compatibility = {
  isSupported: boolean;
  message: string;
};

// Check device support
export async function checkLivePhotoCompatibility(): Promise<Compatibility> {
  if (!LivePhotoManager?.checkDeviceCompatibility) {
    return { isSupported: false, message: 'LivePhotoManager not available' };
  }
  return await LivePhotoManager.checkDeviceCompatibility();
}

// Pick a Live Photo
export async function pickLivePhoto(): Promise<PickResult> {
  if (!LivePhotoManager?.pickLivePhoto) {
    throw new Error('LivePhotoManager not available');
  }
  return await LivePhotoManager.pickLivePhoto();
}

// Convenience wrapper expected by Home screen
export type LivePhotoProcessResult = {
  photo: string;
  video: string;
  audio?: string;
  transcription?: string;
  localIdentifier?: string;
  creationDate?: number;
};

export async function pickLivePhotoAndProcess(): Promise<LivePhotoProcessResult> {
  const result = await pickLivePhoto();

  return {
    photo: result.photo,
    video: result.video,
    localIdentifier: result.localIdentifier,
    creationDate: result.creationDate,
    // placeholders for future processing
    audio: '',
    transcription: '',
  };
}
