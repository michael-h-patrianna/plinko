/**
 * Shared animation constants for popup/overlay screens
 * Ensures consistent timing and easing across all game views
 * Integrates with theme system for colors and z-indices
 */

/**
 * Standard animation timings for popup entrance/exit
 * All popups use these constants for visual consistency
 */
export const POPUP_ANIMATIONS = {
  // Standard entrance animation for all popups
  entrance: {
    duration: 0.3,
    ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
  },

  // Standard exit animation for all popups
  exit: {
    duration: 0.2,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    exit: { opacity: 0, scale: 0.95 },
  },

  // Overlay background fade timing
  overlayFade: {
    duration: 0.25,
    ease: 'easeInOut' as const,
  },
} as const;

/**
 * Standard padding for popup content (20px as per design requirements)
 */
export const POPUP_PADDING = '20px';

/**
 * Helper to get overlay background color from theme
 * Falls back to standard semi-transparent black if theme doesn't specify
 * @param theme - Theme object from useTheme()
 * @returns Semi-transparent overlay background color
 */
export function getOverlayBackground(theme: { colors: { background: { overlayDark: string } } }): string {
  return theme.colors.background.overlayDark || 'rgba(0, 0, 0, 0.7)';
}
