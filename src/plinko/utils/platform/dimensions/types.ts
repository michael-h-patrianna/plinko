/**
 * Dimensions Platform Adapter Types
 *
 * Provides viewport/window dimensions and resize event handling
 * across web and React Native platforms
 */

export interface ViewportDimensions {
  width: number;
  height: number;
}

export type DimensionsChangeListener = (dimensions: ViewportDimensions) => void;

export interface DimensionsAdapter {
  /**
   * Gets the current viewport/window width
   *
   * @returns The current width in pixels
   */
  getWidth(): number;

  /**
   * Gets the current viewport/window height
   *
   * @returns The current height in pixels
   */
  getHeight(): number;

  /**
   * Gets both width and height
   *
   * @returns Object containing width and height
   */
  getDimensions(): ViewportDimensions;

  /**
   * Adds a listener for dimension changes (resize events)
   *
   * @param listener - Function to call when dimensions change
   * @returns Cleanup function to remove the listener
   */
  addChangeListener(listener: DimensionsChangeListener): () => void;
}
