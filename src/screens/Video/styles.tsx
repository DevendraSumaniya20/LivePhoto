import { StyleSheet } from 'react-native';
import { moderateScale } from '../../constants/responsive';
import Colors from '../../constants/color';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  scrollContent: {
    padding: moderateScale(20),
    paddingBottom: moderateScale(40),
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(20),
  },
  headerTitle: {
    color: Colors.white,
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: Colors.gray300,
    fontSize: moderateScale(12),
  },

  // Media preview
  preview: {
    width: '100%',
    aspectRatio: 16 / 9, // keeps 16:9 ratio dynamically
    borderRadius: moderateScale(12),
    backgroundColor: Colors.gray800,
    marginBottom: moderateScale(10),
  },

  mediaDetailsContainer: {
    marginTop: moderateScale(20),
  },

  extractButton: {
    backgroundColor: Colors.primary,
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(20),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    marginVertical: moderateScale(10),
  },
  extractButtonDisabled: {
    backgroundColor: Colors.gray300,
  },
  extractButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  extractButtonText: {
    color: Colors.white,
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },

  // Audio players
  audioPlayerContainer: {
    marginTop: moderateScale(15),
  },
  audioTitle: {
    color: Colors.white,
    fontSize: moderateScale(14),
    marginBottom: moderateScale(8),
  },

  // Live Photo
  livePhotoContainer: {
    marginBottom: moderateScale(20),
  },
  livePhotoHeader: {
    marginBottom: moderateScale(10),
  },
  livePhotoTitle: {
    color: Colors.white,
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
  livePhotoSubtitle: {
    color: Colors.gray300,
    fontSize: moderateScale(12),
  },
  locationText: {
    color: Colors.gray300,
    fontSize: moderateScale(12),
  },
  livePhotoSection: {
    position: 'relative',
    alignItems: 'center',
  },
  livePhotoPlayerContainer: {
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  livePhotoImage: {
    borderRadius: moderateScale(12),
  },
  livePhotoVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: moderateScale(12),
  },
  livePhotoBadge: {
    position: 'absolute',
    top: moderateScale(10),
    left: moderateScale(10),
    backgroundColor: Colors.error,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(6),
  },
  livePhotoBadgeText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: moderateScale(10),
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: moderateScale(30),
    padding: moderateScale(15),
  },
  playPauseButtonText: {
    fontSize: moderateScale(24),
    color: Colors.white,
  },
  progressContainer: {
    position: 'absolute',
    bottom: moderateScale(10),
    left: moderateScale(10),
    right: moderateScale(10),
  },
  progressBar: {
    height: moderateScale(4),
    backgroundColor: Colors.gray300,
    borderRadius: moderateScale(2),
    overflow: 'hidden',
    marginBottom: moderateScale(4),
  },
  progressFill: {
    height: moderateScale(4),
    backgroundColor: Colors.primary,
  },
  timeText: {
    color: Colors.white,
    fontSize: moderateScale(12),
    textAlign: 'right',
  },
  tapToPlayContainer: {
    marginTop: moderateScale(10),
  },
  tapToPlayText: {
    color: Colors.gray300,
    fontSize: moderateScale(12),
  },
  livePhotoButton: {
    backgroundColor: Colors.primary,
    marginTop: moderateScale(10),
  },

  hideLivePhotoButton: {
    backgroundColor: Colors.error,
    marginTop: moderateScale(8),
  },

  componentPreview: {
    marginTop: moderateScale(20),
    marginBottom: moderateScale(15),
  },

  componentTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: Colors.white,
    marginBottom: moderateScale(8),
  },

  componentInfo: {
    fontSize: moderateScale(14),
    color: Colors.gray200,
    fontStyle: 'italic',
  },

  transcriptionContainer: {
    marginTop: moderateScale(20),
    padding: moderateScale(15),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: moderateScale(8),
  },

  transcriptionText: {
    fontSize: moderateScale(14),
    color: Colors.white,
    lineHeight: moderateScale(20),
  },
  livePhotoMetadataContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: moderateScale(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Metadata Section (label + value)
  metadataSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: moderateScale(10),
    paddingVertical: moderateScale(4),
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },

  metadataLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: Colors.white80,
    flex: 1,
    marginRight: moderateScale(12),
  },

  metadataValue: {
    fontSize: moderateScale(13),
    color: Colors.white,
    flex: 2,
    textAlign: 'right',
    flexWrap: 'wrap',
  },

  headerCard: {
    backgroundColor: '#fff',
    marginHorizontal: moderateScale(16),
    marginTop: moderateScale(16),
    marginBottom: moderateScale(12),
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(8),
    elevation: 3,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(20),
  },

  livePhotoIcon: {
    width: moderateScale(50),
    height: moderateScale(50),
    backgroundColor: '#007AFF',
    borderRadius: moderateScale(25),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(16),
  },

  livePhotoEmoji: {
    fontSize: moderateScale(24),
    color: '#fff',
  },

  headerText: {
    flex: 1,
  },

  previewSection: {
    marginHorizontal: moderateScale(16),
    marginBottom: moderateScale(16),
  },

  componentCard: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    marginBottom: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(8),
    elevation: 3,
    overflow: 'hidden',
  },

  componentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(20),
  },

  actionButtonText: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },

  videoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
  },

  playButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    backgroundColor: '#34C759',
    borderRadius: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },

  playButtonText: {
    fontSize: moderateScale(16),
  },

  imageContainer: {
    position: 'relative',
  },

  previewImage: {
    width: '100%',
    height: moderateScale(240),
  },

  videoContainer: {
    position: 'relative',
  },

  previewVideo: {
    width: '100%',
    height: moderateScale(280),
  },

  videoOverlay: {
    position: 'absolute',
    top: moderateScale(12),
    right: moderateScale(12),
  },

  videoBadge: {
    backgroundColor: '#FF3B30',
    color: '#fff',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
    fontSize: moderateScale(12),
    fontWeight: '700',
  },

  audioExtractionSection: {
    padding: moderateScale(16),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  audioSection: {
    marginHorizontal: moderateScale(16),
    marginBottom: moderateScale(16),
  },

  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: moderateScale(12),
  },

  metadataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: moderateScale(16),
    marginBottom: moderateScale(8),
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(4),
    elevation: 2,
  },

  expandIcon: {
    fontSize: moderateScale(16),
    color: '#666',
  },

  metadataCard: {
    marginHorizontal: moderateScale(16),
    marginBottom: moderateScale(16),
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(8),
    elevation: 3,
  },

  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: moderateScale(20),
  },

  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: moderateScale(16),
    backgroundColor: Colors.error,
  },

  metadataIcon: {
    fontSize: moderateScale(20),
    marginRight: moderateScale(12),
    backgroundColor: Colors.errorDark,
  },

  metadataContent: {
    flex: 1,
    backgroundColor: Colors.error,
  },

  locationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: moderateScale(8),
    padding: moderateScale(16),
    marginBottom: moderateScale(16),
  },

  locationTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: moderateScale(8),
  },

  locationCoords: {
    fontSize: moderateScale(14),
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: moderateScale(4),
  },

  locationAltitude: {
    fontSize: moderateScale(12),
    color: '#666',
    marginBottom: moderateScale(12),
  },

  mapButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(20),
    alignSelf: 'flex-start',
  },

  mapButtonText: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },

  fileInfoSection: {
    marginTop: moderateScale(8),
  },

  subsectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: moderateScale(12),
  },

  fileItem: {
    backgroundColor: '#f8f9fa',
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    marginBottom: moderateScale(8),
  },

  fileName: {
    fontSize: moderateScale(12),
    color: '#666',
    fontFamily: 'monospace',
  },

  transcriptionCard: {
    backgroundColor: '#fff',
    marginHorizontal: moderateScale(16),
    marginBottom: moderateScale(16),
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(8),
    elevation: 3,
  },

  transcriptionContent: {
    position: 'relative',
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

  audioPlayerCard: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    marginBottom: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(8),
    elevation: 3,
    overflow: 'hidden',
  },

  audioPlayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  audioPlayerTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#1a1a1a',
  },

  audioPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },

  audioControlButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    backgroundColor: '#f0f0f0',
    borderRadius: moderateScale(18),
    alignItems: 'center',
    justifyContent: 'center',
  },

  audioControlText: {
    fontSize: moderateScale(14),
  },

  waveformContainer: {
    padding: moderateScale(16),
  },

  waveformPlaceholder: {
    height: moderateScale(60),
    backgroundColor: '#f8f9fa',
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },

  waveformText: {
    fontSize: moderateScale(14),
    color: '#666',
    fontStyle: 'italic',
  },
});

export default styles;
