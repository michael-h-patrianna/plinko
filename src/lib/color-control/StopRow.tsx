// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import styles from './StopRow.module.css';
import type { ColorFormat, ColorStop } from './types';
import { clampPosition, hexToRgb, parseColor, rgbToHex } from './utils';

interface StopRowProps {
  stop: ColorStop;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<ColorStop>) => void;
  onDelete: () => void;
  canDelete: boolean;
  colorFormat: ColorFormat;
}

/**
 * Editable row component for a single gradient color stop
 *
 * @description Displays and allows editing of a gradient stop's color (hex), position (0-100%),
 * and alpha transparency. Provides inline color preview and delete button.
 *
 * @param stop - The color stop data to display/edit
 * @param isSelected - Whether this stop is currently selected
 * @param onSelect - Callback when row is clicked to select this stop
 * @param onUpdate - Callback with partial stop updates (color, position changes)
 * @param onDelete - Callback to delete this stop
 * @param canDelete - Whether delete button should be enabled (enforces minimum stop count)
 * @param colorFormat - Preferred color format for display/parsing
 */
export function StopRow({
  stop,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  canDelete,
}: StopRowProps) {
  const [hexValue, setHexValue] = useState('');
  const [positionValue, setPositionValue] = useState('');
  const [alphaValue, setAlphaValue] = useState(1);

  // Update local state when stop changes
  useEffect(() => {
    const rgb = parseColor(stop.color);
    if (rgb) {
      setHexValue(rgbToHex(rgb));
      setAlphaValue(rgb.a ?? 1);
    }
    setPositionValue(String(Math.round(stop.position)));
  }, [stop.color, stop.position]);

  // Handle hex input change
  const handleHexChange = useCallback(
    (value: string) => {
      setHexValue(value);
      const rgb = hexToRgb(value);
      if (rgb) {
        onUpdate({ color: rgbToHex(rgb) });
      }
    },
    [onUpdate]
  );

  // Handle hex input blur (validate)
  const handleHexBlur = useCallback(() => {
    const rgb = parseColor(stop.color);
    if (rgb) {
      setHexValue(rgbToHex(rgb));
    }
  }, [stop.color]);

  // Handle position input change
  const handlePositionChange = useCallback(
    (value: string) => {
      setPositionValue(value);
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        onUpdate({ position: clampPosition(parsed) });
      }
    },
    [onUpdate]
  );

  // Handle position input blur (validate)
  const handlePositionBlur = useCallback(() => {
    setPositionValue(String(Math.round(stop.position)));
  }, [stop.position]);

  // Handle alpha slider change
  const handleAlphaChange = useCallback(
    (value: number) => {
      setAlphaValue(value);
      const rgb = parseColor(stop.color);
      if (rgb) {
        rgb.a = value;
        onUpdate({ color: rgbToHex(rgb) });
      }
    },
    [stop.color, onUpdate]
  );

  return (
    <div
      className={`${styles.row} ${isSelected ? styles.selected : ''}`}
      onClick={onSelect}
    >
      {/* Color preview */}
      <div className={styles.colorPreview}>
        <div className={styles.checkerboard} />
        <div
          className={styles.color}
          style={{ backgroundColor: stop.color }}
        />
      </div>

      {/* Hex input */}
      <input
        type="text"
        className={styles.hexInput}
        value={hexValue}
        onChange={(e) => handleHexChange(e.target.value)}
        onBlur={handleHexBlur}
        onClick={(e) => e.stopPropagation()}
        placeholder="#FFFFFF"
      />

      {/* Position input */}
      <div className={styles.positionGroup}>
        <input
          type="number"
          className={styles.positionInput}
          value={positionValue}
          onChange={(e) => handlePositionChange(e.target.value)}
          onBlur={handlePositionBlur}
          onClick={(e) => e.stopPropagation()}
          min="0"
          max="100"
        />
        <span className={styles.unit}>%</span>
      </div>

      {/* Alpha slider */}
      <div className={styles.alphaGroup}>
        <label className={styles.alphaLabel}>α</label>
        <input
          type="range"
          className={styles.alphaSlider}
          min="0"
          max="1"
          step="0.01"
          value={alphaValue}
          onChange={(e) => handleAlphaChange(parseFloat(e.target.value))}
          onClick={(e) => e.stopPropagation()}
        />
        <span className={styles.alphaValue}>
          {Math.round(alphaValue * 100)}
        </span>
      </div>

      {/* Delete button */}
      <button
        type="button"
        className={styles.deleteButton}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        disabled={!canDelete}
        aria-label="Delete stop"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M4 4L12 12M12 4L4 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

export default StopRow;
