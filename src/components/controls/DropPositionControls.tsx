/**
 * UI controls component - title and navigation buttons
 */

import arrowLeftImg from '../../assets/arrow-left.png';
import arrowRightImg from '../../assets/arrow-right.png';
import { useTheme } from '../../theme';
import { ThemedButton } from './ThemedButton';
import { useAnimation } from '../../theme/animationDrivers/useAnimation';

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
  const { AnimatedDiv, AnimatedH2, AnimatedP } = useAnimation();
  const { theme } = useTheme();

  return (
    <AnimatedDiv
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
        <AnimatedH2
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: theme.colors.text.primary,
            /* RN-compatible: removed textShadow */
            marginBottom: '8px',
          }}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        >
          SELECT DROP POSITION
        </AnimatedH2>
        <AnimatedP
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
        </AnimatedP>
      </div>

      {/* Buttons */}
      <AnimatedDiv
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
          variant="secondary"
          style={{
            width: '48px',
            height: '48px',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
          }}
        >
          START
        </ThemedButton>

        {/* Right arrow */}
        <ThemedButton
          onClick={onNext}
          variant="secondary"
          style={{
            width: '48px',
            height: '48px',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img src={arrowRightImg} alt="Next" style={{ width: '24px', height: '24px' }} />
        </ThemedButton>
      </AnimatedDiv>
    </AnimatedDiv>
  );
}
