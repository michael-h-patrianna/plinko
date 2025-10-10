/**
 * Theme selector component for desktop environments
 * Displays buttons for switching between available themes
 */

import { useTheme } from '../../theme';
import { useAnimationDriver } from '@theme/animationDrivers';

export function ThemeSelector() {
  const driver = useAnimationDriver();
  const AnimatedButton = driver.createAnimatedComponent('button');

  const { themeName, availableThemes, switchTheme, theme } = useTheme();

  return (
    <div className="relative mb-4">
      <div
        className="bg-black/20 backdrop-blur-sm rounded-lg p-3"
        style={{
          background: theme.colors.background.overlay,
          border: `1px solid ${theme.colors.border.default}`,
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium" style={{ color: theme.colors.text.secondary }}>
            Theme:
          </span>
          <div className="flex gap-2">
            {availableThemes.map((availableTheme) => (
              <AnimatedButton
                key={availableTheme.name}
                onClick={() => switchTheme(availableTheme.name)}
                className={`
                  px-3 py-1.5 rounded-md text-xs font-medium transition-all
                  ${themeName === availableTheme.name ? 'shadow-lg' : 'hover:opacity-80'}
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
              </AnimatedButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
