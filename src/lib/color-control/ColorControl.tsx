// @ts-nocheck
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { debounce } from './shared-utils';
import styles from './ColorControl.module.css';
import ColorModal from './ColorModal.tsx';
import { serializeSolidColor } from './colorParser';
import { serializeGradient } from './gradientParser';
import type { ColorControlProps, ColorValue } from './types';

/**
 * Figma-style color control supporting both solid colors and linear gradients
 * - Compact preview button (form control size)
 * - Click to open modal with full controls
 * - Modal contains: color/gradient editor with optional mode switching
 */
export function ColorControl({
  value,
  onChange,
  disabled = false,
  className = '',
  colorFormat = 'hex',
  mode, // Optional: locks the control to one mode
  maxStops = 10,
  minStops = 2,
}: ColorControlProps) {
  const [colorValue, setColorValue] = useState<ColorValue>(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastValueRef = useRef<ColorValue>(value);

  // Sync with external value changes
  useEffect(() => {
    if (value !== lastValueRef.current) {
      setColorValue(value);
      lastValueRef.current = value;
    }
  }, [value]);

  // Debounced onChange to prevent excessive updates
  const debouncedOnChange = useMemo(
    () => debounce((newValue: ColorValue) => {
      lastValueRef.current = newValue;
      onChange(newValue);
    }, 16), // ~60fps
    [onChange]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  // Update color value and notify parent
  const updateColorValue = useCallback(
    (newValue: ColorValue) => {
      setColorValue(newValue);
      debouncedOnChange(newValue);
    },
    [debouncedOnChange]
  );

  // Open modal
  const handleOpen = useCallback(() => {
    if (!disabled) {
      // Auto-select first stop if in gradient mode and none selected
      if (colorValue.type === 'gradient' && !selectedStopId && colorValue.data.stops.length > 0) {
        setSelectedStopId(colorValue.data.stops[0].id);
      }
      setIsOpen(true);
    }
  }, [disabled, selectedStopId, colorValue]);

  // Close modal
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Handle keyboard on preview button
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleOpen();
      }
    },
    [handleOpen]
  );

  // Get preview background style
  const previewStyle = useMemo(() => {
    if (colorValue.type === 'solid') {
      return serializeSolidColor(colorValue.data, colorFormat);
    } else {
      return serializeGradient(colorValue.data, colorFormat);
    }
  }, [colorValue, colorFormat]);

  return (
    <>
      {/* Compact preview button */}
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.previewButton} ${className} ${disabled ? styles.disabled : ''}`}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={colorValue.type === 'solid' ? 'Edit color' : 'Edit gradient'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        data-testid="color-preview"
      >
        {/* Checkerboard background for transparency */}
        <div className={styles.checkerboard} />

        {/* Color/Gradient preview */}
        <div
          className={styles.preview}
          style={{ background: previewStyle }}
        />

        {/* Chevron icon */}
        <svg
          className={styles.chevron}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Modal */}
      {isOpen &&
        createPortal(
          <ColorModal
            colorValue={colorValue}
            selectedStopId={selectedStopId}
            onColorValueChange={updateColorValue}
            onSelectedStopChange={setSelectedStopId}
            onClose={handleClose}
            anchorRef={buttonRef}
            maxStops={maxStops}
            minStops={minStops}
            colorFormat={colorFormat}
            lockedMode={mode}
          />,
          document.body
        )}
    </>
  );
}

export default ColorControl;
