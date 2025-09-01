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
        <Text style={styles.emptyTitle}>No Media Selected</Text>
        <Text style={styles.emptySubtitle}>
          Choose an image or video from your gallery or capture new media to
          explore details.
        </Text>
        <TouchableOpacity style={styles.emptyHint}>
          <Text style={styles.emptyHintText}>Tap to get started</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderToggleCard = (
    title: string,
    show: boolean,
    toggle: () => void,
  ) => (
    <TouchableOpacity
      onPress={toggle}
      style={[styles.cardToggle, show && styles.cardToggleActive]}
      activeOpacity={0.8}
    >
      <Text style={[styles.cardTitle, show && styles.cardTitleActive]}>
        {title}
      </Text>
      <Text style={[styles.toggleArrow, show && styles.toggleArrowActive]}>
        {show ? '▲' : '▼'}
      </Text>
    </TouchableOpacity>
  );

  const renderQuickInfoCard = () => (
    <View style={styles.infoCard}>
      <View style={styles.quickInfoGrid}>
        <View style={styles.quickInfoItem}>
          <Text style={styles.infoLabel}>Size</Text>
          <Text style={styles.infoValue}>
            {formatFileSize(media.size ?? 0, true)}
          </Text>
        </View>

        {media.width && media.height && (
          <View style={styles.quickInfoItem}>
            <Text style={styles.infoLabel}>Resolution</Text>
            <Text style={styles.infoValue}>
              {formatResolution(media.width, media.height)}
            </Text>
          </View>
        )}

        <View style={styles.quickInfoItem}>
          <Text style={styles.infoLabel}>Format</Text>
          <Text style={styles.infoValue}>{formatMimeType(media.mime)}</Text>
        </View>
      </View>
    </View>
  );

  const renderDetailedInfo = () => (
    <View style={styles.infoCard}>
      <View style={styles.detailsContainer}>
        {media.path && (
          <Components.DetailRow
            label="File Path"
            value={media.path}
            style={styles.detailRow}
          />
        )}
        {media.localIdentifier && (
          <Components.DetailRow
            label="Local Identifier"
            value={media.localIdentifier}
            style={styles.detailRow}
          />
        )}
        <Components.DetailRow
          label="File Size"
          value={formatFileSize(media.size ?? 0)}
          style={styles.detailRow}
        />
        {media.mime && (
          <Components.DetailRow
            label="MIME Type"
            value={formatMimeType(media.mime)}
            style={styles.detailRow}
          />
        )}
        <Components.DetailRow
          label="Media Type"
          value={isVideo(media.mime) ? 'Video' : 'Image'}
          style={styles.detailRow}
        />
        {media.creationDate && (
          <Components.DetailRow
            label="Created"
            value={formatDate(parseInt(media.creationDate) * 1000)}
            style={styles.detailRow}
          />
        )}
        {media.modificationDate && (
          <Components.DetailRow
            label="Modified"
            value={formatDate(parseInt(media.modificationDate) * 1000)}
            style={styles.detailRow}
          />
        )}
        {media.duration && (
          <Components.DetailRow
            label="Duration"
            value={formatDuration(media.duration)}
            style={styles.detailRow}
          />
        )}
        {media.cropRect && (
          <Components.DetailRow
            label="Crop Rectangle"
            value={formatCropRect(media.cropRect)}
            style={styles.detailRow}
          />
        )}
        {media.sourceURL && (
          <Components.DetailRow
            label="Source URL"
            value={media.sourceURL}
            style={styles.detailRow}
          />
        )}
      </View>
    </View>
  );

  const renderExifData = () => (
    <View style={styles.infoCard}>
      <View style={styles.exifContainer}>
        {Object.entries(media.exif || {}).map(([key, value], index) => (
          <View key={key} style={styles.exifItem}>
            <Text style={styles.exifKey}>{formatExifKey(key)}</Text>
            <Text style={styles.exifValue}>{formatExifValue(key, value)}</Text>
            {index < Object.entries(media.exif || {}).length - 1 && (
              <View style={styles.exifDivider} />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Media Preview */}
      <LinearGradient {...getGradientProps()} style={styles.previewCard}>
        <View style={styles.previewHeader}>
          <View style={styles.mediaTypeIndicator}>
            <Text style={styles.mediaTypeText}>
              {isVideo(media.mime) ? 'Video' : 'Image'}
            </Text>
          </View>
          <TouchableOpacity onPress={clearMedia} style={styles.clearBtn}>
            <Icons.Cross height={moderateScale(18)} width={moderateScale(18)} />
          </TouchableOpacity>
        </View>
        <View style={styles.imageContainer}>{renderMediaPreview()}</View>
        <View style={styles.previewFooter}>
          <Text style={styles.previewLabel}>Preview</Text>
        </View>
      </LinearGradient>

      {/* Quick Info */}
      {renderToggleCard('Quick Info', showQuickInfo, () =>
        setShowQuickInfo(!showQuickInfo),
      )}
      {showQuickInfo && renderQuickInfoCard()}

      {/* Detailed Info */}
      {renderToggleCard('Detailed Info', showDetails, () =>
        setShowDetails(!showDetails),
      )}
      {showDetails && renderDetailedInfo()}

      {/* EXIF Info */}
      {!isVideo(media.mime) &&
        media.exif &&
        Object.keys(media.exif).length > 0 && (
          <>
            {renderToggleCard('EXIF Data', showExif, () =>
              setShowExif(!showExif),
            )}
            {showExif && renderExifData()}
          </>
        )}
    </ScrollView>
  );
};

export default MediaDetails;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'rgba(240,240,245,1)',
  },
  contentContainer: {
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(30),
    paddingTop: moderateScale(10),
  },
  previewCard: {
    borderRadius: moderateScale(24),
    padding: moderateScale(20),
    marginBottom: moderateScale(24),
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: moderateScale(16),
  },
  mediaTypeIndicator: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(20),
  },
  mediaTypeText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.primary,
  },
  clearBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.05)',
    height: moderateHeight(35),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(16),
  },
  previewFooter: {
    alignItems: 'center',
  },
  previewLabel: {
    color: Colors.black + '80',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  cardToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: moderateScale(12),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  cardToggleActive: {
    backgroundColor: '#f0f4ff',
  },
  cardTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: Colors.black,
  },
  cardTitleActive: {
    color: Colors.primary,
  },
  toggleArrow: {
    fontSize: moderateScale(14),
    color: Colors.black + '80',
  },
  toggleArrowActive: {
    color: Colors.primary,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    marginBottom: moderateScale(16),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  quickInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  quickInfoItem: {
    flex: 1,
    alignItems: 'center',
    minWidth: '30%',
    marginBottom: moderateScale(8),
  },
  infoLabel: {
    fontSize: scale(12),
    color: Colors.black + '80',
    fontWeight: '500',
    marginBottom: moderateScale(4),
  },
  infoValue: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: Colors.black,
  },
  detailsContainer: { gap: moderateScale(2) },
  detailRow: {
    paddingVertical: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  exifContainer: { gap: moderateScale(4) },
  exifItem: { paddingVertical: moderateScale(12) },
  exifKey: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: moderateScale(4),
  },
  exifValue: {
    fontSize: moderateScale(13),
    color: Colors.black + 'cc',
    lineHeight: moderateScale(18),
  },
  exifDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginTop: moderateScale(12),
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(40),
    paddingVertical: moderateScale(60),
  },
  emptyTitle: {
    fontSize: moderateScale(28),
    fontWeight: '800',
    color: Colors.black,
    marginBottom: moderateScale(12),
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: moderateScale(16),
    color: Colors.black + '80',
    textAlign: 'center',
    lineHeight: moderateScale(24),
    marginBottom: moderateScale(24),
  },
  emptyHint: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(10),
    backgroundColor: Colors.primary + '20',
    borderRadius: moderateScale(25),
  },
  emptyHintText: {
    color: Colors.primary,
    fontSize: moderateScale(14),
    fontWeight: '600',
    textAlign: 'center',
  },
});
