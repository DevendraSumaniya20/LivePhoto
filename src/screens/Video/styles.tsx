import { StyleSheet } from 'react-native';
import { moderateScale } from '../../constants/responsive';
import Colors from '../../constants/color';

const styles = StyleSheet.create({
  // Safe area & scroll
  safeArea: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(50),
  },

  // Header
  header: {
    marginBottom: moderateScale(20),
  },
  headerTitle: {
    color: Colors.white,
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    marginBottom: moderateScale(5),
  },
  headerSubtitle: {
    color: Colors.white,
    fontSize: moderateScale(16),
    opacity: 0.8,
  },
  backButton: {
    color: Colors.white,
    fontSize: moderateScale(16),
    marginBottom: moderateScale(10),
    padding: moderateScale(5),
  },

  // Media preview
  mediaDetailsContainer: {
    marginBottom: moderateScale(20),
  },
  preview: {
    width: '100%',
    height: moderateScale(250),
    borderRadius: moderateScale(12),
    backgroundColor: Colors.black50,
  },

  // Audio extraction buttons
  extractButton: {
    backgroundColor: Colors.black,
    paddingVertical: moderateScale(15),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(15),
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
  },
  extractButtonIcon: {
    fontSize: moderateScale(24),
    marginRight: moderateScale(10),
  },
  extractButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: moderateScale(16),
  },

  // Audio Player
  audioPlayerContainer: {
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
  },

  // Live Photo container
  livePhotoContainer: {
    marginTop: moderateScale(20),
    padding: moderateScale(20),
    backgroundColor: Colors.black50,
    borderRadius: moderateScale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    alignItems: 'center',
  },
  livePhotoLabel: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: moderateScale(16),
    marginBottom: moderateScale(8),
    marginTop: moderateScale(15),
    textAlign: 'center',
  },
  livePhotoText: {
    color: Colors.white,
    fontSize: moderateScale(14),
    marginBottom: moderateScale(15),
    textAlign: 'center',
    lineHeight: moderateScale(20),
    paddingHorizontal: moderateScale(10),
  },
  livePhotoImage: {
    width: moderateScale(250),
    height: moderateScale(250),
    marginBottom: moderateScale(15),
    borderRadius: moderateScale(12),
  },
  livePhotoVideo: {
    width: '100%',
    height: moderateScale(200),
    borderRadius: moderateScale(12),
    marginTop: moderateScale(10),
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
  videoContainer: {
    position: 'relative',
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    backgroundColor: Colors.black,
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

  // Play Button Overlay
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [
      { translateX: -moderateScale(35) },
      { translateY: -moderateScale(35) },
    ],
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },

  playButtonText: {
    fontSize: moderateScale(24),
    color: Colors.white,
  },

  // Media Controls
  mediaControlsContainer: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    marginHorizontal: moderateScale(20),
    marginVertical: moderateScale(16),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },

  mediaControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    borderWidth: 2,
    borderColor: '#007AFF',
  },

  mediaControlIcon: {
    fontSize: moderateScale(20),
    marginRight: moderateScale(12),
  },

  mediaControlText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#007AFF',
  },

  // Live Photo Video Styles
  liveVideoContainer: {
    position: 'relative',
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    backgroundColor: Colors.black,
    marginTop: moderateScale(12),
  },

  liveVideoPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [
      { translateX: -moderateScale(30) },
      { translateY: -moderateScale(30) },
    ],
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },

  // Transcription Container
  transcriptionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginTop: moderateScale(8),
    marginBottom: moderateScale(16),
    borderLeftWidth: moderateScale(4),
    borderLeftColor: '#007AFF',
  },
});

export default styles;
