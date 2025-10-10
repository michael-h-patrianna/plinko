/**
 * Telemetry and Observability System
 *
 * Provides production debugging capabilities through event tracking,
 * performance monitoring, and error reporting.
 */

// ============================================================================
// TELEMETRY TYPES
// ============================================================================

export type TelemetryEventType =
  // Physics Events
  | 'physics.collision'
  | 'physics.stuck_ball'
  | 'physics.invalid_trajectory'
  | 'physics.settlement'
  | 'physics.bucket_entry'

  // State Machine Events
  | 'state.transition'
  | 'state.error'

  // Performance Events
  | 'perf.simulation_duration'
  | 'perf.render_frame'
  | 'perf.animation_lag'

  // Error Events
  | 'error.boundary_caught'
  | 'error.state_invalid'
  | 'error.physics_violation'
  | 'error.platform_adapter';

export interface BaseTelemetryEvent {
  type: TelemetryEventType;
  timestamp: number;
  sessionId?: string;
}

// ============================================================================
// PHYSICS TELEMETRY
// ============================================================================

export interface PhysicsCollisionEvent extends BaseTelemetryEvent {
  type: 'physics.collision';
  data: {
    frame: number;
    pegRow: number;
    pegCol: number;
    velocity: { vx: number; vy: number };
    position: { x: number; y: number };
  };
}

export interface PhysicsStuckBallEvent extends BaseTelemetryEvent {
  type: 'physics.stuck_ball';
  data: {
    frame: number;
    position: { x: number; y: number };
    stuckFrames: number;
    lastVelocity: { vx: number; vy: number };
  };
}

export interface PhysicsInvalidTrajectoryEvent extends BaseTelemetryEvent {
  type: 'physics.invalid_trajectory';
  data: {
    reason: 'stuck' | 'timeout' | 'out_of_bounds';
    totalFrames: number;
    finalPosition?: { x: number; y: number };
  };
}

export interface PhysicsSettlementEvent extends BaseTelemetryEvent {
  type: 'physics.settlement';
  data: {
    slotIndex: number;
    totalFrames: number;
    finalVelocity: { vx: number; vy: number };
    bounces: number;
  };
}

export interface PhysicsBucketEntryEvent extends BaseTelemetryEvent {
  type: 'physics.bucket_entry';
  data: {
    frame: number;
    velocity: { vx: number; vy: number };
    expectedSlot: number;
  };
}

// ============================================================================
// STATE MACHINE TELEMETRY
// ============================================================================

export interface StateTransitionEvent extends BaseTelemetryEvent {
  type: 'state.transition';
  data: {
    fromState: string;
    toState: string;
    event: string;
    duration?: number;
  };
}

export interface StateErrorEvent extends BaseTelemetryEvent {
  type: 'state.error';
  data: {
    currentState: string;
    event: string;
    error: string;
  };
}

// ============================================================================
// PERFORMANCE TELEMETRY
// ============================================================================

export interface SimulationDurationEvent extends BaseTelemetryEvent {
  type: 'perf.simulation_duration';
  data: {
    duration: number;
    frameCount: number;
    seed: number;
  };
}

export interface RenderFrameEvent extends BaseTelemetryEvent {
  type: 'perf.render_frame';
  data: {
    frameDuration: number;
    frameNumber: number;
    droppedFrames?: number;
  };
}

export interface AnimationLagEvent extends BaseTelemetryEvent {
  type: 'perf.animation_lag';
  data: {
    expectedDuration: number;
    actualDuration: number;
    lagAmount: number;
  };
}

// ============================================================================
// ERROR TELEMETRY
// ============================================================================

export interface ErrorBoundaryCaughtEvent extends BaseTelemetryEvent {
  type: 'error.boundary_caught';
  data: {
    error: string;
    componentStack?: string;
    errorInfo?: unknown;
  };
}

export interface ErrorStateInvalidEvent extends BaseTelemetryEvent {
  type: 'error.state_invalid';
  data: {
    state: string;
    context: unknown;
    reason: string;
  };
}

export interface ErrorPhysicsViolationEvent extends BaseTelemetryEvent {
  type: 'error.physics_violation';
  data: {
    violationType: 'overlap' | 'escape' | 'velocity_exceeded' | 'nan_value';
    details: unknown;
  };
}

export interface ErrorPlatformAdapterEvent extends BaseTelemetryEvent {
  type: 'error.platform_adapter';
  data: {
    adapter:
      | 'dimensions'
      | 'deviceInfo'
      | 'navigation'
      | 'storage'
      | 'animation'
      | 'crypto'
      | 'performance';
    operation: string;
    error: string;
    context?: unknown;
  };
}

// ============================================================================
// UNIFIED TELEMETRY EVENT TYPE
// ============================================================================

export type TelemetryEvent =
  | PhysicsCollisionEvent
  | PhysicsStuckBallEvent
  | PhysicsInvalidTrajectoryEvent
  | PhysicsSettlementEvent
  | PhysicsBucketEntryEvent
  | StateTransitionEvent
  | StateErrorEvent
  | SimulationDurationEvent
  | RenderFrameEvent
  | AnimationLagEvent
  | ErrorBoundaryCaughtEvent
  | ErrorStateInvalidEvent
  | ErrorPhysicsViolationEvent
  | ErrorPlatformAdapterEvent;

// ============================================================================
// TELEMETRY SERVICE
// ============================================================================

export interface TelemetryOptions {
  enabled: boolean;
  console: boolean;
  remote?: {
    endpoint: string;
    batchSize?: number;
    flushInterval?: number;
  };
}

class TelemetryService {
  private options: TelemetryOptions;
  private eventQueue: TelemetryEvent[] = [];
  private sessionId: string;
  private flushFailureCount: number = 0;
  private lastFlushFailureTime: number = 0;
  private readonly MAX_FLUSH_FAILURES = 3;
  private readonly FLUSH_FAILURE_RESET_INTERVAL = 60000; // 1 minute

  constructor(options: Partial<TelemetryOptions> = {}) {
    this.options = {
      enabled: options.enabled ?? false,
      console: options.console ?? false,
      remote: options.remote,
    };
    this.sessionId = this.generateSessionId();
  }

  /**
   * Track a telemetry event
   */
  track(event: Omit<TelemetryEvent, 'timestamp' | 'sessionId'>): void {
    if (!this.options.enabled) return;

    const fullEvent: TelemetryEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    } as TelemetryEvent;

    if (this.options.console) {
      console.log('[Telemetry]', fullEvent.type, fullEvent.data);
    }

    this.eventQueue.push(fullEvent);

    // Auto-flush if batch size reached
    if (this.options.remote?.batchSize && this.eventQueue.length >= this.options.remote.batchSize) {
      void this.flush();
    }
  }

  /**
   * Flush queued events to remote endpoint
   */
  async flush(): Promise<void> {
    if (!this.options.remote || this.eventQueue.length === 0) return;

    // Check if we should back off due to repeated failures
    const now = Date.now();
    if (
      this.flushFailureCount >= this.MAX_FLUSH_FAILURES &&
      now - this.lastFlushFailureTime < this.FLUSH_FAILURE_RESET_INTERVAL
    ) {
      // Silently skip flushing during backoff period
      return;
    }

    // Reset failure count after cooldown period
    if (now - this.lastFlushFailureTime >= this.FLUSH_FAILURE_RESET_INTERVAL) {
      this.flushFailureCount = 0;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await fetch(this.options.remote.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
      // Success - reset failure counter
      this.flushFailureCount = 0;
    } catch (error) {
      this.flushFailureCount++;
      this.lastFlushFailureTime = now;

      // Only log error on first few failures, then go silent to prevent spam
      if (this.flushFailureCount <= this.MAX_FLUSH_FAILURES) {
        console.error(
          `[Telemetry] Failed to flush events (${this.flushFailureCount}/${this.MAX_FLUSH_FAILURES}):`,
          error
        );
      }

      // Re-queue events on failure, but cap queue size to prevent memory leak
      const MAX_QUEUE_SIZE = 1000;
      this.eventQueue.push(...events.slice(-MAX_QUEUE_SIZE));
    }
  }

  /**
   * Update telemetry options
   */
  configure(options: Partial<TelemetryOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const telemetry = new TelemetryService({
  enabled: import.meta.env.PROD,
  console: import.meta.env.DEV,
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Track physics collision event
 */
export function trackCollision(data: PhysicsCollisionEvent['data']): void {
  telemetry.track({ type: 'physics.collision', data });
}

/**
 * Track stuck ball detection
 */
export function trackStuckBall(data: PhysicsStuckBallEvent['data']): void {
  telemetry.track({ type: 'physics.stuck_ball', data });
}

/**
 * Track invalid trajectory
 */
export function trackInvalidTrajectory(data: PhysicsInvalidTrajectoryEvent['data']): void {
  telemetry.track({ type: 'physics.invalid_trajectory', data });
}

/**
 * Track ball settlement
 */
export function trackSettlement(data: PhysicsSettlementEvent['data']): void {
  telemetry.track({ type: 'physics.settlement', data });
}

/**
 * Track state transition
 */
export function trackStateTransition(data: StateTransitionEvent['data']): void {
  telemetry.track({ type: 'state.transition', data });
}

/**
 * Track state error
 */
export function trackStateError(data: StateErrorEvent['data']): void {
  telemetry.track({ type: 'state.error', data });
}

/**
 * Track simulation performance
 */
export function trackSimulationPerformance(data: SimulationDurationEvent['data']): void {
  telemetry.track({ type: 'perf.simulation_duration', data });
}

/**
 * Track error boundary catch
 */
export function trackErrorBoundary(data: ErrorBoundaryCaughtEvent['data']): void {
  telemetry.track({ type: 'error.boundary_caught', data });
}

/**
 * Track platform adapter error
 */
export function trackPlatformError(data: ErrorPlatformAdapterEvent['data']): void {
  telemetry.track({ type: 'error.platform_adapter', data });
}
