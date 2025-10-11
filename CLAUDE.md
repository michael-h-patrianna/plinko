=== CRITICAL INSTRUCTION BLOCK (CIB-001)===

## MANDATORY TOOLS

### For Complex Tasks (research, analysis, debugging)
```
USE: mcp__mcp_docker__sequentialthinking
WHEN: Multi-step problems, research, complex reasoning
WHY: Prevents cognitive overload, ensures systematic approach
```

### For Task Management
```
USE: TodoWrite
WHEN: Any task with 3+ steps
WHY: Tracks progress, maintains focus
```

## MANDATORY CODE STYLE AND ARCHITECTURE RULES
Coding agents must follow `docs/meta/styleguide.md` - No exceptions!

## MANDATORY EXECUTION PROTOCOL
1. Always complete all tasks fully. Do not simplify approaches, do not skip tasks.
2. Always keep tests up to date and maintain 100% test coverage.
3. Always test. 100% of tests must pass.
4. Always fix bugs. Never changes tests only to make them pass if the cause is in the code it is testing.
5. Never run Vitest in watch mode; automation must use `npm test`. Only set `ALLOW_VITEST_WATCH=1` when a human explicitly authorizes interactive debugging.
6. **CRITICAL**: After implementing new functionality, ALWAYS create comprehensive tests:
   - Unit tests for logic and components (Vitest)
   - Integration tests for game flow
   - Playwright tests for frontend functionality (must visually confirm UI works)
   - All tests must be in `src/tests/` or `scripts/playwright/`
   - Run ALL tests before considering task complete
   - Maintain 100% test coverage - no exceptions

## TEST MEMORY MANAGEMENT

**CRITICAL**: The test suite previously caused memory exhaustion by spawning 13 workers consuming 9GB+ RAM. This has been fixed but requires vigilance.

### Configuration Safeguards (DO NOT MODIFY without review)
- `maxWorkers: 4` in `vitest.config.ts` - Prevents excessive process spawning
- `pool: 'threads'` - Uses memory-efficient threading instead of forks
- `environment: 'node'` default - Only loads JSDOM for component tests
- `environmentMatchGlobs` - Restricts heavy JSDOM to UI tests only

### Before Changing Test Configuration
1. **READ**: `docs/TEST_MEMORY_MANAGEMENT.md` (comprehensive guide)
2. **MONITOR**: Run `node scripts/tools/monitor-test-memory.mjs` while testing
3. **VERIFY**: Worker count stays ≤ 4, total memory < 2GB
4. **DOCUMENT**: Update guide if making configuration changes

### Writing Memory-Safe Tests
- **DON'T**: Generate 1000+ data points in a single test without batching
- **DO**: Process in batches of 100 and clear arrays between batches
- **DON'T**: Load JSDOM for pure logic tests (use `.test.ts` not `.test.tsx`)
- **DO**: Use component tests (`.test.tsx`) only for UI components
- **DON'T**: Forget to cleanup timers/listeners in afterEach
- **DO**: Call `cleanup()` from @testing-library/react in test teardown

### Emergency Response
If system becomes unresponsive during tests:
```bash
killall -9 node  # Force kill all Node processes
node scripts/cleanup-vitest.mjs  # Clean up lingering workers
```

## FOLDER USAGE RULES

| Activity | Required Directory | Agent Enforcement |
| --- | --- | --- |
| Browser automation (Playwright/Puppeteer runners, recorders) | `scripts/playwright/` | Keep every `.js`/`.mjs` harness here. Subfolders allowed, but **never** place these scripts in the repo root. |
| Physics, RNG, or analytics utilities | `scripts/tools/` | Import from `../../src` or `../../dist` as needed. No tooling lives in the project root. |
| Visual artifacts (screenshots, videos, GIFs) | `screenshots/` | Always persist captured assets here. Create nested folders like `screenshots/quality-test/` or `screenshots/videos/` to stay organized. |
| Documentation, research notes | `docs/` | Long-form analysis belongs in this directory instead of new markdown files at the root. |
| Temporary experiments / sandboxes | `src/dev-tools/` | Use this workspace for throwaway UI/physics spikes and clean it up after. |
| 🚫 Forbidden | Project root | Keep root pristine—no scripts, screenshots, or scratch docs. |

=== END CIB-001 ===

=== CROSS-PLATFORM REQUIREMENTS [CIB-001.5] ===

## Dual Platform Architecture

This is a **React web project** with future React Native portability as a requirement. Write web code that avoids RN-incompatible features.

### Current Stack
- **Web**: Framer Motion, CSS, React (current implementation)

### Future Compatibility
- **React Native**: Will use Moti, Reanimated, react-native-linear-gradient
- Web code must avoid features that don't translate to React Native

### CRITICAL Animation & Visual Constraints

**✅ ALLOWED** (cross-platform safe):
- Transforms: `translateX`, `translateY`, `scale`, `rotate`
- Opacity animations
- **Linear gradients ONLY** (via react-native-linear-gradient)
- Color transitions
- Layout animations (position, size)

**❌ FORBIDDEN** (web-only, breaks React Native):
- Blur animations or CSS filters
- Radial/conic gradients
- Box shadows, text shadows
- backdrop-filter, clip-path
- CSS pseudo-elements (:before, :after)
- Complex CSS selectors

### Implementation Strategy
When implementing visual effects or animations:
1. Check if feature is cross-platform compatible
2. Use transforms + opacity only for animations
3. Use linear gradients only (never radial/conic)
4. No blur, filters, or shadows
5. Abstract platform-specific code when necessary

### Which Agents Must Follow This
- **animation-specialist**: Primary enforcer of animation constraints
- **ui-polish-specialist**: Primary enforcer of visual constraints
- **integration-coordinator**: Ensures cross-platform strategy in architecture
- All other agents: Aware of constraints when adding visual features

=== END CIB-001.5 ===

=== AGENT SELECTION GUIDE [CIB-002] ===

## When to Choose Which Agent

### Physics & Simulation
**physics-engine-specialist**: trajectory, collision, physics simulation, deterministic behavior, RNG, overlap detection, numerical stability

### Code Quality & Structure
**typescript-guardian**: type safety, generics, type definitions, eliminating 'any', strict mode
**architecture-guardian**: file organization, folder structure, asset placement, keeping root clean
**code-reviewer**: PROACTIVE review after code changes for quality, security, best practices (use after implementation)

### Testing & Validation
**testing-architect**: writing tests, test coverage, Vitest, Playwright, E2E testing, validation strategy

### Performance & Animation
**animation-specialist**: 60 FPS optimization, GPU acceleration, smooth animations, performance profiling

### UI & User Experience
**ui-polish-specialist**: visual refinement, accessibility, theming, micro-interactions, responsive design

### Game Logic
**state-machine-specialist**: game state, state transitions, event handling, game flow logic

### Problem Resolution
**debugger**: PROACTIVE investigation of errors, test failures, unexpected behavior, root cause analysis (use when things break)

### Complex Coordination
**integration-coordinator**: multi-domain tasks, system-wide changes, orchestrating multiple agents, architecture decisions

## Workflow Patterns

**After Writing Code**:
1. Relevant specialist implements feature
2. **code-reviewer** reviews changes PROACTIVELY
3. **testing-architect** validates with tests

**When Bugs Occur**:
1. **debugger** investigates and finds root cause
2. Relevant specialist implements fix
3. **testing-architect** adds regression test

**Multi-Domain Work**:
**integration-coordinator** breaks down task, delegates to specialists, ensures integration

## Default Behavior
If no specific agent matches, use general development knowledge. When in doubt, **integration-coordinator** helps determine the right specialist.

=== END CIB-002 ===

````
