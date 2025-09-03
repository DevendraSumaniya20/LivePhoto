import React, { ReactElement, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
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
  PickedLivePhoto,
  mapPickedLivePhotoToResult,
} from '../../navigation/types';

type HomeScreenNavigationProp = NavigationProp<RootStackParamList, 'Home'>;

const Home = (): ReactElement => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [isProcessingLivePhoto, setIsProcessingLivePhoto] = useState(false);

  const handleMediaSelection = async (
    source: 'gallery' | 'camera' | 'record' | 'livephoto',
  ) => {
    try {
      setIsProcessingLivePhoto(true);

      const selectedMedia = await handlePickMedia(source);

      if (selectedMedia) {
        if (isLivePhoto(selectedMedia) && selectedMedia.localIdentifier) {
          const livePhotoResult = mapPickedLivePhotoToResult(
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
                    ? 'Select Live Photos from gallery'
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

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Loading overlay */}
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
              {isProcessingLivePhoto
                ? 'Processing Live Photo...'
                : 'Loading...'}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

export default Home;
