/**
 * Comprehensive tests for the theme system
 * Tests ThemeContext, ThemeProvider, useTheme hook, theme persistence, and theme structures
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from './testUtils';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { ThemeProvider, useTheme, useThemeValue, type ThemeContextType } from '../theme';
import type { Theme } from '../theme/types';
import { defaultTheme } from '../theme/themes/defaultTheme';
import { playFameTheme } from '../theme/themes/playFameTheme';
import { darkBlueTheme } from '../theme/themes/darkBlueTheme';
import { ThemeSelector } from '../dev-tools';

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
});

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
        <ThemeProvider initialTheme={playFameTheme} themes={[playFameTheme]}>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('custom-theme')).toHaveTextContent('PlayFame');
    });
  });

  describe('ThemeContext - useTheme Hook', () => {
    it('should return current theme', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={[defaultTheme]}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ThemeContextType, unknown>(() => useTheme(), {
        wrapper,
      });

      expect(result.current.theme).toEqual(defaultTheme);
      expect(result.current.themeName).toBe('Default');
    });

    it('should return all available themes', () => {
      const allThemes = [defaultTheme, playFameTheme, darkBlueTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ThemeContextType, unknown>(() => useTheme(), {
        wrapper,
      });

      expect(result.current.availableThemes).toHaveLength(3);
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
      const allThemes = [defaultTheme, playFameTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ThemeContextType, unknown>(() => useTheme(), { wrapper });

      expect(result.current.theme.name).toBe('Default');

      act(() => {
        result.current.setTheme(playFameTheme);
      });

      expect(result.current.theme.name).toBe('PlayFame');
      expect(result.current.themeName).toBe('PlayFame');
    });

    it('should change theme when switchTheme is called with theme name', () => {
      const allThemes = [defaultTheme, darkBlueTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ThemeContextType, unknown>(() => useTheme(), { wrapper });

      expect(result.current.theme.name).toBe('Default');

      act(() => {
        result.current.switchTheme('Dark Blue');
      });

      expect(result.current.theme.name).toBe('Dark Blue');
      expect(result.current.themeName).toBe('Dark Blue');
    });

    it('should not change theme if invalid theme name provided', () => {
      const allThemes = [defaultTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ThemeContextType, unknown>(() => useTheme(), { wrapper });

      expect(result.current.theme.name).toBe('Default');

      act(() => {
        result.current.switchTheme('NonExistentTheme');
      });

      // Theme should remain unchanged
      expect(result.current.theme.name).toBe('Default');
    });
  });

  describe('ThemeContext - LocalStorage Persistence', () => {
    it('should persist theme to localStorage when switchTheme is called', () => {
      const allThemes = [defaultTheme, playFameTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ThemeContextType, unknown>(() => useTheme(), { wrapper });

      act(() => {
        result.current.switchTheme('PlayFame');
      });

      expect(localStorageMock.getItem('plinko-theme')).toBe('PlayFame');
    });

    it('should load theme from localStorage on mount', async () => {
      // Pre-set localStorage
      localStorageMock.setItem('plinko-theme', 'Dark Blue');

      const allThemes = [defaultTheme, darkBlueTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ThemeContextType, unknown>(() => useTheme(), { wrapper });

      // Wait for useEffect to run and load from localStorage
      await waitFor(() => {
        expect(result.current.theme.name).toBe('Dark Blue');
      });
    });

    it('should use initialTheme if localStorage is empty', () => {
      const allThemes = [defaultTheme, playFameTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={playFameTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ThemeContextType, unknown>(() => useTheme(), { wrapper });

      expect(result.current.theme.name).toBe('PlayFame');
    });

    it('should use initialTheme if localStorage contains invalid theme name', async () => {
      localStorageMock.setItem('plinko-theme', 'InvalidTheme');

      const allThemes = [defaultTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ThemeContextType, unknown>(() => useTheme(), { wrapper });

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
      const allThemes = [defaultTheme, playFameTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<{ theme: ThemeContextType; name: string }, unknown>(
        () => {
          const theme = useTheme();
          const name = useThemeValue('name');
          return { theme, name };
        },
        { wrapper }
      );

      expect(result.current.name).toBe('Default');

      act(() => {
        result.current.theme.switchTheme('PlayFame');
      });

      expect(result.current.name).toBe('PlayFame');
    });
  });

  describe('Theme Structures - Required Properties', () => {
    const themes = [
      { name: 'Default', theme: defaultTheme },
      { name: 'PlayFame', theme: playFameTheme },
      { name: 'Dark Blue', theme: darkBlueTheme },
    ];

    themes.forEach(({ name, theme }) => {
      describe(`${name} Theme`, () => {
        it('should have all required top-level properties', () => {
          expect(theme).toHaveProperty('name');
          expect(theme).toHaveProperty('isDark');
          expect(theme).toHaveProperty('colors');
          expect(theme).toHaveProperty('gradients');
          expect(theme).toHaveProperty('effects');
          expect(theme).toHaveProperty('images');
          expect(theme).toHaveProperty('spacing');
          expect(theme).toHaveProperty('typography');
          expect(theme).toHaveProperty('animation');
          expect(theme).toHaveProperty('borderRadius');
          expect(theme).toHaveProperty('buttons');
          expect(theme).toHaveProperty('components');
          expect(theme).toHaveProperty('breakpoints');
          expect(theme).toHaveProperty('zIndex');
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
          expect(theme.gradients).toHaveProperty('backgroundMain');
          expect(theme.gradients).toHaveProperty('buttonPrimary');
          expect(theme.gradients).toHaveProperty('prizeOrange');
          expect(theme.gradients).toHaveProperty('ballMain');
          expect(theme.gradients).toHaveProperty('pegDefault');
          expect(theme.gradients).toHaveProperty('slotBackground');
          expect(theme.gradients).toHaveProperty('glow');
          expect(theme.gradients).toHaveProperty('shine');
        });

        it('should have all required effect properties', () => {
          expect(theme.effects).toHaveProperty('shadows');
          expect(theme.effects).toHaveProperty('glows');
          expect(theme.effects).toHaveProperty('borders');
          expect(theme.effects).toHaveProperty('backdrops');
          expect(theme.effects).toHaveProperty('transitions');

          // Nested effect properties
          expect(theme.effects.shadows).toHaveProperty('none');
          expect(theme.effects.shadows).toHaveProperty('md');
          expect(theme.effects.shadows).toHaveProperty('glow');
          expect(theme.effects.glows).toHaveProperty('sm');
          expect(theme.effects.borders).toHaveProperty('thin');
          expect(theme.effects.transitions).toHaveProperty('normal');
        });

        it('should have all required typography properties', () => {
          expect(theme.typography).toHaveProperty('fontFamily');
          expect(theme.typography).toHaveProperty('fontSize');
          expect(theme.typography).toHaveProperty('fontWeight');
          expect(theme.typography).toHaveProperty('lineHeight');
          expect(theme.typography).toHaveProperty('letterSpacing');

          // Font families
          expect(theme.typography.fontFamily).toHaveProperty('primary');
          expect(typeof theme.typography.fontFamily.primary).toBe('string');

          // Font sizes
          expect(theme.typography.fontSize).toHaveProperty('base');
          expect(theme.typography.fontSize).toHaveProperty('xl');

          // Font weights
          expect(theme.typography.fontWeight).toHaveProperty('normal');
          expect(theme.typography.fontWeight).toHaveProperty('bold');
        });

        it('should have all required animation properties', () => {
          expect(theme.animation).toHaveProperty('duration');
          expect(theme.animation).toHaveProperty('easing');

          expect(theme.animation.duration).toHaveProperty('fast');
          expect(theme.animation.duration).toHaveProperty('normal');
          expect(theme.animation.duration).toHaveProperty('slow');

          expect(theme.animation.easing).toHaveProperty('linear');
          expect(theme.animation.easing).toHaveProperty('easeIn');
        });

        it('should have all required spacing properties', () => {
          expect(theme.spacing).toHaveProperty('0');
          expect(theme.spacing).toHaveProperty('1');
          expect(theme.spacing).toHaveProperty('4');
          expect(theme.spacing).toHaveProperty('8');
          expect(theme.spacing).toHaveProperty('16');
        });

        it('should have all required borderRadius properties', () => {
          expect(theme.borderRadius).toHaveProperty('none');
          expect(theme.borderRadius).toHaveProperty('sm');
          expect(theme.borderRadius).toHaveProperty('md');
          expect(theme.borderRadius).toHaveProperty('lg');
          expect(theme.borderRadius).toHaveProperty('full');
        });

        it('should have all required button properties', () => {
          expect(theme.buttons).toHaveProperty('primary');
          expect(theme.buttons).toHaveProperty('secondary');
          expect(theme.buttons).toHaveProperty('sizes');

          expect(theme.buttons.primary).toHaveProperty('background');
          expect(theme.buttons.primary).toHaveProperty('color');
        });

        it('should have all required component properties', () => {
          expect(theme.components).toHaveProperty('card');
          expect(theme.components).toHaveProperty('modal');
          expect(theme.components).toHaveProperty('input');

          expect(theme.components.card).toHaveProperty('background');
          expect(theme.components.modal).toHaveProperty('background');
        });

        it('should have valid breakpoints', () => {
          expect(theme.breakpoints).toHaveProperty('sm');
          expect(theme.breakpoints).toHaveProperty('md');
          expect(theme.breakpoints).toHaveProperty('lg');
        });

        it('should have valid zIndex values', () => {
          expect(theme.zIndex).toHaveProperty('modal');
          expect(theme.zIndex).toHaveProperty('dropdown');
          expect(typeof theme.zIndex.modal).toBe('number');
        });
      });
    });
  });

  describe('Theme Structures - No Undefined Required Values', () => {
    const validateObject = (obj: any, path: string, optionalPaths: string[] = []): string[] => {
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
          errors.push(...validateObject(value, currentPath, optionalPaths));
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
    ];

    it('Default theme should have no undefined/null required values', () => {
      const errors = validateObject(defaultTheme, '', optionalPaths);
      expect(errors).toEqual([]);
    });

    it('PlayFame theme should have no undefined/null required values', () => {
      const errors = validateObject(playFameTheme, '', optionalPaths);
      expect(errors).toEqual([]);
    });

    it('Dark Blue theme should have no undefined/null required values', () => {
      const errors = validateObject(darkBlueTheme, '', optionalPaths);
      expect(errors).toEqual([]);
    });
  });

  describe('Theme Switching - Property Updates', () => {
    it('should update all theme properties when switching themes', () => {
      const allThemes = [defaultTheme, playFameTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ThemeContextType, unknown>(() => useTheme(), { wrapper });

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
        result.current.switchTheme('PlayFame');
      });

      // All properties should update
      expect(result.current.theme.colors.primary.main).toBe(playFameTheme.colors.primary.main);
      expect(result.current.theme.gradients.buttonPrimary).toBe(
        playFameTheme.gradients.buttonPrimary
      );
      expect(result.current.theme.typography.fontFamily.primary).toBe(
        playFameTheme.typography.fontFamily.primary
      );
      expect(result.current.theme.name).toBe('PlayFame');
    });

    it('should update deeply nested properties when switching themes', () => {
      const allThemes = [defaultTheme, darkBlueTheme];
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          {children}
        </ThemeProvider>
      );

      const { result } = renderHook<ThemeContextType, unknown>(() => useTheme(), { wrapper });

      expect(result.current.theme.colors.game.ball.primary).toBe(
        defaultTheme.colors.game.ball.primary
      );

      act(() => {
        result.current.switchTheme('Dark Blue');
      });

      expect(result.current.theme.colors.game.ball.primary).toBe(
        darkBlueTheme.colors.game.ball.primary
      );
    });
  });

  describe('ThemeSelector Component', () => {
    it('should render with all theme options', () => {
      const allThemes = [defaultTheme, playFameTheme, darkBlueTheme];

      render(
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          <ThemeSelector />
        </ThemeProvider>
      );

      expect(screen.getByText('Default')).toBeInTheDocument();
      expect(screen.getByText('PlayFame')).toBeInTheDocument();
      expect(screen.getByText('Dark Blue')).toBeInTheDocument();
    });

    it('should highlight active theme', () => {
      const allThemes = [defaultTheme, playFameTheme];

      render(
        <ThemeProvider initialTheme={playFameTheme} themes={allThemes}>
          <ThemeSelector />
        </ThemeProvider>
      );

      const playFameButton = screen.getByText('PlayFame');
      const defaultButton = screen.getByText('Default');

      // Active theme should have primary gradient background
      expect(playFameButton).toHaveStyle({
        background: playFameTheme.gradients.buttonPrimary,
      });

      // Inactive theme should have elevated surface background
      expect(defaultButton).toHaveStyle({
        background: playFameTheme.colors.surface.elevated,
      });
    });

    it('should call switchTheme when a theme button is clicked', async () => {
      const allThemes = [defaultTheme, playFameTheme];

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

      const playFameButton = screen.getByText('PlayFame');

      act(() => {
        playFameButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('PlayFame');
      });
    });

    it('should update highlighted theme after selection', async () => {
      const allThemes = [defaultTheme, darkBlueTheme];

      render(
        <ThemeProvider initialTheme={defaultTheme} themes={allThemes}>
          <ThemeSelector />
        </ThemeProvider>
      );

      const darkBlueButton = screen.getByText('Dark Blue');

      act(() => {
        darkBlueButton.click();
      });

      await waitFor(() => {
        // After clicking, Dark Blue should have the primary gradient
        expect(darkBlueButton).toHaveStyle({
          background: darkBlueTheme.gradients.buttonPrimary,
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
