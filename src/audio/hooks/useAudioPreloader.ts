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
import slotHitSound from '../../assets/sounds/sfx/ball/slot-hit.mp3';
import wallHitSound from '../../assets/sounds/sfx/ball/wall-hit.mp3';
import buttonPressSound from '../../assets/sounds/sfx/ui/button-press.mp3';
import countdown3Sound from '../../assets/sounds/sfx/countdown/countdown-3.mp3';
import countdown2Sound from '../../assets/sounds/sfx/countdown/countdown-2.mp3';
import countdown1Sound from '../../assets/sounds/sfx/countdown/countdown-1.mp3';
import countdownGoSound from '../../assets/sounds/sfx/countdown/countdown-go.mp3';

// Music file imports
import startLoopMusic from '../../assets/sounds/music/start-loop.mp3';
import gameLoopMusic from '../../assets/sounds/music/game-loop.mp3';

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
  wallHit: {
    id: 'ball-wall-hit',
    url: wallHitSound,
  },
  slotHit: {
    id: 'ball-slot-hit',
    url: slotHitSound,
  },
  countdown3: {
    id: 'countdown-3',
    url: countdown3Sound,
  },
  countdown2: {
    id: 'countdown-2',
    url: countdown2Sound,
  },
  countdown1: {
    id: 'countdown-1',
    url: countdown1Sound,
  },
  countdownGo: {
    id: 'countdown-go',
    url: countdownGoSound,
  },
};

const MUSIC_FILES: Record<string, { id: MusicTrackId; url: string; loop?: boolean; volume?: number }> = {
  startLoop: {
    id: 'music-start-loop',
    url: startLoopMusic,
    loop: true,
    volume: 0.5, // Play at 50% volume
  },
  gameLoop: {
    id: 'music-game-loop',
    url: gameLoopMusic,
    loop: true,
    volume: 0.36, // Play at 36% volume during gameplay
  },
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
      sfxController.setThrottleDelay('ball-peg-hit', 50);
      sfxController.setThrottleDelay('ball-wall-hit', 50);
      sfxController.setThrottleDelay('ball-slot-hit', 50);

      // Load music tracks
      for (const [key, music] of Object.entries(MUSIC_FILES)) {
        try {
          console.log(`Loading music track: ${key} (${music.id}) from ${music.url}`);
          await musicController.loadTrack(music.id, music.url, {
            loop: music.loop ?? true,
            volume: music.volume,
          });
          console.log(`Successfully loaded music track: ${key} (${music.id})`);
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
