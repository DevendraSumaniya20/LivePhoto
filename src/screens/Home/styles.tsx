import { StyleSheet } from 'react-native';
import Colors from '../../constants/color';
import { moderateScale } from '../../constants/responsive';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScale(20),
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(32),
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 1.5,
    marginBottom: moderateScale(8),
  },
  headerSubtitle: {
    fontSize: moderateScale(16),
    color: Colors.white,
    opacity: 0.7,
    fontWeight: '400',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: moderateScale(20),
    marginBottom: moderateScale(20),
    gap: moderateScale(16),
  },

  // Extract Audio Button
  extractButton: {
    marginHorizontal: moderateScale(20),
    marginBottom: moderateScale(16),
    padding: moderateScale(16),
    backgroundColor: Colors.primary || '#4A90E2',
    borderRadius: moderateScale(12),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
  },
  extractButtonDisabled: {
    backgroundColor: 'rgba(74, 144, 226, 0.5)',
  },
  extractButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: moderateScale(16),
  },

  scrollView: {
    flex: 1,
  },
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
  preview: {
    width: '100%',
    height: moderateScale(300),
  },

  cardTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.black,
    marginBottom: moderateScale(16),
    textAlign: 'center',
  },

  // Audio Player
  audioPlayerContainer: {
    backgroundColor: Colors.cardBackground || '#1E1E1E',
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginVertical: moderateScale(16),
    borderWidth: 1,
    borderColor: Colors.border || '#333',
  },
  audioPlayerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.white,
    marginBottom: moderateScale(12),
    textAlign: 'center',
  },
  audioInfoContainer: {
    marginBottom: moderateScale(12),
  },
  audioInfoText: {
    fontSize: moderateScale(12),
    color: Colors.textSecondary || 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  audioControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScale(20),
    marginTop: 10,
  },
  controlButton: {
    padding: moderateScale(12),
    borderRadius: moderateScale(50),
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  controlButtonText: {
    fontSize: moderateScale(16),
    color: Colors.white,
  },
  saveButton: {
    backgroundColor: Colors.success || '#28a745',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },

  // Progress Bar
  progressContainer: {
    height: moderateScale(4),
    backgroundColor: Colors.gray || '#555',
    borderRadius: 2,
    marginVertical: moderateScale(10),
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary || '#4A90E2',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    backgroundColor: Colors.primary || '#4A90E2',
    top: -moderateScale(8),
  },
  timeText: {
    fontSize: moderateScale(12),
    color: Colors.textSecondary || 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default styles;
