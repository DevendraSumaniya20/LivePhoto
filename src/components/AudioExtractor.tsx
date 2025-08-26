import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

import { formatFileSize, formatTime } from '../utils/FormattingData';
import { moderateScale } from '../constants/responsive';
import Colors from '../constants/color';

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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    Sound.setCategory('Playback');
    loadAudio(extractedAudio.path);

    return () => {
      soundRef.current?.stop();
      soundRef.current?.release();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [extractedAudio]);

  const loadAudio = (audioPath: string): void => {
    soundRef.current?.release();
    const sound = new Sound(audioPath, '', error => {
      if (error) {
        Alert.alert('Error', 'Failed to load audio.');
        return;
      }
      soundRef.current = sound;
      setAudioLoaded(true);
    });
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

  const handleSaveAudio = async (): Promise<void> => {
    setIsSaving(true);
    try {
      const path = extractedAudio.path.replace('file://', '');
      if (Platform.OS === 'ios') {
        await Share.open({
          url: `file://${path}`,
          type: 'audio/m4a',
          filename: `extracted_audio_${Date.now()}.m4a`,
        });
        Alert.alert('Success', 'Audio ready to save or share!');
      } else {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `extracted_audio_${timestamp}.m4a`;
        const destinationPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
        await RNFS.copyFile(path, destinationPath);
        Alert.alert('Success', `Saved in Downloads folder`);
      }
    } catch (err: any) {
      if (err?.message !== 'User did not share') {
        Alert.alert('Error', err.message || 'Failed to save audio');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const progress = (currentTime / extractedAudio.duration) * 100 || 0;

  return (
    <View style={styles.container}>
      <Text style={styles.audioPlayerTitle}>🎵 Extracted Audio</Text>

      <View style={styles.audioInfoContainer}>
        <Text style={styles.audioInfoText}>
          {formatFileSize(extractedAudio.size)} •{' '}
          {formatTime(extractedAudio.duration)}
        </Text>
        <Text style={styles.audioInfoText}>
          {extractedAudio.sampleRate}Hz • {extractedAudio.format.toUpperCase()}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <Text style={styles.timeText}>
        {formatTime(currentTime)} / {formatTime(extractedAudio.duration)}
      </Text>

      {/* Controls */}
      <View style={styles.audioControlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handlePlayPause}
        >
          <Text style={styles.controlButtonText}>
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handleStop}>
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

export default AudioExtractor;

const styles = StyleSheet.create({
  container: {
    padding: moderateScale(16),
    backgroundColor: Colors.black,
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: Colors.white,
    margin: moderateScale(16),
  },
  audioPlayerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.white,
    marginBottom: moderateScale(12),
    textAlign: 'center',
  },
  audioInfoContainer: {
    marginBottom: moderateScale(12),
  },
  audioInfoText: {
    fontSize: moderateScale(12),
    color: Colors.white,
    textAlign: 'center',
  },
  progressContainer: {
    height: moderateScale(4),
    backgroundColor: Colors.white,
    borderRadius: 2,
    marginVertical: moderateScale(10),
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  timeText: {
    fontSize: moderateScale(12),
    color: Colors.white,
    textAlign: 'center',
    marginBottom: moderateScale(10),
  },
  audioControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScale(20),
    marginTop: moderateScale(10),
  },
  controlButton: {
    padding: moderateScale(12),
    borderRadius: moderateScale(50),
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: moderateScale(16),
    color: Colors.white,
  },
  saveButton: {
    backgroundColor: Colors.white40,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
});
