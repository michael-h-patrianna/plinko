/**
 * Toast Context and Hook
 *
 * Provides global toast notification management via React Context.
 * Allows any component to trigger toast notifications imperatively.
 *
 * Usage:
 * ```tsx
 * const { showToast } = useToast();
 * showToast({ message: 'Success!', severity: 'success' });
 * ```
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { ToastContainer } from './ToastContainer';
import type { ToastProps } from './Toast';

interface ToastContextValue {
  showToast: (options: Omit<ToastProps, 'id' | 'onDismiss'>) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastIdCounter = 0;

export interface ToastProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

/**
 * Toast Provider Component
 * Wrap your app with this to enable toast notifications
 */
export function ToastProvider({ children, position = 'top-right', maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = useCallback((options: Omit<ToastProps, 'id' | 'onDismiss'>): string => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: ToastProps = {
      id,
      ...options,
    };

    setToasts((prev) => {
      // Limit number of toasts displayed
      const updated = [...prev, newToast];
      return updated.slice(-maxToasts);
    });

    return id;
  }, [maxToasts]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextValue = {
    showToast,
    dismissToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} position={position} />
    </ToastContext.Provider>
  );
}

/**
 * Hook to access toast notifications
 * @throws Error if used outside ToastProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * Convenience helper functions for common toast types
 */
// eslint-disable-next-line react-refresh/only-export-components
export function createToastHelpers(showToast: ToastContextValue['showToast']) {
  return {
    success: (message: string, duration?: number) =>
      showToast({ message, severity: 'success', duration }),
    error: (message: string, duration?: number) =>
      showToast({ message, severity: 'error', duration }),
    warning: (message: string, duration?: number) =>
      showToast({ message, severity: 'warning', duration }),
    info: (message: string, duration?: number) =>
      showToast({ message, severity: 'info', duration }),
  };
}
