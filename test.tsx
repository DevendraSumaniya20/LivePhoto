import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { NativeModules } from 'react-native';

// LivePhotoManager module interface
interface LivePhotoResult {
  photo: string;
  video: string;
  audio?: string;
  transcription?: string;
  localIdentifier: string;
  creationDate: number;
  modificationDate: number;
  location: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
    timestamp?: number;
  };
  duration: number;
  pixelWidth: number;
  pixelHeight: number;
}

interface LivePhotoManagerInterface {
  pickLivePhoto(): Promise<LivePhotoResult>;
  checkDeviceCompatibility(): Promise<{
    isSupported: boolean;
    platform: string;
    version: string;
  }>;
  testMethod(): Promise<{ status: string; timestamp: number }>;
  showLivePhoto(localIdentifier: string): Promise<{ status: string }>;
  hideLivePhoto(): void;
}

const { LivePhotoManager } = NativeModules as {
  LivePhotoManager: LivePhotoManagerInterface;
};

const Home: React.FC = () => {
  const [livePhoto, setLivePhoto] = useState<LivePhotoResult | null>(null);

  const pickLivePhoto = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Working', 'Live Photos are only supported on iOS');
      return;
    }

    try {
      const result = await LivePhotoManager.pickLivePhoto();
      setLivePhoto(result);

      // Automatically display the Live Photo after picking
      await LivePhotoManager.showLivePhoto(result.localIdentifier);

      Alert.alert('Working', 'Live Photo picked and displayed successfully');
    } catch (err: any) {
      Alert.alert('Not Working', err.message || 'Failed to pick Live Photo');
    }
  };

  const hideLivePhoto = () => {
    try {
      LivePhotoManager.hideLivePhoto();
      Alert.alert('Working', 'Live Photo hidden successfully');
    } catch (err) {
      Alert.alert('Not Working', 'Failed to hide Live Photo');
    }
  };

  const checkCompatibility = async () => {
    try {
      const result = await LivePhotoManager.checkDeviceCompatibility();
      Alert.alert(
        'Working',
        `Device Compatibility:\nSupported: ${result.isSupported}\nPlatform: ${result.platform}\nOS Version: ${result.version}`,
      );
    } catch (err) {
      Alert.alert('Not Working', 'Failed to check device compatibility');
    }
  };

  const testModule = async () => {
    try {
      const result = await LivePhotoManager.testMethod();
      Alert.alert(
        'Working',
        `Test Module:\nStatus: ${result.status}\nTimestamp: ${result.timestamp}`,
      );
    } catch (err) {
      Alert.alert('Not Working', 'Test Module failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Photo Module Home</Text>
      <Button title="Pick Live Photo" onPress={pickLivePhoto} />
      <Button title="Hide Live Photo" onPress={hideLivePhoto} />
      <Button title="Check Compatibility" onPress={checkCompatibility} />
      <Button title="Test Module" onPress={testModule} />

      {livePhoto && (
        <View style={styles.previewContainer}>
          <Text style={styles.label}>Still Image:</Text>
          <Image
            source={{ uri: `file://${livePhoto.photo}` }}
            style={styles.image}
          />
          <Text style={styles.label}>Video Path: {livePhoto.video}</Text>
          {livePhoto.audio ? (
            <Text style={styles.label}>Audio Path: {livePhoto.audio}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  previewContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginTop: 10,
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 10,
    borderRadius: 10,
  },
});
