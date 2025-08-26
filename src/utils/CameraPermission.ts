import { Alert } from 'react-native';
import {
  requestCameraPermission,
  requestPhotoLibraryPermission,
} from './permissions';
import { pickFromCamera, pickFromGallery, PickedMedia } from './mediaPicker';

export const handlePickMedia = async (
  type: 'camera' | 'gallery',
  setMedia: (media: PickedMedia | null) => void,
  setExtractedAudio: (audio: any) => void,
): Promise<void> => {
  try {
    let picked: PickedMedia | null = null;

    if (type === 'gallery') {
      const perm = await requestPhotoLibraryPermission();
      if (!perm.granted) {
        return Alert.alert(
          'Permission Required',
          'Please grant photo library access.',
        );
      }
      picked = await pickFromGallery();
    }

    if (type === 'camera') {
      const perm = await requestCameraPermission();
      if (!perm.granted) {
        return Alert.alert(
          'Permission Required',
          'Please grant camera access.',
        );
      }
      picked = await pickFromCamera();
    }

    if (picked) {
      setMedia(picked);
      setExtractedAudio(null);
    }
  } catch (err) {
    console.error('Error picking media:', err);
    Alert.alert('Error', 'Something went wrong while picking media.');
  }
};
