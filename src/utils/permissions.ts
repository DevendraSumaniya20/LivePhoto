import { Platform } from 'react-native';
import {
  check,
  request,
  RESULTS,
  PERMISSIONS,
  openSettings,
  PermissionStatus,
  type Permission,
} from 'react-native-permissions';

type PermissionCheckResult = {
  granted: boolean;
  status: PermissionStatus;
  openSettings?: () => Promise<void>;
};

const isGranted = (status: PermissionStatus): boolean =>
  status === RESULTS.GRANTED || status === RESULTS.LIMITED;

export const requestCameraPermission =
  async (): Promise<PermissionCheckResult> => {
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
      return { granted: true, status: current };
    }

    const next = await request(permission);
    return {
      granted: isGranted(next),
      status: next,
      openSettings: openSettings,
    };
  };

export const requestPhotoLibraryPermission =
  async (): Promise<PermissionCheckResult> => {
    let permission: Permission | undefined;
    if (Platform.OS === 'ios') {
      permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
    } else if (Platform.OS === 'android') {
      const androidVersion = Platform.Version as number; // number on Android
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
      return { granted: true, status: current };
    }

    const next = await request(permission);
    return {
      granted: isGranted(next),
      status: next,
      openSettings: openSettings,
    };
  };
