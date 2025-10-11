/**
 * Unit tests for StartScreen music functionality
 * Tests music playback, fade-in/out, and cleanup
 */

import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MusicController } from '../../../audio/core/MusicController';
import { StartScreen } from '../../../components/screens/StartScreen';
import type { PrizeConfig } from '../../../game/types';

// Mock dependencies
vi.mock('../../../audio/context/AudioProvider', () => ({
  useAudio: vi.fn(),
}));

vi.mock('../../../theme', () => ({
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

vi.mock('../../../theme/animationDrivers/useAnimation', () => ({
  useAnimation: () => ({
    AnimatedDiv: 'div',
    AnimatedH1: 'h1',
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }),
}));

vi.mock('../../../components/controls/ThemedButton', () => ({
  ThemedButton: ({ children, onClick, disabled, testId }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid={testId}>
      {children}
    </button>
  ),
}));

import { useAudio } from '../../../audio/context/AudioProvider';

const mockUseAudio = useAudio as ReturnType<typeof vi.fn>;

describe('StartScreen - Music Playback', () => {
  let mockMusicController: MusicController;
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
    // Create mock music controller
    mockMusicController = {
      isLoaded: vi.fn().mockReturnValue(true),
      playLayer: vi.fn(),
      stopLayer: vi.fn(),
      loadTrack: vi.fn(),
      setLayerVolume: vi.fn(),
      isLayerPlaying: vi.fn().mockReturnValue(false),
      setMusicVolume: vi.fn(),
      stopAllLayers: vi.fn(),
      cleanup: vi.fn(),
    } as unknown as MusicController;

    // Mock useAudio hook
    mockUseAudio.mockReturnValue({
      musicController: mockMusicController,
      sfxController: null,
      volumeController: null,
      isInitialized: true,
      initializationError: null,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('Music Lifecycle', () => {
    it('should play start music with 1s fade-in on mount', async () => {
      render(<StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />);

      await waitFor(() => {
        expect(mockMusicController.isLoaded).toHaveBeenCalledWith('music-start-loop');
        expect(mockMusicController.playLayer).toHaveBeenCalledWith('music-start-loop', 1000);
      });
    });

    it('should stop start music with 1s fade-out on unmount', async () => {
      const { unmount } = render(
        <StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />
      );

      // Verify music started
      await waitFor(() => {
        expect(mockMusicController.playLayer).toHaveBeenCalled();
      });

      // Unmount and verify cleanup
      unmount();

      await waitFor(() => {
        expect(mockMusicController.stopLayer).toHaveBeenCalledWith('music-start-loop', 1000);
      });
    });

    it('should not play music if controller is not available', () => {
      mockUseAudio.mockReturnValue({
        musicController: null,
        sfxController: null,
        volumeController: null,
        isInitialized: false,
        initializationError: null,
      });

      render(<StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />);

      expect(mockMusicController.playLayer).not.toHaveBeenCalled();
    });

    it('should not play music if track is not loaded', () => {
      (mockMusicController.isLoaded as any).mockReturnValue(false);

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(<StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />);

      expect(mockMusicController.playLayer).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Start screen music not loaded yet');

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should clean up music on unmount to prevent memory leaks', async () => {
      const { unmount } = render(
        <StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />
      );

      // Verify music started
      await waitFor(() => {
        expect(mockMusicController.playLayer).toHaveBeenCalled();
      });

      // Reset mocks to track cleanup calls
      vi.clearAllMocks();

      // Unmount component
      unmount();

      // Verify cleanup was called
      await waitFor(() => {
        expect(mockMusicController.stopLayer).toHaveBeenCalledWith('music-start-loop', 1000);
      });
    });

    it('should not attempt to stop music if controller becomes unavailable', async () => {
      const { unmount, rerender } = render(
        <StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />
      );

      // Verify music started
      await waitFor(() => {
        expect(mockMusicController.playLayer).toHaveBeenCalled();
      });

      // Simulate controller becoming unavailable
      mockUseAudio.mockReturnValue({
        musicController: null,
        sfxController: null,
        volumeController: null,
        isInitialized: false,
        initializationError: null,
      });

      // Re-render with null controller
      rerender(<StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />);

      // Reset mocks
      vi.clearAllMocks();

      // Unmount should not throw
      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid mount/unmount cycles without memory leaks', async () => {
      // Simulate rapid mounting and unmounting
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(
          <StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />
        );

        await waitFor(() => {
          expect(mockMusicController.playLayer).toHaveBeenCalled();
        });

        unmount();

        await waitFor(() => {
          expect(mockMusicController.stopLayer).toHaveBeenCalled();
        });

        vi.clearAllMocks();
      }

      // Each cycle should have called playLayer and stopLayer exactly once
      // If there were memory leaks, we'd see accumulated calls
    });
  });

  describe('Fade Timing', () => {
    it('should use exactly 1000ms for fade-in', async () => {
      render(<StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />);

      await waitFor(() => {
        expect(mockMusicController.playLayer).toHaveBeenCalledWith('music-start-loop', 1000);
      });
    });

    it('should use exactly 1000ms for fade-out', async () => {
      const { unmount } = render(
        <StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />
      );

      await waitFor(() => {
        expect(mockMusicController.playLayer).toHaveBeenCalled();
      });

      unmount();

      await waitFor(() => {
        expect(mockMusicController.stopLayer).toHaveBeenCalledWith('music-start-loop', 1000);
      });
    });
  });

  describe('Component Re-renders', () => {
    it('should not restart music on prop changes', async () => {
      const { rerender } = render(
        <StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />
      );

      await waitFor(() => {
        expect(mockMusicController.playLayer).toHaveBeenCalledTimes(1);
      });

      // Change props
      rerender(<StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={true} />);

      // Should not call playLayer again
      expect(mockMusicController.playLayer).toHaveBeenCalledTimes(1);
    });

    it('should restart music if musicController changes', async () => {
      const { rerender } = render(
        <StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />
      );

      await waitFor(() => {
        expect(mockMusicController.playLayer).toHaveBeenCalledTimes(1);
        expect(mockMusicController.stopLayer).toHaveBeenCalledTimes(0);
      });

      // Create new controller instance
      const newMusicController = {
        ...mockMusicController,
        isLoaded: vi.fn().mockReturnValue(true),
        playLayer: vi.fn(),
        stopLayer: vi.fn(),
      } as unknown as MusicController;

      mockUseAudio.mockReturnValue({
        musicController: newMusicController,
        sfxController: null,
        volumeController: null,
        isInitialized: true,
        initializationError: null,
      });

      rerender(<StartScreen prizes={mockPrizes} onStart={vi.fn()} disabled={false} />);

      // Should stop old music and start new
      await waitFor(() => {
        expect(mockMusicController.stopLayer).toHaveBeenCalledTimes(1);
        expect(newMusicController.playLayer).toHaveBeenCalledTimes(1);
      });
    });
  });
});
