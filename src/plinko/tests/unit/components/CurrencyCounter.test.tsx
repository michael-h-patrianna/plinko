/**
 * Component tests for CurrencyCounter
 *
 * Verifies rendering and state management integration.
 * Full animation tests are handled by Playwright E2E tests.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CurrencyCounter } from '@plinko/components/effects/CurrencyCounter';
import { ThemeProvider } from '@plinko/theme/ThemeContext';

// Mock animation driver
vi.mock('@plinko/theme/animationDrivers', () => ({
  useAnimationDriver: () => ({
    createAnimatedComponent: (tag: string) => {
      const AnimatedComponent = ({ children, ...props }: any) => {
        const Component = tag as any;
        return <Component {...props}>{children}</Component>;
      };
      return AnimatedComponent;
    },
  }),
}));

describe('CurrencyCounter Component', () => {

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
  };

  describe('Rendering', () => {
    it('should render with initial value 0', () => {
      renderWithTheme(<CurrencyCounter targetAmount={100} label="GC" />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('GC')).toBeInTheDocument();
    });

    it('should render with icon when provided', () => {
      const icon = <div data-testid="test-icon">Icon</div>;
      renderWithTheme(<CurrencyCounter targetAmount={100} label="SC" icon={icon} />);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('should apply uppercase transform to label', () => {
      renderWithTheme(<CurrencyCounter targetAmount={100} label="gc" />);

      // CSS textTransform is applied, text content remains lowercase in test
      const label = screen.getByText('gc');
      expect(label).toHaveStyle({ textTransform: 'uppercase' });
    });
  });

  describe('Initial State', () => {
    it('should render with initial value 0 and not crash', () => {
      renderWithTheme(<CurrencyCounter targetAmount={100} label="GC" />);

      // Component should render without errors
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic structure', () => {
      renderWithTheme(<CurrencyCounter targetAmount={100} label="Gold Coins" />);

      // Labels are rendered as spans (CSS handles uppercase)
      const label = screen.getByText('Gold Coins');
      expect(label.tagName).toBe('SPAN');

      const value = screen.getByText('0');
      expect(value.tagName).toBe('SPAN');
    });
  });
});
