/**
 * Dimensions Platform Adapter - React Native Implementation
 *
 * Uses React Native's Dimensions API
 *
 * NOTE: This is a placeholder implementation. In a real React Native app, you would:
 * 1. Import: import { Dimensions } from 'react-native';
 * 2. Use Dimensions.get('window') for current dimensions
 * 3. Use Dimensions.addEventListener('change') for resize events
 */

import { throwNativeNotImplemented } from '../detect';
import type { DimensionsAdapter, DimensionsChangeListener, ViewportDimensions } from './types';

class NativeDimensionsAdapter implements DimensionsAdapter {
  getWidth(): number {
    throwNativeNotImplemented('Dimensions.getWidth');
  }

  getHeight(): number {
    throwNativeNotImplemented('Dimensions.getHeight');
  }

  getDimensions(): ViewportDimensions {
    throwNativeNotImplemented('Dimensions.getDimensions');
  }

  addChangeListener(_listener: DimensionsChangeListener): () => void {
    throwNativeNotImplemented('Dimensions.addChangeListener');
  }
}

export const dimensionsAdapter: DimensionsAdapter = new NativeDimensionsAdapter();

/**
 * IMPLEMENTATION GUIDE FOR REACT NATIVE:
 *
 * import { Dimensions } from 'react-native';
 * import type { DimensionsAdapter, DimensionsChangeListener, ViewportDimensions } from './types';
 *
 * class NativeDimensionsAdapter implements DimensionsAdapter {
 *   getWidth(): number {
 *     return Dimensions.get('window').width;
 *   }
 *
 *   getHeight(): number {
 *     return Dimensions.get('window').height;
 *   }
 *
 *   getDimensions(): ViewportDimensions {
 *     const { width, height } = Dimensions.get('window');
 *     return { width, height };
 *   }
 *
 *   addChangeListener(listener: DimensionsChangeListener): () => void {
 *     const subscription = Dimensions.addEventListener('change', ({ window }) => {
 *       listener({ width: window.width, height: window.height });
 *     });
 *
 *     // Return cleanup function
 *     return () => {
 *       subscription?.remove();
 *     };
 *   }
 * }
 *
 * export const dimensionsAdapter: DimensionsAdapter = new NativeDimensionsAdapter();
 */
