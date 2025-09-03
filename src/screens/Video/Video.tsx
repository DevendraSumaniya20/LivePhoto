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
import { isVideo } from '../../utils/mediaPicker';
import { getGradientProps } from '../../utils/gradients';
import { previewMediaStyle } from '../../constants/styles';
import { LivePhotoResult, RootStackParamList } from '../../navigation/types';

const { AudioModule, LivePhotoManager } = NativeModules;

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

  // UI states
  const [metadataExpanded, setMetadataExpanded] = useState<boolean>(false);
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

  // Audio Extraction Buttons
  const renderAudioExtractionButtons = (
    isVideoFile: boolean,
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
      {isVideoFile && (
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

  // Helper component for metadata items
  const MetadataItem = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string;
    icon: string;
  }) => (
    <View style={styles.metadataItem}>
      <Text style={styles.metadataIcon}>{icon}</Text>
      <View style={styles.metadataContent}>
        <Text style={styles.metadataLabel}>{label}</Text>
        <Text style={styles.metadataValue}>{value}</Text>
      </View>
    </View>
  );

  // Enhanced audio player component
  const renderEnhancedAudioPlayer = (
    title: string,
    audioData: ExtractedAudio,
    icon: string,
  ) => (
    <View style={styles.audioPlayerCard}>
      <View style={styles.audioPlayerHeader}>
        <Text style={styles.audioPlayerTitle}>
          {icon} {title}
        </Text>
        <View style={styles.audioPlayerControls}>
          <TouchableOpacity style={styles.audioControlButton}>
            <Text style={styles.audioControlText}>▶️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.audioControlButton}>
            <Text style={styles.audioControlText}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.waveformContainer}>
        {/* You can integrate your actual AudioExtractor component here */}
        <Components.AudioExtractor extractedAudio={audioData} />
      </View>
    </View>
  );

  // --- Render Live Photo Metadata and Components ---
  const renderLivePhotoContent = () => {
    if (!livePhotoResult) return null;

    const livePhoto = livePhotoResult as LivePhotoResult;

    return (
      <ScrollView
        style={styles.mediaDetailsContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Live Photo Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.livePhotoIcon}>
              <Text style={styles.livePhotoEmoji}>📸</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.livePhotoTitle}>Live Photo</Text>
              <Text style={styles.livePhotoSubtitle}>
                {livePhoto.pixelWidth} × {livePhoto.pixelHeight}
                {livePhoto.duration && ` • ${livePhoto.duration.toFixed(1)}s`}
              </Text>
            </View>
          </View>
        </View>

        {/* Live Photo Preview Components */}
        <View style={styles.previewSection}>
          {/* Still Image Component */}
          {livePhoto.photo && (
            <View style={styles.componentCard}>
              <View style={styles.componentHeader}>
                <Text style={styles.componentTitle}>📷 Still Image</Text>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: livePhoto.photo }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              </View>
            </View>
          )}

          {/* Video Component */}
          {livePhoto.video && (
            <View style={styles.componentCard}>
              <View style={styles.componentHeader}>
                <Text style={styles.componentTitle}>🎥 Live Video</Text>
                <View style={styles.videoControls}>
                  <TouchableOpacity style={styles.playButton}>
                    <Text style={styles.playButtonText}>▶️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Export</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.videoContainer}>
                <Video
                  source={{ uri: livePhoto.video }}
                  style={styles.previewVideo}
                  resizeMode="cover"
                  repeat
                  muted={false}
                  controls={false}
                />
                <View style={styles.videoOverlay}>
                  <Text style={styles.videoBadge}>LIVE</Text>
                </View>
              </View>

              {/* Audio Extraction Controls */}
              <View style={styles.audioExtractionSection}>
                {renderAudioExtractionButtons(
                  true,
                  livePhotoExtractedAudio,
                  livePhotoCleanedAudio,
                  isExtractingLivePhoto,
                  isCleaningLivePhoto,
                  handleExtractLivePhotoAudio,
                  handleCleanLivePhotoAudio,
                )}
              </View>
            </View>
          )}
        </View>

        {/* Audio Players Section */}
        {(livePhotoExtractedAudio || livePhotoCleanedAudio) && (
          <View style={styles.audioSection}>
            <Text style={styles.sectionTitle}>🎵 Audio Components</Text>

            {livePhotoExtractedAudio &&
              renderEnhancedAudioPlayer(
                'Extracted Audio',
                livePhotoExtractedAudio,
                '🎵',
              )}

            {livePhotoCleanedAudio &&
              renderEnhancedAudioPlayer(
                'Cleaned Audio',
                livePhotoCleanedAudio,
                '✨',
              )}
          </View>
        )}

        {/* Metadata Section - Collapsible */}
        <TouchableOpacity
          style={styles.metadataHeader}
          onPress={() => setMetadataExpanded(!metadataExpanded)}
        >
          <Text style={styles.sectionTitle}>📊 Details</Text>
          <Text style={styles.expandIcon}>{metadataExpanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>

        {metadataExpanded && (
          <View style={styles.metadataCard}>
            {/* Basic Information Grid */}
            <View style={styles.metadataGrid}>
              <MetadataItem
                label="Created"
                value={
                  livePhoto.creationDate
                    ? new Date(
                        livePhoto.creationDate * 1000,
                      ).toLocaleDateString()
                    : 'Unknown'
                }
                icon="📅"
              />

              <MetadataItem
                label="Modified"
                value={
                  livePhoto.modificationDate
                    ? new Date(
                        livePhoto.modificationDate * 1000,
                      ).toLocaleDateString()
                    : 'Unknown'
                }
                icon="⏰"
              />

              {livePhoto.photoMime && (
                <MetadataItem
                  label="Photo Format"
                  value={
                    livePhoto.photoMime.split('/')[1]?.toUpperCase() ||
                    livePhoto.photoMime.toUpperCase()
                  }
                  icon="🖼"
                />
              )}

              {livePhoto.videoMime && (
                <MetadataItem
                  label="Video Format"
                  value={
                    livePhoto.videoMime.split('/')[1]?.toUpperCase() ||
                    livePhoto.videoMime.toUpperCase()
                  }
                  icon="🎬"
                />
              )}
            </View>

            {/* Location Information */}
            {livePhoto.location?.latitude && livePhoto.location?.longitude && (
              <View style={styles.locationCard}>
                <Text style={styles.locationTitle}>📍 Location</Text>
                <Text style={styles.locationCoords}>
                  {livePhoto.location.latitude.toFixed(4)},{' '}
                  {livePhoto.location.longitude.toFixed(4)}
                </Text>
                {livePhoto.location?.altitude !== undefined && (
                  <Text style={styles.locationAltitude}>
                    Altitude: {Math.round(livePhoto.location.altitude)}m
                  </Text>
                )}
                <TouchableOpacity style={styles.mapButton}>
                  <Text style={styles.mapButtonText}>View on Map</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* File Information */}
            <View style={styles.fileInfoSection}>
              <Text style={styles.subsectionTitle}>📁 Files</Text>
              {livePhoto.filenamePhoto && (
                <View style={styles.fileItem}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    📷 {livePhoto.filenamePhoto}
                  </Text>
                </View>
              )}
              {livePhoto.filenameVideo && (
                <View style={styles.fileItem}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    🎥 {livePhoto.filenameVideo}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Transcription Section */}
        {livePhoto.transcription && (
          <View style={styles.transcriptionCard}>
            <Text style={styles.sectionTitle}>📝 Transcription</Text>
            <View style={styles.transcriptionContent}>
              <Text style={styles.transcriptionText}>
                {livePhoto.transcription}
              </Text>
              <TouchableOpacity style={styles.copyButton}>
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
