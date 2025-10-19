// @ts-nocheck
import { useCallback, useRef } from 'react';
import { ColorStopMarker } from './ColorStopMarker';
import styles from './GradientBar.module.css';
import { serializeGradient } from './gradientParser';
import type { GradientData } from './types';

interface GradientBarProps {
  gradient: GradientData;
  selectedStopId: string | null;
  onSelectStop: (id: string) => void;
  onMoveStop: (id: string, position: number) => void;
  onAddStop: (position: number) => void;
  onDeleteStop: (id: string) => void;
  canAddStop: boolean;
  canDeleteStop: boolean;
}

/**
 * Interactive gradient visualization bar with draggable color stops
 *
 * @description Displays gradient as a horizontal bar with positioned color stops.
 * Supports adding stops by clicking bar, dragging stops to reposition, and deleting stops.
 *
 * @param gradient - Current gradient configuration (stops, angle)
 * @param selectedStopId - ID of currently selected stop (for highlighting)
 * @param onSelectStop - Callback when a stop is selected
 * @param onMoveStop - Callback when a stop is dragged to new position
 * @param onAddStop - Callback to add new stop at clicked position
 * @param onDeleteStop - Callback to delete a stop
 * @param canAddStop - Whether adding new stops is allowed (enforces maximum)
 * @param canDeleteStop - Whether deleting stops is allowed (enforces minimum)
 */
export function GradientBar({
  gradient,
  selectedStopId,
  onSelectStop,
  onMoveStop,
  onAddStop,
  onDeleteStop,
  canAddStop,
  canDeleteStop,
}: GradientBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  // Generate gradient CSS for preview
  const gradientString = serializeGradient(gradient);

  // Handle double-click on bar to add stop
  const handleBarDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!canAddStop) return;

      const target = event.target as HTMLElement;
      // Don't add if clicking on a marker
      if (target.closest('[data-stop-marker]')) return;

      const bar = barRef.current;
      if (!bar) return;

      const rect = bar.getBoundingClientRect();
      const position = ((event.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.max(0, Math.min(100, position));

      onAddStop(clamped);
    },
    [canAddStop, onAddStop]
  );

  return (
    <div className={styles.container}>
      {/* Gradient preview bar */}
      <div
        ref={barRef}
        className={`${styles.bar} ${canAddStop ? styles.canAdd : ''}`}
        onDoubleClick={handleBarDoubleClick}
        role="slider"
        aria-label="Gradient bar"
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Checkerboard background */}
        <div className={styles.checkerboard} />

        {/* Gradient overlay */}
        <div
          className={styles.gradient}
          style={{ background: gradientString }}
        />

        {/* Color stop markers */}
        <div className={styles.markers}>
          {gradient.stops.map((stop) => (
            <ColorStopMarker
              key={stop.id}
              stop={stop}
              isSelected={stop.id === selectedStopId}
              onSelect={() => onSelectStop(stop.id)}
              onMove={(newPosition) => onMoveStop(stop.id, newPosition)}
              onDelete={() => onDeleteStop(stop.id)}
              canDelete={canDeleteStop}
              barRef={barRef}
            />
          ))}
        </div>
      </div>

      {/* Helper text */}
      {canAddStop && (
        <div className={styles.helperText}>
          Double-click to add color stop
        </div>
      )}
    </div>
  );
}

export default GradientBar;
