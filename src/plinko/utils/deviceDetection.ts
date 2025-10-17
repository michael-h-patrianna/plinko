/**
 * Device detection utilities
 * Uses platform adapters for cross-platform compatibility
 */

import { dimensionsAdapter, deviceInfoAdapter } from './platform';

/**
 * Detects if the user is on an actual mobile device
 * Checks both user agent and touch capabilities
 * @returns true if device is mobile, false otherwise
 */
export function isMobileDevice(): boolean {
  const isMobileUA = deviceInfoAdapter.isMobileDevice();
  const isTouchDevice = deviceInfoAdapter.isTouchDevice();
  const width = dimensionsAdapter.getWidth();
  return isMobileUA || (isTouchDevice && width <= 768);
}

/**
 * Gets the maximum viewport width for mobile devices
 * @returns Maximum width in pixels (414px for mobile compatibility)
 */
export function getMaxMobileWidth(): number {
  return 414;
}

/**
 * Gets the current viewport width, capped at mobile max if on mobile
 * @returns Viewport width in pixels
 */
export function getResponsiveViewportWidth(): number {
  if (isMobileDevice()) {
    return Math.min(dimensionsAdapter.getWidth(), getMaxMobileWidth());
  }
  return dimensionsAdapter.getWidth();
}
