/**
 * Device Info Platform Adapter - React Native Implementation
 *
 * Uses React Native's Platform API for device detection
 *
 * NOTE: This is a placeholder implementation. In a real React Native app, you would:
 * 1. Import: import { Platform } from 'react-native';
 * 2. Use Platform.OS to detect iOS/Android
 * 3. Use Platform.isPad to detect tablets
 * 4. Optionally use react-native-device-info for more details
 */

import { throwNativeNotImplemented } from '../detect';
import type { DeviceInfo, DeviceInfoAdapter } from './types';

class NativeDeviceInfoAdapter implements DeviceInfoAdapter {
  getDeviceInfo(): DeviceInfo {
    throwNativeNotImplemented('DeviceInfo.getDeviceInfo');
  }

  isTouchDevice(): boolean {
    // All React Native devices support touch
    return true;
  }

  isMobileDevice(): boolean {
    throwNativeNotImplemented('DeviceInfo.isMobileDevice');
  }

  getUserAgent(): string {
    // React Native doesn't have user agent
    return '';
  }
}

export const deviceInfoAdapter: DeviceInfoAdapter = new NativeDeviceInfoAdapter();

/**
 * IMPLEMENTATION GUIDE FOR REACT NATIVE:
 *
 * import { Platform } from 'react-native';
 * import type { DeviceInfo, DeviceInfoAdapter, DeviceType, OSType } from './types';
 *
 * class NativeDeviceInfoAdapter implements DeviceInfoAdapter {
 *   private cachedInfo: DeviceInfo | null = null;
 *
 *   getDeviceInfo(): DeviceInfo {
 *     if (this.cachedInfo) {
 *       return this.cachedInfo;
 *     }
 *
 *     const os: OSType = Platform.OS === 'ios' ? 'ios' :
 *                       Platform.OS === 'android' ? 'android' :
 *                       'unknown';
 *
 *     // Platform.isPad is iOS-only, for Android we'd need device-info library
 *     const isTablet = Platform.OS === 'ios' && Platform.isPad;
 *     const type: DeviceType = isTablet ? 'tablet' : 'mobile';
 *
 *     this.cachedInfo = {
 *       type,
 *       os,
 *       hasTouch: true, // All React Native devices have touch
 *       isMobile: !isTablet,
 *       isTablet,
 *       isDesktop: false,
 *       userAgent: '', // Not available in React Native
 *     };
 *
 *     return this.cachedInfo;
 *   }
 *
 *   isTouchDevice(): boolean {
 *     return true; // All React Native devices support touch
 *   }
 *
 *   isMobileDevice(): boolean {
 *     const info = this.getDeviceInfo();
 *     return info.isMobile;
 *   }
 *
 *   getUserAgent(): string {
 *     return ''; // Not available in React Native
 *   }
 * }
 *
 * export const deviceInfoAdapter: DeviceInfoAdapter = new NativeDeviceInfoAdapter();
 *
 * // For more detailed device detection on Android tablets, consider:
 * // npm install react-native-device-info
 * // import DeviceInfo from 'react-native-device-info';
 * // const isTablet = DeviceInfo.isTablet();
 */
