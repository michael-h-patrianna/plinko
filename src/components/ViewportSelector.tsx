/**
 * Viewport size selector for testing different mobile device sizes
 */

import { useTheme } from '../theme';

interface ViewportSelectorProps {
  selectedWidth: number;
  onWidthChange: (width: number) => void;
  disabled: boolean;
}

const VIEWPORT_SIZES = [
  { width: 320, label: 'iPhone SE', colorKey: 'info' as const },
  { width: 360, label: 'Galaxy S8', colorKey: 'success' as const },
  { width: 375, label: 'iPhone 12', colorKey: 'accent' as const },
  { width: 414, label: 'iPhone 14 Pro Max', colorKey: 'warning' as const }
];

export function ViewportSelector({ selectedWidth, onWidthChange, disabled }: ViewportSelectorProps) {
  const { theme } = useTheme();

  return (
    <div
      className="mb-1 p-2 rounded-lg shadow-lg"
      style={{
        background: theme.colors.surface.primary,
      }}
    >
      <div className="flex gap-2 justify-center flex-wrap">
        {VIEWPORT_SIZES.map(({ width, label, colorKey }) => {
          const isSelected = selectedWidth === width;
          const color = colorKey === 'accent'
            ? theme.colors.accent.main
            : theme.colors.status[colorKey];

          return (
            <button
              key={width}
              onClick={() => !disabled && onWidthChange(width)}
              disabled={disabled}
              className="px-4 py-2 rounded-md font-medium text-sm transition-all"
              style={{
                background: isSelected ? color : theme.colors.surface.secondary,
                color: isSelected ? theme.colors.primary.contrast : theme.colors.text.secondary,
                boxShadow: isSelected ? `0 10px 25px ${color}66` : 'none',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!disabled && !isSelected) {
                  e.currentTarget.style.background = theme.colors.surface.elevated;
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = theme.colors.surface.secondary;
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <div className="text-xs" style={{ opacity: 0.8 }}>{label}</div>
              <div className="font-bold">{width}px</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
