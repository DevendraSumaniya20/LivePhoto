import React, { ReactElement, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import { NativeModules } from 'react-native';

import Colors from '../../constants/color';
import styles from './styles';
import Components from '../../components';
import {
  pickFromCamera,
  pickFromGallery,
  PickedMedia,
  isVideo,
} from '../../utils/mediaPicker';
import {
  requestCameraPermission,
  requestPhotoLibraryPermission,
} from '../../utils/permissions';
import { handlePickMedia } from '../../utils/CameraPermission';

const { AudioExtractor } = NativeModules;

interface ExtractedAudio {
  path: string;
  size: number;
  duration: number;
  format: string;
  sampleRate: number;
}

const Home = (): ReactElement => {
  const [media, setMedia] = useState<PickedMedia | null>(null);
  const [extractedAudio, setExtractedAudio] = useState<ExtractedAudio | null>(
    null,
  );
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  const clearMedia = (): void => {
    setMedia(null);
    setExtractedAudio(null);
  };

  const handleExtractAudio = async (): Promise<void> => {
    if (!media || !isVideo(media.mime)) {
      return Alert.alert(
        'Invalid Media',
        'Please select a video to extract audio.',
      );
    }

    setIsExtracting(true);
    try {
      const filePath = media.path.replace('file://', '');
      const result = await AudioExtractor.extractAudio(filePath);

      if (!result?.path) {
        return Alert.alert('Extraction Failed', 'No audio track found.');
      }

      setExtractedAudio({
        ...result,
        format: result.format || 'm4a',
        sampleRate: result.sampleRate || 44100,
      });

      Alert.alert('Success', 'Audio extracted and ready to play!');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to extract audio');
    } finally {
      setIsExtracting(false);
    }
  };

  const renderMediaPreview = () => {
    if (!media) return null;
    if (isVideo(media.mime)) {
      return (
        <Video
          source={{ uri: media.path }}
          style={styles.preview}
          controls
          paused
        />
      );
    }
    return (
      <Image
        source={{ uri: media.path }}
        style={styles.preview}
        resizeMode="cover"
      />
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>LivePhoto</Text>
            <Text style={styles.headerSubtitle}>
              Capture moments, explore details
            </Text>
          </View>

          <View style={styles.actionContainer}>
            <Components.ActionButton
              icon="📷"
              title="Gallery"
              subtitle="Choose from photos & videos"
              onPress={() =>
                handlePickMedia('gallery', setMedia, setExtractedAudio)
              }
            />
            <Components.ActionButton
              icon="📸"
              title="Camera"
              subtitle="Take a new photo/video"
              onPress={() =>
                handlePickMedia('camera', setMedia, setExtractedAudio)
              }
            />
          </View>

          {media && isVideo(media.mime) && (
            <TouchableOpacity
              style={styles.extractButton}
              onPress={handleExtractAudio}
              disabled={isExtracting}
            >
              <Text style={styles.extractButtonText}>
                {isExtracting ? '⏳ Extracting Audio...' : '🎵 Extract Audio'}
              </Text>
            </TouchableOpacity>
          )}

          {extractedAudio && (
            <Components.AudioExtractor extractedAudio={extractedAudio} />
          )}

          <Components.MediaDetails
            media={media}
            clearMedia={clearMedia}
            renderMediaPreview={renderMediaPreview}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default Home;
