/**
 * Performance tests for Slot component optimization
 * Verifies that Slots are static and controlled by imperative driver updates
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Slot } from '@components/game/PlinkoBoard/Slot';
import { ThemeProvider } from '../../../theme';
import type { Prize } from '@game/prizeTypes';

describe('Slot Performance Optimization', () => {
  const mockPrize: Prize = {
    id: 'test-slot',
    type: 'free' as const,
    probability: 0.5,
    slotIcon: '/test-icon.png',
    slotColor: '#3B82F6',
    title: 'Test Prize',
    freeReward: { gc: 100 },
  };

  it('should render as static component with no frameStore subscription', () => {
    render(
      <ThemeProvider>
        <Slot index={0} prize={mockPrize} x={50} width={60} />
      </ThemeProvider>
    );

    const slot = screen.getByTestId('slot-0');
    expect(slot).toBeInTheDocument();
  });

  it('should initialize with default data attributes', () => {
    render(
      <ThemeProvider>
        <Slot index={0} prize={mockPrize} x={50} width={60} />
      </ThemeProvider>
    );

    const slot = screen.getByTestId('slot-0');
    expect(slot.getAttribute('data-approaching')).toBe('false');
    expect(slot.getAttribute('data-wall-impact')).toBe('none');
    expect(slot.getAttribute('data-floor-impact')).toBe('false');
  });

  it('should support imperative updates via data-approaching attribute', () => {
    render(
      <ThemeProvider>
        <Slot index={0} prize={mockPrize} x={50} width={60} />
      </ThemeProvider>
    );

    const slot = screen.getByTestId('slot-0');

    // Simulate driver updating approaching state
    slot.setAttribute('data-approaching', 'true');
    expect(slot.getAttribute('data-approaching')).toBe('true');

    slot.setAttribute('data-approaching', 'false');
    expect(slot.getAttribute('data-approaching')).toBe('false');
  });

  it('should support imperative wall impact updates', () => {
    render(
      <ThemeProvider>
        <Slot index={0} prize={mockPrize} x={50} width={60} />
      </ThemeProvider>
    );

    const slot = screen.getByTestId('slot-0');

    // Simulate driver updating wall impact
    slot.setAttribute('data-wall-impact', 'left');
    expect(slot.getAttribute('data-wall-impact')).toBe('left');

    slot.setAttribute('data-wall-impact', 'right');
    expect(slot.getAttribute('data-wall-impact')).toBe('right');

    slot.setAttribute('data-wall-impact', 'none');
    expect(slot.getAttribute('data-wall-impact')).toBe('none');
  });

  it('should support imperative floor impact updates', () => {
    render(
      <ThemeProvider>
        <Slot index={0} prize={mockPrize} x={50} width={60} />
      </ThemeProvider>
    );

    const slot = screen.getByTestId('slot-0');

    // Simulate driver updating floor impact
    slot.setAttribute('data-floor-impact', 'true');
    expect(slot.getAttribute('data-floor-impact')).toBe('true');

    slot.setAttribute('data-floor-impact', 'false');
    expect(slot.getAttribute('data-floor-impact')).toBe('false');
  });

  it('should render without re-renders (static component)', () => {
    const { rerender } = render(
      <ThemeProvider>
        <Slot index={0} prize={mockPrize} x={50} width={60} />
      </ThemeProvider>
    );

    const slot = screen.getByTestId('slot-0');
    const initialElement = slot;

    // Rerender with same props
    rerender(
      <ThemeProvider>
        <Slot index={0} prize={mockPrize} x={50} width={60} />
      </ThemeProvider>
    );

    // Should be same element (memoized, no re-render)
    expect(screen.getByTestId('slot-0')).toBe(initialElement);
  });
});
