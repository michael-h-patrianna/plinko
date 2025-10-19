// @ts-nocheck
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import styles from './SaturationBrightness.module.css';

interface SaturationBrightnessProps {
  hue: number; // 0-360
  saturation: number; // 0-100
  brightness: number; // 0-100
  onChange: (saturation: number, brightness: number) => void;
}

export const SaturationBrightness = memo(function SaturationBrightness({
  hue,
  saturation,
  brightness,
  onChange,
}: SaturationBrightnessProps) {
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Draw the saturation/brightness gradient
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Convert hue to RGB for the base color
    const h = hue / 360;
    const rgb = hsvToRgb(h, 1, 1);

    // Create horizontal saturation gradient (white to color)
    const saturationGradient = ctx.createLinearGradient(0, 0, width, 0);
    saturationGradient.addColorStop(0, '#ffffff');
    saturationGradient.addColorStop(1, `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);

    ctx.fillStyle = saturationGradient;
    ctx.fillRect(0, 0, width, height);

    // Create vertical brightness gradient (transparent to black)
    const brightnessGradient = ctx.createLinearGradient(0, 0, 0, height);
    brightnessGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    brightnessGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

    ctx.fillStyle = brightnessGradient;
    ctx.fillRect(0, 0, width, height);
  }, [hue]);

  // HSV to RGB helper (simplified for rendering)
  function hsvToRgb(h: number, s: number, v: number) {
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    let r, g, b;
    switch (i % 6) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      case 5:
      default:
        r = v;
        g = p;
        b = q;
        break;
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  // Handle position to saturation/brightness conversion
  const updateColorFromPosition = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(clientY - rect.top, rect.height));

      const newSaturation = (x / rect.width) * 100;
      const newBrightness = 100 - (y / rect.height) * 100;

      onChange(Math.round(newSaturation), Math.round(newBrightness));
    },
    [onChange]
  );

  // Handle mouse down
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      setIsDragging(true);
      updateColorFromPosition(event.clientX, event.clientY);
    },
    [updateColorFromPosition]
  );

  // Handle mouse move
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      updateColorFromPosition(event.clientX, event.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, updateColorFromPosition]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      let newSaturation = saturation;
      let newBrightness = brightness;
      let handled = false;

      const step = event.shiftKey ? 10 : 1;

      switch (event.key) {
        case 'ArrowLeft':
          newSaturation = Math.max(0, saturation - step);
          handled = true;
          break;
        case 'ArrowRight':
          newSaturation = Math.min(100, saturation + step);
          handled = true;
          break;
        case 'ArrowUp':
          newBrightness = Math.min(100, brightness + step);
          handled = true;
          break;
        case 'ArrowDown':
          newBrightness = Math.max(0, brightness - step);
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
        onChange(newSaturation, newBrightness);
      }
    },
    [saturation, brightness, onChange]
  );

  // Calculate cursor position
  const cursorX = (saturation / 100) * 100; // percentage
  const cursorY = ((100 - brightness) / 100) * 100; // percentage

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onMouseDown={handleMouseDown}
      tabIndex={0}
      role="slider"
      aria-label="Saturation and brightness"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(saturation)}
      aria-valuetext={`Saturation ${Math.round(saturation)}%, Brightness ${Math.round(brightness)}%`}
      onKeyDown={handleKeyDown}
    >
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={280}
        height={180}
      />
      <div
        className={styles.cursor}
        style={{
          left: `${cursorX}%`,
          top: `${cursorY}%`,
        }}
      />
    </div>
  );
});

export default SaturationBrightness;
