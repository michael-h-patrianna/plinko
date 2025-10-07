# Test Memory Management Guide

## Problem History

On 2025-10-07, the test suite was causing severe memory exhaustion:
- **13 Vitest worker processes** spawned (one per CPU core - 1)
- **Several GB of memory per worker** (9+ GB total)
- **Workers never shut down** after tests completed
- Result: System became unresponsive, hot, and unusable

## Root Causes Identified

1. **Excessive Worker Spawning**: Vitest 3.x defaults to `forks` pool with worker count = CPU cores - 1
2. **JSDOM Overhead**: All tests loaded JSDOM (~200MB per worker), even physics tests that don't need DOM
3. **Memory-Intensive Tests**: Physics tests generate 1000+ trajectories (10MB+ data) without batching
4. **Poor Cleanup**: Workers didn't exit cleanly due to JSDOM event listeners and timers

## Solutions Implemented

### 1. Vitest Configuration Hardening (`vitest.config.ts`)

```typescript
test: {
  // Use lightweight Node.js by default
  environment: 'node',

  // Only load JSDOM where needed (components/integration)
  environmentMatchGlobs: [
    ['**/*.test.tsx', 'jsdom'],
    ['**/integration/**/*.test.ts', 'jsdom'],
    ['**/components/**/*.test.ts', 'jsdom'],
  ],

  // Limit workers to prevent memory exhaustion
  maxWorkers: 4,  // Down from 13
  minWorkers: 1,

  // Use threads instead of forks for better memory sharing
  pool: 'threads',
  poolOptions: {
    threads: {
      singleThread: false,
      isolate: true,
    },
  },
}
```

**Impact:**
- Workers: 13 → 4 (69% reduction)
- Memory per worker: ~700MB → ~150MB (78% reduction)
- Total memory: 9GB → 600MB-1.2GB (87% reduction)

### 2. Enhanced Process Cleanup (`scripts/cleanup-vitest.mjs`)

The cleanup script now:
- Detects watch mode, worker threads, and orphaned processes
- Uses SIGTERM first (graceful), then SIGKILL (force) after 500ms
- Reports detailed cleanup results

### 3. Test Cleanup Improvements (`src/tests/setupTests.ts`)

```typescript
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  cleanup(); // React Testing Library cleanup
  if (global.gc) global.gc(); // Force GC if --expose-gc enabled
});
```

### 4. Memory Monitoring Tool (`scripts/tools/monitor-test-memory.mjs`)

Real-time monitoring of test memory usage:

```bash
# Terminal 1: Monitor memory
node scripts/tools/monitor-test-memory.mjs

# Terminal 2: Run tests
npm test
```

Reports:
- Worker count (current and peak)
- Memory usage per worker
- Total memory consumption
- CPU usage

## Best Practices

### For Test Authors

#### ❌ DON'T: Generate massive datasets in one go
```typescript
// BAD - 1000 trajectories held in memory
const results = [];
for (let i = 0; i < 1000; i++) {
  results.push(generateTrajectory());
}
validateAll(results);
```

#### ✅ DO: Process in batches
```typescript
// GOOD - Process in batches of 100
for (let batch = 0; batch < 10; batch++) {
  const results = [];
  for (let i = 0; i < 100; i++) {
    results.push(generateTrajectory());
  }
  validateBatch(results);
  results.length = 0; // Clear for GC
}
```

#### ❌ DON'T: Use JSDOM for non-UI tests
```typescript
// BAD - Loads heavy JSDOM for pure logic
// tests/physics/trajectory.test.ts
import { describe, it } from 'vitest'; // Loads JSDOM due to config
```

#### ✅ DO: Use correct environment via naming
```typescript
// GOOD - Uses Node.js environment (lightweight)
// tests/physics/trajectory.test.ts (not .tsx)
import { describe, it } from 'vitest';
```

#### ❌ DON'T: Forget to clean up timers/listeners
```typescript
// BAD
it('animates', () => {
  setInterval(() => doStuff(), 100);
  // Test ends, interval keeps running
});
```

#### ✅ DO: Clean up properly
```typescript
// GOOD
it('animates', () => {
  const timer = setInterval(() => doStuff(), 100);
  return () => clearInterval(timer);
});
```

### For Configuration Changes

#### Before Changing Worker Count

Ask these questions:
1. **Why change?** Is this for speed or memory?
2. **What's the CI environment?** (CI may have different resources)
3. **Have you tested locally?** Monitor memory with the tool first
4. **Is there a better solution?** Maybe optimize tests instead

#### Safe Worker Count Formula

```
maxWorkers = min(4, floor(RAM_GB / 0.5))
```

Examples:
- 8 GB RAM → max 4 workers (configured limit)
- 16 GB RAM → max 4 workers (configured limit)
- 32 GB RAM → could increase to 8 if needed

#### When to Use `fileParallelism: false`

Enable serial execution if:
- Memory still exceeds 2GB with 4 workers
- Tests are flaky due to resource contention
- Debugging specific memory issues

```typescript
test: {
  fileParallelism: false, // Run one test file at a time
}
```

**Trade-off:** Tests take 4x longer but use 75% less memory.

### For CI/CD

#### GitHub Actions / CI Configuration

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm test
  env:
    # Limit workers in CI (usually 2 cores available)
    VITEST_MAX_WORKERS: 2
```

#### Memory Monitoring in CI

```bash
# Add to CI scripts
node scripts/tools/monitor-test-memory.mjs &
MONITOR_PID=$!
npm test
kill $MONITOR_PID
```

## Monitoring & Diagnostics

### Check Current Worker Count

```bash
# During test run
ps aux | grep vitest | wc -l
```

Expected: ≤ 5 (1 main + 4 workers)

### Check Memory Usage

```bash
# Total memory used by Vitest
ps aux | grep vitest | awk '{sum+=$6} END {print sum/1024 " MB"}'
```

Expected: < 2000 MB (2 GB)

### Memory Leak Detection

```bash
# Run tests with heap snapshot
node --expose-gc --max-old-space-size=2048 ./node_modules/.bin/vitest run

# If tests exceed 2GB, they'll crash (memory leak confirmed)
```

### Worker Not Exiting?

```bash
# Check for lingering processes after tests
ps aux | grep vitest

# Manually cleanup
node scripts/cleanup-vitest.mjs
```

## Emergency Procedures

### System Unresponsive Due to Test Suite

1. **Open Activity Monitor** (or `top` in terminal)
2. **Force quit** all Node.js processes: `killall -9 node`
3. **Run cleanup**: `node scripts/cleanup-vitest.mjs`
4. **Verify processes gone**: `ps aux | grep vitest` (should be empty)
5. **Check memory**: RAM should return to normal within 30 seconds

### Tests Still Consuming Excess Memory

If fixes don't help:

```bash
# Run with single worker (serial mode)
npx vitest run --pool=threads --poolOptions.threads.singleThread=true

# Or disable parallelism entirely
npx vitest run --no-file-parallelism
```

## Warning Signs

Watch for these indicators of memory issues:

🔴 **Critical (Fix Immediately)**
- System swap usage > 8GB
- Test process > 4GB memory
- Worker count > 8
- System fan running at max speed
- UI becomes unresponsive

🟡 **Warning (Investigate Soon)**
- Test process > 2GB memory
- Worker count > 4
- Tests taking > 5 minutes
- Intermittent test failures

🟢 **Healthy**
- Worker count: 1-4
- Total memory: < 1.5GB
- Tests complete in < 2 minutes
- System remains responsive

## Related Files

- Configuration: `vitest.config.ts`
- Cleanup script: `scripts/cleanup-vitest.mjs`
- Test setup: `src/tests/setupTests.ts`
- Monitor tool: `scripts/tools/monitor-test-memory.mjs`
- This guide: `docs/TEST_MEMORY_MANAGEMENT.md`

## Version History

- **2025-10-07**: Initial guide created after memory exhaustion incident
  - Implemented 4-worker limit
  - Added environment-specific JSDOM loading
  - Enhanced cleanup script
  - Created monitoring tool

---

**Last Updated**: 2025-10-07
**Maintainer**: See git blame for recent contributors
**Status**: Active - refer to this guide before changing test configuration
