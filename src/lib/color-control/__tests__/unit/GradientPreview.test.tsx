import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { GradientPreview } from '../../GradientPreview';
import { render, screen } from '../testUtils';

describe('GradientPreview', () => {
  const mockGradient = {
    angle: 90,
    stops: [
      { id: '1', color: '#667eea', position: 0 },
      { id: '2', color: '#764ba2', position: 100 },
    ],
  };

  const defaultProps = {
    gradient: mockGradient,
    selectedStopId: null,
    onSelectStop: vi.fn(),
    onAddStop: vi.fn(),
    onMoveStop: vi.fn(),
    onDeleteStop: vi.fn(),
    canAddStop: true,
    canDeleteStop: true,
  };

  it('should render gradient preview', () => {
    render(<GradientPreview {...defaultProps} />);

    expect(screen.getByRole('img', { name: /gradient/i })).toBeInTheDocument();
  });

  it('should render color stop markers', () => {
    render(<GradientPreview {...defaultProps} />);

    const markers = screen.getAllByRole('slider', { name: /color stop/i });
    expect(markers.length).toBe(2);
  });

  it('should call onAddStop when bar is double-clicked', async () => {
    const user = userEvent.setup();
    const handleAddStop = vi.fn();

    render(<GradientPreview {...defaultProps} onAddStop={handleAddStop} />);

    // Get the preview container and double-click it
    const preview = screen.getByRole('img');
    await user.dblClick(preview);

    expect(handleAddStop).toHaveBeenCalled();
  });

  it('should call onSelectStop when marker is clicked', async () => {
    const user = userEvent.setup();
    const handleSelectStop = vi.fn();

    render(<GradientPreview {...defaultProps} onSelectStop={handleSelectStop} />);

    const markers = screen.getAllByRole('slider', { name: /color stop/i });
    await user.click(markers[0]);

    expect(handleSelectStop).toHaveBeenCalled();
  });

  it('should not add stop when canAddStop is false', async () => {
    const user = userEvent.setup();
    const handleAddStop = vi.fn();

    render(<GradientPreview {...defaultProps} canAddStop={false} onAddStop={handleAddStop} />);

    const preview = screen.getByRole('img');
    await user.dblClick(preview);

    expect(handleAddStop).not.toHaveBeenCalled();
  });

  it('should render with gradient background', () => {
    const { container } = render(<GradientPreview {...defaultProps} />);

    // Check that the gradient preview exists
    const preview = container.querySelector('.gradient-preview-bar');
    expect(preview).toBeTruthy();
  });
});
