/**
 * useAudioPreloader - Hook for preloading audio files during initialization
 * Provides a clean, readable way to import and load sounds
 */

import { useEffect, useState } from 'react';
import type { MusicController } from '../core/MusicController';
import type { SFXController } from '../core/SFXController';
import type { MusicTrackId } from '../types/MusicTrackId';
import type { SoundEffectId } from '../types/SoundEffectId';

// Sound file imports
import pegHitSound from '../../assets/sounds/sfx/ball/peg-hit.mp3';
import buttonPressSound from '../../assets/sounds/sfx/ui/button-press.mp3';

/**
 * Sound file registry
 * Add new sound imports here for preloading
 */
const SOUND_FILES: Record<string, { id: SoundEffectId; url: string }> = {
  buttonPress: {
    id: 'ui-button-press',
    url: buttonPressSound,
  },
  pegHit: {
    id: 'ball-peg-hit',
    url: pegHitSound,
  },
};

const MUSIC_FILES: Record<string, { id: MusicTrackId; url: string; loop?: boolean }> = {
  // Add music files here
};

interface UseAudioPreloaderOptions {
  sfxController: SFXController | null;
  musicController: MusicController | null;
  enabled?: boolean;
}

interface UseAudioPreloaderReturn {
  isLoading: boolean;
  isLoaded: boolean;
  errors: Error[];
}

/**
 * Preloads audio files during app initialization
 * @param options - SFX and music controllers, enable flag
 * @returns Loading state and any errors encountered
 */
export function useAudioPreloader({
  sfxController,
  musicController,
  enabled = true,
}: UseAudioPreloaderOptions): UseAudioPreloaderReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errors, setErrors] = useState<Error[]>([]);

  useEffect(() => {
    if (!enabled || !sfxController || !musicController) {
      return;
    }

    let mounted = true;

    async function preloadAudio() {
      if (!sfxController || !musicController) return;

      setIsLoading(true);
      const loadErrors: Error[] = [];

      // Load sound effects
      for (const [key, sound] of Object.entries(SOUND_FILES)) {
        try {
          await sfxController.loadSound(sound.id, sound.url);
        } catch (error) {
          console.error(`Failed to preload sound ${key}:`, error);
          loadErrors.push(
            error instanceof Error ? error : new Error(`Failed to load sound ${key}`)
          );
        }
      }

      // Configure throttle delays for rapid-fire sounds
      // Peg hit: Throttle to max once every 50ms (prevents audio overlap during rapid collisions)
      sfxController.setThrottleDelay('ball-peg-hit', 50);

      // Load music tracks
      for (const [key, music] of Object.entries(MUSIC_FILES)) {
        try {
          await musicController.loadTrack(music.id, music.url, {
            loop: music.loop ?? true,
          });
        } catch (error) {
          console.error(`Failed to preload music ${key}:`, error);
          loadErrors.push(
            error instanceof Error ? error : new Error(`Failed to load music ${key}`)
          );
        }
      }

      if (!mounted) return;

      setErrors(loadErrors);
      setIsLoading(false);
      setIsLoaded(true);
    }

    void preloadAudio();

    return () => {
      mounted = false;
    };
  }, [enabled, sfxController, musicController]);

  return { isLoading, isLoaded, errors };
}
