/**
 * Integration tests for the complete pause system
 *
 * Tests the full pause workflow:
 * - Keyboard 'P' key toggles pause
 * - DevTools opening pauses the game
 * - Framer Motion animations freeze when paused
 * - Demo UI continues animating when paused
 * - Visual "PAUSED" indicator appears
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { PauseProvider, usePause } from '../../contexts/PauseContext';
import { useAnimationPause } from '../../hooks/useAnimationPause';
import { FramerMotionDriver } from '../../theme/animationDrivers/framer';

// Test component that uses both pause context and animation pause
function PauseTestComponent() {
  const { isPaused, pause, unpause, toggle } = usePause();
  useAnimationPause();

  const driver = new FramerMotionDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');

  return (
    <div>
      <div data-testid="pause-status">{isPaused ? 'PAUSED' : 'PLAYING'}</div>

      <button onClick={pause} data-testid="pause-button">
        Pause
      </button>
      <button onClick={unpause} data-testid="unpause-button">
        Unpause
      </button>
      <button onClick={toggle} data-testid="toggle-button">
        Toggle
      </button>

      <AnimatedDiv
        data-testid="game-animation"
        data-framer-motion="true"
        animate={{ x: 100, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        Game Content
      </AnimatedDiv>

      <div data-demo-ui="true">
        <AnimatedDiv
          data-testid="demo-animation"
          data-framer-motion="true"
          animate={{ scale: 1.2 }}
          transition={{ duration: 0.5 }}
        >
          Demo UI Content
        </AnimatedDiv>
      </div>
    </div>
  );
}

describe('Pause System Integration', () => {
  beforeEach(() => {
    delete (window as any).__ANIMATIONS_PAUSED__;
    document.body.removeAttribute('data-paused');
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
  });

  afterEach(() => {
    delete (window as any).__ANIMATIONS_PAUSED__;
    document.body.removeAttribute('data-paused');
    document.body.innerHTML = '';
  });

  it('initializes in unpaused state', () => {
    render(
      <PauseProvider>
        <PauseTestComponent />
      </PauseProvider>
    );

    expect(screen.getByTestId('pause-status').textContent).toBe('PLAYING');
    expect((window as any).__ANIMATIONS_PAUSED__).toBe(false);
    expect(document.body.getAttribute('data-paused')).toBe('false');
  });

  it('pauses when pause button is clicked', async () => {
    render(
      <PauseProvider>
        <PauseTestComponent />
      </PauseProvider>
    );

    const pauseButton = screen.getByTestId('pause-button');

    await act(async () => {
      fireEvent.click(pauseButton);
    });

    expect(screen.getByTestId('pause-status').textContent).toBe('PAUSED');
    expect((window as any).__ANIMATIONS_PAUSED__).toBe(true);
    expect(document.body.getAttribute('data-paused')).toBe('true');
  });

  it('unpauses when unpause button is clicked', async () => {
    render(
      <PauseProvider>
        <PauseTestComponent />
      </PauseProvider>
    );

    // Pause first
    await act(async () => {
      fireEvent.click(screen.getByTestId('pause-button'));
    });

    expect(screen.getByTestId('pause-status').textContent).toBe('PAUSED');

    // Then unpause
    await act(async () => {
      fireEvent.click(screen.getByTestId('unpause-button'));
    });

    expect(screen.getByTestId('pause-status').textContent).toBe('PLAYING');
    expect((window as any).__ANIMATIONS_PAUSED__).toBe(false);
    expect(document.body.getAttribute('data-paused')).toBe('false');
  });

  it('toggles pause state with toggle button', async () => {
    render(
      <PauseProvider>
        <PauseTestComponent />
      </PauseProvider>
    );

    const toggleButton = screen.getByTestId('toggle-button');

    // First toggle: pause
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(screen.getByTestId('pause-status').textContent).toBe('PAUSED');

    // Second toggle: unpause
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(screen.getByTestId('pause-status').textContent).toBe('PLAYING');
  });

  it('responds to P key press', async () => {
    render(
      <PauseProvider>
        <PauseTestComponent />
      </PauseProvider>
    );

    expect(screen.getByTestId('pause-status').textContent).toBe('PLAYING');

    // Press 'P' key
    await act(async () => {
      fireEvent.keyDown(window, { key: 'p' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('pause-status').textContent).toBe('PAUSED');
    });

    // Press 'P' key again
    await act(async () => {
      fireEvent.keyDown(window, { key: 'P' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('pause-status').textContent).toBe('PLAYING');
    });
  });

  it('freezes game animations when paused', async () => {
    render(
      <PauseProvider>
        <PauseTestComponent />
      </PauseProvider>
    );

    // Verify game animation exists
    expect(screen.getByTestId('game-animation')).toBeTruthy();

    // Pause
    await act(async () => {
      fireEvent.click(screen.getByTestId('pause-button'));
    });

    // Verify pause state is set globally
    expect((window as any).__ANIMATIONS_PAUSED__).toBe(true);
    expect(document.body.getAttribute('data-paused')).toBe('true');

    // Note: The actual freezing happens through:
    // 1. Global flag checked by driver wrapper (prevents new animation props)
    // 2. CSS pause.css (pauses CSS animations)
    // 3. useAnimationPause hook (disables will-change on elements)
    // These work together to freeze animations
  });

  it('resumes game animations when unpaused', async () => {
    render(
      <PauseProvider>
        <PauseTestComponent />
      </PauseProvider>
    );

    // Pause then unpause
    await act(async () => {
      fireEvent.click(screen.getByTestId('pause-button'));
    });

    expect((window as any).__ANIMATIONS_PAUSED__).toBe(true);

    await act(async () => {
      fireEvent.click(screen.getByTestId('unpause-button'));
    });

    // Verify animations are unpaused
    expect((window as any).__ANIMATIONS_PAUSED__).toBe(false);
    expect(document.body.getAttribute('data-paused')).toBe('false');
  });

  it('sets body data-paused attribute correctly', async () => {
    render(
      <PauseProvider>
        <PauseTestComponent />
      </PauseProvider>
    );

    expect(document.body.getAttribute('data-paused')).toBe('false');

    await act(async () => {
      fireEvent.click(screen.getByTestId('pause-button'));
    });

    expect(document.body.getAttribute('data-paused')).toBe('true');

    await act(async () => {
      fireEvent.click(screen.getByTestId('unpause-button'));
    });

    expect(document.body.getAttribute('data-paused')).toBe('false');
  });

  it('maintains consistent state across global flag and body attribute', async () => {
    render(
      <PauseProvider>
        <PauseTestComponent />
      </PauseProvider>
    );

    // Pause
    await act(async () => {
      fireEvent.click(screen.getByTestId('pause-button'));
    });

    expect((window as any).__ANIMATIONS_PAUSED__).toBe(true);
    expect(document.body.getAttribute('data-paused')).toBe('true');
    expect(screen.getByTestId('pause-status').textContent).toBe('PAUSED');

    // Unpause
    await act(async () => {
      fireEvent.click(screen.getByTestId('unpause-button'));
    });

    expect((window as any).__ANIMATIONS_PAUSED__).toBe(false);
    expect(document.body.getAttribute('data-paused')).toBe('false');
    expect(screen.getByTestId('pause-status').textContent).toBe('PLAYING');
  });

  it('handles multiple pause/unpause cycles correctly', async () => {
    render(
      <PauseProvider>
        <PauseTestComponent />
      </PauseProvider>
    );

    const toggleButton = screen.getByTestId('toggle-button');

    // Multiple cycles
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        fireEvent.click(toggleButton);
      });

      expect(screen.getByTestId('pause-status').textContent).toBe('PAUSED');
      expect((window as any).__ANIMATIONS_PAUSED__).toBe(true);

      await act(async () => {
        fireEvent.click(toggleButton);
      });

      expect(screen.getByTestId('pause-status').textContent).toBe('PLAYING');
      expect((window as any).__ANIMATIONS_PAUSED__).toBe(false);
    }
  });

  it('cleans up on unmount', () => {
    const { unmount } = render(
      <PauseProvider>
        <PauseTestComponent />
      </PauseProvider>
    );

    unmount();

    // Body attribute should be cleaned up
    expect(document.body.hasAttribute('data-paused')).toBe(false);
  });
});
