import { NativeModules } from 'react-native';

type PickResult = {
  photo: string;
  audio: string;
  transcription: string;
  video: string;
};

type Compatibility = {
  isSupported: boolean;
  message: string;
  deviceInfo?: string;
};

const { LivePhotoManager } = NativeModules as any;

/**
 * Check if the current device supports Live Photo processing
 */
export async function checkLivePhotoCompatibility(): Promise<Compatibility> {
  if (!LivePhotoManager?.checkDeviceCompatibility) {
    return { isSupported: false, message: 'LivePhotoManager not available' };
  }
  return LivePhotoManager.checkDeviceCompatibility();
}

/**
 * Pick a Live Photo and process it
 */
export async function pickLivePhotoAndProcess(): Promise<PickResult> {
  if (!LivePhotoManager?.pickLivePhoto) {
    throw new Error('LivePhotoManager not available');
  }
  return LivePhotoManager.pickLivePhoto();
}

export type { PickResult, Compatibility };
