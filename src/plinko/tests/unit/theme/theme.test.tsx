/**
 * Comprehensive tests for the theme system
 * Tests ThemeContext, ThemeProvider, useTheme hook, theme persistence, and theme structures
 *
 * JUSTIFIED 'any' USAGE:
 * - Recursive theme validation helper needs to traverse unknown object structures
 * - Using 'any' for recursive validation allows checking deeply nested theme properties
 * - Type safety is enforced by the validation logic itself, not TypeScript
 */

 
 

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '../../testUtils';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { ThemeProvider, useTheme, useThemeValue } from '../../../theme';
import type { Theme } from '@plinko/theme/types';
import { defaultTheme } from '@plinko/theme/themes/defaultTheme';
import { brutalistTheme } from '@plinko/theme/themes/brutalistTheme';
import { ThemeSelector } from '@demo/components/DevTools';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      const entries = Object.entries(store).filter(([k]) => k !== key);
      store = Object.fromEntries(entries);
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// Mock the storage adapter to use our mocked localStorage
vi.mock('@plinko/utils/platform', () => ({
  storageAdapter: {
    getItem: (key: string) => Promise.resolve(localStorageMock.getItem(key)),
    setItem: (key: string, value: string) => {
      localStorageMock.setItem(key, value);
      return Promise.resolve();
    },
    removeItem: (key: string) => {
      localStorageMock.removeItem(key);
      return Promise.resolve();
    },
    clear: () => {
      localStorageMock.clear();
      return Promise.resolve();
    },
    getAllKeys: () => Promise.resolve(Object.keys(localStorageMock)),
  },
}));

describe('Theme System', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('ThemeContext - ThemeProvider', () => {
    it('should wrap children correctly', () => {
      const TestComponent = () => {
        const { theme } = useTheme();
        return <div data-testid="test-child">Theme: {theme.name}</div>;
      };

      render(
        <ThemeProvider initialTheme={defaultTheme} themes={[defaultTheme]}>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText(/Theme: Default/)).toBeInTheDocument();
    });

    it('should provide default theme when no initialTheme specified', () => {
      const TestComponent = () => {
        const { theme } = useTheme();
        return <div data-testid="default-theme">{theme.name}</div>;
      };

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('default-theme')).toHaveTextContent('Default');
    });

    it('should accept custom initialTheme', () => {
      const TestComponent = () => {
        const { theme } = useTheme();
        return <div data-testid="custom-theme">{theme.name}</div>;
      };

      render(
        <ThemeProvider initialTheme={brutalistTheme} themes={[brutalistTheme]}>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('custom-theme')).toHaveTextContent('Brutalist');
    });
  });

  describe('ThemeContext - useTheme Hook', () => {
    it('should return current theme', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={[defaultTheme]}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ReturnType<typeof useTheme>, unknown>(() => useTheme(), {
        wrapper,
      });

      expect(result.current.theme).toEqual(defaultTheme);
      expect(result.current.themeName).toBe('Default');
    });

    it('should return all available themes', () => {
      const allThemes = [defaultTheme, brutalistTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ReturnType<typeof useTheme>, unknown>(() => useTheme(), {
        wrapper,
      });

      expect(result.current.availableThemes).toHaveLength(2);
      expect(result.current.availableThemes).toEqual(allThemes);
    });

    it('should throw error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleError.mockRestore();
    });
  });

  describe('ThemeContext - Theme Switching', () => {
    it('should change theme when setTheme is called', () => {
      const allThemes = [defaultTheme, brutalistTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ReturnType<typeof useTheme>, unknown>(() => useTheme(), { wrapper });

      expect(result.current.theme.name).toBe('Default');

      act(() => {
        result.current.setTheme(brutalistTheme);
      });

      expect(result.current.theme.name).toBe('Brutalist');
      expect(result.current.themeName).toBe('Brutalist');
    });

    it('should change theme when switchTheme is called with theme name', () => {
      const allThemes = [defaultTheme, brutalistTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ReturnType<typeof useTheme>, unknown>(() => useTheme(), { wrapper });

      expect(result.current.theme.name).toBe('Default');

      act(() => {
        result.current.switchTheme('Brutalist');
      });

      expect(result.current.theme.name).toBe('Brutalist');
      expect(result.current.themeName).toBe('Brutalist');
    });

    it('should not change theme if invalid theme name provided', () => {
      const allThemes = [defaultTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ReturnType<typeof useTheme>, unknown>(() => useTheme(), { wrapper });

      expect(result.current.theme.name).toBe('Default');

      act(() => {
        result.current.switchTheme('NonExistentTheme');
      });

      // Theme should remain unchanged
      expect(result.current.theme.name).toBe('Default');
    });
  });

  describe('ThemeContext - LocalStorage Persistence', () => {
    it('should persist theme to localStorage when switchTheme is called', async () => {
      const allThemes = [defaultTheme, brutalistTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ReturnType<typeof useTheme>, unknown>(() => useTheme(), { wrapper });

      act(() => {
        result.current.switchTheme('Brutalist');
      });

      // Wait for async storage operation to complete
      await waitFor(() => {
        expect(localStorageMock.getItem('plinko-theme')).toBe('Brutalist');
      });
    });

    it('should load theme from localStorage on mount', async () => {
      // Pre-set localStorage
      localStorageMock.setItem('plinko-theme', 'Brutalist');

      const allThemes = [defaultTheme, brutalistTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ReturnType<typeof useTheme>, unknown>(() => useTheme(), { wrapper });

      // Wait for useEffect to run and load from localStorage
      await waitFor(() => {
        expect(result.current.theme.name).toBe('Brutalist');
      });
    });

    it('should use initialTheme if localStorage is empty', () => {
      const allThemes = [defaultTheme, brutalistTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={brutalistTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ReturnType<typeof useTheme>, unknown>(() => useTheme(), { wrapper });

      expect(result.current.theme.name).toBe('Brutalist');
    });

    it('should use initialTheme if localStorage contains invalid theme name', async () => {
      localStorageMock.setItem('plinko-theme', 'InvalidTheme');

      const allThemes = [defaultTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ReturnType<typeof useTheme>, unknown>(() => useTheme(), { wrapper });

      // Should remain as initial theme
      await waitFor(() => {
        expect(result.current.theme.name).toBe('Default');
      });
    });
  });

  describe('ThemeContext - useThemeValue Hook', () => {
    it('should return specific theme value', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={[defaultTheme]}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<Theme['colors'], unknown>(() => useThemeValue('colors'), {
        wrapper,
      });

      expect(result.current).toEqual(defaultTheme.colors);
    });

    it('should update when theme changes', () => {
      const allThemes = [defaultTheme, brutalistTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<{ theme: ReturnType<typeof useTheme>; name: string }, unknown>(
        () => {
          const theme = useTheme();
          const name = useThemeValue('name');
          return { theme, name };
        },
        { wrapper }
      );

      expect(result.current.name).toBe('Default');

      act(() => {
        result.current.theme.switchTheme('Brutalist');
      });

      expect(result.current.name).toBe('Brutalist');
    });
  });

  describe('Theme Structures - Required Properties', () => {
    const themes = [
      { name: 'Default', theme: defaultTheme },
      { name: 'Brutalist', theme: brutalistTheme },
    ];

    themes.forEach(({ name, theme }) => {
      describe(`${name} Theme`, () => {
        it('should have all required top-level properties', () => {
          expect(theme).toHaveProperty('name');
          expect(theme).toHaveProperty('isDark');
          expect(theme).toHaveProperty('colors');
          expect(theme).toHaveProperty('gradients');
          expect(theme).toHaveProperty('effects');
          expect(theme).toHaveProperty('typography');
          expect(theme).toHaveProperty('borderRadius');
          expect(theme).toHaveProperty('buttons');
          expect(theme).toHaveProperty('components');
        });

        it('should have valid name property', () => {
          expect(theme.name).toBe(name);
          expect(typeof theme.name).toBe('string');
          expect(theme.name.length).toBeGreaterThan(0);
        });

        it('should have valid isDark property', () => {
          expect(typeof theme.isDark).toBe('boolean');
        });

        it('should have all required color properties', () => {
          expect(theme.colors).toHaveProperty('background');
          expect(theme.colors).toHaveProperty('surface');
          expect(theme.colors).toHaveProperty('primary');
          expect(theme.colors).toHaveProperty('accent');
          expect(theme.colors).toHaveProperty('text');
          expect(theme.colors).toHaveProperty('status');
          expect(theme.colors).toHaveProperty('prizes');
          expect(theme.colors).toHaveProperty('game');
          expect(theme.colors).toHaveProperty('border');
          expect(theme.colors).toHaveProperty('shadows');

          // Nested color properties
          expect(theme.colors.background).toHaveProperty('primary');
          expect(theme.colors.background).toHaveProperty('secondary');
          expect(theme.colors.surface).toHaveProperty('primary');
          expect(theme.colors.primary).toHaveProperty('main');
          expect(theme.colors.text).toHaveProperty('primary');
          expect(theme.colors.status).toHaveProperty('success');
          expect(theme.colors.prizes).toHaveProperty('orange');
          expect(theme.colors.game).toHaveProperty('ball');
          expect(theme.colors.game).toHaveProperty('peg');
          expect(theme.colors.game).toHaveProperty('slot');
        });

        it('should have all required gradient properties', () => {
          expect(theme.gradients).toHaveProperty('backgroundCard');
          expect(theme.gradients).toHaveProperty('buttonPrimary');
          expect(theme.gradients).toHaveProperty('prizeOrange');
          expect(theme.gradients).toHaveProperty('ballMain');
          expect(theme.gradients).toHaveProperty('pegDefault');
          expect(theme.gradients).toHaveProperty('glow');
          expect(theme.gradients).toHaveProperty('shine');
        });

        it('should have all required effect properties', () => {
          expect(theme.effects).toHaveProperty('transitions');

          // Nested effect properties
          expect(theme.effects.transitions).toHaveProperty('fast');
        });

        it('should have all required typography properties', () => {
          expect(theme.typography).toHaveProperty('fontFamily');

          // Font families
          expect(theme.typography.fontFamily).toHaveProperty('primary');
          expect(typeof theme.typography.fontFamily.primary).toBe('string');
        });

        it('should have all required borderRadius properties', () => {
          expect(theme.borderRadius).toHaveProperty('sm');
          expect(theme.borderRadius).toHaveProperty('card');
        });

        it('should have all required button properties', () => {
          expect(theme.buttons).toHaveProperty('primary');
          expect(theme.buttons).toHaveProperty('secondary');

          expect(theme.buttons.primary).toHaveProperty('background');
          expect(theme.buttons.primary).toHaveProperty('color');
        });

        it('should have all required component properties', () => {
          expect(theme.components).toHaveProperty('card');
          expect(theme.components).toHaveProperty('modal');

          expect(theme.components.card).toHaveProperty('background');
          expect(theme.components.modal).toHaveProperty('background');
        });
      });
    });
  });

  describe('Theme Structures - No Undefined Required Values', () => {
    const validateObject = (
      obj: Record<string, unknown>,
      path: string,
      optionalPaths: string[] = []
    ): string[] => {
      const errors: string[] = [];

      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        // Skip if this path is in optional list
        if (optionalPaths.includes(currentPath)) {
          continue;
        }

        if (value === null || value === undefined) {
          errors.push(`${currentPath} is ${value}`);
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          errors.push(...validateObject(value as any, currentPath, optionalPaths));
        }
      }

      return errors;
    };

    const optionalPaths = [
      'images.logo',
      'images.logoSmall',
      'images.favicon',
      'images.backgroundPattern',
      'images.backgroundTexture',
      'images.backgroundGradientImage',
      'images.prizeIcons.coins',
      'images.prizeIcons.spins',
      'images.prizeIcons.bonus',
      'images.prizeIcons.jackpot',
      'images.prizeIcons.xp',
      'images.prizeIcons.randomReward',
      'images.gameElements.star',
      'images.gameElements.sparkle',
      'images.gameElements.confetti',
      'images.gameElements.particle',
      'images.uiElements.loader',
      'images.uiElements.spinner',
      'images.uiElements.checkmark',
      'images.uiElements.close',
      'typography.fontFamily.secondary',
      'typography.fontFamily.mono',
      'typography.fontFamily.display',
      'gradients.buttonOutline',
      'gradients.textGradient',
      'gradients.titleGradient',
      'buttons.primary.backgroundHover',
      'buttons.primary.backgroundActive',
      'buttons.primary.colorHover',
      'buttons.primary.shadowHover',
      'buttons.primary.outline',
      'buttons.secondary.backgroundHover',
      'buttons.secondary.backgroundActive',
      'buttons.secondary.colorHover',
      'buttons.secondary.shadowHover',
      'buttons.secondary.outline',
      'buttons.outline.backgroundHover',
      'buttons.outline.backgroundActive',
      'buttons.outline.colorHover',
      'buttons.outline.shadowHover',
      'buttons.ghost.backgroundHover',
      'buttons.ghost.backgroundActive',
      'buttons.ghost.colorHover',
      'buttons.ghost.shadowHover',
      'buttons.ghost.outline',
      'buttons.danger.backgroundHover',
      'buttons.danger.backgroundActive',
      'buttons.danger.colorHover',
      'buttons.danger.shadowHover',
      'buttons.danger.outline',
      'buttons.success.backgroundHover',
      'buttons.success.backgroundActive',
      'buttons.success.colorHover',
      'buttons.success.shadowHover',
      'buttons.success.outline',
      // Brutalist theme has optional per-slot styles
      'colors.game.slot.slotStyles',
    ];

    it('Default theme should have no undefined/null required values', () => {
      const errors = validateObject(defaultTheme as any, '', optionalPaths);
      expect(errors).toEqual([]);
    });

    it('Brutalist theme should have no undefined/null required values', () => {
      const errors = validateObject(brutalistTheme as any, '', optionalPaths);
      expect(errors).toEqual([]);
    });
  });

  describe('Theme Switching - Property Updates', () => {
    it('should update all theme properties when switching themes', () => {
      const allThemes = [defaultTheme, brutalistTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ReturnType<typeof useTheme>, unknown>(() => useTheme(), { wrapper });

      // Initial state
      expect(result.current.theme.colors.primary.main).toBe(defaultTheme.colors.primary.main);
      expect(result.current.theme.gradients.buttonPrimary).toBe(
        defaultTheme.gradients.buttonPrimary
      );
      expect(result.current.theme.typography.fontFamily.primary).toBe(
        defaultTheme.typography.fontFamily.primary
      );

      // Switch theme
      act(() => {
        result.current.switchTheme('Brutalist');
      });

      // All properties should update
      expect(result.current.theme.colors.primary.main).toBe(brutalistTheme.colors.primary.main);
      expect(result.current.theme.gradients.buttonPrimary).toBe(
        brutalistTheme.gradients.buttonPrimary
      );
      expect(result.current.theme.typography.fontFamily.primary).toBe(
        brutalistTheme.typography.fontFamily.primary
      );
      expect(result.current.theme.name).toBe('Brutalist');
    });

    it('should update deeply nested properties when switching themes', () => {
      const allThemes = [defaultTheme, brutalistTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ReturnType<typeof useTheme>, unknown>(() => useTheme(), { wrapper });

      expect(result.current.theme.colors.game.ball.primary).toBe(
        defaultTheme.colors.game.ball.primary
      );

      act(() => {
        result.current.switchTheme('Brutalist');
      });

      expect(result.current.theme.colors.game.ball.primary).toBe(
        brutalistTheme.colors.game.ball.primary
      );
    });
  });

  describe('ThemeSelector Component', () => {
    it('should render with all theme options', () => {
      const allThemes = [defaultTheme, brutalistTheme];

      render(
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          <ThemeSelector />
        </ThemeProvider>
      );

      expect(screen.getByText('Default')).toBeInTheDocument();
      expect(screen.getByText('Brutalist')).toBeInTheDocument();
    });

    it('should highlight active theme', () => {
      const allThemes = [defaultTheme, brutalistTheme];

      render(
        <ThemeProvider initialTheme={brutalistTheme} themes={allThemes}>
          <ThemeSelector />
        </ThemeProvider>
      );

      const brutalistButton = screen.getByText('Brutalist');
      const defaultButton = screen.getByText('Default');

      // Active theme should have primary gradient background
      expect(brutalistButton).toHaveStyle({
        background: brutalistTheme.gradients.buttonPrimary,
      });

      // Inactive theme should have elevated surface background
      expect(defaultButton).toHaveStyle({
        background: brutalistTheme.colors.surface.elevated,
      });
    });

    it('should call switchTheme when a theme button is clicked', async () => {
      const allThemes = [defaultTheme, brutalistTheme];

      const TestWrapper = () => {
        const { themeName } = useTheme();
        return (
          <>
            <ThemeSelector />
            <div data-testid="current-theme">{themeName}</div>
          </>
        );
      };

      render(
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          <TestWrapper />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('Default');

      const brutalistButton = screen.getByText('Brutalist');

      act(() => {
        brutalistButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('Brutalist');
      });
    });

    it('should update highlighted theme after selection', async () => {
      const allThemes = [defaultTheme, brutalistTheme];

      render(
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          <ThemeSelector />
        </ThemeProvider>
      );

      const brutalistButton = screen.getByText('Brutalist');

      act(() => {
        brutalistButton.click();
      });

      await waitFor(() => {
        // After clicking, Brutalist should have the primary gradient
        expect(brutalistButton).toHaveStyle({
          background: brutalistTheme.gradients.buttonPrimary,
        });
      });
    });

    it('should display Theme label', () => {
      render(
        <ThemeProvider initialTheme={defaultTheme} themes={[defaultTheme]}>
          <ThemeSelector />
        </ThemeProvider>
      );

      expect(screen.getByText('Theme:')).toBeInTheDocument();
    });
  });
});
