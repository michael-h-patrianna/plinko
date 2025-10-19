// @ts-nocheck
import { memo, useCallback, useRef } from 'react';
import { ColorStopMarker } from './ColorStopMarker';
import { serializeGradient } from './gradientParser';
import type { GradientData } from './types';

interface GradientPreviewProps {
  gradient: GradientData;
  selectedStopId: string | null;
  onSelectStop: (id: string) => void;
  onAddStop: (position: number) => void;
  onMoveStop: (id: string, newPosition: number) => void;
  onDeleteStop: (id: string) => void;
  disabled?: boolean;
  canAddStop: boolean;
  canDeleteStop: boolean;
  children?: React.ReactNode;
}

export const GradientPreview = memo(function GradientPreview({
  gradient,
  selectedStopId,
  onSelectStop,
  onAddStop,
  onMoveStop,
  onDeleteStop,
  disabled = false,
  canAddStop,
  canDeleteStop,
}: GradientPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gradientString = serializeGradient(gradient);

  const handleBarClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !canAddStop) return;

      const target = event.target as HTMLElement;
      // Don't add stop if clicking on a marker
      if (target.closest('[data-stop-marker]')) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const position = ((event.clientX - rect.left) / rect.width) * 100;
      const clampedPosition = Math.max(0, Math.min(100, position));

      onAddStop(clampedPosition);
    },
    [disabled, canAddStop, onAddStop]
  );

  return (
    <div className="gradient-preview-container">
      <div
        ref={containerRef}
        className={`gradient-preview ${disabled ? 'disabled' : ''} ${canAddStop ? 'can-add' : ''}`}
        onClick={handleBarClick}
        role="img"
        aria-label={`Gradient with ${gradient.stops.length} color stops at ${gradient.angle} degrees`}
      >
        {/* Checkerboard background for transparency */}
        <div className="gradient-preview-checkerboard" />

        {/* Gradient overlay */}
        <div
          className="gradient-preview-bar"
          style={{ background: gradientString }}
        />

        {/* Color stop markers */}
        <div className="gradient-preview-markers">
          {gradient.stops.map((stop) => (
            <ColorStopMarker
              key={stop.id}
              stop={stop}
              isSelected={stop.id === selectedStopId}
              onSelect={() => onSelectStop(stop.id)}
              onMove={(newPosition: number) => onMoveStop(stop.id, newPosition)}
              onDelete={() => onDeleteStop(stop.id)}
              disabled={disabled}
              canDelete={canDeleteStop}
              containerRef={containerRef}
            />
          ))}
        </div>
      </div>

      <style>{`
        .gradient-preview-container {
          width: 100%;
          min-width: 200px;
        }

        .gradient-preview {
          position: relative;
          width: 100%;
          height: 48px;
          border-radius: 8px;
          overflow: visible;
          border: 2px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: opacity 150ms ease-out;
        }

        .gradient-preview.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .gradient-preview.can-add:not(.disabled) {
          cursor: crosshair;
        }

        .gradient-preview-checkerboard {
          position: absolute;
          inset: 0;
          border-radius: 6px;
          background-image:
            linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%);
          background-size: 16px 16px;
          background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
        }

        .gradient-preview-bar {
          position: absolute;
          inset: 0;
          border-radius: 6px;
        }

        .gradient-preview-markers {
          position: absolute;
          inset: 0;
          /* Allow pointer events for child markers */
        }

        @media (max-width: 768px) {
          .gradient-preview {
            height: 56px; /* Larger on mobile for touch targets */
          }
        }
      `}</style>
    </div>
  );
});
