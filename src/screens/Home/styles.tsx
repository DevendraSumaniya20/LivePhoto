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
  },

  // Action buttons container
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: moderateScale(20),
    gap: moderateScale(10),
  },

  // Media preview
  mediaDetailsContainer: {
    marginBottom: moderateScale(20),
  },
  preview: {
    width: '100%',
    height: moderateScale(200),
    borderRadius: moderateScale(12),
    backgroundColor: Colors.black50,
  },

  // Audio extraction buttons
  extractButtonContainer: {
    marginBottom: moderateScale(15),
  },
  extractButton: {
    backgroundColor: Colors.black,
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  extractButtonDisabled: {
    backgroundColor: Colors.white60,
  },
  extractButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  extractButtonIcon: {
    fontSize: moderateScale(20),
    marginRight: moderateScale(8),
  },
  extractButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: moderateScale(16),
  },

  // Audio Player
  audioPlayerContainer: {
    marginBottom: moderateScale(20),
  },
  audioTitle: {
    color: Colors.white,
    fontWeight: 'bold',
    marginBottom: moderateScale(5),
  },

  // Live Photo container
  livePhotoContainer: {
    marginTop: moderateScale(20),
    padding: moderateScale(15),
    backgroundColor: Colors.black50,
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePhotoLabel: {
    color: Colors.white,
    fontWeight: 'bold',
    marginBottom: moderateScale(5),
  },
  livePhotoText: {
    color: Colors.white,
    marginBottom: moderateScale(10),
    textAlign: 'center',
  },
  livePhotoImage: {
    width: moderateScale(200),
    height: moderateScale(200),
    marginBottom: moderateScale(10),
    borderRadius: moderateScale(12),
  },
  livePhotoVideo: {
    width: moderateScale(300),
    height: moderateScale(200),
    borderRadius: moderateScale(12),
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

  compatibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'center',
  },

  compatibilityIcon: {
    fontSize: 16,
    marginRight: 6,
  },

  compatibilityText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // If ActionButton component needs disabled state styling
  actionButtonDisabled: {
    opacity: 0.5,
  },
});

export default styles;
