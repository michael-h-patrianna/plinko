import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const STYLES = {
  label: {
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '500' as const,
    marginBottom: '4px',
    display: 'block'
  },
  input: {
    background: '#2a2a2a',
    color: '#ffffff',
    border: '1px solid #444444',
    borderRadius: '4px',
    padding: '6px 8px',
    fontSize: '13px',
    width: '100%',
    boxSizing: 'border-box' as const
  },
  tooltip: {
    background: '#000000',
    color: '#ffffff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    maxWidth: '200px',
    position: 'fixed' as const,
    zIndex: 10001, // Above theme editor drawer (10000)
    whiteSpace: 'normal' as const,
    lineHeight: '1.4',
    pointerEvents: 'none' as const // Prevent tooltip from blocking mouse events
  },
  tooltipButton: {
    background: 'transparent',
    border: '1px solid #666666',
    borderRadius: '50%',
    color: '#999999',
    cursor: 'pointer',
    fontSize: '10px',
    width: '16px',
    height: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    lineHeight: 1
  }
};

// Tooltip Component
interface TooltipProps {
  content: string;
}

export function Tooltip({ content }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX - 100 + rect.width / 2 // Center tooltip over button
      });
    }
  };

  const handleToggle = () => {
    if (!visible) {
      updatePosition();
    }
    setVisible(!visible);
  };

  const handleMouseEnter = () => {
    updatePosition();
    setVisible(true);
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  // Update position on scroll or resize when tooltip is visible
  useEffect(() => {
    if (!visible) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, true); // Capture phase for all scrollable containers
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [visible]);

  const tooltipContent = visible ? (
    <div
      id="tooltip-content"
      role="tooltip"
      style={{
        ...STYLES.tooltip,
        top: position.top,
        left: position.left
      }}
    >
      {content}
    </div>
  ) : null;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={buttonRef}
        type="button"
        style={STYLES.tooltipButton}
        onClick={handleToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="Help"
        aria-describedby={visible ? 'tooltip-content' : undefined}
      >
        ?
      </button>
      {tooltipContent && createPortal(tooltipContent, document.body)}
    </div>
  );
}

// ColorInput Component
export interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

export function ColorInput({ label, value, onChange, description }: ColorInputProps) {
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Validate hex color format
    if (/^#[0-9A-Fa-f]{0,6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
        <label style={{ ...STYLES.label, marginBottom: 0 }}>{label}</label>
        {description && <Tooltip content={description} />}
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={handleColorChange}
          style={{
            width: '40px',
            height: '32px',
            border: '1px solid #444444',
            borderRadius: '4px',
            cursor: 'pointer',
            background: '#2a2a2a'
          }}
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          value={value}
          onChange={handleTextChange}
          style={{
            ...STYLES.input,
            flex: 1,
            textTransform: 'uppercase' as const
          }}
          placeholder="#000000"
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  );
}

// NumberInput Component
export interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
  description?: string;
}

export function NumberInput({ label, value, onChange, min, max, unit, description }: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
        <label style={{ ...STYLES.label, marginBottom: 0 }}>{label}</label>
        {description && <Tooltip content={description} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <input
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          style={STYLES.input}
          aria-label={label}
        />
        {unit && (
          <span style={{ color: '#999999', fontSize: '12px', minWidth: '30px' }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

// StringInput Component
export interface StringInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

export function StringInput({ label, value, onChange, description }: StringInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
        <label style={{ ...STYLES.label, marginBottom: 0 }}>{label}</label>
        {description && <Tooltip content={description} />}
      </div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        style={STYLES.input}
        aria-label={label}
      />
    </div>
  );
}

// SelectInput Component
export interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  description?: string;
}

export function SelectInput({ label, value, onChange, options, description }: SelectInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
        <label style={{ ...STYLES.label, marginBottom: 0 }}>{label}</label>
        {description && <Tooltip content={description} />}
      </div>
      <select
        value={value}
        onChange={handleChange}
        style={{
          ...STYLES.input,
          cursor: 'pointer'
        }}
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

// GradientInput Component
export interface GradientInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

export function GradientInput({ label, value, onChange, description }: GradientInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Check if gradient is valid for preview
  const isValidGradient = value.includes('linear-gradient');

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
        <label style={{ ...STYLES.label, marginBottom: 0 }}>{label}</label>
        {description && <Tooltip content={description} />}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
        <textarea
          value={value}
          onChange={handleChange}
          rows={3}
          style={{
            ...STYLES.input,
            resize: 'vertical' as const,
            fontFamily: 'monospace'
          }}
          placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          aria-label={label}
        />
        {isValidGradient && (
          <div
            style={{
              height: '40px',
              borderRadius: '4px',
              background: value,
              border: '1px solid #444444'
            }}
            aria-label="Gradient preview"
          />
        )}
      </div>
    </div>
  );
}
