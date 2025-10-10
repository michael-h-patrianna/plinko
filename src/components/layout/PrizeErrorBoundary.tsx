import { Component, type ErrorInfo, type ReactNode } from 'react';
import { trackErrorBoundary } from '@utils/telemetry';
import { colorTokens, spacingTokens, borderRadiusTokens, typographyTokens, opacityTokens } from '@theme/tokens';

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
 *
 * CROSS-PLATFORM COMPATIBLE: Uses only linear gradients, no shadows or blur
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

    // Call optional error callback (can be used to trigger toast notifications)
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: `${spacingTokens[8]}px`,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${colorTokens.red[900]}${Math.round(opacityTokens[10] * 255).toString(16)} 0%, ${colorTokens.red[800]}${Math.round(opacityTokens[15] * 255).toString(16)} 100%)`,
            border: `2px solid ${colorTokens.red[600]}`,
            borderRadius: `${borderRadiusTokens.lg}px`,
            margin: `${spacingTokens[4]}px`,
          }}
        >
          <h3
            style={{
              color: colorTokens.red[400],
              fontSize: typographyTokens.fontSize.lg,
              fontWeight: typographyTokens.fontWeight.semibold,
              marginBottom: `${spacingTokens[2]}px`,
            }}
          >
            Prize Display Error
          </h3>
          <p
            style={{
              color: colorTokens.gray[400],
              fontSize: typographyTokens.fontSize.sm,
            }}
          >
            Unable to display prizes. Please refresh the page to try again.
          </p>
          {import.meta.env.DEV && (
            <details
              style={{
                marginTop: `${spacingTokens[4]}px`,
                fontSize: typographyTokens.fontSize.xs,
                textAlign: 'left',
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  color: colorTokens.red[400],
                  fontWeight: typographyTokens.fontWeight.medium,
                }}
              >
                Error Details
              </summary>
              <pre
                style={{
                  marginTop: `${spacingTokens[2]}px`,
                  padding: `${spacingTokens[2]}px`,
                  backgroundColor: colorTokens.gray[900],
                  border: `1px solid ${colorTokens.gray[700]}`,
                  borderRadius: `${borderRadiusTokens.sm}px`,
                  overflow: 'auto',
                  color: colorTokens.gray[300],
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
