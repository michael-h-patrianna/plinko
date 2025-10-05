/**
 * Component tests for PlinkoBoard
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from './testUtils';
import { PlinkoBoard } from '../components/PlinkoBoard/PlinkoBoard';
import { MOCK_PRIZES } from '../config/prizeTable';

describe('PlinkoBoard Component', () => {
  const defaultProps = {
    prizes: MOCK_PRIZES,
    selectedIndex: 2,
    currentTrajectoryPoint: null,
    boardWidth: 375,
    boardHeight: 500,
    pegRows: 10,
    ballPosition: null,
    ballState: 'idle' as const
  };

  it('should render board', () => {
    render(<PlinkoBoard {...defaultProps} />);
    expect(screen.getByTestId('plinko-board')).toBeInTheDocument();
  });

  it('should render correct number of pegs', () => {
    const { container } = render(<PlinkoBoard {...defaultProps} />);

    // With staggered layout: even rows have slotCount+1 pegs, odd rows have slotCount pegs
    // With 10 rows (0-9): 5 even rows (0,2,4,6,8) and 5 odd rows (1,3,5,7,9)
    const slotCount = MOCK_PRIZES.length;
    const evenRows = Math.ceil(defaultProps.pegRows / 2);
    const oddRows = Math.floor(defaultProps.pegRows / 2);
    const expectedPegs = (evenRows * (slotCount + 1)) + (oddRows * slotCount);
    const pegs = container.querySelectorAll('[data-testid^="peg-"]');
    expect(pegs.length).toBe(expectedPegs);
  });

  it('should render correct number of slots', () => {
    render(<PlinkoBoard {...defaultProps} />);

    const slots = screen.getAllByTestId(/^slot-/);
    expect(slots.length).toBe(MOCK_PRIZES.length);
  });

  it('should highlight winning slot', () => {
    render(<PlinkoBoard {...defaultProps} />);

    const winningSlot = screen.getByTestId(`slot-${defaultProps.selectedIndex}`);
    expect(winningSlot).toHaveAttribute('data-active');
  });

  it('should not highlight non-winning slots', () => {
    render(<PlinkoBoard {...defaultProps} />);

    for (let i = 0; i < MOCK_PRIZES.length; i++) {
      if (i !== defaultProps.selectedIndex) {
        const slot = screen.getByTestId(`slot-${i}`);
        const dataActive = slot.getAttribute('data-active');
        expect(dataActive === 'false' || dataActive === '').toBe(true);
      }
    }
  });

  it('should render prize labels in slots', () => {
    render(<PlinkoBoard {...defaultProps} />);

    for (const prize of MOCK_PRIZES) {
      expect(screen.getByText(prize.label)).toBeInTheDocument();
    }
  });
});
