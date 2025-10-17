/**
 * Tests for PauseContext
 *
 * Verifies:
 * - Pause state management
 * - Keyboard listener for 'P' key
 * - Body attribute updates
 * - Context provider/hook integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { PauseProvider, usePause } from '../../contexts/PauseContext';

describe('PauseContext', () => {
  beforeEach(() => {
    // Clean up body attributes
    document.body.removeAttribute('data-paused');
  });

  afterEach(() => {
    document.body.removeAttribute('data-paused');
  });

  describe('PauseProvider', () => {
    it('provides initial pause state as false', () => {
      const { result } = renderHook(() => usePause(), {
        wrapper: PauseProvider,
      });

      expect(result.current.isPaused).toBe(false);
    });

    it('provides pause function that updates state', () => {
      const { result } = renderHook(() => usePause(), {
        wrapper: PauseProvider,
      });

      act(() => {
        result.current.pause();
      });

      expect(result.current.isPaused).toBe(true);
    });

    it('provides unpause function that updates state', () => {
      const { result } = renderHook(() => usePause(), {
        wrapper: PauseProvider,
      });

      act(() => {
        result.current.pause();
      });

      expect(result.current.isPaused).toBe(true);

      act(() => {
        result.current.unpause();
      });

      expect(result.current.isPaused).toBe(false);
    });

    it('provides toggle function that toggles state', () => {
      const { result } = renderHook(() => usePause(), {
        wrapper: PauseProvider,
      });

      expect(result.current.isPaused).toBe(false);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isPaused).toBe(true);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isPaused).toBe(false);
    });

    it('updates body attribute when paused', () => {
      const { result } = renderHook(() => usePause(), {
        wrapper: PauseProvider,
      });

      expect(document.body.getAttribute('data-paused')).toBe('false');

      act(() => {
        result.current.pause();
      });

      expect(document.body.getAttribute('data-paused')).toBe('true');
    });

    it('updates body attribute when unpaused', () => {
      const { result } = renderHook(() => usePause(), {
        wrapper: PauseProvider,
      });

      act(() => {
        result.current.pause();
      });

      expect(document.body.getAttribute('data-paused')).toBe('true');

      act(() => {
        result.current.unpause();
      });

      expect(document.body.getAttribute('data-paused')).toBe('false');
    });

    it('removes body attribute on unmount', () => {
      const { result, unmount } = renderHook(() => usePause(), {
        wrapper: PauseProvider,
      });

      act(() => {
        result.current.pause();
      });

      expect(document.body.getAttribute('data-paused')).toBe('true');

      unmount();

      expect(document.body.getAttribute('data-paused')).toBeNull();
    });
  });

  describe('Keyboard Listener', () => {
    it('toggles pause when lowercase "p" key is pressed', () => {
      const { result } = renderHook(() => usePause(), {
        wrapper: PauseProvider,
      });

      expect(result.current.isPaused).toBe(false);

      act(() => {
        fireEvent.keyDown(window, { key: 'p' });
      });

      expect(result.current.isPaused).toBe(true);

      act(() => {
        fireEvent.keyDown(window, { key: 'p' });
      });

      expect(result.current.isPaused).toBe(false);
    });

    it('toggles pause when uppercase "P" key is pressed', () => {
      const { result } = renderHook(() => usePause(), {
        wrapper: PauseProvider,
      });

      expect(result.current.isPaused).toBe(false);

      act(() => {
        fireEvent.keyDown(window, { key: 'P' });
      });

      expect(result.current.isPaused).toBe(true);

      act(() => {
        fireEvent.keyDown(window, { key: 'P' });
      });

      expect(result.current.isPaused).toBe(false);
    });

    it('does not toggle pause for other keys', () => {
      const { result } = renderHook(() => usePause(), {
        wrapper: PauseProvider,
      });

      expect(result.current.isPaused).toBe(false);

      act(() => {
        fireEvent.keyDown(window, { key: 'a' });
      });

      expect(result.current.isPaused).toBe(false);

      act(() => {
        fireEvent.keyDown(window, { key: 'Escape' });
      });

      expect(result.current.isPaused).toBe(false);
    });

    it('removes keyboard listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => usePause(), {
        wrapper: PauseProvider,
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('usePause Hook', () => {
    it('throws error when used outside PauseProvider', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => usePause());
      }).toThrow('usePause must be used within a PauseProvider');

      consoleErrorSpy.mockRestore();
    });

    it('works when used inside PauseProvider', () => {
      const { result } = renderHook(() => usePause(), {
        wrapper: PauseProvider,
      });

      expect(result.current).toEqual({
        isPaused: false,
        pause: expect.any(Function),
        unpause: expect.any(Function),
        toggle: expect.any(Function),
      });
    });
  });

  describe('Multiple Components', () => {
    it('shares pause state across multiple components', () => {
      function ComponentA() {
        const { isPaused, pause } = usePause();
        return (
          <div>
            <span data-testid="status-a">{isPaused ? 'paused' : 'running'}</span>
            <button onClick={pause}>Pause A</button>
          </div>
        );
      }

      function ComponentB() {
        const { isPaused } = usePause();
        return <span data-testid="status-b">{isPaused ? 'paused' : 'running'}</span>;
      }

      render(
        <PauseProvider>
          <ComponentA />
          <ComponentB />
        </PauseProvider>
      );

      expect(screen.getByTestId('status-a')).toHaveTextContent('running');
      expect(screen.getByTestId('status-b')).toHaveTextContent('running');

      fireEvent.click(screen.getByText('Pause A'));

      expect(screen.getByTestId('status-a')).toHaveTextContent('paused');
      expect(screen.getByTestId('status-b')).toHaveTextContent('paused');
    });
  });
});
