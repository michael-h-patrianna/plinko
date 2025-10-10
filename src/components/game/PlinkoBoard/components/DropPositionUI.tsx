/**
 * DropPositionUI component - renders drop position selection interface
 * Shows ball launchers at different positions and control buttons
 */

import { memo } from 'react';
import { BallLauncher } from '../../BallLauncher';
import { DropPositionControls } from '../../../controls/DropPositionSelector';
import { DROP_ZONE_POSITIONS, type DropZone, PHYSICS } from '@game/boardGeometry';

interface DropPositionUIProps {
  isSelectingPosition: boolean;
  boardWidth: number;
  boardHeight: number;
  selectedDropIndex: number;
  onDropIndexChange: (index: number) => void;
  onPositionSelected?: (zone: DropZone) => void;
}

const DROP_ZONES: Array<{ zone: DropZone; position: number }> = [
  { zone: 'left', position: DROP_ZONE_POSITIONS.left },
  { zone: 'left-center', position: DROP_ZONE_POSITIONS['left-center'] },
  { zone: 'center', position: DROP_ZONE_POSITIONS.center },
  { zone: 'right-center', position: DROP_ZONE_POSITIONS['right-center'] },
  { zone: 'right', position: DROP_ZONE_POSITIONS.right },
];

export const DropPositionUI = memo(function DropPositionUI({
  isSelectingPosition,
  boardWidth,
  boardHeight,
  selectedDropIndex,
  onDropIndexChange,
  onPositionSelected,
}: DropPositionUIProps) {
  if (!isSelectingPosition) {
    return null;
  }

  const handlePrevious = () => {
    onDropIndexChange(selectedDropIndex === 0 ? DROP_ZONES.length - 1 : selectedDropIndex - 1);
  };

  const handleNext = () => {
    onDropIndexChange(selectedDropIndex === DROP_ZONES.length - 1 ? 0 : selectedDropIndex + 1);
  };

  const handleConfirm = () => {
    onPositionSelected?.(DROP_ZONES[selectedDropIndex]!.zone);
  };

  return (
    <>
      {/* Drop position launchers - 5 options when selecting */}
      {DROP_ZONES.map((dropZone, index) => (
        <BallLauncher
          key={dropZone.zone}
          x={boardWidth * dropZone.position}
          y={PHYSICS.BORDER_WIDTH + 10}
          isLaunching={false}
          isSelected={index === selectedDropIndex}
          onClick={() => onDropIndexChange(index)}
        />
      ))}

      {/* Controls - title, arrows, START button */}
      <DropPositionControls
        boardWidth={boardWidth}
        boardHeight={boardHeight}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onConfirm={handleConfirm}
      />
    </>
  );
});
