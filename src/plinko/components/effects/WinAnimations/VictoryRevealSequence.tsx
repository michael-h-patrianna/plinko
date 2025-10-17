/**
 * Victory Reveal Sequence - coordinated slot dimming and reveal
 * Implements Disney animation principles: timing and anticipation
 *
 * Sequence timing:
 * 1. Dim non-winning slots (300ms)
 * 2. Scale up winning slot (400ms, 200ms delay)
 * 3. Trigger confetti/particles (600ms delay)
 *
 * @param winningSlotIndex - Index of the winning slot
 * @param totalSlots - Total number of slots
 * @param isActive - Whether the reveal sequence should be active
 * @param onComplete - Callback when sequence completes
 */

import { useEffect } from 'react';

interface VictoryRevealSequenceProps {
  winningSlotIndex: number;
  totalSlots: number;
  isActive: boolean;
  onComplete?: () => void;
}

export function VictoryRevealSequence({
  winningSlotIndex,
  totalSlots,
  isActive,
  onComplete,
}: VictoryRevealSequenceProps) {
  useEffect(() => {
    if (!isActive) return;

    // Sequence timing
    const DIM_DURATION = 300;
    const SCALE_DELAY = 200;
    const SCALE_DURATION = 400;
    const CONFETTI_DELAY = 600;

    // Step 1: Dim non-winning slots
    setTimeout(() => {
      for (let i = 0; i < totalSlots; i++) {
        if (i === winningSlotIndex) continue;

        const slotEl = document.querySelector(`[data-testid="slot-${i}"]`);
        if (!slotEl) continue;

        // Cast to HTMLElement after null check to access style property
        const htmlEl = slotEl as HTMLElement;

        // Animate opacity and scale down
        htmlEl.style.transition = `opacity ${DIM_DURATION}ms ease-out, transform ${DIM_DURATION}ms ease-out`;
        htmlEl.style.opacity = '0.3';
        htmlEl.style.transform = 'scale(0.95)';
      }
    }, 0);

    // Step 2: Scale up winning slot
    setTimeout(() => {
      const winningSlotEl = document.querySelector(`[data-testid="slot-${winningSlotIndex}"]`);
      if (winningSlotEl) {
        // Cast to HTMLElement after null check to access style property
        const htmlEl = winningSlotEl as HTMLElement;
        htmlEl.style.transition = `transform ${SCALE_DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
        htmlEl.style.transform = 'scale(1.15)';
        htmlEl.setAttribute('data-victory-scale', 'true');
      }
    }, SCALE_DELAY);

    // Step 3: Trigger confetti (handled by parent SlotWinReveal)
    // Mark slot as ready for confetti
    setTimeout(() => {
      const winningSlotEl = document.querySelector(`[data-testid="slot-${winningSlotIndex}"]`);
      if (winningSlotEl) {
        winningSlotEl.setAttribute('data-victory-confetti', 'true');
      }
      onComplete?.();
    }, CONFETTI_DELAY);

    // Cleanup function
    return () => {
      // Reset all slots when component unmounts or isActive changes
      for (let i = 0; i < totalSlots; i++) {
        const slotEl = document.querySelector(`[data-testid="slot-${i}"]`);
        if (!slotEl) continue;

        // Cast to HTMLElement after null check to access style property
        const htmlEl = slotEl as HTMLElement;
        htmlEl.style.transition = '';
        htmlEl.style.opacity = '';
        htmlEl.style.transform = '';
        htmlEl.removeAttribute('data-victory-scale');
        htmlEl.removeAttribute('data-victory-confetti');
      }
    };
  }, [isActive, winningSlotIndex, totalSlots, onComplete]);

  // This component doesn't render anything - it just controls slot animations
  return null;
}
