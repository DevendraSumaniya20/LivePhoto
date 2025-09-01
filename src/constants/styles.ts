import { moderateScale } from './responsive';
import Colors from './color';
import { ViewStyle } from 'react-native';

export const previewContainerStyle: ViewStyle = {
  width: '100%',
  borderRadius: moderateScale(16),
  overflow: 'hidden',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: moderateScale(12),
  position: 'relative' as const,
  backgroundColor: Colors.black + '10',
};

export const previewMediaStyle = {
  width: '100%' as const,
  height: '100%' as const,
  borderRadius: 10,
} as const;
