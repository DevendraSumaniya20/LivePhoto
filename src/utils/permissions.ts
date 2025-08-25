import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  check,
  request,
  RESULTS,
  PERMISSIONS,
  openSettings,
  type Permission,
  type PermissionStatus,
} from 'react-native-permissions';

type PermissionCheckResult = {
  granted: boolean;
  status: PermissionStatus;
  openSettings?: () => Promise<void>;
};

const PERMISSION_KEYS = {
  CAMERA: 'CAMERA_PERMISSION_GRANTED',
  GALLERY: 'GALLERY_PERMISSION_GRANTED',
};

// Helper to save granted status
const savePermissionStatus = async (key: string, granted: boolean) => {
  await AsyncStorage.setItem(key, granted ? 'true' : 'false');
};

// Helper to get saved permission status
const getPermissionStatus = async (key: string) => {
  const value = await AsyncStorage.getItem(key);
  return value === 'true';
};

const isGranted = (status: PermissionStatus): boolean =>
  status === RESULTS.GRANTED || status === RESULTS.LIMITED;

export const requestCameraPermission =
  async (): Promise<PermissionCheckResult> => {
    const saved = await getPermissionStatus(PERMISSION_KEYS.CAMERA);
    if (saved) return { granted: true, status: RESULTS.GRANTED };

    const permission: Permission | undefined =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.CAMERA
        : undefined;

    if (!permission) {
      return { granted: true, status: RESULTS.GRANTED };
    }

    const current = await check(permission);
    if (isGranted(current)) {
      await savePermissionStatus(PERMISSION_KEYS.CAMERA, true);
      return { granted: true, status: current };
    }

    if (current === RESULTS.BLOCKED) {
      return { granted: false, status: current, openSettings };
    }

    const next = await request(permission);
    if (isGranted(next))
      await savePermissionStatus(PERMISSION_KEYS.CAMERA, true);

    return { granted: isGranted(next), status: next, openSettings };
  };

export const requestPhotoLibraryPermission =
  async (): Promise<PermissionCheckResult> => {
    const saved = await getPermissionStatus(PERMISSION_KEYS.GALLERY);
    if (saved) return { granted: true, status: RESULTS.GRANTED };

    let permission: Permission | undefined;
    if (Platform.OS === 'ios') {
      permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
    } else if (Platform.OS === 'android') {
      const androidVersion = Platform.Version as number;
      permission =
        androidVersion >= 33
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
    }

    if (!permission) {
      return { granted: true, status: RESULTS.GRANTED };
    }

    const current = await check(permission);
    if (isGranted(current)) {
      await savePermissionStatus(PERMISSION_KEYS.GALLERY, true);
      return { granted: true, status: current };
    }

    if (current === RESULTS.BLOCKED) {
      return { granted: false, status: current, openSettings };
    }

    const next = await request(permission);
    if (isGranted(next))
      await savePermissionStatus(PERMISSION_KEYS.GALLERY, true);

    return { granted: isGranted(next), status: next, openSettings };
  };
