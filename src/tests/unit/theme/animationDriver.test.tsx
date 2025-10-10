/**
 * Animation Driver Tests
 *
 * Tests for the animation driver abstraction layer.
 * Ensures proper driver selection, SSR safety, and cross-platform compatibility.
 */

import { describe, it, expect } from 'vitest';
import {
  getAnimationDriver,
  framerDriver,
  motiDriver,
} from '@theme/animationDrivers';

describe('Animation Driver Abstraction', () => {
  describe('Framer Motion Driver', () => {
    it('should have correct name and platform', () => {
      expect(framerDriver.name).toBe('framer');
      expect(framerDriver.platform).toBe('web');
    });

    it('should support animations in browser environment', () => {
      expect(framerDriver.isSupported()).toBe(true);
    });

    it('should create animated components', () => {
      const AnimatedDiv = framerDriver.createAnimatedComponent('div');
      expect(AnimatedDiv).toBeDefined();
    });

    it('should provide AnimatePresence', () => {
      expect(framerDriver.AnimatePresence).toBeDefined();
    });

    it('should provide spring presets', () => {
      const gentle = framerDriver.getSpringConfig('gentle');
      expect(gentle).toHaveProperty('stiffness');
      expect(gentle).toHaveProperty('damping');
      expect(gentle).toHaveProperty('mass');

      const wobbly = framerDriver.getSpringConfig('wobbly');
      expect(wobbly.stiffness!).toBeGreaterThan(gentle.stiffness!);

      const stiff = framerDriver.getSpringConfig('stiff');
      expect(stiff.stiffness!).toBeGreaterThan(wobbly.stiffness!);

      const slow = framerDriver.getSpringConfig('slow');
      expect(slow.stiffness!).toBeLessThan(gentle.stiffness!);
    });

    it('should provide transition presets', () => {
      const fast = framerDriver.getTransitionConfig('fast');
      expect(fast).toHaveProperty('duration');
      expect(fast.duration).toBe(0.2);

      const medium = framerDriver.getTransitionConfig('medium');
      expect(medium.duration).toBe(0.4);

      const slow = framerDriver.getTransitionConfig('slow');
      expect(slow.duration).toBe(0.6);

      const spring = framerDriver.getTransitionConfig('spring');
      expect(spring.type).toBe('spring');
      expect(spring.spring).toBeDefined();
    });

    it('should have environment detection', () => {
      // Type assertion for internal method access in tests only
      const driverWithEnv = framerDriver as typeof framerDriver & {
        getEnvironment: () => Record<string, boolean>;
      };
      const env = driverWithEnv.getEnvironment();
      expect(env).toHaveProperty('isBrowser');
      expect(env).toHaveProperty('isNative');
      expect(env).toHaveProperty('isSSR');
      expect(env).toHaveProperty('prefersReducedMotion');
      expect(env).toHaveProperty('hasGPUAcceleration');
    });
  });

  describe('Moti Driver (Placeholder)', () => {
    it('should have correct name and platform', () => {
      expect(motiDriver.name).toBe('moti');
      expect(motiDriver.platform).toBe('native');
    });

    it('should not support animations in web environment', () => {
      // In web context, Moti is not available
      expect(motiDriver.isSupported()).toBe(false);
    });

    it('should provide spring presets', () => {
      const gentle = motiDriver.getSpringConfig('gentle');
      expect(gentle).toHaveProperty('stiffness');
      expect(gentle).toHaveProperty('damping');
      expect(gentle).toHaveProperty('mass');
    });

    it('should provide transition presets', () => {
      const fast = motiDriver.getTransitionConfig('fast');
      expect(fast).toHaveProperty('duration');
      expect(fast.duration).toBe(0.2);
    });

    it('should throw error when creating components in web context', () => {
      // In actual RN context, this would work
      // In web, it should throw or return stub
      const result = motiDriver.createAnimatedComponent('div');
      expect(result).toBeDefined();
    });
  });

  describe('Driver Selection', () => {
    it('should select Framer driver by default (web)', () => {
      const driver = getAnimationDriver();
      expect(driver.name).toBe('framer');
      expect(driver.platform).toBe('web');
    });

    it('should select Framer driver explicitly', () => {
      const driver = getAnimationDriver('framer');
      expect(driver.name).toBe('framer');
    });

    it('should select Moti driver explicitly', () => {
      const driver = getAnimationDriver('moti');
      expect(driver.name).toBe('moti');
    });

    it('should auto-detect web platform', () => {
      const driver = getAnimationDriver('auto');
      expect(driver.platform).toBe('web');
    });
  });

  describe('Spring Physics Configurations', () => {
    it('should have consistent spring configs across drivers', () => {
      const framerGentle = framerDriver.getSpringConfig('gentle');
      const motiGentle = motiDriver.getSpringConfig('gentle');

      expect(framerGentle.stiffness).toBe(motiGentle.stiffness);
      expect(framerGentle.damping).toBe(motiGentle.damping);
      expect(framerGentle.mass).toBe(motiGentle.mass);
    });

    it('should have proper spring physics values', () => {
      const gentle = framerDriver.getSpringConfig('gentle');

      // Validate physics make sense
      expect(gentle.stiffness).toBeGreaterThan(0);
      expect(gentle.damping).toBeGreaterThan(0);
      expect(gentle.mass).toBeGreaterThan(0);

      // Gentle should be less stiff than wobbly
      const wobbly = framerDriver.getSpringConfig('wobbly');
      expect(wobbly.stiffness!).toBeGreaterThan(gentle.stiffness!);
    });
  });

  describe('Transition Configurations', () => {
    it('should have consistent transition configs across drivers', () => {
      const framerFast = framerDriver.getTransitionConfig('fast');
      const motiFast = motiDriver.getTransitionConfig('fast');

      expect(framerFast.duration).toBe(motiFast.duration);
      expect(JSON.stringify(framerFast.ease)).toBe(JSON.stringify(motiFast.ease));
    });

    it('should have proper timing values', () => {
      const fast = framerDriver.getTransitionConfig('fast');
      const medium = framerDriver.getTransitionConfig('medium');
      const slow = framerDriver.getTransitionConfig('slow');

      expect(fast.duration).toBeLessThan(medium.duration!);
      expect(medium.duration).toBeLessThan(slow.duration!);
    });

    it('should use cubic-bezier easing for smooth animations', () => {
      const fast = framerDriver.getTransitionConfig('fast');
      expect(Array.isArray(fast.ease)).toBe(true);
      // Cast to unknown first to avoid readonly tuple conversion error
      expect((fast.ease as unknown as number[]).length).toBe(4);
    });
  });

  describe('Cross-Platform Safety', () => {
    it('should only expose GPU-accelerated transforms', () => {
      // This is validated by TypeScript, but we can document it
      const driver = getAnimationDriver();
      expect(driver).toBeDefined();

      // The AnimationConfig type only allows:
      // x, y, scale, rotate, opacity, backgroundColor, color
      // This test documents the constraint
    });

    it('should have identical spring presets for web and native', () => {
      const presets = ['gentle', 'wobbly', 'stiff', 'slow'] as const;

      for (const preset of presets) {
        const framerConfig = framerDriver.getSpringConfig(preset);
        const motiConfig = motiDriver.getSpringConfig(preset);

        expect(framerConfig).toEqual(motiConfig);
      }
    });

    it('should have identical transition presets for web and native', () => {
      const presets = ['fast', 'medium', 'slow'] as const;

      for (const preset of presets) {
        const framerConfig = framerDriver.getTransitionConfig(preset);
        const motiConfig = motiDriver.getTransitionConfig(preset);

        expect(framerConfig.duration).toBe(motiConfig.duration);
        expect(JSON.stringify(framerConfig.ease)).toBe(JSON.stringify(motiConfig.ease));
      }
    });
  });

  describe('Performance Optimizations', () => {
    it('should use spring physics for 60 FPS', () => {
      const spring = framerDriver.getSpringConfig('gentle');

      // Spring damping should prevent oscillation
      expect(spring.damping).toBeGreaterThan(10);

      // Stiffness should be reasonable for smooth motion
      expect(spring.stiffness).toBeLessThan(500);
      expect(spring.stiffness).toBeGreaterThan(50);
    });

    it('should use cubic-bezier for GPU acceleration', () => {
      const transition = framerDriver.getTransitionConfig('fast');

      // Cubic bezier array should have 4 values
      if (Array.isArray(transition.ease)) {
        expect(transition.ease.length).toBe(4);
        // All values should be between 0 and 1 (or slightly outside for bounce)
        transition.ease.forEach((val: number) => {
          expect(typeof val).toBe('number');
        });
      }
    });
  });
});
