// @ts-nocheck
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { normalizeAngle } from './utils';

interface AngleControlProps {
  angle: number;
  onChange: (angle: number) => void;
  disabled?: boolean;
}

const PRESET_ANGLES = [
  { angle: 0, label: '→' },
  { angle: 45, label: '↘' },
  { angle: 90, label: '↓' },
  { angle: 135, label: '↙' },
  { angle: 180, label: '←' },
  { angle: 225, label: '↖' },
  { angle: 270, label: '↑' },
  { angle: 315, label: '↗' },
];

export const AngleControl = memo(function AngleControl({
  angle,
  onChange,
  disabled = false,
}: AngleControlProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [inputValue, setInputValue] = useState(String(angle));
  const dialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(String(Math.round(angle)));
  }, [angle]);

  const handleDialMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (disabled) return;
      event.preventDefault();
      setIsDragging(true);

      // Calculate initial angle
      const rect = dialRef.current?.getBoundingClientRect();
      if (!rect) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = event.clientX - centerX;
      const deltaY = event.clientY - centerY;

      let newAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      newAngle = normalizeAngle(newAngle);

      onChange(newAngle);
    },
    [disabled, onChange]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = dialRef.current?.getBoundingClientRect();
      if (!rect) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = event.clientX - centerX;
      const deltaY = event.clientY - centerY;

      let newAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      newAngle = normalizeAngle(newAngle);

      // Snap to 45° increments if shift key is pressed
      if (event.shiftKey) {
        newAngle = Math.round(newAngle / 45) * 45;
      }

      onChange(normalizeAngle(newAngle));
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
  }, [isDragging, onChange]);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      onChange(normalizeAngle(parsed));
    }
  }, [onChange]);

  const handleInputBlur = useCallback(() => {
    setInputValue(String(Math.round(angle)));
  }, [angle]);

  const handlePresetClick = useCallback(
    (presetAngle: number) => {
      if (!disabled) {
        onChange(presetAngle);
      }
    },
    [disabled, onChange]
  );

  // Convert angle to radians for rotation
  const rotationDegrees = angle;

  return (
    <div className="angle-control">
      <div className="angle-control-label">Angle</div>

      <div className="angle-dial-container">
        <div
          ref={dialRef}
          className={`angle-dial ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
          onMouseDown={handleDialMouseDown}
          role="slider"
          aria-label="Gradient angle"
          aria-valuenow={Math.round(angle)}
          aria-valuemin={0}
          aria-valuemax={360}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
        >
          <div className="angle-dial-circle">
            {/* Degree markers */}
            {[0, 90, 180, 270].map((deg) => (
              <div
                key={deg}
                className="angle-marker"
                style={{
                  transform: `rotate(${deg}deg) translateY(-35px)`,
                }}
              >
                {deg}°
              </div>
            ))}

            {/* Handle */}
            <div
              className="angle-handle"
              style={{
                transform: `rotate(${rotationDegrees}deg) translateY(-35px)`,
              }}
            />
          </div>
        </div>

        <div className="angle-input-container">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={handleInputBlur}
            disabled={disabled}
            min="0"
            max="360"
            aria-label="Angle in degrees"
          />
          <span className="angle-unit">°</span>
        </div>
      </div>

      <div className="angle-presets">
        {PRESET_ANGLES.map((preset) => (
          <button
            key={preset.angle}
            className={`angle-preset ${angle === preset.angle ? 'active' : ''}`}
            onClick={() => handlePresetClick(preset.angle)}
            disabled={disabled}
            title={`${preset.angle}°`}
            aria-label={`Set angle to ${preset.angle} degrees`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <style>{`
        .angle-control {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          background: white;
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .angle-control-label {
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .angle-dial-container {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .angle-dial {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 2px solid #ddd;
          background: #f9f9f9;
          position: relative;
          cursor: grab;
          transition: box-shadow 150ms ease-out;
        }

        .angle-dial:hover:not(.disabled) {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .angle-dial:focus {
          outline: 2px solid #2196F3;
          outline-offset: 2px;
        }

        .angle-dial.dragging {
          cursor: grabbing;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .angle-dial.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .angle-dial-circle {
          position: absolute;
          inset: 0;
        }

        .angle-marker {
          position: absolute;
          top: 50%;
          left: 50%;
          font-size: 10px;
          color: #999;
          transform-origin: center;
        }

        .angle-handle {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 4px;
          height: 32px;
          background: #2196F3;
          border-radius: 2px;
          transform-origin: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .angle-input-container {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .angle-input-container input {
          width: 70px;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: monospace;
        }

        .angle-input-container input:focus {
          outline: 2px solid #2196F3;
          outline-offset: -1px;
          border-color: #2196F3;
        }

        .angle-input-container input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .angle-unit {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .angle-presets {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 8px;
        }

        .angle-preset {
          width: 32px;
          height: 32px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          font-size: 16px;
          cursor: pointer;
          transition: all 150ms ease-out;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .angle-preset:hover:not(:disabled) {
          background: #f0f0f0;
          border-color: #2196F3;
        }

        .angle-preset:focus {
          outline: 2px solid #2196F3;
          outline-offset: 2px;
        }

        .angle-preset.active {
          background: #2196F3;
          color: white;
          border-color: #2196F3;
        }

        .angle-preset:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .angle-presets {
            grid-template-columns: repeat(4, 1fr);
          }

          .angle-preset {
            width: 44px;
            height: 44px;
          }
        }
      `}</style>
    </div>
  );
});
