/**
 * Reusable themed button component with entrance animation and shine effect
 * Automatically styled based on current theme
 * @param onClick - Click handler
 * @param disabled - Whether the button should be disabled
 * @param className - Additional CSS classes
 * @param delay - Animation delay in seconds
 * @param children - Button content
 * @param testId - Test ID for testing
 */

import { motion } from 'framer-motion';
import { useTheme } from '../theme';

interface ThemedButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  delay?: number;
  children: React.ReactNode;
  testId?: string;
}

export function ThemedButton({
  onClick,
  disabled = false,
  className = '',
  delay = 0,
  children,
  testId,
}: ThemedButtonProps) {
  const { theme } = useTheme();

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`font-bold relative overflow-hidden group ${className}`}
      style={{
        background: theme.buttons.primary.background,
        color: theme.buttons.primary.color,
        border: theme.buttons.primary.border,
        borderWidth: theme.buttons.primary.borderWidth,
        borderRadius: theme.buttons.primary.borderRadius,
        padding: `${theme.buttons.primary.padding.y} ${theme.buttons.primary.padding.x}`,
        fontSize: theme.buttons.primary.fontSize,
        fontWeight: theme.buttons.primary.fontWeight,
        fontFamily: theme.typography.fontFamily.primary,
        boxShadow: theme.buttons.primary.shadow,
        transition: theme.buttons.primary.transition,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
      whileHover={
        !disabled
          ? {
              scale: 1.05,
              boxShadow: theme.buttons.primary.shadowHover,
              transition: {
                type: 'spring',
                stiffness: 400,
                damping: 17,
              },
            }
          : {}
      }
      whileTap={
        !disabled
          ? {
              scale: 0.92,
              transition: {
                type: 'spring',
                stiffness: 600,
                damping: 20,
              },
            }
          : {}
      }
      initial={{ scale: 0, rotate: -5, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{
        duration: 0.2,
        delay,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      data-testid={testId}
    >
      {/* Button shine effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: theme.gradients.shine,
          borderRadius: theme.buttons.primary.borderRadius,
        }}
        animate={{
          x: ['-200%', '200%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
