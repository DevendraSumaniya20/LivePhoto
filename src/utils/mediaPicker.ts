import ImagePicker, {
  ImageOrVideo,
  Options,
} from 'react-native-image-crop-picker';

export type PickedMedia = {
  path: string;
  width: number;
  height: number;
  mime?: string;
  size?: number;
  filename?: string | null;
  exif?: Record<string, unknown> | null;
};

const baseOptions: Options = {
  cropping: false,
  includeBase64: false,
  includeExif: true,
  compressImageQuality: 0.9,
  mediaType: 'photo',
  forceJpg: false,
};

const mapToPicked = (media: ImageOrVideo): PickedMedia => ({
  path: media.path,
  width: media.width ?? 0,
  height: media.height ?? 0,
  mime: media.mime,
  size: media.size,
  filename: media.filename ?? null,
  exif: (media as any).exif ?? null,
});

export const pickFromGallery = async (): Promise<PickedMedia | null> => {
  try {
    const media = await ImagePicker.openPicker({
      ...baseOptions,
      multiple: false,
    });
    return mapToPicked(media);
  } catch (e) {
    return null;
  }
};

export const pickFromCamera = async (): Promise<PickedMedia | null> => {
  try {
    const media = await ImagePicker.openCamera({
      ...baseOptions,
    });
    return mapToPicked(media);
  } catch (e) {
    return null;
  }
};
