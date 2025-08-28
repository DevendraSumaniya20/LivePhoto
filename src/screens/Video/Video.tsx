import React, { ReactElement, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
  Platform,
  Dimensions,
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
import { isVideo, PickedLivePhoto } from '../../utils/mediaPicker';
import { RootStackParamList } from '../../navigation/types';
import Icons from '../../constants/svgPath';
import { moderateScale } from '../../constants/responsive';

const { AudioModule } = NativeModules;
const { width: screenWidth } = Dimensions.get('window');

interface ExtractedAudio {
  path: string;
  size: number;
  duration: number;
  format: string;
  sampleRate: number;
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
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [showControls, setShowControls] = useState<boolean>(true);

  useEffect(() => {
    // Auto-hide controls after 3 seconds when playing Live Photo
    if (isPlaying && livePhotoResult) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, livePhotoResult]);

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  /**
   * Render the Live Photo details including video, image, audio, and transcription.
   */
  const renderLivePhotoContent = () => {
    if (!livePhotoResult) return null;

    const livePhoto = livePhotoResult as PickedLivePhoto;
    const aspectRatio =
      livePhoto.pixelWidth && livePhoto.pixelHeight
        ? livePhoto.pixelWidth / livePhoto.pixelHeight
        : 4 / 3;
    const imageHeight = (screenWidth - 40) / aspectRatio;

    return (
      <View style={styles.livePhotoContainer}>
        {/* Header */}
        <View style={styles.livePhotoHeader}>
          <Text style={styles.livePhotoTitle}>📸 Live Photo</Text>
          <Text style={styles.livePhotoSubtitle}>
            {formatDate(livePhoto.creationDate)}
          </Text>
          {livePhoto.location && (
            <Text style={styles.locationText}>
              📍 {livePhoto.location.latitude.toFixed(4)},{' '}
              {livePhoto.location.longitude.toFixed(4)}
            </Text>
          )}
        </View>

        {/* Live Photo Player */}
        <View style={styles.livePhotoSection}>
          <TouchableOpacity
            style={styles.livePhotoPlayerContainer}
            onPress={() => setShowControls(!showControls)}
            activeOpacity={1}
          >
            {/* Still Image */}
            {!isPlaying && (
              <Image
                source={{ uri: `file://${livePhoto.photo}` }}
                style={[
                  styles.livePhotoImage,
                  { width: screenWidth - 40, height: imageHeight },
                ]}
                resizeMode="cover"
              />
            )}

            {/* Video Component */}
            {livePhoto.video && (
              <Video
                source={{ uri: `file://${livePhoto.video}` }}
                style={[
                  styles.livePhotoVideo,
                  {
                    width: screenWidth - 40,
                    height: imageHeight,
                    opacity: isPlaying ? 1 : 0,
                  },
                ]}
                controls={false}
                paused={!isPlaying}
                resizeMode="cover"
                repeat={true}
                volume={1.0}
                onLoad={data => setDuration(data.duration || 0)}
                onProgress={data => setCurrentTime(data.currentTime || 0)}
                onEnd={() => {
                  setIsPlaying(false);
                  setCurrentTime(0);
                }}
                onError={error => {
                  console.error('Live Photo video error:', error);
                  Alert.alert('Error', 'Failed to load Live Photo video');
                }}
              />
            )}

            {/* LIVE Badge */}
            {livePhoto.video && (
              <View style={styles.livePhotoBadge}>
                <Text style={styles.livePhotoBadgeText}>LIVE</Text>
              </View>
            )}

            {/* Play/Pause Controls Overlay */}
            {showControls && livePhoto.video && (
              <View style={styles.controlsOverlay}>
                <TouchableOpacity
                  style={styles.playPauseButton}
                  onPress={() => setIsPlaying(!isPlaying)}
                >
                  <Text style={styles.playPauseButtonText}>
                    {isPlaying ? '⏸️' : '▶️'}
                  </Text>
                </TouchableOpacity>

                {duration > 0 && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${(currentTime / duration) * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.timeText}>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>

          {/* Tap to play instruction */}
          {!isPlaying && (
            <View style={styles.tapToPlayContainer}>
              <Text style={styles.tapToPlayText}>Tap to view Live Photo</Text>
            </View>
          )}
        </View>

        {/* Media Information */}
        {/* Additional media info sections like dimensions, duration, file paths, audio, transcription */}
      </View>
    );
  };

  // Audio extraction and cleaning functions remain unchanged...
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

      if (!result?.path)
        return Alert.alert('Extraction Failed', 'No audio track found.');

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
    if (!inputPath)
      return Alert.alert('No Audio', 'Please extract audio first.');

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
              <Text style={styles.headerTitle}>
                {livePhotoResult ? 'Live Photo Details' : 'Media Details'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {media ? 'Selected Media' : 'Live Photo Components'}
              </Text>
            </View>
            <View style={{ width: moderateScale(30) }} />
          </View>

          {/* Live Photo Result */}
          {livePhotoResult && renderLivePhotoContent()}

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
