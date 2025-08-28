import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { isVideo, PickedLivePhoto, PickedMedia } from '../utils/mediaPicker';
import {
  formatFileSize,
  formatResolution,
  formatMimeType,
  formatDate,
  formatDuration,
  formatCropRect,
  formatExifKey,
  formatExifValue,
} from '../utils/FormattingData';
import Components from '.';
import Colors from '../constants/color';
import { moderateHeight, moderateScale, scale } from '../constants/responsive';

import LinearGradient from 'react-native-linear-gradient';
import { getGradientProps } from '../utils/gradients';
import Icons from '../constants/svgPath';

type MediaDetailsProps = {
  media: PickedMedia | PickedLivePhoto | null;
  clearMedia: () => void;
  renderMediaPreview: () => React.ReactNode;
};

const MediaDetails: React.FC<MediaDetailsProps> = ({
  media,
  clearMedia,
  renderMediaPreview,
}) => {
  const [showQuickInfo, setShowQuickInfo] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [showExif, setShowExif] = useState(false);

  if (!media) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🖼️</Text>
        <Text style={styles.emptyTitle}>No Media Selected</Text>
        <Text style={styles.emptySubtitle}>
          Choose an image or video from gallery or capture new media to see its
          details
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.detailsWrap}
      showsVerticalScrollIndicator={false}
    >
      {/* Media Preview Card */}
      <LinearGradient {...getGradientProps()} style={styles.previewCard}>
        <View style={styles.previewHeader}>
          {/* <Text style={styles.previewTitle}>
            Selected {isVideo(media.mime) ? 'Video' : 'Image'}
          </Text> */}
          <TouchableOpacity onPress={clearMedia} style={styles.clearBtn}>
            <Icons.Cross height={moderateScale(20)} width={moderateScale(20)} />
          </TouchableOpacity>
        </View>
        <View style={styles.imageContainer}>{renderMediaPreview()}</View>
      </LinearGradient>

      {/* Quick Info Card */}
      <TouchableOpacity
        onPress={() => setShowQuickInfo(!showQuickInfo)}
        style={styles.cardToggle}
      >
        <Text style={styles.cardTitle}>
          {showQuickInfo ? 'Hide' : 'Show'} Quick Info
        </Text>
      </TouchableOpacity>
      {showQuickInfo && (
        <View style={styles.quickInfoCard}>
          <View style={styles.quickInfoRow}>
            <View style={styles.quickInfoItem}>
              <Text style={styles.quickInfoLabel}>Size</Text>
              <Text style={styles.quickInfoValue}>
                {formatFileSize(media.size ?? 0, true)}
              </Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Text style={styles.quickInfoLabel}>Resolution</Text>
              {media.width != null && media.height != null && (
                <Text style={styles.quickInfoValue}>
                  {formatResolution(media.width, media.height)}
                </Text>
              )}
            </View>
            <View style={styles.quickInfoItem}>
              <Text style={styles.quickInfoLabel}>Format</Text>
              <Text style={styles.quickInfoValue}>
                {formatMimeType(media.mime)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Detailed Info Card */}
      <TouchableOpacity
        onPress={() => setShowDetails(!showDetails)}
        style={styles.cardToggle}
      >
        <Text style={styles.cardTitle}>
          {showDetails ? 'Hide' : 'Show'} Detailed Info
        </Text>
      </TouchableOpacity>
      {showDetails && (
        <View style={styles.detailsCard}>
          <Components.DetailRow label="File Path" value={media.path ?? 'N/A'} />

          {media.path && (
            <Components.DetailRow label="File Path" value={media.path} />
          )}

          {media.localIdentifier && (
            <Components.DetailRow
              label="Local Identifier"
              value={media.localIdentifier}
            />
          )}
          <Components.DetailRow
            label="File Size"
            value={formatFileSize(media.size ?? 0)}
          />
          {media.mime && (
            <Components.DetailRow
              label="MIME Type"
              value={formatMimeType(media.mime)}
            />
          )}
          <Components.DetailRow
            label="Media Type"
            value={isVideo(media.mime) ? 'Video' : 'Image'}
          />
          {media.creationDate && (
            <Components.DetailRow
              label="Created"
              value={formatDate(parseInt(media.creationDate) * 1000)}
            />
          )}
          {media.modificationDate && (
            <Components.DetailRow
              label="Modified"
              value={formatDate(parseInt(media.modificationDate) * 1000)}
            />
          )}
          {media.duration && (
            <Components.DetailRow
              label="Duration"
              value={formatDuration(media.duration)}
            />
          )}
          {media.cropRect && (
            <Components.DetailRow
              label="Crop Rectangle"
              value={formatCropRect(media.cropRect)}
            />
          )}
          {media.sourceURL && (
            <Components.DetailRow label="Source URL" value={media.sourceURL} />
          )}
        </View>
      )}

      {/* EXIF Data Card */}
      {!isVideo(media.mime) &&
        media.exif &&
        Object.keys(media.exif).length > 0 && (
          <>
            <TouchableOpacity
              onPress={() => setShowExif(!showExif)}
              style={styles.cardToggle}
            >
              <Text style={styles.cardTitle}>
                {showExif ? 'Hide' : 'Show'} EXIF Data
              </Text>
            </TouchableOpacity>
            {showExif && (
              <View style={styles.exifCard}>
                {Object.entries(media.exif).map(([key, value]) => (
                  <Components.DetailRow
                    key={key}
                    label={formatExifKey(key)}
                    value={formatExifValue(key, value)}
                  />
                ))}
              </View>
            )}
          </>
        )}
    </ScrollView>
  );
};

export default MediaDetails;

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  detailsWrap: {
    paddingHorizontal: moderateScale(4),
    paddingBottom: moderateScale(30),
  },
  previewCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(14),
    marginBottom: moderateScale(24),
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
    fontSize: moderateScale(24),
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
    color: Colors.gray800,
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  imageContainer: {
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    height: moderateHeight(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: { width: '100%', height: moderateScale(300) },
  quickInfoCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(10),
    marginBottom: moderateScale(16),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },

  quickInfoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickInfoItem: { alignItems: 'center', flex: 1 },
  quickInfoLabel: {
    fontSize: scale(14),
    color: Colors.black,
    opacity: 0.6,
    marginBottom: moderateScale(6),
    fontWeight: 'bold',
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

  cardTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: Colors.black,
    textAlign: 'center',
  },

  cardToggle: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(10),
    marginBottom: moderateScale(8),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
