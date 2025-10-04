/**
 * Container component for the popup/modal style
 */

import type { ReactNode } from 'react';

interface PopupContainerProps {
  children: ReactNode;
}

export function PopupContainer({ children }: PopupContainerProps) {
  return (
    <div
      className="relative rounded-xl w-full"
      style={{
        minHeight: '650px',
        overflow: 'visible',
        background: `
          linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%),
          radial-gradient(circle at 50% 0%, rgba(71,85,105,0.3) 0%, transparent 70%)
        `,
        boxShadow: `
          0 25px 50px -12px rgba(0,0,0,0.9),
          0 10px 25px -5px rgba(0,0,0,0.7),
          0 0 100px rgba(0,0,0,0.5),
          inset 0 1px 2px rgba(255,255,255,0.08),
          inset 0 -1px 2px rgba(0,0,0,0.5)
        `,
        border: '1px solid rgba(71,85,105,0.3)'
      }}
      data-testid="popup-container"
    >
      {children}
    </div>
  );
}
