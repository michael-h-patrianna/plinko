/**
 * Toast Notification Component
 *
 * Cross-platform compatible toast notifications for user feedback.
 *
 * CROSS-PLATFORM CONSTRAINTS:
 * ✅ Uses only linear gradients, transforms, and opacity
 * ❌ No blur, box shadows, or radial gradients
 *
 * Features:
 * - Auto-dismiss with configurable duration
 * - Multiple severity levels (success, error, warning, info)
 * - Smooth entrance/exit animations
 * - Stacking support for multiple toasts
 * - Accessible with ARIA labels
 */

import { useEffect, useCallback } from 'react';
import { useAnimation } from '@theme/animationDrivers/useAnimation';
import { useTheme } from '../../theme';
import { colorTokens, opacityTokens, spacingTokens, borderRadiusTokens } from '@theme/tokens';

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  severity?: ToastSeverity;
  duration?: number; // in milliseconds, 0 = no auto-dismiss
  onDismiss?: (id: string) => void;
}

/**
 * Single toast notification component
 */
export function Toast({
  id,
  message,
  severity = 'info',
  duration = 5000,
  onDismiss,
}: ToastProps) {
  const { AnimatedDiv } = useAnimation();
  const { theme } = useTheme();

  // Auto-dismiss after duration
  useEffect(() => {
    if (duration > 0 && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const handleDismiss = useCallback(() => {
    if (onDismiss) {
      onDismiss(id);
    }
  }, [id, onDismiss]);

  // Get severity-specific colors (cross-platform: no shadows, using borders for definition)
  const getSeverityStyles = () => {
    switch (severity) {
      case 'success':
        return {
          background: `linear-gradient(135deg, ${colorTokens.emerald[900]} 0%, ${colorTokens.emerald[800]} 100%)`,
          border: `2px solid ${colorTokens.emerald[600]}`,
          iconColor: colorTokens.emerald[400],
          icon: '✓',
        };
      case 'error':
        return {
          background: `linear-gradient(135deg, ${colorTokens.red[900]} 0%, ${colorTokens.red[800]} 100%)`,
          border: `2px solid ${colorTokens.red[600]}`,
          iconColor: colorTokens.red[400],
          icon: '✕',
        };
      case 'warning':
        return {
          background: `linear-gradient(135deg, ${colorTokens.amber[900]} 0%, ${colorTokens.amber[800]} 100%)`,
          border: `2px solid ${colorTokens.amber[600]}`,
          iconColor: colorTokens.amber[400],
          icon: '⚠',
        };
      case 'info':
      default:
        return {
          background: `linear-gradient(135deg, ${colorTokens.blue[900]} 0%, ${colorTokens.blue[800]} 100%)`,
          border: `2px solid ${colorTokens.blue[600]}`,
          iconColor: colorTokens.blue[400],
          icon: 'ℹ',
        };
    }
  };

  const severityStyles = getSeverityStyles();

  return (
    <AnimatedDiv
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      initial={{ x: 400, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 400, opacity: 0, scale: 0.9 }}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: `${spacingTokens[3]}px`,
        padding: `${spacingTokens[3]}px ${spacingTokens[4]}px`,
        marginBottom: `${spacingTokens[2]}px`,
        background: severityStyles.background,
        border: severityStyles.border,
        borderRadius: `${borderRadiusTokens.lg}px`,
        minWidth: '280px',
        maxWidth: '400px',
        color: theme.colors.text.primary,
        fontSize: theme.typography.fontSize.sm,
        lineHeight: theme.typography.lineHeight.normal,
      }}
    >
      {/* Icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${severityStyles.iconColor} 0%, ${severityStyles.iconColor}${Math.round(opacityTokens[80] * 255).toString(16)} 100%)`,
          color: colorTokens.white,
          fontSize: '12px',
          fontWeight: theme.typography.fontWeight.bold,
          flexShrink: 0,
        }}
      >
        {severityStyles.icon}
      </div>

      {/* Message */}
      <div style={{ flex: 1 }}>
        {message}
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '20px',
          height: '20px',
          padding: 0,
          background: 'transparent',
          border: 'none',
          color: theme.colors.text.secondary,
          cursor: 'pointer',
          fontSize: '16px',
          lineHeight: 1,
          flexShrink: 0,
          opacity: opacityTokens[70],
          transition: 'opacity 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = String(opacityTokens[100]);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = String(opacityTokens[70]);
        }}
      >
        ×
      </button>
    </AnimatedDiv>
  );
}
