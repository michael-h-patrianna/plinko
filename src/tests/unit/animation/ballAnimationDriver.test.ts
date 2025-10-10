/**
 * Integration tests for Ball Animation Driver system
 * Verifies driver API, DOM manipulation, and animation scheduling
 *
 * @vitest-environment jsdom
 */

import type { BallTransform, TrailFrame } from '@/animation/ballAnimationDriver';
import {
  createWebBallAnimationDriver,
  WebBallAnimationDriver,
} from '@/animation/ballAnimationDriver.web';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock animation adapter
vi.mock('../../../utils/platform/animation', () => ({
  animationAdapter: {
    requestFrame: vi.fn((callback: (timestamp: number) => void) => {
      // Immediately call callback for testing with a timestamp
      setTimeout(() => callback(Date.now()), 0);
      return Math.random(); // Return fake RAF ID
    }),
    cancelFrame: vi.fn(),
    now: vi.fn(() => Date.now()),
  },
}));

describe('Ball Animation Driver Integration', () => {
  let ballMain: HTMLDivElement;
  let ballGlowOuter: HTMLDivElement;
  let ballGlowMid: HTMLDivElement;
  let trailElements: HTMLDivElement[];
  let driver: WebBallAnimationDriver;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create DOM elements
    ballMain = document.createElement('div');
    ballMain.setAttribute('data-testid', 'ball-main');

    ballGlowOuter = document.createElement('div');
    ballGlowOuter.setAttribute('data-testid', 'ball-glow-outer');

    ballGlowMid = document.createElement('div');
    ballGlowMid.setAttribute('data-testid', 'ball-glow-mid');

    // Create trail elements
    trailElements = Array.from({ length: 20 }, (_, i) => {
      const el = document.createElement('div');
      el.setAttribute('data-testid', `trail-${i}`);
      el.style.display = 'none';
      return el;
    });

    // Append to document body
    document.body.appendChild(ballMain);
    document.body.appendChild(ballGlowOuter);
    document.body.appendChild(ballGlowMid);
    trailElements.forEach((el) => document.body.appendChild(el));

    // Create driver
    driver = createWebBallAnimationDriver({
      ballMain,
      ballGlowOuter,
      ballGlowMid,
      trailElements,
      maxTrailLength: 20,
    });
  });

  afterEach(() => {
    // Cleanup DOM
    document.body.innerHTML = '';

    // Cleanup driver
    if (driver) {
      driver.destroy?.();
    }

    vi.clearAllMocks();
  });

  describe('Driver Creation', () => {
    it('should create driver instance', () => {
      expect(driver).toBeInstanceOf(WebBallAnimationDriver);
    });

    it('should accept refs configuration', () => {
      const refs = {
        ballMain: document.createElement('div'),
        ballGlowOuter: document.createElement('div'),
        ballGlowMid: document.createElement('div'),
        trailElements: [document.createElement('div')],
        maxTrailLength: 10,
      };

      const newDriver = createWebBallAnimationDriver(refs);
      expect(newDriver).toBeInstanceOf(WebBallAnimationDriver);
    });

    it('should handle null refs gracefully', () => {
      const refs = {
        ballMain: null,
        ballGlowOuter: null,
        ballGlowMid: null,
        trailElements: [],
        maxTrailLength: 20,
      };

      const newDriver = createWebBallAnimationDriver(refs);
      expect(newDriver).toBeInstanceOf(WebBallAnimationDriver);
    });
  });

  describe('Ball Transform Application', () => {
    it('should apply ball position transform', () => {
      const transform: BallTransform = {
        position: { x: 100, y: 200, rotation: 45 },
        stretch: { scaleX: 1, scaleY: 1 },
      };

      driver.applyBallTransform(transform);

      expect(ballMain.style.transform).toContain('translate(93px, 193px)');
      expect(ballMain.style.transform).toContain('rotate(45deg)');
    });

    it('should apply rotation to ball', () => {
      const transform: BallTransform = {
        position: { x: 50, y: 50, rotation: 90 },
        stretch: { scaleX: 1, scaleY: 1 },
      };

      driver.applyBallTransform(transform);

      expect(ballMain.style.transform).toContain('rotate(90deg)');
    });

    it('should apply squash/stretch to ball', () => {
      const transform: BallTransform = {
        position: { x: 100, y: 200, rotation: 0 },
        stretch: { scaleX: 1.2, scaleY: 0.8 },
      };

      driver.applyBallTransform(transform);

      expect(ballMain.style.transform).toContain('scaleX(1.2)');
      expect(ballMain.style.transform).toContain('scaleY(0.8)');
    });

    it('should apply transform to glow layers', () => {
      const transform: BallTransform = {
        position: { x: 150, y: 250, rotation: 30 },
        stretch: { scaleX: 1.1, scaleY: 0.9 },
      };

      driver.applyBallTransform(transform);

      // Outer glow (offset by 20px to center 40px element)
      expect(ballGlowOuter.style.transform).toContain('translate(130px, 230px)');
      expect(ballGlowOuter.style.transform).toContain('scaleX(1.1)');
      expect(ballGlowOuter.style.transform).toContain('scaleY(0.9)');

      // Mid glow (offset by 14px to center 28px element)
      expect(ballGlowMid.style.transform).toContain('translate(136px, 236px)');
      expect(ballGlowMid.style.transform).toContain('scaleX(1.1)');
      expect(ballGlowMid.style.transform).toContain('scaleY(0.9)');
    });

    it('should handle negative positions', () => {
      const transform: BallTransform = {
        position: { x: -50, y: -100, rotation: 0 },
        stretch: { scaleX: 1, scaleY: 1 },
      };

      driver.applyBallTransform(transform);

      expect(ballMain.style.transform).toContain('translate(-57px, -107px)');
    });

    it('should handle zero rotation', () => {
      const transform: BallTransform = {
        position: { x: 100, y: 200, rotation: 0 },
        stretch: { scaleX: 1, scaleY: 1 },
      };

      driver.applyBallTransform(transform);

      expect(ballMain.style.transform).toContain('rotate(0deg)');
    });

    it('should handle null ball elements gracefully', () => {
      const nullDriver = createWebBallAnimationDriver({
        ballMain: null,
        ballGlowOuter: null,
        ballGlowMid: null,
        trailElements: [],
        maxTrailLength: 20,
      });

      const transform: BallTransform = {
        position: { x: 100, y: 200, rotation: 45 },
        stretch: { scaleX: 1, scaleY: 1 },
      };

      // Should not throw
      expect(() => nullDriver.applyBallTransform(transform)).not.toThrow();
    });
  });

  describe('Trail Updates', () => {
    it('should update trail element positions', () => {
      const trailFrames: TrailFrame[] = [
        { x: 100, y: 200, opacity: 0.9, scale: 1 },
        { x: 95, y: 195, opacity: 0.7, scale: 0.9 },
        { x: 90, y: 190, opacity: 0.5, scale: 0.8 },
      ];

      driver.updateTrail(trailFrames);

      expect(trailElements[0]!.style.display).toBe('block');
      expect(trailElements[0]!.style.transform).toContain('translate(100px, 200px)');
      expect(trailElements[0]!.style.transform).toContain('scale(1)');
      expect(trailElements[0]!.style.opacity).toBe('0.9');

      expect(trailElements[1]!.style.display).toBe('block');
      expect(trailElements[1]!.style.transform).toContain('translate(95px, 195px)');
      expect(trailElements[1]!.style.opacity).toBe('0.7');

      expect(trailElements[2]!.style.display).toBe('block');
      expect(trailElements[2]!.style.transform).toContain('translate(90px, 190px)');
      expect(trailElements[2]!.style.opacity).toBe('0.5');
    });

    it('should hide unused trail elements', () => {
      const trailFrames: TrailFrame[] = [
        { x: 100, y: 200, opacity: 0.9, scale: 1 },
        { x: 95, y: 195, opacity: 0.7, scale: 0.9 },
      ];

      driver.updateTrail(trailFrames);

      // First 2 should be visible
      expect(trailElements[0]!.style.display).toBe('block');
      expect(trailElements[1]!.style.display).toBe('block');

      // Rest should be hidden
      expect(trailElements[2]!.style.display).toBe('none');
      expect(trailElements[3]!.style.display).toBe('none');
    });

    it('should respect maxTrailLength', () => {
      const trailFrames: TrailFrame[] = Array.from({ length: 30 }, (_, i) => ({
        x: 100 - i * 5,
        y: 200 - i * 5,
        opacity: 1 - i * 0.03,
        scale: 1 - i * 0.02,
      }));

      driver.updateTrail(trailFrames);

      // Only first 20 should be updated (maxTrailLength)
      expect(trailElements[19]!.style.display).toBe('block');
    });

    it('should handle empty trail array', () => {
      driver.updateTrail([]);

      // All trail elements should be hidden
      trailElements.forEach((el) => {
        expect(el.style.display).toBe('none');
      });
    });

    it('should handle single trail point', () => {
      const trailFrames: TrailFrame[] = [{ x: 100, y: 200, opacity: 0.9, scale: 1 }];

      driver.updateTrail(trailFrames);

      expect(trailElements[0]!.style.display).toBe('block');
      expect(trailElements[1]!.style.display).toBe('none');
    });

    it('should apply opacity correctly', () => {
      const trailFrames: TrailFrame[] = [
        { x: 100, y: 200, opacity: 0, scale: 1 },
        { x: 95, y: 195, opacity: 0.5, scale: 1 },
        { x: 90, y: 190, opacity: 1, scale: 1 },
      ];

      driver.updateTrail(trailFrames);

      expect(trailElements[0]!.style.opacity).toBe('0');
      expect(trailElements[1]!.style.opacity).toBe('0.5');
      expect(trailElements[2]!.style.opacity).toBe('1');
    });

    it('should apply scale correctly', () => {
      const trailFrames: TrailFrame[] = [
        { x: 100, y: 200, opacity: 1, scale: 0.3 },
        { x: 95, y: 195, opacity: 1, scale: 0.7 },
        { x: 90, y: 190, opacity: 1, scale: 1.0 },
      ];

      driver.updateTrail(trailFrames);

      expect(trailElements[0]!.style.transform).toContain('scale(0.3)');
      expect(trailElements[1]!.style.transform).toContain('scale(0.7)');
      expect(trailElements[2]!.style.transform).toContain('scale(1)');
    });
  });

  describe('Trail Clearing', () => {
    it('should clear all trail elements', () => {
      // First, show some trail elements
      const trailFrames: TrailFrame[] = [
        { x: 100, y: 200, opacity: 0.9, scale: 1 },
        { x: 95, y: 195, opacity: 0.7, scale: 0.9 },
        { x: 90, y: 190, opacity: 0.5, scale: 0.8 },
      ];
      driver.updateTrail(trailFrames);

      // Verify they're visible
      expect(trailElements[0]!.style.display).toBe('block');
      expect(trailElements[1]!.style.display).toBe('block');

      // Clear trail
      driver.clearTrail();

      // All should be hidden
      trailElements.forEach((el) => {
        expect(el.style.display).toBe('none');
      });
    });

    it('should handle clearing when trail is already cleared', () => {
      driver.clearTrail();

      // Should not throw
      expect(() => driver.clearTrail()).not.toThrow();

      trailElements.forEach((el) => {
        expect(el.style.display).toBe('none');
      });
    });

    it('should handle null trail elements gracefully', () => {
      const nullDriver = createWebBallAnimationDriver({
        ballMain: null,
        ballGlowOuter: null,
        ballGlowMid: null,
        trailElements: [null, null, null],
        maxTrailLength: 3,
      });

      // Should not throw
      expect(() => nullDriver.clearTrail()).not.toThrow();
    });
  });

  describe('Animation Scheduling', () => {
    const mockConfig = {
      totalFrames: 100,
      trajectoryFps: 60,
      displayFps: 60,
      onComplete: vi.fn(),
    };

    it('should schedule animation loop with config', async () => {
      const updateFn = vi.fn();

      driver.schedule(updateFn, mockConfig);

      // Wait longer for async callback to fire
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify update was called (mocked RAF calls callback asynchronously)
      expect(updateFn).toHaveBeenCalled();
    });

    it('should call update function with frame number', async () => {
      const updateFn = vi.fn();

      driver.schedule(updateFn, mockConfig);

      // Wait longer for async callback to fire
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should be called at least once with a frame number (0 or higher)
      expect(updateFn).toHaveBeenCalled();
      expect(updateFn.mock.calls[0]![0]).toBeGreaterThanOrEqual(0);
    });

    it('should return cancel function', () => {
      const cancel = driver.schedule(vi.fn(), mockConfig);

      expect(cancel).toBeInstanceOf(Function);
    });

    it('should cancel animation when cancel function is called', () => {
      const cancel = driver.schedule(vi.fn(), mockConfig);

      // Cancel should not throw
      expect(() => cancel()).not.toThrow();
    });

    it('should call onComplete callback after animation duration', () => {
      vi.useFakeTimers();

      const onComplete = vi.fn();
      const config = {
        totalFrames: 60,
        trajectoryFps: 60,
        displayFps: 60,
        onComplete,
      };

      driver.schedule(vi.fn(), config);

      // Animation duration: 60 frames / 60 fps = 1000ms
      // Landing timeout: GAME_TIMEOUT.LANDING_COMPLETE (need to import)
      // For now, advance by a reasonable amount
      vi.advanceTimersByTime(2000);

      expect(onComplete).toHaveBeenCalled();

      vi.restoreAllMocks();
    });

    it('should handle animation scheduling without errors', () => {
      const updateFn = vi.fn();

      expect(() => {
        const cancel = driver.schedule(updateFn, mockConfig);
        cancel();
      }).not.toThrow();
    });

    it('should clean up landing timeout when canceled', () => {
      vi.useFakeTimers();

      const onComplete = vi.fn();
      const config = {
        totalFrames: 60,
        trajectoryFps: 60,
        displayFps: 60,
        onComplete,
      };

      const cancel = driver.schedule(vi.fn(), config);
      cancel();

      // Advance timers - onComplete should not be called
      vi.advanceTimersByTime(5000);

      expect(onComplete).not.toHaveBeenCalled();

      vi.restoreAllMocks();
    });
  });

  describe('Peg Flash Effects', () => {
    it('should flash peg element', () => {
      const pegEl = document.createElement('div');
      pegEl.setAttribute('data-testid', 'peg-1-2');
      document.body.appendChild(pegEl);

      driver.flashPeg('1-2');

      expect(pegEl.getAttribute('data-peg-hit')).toBe('true');
    });

    it('should clear flash after timeout', () => {
      vi.useFakeTimers();

      const pegEl = document.createElement('div');
      pegEl.setAttribute('data-testid', 'peg-1-2');
      document.body.appendChild(pegEl);

      driver.flashPeg('1-2');

      expect(pegEl.getAttribute('data-peg-hit')).toBe('true');

      // Advance timers by 300ms
      vi.advanceTimersByTime(300);

      expect(pegEl.getAttribute('data-peg-hit')).toBe('false');

      vi.restoreAllMocks();
    });

    it('should handle missing peg element gracefully', () => {
      // Should not throw
      expect(() => driver.flashPeg('nonexistent')).not.toThrow();
    });

    it('should clear existing flash timeout when flashing same peg', () => {
      vi.useFakeTimers();

      const pegEl = document.createElement('div');
      pegEl.setAttribute('data-testid', 'peg-1-2');
      document.body.appendChild(pegEl);

      // Flash twice
      driver.flashPeg('1-2');
      vi.advanceTimersByTime(100);
      driver.flashPeg('1-2');

      // Advance to where first timeout would have fired
      vi.advanceTimersByTime(250);

      // Should still be flashing (second timeout hasn't expired yet)
      expect(pegEl.getAttribute('data-peg-hit')).toBe('true');

      vi.restoreAllMocks();
    });

    it('should update peg flash state imperatively', () => {
      const pegEl = document.createElement('div');
      pegEl.setAttribute('data-testid', 'peg-3-4');
      document.body.appendChild(pegEl);

      driver.updatePegFlash('3-4', true);
      expect(pegEl.getAttribute('data-peg-hit')).toBe('true');

      driver.updatePegFlash('3-4', false);
      expect(pegEl.getAttribute('data-peg-hit')).toBe('false');
    });

    it('should clear all peg flashes', () => {
      const peg1 = document.createElement('div');
      peg1.setAttribute('data-testid', 'peg-1-1');
      const peg2 = document.createElement('div');
      peg2.setAttribute('data-testid', 'peg-2-2');

      document.body.appendChild(peg1);
      document.body.appendChild(peg2);

      driver.updatePegFlash('1-1', true);
      driver.updatePegFlash('2-2', true);

      driver.clearAllPegFlashes();

      expect(peg1.getAttribute('data-peg-hit')).toBe('false');
      expect(peg2.getAttribute('data-peg-hit')).toBe('false');
    });
  });

  describe('Slot Highlight Effects', () => {
    it('should update slot highlight state', () => {
      const slotEl = document.createElement('div');
      slotEl.setAttribute('data-testid', 'slot-0');
      document.body.appendChild(slotEl);

      driver.updateSlotHighlight(0, true);
      expect(slotEl.getAttribute('data-approaching')).toBe('true');

      driver.updateSlotHighlight(0, false);
      expect(slotEl.getAttribute('data-approaching')).toBe('false');
    });

    it('should update slot collision state', () => {
      const slotEl = document.createElement('div');
      slotEl.setAttribute('data-testid', 'slot-1');
      document.body.appendChild(slotEl);

      driver.updateSlotCollision(1, 'left', false);
      expect(slotEl.getAttribute('data-wall-impact')).toBe('left');

      driver.updateSlotCollision(1, null, true);
      expect(slotEl.getAttribute('data-wall-impact')).toBe('none');
      expect(slotEl.getAttribute('data-floor-impact')).toBe('true');
    });

    it('should auto-clear slot collision state after 300ms', () => {
      vi.useFakeTimers();

      const slotEl = document.createElement('div');
      slotEl.setAttribute('data-testid', 'slot-2');
      document.body.appendChild(slotEl);

      // Set wall impact
      driver.updateSlotCollision(2, 'left', false);
      expect(slotEl.getAttribute('data-wall-impact')).toBe('left');

      // Advance time by 300ms
      vi.advanceTimersByTime(300);
      expect(slotEl.getAttribute('data-wall-impact')).toBe('none');

      // Set floor impact
      driver.updateSlotCollision(2, null, true);
      expect(slotEl.getAttribute('data-floor-impact')).toBe('true');

      // Advance time by 300ms
      vi.advanceTimersByTime(300);
      expect(slotEl.getAttribute('data-floor-impact')).toBe('false');

      vi.restoreAllMocks();
    });

    it('should clear all slot highlights', () => {
      const slot1 = document.createElement('div');
      slot1.setAttribute('data-testid', 'slot-0');
      const slot2 = document.createElement('div');
      slot2.setAttribute('data-testid', 'slot-1');

      document.body.appendChild(slot1);
      document.body.appendChild(slot2);

      driver.updateSlotHighlight(0, true);
      driver.updateSlotCollision(1, 'right', true);

      driver.clearAllSlotHighlights();

      expect(slot1.getAttribute('data-approaching')).toBe('false');
      expect(slot2.getAttribute('data-approaching')).toBe('false');
      expect(slot2.getAttribute('data-wall-impact')).toBe('none');
      expect(slot2.getAttribute('data-floor-impact')).toBe('false');
    });

    it('should handle missing slot element gracefully', () => {
      expect(() => driver.updateSlotHighlight(99, true)).not.toThrow();
      expect(() => driver.updateSlotCollision(99, 'left', true)).not.toThrow();
    });
  });

  describe('Driver Cleanup', () => {
    it('should cleanup peg flash timeouts on destroy', () => {
      vi.useFakeTimers();

      const pegEl = document.createElement('div');
      pegEl.setAttribute('data-testid', 'peg-1-2');
      document.body.appendChild(pegEl);

      driver.flashPeg('1-2');
      driver.destroy();

      // Timeout should be cleared
      vi.advanceTimersByTime(300);

      vi.restoreAllMocks();
    });

    it('should handle destroy with no active flashes', () => {
      expect(() => driver.destroy()).not.toThrow();
    });

    it('should handle destroy with multiple active flashes', () => {
      const peg1 = document.createElement('div');
      peg1.setAttribute('data-testid', 'peg-1-2');
      const peg2 = document.createElement('div');
      peg2.setAttribute('data-testid', 'peg-3-4');
      document.body.appendChild(peg1);
      document.body.appendChild(peg2);

      driver.flashPeg('1-2');
      driver.flashPeg('3-4');

      expect(() => driver.destroy()).not.toThrow();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle full ball drop sequence', () => {
      // Apply ball transforms
      for (let i = 0; i < 10; i++) {
        const transform: BallTransform = {
          position: { x: 100 + i * 10, y: 200 + i * 20, rotation: i * 10 },
          stretch: { scaleX: 1, scaleY: 1 },
        };
        driver.applyBallTransform(transform);

        // Update trail
        const trailFrames: TrailFrame[] = Array.from({ length: i + 1 }, (_, j) => ({
          x: 100 + i * 10 - j * 5,
          y: 200 + i * 20 - j * 5,
          opacity: 0.9 - j * 0.1,
          scale: 1 - j * 0.05,
        }));
        driver.updateTrail(trailFrames);
      }

      // Verify final state
      expect(ballMain.style.transform).toContain('translate(183px, 373px)');
      expect(trailElements[0]!.style.display).toBe('block');
    });

    it('should handle reset after animation', () => {
      // Animate
      const transform: BallTransform = {
        position: { x: 100, y: 200, rotation: 45 },
        stretch: { scaleX: 1.2, scaleY: 0.8 },
      };
      driver.applyBallTransform(transform);

      const trailFrames: TrailFrame[] = [
        { x: 100, y: 200, opacity: 0.9, scale: 1 },
        { x: 95, y: 195, opacity: 0.7, scale: 0.9 },
      ];
      driver.updateTrail(trailFrames);

      // Reset
      driver.clearTrail();

      // Verify cleared
      trailElements.forEach((el) => {
        expect(el.style.display).toBe('none');
      });
    });

    it('should handle rapid transform updates', () => {
      // Simulate 60 FPS updates
      for (let i = 0; i < 60; i++) {
        const transform: BallTransform = {
          position: { x: 100 + i, y: 200 + i, rotation: i },
          stretch: { scaleX: 1, scaleY: 1 },
        };
        driver.applyBallTransform(transform);
      }

      // Should have final transform applied
      expect(ballMain.style.transform).toContain('translate(152px, 252px)');
    });
  });
});
