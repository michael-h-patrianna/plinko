// @ts-nocheck
/**
 * Type definitions for the Color Control component
 */

export type ColorFormat = 'hex' | 'rgb' | 'hsl';

export type ColorMode = 'solid' | 'gradient';

export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a?: number; // 0-1
}

export interface HSLColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
  a?: number; // 0-1
}

export interface HSVColor {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100 (value/brightness)
  a?: number; // 0-1
}

export interface ColorStop {
  id: string;
  color: string; // Can be hex, rgb, or hsl
  position: number; // 0-100 (percentage)
}

export interface GradientData {
  angle: number; // 0-360 degrees
  stops: ColorStop[];
}

export interface SolidColorData {
  color: string; // hex color without alpha (e.g., "#ff0000")
  alpha: number; // 0-1
}

export type ColorValue =
  | { type: 'solid'; data: SolidColorData }
  | { type: 'gradient'; data: GradientData };

export interface ColorControlProps {
  value: ColorValue;
  onChange: (value: ColorValue) => void;
  disabled?: boolean;
  className?: string;
  colorFormat?: ColorFormat;
  mode?: ColorMode; // If provided, locks the control to this mode (no switching allowed)
  // Gradient-specific props (only used when in gradient mode)
  maxStops?: number;
  minStops?: number;
}

export interface ColorStopMarkerProps {
  stop: ColorStop;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (newPosition: number) => void;
  onDelete: () => void;
  disabled?: boolean;
  canDelete: boolean;
}

export interface GradientPreviewProps {
  gradient: GradientData;
  onAddStop: (position: number) => void;
  disabled?: boolean;
  canAddStop: boolean;
}

export interface AngleControlProps {
  angle: number;
  onChange: (angle: number) => void;
  disabled?: boolean;
}

export interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose: () => void;
  format?: ColorFormat;
}

export interface InspectorPanelProps {
  stop: ColorStop | null;
  onColorChange: (color: string) => void;
  onPositionChange: (position: number) => void;
  onDelete: () => void;
  canDelete: boolean;
  disabled?: boolean;
}
