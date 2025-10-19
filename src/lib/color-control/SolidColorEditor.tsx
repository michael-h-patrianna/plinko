// @ts-nocheck
import { memo, useCallback, useMemo, useState } from 'react';
import { logger } from './shared-utils';
import AlphaSlider from './AlphaSlider';
import ColorSpaceCanvas from './ColorSpaceCanvas';
import HueSlider from './HueSlider';
import styles from './SolidColorEditor.module.css';
import type { SolidColorData } from './types';
import { hsvToRgb, parseColor, rgbToHex, rgbToHsv } from './utils';

interface SolidColorEditorProps {
  solidColor: SolidColorData;
  onColorChange: (solidColor: SolidColorData) => void;
}

/**
 * SolidColorEditor - Editor for a single solid color with alpha
 * Similar to the gradient color tab but without gradient bar and stops
 */
export const SolidColorEditor = memo(function SolidColorEditor({
  solidColor,
  onColorChange,
}: SolidColorEditorProps) {
  const [colorSpace, setColorSpace] = useState<'hsv' | 'hsl'>('hsv');

  // Parse color to HSV for hue slider
  const currentHsv = useMemo(() => {
    const rgb = parseColor(solidColor.color);
    return rgb ? rgbToHsv(rgb) : { h: 0, s: 0, v: 100 };
  }, [solidColor.color]);

  // Handle hue change from hue slider
  const handleHueChange = useCallback(
    (newHue: number) => {
      // Keep current saturation and value, only change hue
      const newHsv = { ...currentHsv, h: newHue };
      const newRgb = hsvToRgb(newHsv);
      const newColor = rgbToHex(newRgb);

      logger.debug('SOLID_COLOR_HUE_CHANGE', {
        timestamp: Date.now(),
        oldColor: solidColor.color,
        newColor,
        oldHsv: currentHsv,
        newHsv,
      });

      onColorChange({
        ...solidColor,
        color: newColor,
      });
    },
    [currentHsv, solidColor, onColorChange]
  );

  // Handle color change from color space canvas
  const handleColorChange = useCallback(
    (color: string) => {
      logger.debug('SOLID_COLOR_CHANGE', {
        timestamp: Date.now(),
        oldColor: solidColor.color,
        newColor: color,
      });

      onColorChange({
        ...solidColor,
        color,
      });
    },
    [solidColor, onColorChange]
  );

  // Handle alpha change
  const handleAlphaChange = useCallback(
    (alpha: number) => {
      logger.debug('SOLID_COLOR_ALPHA_CHANGE', {
        timestamp: Date.now(),
        oldAlpha: solidColor.alpha,
        newAlpha: alpha,
      });

      onColorChange({
        ...solidColor,
        alpha,
      });
    },
    [solidColor, onColorChange]
  );

  return (
    <div className={styles.container}>
      {/* Color space selector */}
      <div className={styles.colorSpaceSelector}>
        <button
          type="button"
          className={`${styles.colorSpaceTab} ${colorSpace === 'hsv' ? styles.active : ''}`}
          onClick={() => setColorSpace('hsv')}
        >
          HSV
        </button>
        <button
          type="button"
          className={`${styles.colorSpaceTab} ${colorSpace === 'hsl' ? styles.active : ''}`}
          onClick={() => setColorSpace('hsl')}
        >
          HSL
        </button>
      </div>

      {/* Color space canvas */}
      <div className={styles.canvasContainer}>
        <ColorSpaceCanvas
          color={solidColor.color}
          colorSpace={colorSpace}
          onChange={handleColorChange}
          disabled={false}
        />
      </div>

      {/* Hue slider */}
      <div className={styles.sliderContainer}>
        <HueSlider
          hue={currentHsv.h}
          onChange={handleHueChange}
          disabled={false}
        />
      </div>

      {/* Alpha slider */}
      <div className={styles.sliderContainer}>
        <AlphaSlider
          alpha={solidColor.alpha}
          color={solidColor.color}
          onChange={handleAlphaChange}
          disabled={false}
        />
      </div>
    </div>
  );
});

export default SolidColorEditor;
