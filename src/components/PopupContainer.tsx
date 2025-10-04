/**
 * Container component that enforces 375px popup width
 */

import type { ReactNode } from 'react';

interface PopupContainerProps {
  children: ReactNode;
}

export function PopupContainer({ children }: PopupContainerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div
        className="relative bg-slate-800 rounded-xl shadow-2xl"
        style={{ width: '375px', minHeight: '650px', overflow: 'visible' }}
        data-testid="popup-container"
      >
        {children}
      </div>
    </div>
  );
}
