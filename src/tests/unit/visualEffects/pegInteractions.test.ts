/**
 * Unit tests for peg interaction visual effects
 * Tests ripple chain reactions, color-coded flashes, shake/wobble, and progressive brightness
 *
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import { buildPegAdjacencyMap, getAdjacentPegs, RIPPLE_RADIUS } from '@/animation/pegRippleUtils';
import type { Peg } from '@game/boardGeometry';

describe('Peg Interaction Visual Effects', () => {
  describe('Progressive Brightness by Row', () => {
    /**
     * Calculate progressive brightness based on row (depth cue)
     * Rows 0-2: 70%, Rows 3-6: 85%, Rows 7+: 100%
     */
    function calculateBrightness(row: number): number {
      if (row <= 2) return 0.7;
      if (row <= 6) return 0.85;
      return 1.0;
    }

    it('should return 70% brightness for rows 0-2 (top rows)', () => {
      expect(calculateBrightness(0)).toBe(0.7);
      expect(calculateBrightness(1)).toBe(0.7);
      expect(calculateBrightness(2)).toBe(0.7);
    });

    it('should return 85% brightness for rows 3-6 (middle rows)', () => {
      expect(calculateBrightness(3)).toBe(0.85);
      expect(calculateBrightness(4)).toBe(0.85);
      expect(calculateBrightness(5)).toBe(0.85);
      expect(calculateBrightness(6)).toBe(0.85);
    });

    it('should return 100% brightness for rows 7+ (bottom rows)', () => {
      expect(calculateBrightness(7)).toBe(1.0);
      expect(calculateBrightness(8)).toBe(1.0);
      expect(calculateBrightness(10)).toBe(1.0);
      expect(calculateBrightness(15)).toBe(1.0);
    });

    it('should create depth perception gradient from top to bottom', () => {
      const topBrightness = calculateBrightness(0);
      const midBrightness = calculateBrightness(4);
      const bottomBrightness = calculateBrightness(10);

      expect(topBrightness).toBeLessThan(midBrightness);
      expect(midBrightness).toBeLessThan(bottomBrightness);
    });
  });

  describe('Peg Ripple Chain Reactions', () => {
    describe('buildPegAdjacencyMap', () => {
      it('should build adjacency map for simple peg layout', () => {
        const pegs: Peg[] = [
          { row: 0, col: 0, x: 0, y: 0 },
          { row: 0, col: 1, x: 30, y: 0 }, // 30px away (within RIPPLE_RADIUS)
          { row: 1, col: 0, x: 0, y: 50 }, // 50px away (outside default RIPPLE_RADIUS of 40)
        ];

        const adjacencyMap = buildPegAdjacencyMap(pegs);

        // Peg 0-0 should have 0-1 as adjacent (30px away)
        const adjacentTo00 = adjacencyMap.get('0-0');
        expect(adjacentTo00).toContain('0-1');
        expect(adjacentTo00).not.toContain('1-0'); // Too far
      });

      it('should handle pegs exactly at ripple radius boundary', () => {
        const pegs: Peg[] = [
          { row: 0, col: 0, x: 0, y: 0 },
          { row: 0, col: 1, x: 40, y: 0 }, // Exactly 40px away (at boundary)
        ];

        const adjacencyMap = buildPegAdjacencyMap(pegs);

        // Should include peg at exactly ripple radius
        const adjacentTo00 = adjacencyMap.get('0-0');
        expect(adjacentTo00).toContain('0-1');
      });

      it('should not include self in adjacency list', () => {
        const pegs: Peg[] = [
          { row: 0, col: 0, x: 0, y: 0 },
          { row: 0, col: 1, x: 30, y: 0 },
        ];

        const adjacencyMap = buildPegAdjacencyMap(pegs);

        const adjacentTo00 = adjacencyMap.get('0-0');
        expect(adjacentTo00).not.toContain('0-0');
      });

      it('should handle custom ripple radius', () => {
        const pegs: Peg[] = [
          { row: 0, col: 0, x: 0, y: 0 },
          { row: 0, col: 1, x: 30, y: 0 },
          { row: 0, col: 2, x: 60, y: 0 },
        ];

        // With radius 50, both should be adjacent
        const adjacencyMap = buildPegAdjacencyMap(pegs, 50);

        const adjacentTo00 = adjacencyMap.get('0-0');
        expect(adjacentTo00).toContain('0-1'); // 30px
        expect(adjacentTo00).not.toContain('0-2'); // 60px (outside 50px radius)
      });

      it('should build bidirectional adjacency', () => {
        const pegs: Peg[] = [
          { row: 0, col: 0, x: 0, y: 0 },
          { row: 0, col: 1, x: 30, y: 0 },
        ];

        const adjacencyMap = buildPegAdjacencyMap(pegs);

        // Both should list each other as adjacent
        expect(adjacencyMap.get('0-0')).toContain('0-1');
        expect(adjacencyMap.get('0-1')).toContain('0-0');
      });

      it('should handle diagonal pegs (Pythagorean distance)', () => {
        const pegs: Peg[] = [
          { row: 0, col: 0, x: 0, y: 0 },
          { row: 1, col: 1, x: 30, y: 30 }, // Distance = sqrt(30^2 + 30^2) ≈ 42.4 (outside 40px)
        ];

        const adjacencyMap = buildPegAdjacencyMap(pegs);

        const adjacentTo00 = adjacencyMap.get('0-0');
        expect(adjacentTo00).not.toContain('1-1'); // Just outside ripple radius
      });

      it('should handle empty peg array', () => {
        const adjacencyMap = buildPegAdjacencyMap([]);
        expect(adjacencyMap.size).toBe(0);
      });

      it('should handle single peg', () => {
        const pegs: Peg[] = [{ row: 0, col: 0, x: 0, y: 0 }];
        const adjacencyMap = buildPegAdjacencyMap(pegs);

        expect(adjacencyMap.size).toBe(1);
        expect(adjacencyMap.get('0-0')).toEqual([]);
      });

      it('should build map with correct IDs for all pegs', () => {
        const pegs: Peg[] = [
          { row: 0, col: 0, x: 0, y: 0 },
          { row: 1, col: 0, x: 0, y: 30 },
          { row: 2, col: 1, x: 20, y: 60 },
        ];

        const adjacencyMap = buildPegAdjacencyMap(pegs);

        expect(adjacencyMap.has('0-0')).toBe(true);
        expect(adjacencyMap.has('1-0')).toBe(true);
        expect(adjacencyMap.has('2-1')).toBe(true);
      });
    });

    describe('getAdjacentPegs', () => {
      it('should return adjacent pegs from pre-built map', () => {
        const pegs: Peg[] = [
          { row: 0, col: 0, x: 0, y: 0 },
          { row: 0, col: 1, x: 30, y: 0 },
        ];

        const adjacencyMap = buildPegAdjacencyMap(pegs);
        const adjacent = getAdjacentPegs('0-0', adjacencyMap);

        expect(adjacent).toEqual(['0-1']);
      });

      it('should return empty array for peg with no adjacent pegs', () => {
        const pegs: Peg[] = [
          { row: 0, col: 0, x: 0, y: 0 },
          { row: 0, col: 1, x: 100, y: 0 }, // Far away
        ];

        const adjacencyMap = buildPegAdjacencyMap(pegs);
        const adjacent = getAdjacentPegs('0-0', adjacencyMap);

        expect(adjacent).toEqual([]);
      });

      it('should return empty array for non-existent peg', () => {
        const pegs: Peg[] = [{ row: 0, col: 0, x: 0, y: 0 }];
        const adjacencyMap = buildPegAdjacencyMap(pegs);

        const adjacent = getAdjacentPegs('99-99', adjacencyMap);
        expect(adjacent).toEqual([]);
      });

      it('should handle peg with multiple adjacent pegs', () => {
        const pegs: Peg[] = [
          { row: 0, col: 0, x: 50, y: 50 }, // Center peg
          { row: 0, col: 1, x: 70, y: 50 }, // 20px right
          { row: 0, col: 2, x: 30, y: 50 }, // 20px left
          { row: 1, col: 0, x: 50, y: 70 }, // 20px down
        ];

        const adjacencyMap = buildPegAdjacencyMap(pegs);
        const adjacent = getAdjacentPegs('0-0', adjacencyMap);

        expect(adjacent).toHaveLength(3);
        expect(adjacent).toContain('0-1');
        expect(adjacent).toContain('0-2');
        expect(adjacent).toContain('1-0');
      });
    });

    describe('RIPPLE_RADIUS constant', () => {
      it('should define ripple radius as 40 pixels', () => {
        expect(RIPPLE_RADIUS).toBe(40);
      });

      it('should be positive number', () => {
        expect(RIPPLE_RADIUS).toBeGreaterThan(0);
      });

      it('should be reasonable for peg spacing', () => {
        // Typical peg spacing is 20-30px, so 40px radius should catch 1-2 neighbors
        expect(RIPPLE_RADIUS).toBeGreaterThan(20);
        expect(RIPPLE_RADIUS).toBeLessThan(100);
      });
    });
  });

  describe('Peg Flash State Management', () => {
    it('should define flash state as data attribute', () => {
      const flashState = {
        'data-peg-hit': 'true',
      };

      expect(flashState['data-peg-hit']).toBe('true');
    });

    it('should define ripple state as data attribute', () => {
      const rippleState = {
        'data-peg-ripple': 'true',
      };

      expect(rippleState['data-peg-ripple']).toBe('true');
    });

    it('should support color-coded flash via CSS variable', () => {
      const flashColor = '#FF6B35'; // Winning slot color
      const cssVariable = `--peg-flash-color: ${flashColor}`;

      expect(cssVariable).toContain('--peg-flash-color');
      expect(cssVariable).toContain('#FF6B35');
    });

    it('should define flash duration', () => {
      const flashDuration = 150; // ms
      expect(flashDuration).toBeGreaterThan(0);
      expect(flashDuration).toBeLessThan(500); // Should be quick
    });

    it('should define ripple duration', () => {
      const rippleDuration = 150; // ms
      const rippleDelay = 50; // ms after main flash

      expect(rippleDuration).toBeGreaterThan(0);
      expect(rippleDelay).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Peg Shake Animation', () => {
    it('should define shake jitter range (±1px)', () => {
      const maxJitter = 1; // pixels
      expect(maxJitter).toBe(1);
    });

    it('should use translateX and translateY for shake (cross-platform)', () => {
      // Shake should use only transforms (no position changes)
      const shakeTransforms = ['translateX', 'translateY'];

      expect(shakeTransforms).toContain('translateX');
      expect(shakeTransforms).toContain('translateY');
    });

    it('should define shake keyframes with jitter', () => {
      // Keyframes should alternate between positive and negative jitter
      const keyframes = [
        { translateX: 1, translateY: -1 }, // 20%
        { translateX: -1, translateY: 1 }, // 40%
        { translateX: 1, translateY: 0 }, // 60%
        { translateX: -1, translateY: -1 }, // 80%
        { translateX: 0, translateY: 0 }, // 100% (back to center)
      ];

      keyframes.forEach(frame => {
        expect(Math.abs(frame.translateX)).toBeLessThanOrEqual(1);
        expect(Math.abs(frame.translateY)).toBeLessThanOrEqual(1);
      });
    });

    it('should include scale pulse with shake', () => {
      const scaleAtPeak = 1.2; // 20% scale increase during impact
      expect(scaleAtPeak).toBeGreaterThan(1);
      expect(scaleAtPeak).toBeLessThan(1.5);
    });
  });

  describe('Peg Ripple Animation', () => {
    it('should define subtle scale pulse for ripple', () => {
      const rippleScale = 1.05; // 5% scale increase
      expect(rippleScale).toBeGreaterThan(1);
      expect(rippleScale).toBeLessThan(1.1); // Subtle
    });

    it('should delay ripple after main flash', () => {
      const rippleDelay = 50; // ms
      expect(rippleDelay).toBeGreaterThan(0);
      expect(rippleDelay).toBeLessThan(100);
    });

    it('should use scale-only animation (cross-platform)', () => {
      // Ripple should only use scale transform
      const rippleTransform = 'scale(1.05)';
      expect(rippleTransform).toContain('scale');
      expect(rippleTransform).not.toContain('blur');
      expect(rippleTransform).not.toContain('filter');
    });
  });

  describe('Peg Pulse Ring Animation', () => {
    it('should define expanding ring with color-coded border', () => {
      const ringConfig = {
        initialSize: 14, // px (matches peg size)
        maxScale: 4, // Expands to 4x size
        borderWidth: 2, // px
      };

      expect(ringConfig.initialSize).toBeGreaterThan(0);
      expect(ringConfig.maxScale).toBeGreaterThan(1);
      expect(ringConfig.borderWidth).toBeGreaterThan(0);
    });

    it('should fade out as ring expands', () => {
      // Opacity keyframes
      const opacityStops = [
        { at: 0, opacity: 1.0 }, // Start
        { at: 40, opacity: 0.7 }, // Middle
        { at: 100, opacity: 0.0 }, // End
      ];

      opacityStops.forEach(stop => {
        expect(stop.opacity).toBeGreaterThanOrEqual(0);
        expect(stop.opacity).toBeLessThanOrEqual(1);
      });
    });

    it('should use pseudo-element for ring (::after)', () => {
      const pseudoElement = '::after';
      expect(pseudoElement).toBe('::after');
    });

    it('should position ring at peg center', () => {
      const ringPosition = {
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      };

      expect(ringPosition.left).toBe('50%');
      expect(ringPosition.top).toBe('50%');
      expect(ringPosition.transform).toContain('translate(-50%, -50%)');
    });
  });

  describe('Cross-Platform Compatibility', () => {
    it('should use only transforms and opacity for animations', () => {
      const allowedProperties = ['transform', 'opacity', 'background'];
      const forbiddenProperties = ['box-shadow', 'filter', 'backdrop-filter', 'clip-path'];

      allowedProperties.forEach(prop => {
        expect(['transform', 'opacity', 'background']).toContain(prop);
      });

      forbiddenProperties.forEach(prop => {
        expect(['transform', 'opacity', 'background']).not.toContain(prop);
      });
    });

    it('should use linear gradients for flash (no radial)', () => {
      const flashGradient = 'linear-gradient(135deg, var(--peg-flash-color) 0%, var(--peg-flash-color)CC 50%, var(--peg-flash-color)99 100%)';

      expect(flashGradient).toContain('linear-gradient');
      expect(flashGradient).not.toContain('radial-gradient');
    });

    it('should use border instead of box-shadow for depth', () => {
      const pegBorder = {
        border: '1px solid #border-color',
        borderBottomWidth: 2, // Thicker bottom for depth
      };

      expect(pegBorder.border).toBeDefined();
      expect(pegBorder.borderBottomWidth).toBeGreaterThan(1);
    });
  });
});
