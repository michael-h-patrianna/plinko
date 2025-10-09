/**
 * Device Info Platform Adapter - Web Implementation
 *
 * Modern implementation using:
 * - matchMedia for responsive breakpoints
 * - navigator.userAgentData (with fallback to UA string)
 * - Touch detection via maxTouchPoints
 */

import type { DeviceInfo, DeviceInfoAdapter, DeviceType, OSType } from './types';

/**
 * User Agent Data interface (modern replacement for navigator.userAgent)
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData
 */
interface NavigatorUAData {
  brands: Array<{ brand: string; version: string }>;
  mobile: boolean;
  platform: string;
}

declare global {
  interface Navigator {
    userAgentData?: NavigatorUAData;
  }
}

class WebDeviceInfoAdapter implements DeviceInfoAdapter {
  private cachedInfo: DeviceInfo | null = null;

  // Modern media queries for device detection
  private readonly MOBILE_QUERY = '(max-width: 767px)';
  private readonly TABLET_QUERY = '(min-width: 768px) and (max-width: 1024px)';
  private readonly DESKTOP_QUERY = '(min-width: 1025px)';
  private readonly TOUCH_QUERY = '(pointer: coarse)';

  getDeviceInfo(): DeviceInfo {
    if (this.cachedInfo) {
      return this.cachedInfo;
    }

    const hasTouch = this.isTouchDevice();
    const type = this.detectDeviceType(hasTouch);
    const os = this.detectOS();
    const userAgent = this.getUserAgent();

    this.cachedInfo = {
      type,
      os,
      hasTouch,
      isMobile: type === 'mobile',
      isTablet: type === 'tablet',
      isDesktop: type === 'desktop',
      userAgent,
    };

    return this.cachedInfo;
  }

  isTouchDevice(): boolean {
    // Primary: Check maxTouchPoints (most reliable)
    if (navigator.maxTouchPoints > 0) {
      return true;
    }

    // Secondary: Check matchMedia for coarse pointer (touch)
    if (globalThis.window.matchMedia && globalThis.window.matchMedia(this.TOUCH_QUERY).matches) {
      return true;
    }

    // Fallback: Legacy ontouchstart check
    if ('ontouchstart' in globalThis.window) {
      return true;
    }

    return false;
  }

  isMobileDevice(): boolean {
    const info = this.getDeviceInfo();
    return info.isMobile;
  }

  getUserAgent(): string {
    return navigator.userAgent;
  }

  /**
   * Modern OS detection using navigator.userAgentData with fallback to UA string
   */
  private detectOS(): OSType {
    // Modern approach: Use navigator.userAgentData
    if (navigator.userAgentData) {
      const platform = navigator.userAgentData.platform.toLowerCase();

      if (platform.includes('ios') || platform.includes('iphone') || platform.includes('ipad')) {
        return 'ios';
      }

      if (platform.includes('android')) {
        return 'android';
      }

      return 'web';
    }

    // Fallback: Use user agent string (only when userAgentData unavailable)
    const ua = navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(ua)) {
      return 'ios';
    }

    if (/android/.test(ua)) {
      return 'android';
    }

    return 'web';
  }

  /**
   * Modern device type detection using matchMedia
   */
  private detectDeviceType(hasTouch: boolean): DeviceType {
    // Modern approach: Use matchMedia for responsive breakpoints
    if (globalThis.window.matchMedia) {
      // Check userAgentData.mobile first (most reliable for mobile)
      if (navigator.userAgentData?.mobile) {
        return 'mobile';
      }

      // Use media queries for device classification
      if (globalThis.window.matchMedia(this.MOBILE_QUERY).matches) {
        return 'mobile';
      }

      if (globalThis.window.matchMedia(this.TABLET_QUERY).matches) {
        // Tablet range, but verify with touch
        return hasTouch ? 'tablet' : 'desktop';
      }

      if (globalThis.window.matchMedia(this.DESKTOP_QUERY).matches) {
        return 'desktop';
      }
    }

    // Fallback: Legacy UA-based detection (only when matchMedia unavailable)
    const ua = navigator.userAgent.toLowerCase();

    const isTabletUA = /ipad|android(?!.*mobile)|tablet/i.test(ua);
    if (isTabletUA) {
      return 'tablet';
    }

    const isMobileUA = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
    if (isMobileUA || (hasTouch && globalThis.window.innerWidth <= 768)) {
      return 'mobile';
    }

    return 'desktop';
  }

  /**
   * Invalidate cache when device characteristics might change
   * (e.g., browser window resized from mobile to desktop width)
   */
  invalidateCache(): void {
    this.cachedInfo = null;
  }
}

export const deviceInfoAdapter: DeviceInfoAdapter = new WebDeviceInfoAdapter();
