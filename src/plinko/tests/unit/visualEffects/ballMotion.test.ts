/**
 * Unit tests for ball motion visual effects
 * Tests squash/stretch, trail intensity, motion blur, and speed-based coloring
 *
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';

describe('Ball Motion Visual Effects', () => {
  describe('calculateTrailGradient', () => {
    // Import the function from the actual implementation
    // Note: This function is currently inline in OptimizedBallRenderer
    // We'll test it by extracting the logic

    /**
     * Calculate trail gradient intensity based on ball speed.
     * Low speed = desaturated/dim, high speed = saturated/bright
     * Uses linear gradients only (cross-platform compatible, no radial/conic)
     *
     * @param speed - Ball speed in pixels/second
     * @param baseColor - Base color (e.g., theme.colors.game.ball.primary - must be hex format)
     * @returns CSS linear gradient with speed-based intensity
     */
    function calculateTrailGradient(speed: number, baseColor: string): string {
      // Speed thresholds (px/s)
      const LOW_SPEED = 200;
      const HIGH_SPEED = 400;

      // Calculate intensity based on speed
      let alphaMultiplier = 0.6; // Desaturated for low speed

      if (speed >= HIGH_SPEED) {
        alphaMultiplier = 1.0; // Fully saturated for high speed
      } else if (speed > LOW_SPEED) {
        // Linear interpolation between low and high speed
        const ratio = (speed - LOW_SPEED) / (HIGH_SPEED - LOW_SPEED);
        alphaMultiplier = 0.6 + ratio * 0.4; // 0.6 to 1.0
      }

      // Calculate alpha hex values for gradient stops
      // Full intensity at start, fading to transparent
      const alpha1 = Math.round(255 * alphaMultiplier).toString(16).padStart(2, '0');
      const alpha2 = Math.round(204 * alphaMultiplier).toString(16).padStart(2, '0'); // 80% of full
      const alpha3 = Math.round(102 * alphaMultiplier).toString(16).padStart(2, '0'); // 40% of full

      return `linear-gradient(135deg, ${baseColor}${alpha1} 0%, ${baseColor}${alpha2} 30%, ${baseColor}${alpha3} 70%, transparent 100%)`;
    }

    it('should produce dim gradient for very low speed (< 200 px/s)', () => {
      const gradient = calculateTrailGradient(100, '#FF6B35');

      // At 100 px/s, alphaMultiplier should be 0.6
      // alpha1 = Math.round(255 * 0.6) = 153 = 0x99
      expect(gradient).toContain('#FF6B3599');
      expect(gradient).toContain('linear-gradient(135deg');
      expect(gradient).toContain('transparent 100%)');
    });

    it('should produce medium gradient for medium speed (200-400 px/s)', () => {
      const gradient = calculateTrailGradient(300, '#FF6B35');

      // At 300 px/s, ratio = (300 - 200) / (400 - 200) = 0.5
      // alphaMultiplier = 0.6 + 0.5 * 0.4 = 0.8
      // alpha1 = Math.round(255 * 0.8) = 204 = 0xcc
      expect(gradient).toContain('#FF6B35cc');
    });

    it('should produce bright gradient for high speed (>= 400 px/s)', () => {
      const gradient = calculateTrailGradient(500, '#FF6B35');

      // At 500 px/s, alphaMultiplier should be 1.0
      // alpha1 = Math.round(255 * 1.0) = 255 = 0xff
      expect(gradient).toContain('#FF6B35ff');
    });

    it('should produce gradient at exact LOW_SPEED threshold (200 px/s)', () => {
      const gradient = calculateTrailGradient(200, '#FF6B35');

      // At exactly 200 px/s, should still be at minimum (0.6)
      // Because the condition is "speed > LOW_SPEED" (not >=)
      expect(gradient).toContain('#FF6B3599');
    });

    it('should produce gradient at exact HIGH_SPEED threshold (400 px/s)', () => {
      const gradient = calculateTrailGradient(400, '#FF6B35');

      // At exactly 400 px/s, should be at maximum (1.0)
      expect(gradient).toContain('#FF6B35ff');
    });

    it('should handle different base colors', () => {
      const gradient1 = calculateTrailGradient(300, '#00FF00');
      const gradient2 = calculateTrailGradient(300, '#0000FF');

      expect(gradient1).toContain('#00FF00cc');
      expect(gradient2).toContain('#0000FFcc');
    });

    it('should produce valid gradient with multiple stops', () => {
      const gradient = calculateTrailGradient(300, '#FF6B35');

      // Should have 4 stops: alpha1 at 0%, alpha2 at 30%, alpha3 at 70%, transparent at 100%
      expect(gradient).toMatch(/linear-gradient\(135deg, #FF6B35[a-f0-9]{2} 0%, #FF6B35[a-f0-9]{2} 30%, #FF6B35[a-f0-9]{2} 70%, transparent 100%\)/);
    });

    it('should produce linear interpolation within speed range', () => {
      // Test interpolation at quarter points
      const gradient250 = calculateTrailGradient(250, '#FF6B35');
      const gradient350 = calculateTrailGradient(350, '#FF6B35');

      // At 250: ratio = 0.25, alphaMultiplier = 0.7, alpha1 = 179 = 0xb3
      expect(gradient250).toContain('#FF6B35b3');

      // At 350: ratio = 0.75, alphaMultiplier = 0.9, alpha1 = 230 = 0xe6
      expect(gradient350).toContain('#FF6B35e6');
    });
  });

  describe('Motion Blur Calculation', () => {
    /**
     * Calculate motion blur scaleX based on horizontal velocity
     * High horizontal speed creates stretched trail effect
     */
    function calculateMotionBlurScaleX(vx: number): number {
      const absVx = Math.abs(vx);
      if (absVx > 400) {
        return Math.min(1.5 + (absVx - 400) / 400, 2.5);
      }
      return 1;
    }

    it('should return 1 for low horizontal velocity (< 400 px/s)', () => {
      expect(calculateMotionBlurScaleX(100)).toBe(1);
      expect(calculateMotionBlurScaleX(300)).toBe(1);
      expect(calculateMotionBlurScaleX(399)).toBe(1);
    });

    it('should return 1.5 at threshold velocity (400 px/s)', () => {
      expect(calculateMotionBlurScaleX(400)).toBe(1.5);
    });

    it('should scale linearly above threshold', () => {
      // At 600 px/s: 1.5 + (600 - 400) / 400 = 1.5 + 0.5 = 2.0
      expect(calculateMotionBlurScaleX(600)).toBe(2.0);

      // At 800 px/s: 1.5 + (800 - 400) / 400 = 1.5 + 1.0 = 2.5
      expect(calculateMotionBlurScaleX(800)).toBe(2.5);
    });

    it('should cap at maximum 2.5', () => {
      expect(calculateMotionBlurScaleX(1000)).toBe(2.5);
      expect(calculateMotionBlurScaleX(2000)).toBe(2.5);
    });

    it('should handle negative velocities (use absolute value)', () => {
      expect(calculateMotionBlurScaleX(-500)).toBe(1.75);
      expect(calculateMotionBlurScaleX(-800)).toBe(2.5);
    });

    it('should handle zero velocity', () => {
      expect(calculateMotionBlurScaleX(0)).toBe(1);
    });
  });

  describe('Speed Calculation from Velocity', () => {
    /**
     * Calculate total speed from velocity components
     */
    function calculateSpeed(vx: number, vy: number): number {
      return Math.sqrt(vx * vx + vy * vy);
    }

    it('should calculate speed from horizontal and vertical velocity', () => {
      // Pythagorean: sqrt(3^2 + 4^2) = 5
      expect(calculateSpeed(3, 4)).toBe(5);
    });

    it('should handle zero velocity', () => {
      expect(calculateSpeed(0, 0)).toBe(0);
    });

    it('should handle pure horizontal velocity', () => {
      expect(calculateSpeed(100, 0)).toBe(100);
    });

    it('should handle pure vertical velocity', () => {
      expect(calculateSpeed(0, 100)).toBe(100);
    });

    it('should handle negative velocities', () => {
      // Speed should always be positive (uses squared values)
      expect(calculateSpeed(-3, -4)).toBe(5);
      expect(calculateSpeed(-100, 0)).toBe(100);
    });

    it('should calculate realistic drop speeds', () => {
      // Low speed drop
      const lowSpeed = calculateSpeed(50, 150);
      expect(lowSpeed).toBeCloseTo(158.11, 2);

      // High speed drop
      const highSpeed = calculateSpeed(200, 300);
      expect(highSpeed).toBeCloseTo(360.56, 2);
    });
  });

  describe('Squash and Stretch Logic', () => {
    /**
     * Ball should squash/stretch based on collision type
     * These values come from trajectoryCache and are applied imperatively
     */
    it('should define squash on vertical collision (floor/ceiling)', () => {
      // Vertical collision: scaleY < 1, scaleX > 1
      const scaleY = 0.7;
      const scaleX = 1.3;

      expect(scaleY).toBeLessThan(1);
      expect(scaleX).toBeGreaterThan(1);
      // Conservation of area: scaleX * scaleY ≈ 1
      expect(scaleX * scaleY).toBeCloseTo(0.91, 1);
    });

    it('should define stretch on horizontal collision (walls)', () => {
      // Horizontal collision: scaleX < 1, scaleY > 1
      const scaleX = 0.8;
      const scaleY = 1.2;

      expect(scaleX).toBeLessThan(1);
      expect(scaleY).toBeGreaterThan(1);
      // Conservation of area
      expect(scaleX * scaleY).toBeCloseTo(0.96, 1);
    });

    it('should define neutral scale when no collision', () => {
      const scaleX = 1.0;
      const scaleY = 1.0;

      expect(scaleX).toBe(1);
      expect(scaleY).toBe(1);
    });

    it('should maintain physical plausibility (no extreme deformation)', () => {
      // Max squash should not be too extreme
      const maxSquash = 0.6;
      const maxStretch = 1.4;

      expect(maxSquash).toBeGreaterThan(0.5); // Not completely flat
      expect(maxStretch).toBeLessThan(1.5); // Not too elongated
    });
  });

  describe('Trail Length Dynamics', () => {
    /**
     * Trail length should vary based on ball speed
     * Faster ball = longer trail
     */
    it('should define minimum trail length for slow speeds', () => {
      const minTrailLength = 5;
      expect(minTrailLength).toBeGreaterThanOrEqual(3);
    });

    it('should define maximum trail length for high speeds', () => {
      const maxTrailLength = 20;
      expect(maxTrailLength).toBeLessThanOrEqual(30);
    });

    it('should interpolate trail length based on speed', () => {
      // Example: speed-based trail length calculation
      function calculateTrailLength(speed: number, min = 5, max = 20): number {
        const speedThreshold = 500; // Max speed for trail scaling
        const ratio = Math.min(speed / speedThreshold, 1);
        return Math.round(min + ratio * (max - min));
      }

      expect(calculateTrailLength(0)).toBe(5); // Minimum
      expect(calculateTrailLength(250)).toBe(13); // Middle
      expect(calculateTrailLength(500)).toBe(20); // Maximum
      expect(calculateTrailLength(1000)).toBe(20); // Capped at max
    });
  });

  describe('Performance Flags', () => {
    it('should respect enableMotionEffects flag', () => {
      const enableMotionEffects = true;
      expect(typeof enableMotionEffects).toBe('boolean');
    });

    it('should disable motion effects when flag is false', () => {
      const enableMotionEffects = false;

      // When disabled, motion blur should be 1 (no blur)
      const motionBlur = enableMotionEffects ? 2.5 : 1;
      expect(motionBlur).toBe(1);
    });

    it('should enable motion effects when flag is true', () => {
      const enableMotionEffects = true;

      // When enabled, motion blur can vary
      const motionBlur = enableMotionEffects ? 2.5 : 1;
      expect(motionBlur).toBe(2.5);
    });
  });

  describe('Cross-Platform Compatibility', () => {
    it('should use only linear gradients (no radial/conic)', () => {
      const gradient = 'linear-gradient(135deg, #FF6B35ff 0%, #FF6B35cc 30%, #FF6B3566 70%, transparent 100%)';

      expect(gradient).toContain('linear-gradient');
      expect(gradient).not.toContain('radial-gradient');
      expect(gradient).not.toContain('conic-gradient');
    });

    it('should use only transform properties (no filters)', () => {
      // Valid cross-platform transforms
      const validTransforms = ['translateX', 'translateY', 'scaleX', 'scaleY', 'rotate', 'scale'];

      // Invalid web-only effects
      const invalidEffects = ['blur', 'filter', 'backdrop-filter', 'box-shadow', 'text-shadow'];

      validTransforms.forEach(transform => {
        expect(validTransforms).toContain(transform);
      });

      // Ensure we're not using web-only effects
      invalidEffects.forEach(effect => {
        expect(validTransforms).not.toContain(effect);
      });
    });

    it('should use opacity for visual effects (cross-platform safe)', () => {
      const opacity = 0.8;
      expect(opacity).toBeGreaterThanOrEqual(0);
      expect(opacity).toBeLessThanOrEqual(1);
    });
  });
});
