import React, { ReactElement, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import { NativeModules } from 'react-native';

import Colors from '../../constants/color';
import styles from './styles';
import Components from '../../components';
import { PickedMedia, isVideo } from '../../utils/mediaPicker';
import { handlePickMedia } from '../../utils/CameraPermission';

const { AudioExtractor, AudioProcessor, LivePhotoManager } = NativeModules;

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

interface DeviceCompatibility {
  isSupported: boolean;
  message: string;
  deviceInfo: string;
}

const Home = (): ReactElement => {
  const [media, setMedia] = useState<PickedMedia | null>(null);
  const [extractedAudio, setExtractedAudio] = useState<ExtractedAudio | null>(
    null,
  );
  const [cleanedAudio, setCleanedAudio] = useState<ExtractedAudio | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isCleaning, setIsCleaning] = useState<boolean>(false);
  const [livePhotoResult, setLivePhotoResult] =
    useState<LivePhotoResult | null>(null);
  const [isProcessingLivePhoto, setIsProcessingLivePhoto] = useState(false);

  // New state for device compatibility
  const [deviceCompatibility, setDeviceCompatibility] =
    useState<DeviceCompatibility | null>(null);
  const [isCheckingCompatibility, setIsCheckingCompatibility] = useState(false);

  // Check device compatibility on component mount
  useEffect(() => {
    checkDeviceCompatibility();
  }, []);

  const checkDeviceCompatibility = async (): Promise<void> => {
    setIsCheckingCompatibility(true);
    try {
      const result: DeviceCompatibility =
        await LivePhotoManager.checkDeviceCompatibility();
      setDeviceCompatibility(result);

      // Show compatibility status to user (optional - you can remove this if you don't want automatic alerts)
      if (!result.isSupported) {
        Alert.alert('Device Compatibility Notice', result.message, [
          { text: 'OK', style: 'default' },
          {
            text: 'Learn More',
            onPress: () => showCompatibilityDetails(result),
          },
        ]);
      }
    } catch (error: any) {
      console.error('Error checking device compatibility:', error);
      // Set a fallback compatibility state
      setDeviceCompatibility({
        isSupported: false,
        message:
          'Unable to determine device compatibility. Live Photo features may not work properly.',
        deviceInfo: 'Unknown device',
      });
    } finally {
      setIsCheckingCompatibility(false);
    }
  };

  const showCompatibilityDetails = (
    compatibility: DeviceCompatibility,
  ): void => {
    Alert.alert(
      'Device Compatibility Details',
      `${compatibility.message}\n\n${compatibility.deviceInfo}`,
      [
        { text: 'Check Again', onPress: checkDeviceCompatibility },
        { text: 'OK', style: 'default' },
      ],
    );
  };

  const clearMedia = (): void => {
    setMedia(null);
    setExtractedAudio(null);
    setCleanedAudio(null);
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
    if (!extractedAudio?.path) {
      return Alert.alert('No Audio', 'Please extract audio first.');
    }

    setIsCleaning(true);
    try {
      const inputPath = extractedAudio.path;
      const timestamp = Date.now();
      const outputPath = inputPath.replace('.m4a', `_cleaned_${timestamp}.m4a`);

      const cleanedPath = await AudioProcessor.cleanAudio(
        inputPath,
        outputPath,
      );

      setCleanedAudio({
        ...extractedAudio,
        path: cleanedPath,
        size: extractedAudio.size,
      });

      Alert.alert('Success', 'Audio cleaned and saved!');
    } catch (err: any) {
      console.error('Audio cleaning error:', err);
      Alert.alert('Error', err?.message || 'Failed to clean audio');
    } finally {
      setIsCleaning(false);
    }
  };

  const handlePickLivePhoto = async (): Promise<void> => {
    // Check compatibility before proceeding
    if (deviceCompatibility && !deviceCompatibility.isSupported) {
      Alert.alert(
        'Device Not Supported',
        `${deviceCompatibility.message}\n\nWould you like to try anyway? Some features may not work properly.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Try Anyway', onPress: () => proceedWithLivePhoto() },
          {
            text: 'Check Compatibility',
            onPress: () => showCompatibilityDetails(deviceCompatibility),
          },
        ],
      );
      return;
    }

    if (!deviceCompatibility) {
      Alert.alert(
        'Checking Compatibility',
        'Please wait while we check if your device supports Live Photo features.',
        [{ text: 'OK' }],
      );
      await checkDeviceCompatibility();
      return;
    }

    proceedWithLivePhoto();
  };

  const proceedWithLivePhoto = async (): Promise<void> => {
    setIsProcessingLivePhoto(true);
    try {
      Alert.alert(
        'Live Transcription',
        'You will have 5 seconds to speak after selecting a Live Photo for transcription.',
        [{ text: 'OK', style: 'default' }],
      );

      const result: LivePhotoResult = await LivePhotoManager.pickLivePhoto();
      setLivePhotoResult(result);

      Alert.alert(
        'Success',
        'Live Photo processed successfully!\n\nTranscription is from your live microphone input.',
      );
    } catch (err: any) {
      console.error('Live Photo Error:', err);

      if (err.code === 'device_not_supported') {
        Alert.alert('Device Not Supported', err.message, [
          { text: 'OK', style: 'default' },
          { text: 'Check Compatibility', onPress: checkDeviceCompatibility },
        ]);
      } else {
        Alert.alert('Error', err?.message || 'Failed to process Live Photo');
      }
    } finally {
      setIsProcessingLivePhoto(false);
    }
  };

  // Helper function to get compatibility status icon and color
  const getCompatibilityStatus = () => {
    if (!deviceCompatibility) {
      return { icon: '❓', color: '#999', text: 'Checking...' };
    }

    return deviceCompatibility.isSupported
      ? { icon: '✅', color: '#4CAF50', text: 'Supported' }
      : { icon: '⚠️', color: '#FF9800', text: 'Limited Support' };
  };

  const compatibilityStatus = getCompatibilityStatus();

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
            <Text style={styles.headerTitle}>LivePhoto</Text>
            <Text style={styles.headerSubtitle}>
              Capture moments, explore details
            </Text>

            {/* Device Compatibility Status */}
            <TouchableOpacity
              style={styles.compatibilityBadge}
              onPress={() =>
                deviceCompatibility &&
                showCompatibilityDetails(deviceCompatibility)
              }
              activeOpacity={0.7}
            >
              <Text style={styles.compatibilityIcon}>
                {compatibilityStatus.icon}
              </Text>
              <Text
                style={[
                  styles.compatibilityText,
                  { color: compatibilityStatus.color },
                ]}
              >
                {compatibilityStatus.text}
              </Text>
            </TouchableOpacity>
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
            <Components.ActionButton
              icon="🖼️"
              title="Pick Live Photo"
              subtitle={
                deviceCompatibility?.isSupported
                  ? 'Extract audio & transcription'
                  : 'Limited device support'
              }
              onPress={handlePickLivePhoto}
              disabled={isCheckingCompatibility || isProcessingLivePhoto}
            />
          </View>

          <View style={styles.mediaDetailsContainer}>
            <Components.MediaDetails
              media={media}
              clearMedia={clearMedia}
              renderMediaPreview={renderMediaPreview}
            />
          </View>

          {media && isVideo(media.mime) && (
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

          {extractedAudio && !cleanedAudio && (
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
                <Text style={styles.extractButtonIcon}>✨</Text>
                <Text style={styles.extractButtonText}>
                  {isCleaning ? 'Cleaning...' : 'Clean Audio'}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {cleanedAudio && (
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
                <Text style={styles.extractButtonIcon}>🔄</Text>
                <Text style={styles.extractButtonText}>
                  {isCleaning ? 'Re-cleaning...' : 'Clean Again'}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {extractedAudio && (
            <View style={styles.audioPlayerContainer}>
              <Text style={styles.audioTitle}>Original Extracted Audio:</Text>
              <Components.AudioExtractor extractedAudio={extractedAudio} />
            </View>
          )}

          {cleanedAudio && (
            <View style={styles.audioPlayerContainer}>
              <Text style={styles.audioTitle}>Cleaned Audio:</Text>
              <Components.AudioExtractor extractedAudio={cleanedAudio} />
            </View>
          )}

          {livePhotoResult && (
            <View style={styles.livePhotoContainer}>
              <Text style={styles.livePhotoLabel}>Original Photo:</Text>
              <Image
                source={{ uri: 'file://' + livePhotoResult.photo }}
                style={styles.livePhotoImage}
                resizeMode="cover"
              />

              <Text style={styles.livePhotoLabel}>
                Extracted/Cleaned Audio:
              </Text>
              <Components.AudioExtractor
                extractedAudio={{
                  path: livePhotoResult.audio,
                  size: 0,
                  duration: 0,
                  format: 'm4a',
                  sampleRate: 44100,
                }}
              />

              <Text style={styles.livePhotoLabel}>Transcription:</Text>
              <Text style={styles.livePhotoText}>
                {livePhotoResult.transcription || 'No transcription available'}
              </Text>

              <Text style={styles.livePhotoLabel}>Original Video:</Text>
              <Video
                source={{ uri: 'file://' + livePhotoResult.video }}
                style={styles.livePhotoVideo}
                controls
                paused
              />
            </View>
          )}

          {(isExtracting ||
            isCleaning ||
            isProcessingLivePhoto ||
            isCheckingCompatibility) && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>
                {isExtracting
                  ? 'Extracting audio...'
                  : isCleaning
                  ? 'Cleaning audio...'
                  : isProcessingLivePhoto
                  ? 'Processing Live Photo...'
                  : 'Checking device compatibility...'}
              </Text>
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default Home;
