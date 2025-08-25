import React, { ReactElement, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import Sound from 'react-native-sound';
import { NativeModules } from 'react-native';
import RNFS from 'react-native-fs';

import Colors from '../../constants/color';
import styles from './styles';
import Components from '../../components';
import { formatFileSize, formatTime } from '../../utils/FormattingData';
import {
  pickFromCamera,
  pickFromGallery,
  PickedMedia,
  isVideo,
} from '../../utils/mediaPicker';
import {
  requestCameraPermission,
  requestPhotoLibraryPermission,
} from '../../utils/permissions';

const { AudioExtractor } = NativeModules;
import Share from 'react-native-share';

interface ExtractedAudio {
  path: string;
  size: number;
  duration: number;
  format: string;
  sampleRate: number;
}

const Home = (): ReactElement => {
  const [media, setMedia] = useState<PickedMedia | null>(null);
  const [extractedAudio, setExtractedAudio] = useState<ExtractedAudio | null>(
    null,
  );
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [audioLoaded, setAudioLoaded] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const soundRef = useRef<Sound | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    Sound.setCategory('Playback');
    return () => {
      soundRef.current?.stop();
      soundRef.current?.release();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const resetAudioStates = (): void => {
    setExtractedAudio(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setAudioLoaded(false);
    soundRef.current?.stop();
    soundRef.current?.release();
    soundRef.current = null;
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const clearMedia = (): void => {
    setMedia(null);
    resetAudioStates();
  };

  const handlePickGallery = async (): Promise<void> => {
    const perm = await requestPhotoLibraryPermission();
    if (!perm.granted)
      return Alert.alert(
        'Permission Required',
        'Please grant photo library access.',
      );
    const picked = await pickFromGallery();
    if (picked) {
      setMedia(picked);
      resetAudioStates();
    }
  };

  const handlePickCamera = async (): Promise<void> => {
    const perm = await requestCameraPermission();
    if (!perm.granted)
      return Alert.alert('Permission Required', 'Please grant camera access.');
    const picked = await pickFromCamera();
    if (picked) {
      setMedia(picked);
      resetAudioStates();
    }
  };

  const loadAudio = (audioPath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      soundRef.current?.release();
      const sound = new Sound(audioPath, '', error => {
        if (error) return reject(error);
        soundRef.current = sound;
        setAudioLoaded(true);
        resolve();
      });
    });
  };

  const handleExtractAudio = async (): Promise<void> => {
    console.log('handleExtractAudio called');
    if (!media || !isVideo(media.mime)) {
      console.warn('Invalid Media selected:', media);
      return Alert.alert(
        'Invalid Media',
        'Please select a video to extract audio.',
      );
    }

    console.log('Media is valid:', media);

    setIsExtracting(true);
    try {
      // Remove file:// prefix
      const filePath = media.path.replace('file://', '');
      console.log('Using file path for extraction:', filePath);

      // Optional: copy to safe temp path
      // const safePath = `${RNFS.TemporaryDirectoryPath}/${media.filename}`;
      // console.log('Copying file to safe path:', safePath);
      // await RNFS.copyFile(filePath, safePath);

      const result = await AudioExtractor.extractAudio(filePath);
      console.log('Audio extraction result:', result);

      if (!result?.path) {
        console.warn('No audio track found in the video');
        return Alert.alert('Extraction Failed', 'No audio track found.');
      }

      setExtractedAudio({
        ...result,
        format: result.format || 'm4a',
        sampleRate: result.sampleRate || 44100,
      });
      console.log('Extracted audio stored in state:', result);

      await loadAudio(result.path);
      console.log('Audio loaded successfully:', result.path);

      Alert.alert('Success', 'Audio extracted and ready to play!');
    } catch (err: any) {
      console.error('Error during audio extraction:', err);
      Alert.alert('Error', err?.message || 'Failed to extract audio');
    } finally {
      setIsExtracting(false);
      console.log('Extraction finished, isExtracting set to false');
    }
  };

  const handleSaveAudio = async (): Promise<void> => {
    if (!extractedAudio) return;

    setIsSaving(true);

    try {
      // Remove file:// prefix if present
      const path = extractedAudio.path.replace('file://', '');

      if (Platform.OS === 'ios') {
        // Use share sheet on iOS
        await Share.open({
          url: `file://${path}`,
          type: 'audio/m4a',
          filename: `extracted_audio_${Date.now()}.m4a`,
        });

        Alert.alert('Success', 'Audio ready to save or share!');
      } else {
        // Android: save directly to Downloads folder
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `extracted_audio_${timestamp}.m4a`;
        const destinationPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

        await RNFS.copyFile(path, destinationPath);

        Alert.alert(
          'Success',
          `Audio saved successfully!\nLocation: Downloads folder`,
          [{ text: 'OK' }],
        );
      }
    } catch (err: any) {
      if (err?.message !== 'User did not share') {
        console.error('Save error:', err);
        Alert.alert(
          'Error',
          `Failed to save audio: ${err.message || 'Unknown'}`,
        );
      }
    } finally {
      setIsSaving(false);
    }
  };
  const handlePlayPause = (): void => {
    if (!soundRef.current || !audioLoaded) return;
    if (isPlaying) {
      soundRef.current.pause();
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      soundRef.current.play(success => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
      });
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        soundRef.current?.getCurrentTime(sec => setCurrentTime(sec));
      }, 1000);
    }
  };

  const handleStop = (): void => {
    soundRef.current?.stop();
    setIsPlaying(false);
    setCurrentTime(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const renderMediaPreview = () => {
    if (!media) return null;
    if (isVideo(media.mime))
      return (
        <Video
          source={{ uri: media.path }}
          style={styles.preview}
          controls
          paused
        />
      );
    return (
      <Image
        source={{ uri: media.path }}
        style={styles.preview}
        resizeMode="cover"
      />
    );
  };

  const renderAudioPlayer = () => {
    if (!extractedAudio) return null;
    const progress = (currentTime / extractedAudio.duration) * 100 || 0;
    return (
      <View style={styles.audioPlayerContainer}>
        <Text style={styles.audioPlayerTitle}>🎵 Extracted Audio</Text>
        <View style={styles.audioInfoContainer}>
          <Text style={styles.audioInfoText}>
            {formatFileSize(extractedAudio.size)} •{' '}
            {formatTime(extractedAudio.duration)}
          </Text>
          <Text style={styles.audioInfoText}>
            {extractedAudio.sampleRate}Hz •{' '}
            {extractedAudio.format.toUpperCase()}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(extractedAudio.duration)}
        </Text>

        <View style={styles.audioControlsContainer}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handlePlayPause}
            disabled={!audioLoaded}
          >
            <Text style={styles.controlButtonText}>
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleStop}
            disabled={!audioLoaded}
          >
            <Text style={styles.controlButtonText}>⏹️ Stop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.saveButton]}
            onPress={handleSaveAudio}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? '💾 Saving...' : '💾 Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>LivePhoto</Text>
            <Text style={styles.headerSubtitle}>
              Capture moments, explore details
            </Text>
          </View>

          <View style={styles.actionContainer}>
            <Components.ActionButton
              icon="📷"
              title="Gallery"
              subtitle="Choose from photos & videos"
              onPress={handlePickGallery}
            />
            <Components.ActionButton
              icon="📸"
              title="Camera"
              subtitle="Take a new photo/video"
              onPress={handlePickCamera}
            />
          </View>

          {media && isVideo(media.mime) && (
            <TouchableOpacity
              style={styles.extractButton}
              onPress={handleExtractAudio}
              disabled={isExtracting}
            >
              <Text style={styles.extractButtonText}>
                {isExtracting ? '⏳ Extracting Audio...' : '🎵 Extract Audio'}
              </Text>
            </TouchableOpacity>
          )}

          {renderAudioPlayer()}

          <Components.MediaDetails
            media={media}
            clearMedia={clearMedia}
            renderMediaPreview={renderMediaPreview}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default Home;
