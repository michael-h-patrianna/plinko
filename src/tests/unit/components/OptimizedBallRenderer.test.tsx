/**
 * Tests for OptimizedBallRenderer component
 * Verifies ball rendering states, trail behavior, and driver integration
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OptimizedBallRenderer } from '@components/game/PlinkoBoard/components/OptimizedBallRenderer';
import type { TrajectoryCache } from '@game/types';

// Mock the animation driver
vi.mock('../../../animation/useBallAnimationDriver', () => ({
  useBallAnimationDriver: vi.fn(() => ({
    schedule: vi.fn(() => vi.fn()), // Returns cancel function
    applyBallTransform: vi.fn(),
    updateTrail: vi.fn(),
    clearTrail: vi.fn(),
    flashPeg: vi.fn(),
  })),
}));

// Mock theme
vi.mock('../../../theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        game: {
          ball: {
            primary: '#FF6B35',
            secondary: '#FFA07A',
            highlight: '#FFFFFF',
          },
          launcher: {
            base: '#4a4a4a',
            accent: '#6a6a6a',
            track: '#3a3a3a',
          },
        },
        shadows: {
          default: '#000000',
        },
        background: {
          primary: '#1a1a1a',
          secondary: '#2a2a2a',
        },
        surface: {
          primary: '#3a3a3a',
          secondary: '#4a4a4a',
          elevated: '#5a5a5a',
        },
        text: {
          primary: '#FFFFFF',
          inverse: '#000000',
        },
      },
      gradients: {
        ballGlow: 'linear-gradient(135deg, #FF6B35, #FFA07A)',
        ballMain: 'linear-gradient(135deg, #FF6B35, #FFA07A)',
        shine: 'linear-gradient(135deg, #FFFFFF, transparent)',
      },
    },
  }),
}));

// Mock app config
vi.mock('../../../config/AppConfigContext', () => ({
  useAppConfig: vi.fn(() => ({
    performance: 'high',
  })),
}));

// Mock appConfig module
vi.mock('../../../config/appConfig', () => ({
  getPerformanceSetting: vi.fn(() => 20), // Return maxTrailLength
}));

// Mock frame store type
interface MockFrameStore {
  subscribe: ReturnType<typeof vi.fn>;
  getSnapshot: ReturnType<typeof vi.fn>;
  getCurrentFrame: ReturnType<typeof vi.fn>;
  notifyListeners: ReturnType<typeof vi.fn>;
}

describe('OptimizedBallRenderer Component', () => {
  let mockFrameStore: MockFrameStore;
  let mockGetBallPosition: ReturnType<typeof vi.fn>;
  let mockTrajectoryCache: TrajectoryCache;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock frame store
    mockFrameStore = {
      subscribe: vi.fn(() => vi.fn()),
      getSnapshot: vi.fn(() => 0),
      getCurrentFrame: vi.fn(() => 0),
      notifyListeners: vi.fn(),
    };

    // Create mock ball position getter
    mockGetBallPosition = vi.fn(() => ({
      x: 100,
      y: 200,
      rotation: 45,
    }));

    // Create mock trajectory cache
    mockTrajectoryCache = {
      speeds: new Float32Array([100, 150, 200]),
      scalesX: new Float32Array([1.0, 1.1, 1.2]),
      scalesY: new Float32Array([1.0, 0.9, 0.8]),
      trailLengths: new Uint8Array([10, 16, 20]),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering States', () => {
    it('should return null when isSelectingPosition is true', () => {
      const { container } = render(
        <OptimizedBallRenderer
          isSelectingPosition={true}
          ballState="idle"
          showTrail={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should return null when ballState is idle', () => {
      const { container } = render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="idle"
          showTrail={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should return null when ballState is ready', () => {
      const { container } = render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="ready"
          showTrail={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should return null during countdown without ball position', () => {
      const { container } = render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="countdown"
          showTrail={false}
          getBallPosition={() => null}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render BallLauncher during countdown with position', () => {
      const { container } = render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="countdown"
          showTrail={false}
          getBallPosition={mockGetBallPosition}
        />
      );

      // BallLauncher should be rendered
      expect(container.firstChild).not.toBeNull();
    });

    it('should return null during dropping without ball position', () => {
      const { container } = render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          frameStore={mockFrameStore}
          getBallPosition={() => null}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render ball during dropping with position', () => {
      render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      expect(screen.getByTestId('plinko-ball')).toBeInTheDocument();
    });

    it('should render ball during landed state', () => {
      render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="landed"
          showTrail={false}
          getBallPosition={mockGetBallPosition}
        />
      );

      expect(screen.getByTestId('plinko-ball')).toBeInTheDocument();
    });
  });

  describe('Ball Elements', () => {
    it('should render ball main element', () => {
      render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      const ball = screen.getByTestId('plinko-ball');
      expect(ball).toBeInTheDocument();
      expect(ball).toHaveAttribute('data-state', 'dropping');
    });

    it('should render glow layers', () => {
      const { container } = render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      // Should have ball and glow elements (checking for multiple elements)
      const elements = container.querySelectorAll('.absolute.pointer-events-none');
      expect(elements.length).toBeGreaterThan(1); // Ball + at least one glow
    });

    it('should render ball with correct size', () => {
      render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      const ball = screen.getByTestId('plinko-ball');
      expect(ball.style.width).toBe('14px');
      expect(ball.style.height).toBe('14px');
    });

    it('should render glossy highlight inside ball', () => {
      render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      const ball = screen.getByTestId('plinko-ball');
      const highlight = ball.querySelector('[style*="45%"]');
      expect(highlight).toBeInTheDocument();
    });

    it('should render texture pattern inside ball', () => {
      render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      const ball = screen.getByTestId('plinko-ball');
      const texture = ball.querySelector('[style*="45deg"]');
      expect(texture).toBeInTheDocument();
    });

    it('should position ball at correct coordinates', () => {
      render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      const ball = screen.getByTestId('plinko-ball');
      // Ball is positioned at x-7, y-7 to center the 14px ball
      expect(ball.style.transform).toContain('translate(93px, 193px)');
    });

    it('should apply rotation to ball', () => {
      render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      const ball = screen.getByTestId('plinko-ball');
      expect(ball.style.transform).toContain('rotate(45deg)');
    });
  });

  describe('Trail Rendering', () => {
    it('should render trail elements when showTrail is true', () => {
      const { container } = render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={true}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      // Should render trail elements (checking for 12px trail divs)
      const trailElements = container.querySelectorAll('[style*="12px"]');
      expect(trailElements.length).toBeGreaterThanOrEqual(20); // At least 20 trail elements
    });

    it('should not render trail elements when showTrail is false', () => {
      const { container } = render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      // Should only have ball elements, no trail
      const trailElements = container.querySelectorAll('[style*="12px"]');
      expect(trailElements.length).toBe(0);
    });

    it('should set trail elements to display:none initially', () => {
      const { container } = render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={true}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      const trailElements = Array.from(container.querySelectorAll('[style*="12px"]'));
      trailElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        expect(htmlEl.style.display).toBe('none');
      });
    });

    it('should apply correct trail element styling', () => {
      const { container } = render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={true}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      const trailElements = Array.from(container.querySelectorAll('[style*="12px"]'));
      expect(trailElements.length).toBeGreaterThan(0);

      const firstTrail = trailElements[0] as HTMLElement;
      expect(firstTrail.style.width).toBe('12px');
      expect(firstTrail.style.height).toBe('12px');
      expect(firstTrail.style.willChange).toBe('transform, opacity');
    });
  });

  describe('Animation Driver Integration', () => {
    it('should use animation driver', () => {
      render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      // Verify component renders (driver is mocked at module level)
      expect(screen.getByTestId('plinko-ball')).toBeInTheDocument();
    });

    it('should handle animation lifecycle', () => {
      const { rerender } = render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      expect(screen.getByTestId('plinko-ball')).toBeInTheDocument();

      // Return to idle (should clean up)
      rerender(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="idle"
          showTrail={false}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      // Should no longer render ball
      expect(screen.queryByTestId('plinko-ball')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing frameStore gracefully', () => {
      render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      // Should still render ball
      expect(screen.getByTestId('plinko-ball')).toBeInTheDocument();
    });

    it('should handle missing getBallPosition gracefully', () => {
      const { container } = render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          frameStore={mockFrameStore}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      // Should not render ball without position
      expect(container.firstChild).toBeNull();
    });

    it('should handle missing trajectoryCache gracefully', () => {
      render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
        />
      );

      // Should still render ball
      expect(screen.getByTestId('plinko-ball')).toBeInTheDocument();
    });

    it('should handle null ball position gracefully', () => {
      const { container } = render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          frameStore={mockFrameStore}
          getBallPosition={() => null}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should handle state changes correctly', () => {
      const { rerender } = render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="idle"
          showTrail={false}
        />
      );

      // Transition through states
      rerender(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="countdown"
          showTrail={false}
          getBallPosition={mockGetBallPosition}
        />
      );

      rerender(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      expect(screen.getByTestId('plinko-ball')).toBeInTheDocument();
    });

    it('should handle rapid state transitions', () => {
      const { rerender } = render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="idle"
          showTrail={false}
        />
      );

      // Rapid transitions
      rerender(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="ready"
          showTrail={false}
        />
      );

      rerender(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="countdown"
          showTrail={false}
          getBallPosition={mockGetBallPosition}
        />
      );

      rerender(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={true}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      expect(screen.getByTestId('plinko-ball')).toBeInTheDocument();
    });
  });

  describe('Performance Optimizations', () => {
    it('should use will-change for GPU acceleration', () => {
      render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      const ball = screen.getByTestId('plinko-ball');
      expect(ball.style.willChange).toBe('transform');
    });

    it('should use memo to prevent unnecessary rerenders', () => {
      const { rerender } = render(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      const ball = screen.getByTestId('plinko-ball');
      const initialTransform = ball.style.transform;

      // Rerender with same props (should not change)
      rerender(
        <OptimizedBallRenderer
          isSelectingPosition={false}
          ballState="dropping"
          showTrail={false}
          frameStore={mockFrameStore}
          getBallPosition={mockGetBallPosition}
          trajectoryCache={mockTrajectoryCache}
        />
      );

      // Transform should be stable
      expect(ball.style.transform).toBe(initialTransform);
    });
  });
});
