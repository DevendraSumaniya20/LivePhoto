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

export type PickedLivePhoto = PickedMedia & {
  photo: string; // the still image
  video: string; // the video component
  audio?: string; // optional extracted audio
  transcription?: string; // optional transcription
  location?: {
    // optional location info
    latitude: number;
    longitude: number;
  };
  duration?: number; // optional duration of the live photo
  pixelWidth?: number; // optional width of the video
  pixelHeight?: number; // optional height of the video
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
