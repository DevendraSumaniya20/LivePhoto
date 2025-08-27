import React, { ReactElement, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
  Platform, // ✅ import Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import { NativeModules } from 'react-native';
import {
  useRoute,
  useNavigation,
  RouteProp,
  NavigationProp,
} from '@react-navigation/native';

import Colors from '../../constants/color';
import styles from './styles';
import Components from '../../components';
import { isVideo } from '../../utils/mediaPicker';
import { RootStackParamList } from '../../navigation/types';

// ✅ Use only the merged AudioModule
const { AudioModule } = NativeModules;

interface ExtractedAudio {
  path: string;
  size: number;
  duration: number;
  format: string;
  sampleRate: number;
}

interface LivePhotoResult {
  photo: string;
  audio: string;
  transcription: string;
  video: string;
}

type VideoScreenRouteProp = RouteProp<RootStackParamList, 'Video'>;
type VideoScreenNavigationProp = NavigationProp<RootStackParamList, 'Video'>;

const VideoScreen = (): ReactElement => {
  const route = useRoute<VideoScreenRouteProp>();
  const navigation = useNavigation<VideoScreenNavigationProp>();
  const { media, livePhotoResult } = route.params || {};

  const [extractedAudio, setExtractedAudio] = useState<ExtractedAudio | null>(
    null,
  );
  const [cleanedAudio, setCleanedAudio] = useState<ExtractedAudio | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isCleaning, setIsCleaning] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);

  const clearMedia = (): void => {
    navigation.goBack();
  };

  console.log('📂 Media path:', media?.path);

  const renderMediaPreview = () => {
    if (!media) return null;
    if (isVideo(media.mime)) {
      return (
        <Video
          source={{ uri: media.path }}
          style={styles.preview}
          controls
          paused
          renderLoader={() => (
            <Text style={styles.loadingText}>Loading...</Text>
          )}
          volume={muted ? 0.0 : 1.0}
          onError={err => {
            console.error('Video playback error:', err);
            Alert.alert('Error', 'Failed to load video');
          }}
          resizeMode="cover"
          repeat={false}
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

  // ✅ Extract Audio via AudioModule
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
      const result = await AudioModule.extractAudio(filePath);

      if (!result?.path) {
        return Alert.alert('Extraction Failed', 'No audio track found.');
      }

      // ✅ Different default format for iOS/Android
      // ✅ Use container formats
      const defaultFormat = Platform.OS === 'ios' ? 'm4a' : 'm4a';

      setExtractedAudio({
        ...result,
        format: result.format || defaultFormat,
        sampleRate: result.sampleRate || 44100,
      });

      setCleanedAudio(null); // reset cleaned audio
      Alert.alert('Success', 'Audio extracted and ready to play!');
    } catch (err: any) {
      console.error('Audio extraction error:', err);
      Alert.alert('Error', err?.message || 'Failed to extract audio');
    } finally {
      setIsExtracting(false);
    }
  };

  // ✅ Clean Audio via AudioModule (with platform-specific filename)
  const handleCleanAudio = async (): Promise<void> => {
    const inputPath = cleanedAudio?.path || extractedAudio?.path;
    if (!inputPath) {
      return Alert.alert('No Audio', 'Please extract audio first.');
    }

    setIsCleaning(true);
    try {
      const timestamp = Date.now();

      // ✅ Ensure correct extension per platform
      const extension = '.m4a';
      const outputPath = inputPath.replace(
        /\.\w+$/,
        `_cleaned_${timestamp}${extension}`,
      );

      const cleanedPath = await AudioModule.cleanAudio(inputPath, outputPath);

      setCleanedAudio({
        ...(cleanedAudio || extractedAudio)!,
        path: cleanedPath,
        format: extension.replace('.', ''),
      });

      Alert.alert('Success', 'Audio cleaned and saved!');
    } catch (err: any) {
      console.error('Audio cleaning error:', err);
      Alert.alert('Error', err?.message || 'Failed to clean audio');
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Media Details</Text>
            <Text style={styles.headerSubtitle}>
              {media ? 'Selected Media' : 'Live Photo Result'}
            </Text>
          </View>

          {/* Live Photo Result Display */}
          {!media && livePhotoResult && (
            <>
              <View style={styles.mediaDetailsContainer}>
                <Text style={styles.headerSubtitle}>Live Photo Output</Text>
                <Image
                  source={{ uri: `file://${livePhotoResult.photo}` }}
                  style={styles.preview}
                  resizeMode="cover"
                />
                {livePhotoResult.video ? (
                  <Video
                    source={{ uri: `file://${livePhotoResult.video}` }}
                    style={[styles.preview, { marginTop: 10 }]}
                    controls
                    paused
                    resizeMode="cover"
                  />
                ) : null}
                {livePhotoResult.transcription?.length ? (
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.headerSubtitle}>Transcription</Text>
                    <Text style={{ color: Colors.white }}>
                      {livePhotoResult.transcription}
                    </Text>
                  </View>
                ) : null}
              </View>
            </>
          )}

          {/* Regular Media Display */}
          {media && (
            <>
              <View style={styles.mediaDetailsContainer}>
                <Components.MediaDetails
                  media={media}
                  clearMedia={clearMedia}
                  renderMediaPreview={renderMediaPreview}
                />
              </View>

              {isVideo(media.mime) && (
                <TouchableOpacity
                  style={[
                    styles.extractButton,
                    isExtracting && styles.extractButtonDisabled,
                  ]}
                  onPress={handleExtractAudio}
                  disabled={isExtracting}
                  activeOpacity={0.8}
                >
                  <View style={styles.extractButtonContent}>
                    <Text style={styles.extractButtonIcon}>🎵</Text>
                    <Text style={styles.extractButtonText}>
                      {isExtracting ? 'Extracting...' : 'Extract Audio'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {extractedAudio && (
                <TouchableOpacity
                  style={[
                    styles.extractButton,
                    isCleaning && styles.extractButtonDisabled,
                  ]}
                  onPress={handleCleanAudio}
                  disabled={isCleaning}
                  activeOpacity={0.8}
                >
                  <View style={styles.extractButtonContent}>
                    <Text style={styles.extractButtonIcon}>
                      {cleanedAudio ? '🔄' : '✨'}
                    </Text>
                    <Text style={styles.extractButtonText}>
                      {isCleaning
                        ? cleanedAudio
                          ? 'Re-cleaning...'
                          : 'Cleaning...'
                        : cleanedAudio
                        ? 'Clean Again'
                        : 'Clean Audio'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {extractedAudio && (
                <View style={styles.audioPlayerContainer}>
                  <Text style={styles.audioTitle}>
                    🎵 Extracted Audio (Raw - {Platform.OS.toUpperCase()}):
                  </Text>
                  <Components.AudioExtractor extractedAudio={extractedAudio} />
                </View>
              )}

              {cleanedAudio && (
                <View style={styles.audioPlayerContainer}>
                  <Text style={styles.audioTitle}>
                    ✨ Cleaned Audio (Processed - {Platform.OS.toUpperCase()}):
                  </Text>
                  <Components.AudioExtractor extractedAudio={cleanedAudio} />
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default VideoScreen;
