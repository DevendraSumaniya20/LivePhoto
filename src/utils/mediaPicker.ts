import { Alert, NativeModules, Platform } from 'react-native';
import ImagePicker, {
  ImageOrVideo,
  Options,
} from 'react-native-image-crop-picker';
import {
  PickedMedia,
  PickedLivePhoto,
  LivePhotoResult,
  mapLivePhotoResultToPicked,
} from '../navigation/types';
import {
  requestCameraPermission,
  requestPhotoLibraryPermission,
} from './permissions';

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

// --- Standard pickers ---
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

export const pickLivePhoto = async (): Promise<PickedLivePhoto | null> => {
  if (Platform.OS !== 'ios') {
    Alert.alert('Not Supported', 'Live Photos are only available on iOS.');
    return null;
  }

  try {
    const result: LivePhotoResult = await LivePhotoManager.pickLivePhoto();

    if (!result || !result.photo || !result.video) {
      Alert.alert('Error', 'No Live Photo selected or incomplete.');
      return null;
    }

    const pickedLivePhoto: PickedLivePhoto = mapLivePhotoResultToPicked(result);
    return pickedLivePhoto;
  } catch (err: any) {
    console.error('pickLivePhoto error:', err);
    Alert.alert('Error', err?.message || 'Failed to pick Live Photo.');
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
