import ImagePicker, {
  ImageOrVideo,
  Options,
} from 'react-native-image-crop-picker';

/**
 * Media picked from gallery or camera
 */
export type PickedMedia = {
  path: string;
  localIdentifier?: string;
  sourceURL?: string;
  width: number;
  height: number;
  mime?: string;
  size?: number;
  filename?: string; // ✅ no null anymore
  exif?: Record<string, unknown>; // ✅ no null anymore
  duration?: number; // videos only
  data?: string;
  cropRect?: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  creationDate?: string;
  modificationDate?: string;
};
const baseOptions: Options = {
  cropping: false,
  includeBase64: false,
  includeExif: true,
  compressImageQuality: 0.9,
  mediaType: 'any', // ✅ allows both photo + video
  forceJpg: false,
};

// --- Type guard to detect video ---
export const isVideo = (mime?: string): boolean => {
  return typeof mime === 'string' && mime.startsWith('video/');
};

// --- Map raw picker result to our type ---
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

// --- Gallery picker ---
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

// --- Camera picker ---
export const pickFromCamera = async (): Promise<PickedMedia | null> => {
  try {
    const media = await ImagePicker.openCamera(baseOptions);
    return mapToPicked(media);
  } catch {
    return null;
  }
};
