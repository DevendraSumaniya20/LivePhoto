import { StyleSheet, Dimensions, Platform } from 'react-native';
import Colors from '../../constants/color';
import { moderateScale } from '../../constants/responsive';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    width: screenWidth - 40,
    height: (screenWidth - 40) * 0.56, // 16:9 ratio
    borderRadius: 12,
    backgroundColor: Colors.gray800,
    marginBottom: 10,
  },

  mediaDetailsContainer: {
    marginTop: 20,
  },

  extractButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
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
    marginTop: 15,
  },
  audioTitle: {
    color: Colors.white,
    fontSize: moderateScale(14),
    marginBottom: 8,
  },

  // Live Photo
  livePhotoContainer: {
    marginBottom: 20,
  },
  livePhotoHeader: {
    marginBottom: 10,
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  livePhotoImage: {
    borderRadius: 12,
  },
  livePhotoVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 12,
  },
  livePhotoBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
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
    borderRadius: 30,
    padding: 15,
  },
  playPauseButtonText: {
    fontSize: moderateScale(24),
    color: Colors.white,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.gray300,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.primary,
  },
  timeText: {
    color: Colors.white,
    fontSize: moderateScale(12),
    textAlign: 'right',
  },
  tapToPlayContainer: {
    marginTop: 10,
  },
  tapToPlayText: {
    color: Colors.gray300,
    fontSize: moderateScale(12),
  },
});

export default styles;
