// @ts-nocheck
import * as m from 'motion/react-m';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { logger } from './shared-utils';
import styles from './ColorSpaceCanvas.module.css';
import { hsvToRgb, parseColor, rgbToHex, rgbToHsv } from './utils';

interface ColorSpaceCanvasProps {
  color: string;
  colorSpace: 'hsv' | 'hsl';
  onChange: (color: string) => void;
  disabled?: boolean;
}

export const ColorSpaceCanvas = memo(function ColorSpaceCanvas({
  color,
  colorSpace,
  onChange,
  disabled = false,
}: ColorSpaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Parse color to HSV
  const hsv = useMemo(() => {
    const rgb = parseColor(color);
    return rgb ? rgbToHsv(rgb) : { h: 0, s: 0, v: 100, a: 1 };
  }, [color]);

  // Render color space gradient on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    if (colorSpace === 'hsv') {
      // HSV: Horizontal = Saturation (white → pure hue), Vertical = Value/Brightness (top = bright, bottom = dark)

      // Get pure hue color
      const pureHueRgb = hsvToRgb({ h: hsv.h, s: 100, v: 100 });
      const pureHueColor = `rgb(${pureHueRgb.r}, ${pureHueRgb.g}, ${pureHueRgb.b})`;

      // Horizontal gradient: white → pure hue
      const saturationGradient = ctx.createLinearGradient(0, 0, width, 0);
      saturationGradient.addColorStop(0, '#ffffff');
      saturationGradient.addColorStop(1, pureHueColor);
      ctx.fillStyle = saturationGradient;
      ctx.fillRect(0, 0, width, height);

      // Vertical gradient: transparent → black (for brightness/value)
      const brightnessGradient = ctx.createLinearGradient(0, 0, 0, height);
      brightnessGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      brightnessGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
      ctx.fillStyle = brightnessGradient;
      ctx.fillRect(0, 0, width, height);
    } else {
      // HSL: Similar but using lightness instead of value
      // For simplicity, we'll use the same rendering for now
      const pureHueRgb = hsvToRgb({ h: hsv.h, s: 100, v: 100 });
      const pureHueColor = `rgb(${pureHueRgb.r}, ${pureHueRgb.g}, ${pureHueRgb.b})`;

      const saturationGradient = ctx.createLinearGradient(0, 0, width, 0);
      saturationGradient.addColorStop(0, '#808080'); // Gray for HSL
      saturationGradient.addColorStop(1, pureHueColor);
      ctx.fillStyle = saturationGradient;
      ctx.fillRect(0, 0, width, height);

      const lightnessGradient = ctx.createLinearGradient(0, 0, 0, height);
      lightnessGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      lightnessGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
      lightnessGradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
      ctx.fillStyle = lightnessGradient;
      ctx.fillRect(0, 0, width, height);
    }
  }, [hsv.h, colorSpace]);

  // Update color from canvas position
  const updateColorFromPosition = useCallback(
    (clientX: number, clientY: number, eventType: 'click' | 'drag') => {
      if (disabled) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Use canvas rect to get actual drawable area (excludes container border)
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(clientY - rect.top, rect.height));

      const saturation = (x / rect.width) * 100;
      const brightness = 100 - (y / rect.height) * 100;

      const newHsv = {
        h: hsv.h,
        s: Math.round(saturation),
        v: Math.round(brightness),
        a: hsv.a,
      };

      const newRgb = hsvToRgb(newHsv);
      const newColor = rgbToHex(newRgb);

      // Calculate cursor position for logging
      const cursorLeft = (newHsv.s / 100) * 100;
      const cursorTop = ((100 - newHsv.v) / 100) * 100;

      // DEBUG: Log canvas interaction with JSON.stringify for Playwright parsing
      logger.debug('CANVAS_' + eventType.toUpperCase(), {
        timestamp: Date.now(),
        clickPosition: { clientX, clientY, x, y },
        canvasSize: { width: rect.width, height: rect.height },
        canvasBounds: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
        calculatedHSV: newHsv,
        oldHSV: { h: hsv.h, s: hsv.s, v: hsv.v, a: hsv.a },
        resultingHex: newColor,
        oldHex: color,
        cursorPosition: { left: `${cursorLeft}%`, top: `${cursorTop}%` },
        colorSpace,
      });

      onChange(newColor);
    },
    [hsv.h, hsv.s, hsv.v, hsv.a, color, colorSpace, onChange, disabled]
  );

  // Handle canvas click (direct color selection)
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      logger.debug('CANVAS_CONTAINER_CLICK', {
        timestamp: Date.now(),
        target: (event.target as HTMLElement).tagName,
        testid: (event.target as HTMLElement).getAttribute('data-testid'),
        disabled,
      });

      if (disabled) return;

      // Only handle clicks on the canvas itself, not the cursor
      const target = event.target as HTMLElement;
      if (target.closest('[data-testid="canvas-cursor"]')) {
        logger.debug('CANVAS_CLICK_IGNORED', {
          timestamp: Date.now(),
          reason: 'clicked on cursor',
        });
        return; // Ignore clicks on the cursor
      }

      event.preventDefault();
      updateColorFromPosition(event.clientX, event.clientY, 'click');
    },
    [disabled, updateColorFromPosition]
  );

  // Handle cursor drag start with native pointer events
  const handleCursorPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (disabled) return;

      event.preventDefault();
      event.stopPropagation(); // Don't trigger canvas click
      setIsDragging(true);

      logger.debug('CANVAS_DRAG_START', {
        timestamp: Date.now(),
        currentColor: color,
        currentHSV: { h: hsv.h, s: hsv.s, v: hsv.v, a: hsv.a },
      });
    },
    [disabled, color, hsv]
  );

  // Handle dragging via useEffect to attach to document
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (disabled) return;
      updateColorFromPosition(event.clientX, event.clientY, 'drag');
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      logger.debug('CANVAS_DRAG_END', {
        timestamp: Date.now(),
        finalColor: color,
        finalHSV: { h: hsv.h, s: hsv.s, v: hsv.v, a: hsv.a },
      });
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, disabled, updateColorFromPosition, color, hsv]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      const step = event.shiftKey ? 10 : 1;
      let newSaturation = hsv.s;
      let newBrightness = hsv.v;
      let handled = false;

      switch (event.key) {
        case 'ArrowLeft':
          newSaturation = Math.max(0, hsv.s - step);
          handled = true;
          break;
        case 'ArrowRight':
          newSaturation = Math.min(100, hsv.s + step);
          handled = true;
          break;
        case 'ArrowUp':
          newBrightness = Math.min(100, hsv.v + step);
          handled = true;
          break;
        case 'ArrowDown':
          newBrightness = Math.max(0, hsv.v - step);
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();

        const oldHSV = { h: hsv.h, s: hsv.s, v: hsv.v, a: hsv.a };
        const newHsv = { h: hsv.h, s: newSaturation, v: newBrightness, a: hsv.a };
        const newRgb = hsvToRgb(newHsv);
        const newColor = rgbToHex(newRgb);

        logger.debug('CANVAS_KEYBOARD', {
          timestamp: Date.now(),
          key: event.key,
          shift: event.shiftKey,
          step,
          oldHSV,
          newHSV: newHsv,
          oldHex: color,
          newHex: newColor,
        });

        onChange(newColor);
      }
    },
    [hsv, color, onChange, disabled]
  );

  // Calculate cursor position
  const cursorX = (hsv.s / 100) * 100; // percentage
  const cursorY = ((100 - hsv.v) / 100) * 100; // percentage

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${disabled ? styles.disabled : ''}`}
      onClick={handleCanvasClick}
      tabIndex={disabled ? -1 : 0}
      role="slider"
      aria-label={`${colorSpace.toUpperCase()} color space`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(hsv.s)}
      aria-valuetext={`Saturation ${Math.round(hsv.s)}%, Brightness ${Math.round(hsv.v)}%`}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled}
      data-testid="canvas-container"
      data-color-space={colorSpace}
      data-current-hsv={JSON.stringify({ h: hsv.h, s: hsv.s, v: hsv.v })}
      data-current-color={color}
    >
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={280}
        height={180}
        data-testid="color-canvas"
      />

      <m.div
        onPointerDown={handleCursorPointerDown}
        whileHover={{ scale: 1.05 }}
        animate={{ scale: isDragging ? 1.1 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={styles.cursor}
        style={{
          left: `${cursorX}%`,
          top: `${cursorY}%`,
          backgroundColor: color,
          opacity: disabled ? 0.5 : 1,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        data-testid="canvas-cursor"
        data-cursor-position={JSON.stringify({ left: cursorX, top: cursorY })}
        data-cursor-visible={!disabled ? 'true' : 'false'}
      >
        <div className={styles.cursorRing} />
      </m.div>
    </div>
  );
});

export default ColorSpaceCanvas;
