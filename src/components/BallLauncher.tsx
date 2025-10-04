/**
 * Ball launcher chamber - shows the mechanism that releases the ball
 * Adds physical realism to the ball drop
 */

import { motion } from 'framer-motion';
import { useTheme } from '../theme';

interface BallLauncherProps {
  x: number;
  y: number;
  isLaunching: boolean;
}

export function BallLauncher({ x, y, isLaunching }: BallLauncherProps) {
  const { theme } = useTheme();
  const BALL_RADIUS = 7; // Match actual ball size (14px diameter)
  const CHAMBER_WIDTH = 24; // Adjusted to fit smaller ball
  const CHAMBER_HEIGHT = 45;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Launch chamber/hole */}
      <motion.div
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
          boxShadow: `
            inset 0 4px 12px ${theme.colors.shadows.default}80,
            inset 0 -2px 6px ${theme.colors.text.inverse}10,
            0 2px 8px ${theme.colors.shadows.default}50
          `,
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
        {/* Inner shadow/depth */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 30%, transparent 0%, ${theme.colors.shadows.default}40 60%, ${theme.colors.shadows.default}60 100%)`,
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
      </motion.div>

      {/* Ball inside chamber - visible during countdown */}
      {!isLaunching && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: `${BALL_RADIUS * 2}px`,
            height: `${BALL_RADIUS * 2}px`,
            left: `${-BALL_RADIUS}px`,
            top: `${-BALL_RADIUS + 8}px`,
            background: `
              radial-gradient(circle at 28% 25%,
                ${theme.colors.game.ball.highlight} 0%,
                ${theme.colors.text.primary} 15%,
                ${theme.colors.game.ball.primary} 30%,
                ${theme.colors.game.ball.primary} 45%,
                ${theme.colors.game.ball.secondary} 65%,
                ${theme.colors.game.ball.secondary} 80%,
                ${theme.colors.game.ball.secondary} 95%
              )
            `,
            boxShadow: `
              0 4px 12px ${theme.colors.game.ball.primary}99,
              0 0 15px ${theme.colors.game.ball.primary}80,
              0 2px 6px ${theme.colors.shadows.default}66,
              inset -2px -2px 4px ${theme.colors.shadows.default}66,
              inset 2px 2px 3px ${theme.colors.text.inverse}e6,
              inset -1px -1px 2px ${theme.colors.game.ball.secondary}cc
            `,
            border: `1px solid ${theme.colors.game.ball.secondary}e6`,
          }}
          initial={{ y: 0, scale: 1 }}
          animate={{
            y: [0, -2, 0],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Match the ball's glossy highlight */}
          <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '20%',
              width: '45%',
              height: '45%',
              background: `radial-gradient(circle, ${theme.colors.text.inverse}90 0%, ${theme.colors.text.inverse}40 40%, transparent 70%)`,
              borderRadius: '50%',
              filter: 'blur(1px)'
            }}
          />
        </motion.div>
      )}

      {/* Pusher mechanism - animates when launching */}
      <motion.div
        className="absolute"
        style={{
          width: `${CHAMBER_WIDTH - 8}px`,
          height: '4px',
          left: `${-(CHAMBER_WIDTH - 8) / 2}px`,
          top: `${-CHAMBER_HEIGHT / 2 + 8}px`,
          background: `linear-gradient(90deg, ${theme.colors.game.launcher.base} 0%, ${theme.colors.game.launcher.accent} 50%, ${theme.colors.game.launcher.base} 100%)`,
          borderRadius: '2px',
          boxShadow: `0 2px 4px ${theme.colors.shadows.default}50, inset 0 1px 1px ${theme.colors.text.inverse}30`,
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
        <motion.div
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
    </div>
  );
}
