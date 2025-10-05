/**
 * Hook for managing drop position selection state and rendering
 */

import { useState } from 'react';
import type { DropZone } from '../game/types';
import { DropPositionChamber } from './DropPositionChamber';
import { DropPositionControls } from './DropPositionControls';

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
 * Main selector hook - manages state and renders chambers + controls
 * This hook returns individual elements to be rendered in PlinkoBoard
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
