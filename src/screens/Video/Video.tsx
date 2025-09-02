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
import LinearGradient from 'react-native-linear-gradient';

import Colors from '../../constants/color';
import styles from './styles';
import Components from '../../components';
import Icons from '../../constants/svgPath';
import { moderateScale } from '../../constants/responsive';
import { formatDate } from '../../utils/FormattingData';
import { isVideo } from '../../utils/mediaPicker';
import { getGradientProps } from '../../utils/gradients';
import { previewMediaStyle } from '../../constants/styles';
import {
  LivePhotoResult,
  PickedMedia,
  RootStackParamList,
} from '../../navigation/types';

const { AudioModule, LivePhotoManager } = NativeModules;
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
  const [gradientProps] = useState(() => getGradientProps());
  const [isLivePhotoDisplayed, setIsLivePhotoDisplayed] =
    useState<boolean>(false);

  useEffect(() => {
    if (isPlaying && livePhotoResult) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, livePhotoResult]);

  // Clean up Live Photo display when component unmounts
  useEffect(() => {
    return () => {
      if (Platform.OS === 'ios' && isLivePhotoDisplayed) {
        LivePhotoManager?.hideLivePhoto();
      }
    };
  }, [isLivePhotoDisplayed]);

  const clearMedia = (): void => {
    // Hide Live Photo if displayed before going back
    if (Platform.OS === 'ios' && isLivePhotoDisplayed) {
      LivePhotoManager?.hideLivePhoto();
    }
    navigation.goBack();
  };

  // --- Live Photo Handlers ---
  // --- Live Photo Handlers ---
  const handleShowLivePhoto = async () => {
    if (!livePhotoResult || Platform.OS !== 'ios') {
      Alert.alert('Error', 'Live Photo not available or not supported');
      return;
    }

    try {
      const localIdentifier =
        livePhotoResult.localIdentifier || 'providerAsset';

      // ✅ Call the native module to show the Live Photo
      await LivePhotoManager.showLivePhoto(localIdentifier);

      // Update state
      setIsLivePhotoDisplayed(true);
    } catch (err) {
      console.error('Error displaying Live Photo:', err);
      Alert.alert('Error', 'Failed to display Live Photo');
    }
  };

  const hideLivePhoto = () => {
    if (Platform.OS === 'ios' && LivePhotoManager) {
      LivePhotoManager.hideLivePhoto();
      setIsLivePhotoDisplayed(false);
    }
  };

  // --- Render Regular Media (Video/Image) ---
  const renderMediaPreview = () => {
    if (!media) return null;

    if (isVideo(media.mime)) {
      return (
        <Video
          source={{ uri: media.path }}
          style={previewMediaStyle}
          resizeMode="cover"
          repeat={false}
          controls
          paused
          onLoad={data => setDuration(data.duration)}
          onProgress={data => setCurrentTime(data.currentTime)}
          onEnd={() => setCurrentTime(0)}
        />
      );
    }

    return (
      <Image
        source={{ uri: media.path }}
        style={previewMediaStyle}
        resizeMode="cover"
      />
    );
  };

  // --- Render Live Photo (video + photo + details) ---
  const renderLivePhotoContent = () => {
    if (!livePhotoResult) return null;

    const livePhoto = livePhotoResult as LivePhotoResult;

    const creationDate = livePhoto.creationDate
      ? formatDate(Number(livePhoto.creationDate) * 1000)
      : 'N/A';
    const modificationDate = livePhoto.modificationDate
      ? formatDate(Number(livePhoto.modificationDate) * 1000)
      : 'N/A';

    const latitude = livePhoto.location?.latitude?.toFixed(4) ?? 'N/A';
    const longitude = livePhoto.location?.longitude?.toFixed(4) ?? 'N/A';

    return (
      <View style={styles.mediaDetailsContainer}>
        {/* Header */}
        <View style={styles.livePhotoHeader}>
          <Text style={styles.livePhotoTitle}>📸 Live Photo Details</Text>
          <Text style={styles.livePhotoSubtitle}>Created: {creationDate}</Text>
          <Text style={styles.livePhotoSubtitle}>
            Modified: {modificationDate}
          </Text>
          {livePhoto.duration !== undefined && (
            <Text style={styles.livePhotoSubtitle}>
              Duration: {livePhoto.duration.toFixed(2)} sec
            </Text>
          )}
          <Text style={styles.locationText}>
            📍 Lat: {latitude}, Lon: {longitude}
          </Text>
          <Text style={styles.livePhotoSubtitle}>
            Dimensions: {livePhoto.pixelWidth} x {livePhoto.pixelHeight}
          </Text>
        </View>

        {/* Live Photo Components Preview */}
        {livePhoto.photo && (
          <View style={styles.componentPreview}>
            <Text style={styles.componentTitle}>📷 Still Image</Text>
            <Image
              source={{ uri: `file://${livePhoto.photo}` }}
              style={[previewMediaStyle, { height: 200 }]}
              resizeMode="cover"
            />
          </View>
        )}

        {livePhoto.video && (
          <View style={styles.componentPreview}>
            <Text style={styles.componentTitle}>🎥 Video Component</Text>
            <Video
              source={{ uri: `file://${livePhoto.video}` }}
              style={[previewMediaStyle, { height: 200 }]}
              resizeMode="cover"
              controls
              paused
            />
          </View>
        )}

        {livePhoto.audio && (
          <View style={styles.componentPreview}>
            <Text style={styles.componentTitle}>🎵 Audio Component</Text>
            <Text style={styles.componentInfo}>
              Audio extracted from Live Photo
            </Text>
          </View>
        )}

        {/* Show Live Photo Button */}
        <TouchableOpacity
          style={[styles.extractButton, styles.livePhotoButton]}
          onPress={handleShowLivePhoto}
          activeOpacity={0.8}
        >
          <View style={styles.extractButtonContent}>
            <Text style={styles.extractButtonText}>
              {isLivePhotoDisplayed ? '🔄 Show Again' : '▶️ Play Live Photo'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Hide Live Photo Button */}
        {isLivePhotoDisplayed && (
          <TouchableOpacity
            style={[styles.extractButton, styles.hideLivePhotoButton]}
            onPress={hideLivePhoto}
            activeOpacity={0.8}
          >
            <View style={styles.extractButtonContent}>
              <Text style={styles.extractButtonText}>⏹️ Hide Live Photo</Text>
            </View>
          </TouchableOpacity>
        )}

        {livePhoto.transcription && (
          <View style={styles.transcriptionContainer}>
            <Text style={styles.componentTitle}>📝 Transcription</Text>
            <Text style={styles.transcriptionText}>
              {livePhoto.transcription}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // --- Audio Extraction ---
  const handleExtractAudio = async (): Promise<void> => {
    if (!media?.path || !isVideo(media.mime)) {
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
      <LinearGradient {...gradientProps} style={styles.safeArea}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => clearMedia()}>
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
                  {livePhotoResult ? 'Live Photo Components' : 'Selected Media'}
                </Text>
              </View>
              <View style={{ width: moderateScale(30) }} />
            </View>

            {/* Live Photo */}
            {livePhotoResult && renderLivePhotoContent()}

            {/* Regular Media */}
            {media && !livePhotoResult && (
              <View style={styles.mediaDetailsContainer}>
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
                    <Components.AudioExtractor
                      extractedAudio={extractedAudio}
                    />
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
      </LinearGradient>
    </>
  );
};

export default VideoScreen;
