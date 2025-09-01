import ImagePicker, {
  ImageOrVideo,
  Options,
} from 'react-native-image-crop-picker';
import { Alert, Platform, NativeModules } from 'react-native';
import {
  requestCameraPermission,
  requestPhotoLibraryPermission,
} from './permissions';
import { PickedLivePhoto, PickedMedia } from '../navigation/types';

const { LivePhotoManager } = NativeModules;

// --- Helpers ---
export const isVideo = (mime?: string) =>
  typeof mime === 'string' && mime.startsWith('video/');

export const isLivePhoto = (
  media: PickedMedia | PickedLivePhoto,
): media is PickedLivePhoto =>
  !!(media as PickedLivePhoto).photo && !!(media as PickedLivePhoto).video;

export const getMediaType = (
  media: PickedMedia | PickedLivePhoto,
): 'livephoto' | 'video' | 'image' => {
  if (isLivePhoto(media)) return 'livephoto';
  if (isVideo((media as PickedMedia).mime)) return 'video';
  return 'image';
};

// --- Base picker options ---
const baseOptions: Options = {
  cropping: false,
  includeBase64: false,
  includeExif: true,
  compressImageQuality: 0.9,
  mediaType: 'any',
  forceJpg: false,
};

// --- Map ImagePicker result to PickedMedia ---
const mapToPicked = (media: ImageOrVideo): PickedMedia => ({
  path: media.path,
  localIdentifier: (media as any).localIdentifier,
  sourceURL: (media as any).sourceURL,
  width: media.width ?? 0,
  height: media.height ?? 0,
  mime: media.mime,
  size: media.size,
  filename: media.filename ?? undefined,
  exif: (media as any).exif ?? undefined,
  duration: (media as any).duration,
  data: (media as any).data,
  cropRect: (media as any).cropRect,
  creationDate: (media as any).creationDate,
  modificationDate: (media as any).modificationDate,
});

// --- Pickers ---
export const pickFromGallery = async (): Promise<PickedMedia | null> => {
  try {
    const media = await ImagePicker.openPicker({
      ...baseOptions,
      multiple: false,
    });
    return mapToPicked(media);
  } catch {
    return null;
  }
};

export const pickFromCamera = async (): Promise<PickedMedia | null> => {
  try {
    const media = await ImagePicker.openCamera(baseOptions);
    return mapToPicked(media);
  } catch {
    return null;
  }
};

export const recordVideo = async (): Promise<PickedMedia | null> => {
  try {
    const media = await ImagePicker.openCamera({
      ...baseOptions,
      mediaType: 'video',
    });
    return mapToPicked(media);
  } catch {
    return null;
  }
};

// --- Live Photo picker (iOS only) ---
export const pickLivePhoto = async (): Promise<PickedLivePhoto | null> => {
  if (Platform.OS !== 'ios') {
    Alert.alert('Not Supported', 'Live Photos are only supported on iOS.');
    return null;
  }

  if (!LivePhotoManager?.pickLivePhoto) {
    Alert.alert('Error', 'LivePhotoManager native module not available.');
    return null;
  }

  try {
    await LivePhotoManager.checkDeviceCompatibility();
  } catch {
    Alert.alert('Error', 'Device not compatible with Live Photos.');
    return null;
  }

  try {
    const result = await LivePhotoManager.pickLivePhoto();
    if (!result?.photo || !result?.video) {
      Alert.alert('Error', 'Failed to extract Live Photo components.');
      return null;
    }

    return {
      photo: String(result.photo),
      video: String(result.video),
      audio: result.audio ?? undefined,
      transcription: result.transcription ?? undefined,
      localIdentifier: result.localIdentifier ?? undefined,
      creationDate: result.creationDate ?? undefined,
      modificationDate: result.modificationDate ?? undefined,
      location: result.location ?? undefined,
      duration: result.duration ?? undefined,
      pixelWidth: result.pixelWidth ?? undefined,
      pixelHeight: result.pixelHeight ?? undefined,
    } as PickedLivePhoto;
  } catch (error: any) {
    console.error('Live Photo picker error:', error);
    if (error.code === 'PERMISSION_DENIED') {
      Alert.alert('Permission Required', 'Please grant photo library access.');
    } else if (error.code !== 'NO_SELECTION') {
      Alert.alert('Error', error.message || 'Failed to pick Live Photo.');
    }
    return null;
  }
};

// --- Main handler ---
export const handlePickMedia = async (
  type: 'camera' | 'gallery' | 'record' | 'livephoto',
): Promise<PickedMedia | PickedLivePhoto | null> => {
  try {
    if (type === 'gallery') {
      const perm = await requestPhotoLibraryPermission();
      if (!perm.granted) {
        Alert.alert(
          'Permission Required',
          'Please grant photo library access.',
        );
        return null;
      }
      return pickFromGallery();
    }

    if (type === 'camera') {
      const perm = await requestCameraPermission();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Please grant camera access.');
        return null;
      }
      return pickFromCamera();
    }

    if (type === 'record') {
      const perm = await requestCameraPermission();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Please grant camera access.');
        return null;
      }
      return recordVideo();
    }

    if (type === 'livephoto') {
      const perm = await requestPhotoLibraryPermission();
      if (!perm.granted) {
        Alert.alert(
          'Permission Required',
          'Please grant photo library access.',
        );
        return null;
      }
      return pickLivePhoto();
    }

    return null;
  } catch (err: any) {
    console.error('Error picking media:', err);
    Alert.alert('Error', 'Something went wrong while picking media.');
    return null;
  }
};
