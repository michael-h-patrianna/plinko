/**
 * Device Info Platform Adapter - Web Implementation
 *
 * Uses navigator.userAgent and navigator.maxTouchPoints for device detection
 */

import type { DeviceInfo, DeviceInfoAdapter, DeviceType, OSType } from './types';

class WebDeviceInfoAdapter implements DeviceInfoAdapter {
  private cachedInfo: DeviceInfo | null = null;

  getDeviceInfo(): DeviceInfo {
    if (this.cachedInfo) {
      return this.cachedInfo;
    }

    const userAgent = this.getUserAgent();
    const hasTouch = this.isTouchDevice();
    const os = this.detectOS(userAgent);
    const type = this.detectDeviceType(userAgent, hasTouch);

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
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    );
  }

  isMobileDevice(): boolean {
    const info = this.getDeviceInfo();
    return info.isMobile;
  }

  getUserAgent(): string {
    return navigator.userAgent;
  }

  private detectOS(userAgent: string): OSType {
    const ua = userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(ua)) {
      return 'ios';
    }

    if (/android/.test(ua)) {
      return 'android';
    }

    return 'web';
  }

  private detectDeviceType(userAgent: string, hasTouch: boolean): DeviceType {
    const ua = userAgent.toLowerCase();

    // Check for mobile user agents
    const isMobileUA = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);

    // Check for tablet user agents
    const isTabletUA = /ipad|android(?!.*mobile)|tablet/i.test(ua);

    // Tablet detection
    if (isTabletUA) {
      return 'tablet';
    }

    // Mobile detection (must have mobile UA or be touch device with narrow screen)
    if (isMobileUA || (hasTouch && window.innerWidth <= 768)) {
      return 'mobile';
    }

    // Default to desktop
    return 'desktop';
  }
}

export const deviceInfoAdapter: DeviceInfoAdapter = new WebDeviceInfoAdapter();
