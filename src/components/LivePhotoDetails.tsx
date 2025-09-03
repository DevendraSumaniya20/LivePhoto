import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Video from 'react-native-video';
import Components from '.';
import Colors from '../constants/color';
import { moderateScale, scale } from '../constants/responsive';
import Icons from '../constants/svgPath';
import { LivePhotoResult } from '../navigation/types';
import { previewContainerStyle } from '../constants/styles';
import {
  formatResolution,
  formatMimeType,
  formatDate,
  formatDuration,
} from '../utils/FormattingData';

interface ProcessedAudio {
  path: string;
  size: number;
  duration: number;
  format: string;
  sampleRate: number;
  processed: boolean;
}

type LivePhotoDetailsProps = {
  livePhotoResult: LivePhotoResult;
  clearMedia: () => void;

  // Audio handling
  livePhotoCleanedAudio: ProcessedAudio | null;
  isProcessingLivePhotoAudio: boolean;
  onProcessLivePhotoAudio: () => Promise<void>;

  // UI renderers
  renderAudioProcessingButton: (
    isVideoFile: boolean,
    processedAudio: ProcessedAudio | null,
    isProcessing: boolean,
    onProcess: () => void,
  ) => React.ReactNode;

  renderEnhancedAudioPlayer: (
    title: string,
    audioData: ProcessedAudio,
    icon: string,
  ) => React.ReactNode;
};

const LivePhotoDetails: React.FC<LivePhotoDetailsProps> = ({
  livePhotoResult,
  clearMedia,
  livePhotoCleanedAudio,
  isProcessingLivePhotoAudio,
  onProcessLivePhotoAudio,
  renderAudioProcessingButton,
  renderEnhancedAudioPlayer,
}) => {
  const [showQuickInfo, setShowQuickInfo] = useState(true);
  const [showPhotoDetails, setShowPhotoDetails] = useState(false);
  const [showVideoDetails, setShowVideoDetails] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);
  const [showClearBtn, setShowClearBtn] = useState(false);

  if (!livePhotoResult) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No Live Photo Selected</Text>
        <Text style={styles.emptySubtitle}>
          Choose a Live Photo from your gallery to explore its components and
          details.
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
          <Text style={styles.infoLabel}>Resolution</Text>
          <Text style={styles.infoValue}>
            {formatResolution(
              livePhotoResult.pixelWidth,
              livePhotoResult.pixelHeight,
            )}
          </Text>
        </View>

        {livePhotoResult.duration && (
          <View style={styles.quickInfoItem}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>
              {formatDuration(livePhotoResult.duration)}
            </Text>
          </View>
        )}

        <View style={styles.quickInfoItem}>
          <Text style={styles.infoLabel}>Components</Text>
          <Text style={styles.infoValue}>Photo + Video</Text>
        </View>
      </View>
    </View>
  );

  const renderLivePhotoPreview = () => (
    <View style={styles.previewContainer}>
      {/* Still Image */}
      {livePhotoResult.photo && (
        <View style={styles.componentPreview}>
          <View
            style={[
              previewContainerStyle,
              {
                aspectRatio:
                  livePhotoResult.pixelWidth / livePhotoResult.pixelHeight,
                marginBottom: moderateScale(8),
              },
            ]}
          >
            <TouchableOpacity
              style={{ flex: 1, width: '100%' }}
              activeOpacity={1}
              onPress={() => setShowClearBtn(!showClearBtn)}
            >
              <Image
                source={{ uri: livePhotoResult.photo }}
                style={{ flex: 1, width: '100%' }}
                resizeMode="cover"
              />
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

            <View style={styles.componentBadge}>
              <Text style={styles.componentBadgeText}>PHOTO</Text>
            </View>
          </View>
        </View>
      )}

      {/* Video */}
      {livePhotoResult.video && (
        <View style={styles.componentPreview}>
          <View
            style={[
              previewContainerStyle,
              {
                aspectRatio:
                  livePhotoResult.pixelWidth / livePhotoResult.pixelHeight,
                marginBottom: moderateScale(8),
              },
            ]}
          >
            <Video
              source={{ uri: livePhotoResult.video }}
              style={{ flex: 1, width: '100%' }}
              resizeMode="cover"
              repeat
              muted={false}
              controls
              paused
            />

            <View
              style={[
                styles.componentBadge,
                { backgroundColor: Colors.primary },
              ]}
            >
              <Text style={styles.componentBadgeText}>LIVE</Text>
            </View>
          </View>

          {/* Audio Processing Button */}
          <View style={styles.audioExtractionSection}>
            {renderAudioProcessingButton(
              true,
              livePhotoCleanedAudio,
              isProcessingLivePhotoAudio,
              onProcessLivePhotoAudio,
            )}
          </View>
        </View>
      )}
    </View>
  );

  const renderPhotoDetails = () => (
    <View style={styles.infoCard}>
      <View style={styles.detailsContainer}>
        {livePhotoResult.photo && (
          <Components.DetailRow
            label="Photo Path"
            value={livePhotoResult.photo}
          />
        )}
        {livePhotoResult.filenamePhoto && (
          <Components.DetailRow
            label="Photo Filename"
            value={livePhotoResult.filenamePhoto}
          />
        )}
        {livePhotoResult.photoMime && (
          <Components.DetailRow
            label="Photo MIME Type"
            value={formatMimeType(livePhotoResult.photoMime)}
          />
        )}
        <Components.DetailRow
          label="Resolution"
          value={formatResolution(
            livePhotoResult.pixelWidth,
            livePhotoResult.pixelHeight,
          )}
        />
      </View>
    </View>
  );

  const renderVideoDetails = () => (
    <View style={styles.infoCard}>
      <View style={styles.detailsContainer}>
        {livePhotoResult.video && (
          <Components.DetailRow
            label="Video Path"
            value={livePhotoResult.video}
          />
        )}
        {livePhotoResult.filenameVideo && (
          <Components.DetailRow
            label="Video Filename"
            value={livePhotoResult.filenameVideo}
          />
        )}
        {livePhotoResult.videoMime && (
          <Components.DetailRow
            label="Video MIME Type"
            value={formatMimeType(livePhotoResult.videoMime)}
          />
        )}
        {livePhotoResult.duration && (
          <Components.DetailRow
            label="Duration"
            value={formatDuration(livePhotoResult.duration)}
          />
        )}
      </View>
    </View>
  );

  const renderMetadataDetails = () => (
    <View style={styles.infoCard}>
      <View style={styles.detailsContainer}>
        {livePhotoResult.creationDate && (
          <Components.DetailRow
            label="Created"
            value={formatDate(livePhotoResult.creationDate * 1000)}
          />
        )}
        {livePhotoResult.modificationDate && (
          <Components.DetailRow
            label="Modified"
            value={formatDate(livePhotoResult.modificationDate * 1000)}
          />
        )}
        {livePhotoResult.location?.latitude &&
          livePhotoResult.location?.longitude && (
            <>
              <Components.DetailRow
                label="Latitude"
                value={livePhotoResult.location.latitude.toFixed(6)}
              />
              <Components.DetailRow
                label="Longitude"
                value={livePhotoResult.location.longitude.toFixed(6)}
              />
              {livePhotoResult.location.altitude !== undefined && (
                <Components.DetailRow
                  label="Altitude"
                  value={`${Math.round(livePhotoResult.location.altitude)}m`}
                />
              )}
            </>
          )}
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {renderLivePhotoPreview()}

      {renderToggleCard('Quick Info', showQuickInfo, () =>
        setShowQuickInfo(!showQuickInfo),
      )}
      {showQuickInfo && renderQuickInfoCard()}

      {renderToggleCard('Photo Details', showPhotoDetails, () =>
        setShowPhotoDetails(!showPhotoDetails),
      )}
      {showPhotoDetails && renderPhotoDetails()}

      {renderToggleCard('Video Details', showVideoDetails, () =>
        setShowVideoDetails(!showVideoDetails),
      )}
      {showVideoDetails && renderVideoDetails()}

      {renderToggleCard('Metadata', showMetadata, () =>
        setShowMetadata(!showMetadata),
      )}
      {showMetadata && renderMetadataDetails()}

      {/* Processed Audio Player */}
      {livePhotoCleanedAudio &&
        renderEnhancedAudioPlayer('Cleaned Audio', livePhotoCleanedAudio, '✨')}
    </ScrollView>
  );
};

export default LivePhotoDetails;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: moderateScale(4),
    paddingBottom: moderateScale(24),
  },

  previewContainer: {
    marginBottom: moderateScale(12),
  },

  componentPreview: {
    marginBottom: moderateScale(16),
  },

  componentBadge: {
    position: 'absolute',
    top: moderateScale(10),
    left: moderateScale(10),
    backgroundColor: Colors.error,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
  },

  componentBadgeText: {
    color: Colors.white,
    fontSize: moderateScale(10),
    fontWeight: '700',
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

  audioExtractionSection: {
    marginTop: moderateScale(8),
  },

  // Card Toggle (same as MediaDetails)
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

  // Info Card (same as MediaDetails)
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

  // Detailed info (same as MediaDetails)
  detailsContainer: { gap: moderateScale(2) },
  detailRow: {
    paddingVertical: moderateScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  // Audio Section
  audioSection: {
    marginBottom: moderateScale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.black,
    marginBottom: moderateScale(12),
    marginLeft: moderateScale(4),
  },

  // Transcription
  transcriptionContainer: {
    position: 'relative',
  },
  transcriptionText: {
    fontSize: moderateScale(14),
    color: Colors.black,
    lineHeight: moderateScale(20),
    marginBottom: moderateScale(12),
  },
  copyButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(16),
    alignSelf: 'flex-end',
  },
  copyButtonText: {
    fontSize: moderateScale(12),
    color: '#666',
    fontWeight: '600',
  },

  // Empty State (same as MediaDetails)
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
