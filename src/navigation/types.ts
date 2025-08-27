import { PickedMedia } from '../utils/mediaPicker';

interface LivePhotoResult {
  photo: string;
  audio: string;
  transcription: string;
  video: string;
}

export type RootStackParamList = {
  Home: undefined;
  Video: {
    media?: PickedMedia;
    livePhotoResult?: LivePhotoResult;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
