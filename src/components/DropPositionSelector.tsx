/**
 * Drop position selector - uses actual BallLauncher chamber design
 * Chambers are rendered directly in board container for perfect alignment
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import type { DropZone } from '../game/types';
import { useTheme } from '../theme';
import arrowLeftImg from '../assets/arrow-left.png';
import arrowRightImg from '../assets/arrow-right.png';
import { ThemedButton } from './ThemedButton';
import { BallLauncher } from './BallLauncher';

interface DropPositionChamberProps {
  x: number;
  y: number;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Individual chamber component - uses BallLauncher component directly
 * Selected launcher is scaled up and has enhanced idle animation
 */
export function DropPositionChamber({ x, y, isSelected, onClick }: DropPositionChamberProps) {
  return (
    <motion.div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        position: 'relative',
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
          : { duration: 0.3 },
      }}
    >
      <BallLauncher x={x} y={y} isLaunching={false} />
    </motion.div>
  );
}

interface DropPositionControlsProps {
  boardWidth: number;
  boardHeight: number;
  onPrevious: () => void;
  onNext: () => void;
  onConfirm: () => void;
}

/**
 * UI controls component - title and navigation buttons
 */
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
          variant="outline"
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
          variant="primary"
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
          variant="outline"
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

interface DropPositionSelectorProps {
  boardWidth: number;
  boardHeight: number;
  launcherY: number;
  onPositionSelected: (zone: DropZone) => void;
}

const DROP_ZONES: Array<{ zone: DropZone; position: number }> = [
  { zone: 'left', position: 0.1 },
  { zone: 'left-center', position: 0.3 },
  { zone: 'center', position: 0.5 },
  { zone: 'right-center', position: 0.7 },
  { zone: 'right', position: 0.9 },
];

/**
 * Main selector component - manages state and renders chambers + controls
 * This component returns individual elements to be rendered in PlinkoBoard
 */
export function useDropPositionSelector({
  boardWidth,
  boardHeight,
  launcherY,
  onPositionSelected,
}: DropPositionSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(2);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
  };

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? DROP_ZONES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === DROP_ZONES.length - 1 ? 0 : prev + 1));
  };

  const handleConfirm = () => {
    onPositionSelected(DROP_ZONES[selectedIndex]!.zone);
  };

  const chambers = DROP_ZONES.map((dropZone, index) => (
    <DropPositionChamber
      key={dropZone.zone}
      x={boardWidth * dropZone.position}
      y={launcherY}
      isSelected={index === selectedIndex}
      onClick={() => handleSelect(index)}
    />
  ));

  const controls = (
    <DropPositionControls
      boardWidth={boardWidth}
      boardHeight={boardHeight}
      onPrevious={handlePrevious}
      onNext={handleNext}
      onConfirm={handleConfirm}
    />
  );

  return { chambers, controls };
}
