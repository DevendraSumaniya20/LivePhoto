import React from 'react';
import { ViewStyle, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { moderateScale } from '../constants/responsive';
import Colors from '../constants/color';
import LinearGradient from 'react-native-linear-gradient';
import { getGradientProps } from '../utils/gradients';

interface ActionButtonProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  disabled = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.actionButton, style, disabled && { opacity: 0.6 }]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <LinearGradient {...getGradientProps()} style={styles.iconContainer}>
        {icon}
      </LinearGradient>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
};

export default ActionButton;

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: moderateScale(12),
  },
  iconContainer: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(12),
  },
  actionTitle: {
    color: Colors.white,
    fontSize: moderateScale(16),
    fontWeight: '700',
    marginBottom: moderateScale(8),
    textAlign: 'center',
  },
  actionSubtitle: {
    color: Colors.white,
    fontSize: moderateScale(12),
    opacity: 0.7,
    textAlign: 'center',
  },
});
