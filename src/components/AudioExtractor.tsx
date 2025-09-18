import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import Slider from '@react-native-community/slider';
import LinearGradient from 'react-native-linear-gradient';

import { moderateScale } from '../constants/responsive';
import Colors from '../constants/color';
import Icons from '../constants/svgPath';

const { width: screenWidth } = Dimensions.get('window');

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

type ExtractedAudio = {
  path: string;
  size: number;
  duration: number;
  sampleRate: number;
  format: string;
};

type Props = {
  extractedAudio: ExtractedAudio;
};

const AudioExtractor: React.FC<Props> = ({ extractedAudio }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const soundRef = useRef<Sound | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Sound.setCategory('Playback');
    loadAudio(extractedAudio.path);

    // Initial fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      soundRef.current?.stop();
      soundRef.current?.release();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [extractedAudio]);

  // Pulse animation for play button
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying, pulseAnim]);

  const loadAudio = (audioPath: string) => {
    soundRef.current?.release();
    const path =
      Platform.OS === 'ios' ? audioPath : audioPath.replace('file://', '');
    const sound = new Sound(path, undefined, error => {
      if (error) {
        Alert.alert('Error', 'Failed to load audio.');
        return;
      }
      soundRef.current = sound;
      setAudioLoaded(true);
    });
  };

  const handlePlayPause = () => {
    if (!soundRef.current || !audioLoaded) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isPlaying) {
      soundRef.current.pause();
      setIsPlaying(false);
    } else {
      soundRef.current.play(success => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
      });
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        soundRef.current?.getCurrentTime(sec => setCurrentTime(sec));
      }, 500);
    }
  };

  const handleStop = () => {
    soundRef.current?.stop();
    setIsPlaying(false);
    setCurrentTime(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleSaveAudio = async () => {
    setIsSaving(true);
    try {
      const path = extractedAudio.path.replace('file://', '');
      const fileExists = await RNFS.exists(path);

      if (!fileExists) {
        Alert.alert(
          'Error',
          'Audio file not found. Please re-extract the audio.',
        );
        return;
      }

      if (Platform.OS === 'ios') {
        await Share.open({
          url: `file://${path}`,
          type: 'audio/m4a',
          filename: `extracted_audio_${Date.now()}.m4a`,
          title: 'Share Extracted Audio',
        });
        Alert.alert('Success', 'Audio ready to save or share!');
      } else {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `extracted_audio_${timestamp}.m4a`;
        const destinationPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

        const downloadDirExists = await RNFS.exists(RNFS.DownloadDirectoryPath);
        if (!downloadDirExists) {
          await RNFS.mkdir(RNFS.DownloadDirectoryPath);
        }

        await RNFS.copyFile(path, destinationPath);
        Alert.alert(
          'Success',
          `Audio saved as ${fileName} in Downloads folder`,
        );
      }
    } catch (err: any) {
      console.error('Save audio error:', err);
      if (err?.message !== 'User did not share') {
        Alert.alert(
          'Error',
          err.message || 'Failed to save audio. Please try again.',
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeek = (value: number) => {
    soundRef.current?.setCurrentTime(value);
    setCurrentTime(value);
  };

  const fileSizeMB = (extractedAudio.size / (1024 * 1024)).toFixed(1);
  const progressPercent =
    extractedAudio.duration > 0
      ? (currentTime / extractedAudio.duration) * 100
      : 0;

  return (
    <Animated.View
      style={[
        styles.mainContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['#020024', '#090979', '#00D4FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.titleText}>Extracted Audio</Text>
          <View style={styles.audioInfoContainer}>
            <Text style={styles.audioInfoText}>
              {extractedAudio.format} • {fileSizeMB} MB •{' '}
              {(extractedAudio.sampleRate / 1000).toFixed(1)}kHz
            </Text>
          </View>
        </View>

        {/* Waveform Visual Effect */}
        <View style={styles.waveformContainer}>
          {[...Array(20)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.waveformBar,
                {
                  height: isPlaying
                    ? Math.random() * moderateScale(30) + moderateScale(5)
                    : moderateScale(5),
                  backgroundColor:
                    index < progressPercent / 5
                      ? '#fff'
                      : 'rgba(255,255,255,0.3)',
                },
              ]}
            />
          ))}
        </View>

        {/* Time Display */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>Duration</Text>
            <Text style={styles.timeText}>
              {formatTime(extractedAudio.duration)}
            </Text>
          </View>
        </View>

        {/* Enhanced Slider */}
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={extractedAudio.duration}
            value={currentTime}
            minimumTrackTintColor="#ffffff"
            maximumTrackTintColor="rgba(255,255,255,0.3)"
            thumbTintColor="#ffffff"
            onSlidingComplete={handleSeek}
            thumbStyle={styles.sliderThumb}
            trackStyle={styles.sliderTrack}
          />
          {/* Progress indicator */}
          <View
            style={[styles.progressIndicator, { width: `${progressPercent}%` }]}
          />
        </View>

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleStop}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.5)']}
              style={styles.buttonGradient}
            >
              <Icons.Stop
                height={moderateScale(20)}
                width={moderateScale(20)}
              />
            </LinearGradient>
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handlePlayPause}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#3F5EFB', '#FC466B']}
                style={styles.primaryButtonGradient}
              >
                {isPlaying ? (
                  <Icons.Pause
                    height={moderateScale(32)}
                    width={moderateScale(32)}
                  />
                ) : (
                  <Icons.Play
                    height={moderateScale(32)}
                    width={moderateScale(32)}
                  />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSaveAudio}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={
                isSaving
                  ? ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.5)']
                  : ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.55)']
              }
              style={styles.buttonGradient}
            >
              <Icons.Download
                height={moderateScale(20)}
                width={moderateScale(20)}
                style={{ opacity: isSaving ? 0.5 : 1 }}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: audioLoaded ? '#00ff88' : '#ff4757' },
            ]}
          />
          <Text style={styles.statusText}>
            {audioLoaded ? 'Ready to play' : 'Loading...'}
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    // flex: 1, // let it expand inside parent
    // width: '100%', // ensures full width of screen
    borderRadius: moderateScale(14),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },

  gradientContainer: {},

  headerSection: {
    alignItems: 'center',
    marginBottom: moderateScale(24),
    marginTop: moderateScale(16),
  },

  titleText: {
    color: '#ffffff',
    fontSize: moderateScale(16),
    fontWeight: '700',
    marginBottom: moderateScale(8),
  },
  audioInfoContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
  },
  audioInfoText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: moderateScale(8),
    fontWeight: '500',
  },
  waveformContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: moderateScale(40),
    marginBottom: moderateScale(24),
    paddingHorizontal: moderateScale(20),
  },
  waveformBar: {
    width: moderateScale(3),
    borderRadius: moderateScale(2),
    marginHorizontal: moderateScale(1),
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(14),
    paddingHorizontal: moderateScale(8),
  },
  timeText: {
    color: '#ffffff',
    fontSize: moderateScale(16),
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  durationContainer: {
    alignItems: 'flex-end',
  },
  durationText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: moderateScale(10),
    marginBottom: moderateScale(2),
  },
  sliderContainer: {
    position: 'relative',
    marginBottom: moderateScale(32),
    paddingHorizontal: moderateScale(4),
    marginHorizontal: moderateScale(8),
  },
  slider: {
    width: '100%',
    height: moderateScale(40),
  },
  sliderThumb: {
    width: moderateScale(20),
    height: moderateScale(20),
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderTrack: {
    height: moderateScale(6),
    borderRadius: moderateScale(3),
  },
  progressIndicator: {
    position: 'absolute',
    bottom: moderateScale(17),
    left: moderateScale(4),
    height: moderateScale(6),
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: moderateScale(3),
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  primaryButton: {
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonGradient: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonGradient: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(28),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    marginRight: moderateScale(8),
  },
  statusText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
});

export default AudioExtractor;
