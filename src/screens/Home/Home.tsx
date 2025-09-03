import React, { ReactElement, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Colors from '../../constants/color';
import styles from './styles';
import Components from '../../components';
import { moderateScale } from '../../constants/responsive';
import Icons from '../../constants/svgPath';
import { handlePickMedia, isLivePhoto } from '../../utils/mediaPicker';
import {
  RootStackParamList,
  LivePhotoResult,
  PickedLivePhoto,
  mapPickedLivePhotoToResult,
} from '../../navigation/types';
import { NativeModules } from 'react-native';
import Video from 'react-native-video';

const { LivePhotoManager } = NativeModules;

type HomeScreenNavigationProp = NavigationProp<RootStackParamList, 'Home'>;

const Home = (): ReactElement => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [isProcessingLivePhoto, setIsProcessingLivePhoto] = useState(false);

  // ✅ Use LivePhotoResult for state instead of minimal inline type
  const [livePhoto, setLivePhoto] = useState<LivePhotoResult | null>(null);

  const pickLivePhotoDirect = async () => {
    try {
      setIsProcessingLivePhoto(true);
      const result: LivePhotoResult = await LivePhotoManager.pickLivePhoto();
      setLivePhoto(result);
      Alert.alert('Live Photo picked successfully!');
    } catch (e) {
      console.error(e);
      Alert.alert('Failed to pick Live Photo.');
    } finally {
      setIsProcessingLivePhoto(false);
    }
  };

  const handleMediaSelection = async (
    source: 'gallery' | 'camera' | 'record' | 'livephoto',
  ) => {
    try {
      if (source === 'livephoto') {
        await pickLivePhotoDirect();
        return;
      }

      const selectedMedia = await handlePickMedia(source);
      if (selectedMedia) {
        if (isLivePhoto(selectedMedia) && selectedMedia.localIdentifier) {
          const livePhotoResult: LivePhotoResult = mapPickedLivePhotoToResult(
            selectedMedia as PickedLivePhoto,
          );
          navigation.navigate('Video', { livePhotoResult });
        } else {
          navigation.navigate('Video', { media: selectedMedia });
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to select media');
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>LivePhoto</Text>
            <Text style={styles.headerSubtitle}>
              Capture moments, explore details
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={[styles.actionContainer, styles.actionContainerLarge]}>
            {[
              {
                icon: Icons.Gallery,
                title: 'Gallery',
                subtitle: 'Choose from photos & videos',
                onPress: () => handleMediaSelection('gallery'),
                disabled: false,
              },
              {
                icon: Icons.Camera,
                title: 'Camera',
                subtitle: 'Take a new photo/video',
                onPress: () => handleMediaSelection('camera'),
                disabled: false,
              },
              {
                icon: Icons.Record,
                title: 'Record Video',
                subtitle: 'Capture a new video',
                onPress: () => handleMediaSelection('record'),
                disabled: false,
              },
              {
                icon: Icons.LivePhoto,
                title: 'Live Photo',
                subtitle:
                  Platform.OS === 'ios'
                    ? 'Select & preview Live Photos here'
                    : 'iOS only feature',
                onPress: () => handleMediaSelection('livephoto'),
                disabled: Platform.OS !== 'ios' || isProcessingLivePhoto,
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
                  disabled={btn.disabled}
                  style={btn.disabled ? styles.actionButtonDisabled : undefined}
                />
              </View>
            ))}
          </View>

          {/* Live Photo Preview & Details */}
          {livePhoto && (
            <View
              style={{
                marginTop: 30,
                width: '100%',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {/* Close button */}
              <TouchableOpacity
                onPress={() => setLivePhoto(null)}
                style={{
                  position: 'absolute',
                  top: -10,
                  right: 10,
                  zIndex: 10,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  padding: 6,
                  borderRadius: 20,
                }}
              >
                <Icons.Cross height={30} width={30} fill={Colors.white100} />
              </TouchableOpacity>

              <Text
                style={{
                  marginBottom: 10,
                  color: Colors.white,
                  fontSize: moderateScale(16),
                  fontWeight: '600',
                }}
              >
                Live Photo Preview:
              </Text>

              {/* Still Photo */}
              <Image
                source={{ uri: livePhoto.photo }}
                style={{ width: 300, height: 200, marginBottom: 10 }}
                resizeMode="cover"
              />

              {/* Video Part */}
              <Video
                source={{ uri: livePhoto.video }}
                style={{ width: 300, height: 400 }}
                repeat
                muted={false}
                resizeMode="cover"
              />

              {/* Metadata */}
              <View style={{ marginTop: 15, alignItems: 'center' }}>
                <Text style={{ color: Colors.white }}>
                  Local ID: {livePhoto.localIdentifier}
                </Text>
                <Text style={{ color: Colors.white }}>
                  Created:{' '}
                  {new Date(livePhoto.creationDate * 1000).toLocaleString()}
                </Text>
                <Text style={{ color: Colors.white }}>
                  Modified:{' '}
                  {new Date(livePhoto.modificationDate * 1000).toLocaleString()}
                </Text>
                <Text style={{ color: Colors.white }}>
                  Resolution: {livePhoto.pixelWidth} x {livePhoto.pixelHeight}
                </Text>
                <Text style={{ color: Colors.white }}>
                  Duration: {livePhoto.duration?.toFixed(2)}s
                </Text>

                {/* Mime types + filenames */}
                {livePhoto.photoMime && (
                  <Text style={{ color: Colors.white }}>
                    Photo MIME: {livePhoto.photoMime}
                  </Text>
                )}
                {livePhoto.videoMime && (
                  <Text style={{ color: Colors.white }}>
                    Video MIME: {livePhoto.videoMime}
                  </Text>
                )}
                {livePhoto.filenamePhoto && (
                  <Text style={{ color: Colors.white }}>
                    Photo File: {livePhoto.filenamePhoto}
                  </Text>
                )}
                {livePhoto.filenameVideo && (
                  <Text style={{ color: Colors.white }}>
                    Video File: {livePhoto.filenameVideo}
                  </Text>
                )}

                {/* Location */}
                {livePhoto.location?.latitude && (
                  <Text style={{ color: Colors.white }}>
                    Location: {livePhoto.location.latitude},{' '}
                    {livePhoto.location.longitude}
                  </Text>
                )}
                {livePhoto.location?.altitude !== undefined && (
                  <Text style={{ color: Colors.white }}>
                    Altitude: {livePhoto.location.altitude} m
                  </Text>
                )}
              </View>
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Overlay while processing Live Photo */}
        {isProcessingLivePhoto && (
          <View
            style={[
              styles.loadingOverlay,
              {
                zIndex: 999,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
          >
            <ActivityIndicator size="large" color={Colors.white} />
            <Text style={styles.loadingText}>
              Processing Live Photo...
              {'\n'}Extracting components and generating preview
            </Text>
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

export default Home;
