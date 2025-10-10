/**
 * Toast Container Component
 *
 * Manages and displays multiple toast notifications.
 * Fixed position container that stacks toasts vertically.
 *
 * CROSS-PLATFORM CONSTRAINTS:
 * ✅ Uses only transforms and opacity for positioning
 * ❌ No blur, box shadows, or filters
 */

import { AnimatePresence } from 'framer-motion';
import { Toast, type ToastProps } from './Toast';
import { spacingTokens, zIndexTokens } from '@theme/tokens';

export interface ToastContainerProps {
  toasts: ToastProps[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

/**
 * Container for managing toast notifications
 */
export function ToastContainer({ toasts, onDismiss, position = 'top-right' }: ToastContainerProps) {
  // Calculate position styles
  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed',
      display: 'flex',
      flexDirection: 'column',
      zIndex: zIndexTokens.notification,
      padding: `${spacingTokens[4]}px`,
      pointerEvents: 'none',
    };

    switch (position) {
      case 'top-right':
        return { ...base, top: 0, right: 0 };
      case 'top-left':
        return { ...base, top: 0, left: 0 };
      case 'bottom-right':
        return { ...base, bottom: 0, right: 0 };
      case 'bottom-left':
        return { ...base, bottom: 0, left: 0 };
      case 'top-center':
        return { ...base, top: 0, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-center':
        return { ...base, bottom: 0, left: '50%', transform: 'translateX(-50%)' };
      default:
        return { ...base, top: 0, right: 0 };
    }
  };

  return (
    <div style={getPositionStyles()}>
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <Toast
              {...toast}
              onDismiss={onDismiss}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
