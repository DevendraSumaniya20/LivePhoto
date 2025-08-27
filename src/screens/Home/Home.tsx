import React, { ReactElement, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import Colors from '../../constants/color';
import styles from './styles';
import Components from '../../components';
import { handlePickMedia } from '../../utils/CameraPermission';
import {
  pickLivePhotoAndProcess,
  checkLivePhotoCompatibility,
} from '../../utils/service';
import { RootStackParamList } from '../../navigation/types';
import Icons from '../../constants/svgPath';
import { moderateScale } from '../../constants/responsive';

type HomeScreenNavigationProp = NavigationProp<RootStackParamList, 'Home'>;

interface LivePhotoResult {
  photo: string;
  audio: string;
  transcription: string;
  video: string;
}

interface DeviceCompatibility {
  isSupported: boolean;
  message: string;
  deviceInfo?: string;
}

const Home = (): ReactElement => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [isProcessingLivePhoto, setIsProcessingLivePhoto] = useState(false);
  const [deviceCompatibility, setDeviceCompatibility] =
    useState<DeviceCompatibility | null>(null);
  const [isCheckingCompatibility, setIsCheckingCompatibility] = useState(false);

  // Handle media selection (Gallery, Camera, Record)
  const handleMediaSelection = async (
    source: 'gallery' | 'camera' | 'record',
  ) => {
    try {
      const selectedMedia = await handlePickMedia(source);
      if (selectedMedia) {
        navigation.navigate('Video', { media: selectedMedia });
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to select media');
    }
  };

  // Handle Live Photo selection
  const handlePickLivePhoto = async (): Promise<void> => {
    setIsCheckingCompatibility(true);

    try {
      // 1️⃣ Check device compatibility first
      const result = await checkLivePhotoCompatibility();
      const compatibility: DeviceCompatibility = {
        isSupported: result.isSupported,
        message: result.message,
        deviceInfo: (result as any).deviceInfo ?? undefined,
      };
      setDeviceCompatibility(compatibility);

      if (!compatibility.isSupported) {
        Alert.alert(
          'Device Not Supported',
          `${compatibility.message}\n\nWould you like to try anyway? Some features may not work properly.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Anyway', onPress: () => proceedWithLivePhoto() },
            {
              text: 'Learn More',
              onPress: () =>
                Alert.alert(
                  'Device Compatibility Details',
                  `${compatibility.message}\n\n${compatibility.deviceInfo}`,
                ),
            },
          ],
        );
        return;
      }
    } catch (err) {
      console.error('Compatibility check failed:', err);
      Alert.alert(
        'Error',
        'Unable to determine device compatibility. Some features may not work properly.',
      );
      return;
    } finally {
      setIsCheckingCompatibility(false);
    }

    // 2️⃣ If supported, proceed to pick and process Live Photo
    proceedWithLivePhoto();
  };

  const proceedWithLivePhoto = async (): Promise<void> => {
    setIsProcessingLivePhoto(true);
    try {
      const result = await pickLivePhotoAndProcess();
      const normalized: LivePhotoResult = {
        photo: result.photo,
        video: result.video,
        audio: result.audio ?? '',
        transcription: result.transcription ?? '',
      };
      navigation.navigate('Video', { livePhotoResult: normalized });
      Alert.alert('Success', 'Live Photo processed successfully!');
    } catch (err: any) {
      console.error('Live Photo Error:', err);
      Alert.alert('Error', err?.message || 'Failed to process Live Photo');
    } finally {
      setIsProcessingLivePhoto(false);
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
            <Text style={styles.headerTitle}>LivePhoto</Text>
            <Text style={styles.headerSubtitle}>
              Capture moments, explore details
            </Text>
          </View>

          <View style={[styles.actionContainer, styles.actionContainerLarge]}>
            {[
              {
                icon: Icons.Gallery,
                title: 'Gallery',
                subtitle: 'Choose from photos & videos',
                onPress: () => handleMediaSelection('gallery'),
              },
              {
                icon: Icons.Camera,
                title: 'Camera',
                subtitle: 'Take a new photo/video',
                onPress: () => handleMediaSelection('camera'),
              },
              {
                icon: Icons.Record,
                title: 'Record Video',
                subtitle: 'Capture a new video',
                onPress: () => handleMediaSelection('record'),
              },
              {
                icon: Icons.LivePhoto,
                title: 'Live Photo',
                subtitle: 'Extract audio & transcription',
                onPress: handlePickLivePhoto,
              },
            ].map((btn, index) => (
              <View
                key={index}
                style={[
                  styles.actionButtonWrapper,
                  (index + 1) % 2 === 0 ? { marginRight: 0 } : {},
                ]}
              >
                <Components.ActionButton
                  icon={
                    <btn.icon
                      height={moderateScale(30)}
                      width={moderateScale(30)}
                    />
                  }
                  title={btn.title}
                  subtitle={btn.subtitle}
                  onPress={btn.onPress}
                  disabled={isProcessingLivePhoto || isCheckingCompatibility}
                  style={
                    isProcessingLivePhoto || isCheckingCompatibility
                      ? styles.actionButtonDisabled
                      : undefined
                  }
                />
              </View>
            ))}
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

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
