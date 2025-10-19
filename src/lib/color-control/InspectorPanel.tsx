// @ts-nocheck
import { memo, useCallback, useEffect, useState } from 'react';
import type { ColorStop } from './types';
import { clampPosition } from './utils';

interface InspectorPanelProps {
  stop: ColorStop | null;
  onColorChange: (color: string) => void;
  onPositionChange: (position: number) => void;
  onDelete: () => void;
  canDelete: boolean;
  disabled?: boolean;
}

export const InspectorPanel = memo(function InspectorPanel({
  stop,
  onPositionChange,
  onDelete,
  canDelete,
  disabled = false,
}: InspectorPanelProps) {
  const [positionInput, setPositionInput] = useState('');

  useEffect(() => {
    if (stop) {
      setPositionInput(String(Math.round(stop.position)));
    }
  }, [stop]);

  const handlePositionInputChange = useCallback(
    (value: string) => {
      setPositionInput(value);
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        onPositionChange(clampPosition(parsed));
      }
    },
    [onPositionChange]
  );

  const handlePositionInputBlur = useCallback(() => {
    if (stop) {
      setPositionInput(String(Math.round(stop.position)));
    }
  }, [stop]);

  const handleSliderChange = useCallback(
    (value: number) => {
      onPositionChange(value);
      setPositionInput(String(Math.round(value)));
    },
    [onPositionChange]
  );

  if (!stop) {
    return (
      <div className="inspector-panel empty">
        <p className="empty-message">Select a color stop to edit</p>
        <style>{`
          .inspector-panel.empty {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 32px;
            background: #f9f9f9;
            border-radius: 8px;
            border: 2px dashed #ddd;
          }

          .empty-message {
            color: #999;
            font-size: 14px;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`inspector-panel ${disabled ? 'disabled' : ''}`}>
      <div className="inspector-section">
        <label className="inspector-label">Color</label>
        <div className="color-display">
          <div
            className="color-swatch"
            style={{ backgroundColor: stop.color }}
          />
          <span className="color-value">{stop.color}</span>
        </div>
      </div>

      <div className="inspector-section">
        <label htmlFor="position-slider" className="inspector-label">
          Position
        </label>
        <div className="position-controls">
          <input
            id="position-slider"
            type="range"
            min="0"
            max="100"
            step="1"
            value={stop.position}
            onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
            disabled={disabled}
            className="position-slider"
            aria-label="Color stop position"
          />
          <div className="position-input-group">
            <input
              type="number"
              value={positionInput}
              onChange={(e) => handlePositionInputChange(e.target.value)}
              onBlur={handlePositionInputBlur}
              disabled={disabled}
              min="0"
              max="100"
              className="position-input"
              aria-label="Position percentage"
            />
            <span className="position-unit">%</span>
          </div>
        </div>
      </div>

      <div className="inspector-section">
        <button
          className="delete-button"
          onClick={onDelete}
          disabled={!canDelete || disabled}
          aria-label="Delete color stop"
        >
          Delete Stop
        </button>
      </div>

      <style>{`
        .inspector-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .inspector-panel.disabled {
          opacity: 0.5;
          pointer-events: none;
        }

        .inspector-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .inspector-label {
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .color-display {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          background: #f9f9f9;
          border-radius: 4px;
        }

        .color-swatch {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          border: 2px solid rgba(0, 0, 0, 0.1);
          background-image:
            linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%);
          background-size: 8px 8px;
          background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
        }

        .color-value {
          font-family: monospace;
          font-size: 14px;
          color: #333;
        }

        .position-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .position-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #ddd;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
        }

        .position-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #2196F3;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .position-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #2196F3;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .position-slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3);
        }

        .position-slider:focus::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3);
        }

        .position-input-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .position-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: monospace;
        }

        .position-input:focus {
          outline: 2px solid #2196F3;
          outline-offset: -1px;
          border-color: #2196F3;
        }

        .position-unit {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .delete-button {
          padding: 10px 16px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 150ms ease-out;
        }

        .delete-button:hover:not(:disabled) {
          background: #d32f2f;
        }

        .delete-button:focus {
          outline: 2px solid #f44336;
          outline-offset: 2px;
        }

        .delete-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
});
