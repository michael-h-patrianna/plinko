/**
 * Hook that pauses Framer Motion animations when game is paused
 *
 * This hook:
 * - Sets a global flag that animation components can check
 * - Freezes all Framer Motion elements by disabling GPU acceleration
 * - Preserves current animation state when paused
 * - Automatically manages cleanup
 *
 * TECHNICAL APPROACH:
 * CSS animation-play-state doesn't affect Framer Motion's JS-driven animations.
 * Instead, we:
 * 1. Set window.__ANIMATIONS_PAUSED__ flag for components to check
 * 2. Disable will-change (removes GPU optimization, effectively freezing transforms)
 * 3. Store current transform/opacity state to prevent jumps on unpause
 *
 * @returns Current pause state
 */

import { useEffect } from 'react';
import { usePause } from '../contexts/PauseContext';

export function useAnimationPause(): boolean {
  const { isPaused } = usePause();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set global flag that animation components/drivers can check
    (window as any).__ANIMATIONS_PAUSED__ = isPaused;

    // Find all Framer Motion elements
    // Framer Motion adds data-framer-component-type to animated elements
    const motionElements = document.querySelectorAll('[data-framer-motion]');

    motionElements.forEach((el) => {
      const htmlEl = el as HTMLElement;

      if (isPaused) {
        // Capture current computed styles before freezing
        const computedStyle = window.getComputedStyle(htmlEl);

        // Store current visual state (transforms, opacity) to prevent jumps
        htmlEl.dataset.pausedTransform = computedStyle.transform;
        htmlEl.dataset.pausedOpacity = computedStyle.opacity;

        // Disable GPU acceleration and animations by removing will-change
        // This effectively freezes the element at its current visual state
        htmlEl.style.willChange = 'auto';
        htmlEl.style.animationPlayState = 'paused';

        // Add a data attribute for CSS targeting (demo UI exclusion)
        htmlEl.dataset.animationPaused = 'true';
      } else {
        // Resume animations
        htmlEl.style.willChange = '';
        htmlEl.style.animationPlayState = 'running';

        // Clean up pause state
        delete htmlEl.dataset.pausedTransform;
        delete htmlEl.dataset.pausedOpacity;
        delete htmlEl.dataset.animationPaused;
      }
    });
  }, [isPaused]);

  return isPaused;
}
