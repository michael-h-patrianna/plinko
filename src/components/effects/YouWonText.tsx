/**
 * "You Won!" text animation adapted from animations library
 * Uses theme colors instead of hardcoded golden gradients
 * Premium text reveal with character-by-character animation
 */

import { useMemo } from 'react';
import { useTheme } from '../../theme';
import { useAnimationDriver } from '../../theme/animationDrivers';

export function YouWonText() {
  const driver = useAnimationDriver();
  const AnimatedDiv = driver.createAnimatedComponent('div');
  const AnimatedSpan = driver.createAnimatedComponent('span');

  const { theme } = useTheme();
  const mainText = 'YOU WON!';

  // Responsive font size - scales down for narrow viewports
  const fontSize = useMemo(() => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 375;
    if (viewportWidth < 360) {
      // Scale from 32px at 320px to 42px at 360px
      return Math.max(32, Math.min(42, 32 + (viewportWidth - 320) * 0.25));
    }
    return 48; // Default size for >= 360px
  }, []);

  const letterSpacing = useMemo(() => {
    return fontSize < 42 ? '2px' : '4px';
  }, [fontSize]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80px',
        padding: '20px',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60px',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Shadow layers for depth - Static positioning to prevent visible movement */}
        <AnimatedDiv
          style={{
            position: 'absolute',
            fontSize: `${fontSize}px`,
            fontWeight: 900,
            letterSpacing,
            color: 'rgba(0, 0, 0, 0.08)',
            zIndex: 0,
            whiteSpace: 'nowrap',
            transform: 'translateY(6px)',
          }}
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{
            opacity: 0.2,
            scale: 1,
          }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {mainText}
        </AnimatedDiv>

        <AnimatedDiv
          style={{
            position: 'absolute',
            fontSize: `${fontSize}px`,
            fontWeight: 900,
            letterSpacing,
            color: 'rgba(0, 0, 0, 0.15)',
            zIndex: 1,
            whiteSpace: 'nowrap',
            transform: 'translateY(3px)',
          }}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{
            opacity: 0.3,
            scale: 1,
          }}
          transition={{
            duration: 0.45,
            delay: 0.05,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {mainText}
        </AnimatedDiv>

        {/* Main text with character animation */}
        <AnimatedDiv
          style={{
            position: 'relative',
            fontSize: `${fontSize}px`,
            fontWeight: 900,
            letterSpacing,
            zIndex: 3,
            whiteSpace: 'nowrap',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {mainText.split('').map((char, index) => (
            <AnimatedSpan
              key={index}
              style={{
                display: 'inline-block',
                transformOrigin: 'center center',
                position: 'relative',
              }}
              initial={{
                opacity: 0,
                y: 30,
                scale: 0.5,
                rotate: -90, // Using rotate instead of rotateY for better RN compatibility
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                rotate: 0,
              }}
              transition={{
                duration: 0.6,
                delay: 0.1 + index * 0.04,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  position: 'relative',
                  color: theme.colors.primary.light,
                }}
              >
                {char === ' ' ? '\u00A0' : char}

                {/* Character glow burst - Cross-platform: linear gradient instead of radial */}
                <AnimatedSpan
                  style={{
                    position: 'absolute',
                    inset: '-8px',
                    background: `linear-gradient(135deg, ${theme.colors.primary.main}33 0%, ${theme.colors.primary.main}22 40%, transparent 80%)`,
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: -1,
                  }}
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: [0, 1, 0.3],
                    scale: [0.8, 1.4, 1],
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 0.5 + index * 0.04,
                    times: [0, 0.3, 1],
                    ease: 'easeOut',
                  }}
                />
              </span>
            </AnimatedSpan>
          ))}
        </AnimatedDiv>
      </div>
    </div>
  );
}
