/**
 * Ball launcher chamber - shows the mechanism that releases the ball
 * Adds physical realism to the ball drop
 */

import { motion } from 'framer-motion';

interface BallLauncherProps {
  x: number;
  y: number;
  isLaunching: boolean;
}

export function BallLauncher({ x, y, isLaunching }: BallLauncherProps) {
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
              rgba(15,23,42,1) 0%,
              rgba(30,41,59,0.95) 30%,
              rgba(51,65,85,0.9) 60%,
              rgba(71,85,105,0.8) 100%
            )
          `,
          borderRadius: '8px 8px 50% 50%',
          border: '2px solid rgba(71,85,105,0.6)',
          boxShadow: `
            inset 0 4px 12px rgba(0,0,0,0.8),
            inset 0 -2px 6px rgba(255,255,255,0.1),
            0 2px 8px rgba(0,0,0,0.5)
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
            background: 'radial-gradient(ellipse at 50% 30%, transparent 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.6) 100%)',
            borderRadius: '8px 8px 50% 50%',
          }}
        />

        {/* Top edge highlight */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: '3px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
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
                #fffbeb 0%,
                #fef3c7 15%,
                #fde047 30%,
                #facc15 45%,
                #f59e0b 65%,
                #d97706 80%,
                #b45309 95%
              )
            `,
            boxShadow: `
              0 4px 12px rgba(251,191,36,0.6),
              0 0 15px rgba(251,191,36,0.5),
              0 2px 6px rgba(0,0,0,0.4),
              inset -2px -2px 4px rgba(0,0,0,0.4),
              inset 2px 2px 3px rgba(255,255,255,0.9),
              inset -1px -1px 2px rgba(180,83,9,0.8)
            `,
            border: '1px solid rgba(217,119,6,0.9)',
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
              background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 40%, transparent 70%)',
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
          background: 'linear-gradient(90deg, #64748b 0%, #94a3b8 50%, #64748b 100%)',
          borderRadius: '2px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.3)',
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
            background: 'repeating-linear-gradient(0deg, #475569 0px, #475569 2px, transparent 2px, transparent 4px)',
            opacity: 0.5,
          }}
        />
      )}
    </div>
  );
}
