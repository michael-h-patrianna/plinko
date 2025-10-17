/**
 * Unit tests for PopupOverlay component
 * Tests: rendering, theme integration, animations, click handling
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PopupOverlay } from '@plinko/components/layout/PopupOverlay';
import { ThemeProvider } from '@plinko/theme/ThemeContext';
import { defaultTheme } from '@plinko/theme/themes/defaultTheme';

// Mock useAnimation hook to avoid framer-motion issues in tests
vi.mock('@plinko/theme/animationDrivers/useAnimation', () => ({
  useAnimation: () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createComponent = (tag: string) => ({ children, ...props }: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Component = tag as any;
      return <Component {...props}>{children}</Component>;
    };

    return {
      AnimatedDiv: createComponent('div'),
      AnimatedSpan: createComponent('span'),
      AnimatedButton: createComponent('button'),
      AnimatedH1: createComponent('h1'),
      AnimatedH2: createComponent('h2'),
      AnimatedH3: createComponent('h3'),
      AnimatedP: createComponent('p'),
      AnimatedImg: createComponent('img'),
      AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    };
  },
}));

describe('PopupOverlay', () => {
  it('renders children correctly', () => {
    render(
      <ThemeProvider initialTheme={defaultTheme}>
        <PopupOverlay testId="test-overlay">
          <div data-testid="child-content">Test Content</div>
        </PopupOverlay>
      </ThemeProvider>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct z-index', () => {
    render(
      <ThemeProvider initialTheme={defaultTheme}>
        <PopupOverlay zIndex={50} testId="test-overlay">
          <div>Content</div>
        </PopupOverlay>
      </ThemeProvider>
    );

    const overlay = screen.getByTestId('test-overlay');
    expect(overlay).toHaveStyle({ zIndex: 50 });
  });

  it('uses default z-index when not specified', () => {
    render(
      <ThemeProvider initialTheme={defaultTheme}>
        <PopupOverlay testId="test-overlay">
          <div>Content</div>
        </PopupOverlay>
      </ThemeProvider>
    );

    const overlay = screen.getByTestId('test-overlay');
    expect(overlay).toHaveStyle({ zIndex: 40 });
  });

  it('applies theme overlay background color', () => {
    render(
      <ThemeProvider initialTheme={defaultTheme}>
        <PopupOverlay testId="test-overlay">
          <div>Content</div>
        </PopupOverlay>
      </ThemeProvider>
    );

    const overlay = screen.getByTestId('test-overlay');
    const background = overlay.style.background;

    // Should use theme's overlayDark color or fallback
    expect(background).toBeTruthy();
    expect(typeof background).toBe('string');
  });

  it('handles background click when callback provided', () => {
    const handleClick = vi.fn();

    render(
      <ThemeProvider initialTheme={defaultTheme}>
        <PopupOverlay onBackgroundClick={handleClick} testId="test-overlay">
          <div data-testid="child-content">Content</div>
        </PopupOverlay>
      </ThemeProvider>
    );

    const overlay = screen.getByTestId('test-overlay');
    overlay.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('prevents click propagation from content to background', () => {
    const handleBackgroundClick = vi.fn();

    render(
      <ThemeProvider initialTheme={defaultTheme}>
        <PopupOverlay onBackgroundClick={handleBackgroundClick} testId="test-overlay">
          <button data-testid="content-button">Click Me</button>
        </PopupOverlay>
      </ThemeProvider>
    );

    const button = screen.getByTestId('content-button');
    button.click();

    // Background click should not be triggered when clicking content
    expect(handleBackgroundClick).not.toHaveBeenCalled();
  });

  it('applies standard popup padding', () => {
    render(
      <ThemeProvider initialTheme={defaultTheme}>
        <PopupOverlay testId="test-overlay">
          <div>Content</div>
        </PopupOverlay>
      </ThemeProvider>
    );

    const overlay = screen.getByTestId('test-overlay');
    expect(overlay).toHaveStyle({ padding: '20px' });
  });
});
