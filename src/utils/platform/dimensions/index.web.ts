/**
 * Dimensions Platform Adapter - Web Implementation
 *
 * Uses window.innerWidth/innerHeight and resize events
 */

import type { DimensionsAdapter, DimensionsChangeListener, ViewportDimensions } from './types';

class WebDimensionsAdapter implements DimensionsAdapter {
  getWidth(): number {
    return window.innerWidth;
  }

  getHeight(): number {
    return window.innerHeight;
  }

  getDimensions(): ViewportDimensions {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  addChangeListener(listener: DimensionsChangeListener): () => void {
    const handleResize = () => {
      listener(this.getDimensions());
    };

    window.addEventListener('resize', handleResize);

    // Return cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }
}

export const dimensionsAdapter: DimensionsAdapter = new WebDimensionsAdapter();
