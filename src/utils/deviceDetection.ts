/**
 * Device detection utilities
 */

/**
 * Detects if the user is on an actual mobile device
 * Checks both user agent and touch capabilities
 * @returns true if device is mobile, false otherwise
 */
export function isMobileDevice(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    userAgent
  );
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  return isMobileUA || (isTouchDevice && window.innerWidth <= 768);
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
    return Math.min(window.innerWidth, getMaxMobileWidth());
  }
  return window.innerWidth;
}
