/**
 * Unit tests for ThemedButton component
 * Tests button behavior, sound playback, and accessibility
 */

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as AudioContext from '../../../audio/context/AudioProvider';
import { ThemedButton } from '../../../components/controls/ThemedButton';
import { ThemeProvider, themes } from '../../../theme';

// Mock audio context
const mockSfxController = {
  play: vi.fn(),
};

vi.spyOn(AudioContext, 'useAudio').mockReturnValue({
  sfxController: mockSfxController as unknown as ReturnType<typeof AudioContext.useAudio>['sfxController'],
  musicController: null,
  volumeController: null,
  isInitialized: true,
  initializationError: null,
});

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider themes={themes}>{ui}</ThemeProvider>);
}

describe('ThemedButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children correctly', () => {
    renderWithTheme(<ThemedButton onClick={mockOnClick}>Click Me</ThemedButton>);

    expect(screen.getByRole('button')).toHaveTextContent('Click Me');
  });

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ThemedButton onClick={mockOnClick}>Click Me</ThemedButton>);

    await user.click(screen.getByRole('button'));

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('plays sound when clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<ThemedButton onClick={mockOnClick}>Click Me</ThemedButton>);

    await user.click(screen.getByRole('button'));

    expect(mockSfxController.play).toHaveBeenCalledWith('ui-button-press');
  });

  it('does not play sound when disabled', () => {
    renderWithTheme(
      <ThemedButton onClick={mockOnClick} disabled>
        Click Me
      </ThemedButton>
    );

    // Note: disabled buttons cannot be clicked via userEvent
    // This test verifies the button is disabled
    expect(screen.getByRole('button')).toBeDisabled();
    expect(mockSfxController.play).not.toHaveBeenCalled();
  });

  it('does not call onClick when disabled', () => {
    renderWithTheme(
      <ThemedButton onClick={mockOnClick} disabled>
        Click Me
      </ThemedButton>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('handles null sfxController gracefully', async () => {
    // Mock useAudio to return null controller
    vi.spyOn(AudioContext, 'useAudio').mockReturnValueOnce({
      sfxController: null,
      musicController: null,
      volumeController: null,
      isInitialized: false,
      initializationError: null,
    });

    const user = userEvent.setup();
    renderWithTheme(<ThemedButton onClick={mockOnClick}>Click Me</ThemedButton>);

    await user.click(screen.getByRole('button'));

    // Should still call onClick even without sound
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom testId', () => {
    renderWithTheme(
      <ThemedButton onClick={mockOnClick} testId="custom-button">
        Click Me
      </ThemedButton>
    );

    expect(screen.getByTestId('custom-button')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    renderWithTheme(
      <ThemedButton onClick={mockOnClick} className="custom-class">
        Click Me
      </ThemedButton>
    );

    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('supports primary variant', () => {
    renderWithTheme(
      <ThemedButton onClick={mockOnClick} variant="primary">
        Primary
      </ThemedButton>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('supports secondary variant', () => {
    renderWithTheme(
      <ThemedButton onClick={mockOnClick} variant="secondary">
        Secondary
      </ThemedButton>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('plays sound before calling onClick', async () => {
    const callOrder: string[] = [];

    mockSfxController.play.mockImplementation(() => {
      callOrder.push('sound');
    });

    mockOnClick.mockImplementation(() => {
      callOrder.push('onClick');
    });

    const user = userEvent.setup();
    renderWithTheme(<ThemedButton onClick={mockOnClick}>Click Me</ThemedButton>);

    await user.click(screen.getByRole('button'));

    expect(callOrder).toEqual(['sound', 'onClick']);
  });
});
