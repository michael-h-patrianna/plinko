// @ts-nocheck
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { logger } from './shared-utils';
import styles from './ColorModal.module.css';
import ColorSpaceCanvas from './ColorSpaceCanvas.tsx';
import GradientBar from './GradientBar.tsx';
import HueSlider from './HueSlider.tsx';
import SolidColorEditor from './SolidColorEditor';
import StopsList from './StopsList.tsx';
import type { ColorFormat, ColorMode, ColorStop, ColorValue, GradientData, SolidColorData } from './types';
import { generateStopId, getColorAtPosition, hsvToRgb, parseColor, rgbToHex, rgbToHsv, sortStops } from './utils';

interface ColorModalProps {
  colorValue: ColorValue;
  selectedStopId: string | null;
  onColorValueChange: (value: ColorValue) => void;
  onSelectedStopChange: (stopId: string | null) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  maxStops: number;
  minStops: number;
  colorFormat: ColorFormat;
  lockedMode?: ColorMode; // If provided, mode switching is disabled
}

export const ColorModal = memo(function ColorModal({
  colorValue,
  selectedStopId,
  onColorValueChange,
  onSelectedStopChange,
  onClose,
  anchorRef,
  maxStops = 10,
  minStops = 2,
  colorFormat = 'hex',
  lockedMode,
}: ColorModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [colorSpace, setColorSpace] = useState<'hsv' | 'hsl'>('hsv');
  const [activeTab, setActiveTab] = useState<'color' | 'stops'>('color');

  // Current mode (from colorValue or locked)
  const currentMode = colorValue.type;
  const canSwitchMode = !lockedMode;

  // Handle mode switch
  const handleModeSwitch = useCallback(
    (newMode: ColorMode) => {
      if (!canSwitchMode || newMode === currentMode) return;

      logger.debug('MODE_SWITCH', {
        timestamp: Date.now(),
        fromMode: currentMode,
        toMode: newMode,
      });

      if (newMode === 'solid') {
        // Convert gradient to solid: use first stop's color
        const gradient = colorValue.data as GradientData;
        const firstColor = gradient.stops[0]?.color || '#ffffff';
        const rgb = parseColor(firstColor);

        const solidData: SolidColorData = {
          color: rgbToHex(rgb || { r: 255, g: 255, b: 255 }),
          alpha: rgb?.a ?? 1,
        };

        onColorValueChange({
          type: 'solid',
          data: solidData,
        });
      } else {
        // Convert solid to gradient: create 2-stop gradient
        const solid = colorValue.data as SolidColorData;
        const rgb = parseColor(solid.color);
        if (rgb) {
          rgb.a = solid.alpha;
        }
        const colorWithAlpha = rgb ? rgbToHex(rgb) : solid.color;

        const gradientData: GradientData = {
          angle: 90,
          stops: [
            { id: generateStopId(), color: colorWithAlpha, position: 0 },
            { id: generateStopId(), color: colorWithAlpha, position: 100 },
          ],
        };

        onColorValueChange({
          type: 'gradient',
          data: gradientData,
        });

        // Select first stop
        onSelectedStopChange(gradientData.stops[0].id);
      }
    },
    [canSwitchMode, currentMode, colorValue, onColorValueChange, onSelectedStopChange]
  );

  // Auto-select first stop if in gradient mode and none selected
  useEffect(() => {
    if (colorValue.type === 'gradient' && !selectedStopId && colorValue.data.stops.length > 0) {
      const firstStop = colorValue.data.stops[0];
      logger.debug('AUTO_SELECT_FIRST_STOP', {
        timestamp: Date.now(),
        stopId: firstStop.id,
        color: firstStop.color,
        position: firstStop.position,
      });
      onSelectedStopChange(firstStop.id);
    }
  }, [selectedStopId, colorValue, onSelectedStopChange]);

  // Wrapped stop selection with logging
  const handleSelectStop = useCallback(
    (stopId: string | null) => {
      if (colorValue.type !== 'gradient') return;

      const stop = stopId ? colorValue.data.stops.find((s) => s.id === stopId) : null;

      logger.debug('STOP_SELECT', {
        timestamp: Date.now(),
        stopId,
        color: stop?.color,
        position: stop?.position,
        totalStops: colorValue.data.stops.length,
        wasNull: stopId === null,
      });

      onSelectedStopChange(stopId);
    },
    [colorValue, onSelectedStopChange]
  );

  // Position modal relative to anchor
  useEffect(() => {
    if (!modalRef.current || !anchorRef.current) return;

    const anchor = anchorRef.current.getBoundingClientRect();
    const modal = modalRef.current;
    const modalHeight = 600;
    const modalWidth = 320;

    let top = anchor.bottom + 8;
    let left = anchor.left;

    if (top + modalHeight > window.innerHeight) {
      top = anchor.top - modalHeight - 8;
      if (top < 16) {
        top = Math.max(16, (window.innerHeight - modalHeight) / 2);
      }
    }

    if (left + modalWidth > window.innerWidth) {
      left = window.innerWidth - modalWidth - 16;
    }

    left = Math.max(16, left);
    top = Math.max(16, top);

    modal.style.top = `${top}px`;
    modal.style.left = `${left}px`;

    requestAnimationFrame(() => {
      // scrollIntoView is not supported in JSDOM, so check before calling
      if (typeof modal.scrollIntoView === 'function') {
        modal.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' });
      }
    });
  }, [anchorRef]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Close on click outside
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleModalClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  // Handlers for solid color mode
  const handleSolidColorChange = useCallback(
    (newSolidColor: SolidColorData) => {
      onColorValueChange({
        type: 'solid',
        data: newSolidColor,
      });
    },
    [onColorValueChange]
  );

  // Handlers for gradient mode (only used when type is gradient)
  const gradient = colorValue.type === 'gradient' ? colorValue.data : null;
  const selectedStop = gradient && selectedStopId
    ? gradient.stops.find((stop) => stop.id === selectedStopId) || null
    : null;

  const currentHsv = useMemo(() => {
    if (!selectedStop) return { h: 0, s: 0, v: 100 };
    const rgb = parseColor(selectedStop.color);
    return rgb ? rgbToHsv(rgb) : { h: 0, s: 0, v: 100 };
  }, [selectedStop]);

  const handleHueChange = useCallback(
    (newHue: number) => {
      if (!gradient || !selectedStopId || !selectedStop) return;

      const newHsv = { ...currentHsv, h: newHue };
      const newRgb = hsvToRgb(newHsv);
      const newColor = rgbToHex(newRgb);

      const newGradient = {
        ...gradient,
        stops: gradient.stops.map((stop) =>
          stop.id === selectedStopId ? { ...stop, color: newColor } : stop
        ),
      };

      onColorValueChange({
        type: 'gradient',
        data: newGradient,
      });
    },
    [gradient, selectedStopId, selectedStop, currentHsv, onColorValueChange]
  );

  const handleColorChange = useCallback(
    (color: string) => {
      if (!gradient || !selectedStopId) return;

      const newGradient = {
        ...gradient,
        stops: gradient.stops.map((stop) =>
          stop.id === selectedStopId ? { ...stop, color } : stop
        ),
      };

      onColorValueChange({
        type: 'gradient',
        data: newGradient,
      });
    },
    [gradient, selectedStopId, onColorValueChange]
  );

  const handleStopMove = useCallback(
    (id: string, newPosition: number) => {
      if (!gradient) return;

      const newGradient = {
        ...gradient,
        stops: gradient.stops.map((stop) =>
          stop.id === id ? { ...stop, position: newPosition } : stop
        ),
      };

      onColorValueChange({
        type: 'gradient',
        data: newGradient,
      });
    },
    [gradient, onColorValueChange]
  );

  const handleAddStop = useCallback(
    (position: number) => {
      if (!gradient || gradient.stops.length >= maxStops) return;

      const color = getColorAtPosition(gradient.stops, position);
      const newStop: ColorStop = {
        id: generateStopId(),
        color,
        position,
      };

      const newGradient = {
        ...gradient,
        stops: sortStops([...gradient.stops, newStop]),
      };

      onColorValueChange({
        type: 'gradient',
        data: newGradient,
      });
      handleSelectStop(newStop.id);
    },
    [gradient, maxStops, onColorValueChange, handleSelectStop]
  );

  const handleDeleteStop = useCallback(
    (id: string) => {
      if (!gradient || gradient.stops.length <= minStops) return;

      const newGradient = {
        ...gradient,
        stops: gradient.stops.filter((stop) => stop.id !== id),
      };

      onColorValueChange({
        type: 'gradient',
        data: newGradient,
      });

      if (selectedStopId === id) {
        handleSelectStop(newGradient.stops[0]?.id || null);
      }
    },
    [gradient, minStops, selectedStopId, onColorValueChange, handleSelectStop]
  );

  const handleAngleChange = useCallback(
    (angle: number) => {
      if (!gradient) return;

      const newGradient = {
        ...gradient,
        angle,
      };

      onColorValueChange({
        type: 'gradient',
        data: newGradient,
      });
    },
    [gradient, onColorValueChange]
  );

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick} data-testid="color-modal-backdrop">
      <div
        ref={modalRef}
        className={styles.modal}
        onClick={handleModalClick}
        role="dialog"
        aria-modal="true"
        aria-label="Color editor"
        data-testid="color-modal"
      >
        {/* Close button - positioned absolutely in top right */}
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Header with tabs and mode switcher */}
        <div className={styles.header}>
          {/* Mode switcher (only if not locked) */}
          {canSwitchMode && (
            <div className={styles.modeSwitcher}>
              <button
                type="button"
                className={`${styles.modeButton} ${currentMode === 'solid' ? styles.activeModeButton : ''}`}
                onClick={() => handleModeSwitch('solid')}
              >
                Solid
              </button>
              <button
                type="button"
                className={`${styles.modeButton} ${currentMode === 'gradient' ? styles.activeModeButton : ''}`}
                onClick={() => handleModeSwitch('gradient')}
              >
                Gradient
              </button>
            </div>
          )}

          {/* Tabs (only show for gradient mode) */}
          {currentMode === 'gradient' && (
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tab} ${activeTab === 'color' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('color')}
              >
                Color
              </button>
              <button
                type="button"
                className={`${styles.tab} ${activeTab === 'stops' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('stops')}
              >
                Stops
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Solid Color Mode */}
          {currentMode === 'solid' && (
            <SolidColorEditor
              solidColor={colorValue.data as SolidColorData}
              onColorChange={handleSolidColorChange}
            />
          )}

          {/* Gradient Mode - Color Tab */}
          {currentMode === 'gradient' && activeTab === 'color' && gradient && (
            <>
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
                  color={selectedStop?.color || '#ffffff'}
                  colorSpace={colorSpace}
                  onChange={handleColorChange}
                  disabled={false}
                />
              </div>

              {/* Hue slider */}
              <div className={styles.hueSliderContainer}>
                <HueSlider
                  hue={currentHsv.h}
                  onChange={handleHueChange}
                  disabled={!selectedStop}
                />
              </div>

              {/* Gradient bar */}
              <div className={styles.gradientBarContainer}>
                <GradientBar
                  gradient={gradient}
                  selectedStopId={selectedStopId}
                  onSelectStop={handleSelectStop}
                  onMoveStop={handleStopMove}
                  onAddStop={handleAddStop}
                  onDeleteStop={handleDeleteStop}
                  canAddStop={gradient.stops.length < maxStops}
                  canDeleteStop={gradient.stops.length > minStops}
                />
              </div>

              {/* Angle control */}
              <div className={styles.angleControl}>
                <label htmlFor="gradient-angle">Angle</label>
                <div className={styles.angleInputGroup}>
                  <input
                    id="gradient-angle"
                    type="number"
                    min="0"
                    max="360"
                    value={Math.round(gradient.angle)}
                    onChange={(e) => handleAngleChange(parseFloat(e.target.value) || 0)}
                    className={styles.angleInput}
                  />
                  <span>°</span>
                </div>
              </div>
            </>
          )}

          {/* Gradient Mode - Stops Tab */}
          {currentMode === 'gradient' && activeTab === 'stops' && gradient && (
            <div className={styles.stopsContainer}>
              <StopsList
                stops={gradient.stops}
                selectedStopId={selectedStopId}
                onSelectStop={handleSelectStop}
                onUpdateStop={(id: string, updates: Partial<ColorStop>) => {
                  const newGradient = {
                    ...gradient,
                    stops: gradient.stops.map((stop) =>
                      stop.id === id ? { ...stop, ...updates } : stop
                    ),
                  };
                  onColorValueChange({
                    type: 'gradient',
                    data: newGradient,
                  });
                }}
                onDeleteStop={handleDeleteStop}
                canDelete={gradient.stops.length > minStops}
                colorFormat={colorFormat}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ColorModal;
