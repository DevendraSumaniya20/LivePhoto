import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  moderateHeight,
  moderateScale,
  moderateWidth,
} from '../../constants/responsive';
import Colors from '../../constants/color';

const styles = StyleSheet.create({
  // Safe area & scroll
  safeArea: {
    flex: 1,
    backgroundColor: Colors.error,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(14),
    paddingBottom: moderateScale(20),
  },

  // Header
  header: {
    width: '100%',
    marginBottom: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: Colors.white,
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    marginBottom: moderateScale(5),
    textAlign: 'center',
  },
  headerSubtitle: {
    color: Colors.white,
    fontSize: moderateScale(14),
    opacity: 0.8,
    textAlign: 'center',
  },

  // Media preview
  mediaDetailsContainer: {
    marginBottom: moderateScale(20),
  },
  preview: {
    height: moderateHeight(120),
    borderRadius: moderateScale(12),
    width: moderateWidth(120),
  },

  // Audio extraction buttons
  extractButton: {
    backgroundColor: Colors.primary,
    paddingVertical: moderateScale(15),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(15),
    width: '70%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  extractButtonDisabled: {
    backgroundColor: Colors.white60,
    opacity: 0.6,
  },
  extractButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  extractButtonIcon: {
    fontSize: moderateScale(24),
    marginRight: moderateScale(10),
  },
  extractButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: moderateScale(16),
    textAlign: 'center',
  },

  // Audio Player
  audioPlayerContainer: {
    width: '90%',
    alignItems: 'center',
    marginBottom: moderateScale(20),
    padding: moderateScale(15),
    backgroundColor: Colors.black50,
    borderRadius: moderateScale(12),
  },
  audioTitle: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: moderateScale(16),
    marginBottom: moderateScale(10),
    textAlign: 'center',
  },

  // Live Photo container
  livePhotoContainer: {
    flex: 1,
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(10),
  },
  livePhotoHeader: {
    alignItems: 'center',
    marginBottom: moderateScale(20),
    paddingVertical: moderateScale(15),
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray300,
  },
  livePhotoTitle: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
  },
  livePhotoSubtitle: {
    fontSize: moderateScale(14),
    color: Colors.gray300,
    textAlign: 'center',
    marginTop: moderateScale(5),
  },
  livePhotoSection: {
    marginBottom: moderateScale(25),
    backgroundColor: Colors.black50,
    borderRadius: moderateScale(12),
    padding: moderateScale(15),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: Colors.white,
    marginBottom: moderateScale(12),
  },
  livePhotoImageContainer: {
    alignItems: 'center',
    borderRadius: moderateScale(8),
    overflow: 'hidden',
  },
  livePhotoImage: {
    borderRadius: moderateScale(8),
    backgroundColor: Colors.black,
  },
  livePhotoVideoContainer: {
    alignItems: 'center',
    borderRadius: moderateScale(8),
    overflow: 'hidden',
  },
  livePhotoVideo: {
    borderRadius: moderateScale(8),
    backgroundColor: Colors.black,
  },

  // Play Button
  playButton: {
    marginTop: moderateScale(10),
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(20),
  },
  playButtonText: {
    color: Colors.white,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },

  // Audio info
  audioInfoContainer: {
    backgroundColor: Colors.black,
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
  },
  audioInfo: {
    color: Colors.gray300,
    fontSize: moderateScale(12),
    fontFamily: 'monospace',
  },

  // Transcription Container
  transcriptionContainer: {
    backgroundColor: Colors.black,
    padding: moderateScale(15),
    borderRadius: moderateScale(8),
    minHeight: moderateScale(60),
  },
  transcriptionText: {
    color: Colors.white,
    fontSize: moderateScale(16),
    lineHeight: moderateScale(24),
    textAlign: 'left',
  },
  noTranscriptionText: {
    color: Colors.gray300,
    fontSize: moderateScale(14),
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.black80,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: Colors.white,
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },

  // Bottom spacing
  bottomSpacing: {
    height: moderateScale(30),
  },

  // Video container
  videoContainer: {
    width: '90%',
    position: 'relative',
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    backgroundColor: Colors.black,
    alignSelf: 'center',
  },
  videoLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },

  // Live Photo Player
  livePhotoPlayerContainer: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000000',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  livePhotoBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  livePhotoBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 0.5,
  },

  // Controls Overlay
  controlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    alignItems: 'center',
  },

  playPauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  playPauseButtonText: {
    fontSize: 24,
  },

  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },

  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },

  timeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },

  // Tap to Play
  tapToPlayContainer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  tapToPlayText: {
    fontSize: 14,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    overflow: 'hidden',
  },

  // Media Information
  mediaInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  infoLabel: {
    fontSize: 16,
    color: '#CCCCCC',
    fontWeight: '500',
    flex: 1,
  },

  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
    flex: 2,
    textAlign: 'right',
  },

  // File Information
  fileInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
  },

  fileInfoRow: {
    marginBottom: 15,
  },

  fileLabel: {
    fontSize: 16,
    color: '#CCCCCC',
    fontWeight: '600',
    marginBottom: 5,
  },

  filePath: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'monospace',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 8,
    lineHeight: 16,
  },
});

export default styles;
