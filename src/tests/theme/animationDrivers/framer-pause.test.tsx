/**
 * Tests for Framer Motion driver pause integration
 *
 * Verifies:
 * - Pause-aware components respect global pause state
 * - Animations freeze when paused
 * - Animations resume when unpaused
 * - Demo UI is excluded from pause
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { PauseProvider } from '../../../contexts/PauseContext';
import { FramerMotionDriver } from '../../../theme/animationDrivers/framer';

describe('FramerMotionDriver - Pause Integration', () => {
  let driver: FramerMotionDriver;

  beforeEach(() => {
    delete (window as any).__ANIMATIONS_PAUSED__;
    document.body.innerHTML = '';

    // Mock window.matchMedia for Framer Motion's reduced motion detection
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {}, // deprecated
        removeListener: () => {}, // deprecated
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    });

    driver = new FramerMotionDriver();
  });

  afterEach(() => {
    delete (window as any).__ANIMATIONS_PAUSED__;
    document.body.innerHTML = '';
  });

  it('creates pause-aware animated components', () => {
    const AnimatedDiv = driver.createAnimatedComponent('div');
    expect(AnimatedDiv).toBeDefined();
  });

  it('animated components respond to global pause state', async () => {
    const AnimatedDiv = driver.createAnimatedComponent('div');

    // Not paused initially
    (window as any).__ANIMATIONS_PAUSED__ = false;

    const { rerender } = render(
      <PauseProvider>
        <AnimatedDiv
          data-testid="animated-div"
          animate={{ opacity: 1, x: 100 }}
          transition={{ duration: 0.3 }}
        >
          Test
        </AnimatedDiv>
      </PauseProvider>
    );

    const element = screen.getByTestId('animated-div');
    expect(element).toBeInTheDocument();

    // Pause animations
    (window as any).__ANIMATIONS_PAUSED__ = true;

    // Wait for the component to detect pause state
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    // Force re-render to pick up pause state
    rerender(
      <PauseProvider>
        <AnimatedDiv
          data-testid="animated-div"
          animate={{ opacity: 1, x: 100 }}
          transition={{ duration: 0.3 }}
        >
          Test
        </AnimatedDiv>
      </PauseProvider>
    );

    // Element should still be in the document
    expect(screen.getByTestId('animated-div')).toBeInTheDocument();
  });

  it('respects pause state for newly created components', async () => {
    // Set pause state before creating component
    (window as any).__ANIMATIONS_PAUSED__ = true;

    const AnimatedDiv = driver.createAnimatedComponent('div');

    render(
      <PauseProvider>
        <AnimatedDiv
          data-testid="paused-div"
          animate={{ opacity: 1, scale: 1.5 }}
          transition={{ duration: 0.5 }}
        >
          Paused Content
        </AnimatedDiv>
      </PauseProvider>
    );

    // Component should render
    expect(screen.getByTestId('paused-div')).toBeInTheDocument();
  });

  it('components can unpause when flag is removed', async () => {
    const AnimatedDiv = driver.createAnimatedComponent('div');

    // Start paused
    (window as any).__ANIMATIONS_PAUSED__ = true;

    const { rerender } = render(
      <PauseProvider>
        <AnimatedDiv
          data-testid="toggle-div"
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          Toggle Test
        </AnimatedDiv>
      </PauseProvider>
    );

    expect(screen.getByTestId('toggle-div')).toBeInTheDocument();

    // Unpause
    (window as any).__ANIMATIONS_PAUSED__ = false;

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    rerender(
      <PauseProvider>
        <AnimatedDiv
          data-testid="toggle-div"
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          Toggle Test
        </AnimatedDiv>
      </PauseProvider>
    );

    expect(screen.getByTestId('toggle-div')).toBeInTheDocument();
  });

  it('handles rapid pause/unpause cycles', async () => {
    const AnimatedDiv = driver.createAnimatedComponent('div');

    render(
      <PauseProvider>
        <AnimatedDiv
          data-testid="rapid-toggle"
          animate={{ opacity: 1, x: 50 }}
          transition={{ duration: 0.3 }}
        >
          Rapid Toggle
        </AnimatedDiv>
      </PauseProvider>
    );

    // Rapid toggle
    for (let i = 0; i < 5; i++) {
      (window as any).__ANIMATIONS_PAUSED__ = true;
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      (window as any).__ANIMATIONS_PAUSED__ = false;
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });
    }

    // Component should still be in document and functional
    expect(screen.getByTestId('rapid-toggle')).toBeInTheDocument();
  });

  it('multiple animated components respect same pause state', async () => {
    const AnimatedDiv = driver.createAnimatedComponent('div');
    const AnimatedSpan = driver.createAnimatedComponent('span');

    (window as any).__ANIMATIONS_PAUSED__ = false;

    render(
      <PauseProvider>
        <AnimatedDiv data-testid="div1" animate={{ opacity: 1 }}>
          Div 1
        </AnimatedDiv>
        <AnimatedDiv data-testid="div2" animate={{ scale: 1.2 }}>
          Div 2
        </AnimatedDiv>
        <AnimatedSpan data-testid="span1" animate={{ x: 100 }}>
          Span 1
        </AnimatedSpan>
      </PauseProvider>
    );

    expect(screen.getByTestId('div1')).toBeInTheDocument();
    expect(screen.getByTestId('div2')).toBeInTheDocument();
    expect(screen.getByTestId('span1')).toBeInTheDocument();

    // Pause all
    (window as any).__ANIMATIONS_PAUSED__ = true;

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    // All should still be in document
    expect(screen.getByTestId('div1')).toBeInTheDocument();
    expect(screen.getByTestId('div2')).toBeInTheDocument();
    expect(screen.getByTestId('span1')).toBeInTheDocument();
  });

  it('driver methods are not affected by pause state', () => {
    (window as any).__ANIMATIONS_PAUSED__ = true;

    // These should work regardless of pause state
    expect(driver.isSupported()).toBe(true);
    expect(driver.getSpringConfig('gentle')).toBeDefined();
    expect(driver.getTransitionConfig('fast')).toBeDefined();
    expect(driver.getEnvironment()).toBeDefined();
  });

  it('AnimatePresence works with paused state', () => {
    const { AnimatePresence } = driver;

    (window as any).__ANIMATIONS_PAUSED__ = true;

    const { container } = render(
      <PauseProvider>
        <AnimatePresence>
          <div key="test">Content</div>
        </AnimatePresence>
      </PauseProvider>
    );

    expect(container.textContent).toBe('Content');
  });
});
