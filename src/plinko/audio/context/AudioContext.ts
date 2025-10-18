/**
 * AudioContext - React context for audio system
 * Separated from AudioProvider.tsx for better organization
 */

import { createContext } from 'react';
import type { WebAudioAdapter } from '../adapters/WebAudioAdapter';
import type { MusicController } from '../core/MusicController';
import type { SFXController } from '../core/SFXController';
import type { VolumeController } from '../core/VolumeController';

export interface AudioContextValue {
  sfxController: SFXController | null;
  musicController: MusicController | null;
  volumeController: VolumeController | null;
  audioAdapter: WebAudioAdapter | null;
  isInitialized: boolean;
  initializationError: Error | null;
}

export const AudioContext = createContext<AudioContextValue>({
  sfxController: null,
  musicController: null,
  volumeController: null,
  audioAdapter: null,
  isInitialized: false,
  initializationError: null,
});
