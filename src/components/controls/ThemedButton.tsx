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

import { useTheme } from '../../theme';
import { useAnimationDriver } from '@theme/animationDrivers';

type EntranceAnimation = 'fade' | 'hero' | 'none';

interface ThemedButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  delay?: number;
  children: React.ReactNode;
  testId?: string;
  style?: React.CSSProperties;
  variant?: 'primary' | 'secondary';
  entranceAnimation?: EntranceAnimation;
}

export function ThemedButton({
  onClick,
  disabled = false,
  className = '',
  delay = 0,
  children,
  testId,
  style,
  variant = 'primary',
  entranceAnimation = 'fade',
}: ThemedButtonProps) {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');
  const AnimatedButton = driver.createAnimatedComponent('button');

  const { theme } = useTheme();
  const buttonStyle = variant === 'primary' ? theme.buttons.primary : theme.buttons.secondary;

  // Animation configuration types
  // Note: Using Record<string, unknown> for platform-specific animation properties
  // that may differ between Framer Motion (web) and Moti (React Native)
  type AnimationTarget = Record<string, number | number[] | string | undefined>;
  type AnimationTransition = Record<string, number | number[] | string | undefined> | undefined;

  let animateTarget: AnimationTarget = { scale: 1, rotate: 0, opacity: 1, y: 0 };
  let initialState: AnimationTarget | false = false;
  let entranceTransition: AnimationTransition = undefined;

  switch (entranceAnimation) {
    case 'hero':
      initialState = { scale: 0.9, opacity: 0, y: 10 };
      animateTarget = {
        scale: [0.9, 1.04, 1],
        y: [10, -3, 0],
        opacity: [0, 1, 1],
      };
      entranceTransition = {
        delay,
        duration: 0.26,
        ease: 'easeOut',
        times: [0, 0.65, 1],
      };
      break;
    case 'fade':
      initialState = { scale: 0.97, rotate: 0, opacity: 0 };
      entranceTransition = {
        duration: 0.25,
        delay,
        ease: [0.22, 1, 0.36, 1],
      };
      break;
    case 'none':
    default:
      initialState = false;
      entranceTransition = undefined;
      break;
  }

  return (
    <AnimatedButton
      onClick={onClick}
      disabled={disabled}
      className={`font-bold relative overflow-hidden group ${className}`}
      style={{
        background: buttonStyle.background,
        color: buttonStyle.color,
        border: buttonStyle.border,
        borderWidth: buttonStyle.borderWidth,
        borderRadius: buttonStyle.borderRadius,
        padding: `${buttonStyle.padding.y} ${buttonStyle.padding.x}`,
        fontSize: buttonStyle.fontSize,
        fontWeight: buttonStyle.fontWeight,
        fontFamily: theme.typography.fontFamily.primary,
        /* RN-compatible: removed boxShadow, using borderBottom for depth */
        borderBottomWidth: 3,
        borderBottomColor: theme.colors.border.default,
        transition: buttonStyle.transition,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      whileHover={
        !disabled
          ? {
              scale: 1.05,
              /* RN-compatible: removed boxShadow hover effect */
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
      initial={initialState}
      animate={animateTarget}
      transition={entranceTransition}
      data-testid={testId}
    >
      {/* Button shine effect */}
      <AnimatedDiv
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
    </AnimatedButton>
  );
}
