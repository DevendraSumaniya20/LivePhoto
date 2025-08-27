import React, { ReactElement, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
  Platform,
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
import Icons from '../../constants/svgPath';
import { moderateScale } from '../../constants/responsive';

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

  const clearMedia = (): void => {
    navigation.goBack();
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
          resizeMode="contain"
          repeat={false}
          volume={1.0}
          onError={err => {
            console.error('Video playback error:', err);
            Alert.alert('Error', 'Failed to load video');
          }}
        />
      );
    }

    return (
      <Image
        source={{ uri: media.path }}
        style={styles.preview}
        resizeMode="contain"
      />
    );
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
      const result = await AudioModule.extractAudio(filePath);

      if (!result?.path) {
        return Alert.alert('Extraction Failed', 'No audio track found.');
      }

      const defaultFormat = Platform.OS === 'ios' ? 'm4a' : 'm4a';

      setExtractedAudio({
        ...result,
        format: result.format || defaultFormat,
        sampleRate: result.sampleRate || 44100,
      });

      setCleanedAudio(null);
      Alert.alert('Success', 'Audio extracted and ready to play!');
    } catch (err: any) {
      console.error('Audio extraction error:', err);
      Alert.alert('Error', err?.message || 'Failed to extract audio');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCleanAudio = async (): Promise<void> => {
    const inputPath = cleanedAudio?.path || extractedAudio?.path;
    if (!inputPath) {
      return Alert.alert('No Audio', 'Please extract audio first.');
    }

    setIsCleaning(true);
    try {
      const timestamp = Date.now();
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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icons.LeftArrow
                height={moderateScale(30)}
                width={moderateScale(30)}
                stroke={Colors.white}
                fill={Colors.white}
              />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.headerTitle}>Media Details</Text>
              <Text style={styles.headerSubtitle}>
                {media ? 'Selected Media' : 'Live Photo Result'}
              </Text>
            </View>
            <View style={{ width: moderateScale(30) }} />
          </View>

          {/* Live Photo Result */}
          {!media && livePhotoResult && (
            <View style={styles.livePhotoContainer}>
              <Text style={styles.livePhotoLabel}>Live Photo Output</Text>
              <Image
                source={{ uri: `file://${livePhotoResult.photo}` }}
                style={styles.livePhotoImage}
                resizeMode="cover"
              />
              {livePhotoResult.video && (
                <Video
                  source={{ uri: `file://${livePhotoResult.video}` }}
                  style={styles.livePhotoVideo}
                  controls
                  paused
                  resizeMode="cover"
                />
              )}
              {livePhotoResult.transcription?.length > 0 && (
                <View style={styles.transcriptionContainer}>
                  <Text style={styles.livePhotoText}>
                    {livePhotoResult.transcription}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Regular Media */}
          {media && (
            <View style={styles.mediaDetailsContainer}>
              {/* Media Preview */}
              <Components.MediaDetails
                media={media}
                clearMedia={clearMedia}
                renderMediaPreview={renderMediaPreview}
              />

              {/* Extract Audio Button */}
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
                    <Text style={styles.extractButtonText}>
                      {isExtracting ? 'Extracting...' : '🎵 Extract Audio'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Clean Audio Button */}
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
                    <Text style={styles.extractButtonText}>
                      {isCleaning
                        ? cleanedAudio
                          ? 'Re-cleaning...'
                          : 'Cleaning...'
                        : cleanedAudio
                        ? '🔄 Clean Again'
                        : '✨ Clean Audio'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Audio Players */}
              {extractedAudio && (
                <View style={styles.audioPlayerContainer}>
                  <Text style={styles.audioTitle}>
                    🎵 Extracted Audio ({Platform.OS.toUpperCase()})
                  </Text>
                  <Components.AudioExtractor extractedAudio={extractedAudio} />
                </View>
              )}

              {cleanedAudio && (
                <View style={styles.audioPlayerContainer}>
                  <Text style={styles.audioTitle}>
                    ✨ Cleaned Audio ({Platform.OS.toUpperCase()})
                  </Text>
                  <Components.AudioExtractor extractedAudio={cleanedAudio} />
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default VideoScreen;
