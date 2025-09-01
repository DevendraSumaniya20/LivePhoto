import { NativeModules, Platform } from 'react-native';

const { LivePhotoManager } = NativeModules;

// Check device support
export async function checkLivePhotoCompatibility() {
  if (Platform.OS !== 'ios') {
    return {
      isSupported: false,
      message: 'Live Photos are only supported on iOS devices',
      deviceInfo: `Platform: ${Platform.OS}`,
    };
  }

  if (!LivePhotoManager?.checkDeviceCompatibility) {
    return {
      isSupported: false,
      message:
        'LivePhotoManager native module not available - check installation',
      deviceInfo: 'Native module missing',
    };
  }

  try {
    const result = await LivePhotoManager.checkDeviceCompatibility();
    console.log('Compatibility check result:', result);
    return {
      isSupported: !!result.isSupported,
      message: result.message || 'Unknown compatibility status',
      deviceInfo: result.deviceInfo ?? undefined,
      iosVersion: result.iosVersion ?? undefined,
      checks: result.checks ?? undefined,
    };
  } catch (err: any) {
    console.error('Compatibility check failed:', err);
    return {
      isSupported: false,
      message:
        'Failed to check device compatibility: ' +
        (err.message || 'Unknown error'),
      deviceInfo: 'Error during check',
    };
  }
}

// Pick a Live Photo
export async function pickLivePhoto() {
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
      photo: result.photo,
      video: result.video,
      audio: result.audio || '',
      transcription: result.transcription || '',
      localIdentifier: result.localIdentifier ?? '',
      creationDate: result.creationDate ?? 0,
    };
  } catch (err: any) {
    console.error('Pick Live Photo failed:', err);
    throw new Error(err?.message || 'Failed to pick Live Photo');
  }
}

// Convenience wrapper for navigation
export async function pickLivePhotoAndNavigate(
  navigation: any,
  screen: string,
) {
  const result = await pickLivePhoto();
  navigation.navigate(screen, {
    livePhotoResult: {
      photo: result.photo,
      video: result.video,
      audio: result.audio,
      transcription: result.transcription,
    },
  });
}
