/**
 * Ball launcher chamber - shows the mechanism that releases the ball
 * Animates a pusher mechanism and spring coil to add physical realism to the ball drop
 * @param x - X position of launcher
 * @param y - Y position of launcher
 * @param isLaunching - Whether the ball is currently being launched
 */

import { useTheme } from '../../theme';
import { useAnimationDriver } from '../../theme/animationDrivers';

interface BallLauncherProps {
  x: number;
  y: number;
  isLaunching: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export function BallLauncher({ x, y, isLaunching, isSelected = false, onClick }: BallLauncherProps) {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');

  const { theme } = useTheme();
  const BALL_RADIUS = 7; // Match actual ball size (14px diameter)
  const CHAMBER_WIDTH = 24; // Adjusted to fit smaller ball
  const CHAMBER_HEIGHT = 45;

  const baseClass = onClick ? 'cursor-pointer' : 'pointer-events-none';

  return (
    <AnimatedDiv
      className={`absolute ${baseClass}`}
      onClick={onClick}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: isSelected ? 25 : 20,
      }}
      animate={{
        scale: isSelected ? 1.3 : 1,
        y: isSelected ? [0, -3, 0] : 0,
      }}
      transition={{
        scale: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
        y: isSelected
          ? {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : { duration: 0 },
      }}
    >
      {/* Launch chamber/hole */}
      <AnimatedDiv
        className="absolute"
        style={{
          width: `${CHAMBER_WIDTH}px`,
          height: `${CHAMBER_HEIGHT}px`,
          left: `${-CHAMBER_WIDTH / 2}px`,
          top: `${-CHAMBER_HEIGHT / 2}px`,
          background: `
            linear-gradient(180deg,
              ${theme.colors.background.primary}1 0%,
              ${theme.colors.background.secondary}95 30%,
              ${theme.colors.surface.secondary}90 60%,
              ${theme.colors.surface.elevated}80 100%
            )
          `,
          borderRadius: '8px 8px 50% 50%',
          border: `2px solid ${theme.colors.surface.elevated}60`,
          /* RN-compatible: removed boxShadow, depth created by gradient + border */
        }}
        initial={{ scaleY: 1, opacity: 1 }}
        animate={{
          scaleY: isLaunching ? 0.7 : 1,
          opacity: isLaunching ? 0 : 1,
        }}
        transition={{
          scaleY: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
          opacity: { duration: 0.2, delay: 0.3 },
        }}
      >
        {/* Inner shadow/depth - Cross-platform: linear gradient instead of radial */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, ${theme.colors.shadows.default}30 40%, ${theme.colors.shadows.default}60 100%)`,
            borderRadius: '8px 8px 50% 50%',
          }}
        />

        {/* Top edge highlight */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: '3px',
            background: `linear-gradient(90deg, transparent 0%, ${theme.colors.text.inverse}20 50%, transparent 100%)`,
            borderRadius: '8px 8px 0 0',
          }}
        />
      </AnimatedDiv>

      {/* Ball inside chamber - visible during countdown, fades out on launch */}
      <AnimatedDiv
        className="absolute rounded-full"
        style={{
          width: `${BALL_RADIUS * 2}px`,
          height: `${BALL_RADIUS * 2}px`,
          left: `${-BALL_RADIUS}px`,
          top: `${-BALL_RADIUS + 8}px`,
          background: `
            linear-gradient(180deg,
              ${theme.colors.game.ball.highlight} 0%,
              ${theme.colors.text.primary} 15%,
              ${theme.colors.game.ball.primary} 30%,
              ${theme.colors.game.ball.primary} 45%,
              ${theme.colors.game.ball.secondary} 65%,
              ${theme.colors.game.ball.secondary} 80%,
              ${theme.colors.game.ball.secondary} 95%
            )
          `,
          /* RN-compatible: removed boxShadow glow effects, using gradient + border */
          border: `1px solid ${theme.colors.game.ball.secondary}e6`,
        }}
        initial={{ y: 0, scale: 1, opacity: 1 }}
        animate={
          isLaunching
            ? {
                scale: 0.7,
                opacity: 0,
                y: 10,
              }
            : {
                y: [0, -2, 0],
                scale: [1, 1.02, 1],
                opacity: 1,
              }
        }
        transition={
          isLaunching
            ? {
                duration: 0.2,
                ease: [0.34, 1.56, 0.64, 1],
              }
            : {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      >
        {/* Match the ball's glossy highlight - Cross-platform: linear gradient + opacity (no radial/blur for RN) */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '20%',
            width: '45%',
            height: '45%',
            background: `linear-gradient(135deg, ${theme.colors.text.inverse}90 0%, ${theme.colors.text.inverse}60 30%, ${theme.colors.text.inverse}20 60%, transparent 100%)`,
            borderRadius: '50%',
            // Note: blur filter removed for RN compatibility - using opacity gradient instead
          }}
        />
      </AnimatedDiv>

      {/* Pusher mechanism - animates when launching */}
      <AnimatedDiv
        className="absolute"
        style={{
          width: `${CHAMBER_WIDTH - 8}px`,
          height: '4px',
          left: `${-(CHAMBER_WIDTH - 8) / 2}px`,
          top: `${-CHAMBER_HEIGHT / 2 + 8}px`,
          background: `linear-gradient(90deg, ${theme.colors.game.launcher.base} 0%, ${theme.colors.game.launcher.accent} 50%, ${theme.colors.game.launcher.base} 100%)`,
          borderRadius: '2px',
          /* RN-compatible: removed boxShadow, using gradient for depth */
          borderBottom: `1px solid ${theme.colors.shadows.default}50`,
        }}
        initial={{ y: 0 }}
        animate={{
          y: isLaunching ? 20 : 0,
        }}
        transition={{
          duration: 0.2,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      />

      {/* Spring coil visual */}
      {!isLaunching && (
        <AnimatedDiv
          className="absolute"
          style={{
            width: '2px',
            height: '20px',
            left: '-1px',
            top: `${-CHAMBER_HEIGHT / 2 + 12}px`,
            background: `repeating-linear-gradient(0deg, ${theme.colors.game.launcher.track} 0px, ${theme.colors.game.launcher.track} 2px, transparent 2px, transparent 4px)`,
            opacity: 0.5,
          }}
        />
      )}
    </AnimatedDiv>
  );
}
