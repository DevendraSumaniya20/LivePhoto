import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import Slider from '@react-native-community/slider';

import { moderateScale } from '../constants/responsive';
import Colors from '../constants/color';
import Icons from '../constants/svgPath';

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

  useEffect(() => {
    Sound.setCategory('Playback');
    loadAudio(extractedAudio.path);

    return () => {
      soundRef.current?.stop();
      soundRef.current?.release();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [extractedAudio]);

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

  const handleSeek = (value: number) => {
    soundRef.current?.setCurrentTime(value);
    setCurrentTime(value);
  };

  return (
    <View style={styles.container}>
      {/* Time display */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Text style={styles.timeText}>
          {formatTime(extractedAudio.duration)}
        </Text>
      </View>

      {/* Slider */}
      <Slider
        style={{ width: '100%', height: moderateScale(40) }}
        minimumValue={0}
        maximumValue={extractedAudio.duration}
        value={currentTime}
        minimumTrackTintColor={Colors.primary}
        maximumTrackTintColor="rgba(255,255,255,0.3)"
        thumbTintColor={Colors.primary}
        onSlidingComplete={handleSeek}
      />

      {/* Audio controls */}
      <View style={styles.audioControlsContainer}>
        <TouchableOpacity style={styles.sideButton} onPress={handleStop}>
          <Icons.Stop height={moderateScale(28)} width={moderateScale(28)} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playPauseButton}
          onPress={handlePlayPause}
        >
          {isPlaying ? (
            <Icons.Pause height={moderateScale(40)} width={moderateScale(40)} />
          ) : (
            <Icons.Play height={moderateScale(40)} width={moderateScale(40)} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sideButton}
          onPress={handleSaveAudio}
          disabled={isSaving}
        >
          <Icons.Download
            height={moderateScale(28)}
            width={moderateScale(28)}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: moderateScale(20),
    backgroundColor: Colors.gray200,
    borderRadius: moderateScale(16),
    margin: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: moderateScale(10),
  },
  timeText: {
    color: Colors.white,
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  audioControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: moderateScale(15),
  },
  playPauseButton: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  sideButton: {
    padding: moderateScale(12),
    borderRadius: moderateScale(50),
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AudioExtractor;
