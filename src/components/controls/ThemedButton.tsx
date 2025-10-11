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

import { useAnimationDriver } from '@theme/animationDrivers';
import { useAudio } from '../../audio/context/AudioProvider';
import { useTheme } from '../../theme';

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
  const { sfxController } = useAudio();
  const buttonStyle = variant === 'primary' ? theme.buttons.primary : theme.buttons.secondary;

  // Play sound on click
  const handleClick = () => {
    if (sfxController && !disabled) {
      sfxController.play('ui-button-press');
    }
    onClick();
  };

  // Animation configuration types
  // Note: Using AnimationConfig and TransitionConfig from animation driver for type safety
  type AnimationTarget = Record<string, number | number[] | string | undefined>;

  let animateTarget: AnimationTarget = { scale: 1, rotate: 0, opacity: 1, y: 0 };
  let initialState: AnimationTarget | undefined = undefined;
  let entranceTransition: Record<string, number | number[] | string | undefined> | undefined = undefined;

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
      initialState = undefined;
      entranceTransition = undefined;
      break;
  }

  return (
    <AnimatedButton
      onClick={handleClick}
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
      transition={entranceTransition as any}
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
