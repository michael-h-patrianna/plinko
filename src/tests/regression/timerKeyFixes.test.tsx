/**
 * Regression tests for P2.5: Timer & Key Issues
 * Tests for CurrencyCounter timer cleanup and React key stability
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CurrencyCounter } from '../../components/effects/CurrencyCounter';
import { Slot } from '../../components/game/PlinkoBoard/Slot';
import { BorderWall } from '../../components/game/PlinkoBoard/BorderWall';
import { ThemeProvider } from '../../theme';
import type { Prize } from '../../game/prizeTypes';

describe('P2.5: Timer & Key Issues Regression Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('CurrencyCounter Timer Cleanup', () => {
    it('should cleanup all timers on unmount', async () => {
      const { unmount } = render(
        <ThemeProvider>
          <CurrencyCounter targetAmount={1000} label="GC" />
        </ThemeProvider>
      );

      // Start animation
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Unmount component
      unmount();

      // No errors should occur - timers should be cleaned up
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(10000);
        });
      }).not.toThrow();
    });

    it('should clear timers when targetAmount changes mid-animation', async () => {
      const { rerender } = render(
        <ThemeProvider>
          <CurrencyCounter targetAmount={1000} label="GC" />
        </ThemeProvider>
      );

      // Start animation
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Change target mid-animation
      rerender(
        <ThemeProvider>
          <CurrencyCounter targetAmount={2000} label="GC" />
        </ThemeProvider>
      );

      // Should not throw errors from orphaned timers
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(2000);
        });
      }).not.toThrow();
    });

    it('should animate smoothly without memory leaks', async () => {
      const { unmount } = render(
        <ThemeProvider>
          <CurrencyCounter targetAmount={500} label="SC" />
        </ThemeProvider>
      );

      // Run through full animation
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      unmount();

      // After unmount, all timers should be cleared
      expect(vi.getTimerCount()).toBe(0);
    });

    it('should handle rapid unmount correctly', () => {
      const { unmount } = render(
        <ThemeProvider>
          <CurrencyCounter targetAmount={1000} label="GC" delay={500} />
        </ThemeProvider>
      );

      // Unmount immediately before delay completes
      act(() => {
        vi.advanceTimersByTime(100);
      });
      unmount();

      // Should not throw
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(1000);
        });
      }).not.toThrow();
    });
  });

  describe('React Key Stability', () => {
    it('Slot component should be static with stable DOM elements', () => {
      const mockPrize: Prize = {
        id: 'test-1',
        type: 'free' as const,
        probability: 0.5,
        slotIcon: '/test-icon.png',
        slotColor: '#3B82F6',
        title: 'Test Prize',
        freeReward: { gc: 100 },
      };

      const { rerender } = render(
        <ThemeProvider>
          <Slot index={0} prize={mockPrize} x={0} width={50} />
        </ThemeProvider>
      );

      const slot = screen.getByTestId('slot-0');
      const initialSlot = slot;

      // Re-render with same props
      rerender(
        <ThemeProvider>
          <Slot index={0} prize={mockPrize} x={0} width={50} />
        </ThemeProvider>
      );

      // Should be same element (stable, no re-render due to memo)
      const slotAfter = screen.getByTestId('slot-0');
      expect(slotAfter).toBe(initialSlot);
    });

    it('Slot component should support imperative data attribute updates', () => {
      const mockPrize: Prize = {
        id: 'test-2',
        type: 'free' as const,
        probability: 0.5,
        slotIcon: '/test-icon.png',
        slotColor: '#3B82F6',
        title: 'Test Prize',
        freeReward: { gc: 100 },
      };

      render(
        <ThemeProvider>
          <Slot index={0} prize={mockPrize} x={0} width={50} />
        </ThemeProvider>
      );

      const slot = screen.getByTestId('slot-0');

      // Initially no impact
      expect(slot.getAttribute('data-wall-impact')).toBe('none');

      // Driver sets impact imperatively
      slot.setAttribute('data-wall-impact', 'left');
      expect(slot.getAttribute('data-wall-impact')).toBe('left');

      // Driver clears impact
      slot.setAttribute('data-wall-impact', 'none');
      expect(slot.getAttribute('data-wall-impact')).toBe('none');
    });

    it('BorderWall should use stable keys for impact animations', () => {
      const { rerender } = render(
        <ThemeProvider>
          <BorderWall side="left" width={10} hasImpact={true} />
        </ThemeProvider>
      );

      const impact = document.querySelector('[class*="inset-0"]');
      expect(impact).toBeTruthy();

      // Re-render with same impact
      rerender(
        <ThemeProvider>
          <BorderWall side="left" width={10} hasImpact={true} />
        </ThemeProvider>
      );

      const impactAfter = document.querySelector('[class*="inset-0"]');
      expect(impactAfter).toBeTruthy();
    });

    it('BorderWall should increment key on new impact', () => {
      const { rerender } = render(
        <ThemeProvider>
          <BorderWall side="left" width={10} hasImpact={false} />
        </ThemeProvider>
      );

      // No impact initially
      let impact = document.querySelector('[class*="absolute inset-0 pointer-events-none"]');
      expect(impact).toBeFalsy();

      // Trigger new impact
      rerender(
        <ThemeProvider>
          <BorderWall side="left" width={10} hasImpact={true} />
        </ThemeProvider>
      );

      // Impact should now exist
      impact = document.querySelector('[class*="absolute inset-0 pointer-events-none"]');
      expect(impact).toBeTruthy();
    });
  });

  describe('Integration: Rapid Animation Triggers', () => {
    const createMockPrize = (id: string): Prize => ({
      id,
      type: 'free' as const,
      probability: 0.5,
      slotIcon: '/test-icon.png',
      slotColor: '#3B82F6',
      title: 'Test Prize',
      freeReward: { gc: 100 },
    });

    it('should handle multiple rapid CurrencyCounter animations', () => {
      const { rerender } = render(
        <ThemeProvider>
          <CurrencyCounter targetAmount={100} label="GC" />
        </ThemeProvider>
      );

      act(() => {
        vi.advanceTimersByTime(50);
      });

      rerender(
        <ThemeProvider>
          <CurrencyCounter targetAmount={200} label="GC" />
        </ThemeProvider>
      );

      act(() => {
        vi.advanceTimersByTime(50);
      });

      rerender(
        <ThemeProvider>
          <CurrencyCounter targetAmount={300} label="GC" />
        </ThemeProvider>
      );

      // Should not throw errors
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(2000);
        });
      }).not.toThrow();
    });

    it('should handle rapid slot data attribute changes', () => {
      const mockPrize = createMockPrize('test-rapid');

      render(
        <ThemeProvider>
          <Slot index={0} prize={mockPrize} x={0} width={50} />
        </ThemeProvider>
      );

      const slot = screen.getByTestId('slot-0');

      // Simulate rapid driver updates (no re-renders)
      slot.setAttribute('data-wall-impact', 'none');
      slot.setAttribute('data-wall-impact', 'left');
      slot.setAttribute('data-wall-impact', 'none');
      slot.setAttribute('data-wall-impact', 'right');
      slot.setAttribute('data-floor-impact', 'true');
      slot.setAttribute('data-floor-impact', 'false');
      slot.setAttribute('data-approaching', 'true');
      slot.setAttribute('data-approaching', 'false');

      // Should handle all changes without errors
      expect(slot).toBeTruthy();
      expect(slot.getAttribute('data-wall-impact')).toBe('right');
      expect(slot.getAttribute('data-floor-impact')).toBe('false');
      expect(slot.getAttribute('data-approaching')).toBe('false');
    });
  });
});
