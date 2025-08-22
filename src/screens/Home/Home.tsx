import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import React, { ReactElement, useState } from 'react';
import Colors from '../../constants/color';
import { moderateScale } from '../../constants/responsive';
import {
  requestCameraPermission,
  requestPhotoLibraryPermission,
} from '../../utils/permissions';
import {
  pickFromCamera,
  pickFromGallery,
  type PickedMedia,
} from '../../utils/mediaPicker';

const Home = (): ReactElement => {
  const [consented, setConsented] = useState<boolean>(false);
  const [media, setMedia] = useState<PickedMedia | null>(null);

  const handleAccept = async (): Promise<void> => {
    setConsented(true);
  };

  const handlePickGallery = async (): Promise<void> => {
    const perm = await requestPhotoLibraryPermission();
    if (!perm.granted) {
      return;
    }
    const picked = await pickFromGallery();
    if (picked) setMedia(picked);
  };

  const handlePickCamera = async (): Promise<void> => {
    const perm = await requestCameraPermission();
    if (!perm.granted) {
      return;
    }
    const picked = await pickFromCamera();
    if (picked) setMedia(picked);
  };

  return (
    <View style={styles.container}>
      {!consented ? (
        <View style={styles.card}>
          <Text style={styles.title}>Allow access</Text>
          <Text style={styles.subtitle}>
            We need your permission to access camera and photos to pick or take
            a picture.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleAccept}>
            <Text style={styles.primaryBtnText}>Accept</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handlePickGallery}
          >
            <Text style={styles.primaryBtnText}>Pick from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handlePickCamera}
          >
            <Text style={styles.secondaryBtnText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {media && (
        <ScrollView contentContainerStyle={styles.detailsWrap}>
          <Image
            source={{ uri: media.path }}
            style={styles.preview}
            resizeMode="contain"
          />
          <Text style={styles.detailsTitle}>Details</Text>
          <Text style={styles.detail}>Path: {media.path}</Text>
          <Text style={styles.detail}>Size: {media.size ?? 0} bytes</Text>
          <Text style={styles.detail}>MIME: {media.mime ?? 'unknown'}</Text>
          <Text style={styles.detail}>
            Resolution: {media.width} x {media.height}
          </Text>
          {media.filename ? (
            <Text style={styles.detail}>Filename: {media.filename}</Text>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    padding: moderateScale(16),
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: moderateScale(16),
    marginTop: moderateScale(24),
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: Colors.black,
    marginBottom: moderateScale(8),
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: Colors.black80,
    marginBottom: moderateScale(16),
  },
  actions: {
    marginTop: moderateScale(16),
  },
  primaryBtn: {
    backgroundColor: Colors.white,
    paddingVertical: moderateScale(12),
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: moderateScale(12),
  },
  primaryBtnText: {
    color: Colors.black,
    fontWeight: '700',
    fontSize: moderateScale(16),
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: Colors.white,
    paddingVertical: moderateScale(12),
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: moderateScale(16),
  },
  detailsWrap: {
    paddingVertical: moderateScale(16),
  },
  preview: {
    width: '100%',
    height: moderateScale(300),
    backgroundColor: Colors.black10,
    borderRadius: 8,
  },
  detailsTitle: {
    color: Colors.white,
    fontSize: moderateScale(18),
    marginTop: moderateScale(12),
    fontWeight: '700',
  },
  detail: {
    color: Colors.white,
    marginTop: moderateScale(6),
  },
});
