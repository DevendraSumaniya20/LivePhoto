import { StyleSheet } from 'react-native';
import { moderateScale } from '../../constants/responsive';
import Colors from '../../constants/color';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(20),
    paddingBottom: moderateScale(40),
  },
  header: {
    alignItems: 'center',
    marginBottom: moderateScale(40),
    paddingVertical: moderateScale(20),
  },
  headerTitle: {
    color: Colors.white,
    fontSize: moderateScale(32),
    fontWeight: '700',
    letterSpacing: moderateScale(1.2),
    marginBottom: moderateScale(8),
    textAlign: 'center',
  },
  headerSubtitle: {
    color: Colors.white60,
    fontSize: moderateScale(16),
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: moderateScale(16),
    letterSpacing: moderateScale(0.5),
  },
  compatibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(25),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  compatibilityIcon: {
    fontSize: moderateScale(18),
    marginRight: moderateScale(8),
  },
  compatibilityText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    letterSpacing: moderateScale(0.3),
  },
  actionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingVertical: moderateScale(20),
  },
  actionButtonWrapper: {
    width: '48%',
    marginBottom: moderateScale(12),
    marginRight: '4%',
  },
  actionContainerLarge: {
    maxWidth: moderateScale(400),
    alignSelf: 'center',

    width: '100%',
  },
  actionButtonDisabled: {
    opacity: 0.4,
    transform: [{ scale: 0.95 }],
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: Colors.white,
    fontSize: moderateScale(18),
    fontWeight: '600',
    textAlign: 'center',
    marginTop: moderateScale(16),
    letterSpacing: moderateScale(0.5),
  },
  loadingSpinner: {
    marginBottom: moderateScale(16),
  },
  bottomSpacing: {
    height: moderateScale(20),
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: moderateScale(200),
    opacity: 0.1,
  },
  shadowLarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  statusIndicator: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    marginRight: moderateScale(8),
  },
  statusSupported: {
    backgroundColor: '#4CAF50',
  },
  statusLimited: {
    backgroundColor: '#FF9800',
  },
  statusChecking: {
    backgroundColor: '#999',
  },
});

export default styles;
