import { StyleSheet } from 'react-native';
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
    backgroundColor: Colors.black,
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
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    marginBottom: moderateScale(5),
    textAlign: 'center',
  },
  headerSubtitle: {
    color: Colors.white,
    fontSize: moderateScale(16),
    opacity: 0.8,
    textAlign: 'center',
  },
  backButton: {
    color: Colors.white,
    fontSize: moderateScale(16),
    padding: moderateScale(5),
  },

  // Media preview
  mediaDetailsContainer: {
    width: '100%',
    // alignItems: 'center',
    marginBottom: moderateScale(20),
  },
  preview: {
    width: '90%',
    height: moderateScale(220),
    borderRadius: moderateScale(12),
    backgroundColor: Colors.gray300,
    marginVertical: moderateScale(10),
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
    width: '90%',
    marginTop: moderateScale(20),
    padding: moderateScale(20),
    backgroundColor: Colors.black50,
    borderRadius: moderateScale(15),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  livePhotoLabel: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: moderateScale(16),
    marginBottom: moderateScale(8),
    textAlign: 'center',
  },
  livePhotoText: {
    color: Colors.white,
    fontSize: moderateScale(14),
    marginBottom: moderateScale(15),
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
  livePhotoImage: {
    width: '90%',
    height: moderateScale(250),
    marginBottom: moderateScale(15),
    borderRadius: moderateScale(12),
  },
  livePhotoVideo: {
    width: '90%',
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

  // Transcription Container
  transcriptionContainer: {
    width: '90%',
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
