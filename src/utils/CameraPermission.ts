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

export const isVideo = (mime?: string) =>
  typeof mime === 'string' && mime.startsWith('video/');
export const isLivePhoto = (
  media: PickedMedia | PickedLivePhoto,
): media is PickedLivePhoto =>
  !!(media as PickedLivePhoto).photo && !!(media as PickedLivePhoto).video;

const baseOptions: Options = {
  cropping: false,
  includeBase64: false,
  includeExif: true,
  compressImageQuality: 0.9,
  mediaType: 'any',
  forceJpg: false,
};

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

// Gallery / Camera / Record
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

// Main handler
export const handlePickMedia = async (
  type: 'camera' | 'gallery' | 'record' | 'livephoto',
  navigation?: any,
): Promise<PickedMedia | PickedLivePhoto | null> => {
  try {
    let picked: PickedMedia | PickedLivePhoto | null = null;

    if (type === 'gallery') {
      const perm = await requestPhotoLibraryPermission();
      if (!perm.granted) {
        Alert.alert(
          'Permission Required',
          'Please grant photo library access.',
        );
        return null;
      }
      picked = await pickFromGallery();
    } else if (type === 'camera') {
      const perm = await requestCameraPermission();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Please grant camera access.');
        return null;
      }
      picked = await pickFromCamera();
    } else if (type === 'record') {
      const perm = await requestCameraPermission();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Please grant camera access.');
        return null;
      }
      picked = await recordVideo();
    } else if (type === 'livephoto') {
      if (Platform.OS !== 'ios') {
        Alert.alert('Not Supported', 'Live Photos are only supported on iOS.');
        return null;
      }

      const perm = await requestPhotoLibraryPermission();
      if (!perm.granted) {
        Alert.alert(
          'Permission Required',
          'Please grant photo library access.',
        );
        return null;
      }

      if (!LivePhotoManager?.pickLivePhoto) {
        Alert.alert('Error', 'LivePhotoManager native module not available.');
        return null;
      }

      const result = await LivePhotoManager.pickLivePhoto();
      if (!result?.photo || !result?.video) {
        Alert.alert('Error', 'Failed to get Live Photo data.');
        return null;
      }

      picked = {
        photo: String(result.photo),
        video: String(result.video),
        audio: result.audio ?? undefined,
        transcription: result.transcription ?? undefined,
        localIdentifier: result.localIdentifier ?? undefined,
        creationDate: result.creationDate ?? undefined,
      } as PickedLivePhoto;

      if (navigation) {
        navigation.navigate('Video', { livePhotoResult: picked });
      }
    }

    return picked;
  } catch (err: any) {
    console.error('Error picking media:', err);
    Alert.alert('Error', 'Something went wrong while picking media.');
    return null;
  }
};
