import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { isVideo, PickedMedia } from '../utils/mediaPicker'; // ✅ import type
import {
  formatCropRect,
  formatDate,
  formatDuration,
  formatExifKey,
  formatExifValue,
  formatFileSize,
  formatMimeType,
  formatResolution,
} from '../utils/FormattingData';
import Components from '.';
import Colors from '../constants/color';
import { moderateScale } from '../constants/responsive';

type MediaDetailsProps = {
  media: PickedMedia | null;
  clearMedia: () => void;
  renderMediaPreview: () => React.ReactNode;
};

const MediaDetails: React.FC<MediaDetailsProps> = ({
  media,
  clearMedia,
  renderMediaPreview,
}) => {
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
      <View style={styles.previewCard}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>
            Selected {isVideo(media.mime) ? 'Video' : 'Image'}
          </Text>
          <TouchableOpacity onPress={clearMedia} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.imageContainer}>{renderMediaPreview()}</View>
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

        <Components.DetailRow label="File Path" value={media.path} />
        {media.filename && (
          <Components.DetailRow label="Filename" value={media.filename} />
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

      {/* EXIF Data Card - Only for images */}
      {!isVideo(media.mime) &&
        media.exif &&
        Object.keys(media.exif).length > 0 && (
          <View style={styles.exifCard}>
            <Text style={styles.cardTitle}>EXIF Data</Text>
            {Object.entries(media.exif).map(([key, value]) => (
              <Components.DetailRow
                key={key}
                label={formatExifKey(key)}
                value={formatExifValue(key, value)}
              />
            ))}
          </View>
        )}
    </ScrollView>
  );
};

export default MediaDetails;

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
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
  preview: { width: '100%', height: moderateScale(300) },
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
  quickInfoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickInfoItem: { alignItems: 'center', flex: 1 },
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
