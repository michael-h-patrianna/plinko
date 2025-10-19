// @ts-nocheck
import { memo, useCallback, useEffect, useState } from 'react';
import type { ColorFormat } from './types';
import { hexToRgb, parseColor, rgbToHex } from './utils';

interface SimpleColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  format?: ColorFormat;
}

export const SimpleColorPicker = memo(function SimpleColorPicker({
  color,
  onChange,
}: SimpleColorPickerProps) {
  const [hexValue, setHexValue] = useState('');
  const [rgbValue, setRgbValue] = useState({ r: 255, g: 255, b: 255, a: 1 as number | undefined });

  useEffect(() => {
    const parsed = parseColor(color);
    if (parsed) {
      setRgbValue({ r: parsed.r, g: parsed.g, b: parsed.b, a: parsed.a ?? 1 });
      setHexValue(rgbToHex(parsed));
    }
  }, [color]);

  const handleHexChange = useCallback(
    (value: string) => {
      setHexValue(value);
      const parsed = hexToRgb(value);
      if (parsed) {
        setRgbValue({ r: parsed.r, g: parsed.g, b: parsed.b, a: parsed.a ?? 1 });
        onChange(rgbToHex(parsed));
      }
    },
    [onChange]
  );

  const handleRgbChange = useCallback(
    (channel: 'r' | 'g' | 'b' | 'a', value: number) => {
      const newRgb = { ...rgbValue, [channel]: value };
      setRgbValue(newRgb);
      const hex = rgbToHex(newRgb);
      setHexValue(hex);
      onChange(hex);
    },
    [rgbValue, onChange]
  );

  return (
    <div className="simple-color-picker">
      <div className="color-preview" style={{ backgroundColor: color }} />

      <div className="color-inputs">
        <div className="input-group">
          <label htmlFor="hex-input">HEX</label>
          <input
            id="hex-input"
            type="text"
            value={hexValue}
            onChange={(e) => handleHexChange(e.target.value)}
            placeholder="#ffffff"
          />
        </div>

        <div className="rgb-inputs">
          <div className="input-group">
            <label htmlFor="r-input">R</label>
            <input
              id="r-input"
              type="number"
              min="0"
              max="255"
              value={Math.round(rgbValue.r)}
              onChange={(e) => handleRgbChange('r', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="g-input">G</label>
            <input
              id="g-input"
              type="number"
              min="0"
              max="255"
              value={Math.round(rgbValue.g)}
              onChange={(e) => handleRgbChange('g', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="b-input">B</label>
            <input
              id="b-input"
              type="number"
              min="0"
              max="255"
              value={Math.round(rgbValue.b)}
              onChange={(e) => handleRgbChange('b', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {rgbValue.a !== undefined && (
          <div className="input-group">
            <label htmlFor="a-input">Alpha</label>
            <input
              id="a-input"
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={rgbValue.a}
              onChange={(e) => handleRgbChange('a', parseFloat(e.target.value) || 0)}
            />
          </div>
        )}
      </div>

      <style>{`
        .simple-color-picker {
          padding: 16px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          min-width: 280px;
        }

        .color-preview {
          width: 100%;
          height: 60px;
          border-radius: 6px;
          margin-bottom: 16px;
          border: 2px solid rgba(0, 0, 0, 0.1);
          background-image:
            linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%);
          background-size: 16px 16px;
          background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
        }

        .color-inputs {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .rgb-inputs {
          display: flex;
          gap: 8px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .input-group label {
          font-size: 12px;
          font-weight: 500;
          color: #666;
          text-transform: uppercase;
        }

        .input-group input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: monospace;
        }

        .input-group input:focus {
          outline: 2px solid #2196F3;
          outline-offset: -1px;
          border-color: #2196F3;
        }

        .input-group input[type="number"] {
          width: 100%;
        }
      `}</style>
    </div>
  );
});
