/**
 * Viewport size selector for testing different mobile device sizes
 */

interface ViewportSelectorProps {
  selectedWidth: number;
  onWidthChange: (width: number) => void;
  disabled: boolean;
}

const VIEWPORT_SIZES = [
  { width: 320, label: 'iPhone SE', color: 'bg-blue-500' },
  { width: 360, label: 'Galaxy S8', color: 'bg-green-500' },
  { width: 375, label: 'iPhone 12', color: 'bg-purple-500' },
  { width: 414, label: 'iPhone 14 Pro Max', color: 'bg-orange-500' }
];

export function ViewportSelector({ selectedWidth, onWidthChange, disabled }: ViewportSelectorProps) {
  return (
    <div className="mb-6 p-4 bg-slate-800 rounded-lg shadow-lg">
      <div className="text-white text-sm font-semibold mb-3 text-center">
        Device Viewport Emulator
        {disabled && (
          <span className="ml-2 text-xs text-amber-400">(Locked during game)</span>
        )}
      </div>
      <div className="flex gap-2 justify-center flex-wrap">
        {VIEWPORT_SIZES.map(({ width, label, color }) => (
          <button
            key={width}
            onClick={() => !disabled && onWidthChange(width)}
            disabled={disabled}
            className={`
              px-4 py-2 rounded-md font-medium text-sm transition-all
              ${selectedWidth === width
                ? `${color} text-white shadow-lg scale-105`
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
            `}
          >
            <div className="text-xs opacity-80">{label}</div>
            <div className="font-bold">{width}px</div>
          </button>
        ))}
      </div>
    </div>
  );
}
