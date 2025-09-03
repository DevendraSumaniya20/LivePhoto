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

  // Regular media audio states
  const [extractedAudio, setExtractedAudio] = useState<ExtractedAudio | null>(
    null,
  );
  const [cleanedAudio, setCleanedAudio] = useState<ExtractedAudio | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isCleaning, setIsCleaning] = useState<boolean>(false);

  // Live Photo audio states
  const [livePhotoExtractedAudio, setLivePhotoExtractedAudio] =
    useState<ExtractedAudio | null>(null);
  const [livePhotoCleanedAudio, setLivePhotoCleanedAudio] =
    useState<ExtractedAudio | null>(null);
  const [isExtractingLivePhoto, setIsExtractingLivePhoto] =
    useState<boolean>(false);
  const [isCleaningLivePhoto, setIsCleaningLivePhoto] =
    useState<boolean>(false);

  const [gradientProps] = useState(() => getGradientProps());

  const clearMedia = (): void => {
    navigation.goBack();
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

  // --- Audio Extraction Functions ---
  const extractAudioFromPath = async (
    videoPath: string,
    setExtracted: (audio: ExtractedAudio | null) => void,
    setCleaned: (audio: ExtractedAudio | null) => void,
    setExtracting: (loading: boolean) => void,
  ): Promise<void> => {
    setExtracting(true);
    try {
      const filePath = videoPath.replace('file://', '');
      const result = await AudioModule.extractAudio(filePath);

      if (!result?.path) {
        return Alert.alert('Extraction Failed', 'No audio track found.');
      }

      const defaultFormat = Platform.OS === 'ios' ? 'm4a' : 'm4a';
      const extractedAudioData = {
        ...result,
        format: result.format || defaultFormat,
        sampleRate: result.sampleRate || 44100,
      };

      setExtracted(extractedAudioData);
      setCleaned(null);
      Alert.alert('Success', 'Audio extracted and ready to play!');
    } catch (err: any) {
      console.error('Audio extraction error:', err);
      Alert.alert('Error', err?.message || 'Failed to extract audio');
    } finally {
      setExtracting(false);
    }
  };

  const cleanExtractedAudio = async (
    extractedAudio: ExtractedAudio | null,
    cleanedAudio: ExtractedAudio | null,
    setCleaned: (audio: ExtractedAudio | null) => void,
    setCleaning: (loading: boolean) => void,
  ): Promise<void> => {
    const inputPath = cleanedAudio?.path || extractedAudio?.path;
    if (!inputPath) {
      return Alert.alert('No Audio', 'Please extract audio first.');
    }

    setCleaning(true);
    try {
      const timestamp = Date.now();
      const extension = '.m4a';
      const outputPath = inputPath.replace(
        /\.\w+$/,
        `_cleaned_${timestamp}${extension}`,
      );
      const cleanedPath = await AudioModule.cleanAudio(inputPath, outputPath);

      setCleaned({
        ...(cleanedAudio || extractedAudio)!,
        path: cleanedPath,
        format: extension.replace('.', ''),
      });
      Alert.alert('Success', 'Audio cleaned and saved!');
    } catch (err: any) {
      console.error('Audio cleaning error:', err);
      Alert.alert('Error', err?.message || 'Failed to clean audio');
    } finally {
      setCleaning(false);
    }
  };

  // --- Regular Media Audio Handlers ---
  const handleExtractAudio = async (): Promise<void> => {
    if (!media?.path || !isVideo(media.mime)) {
      return Alert.alert(
        'Invalid Media',
        'Please select a video to extract audio.',
      );
    }

    await extractAudioFromPath(
      media.path,
      setExtractedAudio,
      setCleanedAudio,
      setIsExtracting,
    );
  };

  const handleCleanAudio = async (): Promise<void> => {
    await cleanExtractedAudio(
      extractedAudio,
      cleanedAudio,
      setCleanedAudio,
      setIsCleaning,
    );
  };

  // --- Live Photo Audio Handlers ---
  const handleExtractLivePhotoAudio = async (): Promise<void> => {
    if (!livePhotoResult?.video) {
      return Alert.alert(
        'Invalid Live Photo',
        'No video component found in Live Photo.',
      );
    }

    await extractAudioFromPath(
      livePhotoResult.video,
      setLivePhotoExtractedAudio,
      setLivePhotoCleanedAudio,
      setIsExtractingLivePhoto,
    );
  };

  const handleCleanLivePhotoAudio = async (): Promise<void> => {
    await cleanExtractedAudio(
      livePhotoExtractedAudio,
      livePhotoCleanedAudio,
      setLivePhotoCleanedAudio,
      setIsCleaningLivePhoto,
    );
  };

  // --- Audio Player Component ---
  const renderAudioPlayer = (
    title: string,
    audioData: ExtractedAudio,
    containerStyle?: any,
  ) => (
    <View style={[styles.audioPlayerContainer, containerStyle]}>
      <Text style={styles.audioTitle}>
        {title} ({Platform.OS.toUpperCase()})
      </Text>
      <Components.AudioExtractor extractedAudio={audioData} />
    </View>
  );

  // --- Audio Extraction Buttons ---
  const renderAudioExtractionButtons = (
    isVideo: boolean,
    extractedAudio: ExtractedAudio | null,
    cleanedAudio: ExtractedAudio | null,
    isExtracting: boolean,
    isCleaning: boolean,
    onExtract: () => void,
    onClean: () => void,
    buttonStyle?: any,
  ) => (
    <>
      {/* Extract Audio Button */}
      {isVideo && (
        <TouchableOpacity
          style={[
            styles.extractButton,
            isExtracting && styles.extractButtonDisabled,
            buttonStyle,
          ]}
          onPress={onExtract}
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
            buttonStyle,
          ]}
          onPress={onClean}
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
    </>
  );

  // --- Render Live Photo Metadata and Components ---
  const renderLivePhotoContent = () => {
    if (!livePhotoResult) return null;

    const livePhoto = livePhotoResult as LivePhotoResult;

    return (
      <View style={styles.mediaDetailsContainer}>
        {/* Live Photo Header with Metadata */}
        <View style={styles.livePhotoMetadataContainer}>
          <Text style={styles.livePhotoTitle}>📸 Live Photo Details</Text>

          {/* Basic Info */}
          <View style={styles.metadataSection}>
            <Text style={styles.metadataLabel}>Local ID:</Text>
            <Text style={styles.metadataValue}>
              {livePhoto.localIdentifier || 'N/A'}
            </Text>
          </View>

          <View style={styles.metadataSection}>
            <Text style={styles.metadataLabel}>Created:</Text>
            <Text style={styles.metadataValue}>
              {livePhoto.creationDate
                ? new Date(livePhoto.creationDate * 1000).toLocaleString()
                : 'N/A'}
            </Text>
          </View>

          <View style={styles.metadataSection}>
            <Text style={styles.metadataLabel}>Modified:</Text>
            <Text style={styles.metadataValue}>
              {livePhoto.modificationDate
                ? new Date(livePhoto.modificationDate * 1000).toLocaleString()
                : 'N/A'}
            </Text>
          </View>

          <View style={styles.metadataSection}>
            <Text style={styles.metadataLabel}>Resolution:</Text>
            <Text style={styles.metadataValue}>
              {livePhoto.pixelWidth} x {livePhoto.pixelHeight}
            </Text>
          </View>

          {livePhoto.duration !== undefined && (
            <View style={styles.metadataSection}>
              <Text style={styles.metadataLabel}>Duration:</Text>
              <Text style={styles.metadataValue}>
                {livePhoto.duration.toFixed(2)}s
              </Text>
            </View>
          )}

          {/* MIME Types and Filenames */}
          {livePhoto.photoMime && (
            <View style={styles.metadataSection}>
              <Text style={styles.metadataLabel}>Photo MIME:</Text>
              <Text style={styles.metadataValue}>{livePhoto.photoMime}</Text>
            </View>
          )}

          {livePhoto.videoMime && (
            <View style={styles.metadataSection}>
              <Text style={styles.metadataLabel}>Video MIME:</Text>
              <Text style={styles.metadataValue}>{livePhoto.videoMime}</Text>
            </View>
          )}

          {livePhoto.filenamePhoto && (
            <View style={styles.metadataSection}>
              <Text style={styles.metadataLabel}>Photo File:</Text>
              <Text style={styles.metadataValue} numberOfLines={2}>
                {livePhoto.filenamePhoto}
              </Text>
            </View>
          )}

          {livePhoto.filenameVideo && (
            <View style={styles.metadataSection}>
              <Text style={styles.metadataLabel}>Video File:</Text>
              <Text style={styles.metadataValue} numberOfLines={2}>
                {livePhoto.filenameVideo}
              </Text>
            </View>
          )}

          {/* Location */}
          {livePhoto.location?.latitude && livePhoto.location?.longitude && (
            <View style={styles.metadataSection}>
              <Text style={styles.metadataLabel}>📍 Location:</Text>
              <Text style={styles.metadataValue}>
                {livePhoto.location.latitude.toFixed(4)},{' '}
                {livePhoto.location.longitude.toFixed(4)}
              </Text>
            </View>
          )}

          {livePhoto.location?.altitude !== undefined && (
            <View style={styles.metadataSection}>
              <Text style={styles.metadataLabel}>Altitude:</Text>
              <Text style={styles.metadataValue}>
                {livePhoto.location.altitude} m
              </Text>
            </View>
          )}
        </View>

        {/* Live Photo Components Preview */}
        {livePhoto.photo && (
          <View style={styles.componentPreview}>
            <Text style={styles.componentTitle}>📷 Still Image Component</Text>
            <Image
              source={{ uri: livePhoto.photo }}
              style={[previewMediaStyle, { height: 200, marginBottom: 10 }]}
              resizeMode="cover"
            />
          </View>
        )}

        {livePhoto.video && (
          <View style={styles.componentPreview}>
            <Text style={styles.componentTitle}>🎥 Video Component</Text>
            <Video
              source={{ uri: livePhoto.video }}
              style={[previewMediaStyle, { height: 300 }]}
              resizeMode="cover"
              repeat
              muted={false}
              controls={false}
            />

            {/* Audio Extraction for Live Photo Video Component */}
            {renderAudioExtractionButtons(
              true, // Always true for Live Photo video component
              livePhotoExtractedAudio,
              livePhotoCleanedAudio,
              isExtractingLivePhoto,
              isCleaningLivePhoto,
              handleExtractLivePhotoAudio,
              handleCleanLivePhotoAudio,
              { marginTop: 10 },
            )}
          </View>
        )}

        {/* Live Photo Audio Players */}
        {livePhotoExtractedAudio &&
          renderAudioPlayer(
            '🎵 Live Photo Extracted Audio',
            livePhotoExtractedAudio,
          )}

        {livePhotoCleanedAudio &&
          renderAudioPlayer(
            '✨ Live Photo Cleaned Audio',
            livePhotoCleanedAudio,
          )}

        {/* Transcription if available */}
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
                  {livePhotoResult ? 'Components & Metadata' : 'Selected Media'}
                </Text>
              </View>
              <View style={{ width: moderateScale(30) }} />
            </View>

            {/* Live Photo Content */}
            {livePhotoResult && renderLivePhotoContent()}

            {/* Regular Media Content */}
            {media && !livePhotoResult && (
              <View style={styles.mediaDetailsContainer}>
                <Components.MediaDetails
                  media={media}
                  clearMedia={clearMedia}
                  renderMediaPreview={renderMediaPreview}
                />

                {/* Audio Extraction for Regular Media */}
                {renderAudioExtractionButtons(
                  isVideo(media.mime),
                  extractedAudio,
                  cleanedAudio,
                  isExtracting,
                  isCleaning,
                  handleExtractAudio,
                  handleCleanAudio,
                )}

                {/* Regular Media Audio Players */}
                {extractedAudio &&
                  renderAudioPlayer('🎵 Extracted Audio', extractedAudio)}

                {cleanedAudio &&
                  renderAudioPlayer('✨ Cleaned Audio', cleanedAudio)}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

export default VideoScreen;
