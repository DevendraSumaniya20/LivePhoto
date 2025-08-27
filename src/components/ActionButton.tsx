import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { moderateScale } from '../constants/responsive';
import Colors from '../constants/color';
import LinearGradient from 'react-native-linear-gradient';

interface ActionButtonProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

// Curated palette of light colors
const lightColors = [
  '#FFD7D7',
  '#FFE7BA',
  '#D7F9FF',
  '#E0FFD7',
  '#FFF4D7',
  '#F5D7FF',
];

const getRandomColor = () => {
  const index = Math.floor(Math.random() * lightColors.length);
  return lightColors[index];
};

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  title,
  subtitle,
  onPress,
}) => {
  const color = getRandomColor();

  return (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[color, '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconContainer}
      >
        <Text style={styles.iconText}>{icon}</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(12),
  },
  iconText: {
    fontSize: moderateScale(24),
  },
  actionTitle: {
    color: Colors.white,
    fontSize: moderateScale(16),
    fontWeight: '700',
    marginBottom: moderateScale(8),
  },
  actionSubtitle: {
    color: Colors.white,
    fontSize: moderateScale(8),
    opacity: 0.7,
    textAlign: 'center',
  },
});
