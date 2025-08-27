import React, { ReactElement, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeModules } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import Colors from '../../constants/color';
import styles from './styles';
import Components from '../../components';
import { handlePickMedia } from '../../utils/CameraPermission';
import { RootStackParamList } from '../../navigation/types';

type HomeScreenNavigationProp = NavigationProp<RootStackParamList, 'Home'>;

const { LivePhotoManager } = NativeModules;

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
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [isProcessingLivePhoto, setIsProcessingLivePhoto] = useState(false);
  const [deviceCompatibility, setDeviceCompatibility] =
    useState<DeviceCompatibility | null>(null);
  const [isCheckingCompatibility, setIsCheckingCompatibility] = useState(false);

  // Check device compatibility on component mount
  useEffect(() => {
    // Debug: Check if module is available
    console.log('LivePhotoManager module:', LivePhotoManager);
    console.log('Available methods:', Object.keys(LivePhotoManager || {}));

    checkDeviceCompatibility();
  }, []);

  const checkDeviceCompatibility = async (): Promise<void> => {
    setIsCheckingCompatibility(true);
    try {
      // Check if LivePhotoManager module exists
      if (!LivePhotoManager) {
        throw new Error('LivePhotoManager module is not available');
      }

      // Call the native module method - it should return a Promise
      const result: DeviceCompatibility =
        await LivePhotoManager.checkDeviceCompatibility();

      setDeviceCompatibility(result);

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

  // Handle media selection from gallery, camera, or record
  const handleMediaSelection = async (
    source: 'gallery' | 'camera' | 'record',
  ) => {
    try {
      const selectedMedia = await handlePickMedia(source);
      if (selectedMedia) {
        // Navigate to Video screen with the selected media
        navigation.navigate('Video', { media: selectedMedia });
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to select media');
    }
  };

  const handlePickLivePhoto = async (): Promise<void> => {
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
      // Check if LivePhotoManager module exists
      if (!LivePhotoManager) {
        throw new Error('LivePhotoManager module is not available');
      }

      Alert.alert(
        'Live Transcription',
        'You will have 5 seconds to speak after selecting a Live Photo for transcription.',
        [{ text: 'OK', style: 'default' }],
      );

      // Call the native module method - it should return a Promise
      const result: LivePhotoResult = await LivePhotoManager.pickLivePhoto();

      // Navigate to Video screen with Live Photo result
      navigation.navigate('Video', { livePhotoResult: result });

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

  const getCompatibilityStatus = () => {
    if (isCheckingCompatibility) {
      return {
        icon: '❓',
        color: '#999',
        text: 'Checking...',
        statusStyle: styles.statusChecking,
      };
    }

    if (!deviceCompatibility) {
      return {
        icon: '❓',
        color: '#999',
        text: 'Unknown',
        statusStyle: styles.statusChecking,
      };
    }

    return deviceCompatibility.isSupported
      ? {
          icon: '✅',
          color: '#4CAF50',
          text: 'Fully Supported',
          statusStyle: styles.statusSupported,
        }
      : {
          icon: '⚠️',
          color: '#FF9800',
          text: 'Limited Support',
          statusStyle: styles.statusLimited,
        };
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
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>LivePhoto</Text>
            <Text style={styles.headerSubtitle}>
              Capture moments, explore details
            </Text>

            {/* Enhanced Device Compatibility Status */}
            <TouchableOpacity
              style={[styles.compatibilityBadge, styles.shadowLarge]}
              onPress={() =>
                deviceCompatibility &&
                showCompatibilityDetails(deviceCompatibility)
              }
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.statusIndicator,
                  compatibilityStatus.statusStyle,
                ]}
              />
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

          {/* Action Buttons Container */}
          <View style={[styles.actionContainer, styles.actionContainerLarge]}>
            <Components.ActionButton
              icon="📷"
              title="Gallery"
              subtitle="Choose from photos & videos"
              onPress={() => handleMediaSelection('gallery')}
              style={
                !isProcessingLivePhoto ? undefined : styles.actionButtonDisabled
              }
              disabled={isProcessingLivePhoto}
            />

            <Components.ActionButton
              icon="📸"
              title="Camera"
              subtitle="Take a new photo/video"
              onPress={() => handleMediaSelection('camera')}
              style={
                !isProcessingLivePhoto ? undefined : styles.actionButtonDisabled
              }
              disabled={isProcessingLivePhoto}
            />

            <Components.ActionButton
              icon="🎥"
              title="Record Video"
              subtitle="Capture a new video"
              onPress={() => handleMediaSelection('record')}
              style={
                !isProcessingLivePhoto ? undefined : styles.actionButtonDisabled
              }
              disabled={isProcessingLivePhoto}
            />

            <Components.ActionButton
              icon="🖼️"
              title="Live Photo"
              subtitle={
                deviceCompatibility?.isSupported
                  ? 'Extract audio & transcription'
                  : isCheckingCompatibility
                  ? 'Checking device compatibility...'
                  : 'Limited device support'
              }
              onPress={handlePickLivePhoto}
              disabled={isCheckingCompatibility || isProcessingLivePhoto}
              style={
                isCheckingCompatibility || isProcessingLivePhoto
                  ? styles.actionButtonDisabled
                  : undefined
              }
            />
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Enhanced Loading Overlay */}
        {(isProcessingLivePhoto || isCheckingCompatibility) && (
          <View style={styles.loadingOverlay}>
            <View style={styles.centerContent}>
              <ActivityIndicator
                size="large"
                color={Colors.white}
                style={styles.loadingSpinner}
              />
              <Text style={styles.loadingText}>
                {isProcessingLivePhoto
                  ? 'Processing Live Photo...\nPlease wait'
                  : 'Checking Compatibility...\nThis may take a moment'}
              </Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

export default Home;
