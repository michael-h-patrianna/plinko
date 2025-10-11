/**
 * AudioProvider - React context for managing sound engine
 * Initializes audio system and provides controllers to components
 */

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { performanceAdapter } from '../../utils/platform/performance';
import { WebAudioAdapter } from '../adapters/WebAudioAdapter';
import { MusicController } from '../core/MusicController';
import { SFXController } from '../core/SFXController';
import { VolumeController } from '../core/VolumeController';

interface AudioContextValue {
  sfxController: SFXController | null;
  musicController: MusicController | null;
  volumeController: VolumeController | null;
  isInitialized: boolean;
  initializationError: Error | null;
}

const AudioContext = createContext<AudioContextValue>({
  sfxController: null,
  musicController: null,
  volumeController: null,
  isInitialized: false,
  initializationError: null,
});

interface AudioProviderProps {
  children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<Error | null>(null);

  // Use refs to store controllers so they persist across renders
  const sfxControllerRef = useRef<SFXController | null>(null);
  const musicControllerRef = useRef<MusicController | null>(null);
  const volumeControllerRef = useRef<VolumeController | null>(null);
  const adapterRef = useRef<WebAudioAdapter | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeAudio() {
      try {
        // Create audio adapter
        const adapter = new WebAudioAdapter();
        await adapter.initialize();

        if (!mounted) {
          // If unmounted during initialization, clean up immediately
          adapter.destroy();
          return;
        }

        // Create volume controller and load user preferences
        const volumeController = new VolumeController();
        volumeController.loadFromStorage();

        // Create sound controllers
        const sfxController = new SFXController(adapter, volumeController, performanceAdapter);
        const musicController = new MusicController(adapter, volumeController);

        // Store in refs
        adapterRef.current = adapter;
        sfxControllerRef.current = sfxController;
        musicControllerRef.current = musicController;
        volumeControllerRef.current = volumeController;

        setIsInitialized(true);
      } catch (error) {
        if (!mounted) return;
        console.error('Failed to initialize audio system:', error);
        setInitializationError(error instanceof Error ? error : new Error('Unknown audio initialization error'));
      }
    }

    void initializeAudio();

    return () => {
      mounted = false;

      // Clean up audio resources to prevent memory leaks
      const sfxController = sfxControllerRef.current;
      const musicController = musicControllerRef.current;
      const adapter = adapterRef.current;

      // Clean up controllers (stops sounds and clears tracking)
      if (sfxController) {
        sfxController.cleanup();
      }

      if (musicController) {
        musicController.cleanup();
      }

      // Destroy adapter and unload all sounds
      if (adapter) {
        // Small delay to allow any final audio operations to complete
        setTimeout(() => {
          adapter.destroy();
        }, 100);
      }

      // Clear refs
      sfxControllerRef.current = null;
      musicControllerRef.current = null;
      volumeControllerRef.current = null;
      adapterRef.current = null;
    };
  }, []);

  const contextValue: AudioContextValue = {
    sfxController: sfxControllerRef.current,
    musicController: musicControllerRef.current,
    volumeController: volumeControllerRef.current,
    isInitialized,
    initializationError,
  };

  return <AudioContext.Provider value={contextValue}>{children}</AudioContext.Provider>;
}

/**
 * Hook to access audio controllers from any component
 * @returns Audio context value with controllers and initialization state
 */
export function useAudio() {
  return useContext(AudioContext);
}
