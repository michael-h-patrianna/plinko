/**
 * Unit tests for useMusicManager hook
 * Tests centralized music management based on game state
 */

import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MusicController } from '../../../audio/core/MusicController';
import { useMusicManager } from '../../../audio/hooks/useMusicManager';
import type { GameState } from '../../../game/types';

describe('useMusicManager', () => {
  let mockMusicController: MusicController;

  beforeEach(() => {
    // Create mock music controller
    mockMusicController = {
      isLoaded: vi.fn().mockReturnValue(true),
      playLayer: vi.fn(),
      stopLayer: vi.fn(),
      loadTrack: vi.fn(),
      setLayerVolume: vi.fn(),
      fadeLayerVolume: vi.fn(),
      isLayerPlaying: vi.fn().mockReturnValue(false),
      setMusicVolume: vi.fn(),
      stopAllLayers: vi.fn(),
      transitionAtLoopBoundary: vi.fn().mockReturnValue(() => {}),
      cleanup: vi.fn(),
    } as unknown as MusicController;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Music Start Behavior', () => {
    it('should start music when transitioning to selecting-position state', () => {
      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'selecting-position' as GameState,
          musicEnabled: true,
        })
      );

      expect(mockMusicController.setLayerVolume).toHaveBeenCalledWith('music-start-loop', 0.36);
      expect(mockMusicController.playLayer).toHaveBeenCalledWith('music-start-loop', 1000);
    });

    it('should not start music if musicEnabled is false', () => {
      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'selecting-position' as GameState,
          musicEnabled: false,
        })
      );

      expect(mockMusicController.playLayer).not.toHaveBeenCalled();
    });

    it('should not start music if controller is null', () => {
      renderHook(() =>
        useMusicManager({
          musicController: null,
          gameState: 'selecting-position' as GameState,
          musicEnabled: true,
        })
      );

      expect(mockMusicController.playLayer).not.toHaveBeenCalled();
    });

    it('should not start music if track is already playing', () => {
      (mockMusicController.isLayerPlaying as any).mockReturnValue(true);

      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'selecting-position' as GameState,
          musicEnabled: true,
        })
      );

      // Should not call playLayer again if already playing
      expect(mockMusicController.playLayer).not.toHaveBeenCalled();
    });
  });

  describe('Music Stop Behavior', () => {
    it('should stop all music when returning to idle state', () => {
      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'idle' as GameState,
          musicEnabled: true,
        })
      );

      expect(mockMusicController.stopAllLayers).toHaveBeenCalledWith(1000);
    });

    it('should stop all music when returning to ready state', () => {
      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'ready' as GameState,
          musicEnabled: true,
        })
      );

      expect(mockMusicController.stopAllLayers).toHaveBeenCalledWith(1000);
    });
  });

  describe('Volume Transitions', () => {
    it('should fade to 25% volume on countdown state', () => {
      (mockMusicController.isLayerPlaying as any).mockReturnValue(true);

      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'countdown' as GameState,
          musicEnabled: true,
        })
      );

      expect(mockMusicController.fadeLayerVolume).toHaveBeenCalledWith(
        'music-start-loop',
        0.25,
        400
      );
    });

    it('should quickly fade to 36% volume on dropping state (200ms)', () => {
      (mockMusicController.isLayerPlaying as any).mockReturnValue(true);

      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'dropping' as GameState,
          musicEnabled: true,
        })
      );

      expect(mockMusicController.fadeLayerVolume).toHaveBeenCalledWith(
        'music-start-loop',
        0.36,
        200
      );
    });

    it('should fade to 25% volume on landed state', () => {
      (mockMusicController.isLayerPlaying as any).mockReturnValue(true);

      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'landed' as GameState,
          musicEnabled: true,
        })
      );

      expect(mockMusicController.fadeLayerVolume).toHaveBeenCalledWith(
        'music-start-loop',
        0.25,
        300
      );
    });

    it('should fade to 25% volume on celebrating state, then restore to 36% after ~1s', () => {
      vi.useFakeTimers();
      (mockMusicController.isLayerPlaying as any).mockReturnValue(true);

      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'celebrating' as GameState,
          musicEnabled: true,
        })
      );

      // Initial duck to 25%
      expect(mockMusicController.fadeLayerVolume).toHaveBeenCalledWith(
        'music-start-loop',
        0.25,
        300
      );

      // Clear the first call
      vi.clearAllMocks();

      // Fast-forward 1 second
      vi.advanceTimersByTime(1000);

      // Should restore to 36%
      expect(mockMusicController.fadeLayerVolume).toHaveBeenCalledWith(
        'music-start-loop',
        0.36,
        500
      );

      vi.useRealTimers();
    });

    it('should not change volume on revealed state', () => {
      (mockMusicController.isLayerPlaying as any).mockReturnValue(true);

      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'revealed' as GameState,
          musicEnabled: true,
        })
      );

      // Should not call fadeLayerVolume for revealed state
      expect(mockMusicController.fadeLayerVolume).not.toHaveBeenCalled();
    });

    it('should not apply volume changes if music is disabled', () => {
      (mockMusicController.isLayerPlaying as any).mockReturnValue(true);

      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'countdown' as GameState,
          musicEnabled: false,
        })
      );

      expect(mockMusicController.fadeLayerVolume).not.toHaveBeenCalled();
    });
  });

  describe('Loop Alternation', () => {
    it('should set up loop alternation when start-loop is playing', () => {
      (mockMusicController.isLayerPlaying as any).mockImplementation((id: string) =>
        id === 'music-start-loop'
      );

      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'dropping' as GameState,
          musicEnabled: true,
        })
      );

      expect(mockMusicController.transitionAtLoopBoundary).toHaveBeenCalledWith(
        'music-start-loop',
        'music-game-loop',
        expect.objectContaining({
          fadeOutFrom: 500,
          fadeInTo: 500,
          inheritVolume: true, // Should inherit volume at transition time
        })
      );
    });

    it('should set up loop alternation when game-loop is playing', () => {
      (mockMusicController.isLayerPlaying as any).mockImplementation((id: string) =>
        id === 'music-game-loop'
      );

      renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'dropping' as GameState,
          musicEnabled: true,
        })
      );

      expect(mockMusicController.transitionAtLoopBoundary).toHaveBeenCalledWith(
        'music-game-loop',
        'music-start-loop',
        expect.objectContaining({
          fadeOutFrom: 500,
          fadeInTo: 500,
          inheritVolume: true, // Should inherit volume at transition time
        })
      );
    });

    it('should clean up loop alternation on unmount', () => {
      const mockCleanup = vi.fn();
      (mockMusicController.transitionAtLoopBoundary as any).mockReturnValue(mockCleanup);
      (mockMusicController.isLayerPlaying as any).mockReturnValue(true);

      const { unmount } = renderHook(() =>
        useMusicManager({
          musicController: mockMusicController,
          gameState: 'dropping' as GameState,
          musicEnabled: true,
        })
      );

      unmount();

      expect(mockCleanup).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle transition from music disabled to enabled', () => {
      const { rerender } = renderHook(
        ({ enabled }) =>
          useMusicManager({
            musicController: mockMusicController,
            gameState: 'selecting-position' as GameState,
            musicEnabled: enabled,
          }),
        { initialProps: { enabled: false } }
      );

      expect(mockMusicController.playLayer).not.toHaveBeenCalled();

      rerender({ enabled: true });

      expect(mockMusicController.playLayer).toHaveBeenCalledWith('music-start-loop', 1000);
    });

    it('should handle music controller becoming null', () => {
      const { rerender } = renderHook(
        ({ controller }: { controller: MusicController | null }) =>
          useMusicManager({
            musicController: controller,
            gameState: 'dropping' as GameState,
            musicEnabled: true,
          }),
        { initialProps: { controller: mockMusicController as MusicController | null } }
      );

      expect(() => rerender({ controller: null })).not.toThrow();
    });

    it('should handle rapid state changes without errors', () => {
      const states: GameState[] = [
        'idle',
        'ready',
        'selecting-position',
        'countdown',
        'dropping',
        'landed',
        'celebrating',
        'revealed',
      ];

      expect(() => {
        states.forEach((state) => {
          renderHook(() =>
            useMusicManager({
              musicController: mockMusicController,
              gameState: state,
              musicEnabled: true,
            })
          );
        });
      }).not.toThrow();
    });
  });
});
