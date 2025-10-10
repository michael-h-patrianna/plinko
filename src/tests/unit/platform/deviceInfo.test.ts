/**
 * Unit tests for modern deviceInfoAdapter implementation
 * Tests real browser APIs without complex mocking
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { deviceInfoAdapter } from '@utils/platform/deviceInfo/index.web';

describe('DeviceInfo Adapter (Web)', () => {
  describe('API Interface', () => {
    it('should provide getDeviceInfo method', () => {
      expect(typeof deviceInfoAdapter.getDeviceInfo).toBe('function');
    });

    it('should provide isTouchDevice method', () => {
      expect(typeof deviceInfoAdapter.isTouchDevice).toBe('function');
    });

    it('should provide isMobileDevice method', () => {
      expect(typeof deviceInfoAdapter.isMobileDevice).toBe('function');
    });

    it('should provide getUserAgent method', () => {
      expect(typeof deviceInfoAdapter.getUserAgent).toBe('function');
    });
  });

  describe('Device Info', () => {
    it('should return valid DeviceInfo object', () => {
      const info = deviceInfoAdapter.getDeviceInfo();

      expect(info).toBeDefined();
      expect(info).toHaveProperty('type');
      expect(info).toHaveProperty('os');
      expect(info).toHaveProperty('hasTouch');
      expect(info).toHaveProperty('isMobile');
      expect(info).toHaveProperty('isTablet');
      expect(info).toHaveProperty('isDesktop');
      expect(info).toHaveProperty('userAgent');
    });

    it('should return one of the valid device types', () => {
      const info = deviceInfoAdapter.getDeviceInfo();

      expect(['mobile', 'tablet', 'desktop']).toContain(info.type);
    });

    it('should return one of the valid OS types', () => {
      const info = deviceInfoAdapter.getDeviceInfo();

      expect(['ios', 'android', 'web', 'unknown']).toContain(info.os);
    });

    it('should have consistent boolean flags', () => {
      const info = deviceInfoAdapter.getDeviceInfo();

      // Only one type should be true
      const typeFlags = [info.isMobile, info.isTablet, info.isDesktop];
      const trueCount = typeFlags.filter(Boolean).length;

      expect(trueCount).toBe(1);
    });

    it('should match isMobile with type === mobile', () => {
      const info = deviceInfoAdapter.getDeviceInfo();

      expect(info.isMobile).toBe(info.type === 'mobile');
    });

    it('should match isTablet with type === tablet', () => {
      const info = deviceInfoAdapter.getDeviceInfo();

      expect(info.isTablet).toBe(info.type === 'tablet');
    });

    it('should match isDesktop with type === desktop', () => {
      const info = deviceInfoAdapter.getDeviceInfo();

      expect(info.isDesktop).toBe(info.type === 'desktop');
    });
  });

  describe('Touch Detection', () => {
    it('should return boolean for hasTouch', () => {
      const hasTouch = deviceInfoAdapter.isTouchDevice();

      expect(typeof hasTouch).toBe('boolean');
    });

    it('should match hasTouch in getDeviceInfo', () => {
      const hasTouch = deviceInfoAdapter.isTouchDevice();
      const info = deviceInfoAdapter.getDeviceInfo();

      expect(info.hasTouch).toBe(hasTouch);
    });
  });

  describe('Mobile Detection', () => {
    it('should return boolean for isMobileDevice', () => {
      const isMobile = deviceInfoAdapter.isMobileDevice();

      expect(typeof isMobile).toBe('boolean');
    });

    it('should match isMobile in getDeviceInfo', () => {
      const isMobile = deviceInfoAdapter.isMobileDevice();
      const info = deviceInfoAdapter.getDeviceInfo();

      expect(info.isMobile).toBe(isMobile);
    });
  });

  describe('User Agent', () => {
    it('should return string for getUserAgent', () => {
      const userAgent = deviceInfoAdapter.getUserAgent();

      expect(typeof userAgent).toBe('string');
    });

    it('should match navigator.userAgent', () => {
      const userAgent = deviceInfoAdapter.getUserAgent();

      expect(userAgent).toBe(navigator.userAgent);
    });

    it('should include user agent in getDeviceInfo', () => {
      const info = deviceInfoAdapter.getDeviceInfo();

      expect(info.userAgent).toBe(navigator.userAgent);
    });
  });

  describe('Caching', () => {
    it('should cache device info and return same object', () => {
      const info1 = deviceInfoAdapter.getDeviceInfo();
      const info2 = deviceInfoAdapter.getDeviceInfo();

      // Should return same cached object
      expect(info1).toBe(info2);
    });
  });

  describe('Modern API Support', () => {
    it('should handle matchMedia if available', () => {
      if (window.matchMedia) {
        // matchMedia should be callable
        const result = window.matchMedia('(max-width: 767px)');
        expect(result).toBeDefined();
        expect(typeof result.matches).toBe('boolean');
      }
    });

    it('should handle navigator.maxTouchPoints', () => {
      // Should not throw when accessing maxTouchPoints
      // JSDOM doesn't provide maxTouchPoints, so it may be undefined
      const touchPoints = navigator.maxTouchPoints;
      expect(['number', 'undefined']).toContain(typeof touchPoints);
    });

    it('should handle navigator.userAgentData if available', () => {
      // userAgentData is optional (modern browsers)
      const uaData = (navigator as unknown as { userAgentData?: { mobile: boolean; platform: string } }).userAgentData;

      if (uaData) {
        expect(typeof uaData.mobile).toBe('boolean');
        expect(typeof uaData.platform).toBe('string');
      }
    });
  });

  describe('Backwards Compatibility', () => {
    it('should work in environment without userAgentData', () => {
      // Should still return valid info even if userAgentData unavailable
      const info = deviceInfoAdapter.getDeviceInfo();

      expect(info).toBeDefined();
      expect(info.type).toBeDefined();
      expect(info.os).toBeDefined();
    });

    it('should handle ontouchstart property check', () => {
      // Should not throw when checking ontouchstart
      expect(() => {
        const hasOntouchstart = 'ontouchstart' in window;
        expect(typeof hasOntouchstart).toBe('boolean');
      }).not.toThrow();
    });
  });
});
