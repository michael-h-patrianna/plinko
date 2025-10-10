/**
 * Animated 3-2-1 countdown overlay before ball drop
 * Each number displays with explosive spring animation and particle burst
 * @param onComplete - Callback when countdown finishes
 * @param boardHeight - Height of the board for vertical positioning
 * @param pegRows - Number of peg rows for calculating center position
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../../theme';
import { useAnimationDriver } from '../../theme/animationDrivers';
import {
  sizeTokens,
  zIndexTokens,
  opacityTokens,
  animationTokens,
  borderWidthTokens,
  spacingTokens,
} from '../../theme/tokens';
import { GradientText } from '../ui/GradientText';

interface CountdownProps {
  onComplete: () => void;
  boardHeight?: number;
  pegRows?: number;
}

/**
 * Extract color array from CSS gradient string
 * If extraction fails, returns fallback colors
 */
function extractGradientColors(gradientString: string, fallback: string[]): string[] {
  // Match hex colors, rgb/rgba, or named colors from gradient string
  const colorMatches = gradientString.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgba?\([^)]+\)/g);
  return colorMatches && colorMatches.length > 0 ? colorMatches : fallback;
}

export function Countdown({ onComplete, boardHeight = sizeTokens.board.height, pegRows = 10 }: CountdownProps) {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');

  const [count, setCount] = useState(3);
  const { theme } = useTheme();

  useEffect(() => {
    if (count === 0) {
      // Delay slightly before calling onComplete to let "GO!" animation finish
      const timer = setTimeout(onComplete, animationTokens.duration.slow - 100);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, animationTokens.duration.slower); // Each number shows for 800ms

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  const displayText = count === 0 ? 'GO!' : count.toString();

  // Calculate vertical center between first and last peg rows
  const BORDER_WIDTH = sizeTokens.board.borderWidth;
  const playableHeight = boardHeight * sizeTokens.board.playableHeightPercent;
  const verticalSpacing = playableHeight / (pegRows + 1);

  const COUNTDOWN_SIZE = 200; // Width and height of countdown element
  const firstPegY = verticalSpacing * 1 + BORDER_WIDTH + spacingTokens[5];
  const lastPegY = verticalSpacing * pegRows + BORDER_WIDTH + spacingTokens[5];
  const pegRowsCenter = (firstPegY + lastPegY) / 2;

  // Subtract half the countdown element height to center it
  const countdownTop = pegRowsCenter - COUNTDOWN_SIZE / 2;

  return (
    <AnimatedDiv
      className="absolute inset-0 flex justify-center pointer-events-none"
      style={{
        alignItems: 'flex-start',
        paddingTop: `${countdownTop}px`,
        zIndex: zIndexTokens.countdown,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: animationTokens.duration.normal / 1000 }}
    >
      {/* Countdown number with explosive animation */}
      <AnimatedDiv
        key={count} // Key forces re-mount for each number
        className="relative flex items-center justify-center"
        style={{
          width: `${COUNTDOWN_SIZE}px`,
          height: `${COUNTDOWN_SIZE}px`,
        }}
        initial={{ scale: 0, rotate: -30, opacity: 0 }}
        animate={{
          scale: [0, 1.3, 1],
          rotate: [-30, 10, 0],
          opacity: [0, 1, 1],
        }}
        exit={{ scale: 1.5, opacity: 0 }}
        transition={{
          duration: animationTokens.duration.slow / 1000,
          ease: [0.34, 1.56, 0.64, 1], // Spring easing
        }}
      >
        {/* Expanding ring behind number */}
        <AnimatedDiv
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border:
              count === 0
                ? `${borderWidthTokens[6]}px solid ${theme.colors.status.success}`
                : `${borderWidthTokens[6]}px solid ${theme.colors.game.ball.primary}`,
            /* RN-compatible: removed boxShadow glow effects */
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.2, 1],
            opacity: [0, opacityTokens[80], 0],
          }}
          transition={{
            duration: animationTokens.duration.slower / 1000,
            ease: 'easeOut',
          }}
        />

        {/* Pulsing glow */}
        <AnimatedDiv
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${COUNTDOWN_SIZE + 50}px`,
            height: `${COUNTDOWN_SIZE + 50}px`,
            left: `${-spacingTokens[6]}px`,
            top: `${-spacingTokens[6]}px`,
            background:
              count === 0
                ? theme.gradients.glow.includes('gradient')
                  ? theme.gradients.glow
                      .replace('rgba(255,255,255,0.3)', `${theme.colors.status.success}66`)
                      .replace(/transparent/g, 'transparent')
                  : `linear-gradient(135deg, ${theme.colors.status.success}66 0%, ${theme.colors.status.success}33 40%, transparent 70%)`
                : theme.gradients.ballGlow.includes('gradient')
                  ? theme.gradients.ballGlow
                  : `linear-gradient(135deg, ${theme.colors.game.ball.primary}66 0%, ${theme.colors.game.ball.primary}33 40%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [opacityTokens[60], opacityTokens[30], opacityTokens[60]],
          }}
          transition={{
            duration: animationTokens.duration.medium * 2 / 1000,
            repeat: count > 0 ? 1 : 0,
            ease: 'easeInOut',
          }}
        />

        {/* Main number */}
        <AnimatedDiv
          className="relative z-10"
          initial={{ y: spacingTokens[8] }}
          animate={{ y: 0 }}
          transition={{ duration: animationTokens.duration.medium / 1000, ease: [0.22, 1, 0.36, 1] }}
        >
          <GradientText
            gradient={{
              colors:
                count === 0
                  ? [theme.colors.status.success, theme.colors.status.success]
                  : extractGradientColors(
                      theme.gradients.prizeYellow || theme.gradients.ballMain,
                      [theme.colors.game.ball.primary, theme.colors.game.ball.primary]
                    ),
              angle: 135,
            }}
            className="text-9xl font-black"
          >
            {displayText}
          </GradientText>
        </AnimatedDiv>

        {/* Particle burst */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (360 / 8) * i;
          const radian = (angle * Math.PI) / 180;
          const distance = spacingTokens[20];
          const x = Math.cos(radian) * distance;
          const y = Math.sin(radian) * distance;
          const particleSize = 12;

          return (
            <AnimatedDiv
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: `${particleSize}px`,
                height: `${particleSize}px`,
                left: `${COUNTDOWN_SIZE / 2 - particleSize / 2}px`,
                top: `${COUNTDOWN_SIZE / 2 - particleSize / 2}px`,
                background:
                  count === 0
                    ? `linear-gradient(135deg, ${theme.colors.status.success} 0%, transparent 70%)`
                    : `linear-gradient(135deg, ${theme.colors.game.ball.primary} 0%, transparent 70%)`,
                /* RN-compatible: removed boxShadow glow effect */
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{
                x,
                y,
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0.4],
              }}
              transition={{
                duration: animationTokens.duration.slower / 1000,
                delay: i * (animationTokens.duration.fastest / 1000),
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          );
        })}
      </AnimatedDiv>
    </AnimatedDiv>
  );
}
