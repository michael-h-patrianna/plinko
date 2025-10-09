import { Component, type ErrorInfo, type ReactNode } from 'react';
import { trackErrorBoundary } from '../../utils/telemetry';

interface Props {
  children: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for prize-related sections
 * Provides user-friendly error message when prize loading or display fails
 */
export class PrizeErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Track error in telemetry system
    trackErrorBoundary({
      error: `Prize Error: ${error.message}`,
      componentStack: errorInfo.componentStack ?? undefined,
      errorInfo,
    });

    // Call optional error callback
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            borderRadius: '8px',
            margin: '1rem',
          }}
        >
          <h3 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Prize Display Error</h3>
          <p style={{ color: '#666', fontSize: '0.875rem' }}>
            Unable to display prizes. Please refresh the page to try again.
          </p>
          {import.meta.env.DEV && (
            <details style={{ marginTop: '1rem', fontSize: '0.75rem', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#dc2626' }}>Error Details</summary>
              <pre
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  overflow: 'auto',
                }}
              >
                {this.state.error?.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
