// utils/scale.ts

import { Dimensions, PixelRatio } from 'react-native';

// Get current screen dimensions
const { width, height } = Dimensions.get('window');

// Guideline sizes are based on a standard ~5" screen mobile device
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

/**
 *
 * Scale based on width
 * @param size - base size (e.g., font size or width in pixels)
 */
const scale = (size: number): number => (width / guidelineBaseWidth) * size;

/**
 * Scale based on height
 * @param size - base size (e.g., height in pixels)
 */
const verticalScale = (size: number): number =>
  (height / guidelineBaseHeight) * size;

/**
 * Scale moderately based on a factor (default is 0.5)
 * @param size - base size
 * @param factor - degree of scaling (0 = no scale, 1 = full scale)
 */
const moderateScale = (size: number, factor = 0.5): number =>
  Math.round(size + (scale(size) - size) * factor);

/**
 * Scale width by percentage of screen width (e.g., 50 for 50%)
 * @param widthPercent - percentage of screen width
 */
const moderateWidth = (widthPercent: number): number => {
  return Math.round(
    PixelRatio.roundToNearestPixel((width * widthPercent) / 100),
  );
};

/**
 * Scale height by percentage of screen height (e.g., 50 for 50%)
 * @param heightPercent - percentage of screen height
 */
const moderateHeight = (heightPercent: number): number => {
  return Math.round(
    PixelRatio.roundToNearestPixel((height * heightPercent) / 100),
  );
};

export { scale, verticalScale, moderateScale, moderateWidth, moderateHeight };
