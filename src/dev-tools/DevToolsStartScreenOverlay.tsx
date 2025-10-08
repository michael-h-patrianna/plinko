/**
 * Dev Tools: Start Screen Overlay
 *
 * Invisible overlay that intercepts shift+clicks on prize items
 * to allow selecting winners during development.
 *
 * This component keeps dev functionality separate from production code.
 */

import { useEffect } from 'react';

interface DevToolsStartScreenOverlayProps {
  isActive: boolean;
  onSelectWinner: (index: number) => void;
}

export function DevToolsStartScreenOverlay({
  isActive,
  onSelectWinner,
}: DevToolsStartScreenOverlayProps) {
  useEffect(() => {
    if (!isActive) return;

    const handleClick = (e: MouseEvent) => {
      // Only handle shift+clicks
      if (!e.shiftKey) return;

      // Find if we clicked on a prize item or its child
      const target = e.target as HTMLElement;
      const prizeItem = target.closest('[data-prize-index]');

      if (prizeItem) {
        const index = parseInt(prizeItem.getAttribute('data-prize-index') || '-1', 10);
        if (index >= 0) {
          onSelectWinner(index);
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    // Add click listener to document
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [isActive, onSelectWinner]);

  // This component renders nothing - it only handles events
  return null;
}
