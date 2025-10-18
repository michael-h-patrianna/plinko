/**
 * useAudio hook - Access audio controllers from any component
 * Separated from AudioProvider.tsx for React Fast Refresh compatibility
 */

import { useContext } from 'react';
import { AudioContext, type AudioContextValue } from './AudioContext';

/**
 * Hook to access audio controllers from any component
 * @returns Audio context value with controllers and initialization state
 */
export function useAudio(): AudioContextValue {
  return useContext(AudioContext);
}
