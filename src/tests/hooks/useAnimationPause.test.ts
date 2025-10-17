/**
 * Tests for useAnimationPause hook
 *
 * Verifies:
 * - Global window flag is set correctly
 * - Framer Motion elements' animation-play-state is controlled
 * - Returns current pause state
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PauseProvider } from '../../contexts/PauseContext';
import { useAnimationPause } from '../../hooks/useAnimationPause';
import { usePause } from '../../contexts/PauseContext';

describe('useAnimationPause', () => {
  beforeEach(() => {
    // Clean up global flag
    delete (window as any).__ANIMATIONS_PAUSED__;

    // Clean up any test elements
    document.body.innerHTML = '';
  });

  afterEach(() => {
    delete (window as any).__ANIMATIONS_PAUSED__;
    document.body.innerHTML = '';
  });

  it('returns current pause state', () => {
    const { result } = renderHook(
      () => {
        useAnimationPause();
        return usePause();
      },
      { wrapper: PauseProvider }
    );

    expect(result.current.isPaused).toBe(false);

    act(() => {
      result.current.pause();
    });

    expect(result.current.isPaused).toBe(true);
  });

  it('sets global window flag when paused', () => {
    const { result } = renderHook(
      () => {
        useAnimationPause();
        return usePause();
      },
      { wrapper: PauseProvider }
    );

    expect((window as any).__ANIMATIONS_PAUSED__).toBe(false);

    act(() => {
      result.current.pause();
    });

    expect((window as any).__ANIMATIONS_PAUSED__).toBe(true);
  });

  it('clears global window flag when unpaused', () => {
    const { result } = renderHook(
      () => {
        useAnimationPause();
        return usePause();
      },
      { wrapper: PauseProvider }
    );

    act(() => {
      result.current.pause();
    });

    expect((window as any).__ANIMATIONS_PAUSED__).toBe(true);

    act(() => {
      result.current.unpause();
    });

    expect((window as any).__ANIMATIONS_PAUSED__).toBe(false);
  });

  it('pauses Framer Motion elements when paused', () => {
    // Create test elements with data-framer-motion attribute
    const element1 = document.createElement('div');
    element1.setAttribute('data-framer-motion', 'true');
    document.body.appendChild(element1);

    const element2 = document.createElement('div');
    element2.setAttribute('data-framer-motion', 'true');
    document.body.appendChild(element2);

    const { result } = renderHook(
      () => {
        useAnimationPause();
        return usePause();
      },
      { wrapper: PauseProvider }
    );

    act(() => {
      result.current.pause();
    });

    expect(element1.style.animationPlayState).toBe('paused');
    expect(element2.style.animationPlayState).toBe('paused');
    expect(element1.style.willChange).toBe('auto');
    expect(element2.style.willChange).toBe('auto');
    expect(element1.dataset.animationPaused).toBe('true');
    expect(element2.dataset.animationPaused).toBe('true');
  });

  it('resumes Framer Motion elements when unpaused', () => {
    // Create test elements with data-framer-motion attribute
    const element1 = document.createElement('div');
    element1.setAttribute('data-framer-motion', 'true');
    document.body.appendChild(element1);

    const element2 = document.createElement('div');
    element2.setAttribute('data-framer-motion', 'true');
    document.body.appendChild(element2);

    const { result } = renderHook(
      () => {
        useAnimationPause();
        return usePause();
      },
      { wrapper: PauseProvider }
    );

    act(() => {
      result.current.pause();
    });

    expect(element1.style.animationPlayState).toBe('paused');
    expect(element2.style.animationPlayState).toBe('paused');

    act(() => {
      result.current.unpause();
    });

    expect(element1.style.animationPlayState).toBe('running');
    expect(element2.style.animationPlayState).toBe('running');
    expect(element1.style.willChange).toBe('');
    expect(element2.style.willChange).toBe('');
    expect(element1.dataset.animationPaused).toBeUndefined();
    expect(element2.dataset.animationPaused).toBeUndefined();
  });

  it('handles elements added after initial render', () => {
    const { result } = renderHook(
      () => {
        useAnimationPause();
        return usePause();
      },
      { wrapper: PauseProvider }
    );

    act(() => {
      result.current.pause();
    });

    // Add element after pause
    const newElement = document.createElement('div');
    newElement.setAttribute('data-framer-motion', 'true');
    document.body.appendChild(newElement);

    // Trigger re-render by toggling pause
    act(() => {
      result.current.unpause();
    });

    act(() => {
      result.current.pause();
    });

    expect(newElement.style.animationPlayState).toBe('paused');
  });

  it('does not affect elements without data-framer-motion attribute', () => {
    const regularElement = document.createElement('div');
    document.body.appendChild(regularElement);

    const { result } = renderHook(
      () => {
        useAnimationPause();
        return usePause();
      },
      { wrapper: PauseProvider }
    );

    act(() => {
      result.current.pause();
    });

    expect(regularElement.style.animationPlayState).toBe('');
  });
});
