// @ts-nocheck
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import styles from './ColorStopMarker.module.css';
import type { ColorStop } from './types';
import { clampPosition } from './utils';

interface ColorStopMarkerProps {
  stop: ColorStop;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (newPosition: number) => void;
  onDelete: () => void;
  disabled?: boolean;
  canDelete: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  barRef?: React.RefObject<HTMLDivElement | null>;
}

export const ColorStopMarker = memo(function ColorStopMarker({
  stop,
  isSelected,
  onSelect,
  onMove,
  onDelete,
  disabled = false,
  canDelete,
  containerRef,
  barRef,
}: ColorStopMarkerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const dragStartPosition = useRef(stop.position);

  // Use whichever ref is provided
  const activeRef = barRef || containerRef;

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (disabled) return;

      event.preventDefault();
      event.stopPropagation();

      if (!isSelected) {
        onSelect();
      }

      setIsDragging(true);
      setDragStartY(event.clientY);
      setCurrentY(event.clientY);
      dragStartPosition.current = stop.position;
    },
    [disabled, isSelected, onSelect, stop.position]
  );

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      if (disabled || !canDelete) return;

      event.preventDefault();
      event.stopPropagation();

      onDelete();
    },
    [disabled, canDelete, onDelete]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      let handled = false;
      let newPosition = stop.position;

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (canDelete) {
          onDelete();
          handled = true;
        }
      } else if (event.key === 'ArrowLeft') {
        if (event.metaKey || event.ctrlKey) {
          newPosition = 0;
        } else {
          const step = event.shiftKey ? 10 : 1;
          newPosition = clampPosition(stop.position - step);
        }
        handled = true;
      } else if (event.key === 'ArrowRight') {
        if (event.metaKey || event.ctrlKey) {
          newPosition = 100;
        } else {
          const step = event.shiftKey ? 10 : 1;
          newPosition = clampPosition(stop.position + step);
        }
        handled = true;
      }

      if (handled) {
        event.preventDefault();
        if (newPosition !== stop.position) {
          onMove(newPosition);
        }
      }
    },
    [disabled, stop.position, canDelete, onDelete, onMove]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      setCurrentY(event.clientY);

      const container = activeRef?.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const newPosition = ((event.clientX - rect.left) / rect.width) * 100;
      const clamped = clampPosition(newPosition);

      onMove(clamped);
    };

    const handleMouseUp = (event: MouseEvent) => {
      const verticalDelta = Math.abs(event.clientY - dragStartY);

      // Drag-away deletion: if dragged more than 50px vertically, delete
      if (verticalDelta > 50 && canDelete) {
        onDelete();
      }

      setIsDragging(false);
      setCurrentY(0);
      setDragStartY(0);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartY, canDelete, onDelete, onMove, activeRef]);

  const verticalOffset = isDragging ? currentY - dragStartY : 0;
  const shouldShowDeleteHint = Math.abs(verticalOffset) > 30 && canDelete;

  const markerClassName = `${styles.marker} ${isSelected ? styles.selected : ''} ${isDragging ? styles.dragging : ''} ${disabled ? styles.disabled : ''}`;

  return (
    <>
      <div
        data-stop-marker
        className={markerClassName}
        style={{
          left: `${stop.position}%`,
          backgroundColor: stop.color,
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        onClick={(e) => {
          e.stopPropagation();
          if (!isSelected) onSelect();
        }}
        tabIndex={disabled ? -1 : 0}
        role="slider"
        aria-label={`Color stop at ${Math.round(stop.position)}%`}
        aria-valuenow={Math.round(stop.position)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-disabled={disabled}
      />
      {shouldShowDeleteHint && (
        <div
          className={styles.deleteHint}
          style={{ left: `${stop.position}%` }}
        >
          Release to delete
        </div>
      )}
    </>
  );
});
