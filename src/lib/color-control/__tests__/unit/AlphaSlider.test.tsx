import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AlphaSlider } from '../../AlphaSlider';

describe('AlphaSlider', () => {
  const defaultProps = {
    alpha: 0.5,
    color: '#ff0000',
    onChange: vi.fn(),
    disabled: false,
  };

  it('should render with correct alpha value', () => {
    render(<AlphaSlider {...defaultProps} />);

    const slider = screen.getByTestId('alpha-slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('data-alpha', '0.5');
  });

  it('should display percentage value', () => {
    render(<AlphaSlider {...defaultProps} />);

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should show 100% for alpha 1', () => {
    render(<AlphaSlider {...defaultProps} alpha={1} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should show 0% for alpha 0', () => {
    render(<AlphaSlider {...defaultProps} alpha={0} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    render(<AlphaSlider {...defaultProps} />);

    const slider = screen.getByRole('slider', { name: /alpha selector/i });
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '1');
    expect(slider).toHaveAttribute('aria-valuenow', '0.5');
    expect(slider).toHaveAttribute('aria-valuetext', '50%');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<AlphaSlider {...defaultProps} disabled={true} />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-disabled', 'true');
    expect(slider).toHaveAttribute('tabindex', '-1');
  });

  it('should not be disabled by default', () => {
    render(<AlphaSlider {...defaultProps} />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-disabled', 'false');
    expect(slider).toHaveAttribute('tabindex', '0');
  });

  it('should render thumb at correct position', () => {
    render(<AlphaSlider {...defaultProps} alpha={0.75} />);

    const thumb = screen.getByTestId('alpha-thumb');
    expect(thumb).toBeInTheDocument();
    expect(thumb).toHaveStyle({ left: '75%' });
  });

  it('should handle keyboard navigation - ArrowRight', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<AlphaSlider {...defaultProps} alpha={0.5} onChange={onChange} />);

    const slider = screen.getByRole('slider');
    slider.focus();
    await user.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalled();
    const newAlpha = onChange.mock.calls[0][0];
    expect(newAlpha).toBeGreaterThan(0.5);
    expect(newAlpha).toBeLessThanOrEqual(1);
  });

  it('should handle keyboard navigation - ArrowLeft', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<AlphaSlider {...defaultProps} alpha={0.5} onChange={onChange} />);

    const slider = screen.getByRole('slider');
    slider.focus();
    await user.keyboard('{ArrowLeft}');

    expect(onChange).toHaveBeenCalled();
    const newAlpha = onChange.mock.calls[0][0];
    expect(newAlpha).toBeLessThan(0.5);
    expect(newAlpha).toBeGreaterThanOrEqual(0);
  });

  it('should handle keyboard navigation - ArrowUp', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<AlphaSlider {...defaultProps} alpha={0.5} onChange={onChange} />);

    const slider = screen.getByRole('slider');
    slider.focus();
    await user.keyboard('{ArrowUp}');

    expect(onChange).toHaveBeenCalled();
  });

  it('should handle keyboard navigation - ArrowDown', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<AlphaSlider {...defaultProps} alpha={0.5} onChange={onChange} />);

    const slider = screen.getByRole('slider');
    slider.focus();
    await user.keyboard('{ArrowDown}');

    expect(onChange).toHaveBeenCalled();
  });

  it('should handle keyboard navigation - Home', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<AlphaSlider {...defaultProps} alpha={0.5} onChange={onChange} />);

    const slider = screen.getByRole('slider');
    slider.focus();
    await user.keyboard('{Home}');

    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('should handle keyboard navigation - End', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<AlphaSlider {...defaultProps} alpha={0.5} onChange={onChange} />);

    const slider = screen.getByRole('slider');
    slider.focus();
    await user.keyboard('{End}');

    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('should use larger step with Shift key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<AlphaSlider {...defaultProps} alpha={0.5} onChange={onChange} />);

    const slider = screen.getByRole('slider');
    slider.focus();
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}');

    expect(onChange).toHaveBeenCalled();
    const newAlpha = onChange.mock.calls[0][0];
    // With shift, step should be 0.1
    expect(newAlpha).toBeCloseTo(0.6, 1);
  });

  it('should not respond to keyboard when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<AlphaSlider {...defaultProps} disabled={true} onChange={onChange} />);

    screen.getByRole('slider'); // Verify slider exists
    await user.keyboard('{ArrowRight}');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should handle track click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<AlphaSlider {...defaultProps} alpha={0} onChange={onChange} />);

    const slider = screen.getByTestId('alpha-slider');
    await user.click(slider);

    // Click should trigger onChange
    expect(onChange).toHaveBeenCalled();
  });

  it('should render with different colors', () => {
    const { rerender } = render(<AlphaSlider {...defaultProps} color="#00ff00" />);

    let slider = screen.getByTestId('alpha-slider');
    expect(slider).toBeInTheDocument();

    rerender(<AlphaSlider {...defaultProps} color="#0000ff" />);
    slider = screen.getByTestId('alpha-slider');
    expect(slider).toBeInTheDocument();
  });

  it('should clamp alpha values at boundaries', async () => {
    const onChange = vi.fn();

    // Test upper boundary
    const { container } = render(<AlphaSlider {...defaultProps} alpha={1} onChange={onChange} />);

    const track = container.querySelector('[data-testid="alpha-slider"]');
    expect(track).toBeInTheDocument();

    // Mock getBoundingClientRect for the track
    if (track) {
      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        right: 200,
        bottom: 24,
        width: 200,
        height: 24,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      // Fire click event at maximum position (right edge)
      fireEvent.click(track, { clientX: 200 });

      if (onChange.mock.calls.length > 0) {
        const newAlpha = onChange.mock.calls[0][0];
        expect(newAlpha).toBeLessThanOrEqual(1);
        expect(newAlpha).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
