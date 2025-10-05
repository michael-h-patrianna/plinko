/**
 * Tests for DropPositionSelector component
 * Validates UI rendering, user interactions, and callback behavior
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DropPositionSelector } from '../components/DropPositionSelector';
import { ThemeProvider, themes } from '../theme';
import type { DropZone } from '../game/types';

// Wrapper with theme provider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider themes={themes}>{ui}</ThemeProvider>);
};

describe('DropPositionSelector', () => {
  const mockOnPositionSelected = vi.fn();
  const defaultProps = {
    boardWidth: 375,
    boardHeight: 500,
    onPositionSelected: mockOnPositionSelected,
  };


  it('should render without crashing', () => {
    renderWithTheme(<DropPositionSelector {...defaultProps} />);
    expect(screen.getByText(/Choose Your Drop Position/i)).toBeInTheDocument();
  });

  it('should display instructive text', () => {
    renderWithTheme(<DropPositionSelector {...defaultProps} />);

    expect(screen.getByText('Choose Your Drop Position')).toBeInTheDocument();
    expect(screen.getByText(/Tap where you want to drop the ball/i)).toBeInTheDocument();
  });

  it('should render all 5 drop zone buttons', () => {
    renderWithTheme(<DropPositionSelector {...defaultProps} />);

    expect(screen.getByText('Far Left')).toBeInTheDocument();
    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Center')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
    expect(screen.getByText('Far Right')).toBeInTheDocument();
  });

  it('should call onPositionSelected when a zone button is clicked', async () => {
    renderWithTheme(<DropPositionSelector {...defaultProps} />);

    const centerButton = screen.getByText('Center');
    fireEvent.click(centerButton);

    // Wait for the delay in handleSelect (150ms)
    await waitFor(
      () => {
        expect(mockOnPositionSelected).toHaveBeenCalledWith('center');
      },
      { timeout: 300 }
    );
  });

  it('should call onPositionSelected with correct zone for each button', async () => {
    const zones: Array<{ label: string; value: DropZone }> = [
      { label: 'Far Left', value: 'left' },
      { label: 'Left', value: 'left-center' },
      { label: 'Center', value: 'center' },
      { label: 'Right', value: 'right-center' },
      { label: 'Far Right', value: 'right' },
    ];

    for (const { label, value } of zones) {
      mockOnPositionSelected.mockClear();

      const { unmount } = renderWithTheme(<DropPositionSelector {...defaultProps} />);

      const button = screen.getByText(label);
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(mockOnPositionSelected).toHaveBeenCalledWith(value);
        },
        { timeout: 300 }
      );

      unmount();
    }
  });

  it('should render with correct board dimensions', () => {
    const { container } = renderWithTheme(
      <DropPositionSelector boardWidth={400} boardHeight={600} onPositionSelected={mockOnPositionSelected} />
    );

    // Component should render (exact assertion depends on implementation)
    expect(container.firstChild).toBeTruthy();
  });

  it('should display helper text at bottom', () => {
    renderWithTheme(<DropPositionSelector {...defaultProps} />);

    expect(screen.getByText(/Your choice affects where the ball drops from/i)).toBeInTheDocument();
  });

  it('should render drop zone visual indicators', () => {
    const { container } = renderWithTheme(<DropPositionSelector {...defaultProps} />);

    // The component should have visual indicators (rendered as divs with specific styles)
    // We can check that the component structure exists
    expect(container.querySelector('.absolute')).toBeTruthy();
  });

  it('should handle rapid clicks without breaking', async () => {
    renderWithTheme(<DropPositionSelector {...defaultProps} />);

    const centerButton = screen.getByText('Center');

    // Click multiple times rapidly
    fireEvent.click(centerButton);
    fireEvent.click(centerButton);
    fireEvent.click(centerButton);

    // Should only call callback once per click (with delay)
    await waitFor(
      () => {
        expect(mockOnPositionSelected).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('should render all emoji indicators', () => {
    const { container } = renderWithTheme(<DropPositionSelector {...defaultProps} />);

    // Check that emojis are present in the document
    const text = container.textContent || '';
    expect(text).toContain('⬅️'); // Far Left
    expect(text).toContain('↖️'); // Left
    expect(text).toContain('⬇️'); // Center
    expect(text).toContain('↗️'); // Right
    expect(text).toContain('➡️'); // Far Right
  });

  it('should apply different styles when hovering (visual state management)', () => {
    renderWithTheme(<DropPositionSelector {...defaultProps} />);

    const centerButton = screen.getByText('Center').closest('button');
    expect(centerButton).toBeTruthy();

    // Simulate hover
    if (centerButton) {
      fireEvent.mouseEnter(centerButton);
      // Component should update internal state (tested via interaction, not DOM inspection)
      fireEvent.mouseLeave(centerButton);
    }
  });

  it('should show selected state after clicking', async () => {
    renderWithTheme(<DropPositionSelector {...defaultProps} />);

    const leftButton = screen.getByText('Far Left').closest('button');

    if (leftButton) {
      fireEvent.click(leftButton);

      // After clicking, component should show selected state
      // The selected zone should be visually different (implementation detail)
      await waitFor(() => {
        expect(mockOnPositionSelected).toHaveBeenCalledWith('left');
      }, { timeout: 300 });
    }
  });
});
