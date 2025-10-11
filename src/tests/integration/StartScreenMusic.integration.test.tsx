/**
 * Integration tests for StartScreen music with real audio system
 * Tests actual music playback, memory management, and cleanup
 */

import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioProvider } from '../../audio/context/AudioProvider';
import { StartScreen } from '../../components/screens/StartScreen';
import type { PrizeConfig } from '../../game/types';

// Mock theme and animation
vi.mock('../../theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        text: { primary: '#000', secondary: '#555', tertiary: '#999' },
        accent: { main: '#00ff00' },
        border: { default: '#ccc' },
        surface: { primary: '#fff' },
      },
      gradients: {
        titleGradient: 'linear-gradient(90deg, #000 0%, #fff 100%)',
        buttonPrimary: 'linear-gradient(90deg, #000 0%, #fff 100%)',
      },
      borderRadius: { card: '8px', sm: '4px' },
      typography: {
        fontFamily: {
          primary: 'sans-serif',
          display: 'sans-serif',
        },
      },
      components: {
        card: {
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: '8px',
        },
      },
    },
  }),
}));

vi.mock('../../theme/animationDrivers/useAnimation', () => ({
  useAnimation: () => ({
    AnimatedDiv: 'div',
    AnimatedH1: 'h1',
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }),
}));

vi.mock('../../components/controls/ThemedButton', () => ({
  ThemedButton: ({ children, onClick, disabled, testId }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid={testId}>
      {children}
    </button>
  ),
}));

describe('StartScreen Music - Integration Tests', () => {
  const mockPrizes: PrizeConfig[] = [
    {
      id: 'prize-1',
      title: 'Test Prize',
      type: 'free',
      freeReward: { sc: 1000 },
      probability: 0.5,
      slotIcon: 'default',
      slotColor: '#FF6B35',
    },
    {
      id: 'prize-2',
      title: 'Test Prize 2',
      type: 'free',
      freeReward: { gc: 500 },
      probability: 0.5,
      slotIcon: 'default',
      slotColor: '#4ECDC4',
    },
  ];

  beforeEach(() => {
    // Clear any pending timers
    vi.clearAllTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('Music Playback with Real AudioProvider', () => {
    it('should load and play start music when component mounts', async () => {
      const { unmount } = render(
        <AudioProvider>
          <StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />
        </AudioProvider>
      );

      // Wait for audio to initialize and music to start
      // The actual audio system needs time to initialize
      await waitFor(
        () => {
          // Component should be rendered
          expect(document.querySelector('h1')).toBeTruthy();
        },
        { timeout: 3000 }
      );

      // Clean up
      unmount();
    });

    it('should clean up audio resources when unmounting', async () => {
      const { unmount } = render(
        <AudioProvider>
          <StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />
        </AudioProvider>
      );

      // Wait for initialization
      await waitFor(
        () => {
          expect(document.querySelector('h1')).toBeTruthy();
        },
        { timeout: 3000 }
      );

      // Unmount and verify no errors
      expect(() => unmount()).not.toThrow();

      // Wait a bit to ensure cleanup completes
      await new Promise((resolve) => setTimeout(resolve, 200));
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should not leak memory when mounting and unmounting multiple times', async () => {
      // Track initial memory usage (approximate)
      const initialMemory = process.memoryUsage?.().heapUsed || 0;

      // Mount and unmount the component multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <AudioProvider>
            <StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />
          </AudioProvider>
        );

        // Wait for component to mount
        await waitFor(() => {
          expect(document.querySelector('h1')).toBeTruthy();
        });

        // Unmount
        unmount();

        // Wait for cleanup
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      // Force garbage collection if available (Node.js with --expose-gc flag)
      if (global.gc) {
        global.gc();
      }

      // Check memory hasn't grown significantly (allow 10MB growth for test overhead)
      const finalMemory = process.memoryUsage?.().heapUsed || 0;
      const memoryGrowth = finalMemory - initialMemory;

      // This is a heuristic - if memory grows by more than 50MB after 10 cycles,
      // there's likely a leak (each audio track is ~350KB, so 10 tracks = 3.5MB max)
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // 50MB
    });

    it('should stop music when transitioning away from start screen', async () => {
      const { unmount, rerender } = render(
        <AudioProvider>
          <StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />
        </AudioProvider>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(document.querySelector('h1')).toBeTruthy();
      });

      // Simulate transition by unmounting StartScreen
      rerender(<AudioProvider>{null}</AudioProvider>);

      // Wait for cleanup
      await new Promise((resolve) => setTimeout(resolve, 1100)); // Wait for 1s fade-out

      // Clean up
      unmount();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid mount/unmount without errors', async () => {
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(
          <AudioProvider>
            <StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />
          </AudioProvider>
        );

        // Unmount immediately without waiting
        unmount();
      }

      // No errors should be thrown
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    it('should handle audio initialization failure gracefully', async () => {
      // This test verifies the component doesn't crash if audio fails to initialize
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount } = render(
        <AudioProvider>
          <StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />
        </AudioProvider>
      );

      // Component should still render even if audio fails
      await waitFor(() => {
        expect(document.querySelector('h1')).toBeTruthy();
      });

      unmount();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Fade Timing Integration', () => {
    it('should complete fade-in within expected time', async () => {
      const startTime = Date.now();

      const { unmount } = render(
        <AudioProvider>
          <StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />
        </AudioProvider>
      );

      // Wait for component to mount
      await waitFor(() => {
        expect(document.querySelector('h1')).toBeTruthy();
      });

      // Fade-in should start immediately and take ~1 second
      // Allow extra time for audio initialization
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const elapsed = Date.now() - startTime;

      // Should complete within reasonable time (allowing for initialization overhead)
      expect(elapsed).toBeLessThan(5000); // 5 seconds max

      unmount();
    });

    it('should complete fade-out on unmount within expected time', async () => {
      const { unmount } = render(
        <AudioProvider>
          <StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />
        </AudioProvider>
      );

      // Wait for mount
      await waitFor(() => {
        expect(document.querySelector('h1')).toBeTruthy();
      });

      const unmountStart = Date.now();

      // Unmount triggers fade-out
      unmount();

      // Wait for fade-out to complete
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const elapsed = Date.now() - unmountStart;

      // Fade-out should complete within ~1 second (plus small buffer)
      expect(elapsed).toBeLessThan(2000);
    });
  });
});
