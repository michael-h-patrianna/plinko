import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AngleControl } from '../../AngleControl';
import { render, screen } from '../testUtils';

describe('AngleControl', () => {
  it('should render angle input', () => {
    render(<AngleControl angle={90} onChange={() => {}} />);

    const input = screen.getByRole('spinbutton', { name: /angle/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(90);
  });

  it('should call onChange when angle is modified', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<AngleControl angle={90} onChange={handleChange} />);

    const input = screen.getByRole('spinbutton', { name: /angle/i });
    await user.clear(input);
    await user.type(input, '180');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should display degree symbol', () => {
    render(<AngleControl angle={45} onChange={() => {}} />);

    expect(screen.getByText('°')).toBeInTheDocument();
  });

  it('should handle 0 degree angle', () => {
    render(<AngleControl angle={0} onChange={() => {}} />);

    const input = screen.getByRole('spinbutton', { name: /angle/i });
    expect(input).toHaveValue(0);
  });

  it('should handle 360 degree angle', () => {
    render(<AngleControl angle={360} onChange={() => {}} />);

    const input = screen.getByRole('spinbutton', { name: /angle/i });
    expect(input).toHaveValue(360);
  });

  it('should update when angle prop changes', () => {
    const { rerender } = render(
      <AngleControl angle={90} onChange={() => {}} />
    );

    rerender(<AngleControl angle={180} onChange={() => {}} />);

    const input = screen.getByRole('spinbutton', { name: /angle/i });
    expect(input).toHaveValue(180);
  });

  it('should have accessible label', () => {
    render(<AngleControl angle={90} onChange={() => {}} />);

    const input = screen.getByRole('spinbutton', { name: /angle/i });
    expect(input).toHaveAccessibleName();
  });
});
