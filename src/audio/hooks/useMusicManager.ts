/**
 * useMusicManager - Centralized music playback management
 * Handles music loop alternation and volume transitions based on game state
 */

import { useEffect, useRef } from 'react';
import type { MusicController } from '../core/MusicController';
import type { GameState } from '@game/types';

interface UseMusicManagerOptions {
  musicController: MusicController | null;
  gameState: GameState;
  musicEnabled: boolean;
}

/**
 * Manages background music playback based on game state
 *
 * Expected behavior:
 * 1. Start-loop fades in to 36% when user clicks "Drop Ball"
 * 2. Music alternates between start-loop and game-loop
 * 3. Volume drops to 25% when user clicks "Start" (countdown begins)
 * 4. Volume rises to 36% over 200ms when ball starts dropping
 * 5. Volume drops to 25% when ball lands
 * 6. Volume rises back to 36% after ~1s (after celebration/no-win SFX)
 * 7. Music stops completely on game reset
 * 8. Music only plays when enabled in dev menu
 */
export function useMusicManager({
  musicController,
  gameState,
  musicEnabled,
}: UseMusicManagerOptions): void {
  const loopCleanupRef = useRef<(() => void) | null>(null);
  const celebrationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const setupAttemptedRef = useRef(false);

  // Handle music start on game start
  useEffect(() => {
    if (!musicController || !musicEnabled) return;

    // Start music when transitioning from idle to selecting-position
    if (gameState === 'selecting-position') {
      const isStartLoopLoaded = musicController.isLoaded('music-start-loop');
      const isStartLoopPlaying = musicController.isLayerPlaying('music-start-loop');

      if (isStartLoopLoaded && !isStartLoopPlaying) {
        console.log('Starting music: fade in start-loop to 36% volume');
        musicController.setLayerVolume('music-start-loop', 0.36);
        musicController.playLayer('music-start-loop', 1000); // 1s fade-in

        // Trigger alternation setup after a short delay
        setTimeout(() => {
          setupAttemptedRef.current = false;
        }, 100);
      }
    }
  }, [musicController, gameState, musicEnabled]);

  // Handle music loop alternation
  // Sets up continuous alternation between start-loop and game-loop
  useEffect(() => {
    console.log('[Alternation] Effect running, musicController:', !!musicController, 'musicEnabled:', musicEnabled, 'gameState:', gameState);

    if (!musicController || !musicEnabled) {
      console.log('[Alternation] Early return - no controller or music disabled');
      return;
    }

    // Check if both tracks are loaded
    const bothLoaded =
      musicController.isLoaded('music-start-loop') &&
      musicController.isLoaded('music-game-loop');

    console.log('[Alternation] Both tracks loaded:', bothLoaded);
    if (!bothLoaded) return;

    // Check which track is playing
    const isStartLoopPlaying = musicController.isLayerPlaying('music-start-loop');
    const isGameLoopPlaying = musicController.isLayerPlaying('music-game-loop');
    const hasActiveMusic = isStartLoopPlaying || isGameLoopPlaying;

    console.log('[Alternation] Music playing check - startLoop:', isStartLoopPlaying, 'gameLoop:', isGameLoopPlaying);
    console.log('[Alternation] setupAttemptedRef.current:', setupAttemptedRef.current);

    // If alternation is already running (setupAttemptedRef is true) and music is playing,
    // don't interfere - just return without cleanup to let the recursive chain continue
    if (setupAttemptedRef.current && hasActiveMusic) {
      console.log('[Alternation] Already running and music playing - letting it continue');
      return; // No cleanup - let the recursive chain continue
    }

    // Recursive function to set up alternation that chains itself
    const setupAlternation = (fromTrack: 'music-start-loop' | 'music-game-loop') => {
      const toTrack = fromTrack === 'music-start-loop' ? 'music-game-loop' : 'music-start-loop';

      console.log(`[Alternation] Setting up ${fromTrack} → ${toTrack}`);

      // After a delay, set up the transition for the current loop
      const setupTimer = setTimeout(() => {
        console.log(`[Alternation] Delay complete, calling transitionAtLoopBoundary for ${fromTrack} → ${toTrack}`);

        // Calculate crossfade duration based on BPM - use 1 beat
        const crossfadeDuration = musicController.getBeatsInMs(1);

        console.log(`[Alternation] Using ${crossfadeDuration.toFixed(0)}ms crossfade (1 beat at ${musicController.getMusicBPM()} BPM)`);

        const cleanup = musicController.transitionAtLoopBoundary(fromTrack, toTrack, {
          fadeOutFrom: crossfadeDuration,
          fadeInTo: crossfadeDuration,
          inheritVolume: true,
        });

        // After the transition completes, we need to set up the next alternation.
        // The transition happens at the loop boundary, so we need to wait for:
        // 1. The remaining time in the current loop (handled by transitionAtLoopBoundary)
        // 2. The full duration of the new track's loop
        // 3. Minus the setup delay (10 seconds)
        // To be safe and account for the new track playing, we'll wait ~17 seconds
        // (approximate loop duration) before setting up the next alternation
        const nextSetupDelay = 17000; // Slightly less than actual loop duration to ensure we catch it
        console.log(`[Alternation] Scheduling next alternation setup in ${nextSetupDelay}ms`);

        const nextSetupTimer = setTimeout(() => {
          console.log(`[Alternation] Checking if ${toTrack} is playing for next setup...`);
          const isPlaying = musicController.isLayerPlaying(toTrack);
          console.log(`[Alternation] ${toTrack} playing: ${isPlaying}`);

          if (isPlaying) {
            console.log(`[Alternation] ✓ Setting up next alternation from ${toTrack}`);
            setupAlternation(toTrack); // Recursively set up next transition
          } else {
            console.log(`[Alternation] ✗ Music no longer playing, stopping alternation`);
            setupAttemptedRef.current = false; // Allow restart
          }
        }, nextSetupDelay);

        // Store cleanup functions for both timers
        loopCleanupRef.current = () => {
          console.log('[Alternation] Cleanup called - clearing timers');
          clearTimeout(setupTimer);
          clearTimeout(nextSetupTimer);
          cleanup();
          setupAttemptedRef.current = false; // Allow restart
        };
      }, 10000); // Wait 10s before setting up transition
    };

    // Only start alternation if music is playing and we haven't already started
    if (hasActiveMusic && !setupAttemptedRef.current) {
      console.log('[Alternation] ✓ Starting alternation system');
      setupAttemptedRef.current = true;

      const initialTrack = isStartLoopPlaying ? 'music-start-loop' : 'music-game-loop';
      setupAlternation(initialTrack);
    } else if (!hasActiveMusic) {
      console.log('[Alternation] No music playing yet, waiting...');
      // Reset flag so we can try again when music starts
      setupAttemptedRef.current = false;
    } else if (setupAttemptedRef.current) {
      console.log('[Alternation] Already attempted setup, skipping');
    }

    // Cleanup only runs when effect unmounts or dependencies truly change
    return () => {
      console.log('[Alternation] Effect cleanup called');
      // Don't clean up if alternation is running - let it continue
      if (loopCleanupRef.current && !hasActiveMusic) {
        console.log('[Alternation] Effect cleanup - stopping alternation');
        loopCleanupRef.current();
        loopCleanupRef.current = null;
      }
    };
  }, [musicController, musicEnabled, gameState]); // Added gameState back to detect when music starts

  // Handle volume transitions based on game state
  useEffect(() => {
    if (!musicController || !musicEnabled) return;

    // Stop all music when returning to start screen (reset)
    if (gameState === 'idle' || gameState === 'ready') {
      console.log('Game reset - stopping all music');
      musicController.stopAllLayers(1000);

      // Clean up loop alternation
      if (loopCleanupRef.current) {
        loopCleanupRef.current();
        loopCleanupRef.current = null;
      }
      return;
    }

    // Get ALL tracks (both start-loop and game-loop) to handle transitions
    const startLoopPlaying = musicController.isLayerPlaying('music-start-loop');
    const gameLoopPlaying = musicController.isLayerPlaying('music-game-loop');

    // During crossfade, both might be playing - we need to set volume on both
    const tracksToUpdate: ('music-start-loop' | 'music-game-loop')[] = [];
    if (startLoopPlaying) tracksToUpdate.push('music-start-loop');
    if (gameLoopPlaying) tracksToUpdate.push('music-game-loop');

    if (tracksToUpdate.length === 0) return;

    // Clear any existing celebration timer ONLY when transitioning to a state that needs a different volume
    // Don't clear it when going from celebrating → revealed, as we want the timer to complete
    if (celebrationTimerRef.current && gameState !== 'revealed') {
      clearTimeout(celebrationTimerRef.current);
      celebrationTimerRef.current = null;
    }

    // Apply volume changes based on game state - apply to ALL playing tracks
    switch (gameState) {
      case 'countdown':
        // User clicked start button - fade to 25%
        console.log(`Countdown started - fading all playing tracks to 25%`);
        tracksToUpdate.forEach(track => {
          musicController.fadeLayerVolume(track, 0.25, 400);
        });
        break;

      case 'dropping':
        // Countdown finished, ball is dropping - quickly fade to 36% over 200ms
        console.log(`Ball dropping - quickly fading all playing tracks to 36% (200ms)`);
        tracksToUpdate.forEach(track => {
          musicController.fadeLayerVolume(track, 0.36, 200);
        });
        break;

      case 'landed':
        // Ball has landed - fade to 25%
        console.log(`Ball landed - fading all playing tracks to 25%`);
        tracksToUpdate.forEach(track => {
          musicController.fadeLayerVolume(track, 0.25, 300);
        });
        break;

      case 'celebrating':
        // Ball landed, celebration starting - duck to 25%, then restore after ~1s
        console.log(`Celebrating - ducking all playing tracks to 25%`);
        tracksToUpdate.forEach(track => {
          musicController.fadeLayerVolume(track, 0.25, 300);
        });

        // After ~1 second (approximate celebration duration), fade back to 36%
        celebrationTimerRef.current = setTimeout(() => {
          console.log(`Celebration ending - restoring all playing tracks to 36%`);
          // Re-check which tracks are playing at this time
          const currentTracks: ('music-start-loop' | 'music-game-loop')[] = [];
          if (musicController.isLayerPlaying('music-start-loop')) currentTracks.push('music-start-loop');
          if (musicController.isLayerPlaying('music-game-loop')) currentTracks.push('music-game-loop');

          currentTracks.forEach(track => {
            musicController.fadeLayerVolume(track, 0.36, 500);
          });
          celebrationTimerRef.current = null;
        }, 1000);
        break;

      case 'revealed':
        // Prize revealed - maintain current volume (already at 36% from celebration end)
        // No volume change needed
        break;

      default:
        // No volume change needed for other states
        break;
    }
  }, [musicController, gameState, musicEnabled]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (loopCleanupRef.current) {
        loopCleanupRef.current();
        loopCleanupRef.current = null;
      }
      if (celebrationTimerRef.current) {
        clearTimeout(celebrationTimerRef.current);
        celebrationTimerRef.current = null;
      }
    };
  }, []);
}
