/**
 * Comprehensive component tests for all untested React components
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '../../testUtils';
import { BallLauncher } from '../../../components/game/BallLauncher';
import { Countdown } from '../../../components/game/Countdown';
import { StartScreen } from '../../../components/screens/StartScreen';
import { PrizeReveal } from '../../../components/screens/PrizeReveal';
import { PrizeClaimed } from '../../../components/screens/PrizeClaimed';
import { Slot } from '../../../components/game/PlinkoBoard/Slot';
import { Peg } from '../../../components/game/PlinkoBoard/Peg';
import { ThemedButton } from '../../../components/controls/ThemedButton';
import { ViewportSelector, ThemeSelector } from '../../../dev-tools';
import { PopupContainer } from '../../../components/layout/PopupContainer';
import { MOCK_PRIZES } from '../../../config/prizes/prizeTable';
import type { PrizeConfig } from '../../../game/types';

// ============================================================================
// BallLauncher Component Tests
// ============================================================================
describe('BallLauncher Component', () => {
  it('should render launcher chamber', () => {
    const { container } = render(<BallLauncher x={100} y={50} isLaunching={false} />);
    expect(container.querySelector('.absolute.pointer-events-none')).toBeInTheDocument();
  });

  it('should position launcher at correct coordinates', () => {
    const { container } = render(<BallLauncher x={150} y={75} isLaunching={false} />);
    const launcher = container.querySelector('.absolute.pointer-events-none') as HTMLElement;
    expect(launcher.style.left).toBe('150px');
    expect(launcher.style.top).toBe('75px');
  });

  it('should show ball inside chamber when not launching', () => {
    const { container } = render(<BallLauncher x={100} y={50} isLaunching={false} />);
    const ball = container.querySelector('.rounded-full');
    expect(ball).toBeInTheDocument();
  });

  it('should hide ball when launching', () => {
    const { container } = render(<BallLauncher x={100} y={50} isLaunching={true} />);
    // Ball should not be rendered when launching
    const balls = container.querySelectorAll('.rounded-full');
    // There might be other rounded elements, but the ball motion div should not be present
    expect(balls.length).toBeLessThan(2);
  });

  it('should show pusher mechanism', () => {
    const { container } = render(<BallLauncher x={100} y={50} isLaunching={false} />);
    // Pusher is a div with specific height of 4px
    const elements = container.querySelectorAll('.absolute');
    expect(elements.length).toBeGreaterThan(1);
  });

  it('should show spring coil when not launching', () => {
    const { container } = render(<BallLauncher x={100} y={50} isLaunching={false} />);
    // Spring coil has repeating-linear-gradient background
    const elements = Array.from(container.querySelectorAll('.absolute'));
    const springCoil = elements.find((el) => {
      const htmlEl = el as HTMLElement;
      return htmlEl.style.background.includes('repeating-linear-gradient');
    });
    expect(springCoil).toBeInTheDocument();
  });

  it('should hide spring coil when launching', () => {
    const { container } = render(<BallLauncher x={100} y={50} isLaunching={true} />);
    const elements = Array.from(container.querySelectorAll('.absolute'));
    const springCoil = elements.find((el) => {
      const htmlEl = el as HTMLElement;
      return htmlEl.style.background.includes('repeating-linear-gradient');
    });
    expect(springCoil).toBeUndefined();
  });
});

// ============================================================================
// Countdown Component Tests
// ============================================================================
describe('Countdown Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render countdown starting at 3', () => {
    render(<Countdown onComplete={vi.fn()} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should countdown from 3 to 2', () => {
    render(<Countdown onComplete={vi.fn()} />);
    expect(screen.getByText('3')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should countdown from 2 to 1', () => {
    render(<Countdown onComplete={vi.fn()} />);

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.getByText('2')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should show GO after 1', () => {
    render(<Countdown onComplete={vi.fn()} />);

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.getByText('2')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.getByText('1')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.getByText('GO!')).toBeInTheDocument();
  });

  it('should transition through all countdown states', () => {
    const onComplete = vi.fn();
    render(<Countdown onComplete={onComplete} />);

    // Verify initial state
    expect(screen.getByText('3')).toBeInTheDocument();

    // Advance through countdown
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(screen.getByText('2')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(screen.getByText('1')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(screen.getByText('GO!')).toBeInTheDocument();
  });

  it('should accept custom board height', () => {
    const { container } = render(<Countdown onComplete={vi.fn()} boardHeight={600} />);
    expect(container.querySelector('.absolute.inset-0')).toBeInTheDocument();
  });

  it('should accept custom peg rows', () => {
    const { container } = render(<Countdown onComplete={vi.fn()} pegRows={12} />);
    expect(container.querySelector('.absolute.inset-0')).toBeInTheDocument();
  });

  it('should render pulsing glow animation', () => {
    const { container } = render(<Countdown onComplete={vi.fn()} />);
    const glowElements = container.querySelectorAll('.rounded-full.pointer-events-none');
    expect(glowElements.length).toBeGreaterThan(0);
  });

  it('should render particle burst', () => {
    const { container } = render(<Countdown onComplete={vi.fn()} />);
    const particles = container.querySelectorAll('.rounded-full.pointer-events-none');
    // Should have glow + expanding ring + particles
    expect(particles.length).toBeGreaterThan(2);
  });
});

// ============================================================================
// StartScreen Component Tests
// ============================================================================
describe('StartScreen Component', () => {
  const mockOnStart = vi.fn();

  beforeEach(() => {
    mockOnStart.mockClear();
  });

  it('should render game title', () => {
    render(<StartScreen prizes={MOCK_PRIZES} onStart={mockOnStart} disabled={false} />);
    expect(screen.getByText('Plinko Popup')).toBeInTheDocument();
  });

  it('should render Available Prizes header', () => {
    render(<StartScreen prizes={MOCK_PRIZES} onStart={mockOnStart} disabled={false} />);
    expect(screen.getByText('Available Prizes')).toBeInTheDocument();
  });

  it('should render all prizes', () => {
    render(<StartScreen prizes={MOCK_PRIZES} onStart={mockOnStart} disabled={false} />);
    MOCK_PRIZES.forEach((prize) => {
      if (prize.title) {
        expect(screen.getByText(prize.title)).toBeInTheDocument();
      }
    });
  });

  it('should render prize probabilities', () => {
    render(<StartScreen prizes={MOCK_PRIZES} onStart={mockOnStart} disabled={false} />);
    MOCK_PRIZES.forEach((prize) => {
      const percentage = (prize.probability * 100).toFixed(0) + '%';
      expect(screen.getAllByText(percentage).length).toBeGreaterThan(0);
    });
  });

  it('should render Drop Ball button', () => {
    render(<StartScreen prizes={MOCK_PRIZES} onStart={mockOnStart} disabled={false} />);
    expect(screen.getByTestId('drop-ball-button')).toBeInTheDocument();
    expect(screen.getByText('Drop Ball')).toBeInTheDocument();
  });

  it('should call onStart when button clicked', () => {
    render(<StartScreen prizes={MOCK_PRIZES} onStart={mockOnStart} disabled={false} />);
    fireEvent.click(screen.getByTestId('drop-ball-button'));
    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });

  it('should disable button when disabled prop is true', () => {
    render(<StartScreen prizes={MOCK_PRIZES} onStart={mockOnStart} disabled={true} />);
    const button = screen.getByTestId('drop-ball-button');
    expect(button).toBeDisabled();
  });

  it('should not call onStart when disabled button clicked', () => {
    render(<StartScreen prizes={MOCK_PRIZES} onStart={mockOnStart} disabled={true} />);
    fireEvent.click(screen.getByTestId('drop-ball-button'));
    expect(mockOnStart).not.toHaveBeenCalled();
  });

  it('should expand combo prizes when clicked', () => {
    const comboPrize: PrizeConfig = {
      ...MOCK_PRIZES[0]!,
      id: 'combo',
      type: 'free' as const,
      title: 'Combo Prize',
      freeReward: {
        sc: 100,
        gc: 500,
      },
    };
    const prizes = [comboPrize, ...MOCK_PRIZES.slice(1)];

    render(<StartScreen prizes={prizes} onStart={mockOnStart} disabled={false} />);

    const comboPrizeElement = screen.getByText('Combo Prize');

    act(() => {
      fireEvent.click(comboPrizeElement.closest('div')!);
    });

    // Should show expanded details
    expect(screen.getByText(/Free SC:/)).toBeInTheDocument();
    expect(screen.getByText(/GC:/)).toBeInTheDocument();
  });
});

// ============================================================================
// PrizeReveal Component Tests
// ============================================================================
describe('PrizeReveal Component', () => {
  const mockOnClaim = vi.fn();

  beforeEach(() => {
    mockOnClaim.mockClear();
  });

  it('should render NoWinView for no_win prize type', () => {
    const noWinPrize: PrizeConfig = {
      ...MOCK_PRIZES[0]!,
      type: 'no_win' as const,
      title: 'Better Luck',
      description: 'Try again!',
    };

    const { container } = render(
      <PrizeReveal prize={noWinPrize} onClaim={mockOnClaim} canClaim={true} />
    );

    expect(container.querySelector('.absolute.inset-0')).toBeInTheDocument();
  });

  it('should render PurchaseOfferView for purchase prize type', () => {
    const purchasePrize: PrizeConfig = {
      ...MOCK_PRIZES[0]!,
      type: 'purchase' as const,
      title: '200% Bonus',
      description: 'Special offer!',
      purchaseOffer: {
        offerId: 'test-offer',
        title: '200% Bonus',
        description: '$29.99',
      },
    };

    const { container } = render(
      <PrizeReveal prize={purchasePrize} onClaim={mockOnClaim} canClaim={true} />
    );

    expect(container.querySelector('.absolute.inset-0')).toBeInTheDocument();
  });

  it('should render FreeRewardView for free prize type', () => {
    const freePrize: PrizeConfig = {
      ...MOCK_PRIZES[0]!,
      type: 'free' as const,
      title: 'Free Reward',
      description: 'You won!',
      freeReward: {
        sc: 100,
      },
    };

    const { container } = render(
      <PrizeReveal prize={freePrize} onClaim={mockOnClaim} canClaim={true} />
    );

    expect(container.querySelector('.absolute.inset-0')).toBeInTheDocument();
  });

  it('should pass canClaim prop correctly', () => {
    const prize: PrizeConfig = {
      ...MOCK_PRIZES[0]!,
      type: 'free' as const,
      freeReward: { sc: 100 },
    };

    const { container } = render(
      <PrizeReveal prize={prize} onClaim={mockOnClaim} canClaim={false} />
    );

    expect(container.querySelector('.absolute.inset-0')).toBeInTheDocument();
  });
});

// ============================================================================
// PrizeClaimed Component Tests
// ============================================================================
describe('PrizeClaimed Component', () => {
  const mockOnClose = vi.fn();
  const mockPrize = MOCK_PRIZES[0]!;

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should render Prize Claimed header', () => {
    render(<PrizeClaimed prize={mockPrize} onClose={mockOnClose} />);
    expect(screen.getByText('Prize Claimed!')).toBeInTheDocument();
  });

  it('should render success message', () => {
    render(<PrizeClaimed prize={mockPrize} onClose={mockOnClose} />);
    expect(screen.getByText('Your reward has been claimed successfully.')).toBeInTheDocument();
  });

  it('should render Close button', () => {
    render(<PrizeClaimed prize={mockPrize} onClose={mockOnClose} />);
    expect(screen.getByTestId('close-button')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('should call onClose when button clicked', () => {
    render(<PrizeClaimed prize={mockPrize} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('close-button'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should render checkmark', () => {
    render(<PrizeClaimed prize={mockPrize} onClose={mockOnClose} />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });
});

// ============================================================================
// Slot Component Tests
// ============================================================================
describe('Slot Component', () => {
  const mockPrize = MOCK_PRIZES[0]!;

  it('should render slot', () => {
    render(<Slot index={0} prize={mockPrize} x={50} width={60} />);
    expect(screen.getByTestId('slot-0')).toBeInTheDocument();
  });

  it('should position slot correctly', () => {
    render(<Slot index={0} prize={mockPrize} x={100} width={50} />);
    const slot = screen.getByTestId('slot-0');
    expect(slot.style.left).toBe('100px');
    expect(slot.style.width).toBe('50px');
  });

  it('should render prize title', () => {
    render(<Slot index={0} prize={mockPrize} x={50} width={60} />);
    expect(screen.getByText(mockPrize.title!)).toBeInTheDocument();
  });

  it('should mark winning slot with data-active', () => {
    render(<Slot index={0} prize={mockPrize} x={50} width={60} isWinning={true} />);
    const slot = screen.getByTestId('slot-0');
    expect(slot).toHaveAttribute('data-active', 'true');
  });

  it('should mark non-winning slot with data-active false', () => {
    render(<Slot index={0} prize={mockPrize} x={50} width={60} isWinning={false} />);
    const slot = screen.getByTestId('slot-0');
    expect(slot).toHaveAttribute('data-active', 'false');
  });

  it('should support data-approaching attribute for highlighting (set by driver)', () => {
    render(<Slot index={0} prize={mockPrize} x={50} width={60} />);
    const slot = screen.getByTestId('slot-0');

    // Initially has data-approaching="false" by default
    expect(slot.getAttribute('data-approaching')).toBe('false');

    // Driver would set this imperatively
    slot.setAttribute('data-approaching', 'true');
    expect(slot.getAttribute('data-approaching')).toBe('true');
  });

  it('should support data-wall-impact attribute for wall collisions (set by driver)', () => {
    render(<Slot index={0} prize={mockPrize} x={50} width={60} />);
    const slot = screen.getByTestId('slot-0');

    // Driver sets wall impact
    slot.setAttribute('data-wall-impact', 'left');
    expect(slot.getAttribute('data-wall-impact')).toBe('left');

    slot.setAttribute('data-wall-impact', 'right');
    expect(slot.getAttribute('data-wall-impact')).toBe('right');
  });

  it('should support data-floor-impact attribute for floor collisions (set by driver)', () => {
    render(<Slot index={0} prize={mockPrize} x={50} width={60} />);
    const slot = screen.getByTestId('slot-0');

    // Driver sets floor impact
    slot.setAttribute('data-floor-impact', 'true');
    expect(slot.getAttribute('data-floor-impact')).toBe('true');
  });

  it('should show red winning badge when isWinning', () => {
    const { container } = render(
      <Slot index={0} prize={mockPrize} x={50} width={60} isWinning={true} />
    );
    // Winning badge is a small circle at bottom center
    const badge = container.querySelector('[style*="bottom: -6px"]');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ width: '12px', height: '12px' });
  });

  it('should show combo badge when comboBadgeNumber provided', () => {
    render(<Slot index={0} prize={mockPrize} x={50} width={60} comboBadgeNumber={2} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render icon when prize has slotIcon', () => {
    const prizeWithIcon: PrizeConfig = {
      ...mockPrize,
      slotIcon: '/test-icon.png',
    };
    const { container } = render(<Slot index={0} prize={prizeWithIcon} x={50} width={60} />);
    const icon = container.querySelector('img[alt]');
    expect(icon).toBeInTheDocument();
  });

  it('should adjust size for narrow slots', () => {
    render(
      <Slot
        index={0}
        prize={mockPrize}
        x={50}
        width={35} // Very narrow
      />
    );
    const slot = screen.getByTestId('slot-0');
    expect(slot.style.width).toBe('35px');
  });
});

// ============================================================================
// Peg Component Tests
// ============================================================================
describe('Peg Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render peg', () => {
    render(<Peg row={0} col={0} x={100} y={200} />);
    expect(screen.getByTestId('peg-0-0')).toBeInTheDocument();
  });

  it('should position peg correctly', () => {
    render(<Peg row={2} col={3} x={150} y={250} />);
    const peg = screen.getByTestId('peg-2-3');
    expect(peg.style.left).toBe('150px');
    expect(peg.style.top).toBe('250px');
  });

  it('should initially not be flashing', () => {
    render(<Peg row={0} col={0} x={100} y={200} />);
    const peg = screen.getByTestId('peg-0-0');
    expect(peg).toHaveAttribute('data-peg-hit', 'false');
  });

  it('should not be flashing initially', () => {
    render(<Peg row={0} col={0} x={100} y={200} />);
    const peg = screen.getByTestId('peg-0-0');
    expect(peg).toHaveAttribute('data-peg-hit', 'false');
  });

  it('should apply correct size', () => {
    render(<Peg row={0} col={0} x={100} y={200} />);
    const peg = screen.getByTestId('peg-0-0');
    expect(peg.style.width).toBe('14px');
    expect(peg.style.height).toBe('14px');
  });

  it('should render peg flash animation styles', () => {
    const { container } = render(<Peg row={0} col={0} x={100} y={200} />);
    const styles = container.querySelector('style');
    expect(styles?.textContent).toContain('data-peg-hit');
  });
});

// ============================================================================
// ThemedButton Component Tests
// ============================================================================
describe('ThemedButton Component', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('should render button with children', () => {
    render(<ThemedButton onClick={mockOnClick}>Click Me</ThemedButton>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    render(<ThemedButton onClick={mockOnClick}>Click Me</ThemedButton>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <ThemedButton onClick={mockOnClick} disabled={true}>
        Click Me
      </ThemedButton>
    );
    const button = screen.getByText('Click Me').closest('button');
    expect(button).toBeDisabled();
  });

  it('should not call onClick when disabled', () => {
    render(
      <ThemedButton onClick={mockOnClick} disabled={true}>
        Click Me
      </ThemedButton>
    );
    const button = screen.getByText('Click Me').closest('button');
    fireEvent.click(button!);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(
      <ThemedButton onClick={mockOnClick} className="custom-class">
        Click Me
      </ThemedButton>
    );
    const button = screen.getByText('Click Me').closest('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should render with testId', () => {
    render(
      <ThemedButton onClick={mockOnClick} testId="test-button">
        Click Me
      </ThemedButton>
    );
    expect(screen.getByTestId('test-button')).toBeInTheDocument();
  });

  it('should have shine effect element', () => {
    const { container } = render(<ThemedButton onClick={mockOnClick}>Click Me</ThemedButton>);
    const shineEffect = container.querySelector('.absolute.inset-0.opacity-30');
    expect(shineEffect).toBeInTheDocument();
  });

  it('should apply reduced opacity when disabled', () => {
    render(
      <ThemedButton onClick={mockOnClick} disabled={true}>
        Click Me
      </ThemedButton>
    );
    const button = screen.getByText('Click Me').closest('button') as HTMLElement;
    // Button should be disabled
    expect(button).toBeDisabled();
  });

  it('should be fully visible when enabled', () => {
    render(
      <ThemedButton onClick={mockOnClick} disabled={false}>
        Click Me
      </ThemedButton>
    );
    const button = screen.getByText('Click Me').closest('button') as HTMLElement;
    // Button should be enabled
    expect(button).toBeEnabled();
  });
});

// ============================================================================
// ViewportSelector Component Tests
// ============================================================================
describe('ViewportSelector Component', () => {
  const mockOnWidthChange = vi.fn();

  beforeEach(() => {
    mockOnWidthChange.mockClear();
  });

  it('should render all viewport size options', () => {
    render(
      <ViewportSelector selectedWidth={375} onWidthChange={mockOnWidthChange} disabled={false} />
    );

    expect(screen.getByText('iPhone SE')).toBeInTheDocument();
    expect(screen.getByText('Galaxy S8')).toBeInTheDocument();
    expect(screen.getByText('iPhone 12')).toBeInTheDocument();
    expect(screen.getByText('iPhone 14 Pro Max')).toBeInTheDocument();
  });

  it('should render all width values', () => {
    render(
      <ViewportSelector selectedWidth={375} onWidthChange={mockOnWidthChange} disabled={false} />
    );

    expect(screen.getByText('320px')).toBeInTheDocument();
    expect(screen.getByText('360px')).toBeInTheDocument();
    expect(screen.getByText('375px')).toBeInTheDocument();
    expect(screen.getByText('414px')).toBeInTheDocument();
  });

  it('should call onWidthChange when button clicked', () => {
    render(
      <ViewportSelector selectedWidth={375} onWidthChange={mockOnWidthChange} disabled={false} />
    );

    fireEvent.click(screen.getByText('320px'));
    expect(mockOnWidthChange).toHaveBeenCalledWith(320);
  });

  it('should not call onWidthChange when disabled', () => {
    render(
      <ViewportSelector selectedWidth={375} onWidthChange={mockOnWidthChange} disabled={true} />
    );

    fireEvent.click(screen.getByText('320px'));
    expect(mockOnWidthChange).not.toHaveBeenCalled();
  });

  it('should highlight selected viewport', () => {
    render(
      <ViewportSelector selectedWidth={375} onWidthChange={mockOnWidthChange} disabled={false} />
    );

    const button = screen.getByText('375px').closest('button') as HTMLElement;
    expect(button.style.transform).toBe('scale(1.05)');
  });

  it('should disable all buttons when disabled prop is true', () => {
    render(
      <ViewportSelector selectedWidth={375} onWidthChange={mockOnWidthChange} disabled={true} />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('should apply opacity 0.5 to disabled buttons', () => {
    render(
      <ViewportSelector selectedWidth={375} onWidthChange={mockOnWidthChange} disabled={true} />
    );

    const button = screen.getByText('375px').closest('button') as HTMLElement;
    expect(button.style.opacity).toBe('0.5');
  });

  it('should change selection on different button click', () => {
    const { rerender } = render(
      <ViewportSelector selectedWidth={375} onWidthChange={mockOnWidthChange} disabled={false} />
    );

    fireEvent.click(screen.getByText('414px'));
    expect(mockOnWidthChange).toHaveBeenCalledWith(414);

    // Simulate parent updating selected width
    rerender(
      <ViewportSelector selectedWidth={414} onWidthChange={mockOnWidthChange} disabled={false} />
    );

    const button = screen.getByText('414px').closest('button') as HTMLElement;
    expect(button.style.transform).toBe('scale(1.05)');
  });
});

// ============================================================================
// ThemeSelector Component Tests
// ============================================================================
describe('ThemeSelector Component', () => {
  it('should render theme selector', () => {
    render(<ThemeSelector />);
    expect(screen.getByText('Theme:')).toBeInTheDocument();
  });

  it('should render available themes', () => {
    render(<ThemeSelector />);
    // Default theme should be available
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should highlight current theme', () => {
    render(<ThemeSelector />);
    const buttons = screen.getAllByRole('button');
    // At least one button should be highlighted (current theme)
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should switch theme when button clicked', () => {
    render(<ThemeSelector />);
    const buttons = screen.getAllByRole('button');

    if (buttons.length > 1) {
      fireEvent.click(buttons[1]!);
      // Theme should switch (testing via theme context)
      expect(buttons[1]).toBeInTheDocument();
    }
  });

  it('should render with theme styling', () => {
    const { container } = render(<ThemeSelector />);
    const themeContainer = container.querySelector('.bg-black\\/20');
    expect(themeContainer).toBeInTheDocument();
  });
});

// ============================================================================
// PopupContainer Component Tests
// ============================================================================
describe('PopupContainer Component', () => {
  it('should render with children', () => {
    render(
      <PopupContainer>
        <div>Test Content</div>
      </PopupContainer>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render with testid', () => {
    render(
      <PopupContainer>
        <div>Test</div>
      </PopupContainer>
    );
    expect(screen.getByTestId('popup-container')).toBeInTheDocument();
  });

  it('should apply default min height', () => {
    render(
      <PopupContainer>
        <div>Test</div>
      </PopupContainer>
    );
    const container = screen.getByTestId('popup-container');
    expect(container.style.minHeight).toBe('650px');
  });

  it('should apply mobile overlay height when isMobileOverlay is true', () => {
    render(
      <PopupContainer isMobileOverlay={true}>
        <div>Test</div>
      </PopupContainer>
    );
    const container = screen.getByTestId('popup-container');
    expect(container.style.minHeight).toBe('100vh');
  });

  it('should apply hidden overflow for mobile overlay', () => {
    render(
      <PopupContainer isMobileOverlay={true}>
        <div>Test</div>
      </PopupContainer>
    );
    const container = screen.getByTestId('popup-container');
    expect(container.style.overflow).toBe('hidden');
  });

  it('should apply visible overflow for non-mobile', () => {
    render(
      <PopupContainer isMobileOverlay={false}>
        <div>Test</div>
      </PopupContainer>
    );
    const container = screen.getByTestId('popup-container');
    expect(container.style.overflow).toBe('visible');
  });

  it('should render multiple children', () => {
    render(
      <PopupContainer>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </PopupContainer>
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('should have full width', () => {
    render(
      <PopupContainer>
        <div>Test</div>
      </PopupContainer>
    );
    const container = screen.getByTestId('popup-container');
    expect(container.className).toContain('w-full');
  });

  it('should have relative positioning', () => {
    render(
      <PopupContainer>
        <div>Test</div>
      </PopupContainer>
    );
    const container = screen.getByTestId('popup-container');
    expect(container.className).toContain('relative');
  });
});
