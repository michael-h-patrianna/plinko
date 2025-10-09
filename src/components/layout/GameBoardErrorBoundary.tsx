import { Component, type ErrorInfo, type ReactNode } from 'react';
import { trackErrorBoundary } from '../../utils/telemetry';

interface Props {
  children: ReactNode;
  onError?: (error: Error) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for game board section
 * Provides user-friendly error message and recovery option when game board fails
 */
export class GameBoardErrorBoundary extends Component<Props, State> {
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
      error: `Game Board Error: ${error.message}`,
      componentStack: errorInfo.componentStack ?? undefined,
      errorInfo,
    });

    // Call optional error callback
    this.props.onError?.(error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

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
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h3 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Game Board Error</h3>
          <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>
            The game board encountered an error. Try resetting the game.
          </p>
          {this.props.onReset && (
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Reset Game
            </button>
          )}
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
