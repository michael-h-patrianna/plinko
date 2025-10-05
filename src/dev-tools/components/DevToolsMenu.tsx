/**
 * DEV TOOLS ONLY - Not part of production Plinko game
 *
 * DevToolsMenu provides a settings menu for local development and testing.
 * Features:
 * - Theme switching (test different visual themes)
 * - Viewport simulation (test different mobile device sizes)
 *
 * This component should only be rendered in development/testing environments,
 * not in the production user-facing application.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../theme';
import { isMobileDevice } from '../../utils/deviceDetection';
import gearIcon from '../../assets/gear.png';

interface DevToolsMenuProps {
  /** Current viewport width for device simulation */
  viewportWidth: number;
  /** Callback when viewport width changes */
  onViewportChange: (width: number) => void;
  /** Whether viewport selection is disabled (e.g., during gameplay) */
  viewportDisabled: boolean;
}

const VIEWPORT_SIZES = [
  { width: 320, label: 'iPhone SE', colorKey: 'info' as const },
  { width: 360, label: 'Galaxy S8', colorKey: 'success' as const },
  { width: 375, label: 'iPhone 12', colorKey: 'accent' as const },
  { width: 414, label: 'iPhone 14 Pro Max', colorKey: 'warning' as const },
];

export function DevToolsMenu({
  viewportWidth,
  onViewportChange,
  viewportDisabled,
}: DevToolsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { themeName, availableThemes, switchTheme, theme } = useTheme();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Don't render on mobile devices
  if (isMobileDevice()) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50" ref={menuRef}>
      {/* Gear Icon Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full p-3 shadow-lg"
        style={{
          background: theme.colors.surface.elevated,
          border: `2px solid ${theme.colors.border.default}`,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Dev Tools Settings"
      >
        <img
          src={gearIcon}
          alt="Settings"
          width="24"
          height="24"
          style={{ display: 'block' }}
        />
      </motion.button>

      {/* Popup Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 right-0 rounded-lg shadow-xl overflow-hidden"
            style={{
              background: theme.colors.surface.primary,
              border: `1px solid ${theme.colors.border.default}`,
              minWidth: '320px',
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 border-b"
              style={{
                background: theme.colors.surface.elevated,
                borderColor: theme.colors.border.default,
              }}
            >
              <h3
                className="font-semibold text-sm"
                style={{ color: theme.colors.text.primary }}
              >
                Dev Tools
              </h3>
              <p className="text-xs mt-0.5" style={{ color: theme.colors.text.tertiary }}>
                Local testing utilities
              </p>
            </div>

            {/* Theme Section */}
            <div className="p-4 border-b" style={{ borderColor: theme.colors.border.default }}>
              <label className="block text-xs font-medium mb-2" style={{ color: theme.colors.text.secondary }}>
                Theme
              </label>
              <div className="flex flex-wrap gap-2">
                {availableThemes.map((availableTheme) => (
                  <motion.button
                    key={availableTheme.name}
                    onClick={() => switchTheme(availableTheme.name)}
                    className={`
                      px-3 py-1.5 rounded-md text-xs font-medium transition-all
                      ${themeName === availableTheme.name ? 'shadow-md' : 'hover:opacity-80'}
                    `}
                    style={{
                      background:
                        themeName === availableTheme.name
                          ? theme.gradients.buttonPrimary
                          : theme.colors.surface.elevated,
                      color:
                        themeName === availableTheme.name
                          ? theme.colors.primary.contrast
                          : theme.colors.text.primary,
                      border: `1px solid ${
                        themeName === availableTheme.name
                          ? theme.colors.primary.main
                          : theme.colors.border.default
                      }`,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {availableTheme.name}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Viewport Section */}
            <div className="p-4">
              <label className="block text-xs font-medium mb-2" style={{ color: theme.colors.text.secondary }}>
                Viewport Size
              </label>
              {viewportDisabled && (
                <p className="text-xs mb-2" style={{ color: theme.colors.status.warning }}>
                  Locked during gameplay
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {VIEWPORT_SIZES.map(({ width, label, colorKey }) => {
                  const isSelected = viewportWidth === width;
                  const color =
                    colorKey === 'accent' ? theme.colors.accent.main : theme.colors.status[colorKey];

                  return (
                    <button
                      key={width}
                      onClick={() => !viewportDisabled && onViewportChange(width)}
                      disabled={viewportDisabled}
                      className="px-3 py-2 rounded-md text-xs transition-all"
                      style={{
                        background: isSelected ? color : theme.colors.surface.secondary,
                        color: isSelected ? theme.colors.primary.contrast : theme.colors.text.secondary,
                        border: `1px solid ${
                          isSelected ? color : theme.colors.border.default
                        }`,
                        opacity: viewportDisabled ? 0.5 : 1,
                        cursor: viewportDisabled ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <div className="font-medium">{label}</div>
                      <div className="text-xs opacity-80">{width}px</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-4 py-2 border-t"
              style={{
                background: theme.colors.surface.elevated,
                borderColor: theme.colors.border.default,
              }}
            >
              <p className="text-xs" style={{ color: theme.colors.text.tertiary }}>
                These tools are for development only and not part of the production app.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
