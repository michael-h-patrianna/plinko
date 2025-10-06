/**
 * Device Info Platform Adapter Types
 *
 * Provides device detection and capability checking
 * across web and React Native platforms
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type OSType = 'ios' | 'android' | 'web' | 'unknown';

export interface DeviceInfo {
  /**
   * The type of device (mobile, tablet, desktop)
   */
  type: DeviceType;

  /**
   * The operating system
   */
  os: OSType;

  /**
   * Whether the device supports touch input
   */
  hasTouch: boolean;

  /**
   * Whether this is a mobile device (phone or small tablet)
   */
  isMobile: boolean;

  /**
   * Whether this is a tablet device
   */
  isTablet: boolean;

  /**
   * Whether this is a desktop device
   */
  isDesktop: boolean;

  /**
   * User agent string (web only, may be empty on native)
   */
  userAgent: string;
}

export interface DeviceInfoAdapter {
  /**
   * Gets comprehensive device information
   *
   * @returns DeviceInfo object with all device details
   */
  getDeviceInfo(): DeviceInfo;

  /**
   * Checks if the device has touch capability
   *
   * @returns true if device supports touch
   */
  isTouchDevice(): boolean;

  /**
   * Checks if the device is mobile (phone size)
   *
   * @returns true if device is mobile
   */
  isMobileDevice(): boolean;

  /**
   * Gets the user agent string (web only)
   *
   * @returns User agent string or empty string on native
   */
  getUserAgent(): string;
}
