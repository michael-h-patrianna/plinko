/**
 * UI controls component - title and navigation buttons
 */

import { motion } from 'framer-motion';
import { useTheme } from '../theme';
import arrowLeftImg from '../assets/arrow-left.png';
import arrowRightImg from '../assets/arrow-right.png';
import { ThemedButton } from './ThemedButton';

interface DropPositionControlsProps {
  boardWidth: number;
  boardHeight: number;
  onPrevious: () => void;
  onNext: () => void;
  onConfirm: () => void;
}

export function DropPositionControls({
  onPrevious,
  onNext,
  onConfirm,
}: DropPositionControlsProps) {
  const { theme } = useTheme();

  return (
    <motion.div
      className="absolute"
      style={{
        left: 0,
        top: '25%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        zIndex: 30,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <motion.h2
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: theme.colors.text.primary,
            textShadow: `0 2px 8px ${theme.colors.shadows.default}80, 0 0 16px ${theme.colors.game.ball.primary}40`,
            marginBottom: '8px',
          }}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        >
          SELECT DROP POSITION
        </motion.h2>
        <motion.p
          style={{
            fontSize: '14px',
            color: theme.colors.text.secondary,
            opacity: 0.8,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          Tap chamber or use arrows
        </motion.p>
      </div>

      {/* Buttons */}
      <motion.div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Left arrow */}
        <ThemedButton
          onClick={onPrevious}
          style={{
            width: '48px',
            height: '48px',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${theme.colors.surface.elevated}e6`,
            border: `2px solid ${theme.colors.game.ball.primary}60`,
            boxShadow: `0 4px 12px ${theme.colors.shadows.default}60, 0 0 20px ${theme.colors.game.ball.primary}30`,
          }}
        >
          <img src={arrowLeftImg} alt="Previous" style={{ width: '24px', height: '24px' }} />
        </ThemedButton>

        {/* Start button */}
        <ThemedButton
          onClick={onConfirm}
          style={{
            minWidth: '120px',
            height: '56px',
            fontSize: '18px',
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.colors.game.ball.primary} 0%, ${theme.colors.game.ball.secondary} 100%)`,
            border: `2px solid ${theme.colors.game.ball.highlight}80`,
            boxShadow: `0 6px 20px ${theme.colors.game.ball.primary}80, 0 0 30px ${theme.colors.game.ball.primary}50`,
          }}
        >
          START
        </ThemedButton>

        {/* Right arrow */}
        <ThemedButton
          onClick={onNext}
          style={{
            width: '48px',
            height: '48px',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${theme.colors.surface.elevated}e6`,
            border: `2px solid ${theme.colors.game.ball.primary}60`,
            boxShadow: `0 4px 12px ${theme.colors.shadows.default}60, 0 0 20px ${theme.colors.game.ball.primary}30`,
          }}
        >
          <img src={arrowRightImg} alt="Next" style={{ width: '24px', height: '24px' }} />
        </ThemedButton>
      </motion.div>
    </motion.div>
  );
}
