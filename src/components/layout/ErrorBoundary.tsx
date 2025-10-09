import { Component, ErrorInfo, ReactNode } from 'react';
import { trackErrorBoundary } from '../../utils/telemetry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

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
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message ?? 'Unknown error'}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
