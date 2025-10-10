import { Component, type ErrorInfo, type ReactNode } from 'react';
import { trackErrorBoundary } from '@utils/telemetry';
import { colorTokens, spacingTokens, borderRadiusTokens, typographyTokens, opacityTokens } from '@theme/tokens';

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
 *
 * CROSS-PLATFORM COMPATIBLE: Uses only linear gradients, no shadows or blur
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

    // Call optional error callback (can be used to trigger toast notifications)
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
            padding: `${spacingTokens[8]}px`,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${colorTokens.red[900]}${Math.round(opacityTokens[10] * 255).toString(16)} 0%, ${colorTokens.red[800]}${Math.round(opacityTokens[15] * 255).toString(16)} 100%)`,
            border: `2px solid ${colorTokens.red[600]}`,
            borderRadius: `${borderRadiusTokens.lg}px`,
            margin: `${spacingTokens[4]}px`,
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
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
            Game Board Error
          </h3>
          <p
            style={{
              color: colorTokens.gray[400],
              fontSize: typographyTokens.fontSize.sm,
              marginBottom: `${spacingTokens[4]}px`,
            }}
          >
            The game board encountered an error. Try resetting the game.
          </p>
          {this.props.onReset && (
            <button
              onClick={this.handleReset}
              style={{
                padding: `${spacingTokens[2]}px ${spacingTokens[4]}px`,
                background: `linear-gradient(135deg, ${colorTokens.red[600]} 0%, ${colorTokens.red[700]} 100%)`,
                color: colorTokens.white,
                border: `2px solid ${colorTokens.red[500]}`,
                borderRadius: `${borderRadiusTokens.md}px`,
                cursor: 'pointer',
                fontSize: typographyTokens.fontSize.sm,
                fontWeight: typographyTokens.fontWeight.medium,
              }}
            >
              Reset Game
            </button>
          )}
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
