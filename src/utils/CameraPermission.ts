import { Alert } from 'react-native';
import {
  requestCameraPermission,
  requestPhotoLibraryPermission,
} from './permissions';
import {
  pickFromCamera,
  pickFromGallery,
  recordVideo,
  PickedMedia,
} from './mediaPicker';

export const handlePickMedia = async (
  type: 'camera' | 'gallery' | 'record',
): Promise<PickedMedia | null> => {
  try {
    let picked: PickedMedia | null = null;

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
    }

    if (type === 'camera') {
      const perm = await requestCameraPermission();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Please grant camera access.');
        return null;
      }
      picked = await pickFromCamera();
    }

    if (type === 'record') {
      const perm = await requestCameraPermission();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Please grant camera access.');
        return null;
      }
      picked = await recordVideo();
    }

    return picked;
  } catch (err) {
    console.error('Error picking media:', err);
    Alert.alert('Error', 'Something went wrong while picking media.');
    return null;
  }
};
