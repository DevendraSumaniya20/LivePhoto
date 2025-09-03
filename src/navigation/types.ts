// --- Result from Live Photo picker
export type PickResult = {
  photo: string;
  video: string;
  audioRaw?: string; // ✅ new
  audioCleaned?: string; // ✅ new
  transcription?: string; // ✅ optional
  localIdentifier?: string;
  creationDate?: string;
  modificationDate?: string;
  location?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  duration?: number;
  pixelWidth?: number;
  pixelHeight?: number;
};

// --- Device compatibility info
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

// --- Generic media type
export type PickedMedia = {
  path?: string;
  localIdentifier?: string;
  sourceURL?: string;
  width?: number;
  height?: number;
  mime?: string;
  size?: number;
  filename?: string;
  exif?: Record<string, unknown>;
  duration?: number;
  data?: string;
  cropRect?: { width: number; height: number; x: number; y: number };
  creationDate?: string;
  modificationDate?: string;
};

// --- Live Photo / Motion Photo type (extends media)
export type PickedLivePhoto = PickedMedia & {
  photo: string; // still image path
  video: string; // video component path
  photoMime?: string;
  videoMime?: string;
  audioRaw?: string; // ✅ new
  audioCleaned?: string; // ✅ new
  transcription?: string; // ✅ new
  location?: { latitude: number; longitude: number; altitude?: number } | null;
  duration?: number; // video duration in seconds
  pixelWidth?: number;
  pixelHeight?: number;
  filenamePhoto?: string;
  filenameVideo?: string;
};

// --- LivePhotoManager module interface
export interface LivePhotoResult {
  photo: string; // ✅ Swift returns "photo"
  video: string;
  audioRaw?: string; // ✅ new
  audioCleaned?: string; // ✅ new
  transcription?: string; // ✅ new
  localIdentifier: string;
  creationDate: number;
  modificationDate: number;
  location: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
    timestamp?: number;
  };
  duration?: number;
  pixelWidth: number;
  pixelHeight: number;
  photoMime?: string;
  videoMime?: string;
  filenamePhoto?: string;
  filenameVideo?: string;
}

export interface LivePhotoManagerInterface {
  pickLivePhoto(): Promise<LivePhotoResult>;
  pickLivePhotoWithTranscription(): Promise<LivePhotoResult>; // ✅ added
  checkDeviceCompatibility(): Promise<{
    isSupported: boolean;
    platform: string;
    version: string;
  }>;
  testMethod(): Promise<{ status: string; timestamp: number }>;
  showLivePhoto(localIdentifier: string): Promise<{ status: string }>;
  hideLivePhoto(): void;
}

// --- Navigation stack params
export type RootStackParamList = {
  Home: undefined;
  Video: {
    media?: PickedMedia;
    livePhotoResult?: LivePhotoResult;
  };
};

// --- Extend React Navigation types globally
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// --- Mapper functions
export const mapPickedLivePhotoToResult = (
  picked: PickedLivePhoto,
): LivePhotoResult => ({
  photo: picked.photo,
  video: picked.video,
  audioRaw: picked.audioRaw,
  audioCleaned: picked.audioCleaned,
  transcription: picked.transcription,
  localIdentifier: picked.localIdentifier || '',
  creationDate: picked.creationDate
    ? new Date(picked.creationDate).getTime()
    : Date.now(),
  modificationDate: picked.modificationDate
    ? new Date(picked.modificationDate).getTime()
    : Date.now(),
  location: {
    latitude: picked.location?.latitude,
    longitude: picked.location?.longitude,
    altitude: picked.location?.altitude ?? 0,
    timestamp: picked.creationDate
      ? new Date(picked.creationDate).getTime()
      : Date.now(),
  },
  duration: picked.duration || 0,
  pixelWidth: picked.pixelWidth || 0,
  pixelHeight: picked.pixelHeight || 0,
  photoMime: picked.photoMime,
  videoMime: picked.videoMime,
  filenamePhoto: picked.filenamePhoto,
  filenameVideo: picked.filenameVideo,
});

export const mapLivePhotoResultToPicked = (
  result: LivePhotoResult,
): PickedLivePhoto => ({
  photo: result.photo ?? '',
  video: result.video ?? '',
  audioRaw: result.audioRaw ?? '',
  audioCleaned: result.audioCleaned ?? '',
  transcription: result.transcription ?? '',
  localIdentifier: result.localIdentifier ?? '',
  creationDate: result.creationDate
    ? new Date(result.creationDate).toISOString()
    : new Date().toISOString(),
  modificationDate: result.modificationDate
    ? new Date(result.modificationDate).toISOString()
    : new Date().toISOString(),
  location: result.location
    ? {
        latitude: result.location.latitude ?? 0,
        longitude: result.location.longitude ?? 0,
        altitude: result.location.altitude ?? 0,
      }
    : undefined,
  duration: result.duration ?? 3.0,
  pixelWidth: result.pixelWidth ?? 0,
  pixelHeight: result.pixelHeight ?? 0,
  photoMime: result.photoMime ?? 'image/jpeg',
  videoMime: result.videoMime ?? 'video/quicktime',
  filenamePhoto: result.filenamePhoto ?? 'photo.jpg',
  filenameVideo: result.filenameVideo ?? 'video.mov',
});
