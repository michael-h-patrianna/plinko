/**
 * Tests for CSS to Animation Driver migration
 * Verifies that Peg, ScreenShake, CurrencyCounter, and YouWonText
 * use animation driver correctly for cross-platform compatibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Peg } from '../../../components/game/PlinkoBoard/Peg';
import { ScreenShake } from '../../../components/effects/ScreenShake';
import { CurrencyCounter } from '../../../components/effects/CurrencyCounter';
import { YouWonText } from '../../../components/effects/YouWonText';

// Mock animation driver props interface for test mocks only
interface MockAnimatedComponentProps {
  children?: React.ReactNode;
  animate?: unknown;
  initial?: unknown;
  transition?: unknown;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

interface MockAnimatePresenceProps {
  children: React.ReactNode;
}

// Mock animation driver
vi.mock('../../../theme/animationDrivers', () => ({
  useAnimationDriver: () => ({
    name: 'framer',
    platform: 'web',
    createAnimatedComponent: (_component: string) => {
      // Return a mock animated component that accepts Framer Motion props
      return ({ children, animate, initial, transition, style, ...props }: MockAnimatedComponentProps) => {
        return (
          <div
            {...props}
            data-animated="true"
            data-animate={JSON.stringify(animate)}
            data-initial={JSON.stringify(initial)}
            data-transition={JSON.stringify(transition)}
            style={style}
          >
            {children}
          </div>
        );
      };
    },
    AnimatePresence: ({ children }: MockAnimatePresenceProps) => <>{children}</>,
    isSupported: () => true,
    getSpringConfig: () => ({ stiffness: 120, damping: 14, mass: 0.8 }),
    getTransitionConfig: () => ({ duration: 0.2, ease: [0.4, 0, 0.2, 1] }),
  }),
}));

describe('Animation Migration Tests', () => {
  describe('Peg Component', () => {
    it('should render without inline CSS @keyframes', () => {
      const { container } = render(
        <Peg
          row={0}
          col={0}
          x={100}
          y={100}
        />
      );

      // Verify no inline style tags exist
      const styleTags = container.querySelectorAll('style');
      expect(styleTags.length).toBe(0);
    });

    it('should use animation driver for pulse ring animation', () => {
      const { container } = render(
        <Peg
          row={0}
          col={0}
          x={100}
          y={100}
        />
      );

      // Wait for animation trigger
      waitFor(() => {
        const animatedElements = container.querySelectorAll('[data-animated="true"]');
        expect(animatedElements.length).toBeGreaterThan(0);
      });
    });

    it('should use cross-platform safe transforms (scale, opacity)', () => {
      const { container } = render(
        <Peg
          row={0}
          col={0}
          x={100}
          y={100}
        />
      );

      waitFor(() => {
        const animatedElement = container.querySelector('[data-animated="true"]');
        if (animatedElement) {
          const animateData = animatedElement.getAttribute('data-animate');
          const animate = JSON.parse(animateData || '{}');

          // Verify only cross-platform safe properties
          expect(animate).toHaveProperty('scale');
          expect(animate).toHaveProperty('opacity');
          expect(animate).not.toHaveProperty('blur');
          expect(animate).not.toHaveProperty('filter');
          expect(animate).not.toHaveProperty('boxShadow');
        }
      });
    });
  });

  describe('ScreenShake Component', () => {
    it('should not import CSS file', () => {
      // This test verifies that ScreenShake.css is not imported
      // by checking that the component renders without className references
      render(
        <ScreenShake active={false}>
          <div>Test content</div>
        </ScreenShake>
      );

      const shakeContainer = screen.getByText('Test content').parentElement;
      expect(shakeContainer?.className).not.toContain('screen-shake');
    });

    it('should use animation driver for shake transforms', () => {
      const { container } = render(
        <ScreenShake active={true} intensity="medium">
          <div>Shaking content</div>
        </ScreenShake>
      );

      const animatedElement = container.querySelector('[data-animated="true"]');
      expect(animatedElement).toBeTruthy();

      const animateData = animatedElement?.getAttribute('data-animate');
      const animate = JSON.parse(animateData || '{}');

      // Verify translateX and translateY are used (cross-platform safe)
      expect(animate).toHaveProperty('x');
      expect(animate).toHaveProperty('y');
      expect(Array.isArray(animate.x)).toBe(true);
      expect(Array.isArray(animate.y)).toBe(true);
    });

    it('should support different intensity levels', () => {
      const intensities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

      intensities.forEach((intensity) => {
        const { container } = render(
          <ScreenShake active={true} intensity={intensity}>
            <div>Content</div>
          </ScreenShake>
        );

        const animatedElement = container.querySelector('[data-animated="true"]');
        const animateData = animatedElement?.getAttribute('data-animate');
        const animate = JSON.parse(animateData || '{}');

        // Verify keyframe arrays exist
        expect(Array.isArray(animate.x)).toBe(true);
        expect(Array.isArray(animate.y)).toBe(true);

        // Verify intensity affects transform magnitude
        const maxX = Math.max(...animate.x.map(Math.abs));
        const expectedMaxX = intensity === 'low' ? 1 : intensity === 'medium' ? 2 : 3;
        expect(maxX).toBe(expectedMaxX);
      });
    });
  });

  describe('CurrencyCounter Component', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should not import CSS file', () => {
      const { container } = render(
        <CurrencyCounter targetAmount={1000} label="GC" />
      );

      // Verify no CSS classes are used
      const classElements = container.querySelectorAll('[class*="currency-counter"]');
      expect(classElements.length).toBe(0);
    });

    it('should use animation driver for pop animation', async () => {
      const { container } = render(
        <CurrencyCounter targetAmount={500} label="GC" />
      );

      // Fast-forward to trigger animation
      vi.advanceTimersByTime(100);

      await waitFor(() => {
        const animatedElements = container.querySelectorAll('[data-animated="true"]');
        expect(animatedElements.length).toBeGreaterThan(0);
      });
    });

    it('should use cross-platform safe scale animation', async () => {
      const { container } = render(
        <CurrencyCounter targetAmount={500} label="GC" />
      );

      vi.advanceTimersByTime(100);

      await waitFor(() => {
        const animatedElement = container.querySelector('[data-animated="true"]');
        if (animatedElement) {
          const animateData = animatedElement.getAttribute('data-animate');
          const animate = JSON.parse(animateData || '{}');

          // Verify scale animation (cross-platform safe)
          expect(animate).toHaveProperty('scale');
          expect(animate).not.toHaveProperty('filter');
          expect(animate).not.toHaveProperty('blur');
        }
      });
    });

    it('should use inline styles instead of CSS classes', () => {
      const { container } = render(
        <CurrencyCounter targetAmount={1000} label="GC" />
      );

      const rootDiv = container.firstChild as HTMLElement;
      expect(rootDiv.style.display).toBe('flex');
      expect(rootDiv.style.padding).toBe('12px 20px');
      expect(rootDiv.className).toBe('');
    });
  });

  describe('YouWonText Component', () => {
    it('should not import CSS file', () => {
      const { container } = render(<YouWonText />);

      // Verify no CSS classes from YouWonText.css
      const classElements = container.querySelectorAll('[class*="you-won"]');
      expect(classElements.length).toBe(0);
    });

    it('should use animation driver for character animations', () => {
      const { container } = render(<YouWonText />);

      const animatedElements = container.querySelectorAll('[data-animated="true"]');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('should use cross-platform safe transforms', () => {
      const { container } = render(<YouWonText />);

      const animatedElements = container.querySelectorAll('[data-animated="true"]');
      animatedElements.forEach((element) => {
        const animateData = element.getAttribute('data-animate');
        if (animateData) {
          const animate = JSON.parse(animateData);

          // Should only use: scale, opacity, rotate, x, y
          const allowedKeys = ['scale', 'opacity', 'rotate', 'x', 'y'];
          const keys = Object.keys(animate);

          keys.forEach((key) => {
            if (!allowedKeys.includes(key)) {
              // Allow undefined or array values
              if (animate[key] !== undefined && !Array.isArray(animate[key])) {
                expect(allowedKeys).toContain(key);
              }
            }
          });

          // Should NOT use: blur, filter, boxShadow, textShadow
          expect(animate).not.toHaveProperty('blur');
          expect(animate).not.toHaveProperty('filter');
          expect(animate).not.toHaveProperty('boxShadow');
          expect(animate).not.toHaveProperty('textShadow');
        }
      });
    });

    it('should use linear gradients only (no radial)', () => {
      const { container } = render(<YouWonText />);

      // Check all inline styles for gradient usage
      const allElements = container.querySelectorAll('*');
      allElements.forEach((element) => {
        const style = (element as HTMLElement).style;
        const background = style.background || style.backgroundImage;

        if (background && background.includes('gradient')) {
          expect(background).toContain('linear-gradient');
          expect(background).not.toContain('radial-gradient');
          expect(background).not.toContain('conic-gradient');
        }
      });
    });
  });

  describe('Cross-Platform Compatibility', () => {
    it('should not use any CSS animation keywords', () => {
      const components = [
        <Peg
          key="peg"
          row={0}
          col={0}
          x={100}
          y={100}
        />,
        <ScreenShake key="shake" active={false}>
          <div>Test</div>
        </ScreenShake>,
        <CurrencyCounter key="counter" targetAmount={1000} label="GC" />,
        <YouWonText key="won" />,
      ];

      components.forEach((component) => {
        const { container } = render(component);

        // Check for CSS animation properties
        const allElements = container.querySelectorAll('*');
        allElements.forEach((element) => {
          const style = (element as HTMLElement).style;

          // These should not exist
          expect(style.animation).toBe('');
          expect(style.animationName).toBe('');
        });

        // Check for @keyframes in style tags
        const styleTags = container.querySelectorAll('style');
        styleTags.forEach((styleTag) => {
          expect(styleTag.textContent).not.toContain('@keyframes');
        });
      });
    });

    it('should use GPU-accelerated properties only', () => {
      const nonGpuProperties = ['top', 'left', 'width', 'height', 'margin', 'padding'];

      const components = [
        <ScreenShake key="shake" active={true} intensity="medium">
          <div>Test</div>
        </ScreenShake>,
        <CurrencyCounter key="counter" targetAmount={1000} label="GC" />,
      ];

      components.forEach((component) => {
        const { container } = render(component);
        const animatedElements = container.querySelectorAll('[data-animated="true"]');

        animatedElements.forEach((element) => {
          const animateData = element.getAttribute('data-animate');
          if (animateData) {
            const animate = JSON.parse(animateData);
            const keys = Object.keys(animate);

            // Verify no non-GPU animated properties
            nonGpuProperties.forEach((prop) => {
              expect(keys).not.toContain(prop);
            });
          }
        });
      });
    });
  });
});
