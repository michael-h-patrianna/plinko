// @ts-nocheck
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '../../shared-utils';
import { AlphaSlider } from '../../AlphaSlider';
import { HueSlider } from '../../HueSlider';
import type { HSVColor } from '../../types';
import { hsvToHex, hsvToRgb, parseColor, rgbToHex, rgbToHsv } from '../../utils';
import { ColorInputs } from './ColorInputs';
import styles from './ColorPicker.module.css';
import { RecentColors } from './RecentColors';
import { SaturationBrightness } from './SaturationBrightness';

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsv';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose?: () => void;
  showAlpha?: boolean;
  showRecentColors?: boolean;
}

const RECENT_COLORS_KEY = 'color-control-recent-colors';
const MAX_RECENT_COLORS = 10;

export const ColorPicker = memo(function ColorPicker({
  color,
  onChange,
  onClose,
  showAlpha = true,
  showRecentColors = true,
}: ColorPickerProps) {
  const [hsv, setHsv] = useState<HSVColor>({ h: 0, s: 100, v: 100, a: 1 });
  const [format, setFormat] = useState<ColorFormat>('hex');
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const isInternalChange = useRef(false);

  // Load recent colors from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_COLORS_KEY);
      if (stored) {
        setRecentColors(JSON.parse(stored));
      }
    } catch (error) {
      logger.error('Failed to load recent colors', { error });
    }
  }, []);

  // Parse initial color
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }

    const rgb = parseColor(color);
    if (rgb) {
      const newHsv = rgbToHsv(rgb);
      setHsv(newHsv);
    }
  }, [color]);

  // Add color to recent colors
  const addToRecentColors = useCallback((newColor: string) => {
    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c.toLowerCase() !== newColor.toLowerCase());
      const updated = [newColor, ...filtered].slice(0, MAX_RECENT_COLORS);

      try {
        localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(updated));
      } catch (error) {
        logger.error('Failed to save recent colors', { error });
      }

      return updated;
    });
  }, []);

  // Handle HSV change
  const handleHsvChange = useCallback(
    (newHsv: HSVColor) => {
      setHsv(newHsv);
      isInternalChange.current = true;

      const rgb = hsvToRgb(newHsv);
      const hex = rgbToHex(rgb);
      onChange(hex);
    },
    [onChange]
  );

  // Handle saturation/brightness change
  const handleSaturationBrightnessChange = useCallback(
    (s: number, v: number) => {
      handleHsvChange({ ...hsv, s, v });
    },
    [hsv, handleHsvChange]
  );

  // Handle hue change
  const handleHueChange = useCallback(
    (h: number) => {
      handleHsvChange({ ...hsv, h });
    },
    [hsv, handleHsvChange]
  );

  // Handle alpha change
  const handleAlphaChange = useCallback(
    (a: number) => {
      handleHsvChange({ ...hsv, a });
    },
    [hsv, handleHsvChange]
  );

  // Handle color input change
  const handleColorInputChange = useCallback(
    (newColor: string) => {
      const rgb = parseColor(newColor);
      if (rgb) {
        const newHsv = rgbToHsv(rgb);
        setHsv(newHsv);
        isInternalChange.current = true;
        onChange(newColor);
      }
    },
    [onChange]
  );

  // Handle recent color selection
  const handleRecentColorSelect = useCallback(
    (recentColor: string) => {
      const rgb = parseColor(recentColor);
      if (rgb) {
        const newHsv = rgbToHsv(rgb);
        setHsv(newHsv);
        isInternalChange.current = true;
        onChange(recentColor);
      }
    },
    [onChange]
  );

  // Handle apply (add to recent colors)
  const handleApply = useCallback(() => {
    const rgb = hsvToRgb(hsv);
    const hex = rgbToHex(rgb);
    addToRecentColors(hex);
    onClose?.();
  }, [hsv, addToRecentColors, onClose]);

  // Get current color in hex for preview
  const currentColorHex = hsvToHex(hsv);

  return (
    <div className={styles.colorPicker}>
      {/* Header with preview and close button */}
      <div className={styles.header}>
        <div className={styles.previewContainer}>
          <div className={styles.previewCheckerboard} />
          <div
            className={styles.previewColor}
            style={{ backgroundColor: currentColorHex }}
          />
        </div>
        {onClose && (
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close color picker"
          >
            ✕
          </button>
        )}
      </div>

      {/* Main color selector */}
      <div className={styles.mainSelector}>
        <SaturationBrightness
          hue={hsv.h}
          saturation={hsv.s}
          brightness={hsv.v}
          onChange={handleSaturationBrightnessChange}
        />
      </div>

      {/* Sliders */}
      <div className={styles.sliders}>
        <HueSlider value={hsv.h} onChange={handleHueChange} />
        {showAlpha && (
          <AlphaSlider
            value={hsv.a ?? 1}
            color={hsvToHex({ ...hsv, a: 1 })}
            onChange={handleAlphaChange}
          />
        )}
      </div>

      {/* Color inputs */}
      <ColorInputs
        hsv={hsv}
        format={format}
        onFormatChange={setFormat}
        onChange={handleColorInputChange}
        showAlpha={showAlpha}
      />

      {/* Recent colors */}
      {showRecentColors && recentColors.length > 0 && (
        <RecentColors colors={recentColors} onSelect={handleRecentColorSelect} />
      )}

      {/* Action buttons */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.actionButton}
          onClick={handleApply}
        >
          Apply
        </button>
      </div>
    </div>
  );
});

export default ColorPicker;
