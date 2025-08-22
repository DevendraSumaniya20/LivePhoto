import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import React, { ReactElement, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const { width: screenWidth } = Dimensions.get('window');

// Helper functions for formatting data
const formatFileSize = (bytes: number, short: boolean = false): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const shortSizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

  return `${size} ${short ? shortSizes[i] : sizes[i]}`;
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return `Today at ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } else if (diffDays === 2) {
    return `Yesterday at ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};

const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  } else if (milliseconds < 60000) {
    return `${(milliseconds / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
};

const formatResolution = (width: number, height: number): string => {
  const megapixels = (width * height) / 1000000;
  if (megapixels >= 1) {
    return `${width} × ${height}\n(${megapixels.toFixed(1)}MP)`;
  }
  return `${width} × ${height}`;
};

const formatMimeType = (mime: string | undefined): string => {
  if (!mime) return 'Unknown';

  const mimeMap: { [key: string]: string } = {
    'image/jpeg': 'JPEG Image',
    'image/jpg': 'JPG Image',
    'image/png': 'PNG Image',
    'image/gif': 'GIF Image',
    'image/webp': 'WebP Image',
    'image/bmp': 'BMP Image',
    'image/tiff': 'TIFF Image',
    'video/mp4': 'MP4 Video',
    'video/mov': 'MOV Video',
    'video/avi': 'AVI Video',
  };

  return (
    mimeMap[mime.toLowerCase()] ||
    mime.split('/')[1]?.toUpperCase() ||
    'Unknown'
  );
};

const formatCropRect = (cropRect: {
  width: number;
  height: number;
  x: number;
  y: number;
}): string => {
  return `Size: ${cropRect.width} × ${cropRect.height}\nPosition: (${cropRect.x}, ${cropRect.y})`;
};

const formatExifKey = (key: string): string => {
  const keyMap: { [key: string]: string } = {
    Make: 'Camera Make',
    Model: 'Camera Model',
    DateTime: 'Date Taken',
    ExposureTime: 'Shutter Speed',
    FNumber: 'Aperture',
    ISO: 'ISO Speed',
    FocalLength: 'Focal Length',
    Flash: 'Flash',
    WhiteBalance: 'White Balance',
    ExposureMode: 'Exposure Mode',
    SceneCaptureType: 'Scene Type',
    GPSLatitude: 'Latitude',
    GPSLongitude: 'Longitude',
    GPSAltitude: 'Altitude',
    Orientation: 'Orientation',
    XResolution: 'X Resolution',
    YResolution: 'Y Resolution',
    ResolutionUnit: 'Resolution Unit',
    Software: 'Software',
    ColorSpace: 'Color Space',
    ExifVersion: 'EXIF Version',
  };

  return keyMap[key] || key.replace(/([A-Z])/g, ' $1').trim();
};

const formatExifValue = (key: string, value: any): string => {
  if (value === null || value === undefined) return 'N/A';

  switch (key) {
    case 'ExposureTime':
      if (typeof value === 'number') {
        return value < 1 ? `1/${Math.round(1 / value)} sec` : `${value} sec`;
      }
      return String(value);

    case 'FNumber':
      return `f/${value}`;

    case 'FocalLength':
      return `${value}mm`;

    case 'ISO':
      return `ISO ${value}`;

    case 'Flash':
      const flashModes: { [key: string]: string } = {
        '0': 'No Flash',
        '1': 'Flash Fired',
        '16': 'No Flash',
        '24': 'Flash Fired (Auto)',
        '25': 'Flash Fired (Auto, Return Light)',
      };
      return flashModes[String(value)] || `Flash Mode ${value}`;

    case 'WhiteBalance':
      return value === '0' ? 'Auto' : value === '1' ? 'Manual' : String(value);

    case 'Orientation':
      const orientations: { [key: string]: string } = {
        '1': 'Normal',
        '2': 'Flip Horizontal',
        '3': 'Rotate 180°',
        '4': 'Flip Vertical',
        '5': 'Rotate 90° CW + Flip',
        '6': 'Rotate 90° CW',
        '7': 'Rotate 90° CCW + Flip',
        '8': 'Rotate 90° CCW',
      };
      return orientations[String(value)] || `Orientation ${value}`;

    case 'DateTime':
    case 'DateTimeOriginal':
    case 'DateTimeDigitized':
      if (typeof value === 'string') {
        try {
          const date = new Date(value.replace(/:/g, '-').replace(' ', 'T'));
          return formatDate(date.getTime());
        } catch {
          return value;
        }
      }
      return String(value);

    case 'GPSLatitude':
    case 'GPSLongitude':
      if (typeof value === 'number') {
        return `${Math.abs(value).toFixed(6)}°${
          value >= 0
            ? key.includes('Latitude')
              ? 'N'
              : 'E'
            : key.includes('Latitude')
            ? 'S'
            : 'W'
        }`;
      }
      return String(value);

    case 'GPSAltitude':
      return `${value}m`;

    case 'XResolution':
    case 'YResolution':
      return `${value} dpi`;

    default:
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2);
      }
      return String(value);
  }
};

const Home = (): ReactElement => {
  const [media, setMedia] = useState<PickedMedia | null>(null);

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

  const clearMedia = (): void => {
    setMedia(null);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>LivePhoto</Text>
            <Text style={styles.headerSubtitle}>
              Capture moments, explore details
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePickGallery}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>📷</Text>
              </View>
              <Text style={styles.actionTitle}>Gallery</Text>
              <Text style={styles.actionSubtitle}>Choose from photos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePickCamera}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>📸</Text>
              </View>
              <Text style={styles.actionTitle}>Camera</Text>
              <Text style={styles.actionSubtitle}>Take a new photo</Text>
            </TouchableOpacity>
          </View>

          {/* Media Preview and Details */}
          {media ? (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.detailsWrap}
              showsVerticalScrollIndicator={false}
            >
              {/* Image Preview Card */}
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewTitle}>Selected Image</Text>
                  <TouchableOpacity
                    onPress={clearMedia}
                    style={styles.clearBtn}
                  >
                    <Text style={styles.clearBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: media.path }}
                    style={styles.preview}
                    resizeMode="cover"
                  />
                </View>
              </View>

              {/* Quick Info Card */}
              <View style={styles.quickInfoCard}>
                <Text style={styles.cardTitle}>Quick Info</Text>
                <View style={styles.quickInfoRow}>
                  <View style={styles.quickInfoItem}>
                    <Text style={styles.quickInfoLabel}>Size</Text>
                    <Text style={styles.quickInfoValue}>
                      {formatFileSize(media.size ?? 0, true)}
                    </Text>
                  </View>
                  <View style={styles.quickInfoItem}>
                    <Text style={styles.quickInfoLabel}>Resolution</Text>
                    <Text style={styles.quickInfoValue}>
                      {formatResolution(media.width, media.height)}
                    </Text>
                  </View>
                  <View style={styles.quickInfoItem}>
                    <Text style={styles.quickInfoLabel}>Format</Text>
                    <Text style={styles.quickInfoValue}>
                      {formatMimeType(media.mime)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Detailed Info Card */}
              <View style={styles.detailsCard}>
                <Text style={styles.cardTitle}>Detailed Information</Text>

                <DetailRow label="File Path" value={media.path} />

                {media.filename && (
                  <DetailRow label="Filename" value={media.filename} />
                )}

                {media.localIdentifier && (
                  <DetailRow
                    label="Local Identifier"
                    value={media.localIdentifier}
                  />
                )}

                <DetailRow
                  label="File Size"
                  value={formatFileSize(media.size ?? 0)}
                />

                <DetailRow
                  label="MIME Type"
                  value={formatMimeType(media.mime)}
                />

                {media.creationDate && (
                  <DetailRow
                    label="Created"
                    value={formatDate(parseInt(media.creationDate) * 1000)}
                  />
                )}

                {media.modificationDate && (
                  <DetailRow
                    label="Modified"
                    value={formatDate(parseInt(media.modificationDate) * 1000)}
                  />
                )}

                {media.duration && (
                  <DetailRow
                    label="Duration"
                    value={formatDuration(media.duration)}
                  />
                )}

                {media.cropRect && (
                  <DetailRow
                    label="Crop Rectangle"
                    value={formatCropRect(media.cropRect)}
                  />
                )}

                {media.sourceURL && (
                  <DetailRow label="Source URL" value={media.sourceURL} />
                )}
              </View>

              {/* EXIF Data Card */}
              {media.exif && Object.keys(media.exif).length > 0 && (
                <View style={styles.exifCard}>
                  <Text style={styles.cardTitle}>EXIF Data</Text>
                  {Object.entries(media.exif).map(([key, value]) => (
                    <DetailRow
                      key={key}
                      label={formatExifKey(key)}
                      value={formatExifValue(key, value)}
                    />
                  ))}
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🖼️</Text>
              <Text style={styles.emptyTitle}>No Image Selected</Text>
              <Text style={styles.emptySubtitle}>
                Choose an image from gallery or take a new photo to see its
                details
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue} numberOfLines={3}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScale(20),
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(32),
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 1.5,
    marginBottom: moderateScale(8),
  },
  headerSubtitle: {
    fontSize: moderateScale(16),
    color: Colors.white,
    opacity: 0.7,
    fontWeight: '400',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: moderateScale(20),
    marginBottom: moderateScale(20),
    gap: moderateScale(16),
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: moderateScale(60),
    height: moderateScale(60),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(12),
  },
  iconText: {
    fontSize: moderateScale(24),
  },
  actionTitle: {
    color: Colors.white,
    fontSize: moderateScale(18),
    fontWeight: '700',
    marginBottom: moderateScale(4),
  },
  actionSubtitle: {
    color: Colors.white,
    fontSize: moderateScale(12),
    opacity: 0.7,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  detailsWrap: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(30),
  },
  previewCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    marginBottom: moderateScale(16),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  previewTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: Colors.black,
  },
  clearBtn: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtnText: {
    color: Colors.black,
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  imageContainer: {
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  preview: {
    width: '100%',
    height: moderateScale(300),
  },
  quickInfoCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    marginBottom: moderateScale(16),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  cardTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.black,
    marginBottom: moderateScale(16),
    textAlign: 'center',
  },
  quickInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickInfoItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickInfoLabel: {
    fontSize: moderateScale(12),
    color: Colors.black,
    opacity: 0.6,
    marginBottom: moderateScale(4),
    fontWeight: '500',
  },
  quickInfoValue: {
    fontSize: moderateScale(14),
    color: Colors.black,
    fontWeight: '600',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    marginBottom: moderateScale(16),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  exifCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: moderateScale(8),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.black,
    minWidth: moderateScale(100),
    marginRight: moderateScale(12),
  },
  detailValue: {
    fontSize: moderateScale(14),
    color: Colors.black,
    opacity: 0.7,
    flex: 1,
    lineHeight: moderateScale(20),
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(40),
  },
  emptyIcon: {
    fontSize: moderateScale(80),
    marginBottom: moderateScale(20),
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: Colors.white,
    marginBottom: moderateScale(12),
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: moderateScale(16),
    color: Colors.white,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: moderateScale(24),
  },
});

export default Home;
