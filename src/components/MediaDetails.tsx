import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

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
import Icons from '../constants/svgPath';
import { PickedLivePhoto, PickedMedia } from '../navigation/types';
import { isVideo } from '../utils/mediaPicker';
import { previewContainerStyle } from '../constants/styles';

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
  const [showQuickInfo, setShowQuickInfo] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<boolean>(true);
  const [showExif, setShowExif] = useState<boolean>(false);
  const [showClearBtn, setShowClearBtn] = useState<boolean>(false);

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
      <View
        style={[
          previewContainerStyle,
          media.width && media.height
            ? { aspectRatio: media.width / media.height }
            : { height: moderateScale(200) }, // fallback height
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1, width: '100%' }}
          activeOpacity={1}
          onPress={() => setShowClearBtn(!showClearBtn)}
        >
          {renderMediaPreview()}
        </TouchableOpacity>

        {showClearBtn && (
          <TouchableOpacity onPress={clearMedia} style={styles.clearBtn}>
            <Icons.Cross
              height={moderateScale(18)}
              width={moderateScale(18)}
              fill={Colors.white}
            />
          </TouchableOpacity>
        )}
      </View>

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
  },
  contentContainer: {
    paddingHorizontal: moderateScale(4),
    paddingBottom: moderateScale(24),
  },

  mediaPreviewContainer: {
    width: '100%', // Full width
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(12),
    position: 'relative',
  },

  clearBtn: {
    position: 'absolute',
    top: moderateScale(14),
    right: moderateScale(8),
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: Colors.error + '50',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  // Media Preview Card
  previewCard: {
    borderRadius: moderateScale(20),
    marginBottom: moderateScale(20),
    overflow: 'hidden',
  },

  imageContainer: {
    height: moderateHeight(30),
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(12),
    flex: 1,
    backgroundColor: Colors.error,
  },

  // Card Toggle
  cardToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(14),
    marginBottom: moderateScale(10),
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardToggleActive: {
    backgroundColor: '#f0f4ff',
  },
  cardTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.black,
  },
  cardTitleActive: {
    color: Colors.primary,
  },
  toggleArrow: {
    fontSize: moderateScale(12),
    color: Colors.black + '80',
  },
  toggleArrowActive: {
    color: Colors.primary,
  },

  // Info Card
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: moderateScale(14),
    borderWidth: 1,
    borderColor: '#eee',
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
    marginBottom: moderateScale(2),
  },
  infoValue: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.black,
  },

  // Detailed / EXIF
  detailsContainer: { gap: moderateScale(2) },
  detailRow: {
    paddingVertical: moderateScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  exifContainer: { gap: moderateScale(4) },
  exifItem: { paddingVertical: moderateScale(10) },
  exifKey: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: moderateScale(2),
  },
  exifValue: {
    fontSize: moderateScale(12),
    color: Colors.black + 'cc',
    lineHeight: moderateScale(16),
  },
  exifDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginTop: moderateScale(8),
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(32),
    paddingVertical: moderateScale(40),
  },
  emptyTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: Colors.black,
    marginBottom: moderateScale(8),
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: moderateScale(14),
    color: Colors.black + '80',
    textAlign: 'center',
    lineHeight: moderateScale(20),
    marginBottom: moderateScale(16),
  },
  emptyHint: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    backgroundColor: Colors.primary + '20',
    borderRadius: moderateScale(20),
  },
  emptyHintText: {
    color: Colors.primary,
    fontSize: moderateScale(13),
    fontWeight: '600',
    textAlign: 'center',
  },
});
