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
import LinearGradient from 'react-native-linear-gradient';

import Colors from '../../constants/color';
import styles from './styles';
import Components from '../../components';
import Icons from '../../constants/svgPath';
import { moderateScale } from '../../constants/responsive';
import { isVideo } from '../../utils/mediaPicker';
import { getGradientProps } from '../../utils/gradients';
import { previewMediaStyle } from '../../constants/styles';
import { RootStackParamList } from '../../navigation/types';

const { AudioModule } = NativeModules;

interface ProcessedAudio {
  path: string;
  size: number;
  duration: number;
  format: string;
  sampleRate: number;
  processed: boolean;
}

type VideoScreenRouteProp = RouteProp<RootStackParamList, 'Video'>;
type VideoScreenNavigationProp = NavigationProp<RootStackParamList, 'Video'>;

const VideoScreen = (): ReactElement => {
  const route = useRoute<VideoScreenRouteProp>();
  const navigation = useNavigation<VideoScreenNavigationProp>();
  const { media, livePhotoResult } = route.params || {};

  const [processedAudio, setProcessedAudio] = useState<ProcessedAudio | null>(
    null,
  );
  const [isProcessingAudio, setIsProcessingAudio] = useState<boolean>(false);

  const [livePhotoProcessedAudio, setLivePhotoProcessedAudio] =
    useState<ProcessedAudio | null>(null);
  const [isProcessingLivePhotoAudio, setIsProcessingLivePhotoAudio] =
    useState<boolean>(false);

  const [gradientProps] = useState(() => getGradientProps());

  const clearMedia = (): void => navigation.goBack();

  // --- Media Preview ---
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

  // --- Generic Audio Processor ---
  const processAudioFromPath = async (
    path: string,
    setProcessed: (audio: ProcessedAudio | null) => void,
    setProcessing: (loading: boolean) => void,
  ): Promise<void> => {
    setProcessing(true);
    try {
      const filePath = media.path.replace('file://', '');
      console.log('🎬 Extracting audio from path:', filePath);

      const result = await AudioModule.extractCleanAudio(filePath); // <-- Native audio extraction happens here

      if (!result?.path) {
        return Alert.alert(
          'Processing Failed',
          'No audio track found or processing failed.',
        );
      }

      setProcessed({
        path: result.path,
        size: result.size ?? 0,
        duration: result.duration ?? 0,
        format: result.format ?? 'm4a',
        sampleRate: result.sampleRate ?? 44100,
        processed: result.processed ?? true,
      });

      Alert.alert('Success', 'Audio extracted and cleaned successfully!');
    } catch (err: any) {
      console.error('Audio processing error:', err);
      Alert.alert('Error', err?.message || 'Failed to process audio');
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessAudio = async (): Promise<void> => {
    if (!media?.path || !isVideo(media.mime))
      return Alert.alert('Invalid Media', 'Please select a video.');
    await processAudioFromPath(
      media.path,
      setProcessedAudio,
      setIsProcessingAudio,
    );
  };

  const handleProcessLivePhotoAudio = async (): Promise<void> => {
    if (!livePhotoResult?.video)
      return Alert.alert(
        'Invalid Live Photo',
        'No video component found in Live Photo.',
      );
    await processAudioFromPath(
      livePhotoResult.video,
      setLivePhotoProcessedAudio,
      setIsProcessingLivePhotoAudio,
    );
  };

  // --- Audio Player ---
  const renderAudioPlayer = (
    title: string,
    audioData: ProcessedAudio,
    containerStyle?: any,
  ) => (
    <View style={[styles.audioPlayerContainer, containerStyle]}>
      <Text style={styles.audioTitle}>
        {title} ({Platform.OS.toUpperCase()})
      </Text>
      <Components.AudioExtractor extractedAudio={audioData} />
    </View>
  );

  // --- Audio Processing Button ---
  const renderAudioProcessingButton = (
    isVideoFile: boolean,
    processedAudio: ProcessedAudio | null,
    isProcessing: boolean,
    onProcess: () => void,
    buttonStyle?: any,
  ) => (
    <>
      {!processedAudio && isVideoFile && (
        <TouchableOpacity
          style={[
            styles.extractButton,
            isProcessing && styles.extractButtonDisabled,
            buttonStyle,
          ]}
          onPress={onProcess}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          <View style={styles.extractButtonContent}>
            <Text style={styles.extractButtonText}>
              {isProcessing
                ? 'Processing Audio...'
                : '🎵 Extract & Clean Audio'}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      {processedAudio && (
        <TouchableOpacity
          style={[
            styles.extractButton,
            { backgroundColor: Colors.secondary },
            isProcessing && styles.extractButtonDisabled,
            buttonStyle,
          ]}
          onPress={onProcess}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          <View style={styles.extractButtonContent}>
            <Text style={styles.extractButtonText}>
              {isProcessing ? 'Re-processing...' : '🔄 Re-process Audio'}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </>
  );

  // --- Enhanced Audio Player ---
  const renderEnhancedAudioPlayer = (
    title: string,
    audioData: ProcessedAudio,
    icon: string,
  ) => (
    <View style={styles.audioPlayerCard}>
      <View style={styles.audioPlayerHeader}>
        <Text style={styles.audioPlayerTitle}>
          {icon} {title}
          {audioData.processed && (
            <Text style={styles.processedBadge}> • Enhanced</Text>
          )}
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
        <Components.AudioExtractor extractedAudio={audioData} />
      </View>
    </View>
  );

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
              <TouchableOpacity onPress={clearMedia}>
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

            {/* Live Photo */}
            {livePhotoResult && (
              <Components.LivePhotoDetails
                livePhotoResult={livePhotoResult}
                clearMedia={clearMedia}
                livePhotoCleanedAudio={livePhotoProcessedAudio}
                isProcessingLivePhotoAudio={isProcessingLivePhotoAudio}
                onProcessLivePhotoAudio={handleProcessLivePhotoAudio}
                renderAudioProcessingButton={renderAudioProcessingButton}
                renderEnhancedAudioPlayer={renderEnhancedAudioPlayer}
              />
            )}

            {/* Regular Media */}
            {media && !livePhotoResult && (
              <View style={styles.mediaDetailsContainer}>
                <Components.MediaDetails
                  media={media}
                  clearMedia={clearMedia}
                  renderMediaPreview={renderMediaPreview}
                />
                {renderAudioProcessingButton(
                  isVideo(media.mime),
                  processedAudio,
                  isProcessingAudio,
                  handleProcessAudio,
                )}
                {processedAudio &&
                  renderAudioPlayer('🎵 Enhanced Audio', processedAudio)}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

export default VideoScreen;
