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

import { PickedLivePhoto, RootStackParamList } from '../../navigation/types';
import Icons from '../../constants/svgPath';
import { moderateScale } from '../../constants/responsive';
import { formatDate, formatTime } from '../../utils/FormattingData';
import { isVideo } from '../../utils/mediaPicker';
import LinearGradient from 'react-native-linear-gradient';
import { getGradientProps } from '../../utils/gradients';
import {
  previewContainerStyle,
  previewMediaStyle,
} from '../../constants/styles';

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
  const [gradientProps] = useState(() => getGradientProps());

  useEffect(() => {
    // Auto-hide controls after 3 seconds when playing Live Photo
    if (isPlaying && livePhotoResult) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, livePhotoResult]);

  const clearMedia = (): void => {
    navigation.goBack();
  };

  const renderMediaPreview = () => {
    if (!media) return null;

    if (isVideo(media.mime)) {
      return (
        <Video
          source={{ uri: media.path }}
          style={previewMediaStyle}
          resizeMode="cover"
          repeat={false}
          controls={true}
          paused={true}
          onLoad={data => {
            setDuration(data.duration);
          }}
          onProgress={data => {
            setCurrentTime(data.currentTime);
          }}
          onEnd={() => {
            setCurrentTime(0);
          }}
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
            {livePhoto.creationDate
              ? formatDate(parseInt(livePhoto.creationDate) * 1000)
              : ''}
          </Text>
          {livePhoto.location && (
            <Text style={styles.locationText}>
              📍 {livePhoto.location.latitude.toFixed(4)},{' '}
              {livePhoto.location.longitude.toFixed(4)}
            </Text>
          )}
        </View>

        {/* Live Photo Player */}
        <View
          style={[
            previewContainerStyle,
            livePhoto.pixelWidth && livePhoto.pixelHeight
              ? { aspectRatio: livePhoto.pixelWidth / livePhoto.pixelHeight }
              : { height: moderateScale(200) },
          ]}
        >
          {!isPlaying && (
            <Image
              source={{ uri: `file://${livePhoto.photo}` }}
              style={previewMediaStyle}
              resizeMode="cover"
            />
          )}

          {livePhoto.video && (
            <Video
              source={{ uri: `file://${livePhoto.video}` }}
              style={previewMediaStyle}
              paused={!isPlaying}
              resizeMode="cover"
              repeat
              controls={showControls}
              onLoad={() => setIsPlaying(true)}
              onEnd={() => {
                setIsPlaying(false);
                setShowControls(true);
              }}
              onTouchStart={() => setShowControls(true)}
            />
          )}
        </View>
      </View>
    );
  };

  // Audio extraction and cleaning functions remain unchanged...
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
