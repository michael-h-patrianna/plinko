/**
 * Theme configuration for Plinko popup
 * Provides design tokens for consistent styling
 */

export const theme = {
  colors: {
    background: '#0f172a', // slate-900
    surface: '#1e293b', // slate-800
    primary: '#3b82f6', // blue-500
    accent: '#8b5cf6', // violet-500
    textPrimary: '#f1f5f9', // slate-100
    textSecondary: '#cbd5e1', // slate-300
    success: '#10b981', // emerald-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444', // red-500
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },

  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      '2xl': 32,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },

  shadows: {
    button: '0 4px 12px rgba(0, 0, 0, 0.2)',
    board: '0 8px 32px rgba(0, 0, 0, 0.4)',
    card: '0 10px 40px rgba(0, 0, 0, 0.5)',
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },

  animation: {
    easing: {
      easeOut: 'cubic-bezier(0.33, 1, 0.68, 1)',
      easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
  },
} as const;

/**
 * Popup dimensions (fixed width for consistent layout)
 */
export const popupDimensions = {
  width: 375,
  height: 600,
} as const;
