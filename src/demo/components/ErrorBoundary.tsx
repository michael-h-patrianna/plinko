/**
 * React Error Boundary component for graceful error handling
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs them to telemetry, and displays a fallback UI instead of crashing.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={<CustomErrorUI />}
 *   onError={(error) => console.error('Caught:', error)}
 * >
 *   <App />
 * </ErrorBoundary>
 * ```
 *
 * Features:
 * - Automatic error tracking via telemetry
 * - Custom fallback UI support
 * - Optional error callback for additional handling
 * - Default error display with styled UI
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { trackErrorBoundary } from '@plinko/utils/telemetry';
import { colorTokens, spacingTokens, borderRadiusTokens, typographyTokens } from '@plinko/theme/tokens';

interface Props {
  /** Child components to protect with error boundary */
  children: ReactNode;
  /** Custom fallback UI to show when error occurs (optional) */
  fallback?: ReactNode;
  /** Callback invoked when error is caught (optional) */
  onError?: (error: Error) => void;
}

interface State {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The caught error, if any */
  error: Error | null;
}

/**
 * Error boundary class component
 * Uses React's error boundary lifecycle methods to catch and handle errors
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);

    // Track error in telemetry system
    trackErrorBoundary({
      error: error.message,
      componentStack: errorInfo.componentStack ?? undefined,
      errorInfo,
    });

    // Call optional error callback (can be used to trigger toast notifications)
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div
          style={{
            padding: `${spacingTokens[5]}px`,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${colorTokens.red[900]} 0%, ${colorTokens.red[800]} 100%)`,
            border: `2px solid ${colorTokens.red[600]}`,
            borderRadius: `${borderRadiusTokens.lg}px`,
            margin: `${spacingTokens[4]}px`,
          }}
        >
          <h2
            style={{
              color: colorTokens.red[100],
              fontSize: typographyTokens.fontSize.xl,
              fontWeight: typographyTokens.fontWeight.bold,
              marginBottom: `${spacingTokens[2]}px`,
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              color: colorTokens.red[200],
              fontSize: typographyTokens.fontSize.sm,
            }}
          >
            {this.state.error?.message ?? 'An unexpected error occurred. Please refresh the page.'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
