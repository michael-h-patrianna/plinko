# Test Memory Management Guide

## Overview

This guide documents the test suite's memory management strategy and safeguards to prevent memory exhaustion. The test suite previously caused issues by spawning 13 workers consuming 9GB+ RAM. This has been fixed with configuration safeguards that must be maintained.

## Configuration Safeguards

### Critical Settings in `vitest.config.ts`

```typescript
test: {
  maxWorkers: 4,        // CRITICAL: Prevents excessive process spawning (was 13)
  minWorkers: 1,        // Start with 1 worker, scale up as needed
  pool: 'threads',      // Use memory-efficient threading instead of forks
  environment: 'node',  // Default lightweight environment
}
```

### NEVER Modify These Without Review

Before changing any test configuration:

1. **READ** this document completely
2. **MONITOR** test memory usage with `node scripts/tools/monitor-test-memory.mjs`
3. **VERIFY** worker count stays ≤ 4, total memory < 2GB
4. **DOCUMENT** any configuration changes here
5. **TEST** with full suite before committing

## Memory Management Strategy

### Environment-Based Resource Allocation

The test suite uses environment matching to minimize memory overhead:

```typescript
environmentMatchGlobs: [
  ['**/*.test.tsx', 'jsdom'],              // Component tests need DOM (~200MB/worker)
  ['**/integration/**/*.test.ts', 'jsdom'], // Integration tests need DOM
  ['**/components/**/*.test.ts', 'jsdom'],  // Component unit tests need DOM
  // All other tests use Node.js environment (~20MB/worker)
]
```

**Memory Impact:**
- Node.js environment: ~20MB per worker
- JSDOM environment: ~200MB per worker
- **Strategy:** Use Node.js by default, JSDOM only where needed

### Worker Pool Configuration

```typescript
poolOptions: {
  threads: {
    singleThread: false,  // Allow parallelism within limit
    isolate: true,        // Prevent state leakage between tests
  }
}
```

**Why Threads Over Forks:**
- Threads share memory space more efficiently
- Lower overhead per worker (~30% less memory)
- Faster worker startup time
- Better suited for compute-intensive physics tests

## Writing Memory-Safe Tests

### DO's and DON'Ts

#### DON'T: Generate Excessive Data in Single Test

```typescript
// BAD: Will consume 100MB+ memory
it('should handle 1000 trajectories', () => {
  const trajectories = [];
  for (let i = 0; i < 1000; i++) {
    trajectories.push(generateTrajectory({ seed: i }));
  }
  // All trajectories held in memory
});
```

#### DO: Process in Batches and Clear

```typescript
// GOOD: Batch processing with memory cleanup
it('should handle 1000 trajectories', () => {
  const batchSize = 100;
  let totalPassed = 0;

  for (let batch = 0; batch < 10; batch++) {
    const results = [];
    for (let i = 0; i < batchSize; i++) {
      const seed = batch * batchSize + i;
      const result = generateTrajectory({ seed });
      results.push(validateTrajectory(result));
    }
    totalPassed += results.filter(r => r.passed).length;
    // results array cleared at end of each batch
  }

  expect(totalPassed).toBe(1000);
});
```

#### DON'T: Use JSDOM for Pure Logic Tests

```typescript
// BAD: Unnecessary JSDOM overhead
// physics.test.ts
it('should calculate trajectory correctly', () => {
  const result = calculatePhysics();
  expect(result.velocity).toBe(100);
});
```

#### DO: Use `.test.ts` for Logic, `.test.tsx` for Components

```typescript
// GOOD: Node.js environment for pure logic
// physics.test.ts
it('should calculate trajectory correctly', () => {
  const result = calculatePhysics();
  expect(result.velocity).toBe(100);
});

// GOOD: JSDOM only for component tests
// PhysicsVisualizer.test.tsx
it('should render trajectory path', () => {
  render(<PhysicsVisualizer trajectory={mockTrajectory} />);
  expect(screen.getByTestId('trajectory-path')).toBeInTheDocument();
});
```

#### DON'T: Forget Cleanup in Tests with Side Effects

```typescript
// BAD: Timers and listeners leak memory
it('should update position over time', () => {
  const component = render(<AnimatedBall />);
  // Test runs but timers/listeners never cleaned up
});
```

#### DO: Always Cleanup in afterEach

```typescript
// GOOD: Proper cleanup prevents memory leaks
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.restoreAllMocks();
});

it('should update position over time', () => {
  vi.useFakeTimers();
  const component = render(<AnimatedBall />);
  vi.advanceTimersByTime(1000);
  expect(component.getByTestId('ball').style.transform).toBeTruthy();
});
```

## Deterministic Testing Requirements

### Why Determinism Matters

Physics and trajectory tests MUST be deterministic to:
- Ensure reproducible results across runs
- Enable reliable CI/CD pipelines
- Facilitate debugging (same seed = same behavior)
- Prevent flaky tests

### Using Seeds Correctly

All tests that involve randomness or physics simulation must use explicit seeds:

```typescript
/**
 * Test trajectory generation with deterministic behavior.
 *
 * DETERMINISM: This test uses explicit seeds to ensure reproducible results.
 * - Seed 42 always produces the same trajectory
 * - Running this test multiple times will yield identical results
 * - Changing the seed will produce different (but still deterministic) trajectories
 *
 * @example
 * // Same seed = same result
 * const result1 = generateTrajectory({ seed: 42 });
 * const result2 = generateTrajectory({ seed: 42 });
 * expect(result1).toEqual(result2); // Always passes
 */
it('should generate same trajectory for same seed', () => {
  const { trajectory: traj1 } = generateTrajectory({
    boardWidth: 375,
    boardHeight: 500,
    pegRows: 10,
    slotCount: 6,
    seed: 42,
  });

  const { trajectory: traj2 } = generateTrajectory({
    boardWidth: 375,
    boardHeight: 500,
    pegRows: 10,
    slotCount: 6,
    seed: 42,
  });

  expect(traj1).toEqual(traj2);
});
```

### Validating Deterministic Behavior

Use the `assertDeterministicBehavior()` utility (see below) to validate that functions produce consistent results:

```typescript
import { assertDeterministicBehavior } from '@/tests/fixtures/testUtils';

it('should have deterministic physics simulation', () => {
  assertDeterministicBehavior(
    () => generateTrajectory({ seed: 12345 }),
    () => generateTrajectory({ seed: 12345 }),
    'generateTrajectory with same seed'
  );
});
```

## Test Utility Functions

### assertDeterministicBehavior()

Located in `src/tests/fixtures/testUtils.ts`:

```typescript
/**
 * Validates that two function calls produce identical results.
 * Use this to verify deterministic behavior in tests.
 *
 * @example
 * assertDeterministicBehavior(
 *   () => generateTrajectory({ seed: 42 }),
 *   () => generateTrajectory({ seed: 42 }),
 *   'trajectory generation'
 * );
 */
export function assertDeterministicBehavior<T>(
  fn1: () => T,
  fn2: () => T,
  description: string
): void;
```

## Monitoring Test Memory

### Manual Monitoring

Run the memory monitor script during test execution:

```bash
# Terminal 1: Run tests
npm test

# Terminal 2: Monitor memory usage
node scripts/tools/monitor-test-memory.mjs
```

### Automated CI Check

The CI pipeline includes a validation test that ensures `maxWorkers` is not exceeded:

```bash
# Run the safeguard test
npm test src/tests/safeguards/vitest-config-validation.test.ts
```

This test will FAIL if:
- `maxWorkers` is set > 4
- `pool` is not set to 'threads'
- Environment defaults are not configured correctly

## Emergency Response

If the system becomes unresponsive during test execution:

```bash
# Force kill all Node processes
killall -9 node

# Clean up lingering Vitest workers (if script exists)
node scripts/cleanup-vitest.mjs

# Verify no orphaned processes
ps aux | grep vitest
```

## Best Practices Summary

1. **Always use explicit seeds** in physics/trajectory tests
2. **Use Node.js environment by default** - only use JSDOM for UI tests
3. **Process large datasets in batches** - don't hold 1000+ objects in memory
4. **Clean up after each test** - timers, listeners, mocks, DOM
5. **Monitor memory during development** - catch issues early
6. **Never modify maxWorkers without review** - it's a critical safeguard
7. **Use deterministic test utilities** - leverage `assertDeterministicBehavior()`
8. **Document seed requirements** - add JSDoc explaining determinism

## Test Organization

### File Naming Conventions

- `*.test.ts` - Pure logic tests (Node.js environment)
- `*.test.tsx` - Component tests requiring DOM (JSDOM environment)
- `integration/*.test.ts` - Integration tests (JSDOM environment)
- `physics/*.test.ts` - Physics simulation tests (Node.js environment)

### Memory-Efficient Test Structure

```typescript
// physics/trajectory-validation.test.ts
describe('Trajectory Validation', () => {
  // Small unit tests - fast, lightweight
  describe('individual trajectory properties', () => {
    it('should have valid starting position', () => {
      const { trajectory } = generateTrajectory({ seed: 42 });
      expect(trajectory[0].x).toBeGreaterThan(0);
    });
  });

  // Large batch tests - process in chunks
  describe('bulk validation', () => {
    it('should validate 1000 trajectories', () => {
      const batchSize = 100;
      let totalValid = 0;

      for (let batch = 0; batch < 10; batch++) {
        // Process batch, then let it be garbage collected
        const batchResults = processBatch(batch, batchSize);
        totalValid += batchResults.validCount;
      }

      expect(totalValid).toBe(1000);
    });
  }, 60000); // Longer timeout for bulk tests
});
```

## Troubleshooting

### Issue: Tests Hang or System Becomes Unresponsive

**Cause:** Too many workers spawned, consuming all available memory

**Solution:**
1. Verify `maxWorkers: 4` in `vitest.config.ts`
2. Check for tests generating excessive data
3. Use batch processing for large datasets

### Issue: Test Results Are Non-Deterministic

**Cause:** Tests using randomness without explicit seeds

**Solution:**
1. Add explicit `seed` parameter to all random/physics functions
2. Use `assertDeterministicBehavior()` to validate
3. Document seed requirements in JSDoc

### Issue: JSDOM Out of Memory Errors

**Cause:** Too many component tests running in parallel

**Solution:**
1. Verify component tests use `.test.tsx` extension
2. Check `environmentMatchGlobs` configuration
3. Ensure `cleanup()` is called in `afterEach`

### Issue: CI Tests Fail with Memory Errors

**Cause:** CI environment has limited memory, or configuration changed

**Solution:**
1. Run safeguard validation test locally
2. Verify `maxWorkers` not increased
3. Check for new tests generating excessive data
4. Consider running tests sequentially in CI: `npm test -- --pool=forks --poolOptions.forks.singleFork=true`

## Configuration Validation

The test suite includes a safeguard test that validates the Vitest configuration:

**Location:** `src/tests/safeguards/vitest-config-validation.test.ts`

**Validates:**
- `maxWorkers` is set to 4 or less
- `pool` is set to 'threads' (memory efficient)
- Default environment is 'node' (lightweight)
- Environment matching is configured correctly

**Run it:**
```bash
npm test src/tests/safeguards/vitest-config-validation.test.ts
```

This test runs in CI and will block PRs that modify these critical safeguards without proper justification.

## References

- [Vitest Configuration](https://vitest.dev/config/)
- [Vitest Pool Options](https://vitest.dev/config/#pool)
- [Testing Library Cleanup](https://testing-library.com/docs/react-testing-library/api/#cleanup)
- [Node.js Memory Management](https://nodejs.org/en/docs/guides/simple-profiling/)

---

**Last Updated:** 2025-10-12
**Maintained By:** Testing Team
**Review Required Before:** Modifying vitest.config.ts
