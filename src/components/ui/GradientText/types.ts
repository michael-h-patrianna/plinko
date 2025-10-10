/**
 * Shared type definitions for cross-platform GradientText component
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * Gradient configuration for text
 * Only linear gradients are supported for React Native compatibility
 */
export interface GradientConfig {
  /**
   * Array of color stops for the gradient
   * Example: ['#FF0000', '#00FF00', '#0000FF']
   */
  colors: string[];

  /**
   * Angle of the gradient in degrees (default: 135)
   * 0deg = left to right, 90deg = bottom to top, 135deg = diagonal bottom-left to top-right
   */
  angle?: number;
}

/**
 * Props for GradientText component
 * Cross-platform compatible - works on both web and React Native
 */
export interface GradientTextProps {
  /**
   * Text content to display with gradient
   */
  children: ReactNode;

  /**
   * Gradient configuration
   * Only linear gradients supported (no radial/conic for RN compatibility)
   */
  gradient: GradientConfig;

  /**
   * Additional CSS styles (web) or ViewStyle (React Native)
   */
  style?: CSSProperties;

  /**
   * CSS class name (web only, ignored on React Native)
   */
  className?: string;
}
