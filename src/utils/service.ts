import { NativeModules, Platform } from 'react-native';

const { LivePhotoManager } = NativeModules as any;

export type PickResult = {
  photo: string; // Path to the still image
  video: string; // Path to the video portion
  audio?: string; // Path to extracted audio
  transcription?: string; // Transcribed text from audio
  localIdentifier?: string; // PHAsset identifier (optional)
  creationDate?: number; // Unix timestamp (optional)
};

export type Compatibility = {
  isSupported: boolean;
  message: string;
  deviceInfo?: string;
  iosVersion?: string;
  checks?: {
    iosVersionSupported: boolean;
    photosFrameworkAvailable: boolean;
    phPickerAvailable: boolean;
    deviceTypeSupported: boolean;
  };
};

// Check device support
export async function checkLivePhotoCompatibility(): Promise<Compatibility> {
  if (Platform.OS !== 'ios') {
    return {
      isSupported: false,
      message: '❌ Live Photos are only supported on iOS devices',
      deviceInfo: `Platform: ${Platform.OS}`,
    };
  }

  if (!LivePhotoManager?.checkDeviceCompatibility) {
    return {
      isSupported: false,
      message:
        '❌ LivePhotoManager native module not available - check installation',
      deviceInfo: 'Native module missing',
    };
  }

  try {
    const result = await LivePhotoManager.checkDeviceCompatibility();

    console.log('🔍 Compatibility check result:', result);

    return {
      isSupported: !!result.isSupported,
      message: String(result.message || 'Unknown compatibility status'),
      deviceInfo: result.deviceInfo ?? undefined,
      iosVersion: result.iosVersion ?? undefined,
      checks: result.checks ?? undefined,
    };
  } catch (err: any) {
    console.error('❌ Compatibility check failed:', err);
    return {
      isSupported: false,
      message:
        '❌ Failed to check device compatibility: ' +
        (err.message || 'Unknown error'),
      deviceInfo: 'Error during check',
    };
  }
}

// Pick a Live Photo
export async function pickLivePhoto(): Promise<PickResult> {
  if (Platform.OS !== 'ios') {
    throw new Error('Live Photos are only supported on iOS');
  }

  if (!LivePhotoManager?.pickLivePhoto) {
    throw new Error('LivePhotoManager native module not available');
  }

  try {
    const result = await LivePhotoManager.pickLivePhoto();

    if (!result?.photo || !result?.video) {
      throw new Error('Live Photo data not returned from native module');
    }

    return {
      photo: String(result.photo),
      video: String(result.video),
      audio: result.audio ? String(result.audio) : undefined,
      transcription: result.transcription
        ? String(result.transcription)
        : undefined,
      localIdentifier: result.localIdentifier ?? undefined,
      creationDate: result.creationDate ?? undefined,
    };
  } catch (err: any) {
    console.error('Pick Live Photo failed:', err);
    throw new Error(err?.message || 'Failed to pick Live Photo');
  }
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
    audio: result.audio || '',
    transcription: result.transcription || '',
    localIdentifier: result.localIdentifier,
    creationDate: result.creationDate,
  };
}
