// Live Photo result passed via navigation
export interface LivePhotoResult {
  photo: string;
  audio: string;
  transcription: string;
  video: string;
}

// Result from Live Photo picker
export type PickResult = {
  photo: string;
  video: string;
  audio?: string;
  transcription?: string;
  localIdentifier?: string;
  creationDate?: number;
};

// Device compatibility info
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

// Generic media type
export type PickedMedia = {
  path?: string;
  localIdentifier?: string;
  sourceURL?: string;
  width?: number;
  height?: number;
  mime?: string; // corrected typo from 'mine'
  size?: number;
  filename?: string;
  exif?: Record<string, unknown>;
  duration?: number;
  data?: string;
  cropRect?: { width: number; height: number; x: number; y: number };
  creationDate?: string;
  modificationDate?: string;
};

// Live Photo type extending PickedMedia
export type PickedLivePhoto = PickedMedia & {
  photo: string;
  video: string;
  audio?: string;
  transcription?: string;
};

// Navigation stack params
export type RootStackParamList = {
  Home: undefined;
  Video: {
    media?: PickedMedia;
    livePhotoResult?: LivePhotoResult;
  };
};

// Extend React Navigation types globally
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
