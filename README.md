# Plinko Game - Deterministic Physics Engine

A React + TypeScript implementation of a Plinko game with **100% guaranteed outcomes** and **completely realistic physics**. Built for applications requiring predetermined results (sweepstakes, demos) while maintaining natural ball movement.

## 🎯 Key Features

- ✅ **100% Success Rate**: Ball always lands in target slot (validated with 10,000+ test runs)
- 🎮 **Realistic Physics**: Complete collision detection, gravity, restitution, and bucket physics
- 🔬 **Zero Overlaps**: Ball never clips through pegs (< 0.2px tolerance)
- ⚡ **60 FPS Animation**: Smooth trajectory playback with 300-600 frame sequences
- 🧪 **Comprehensive Testing**: 10,000 trajectory validation with 100% pass rate
- 🎨 **375px Fixed Width**: Optimized for popup/modal display
- 📐 **Binary Search Collision**: Precise collision detection prevents tunneling

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Testing

Vitest cleanup runs automatically before every test command, so you don't need to manually kill stray workers. Interactive watch mode is intentionally locked down—only set `ALLOW_VITEST_WATCH=1` when you truly need it, and prefer the standard `npm test` run for automation.

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- trajectory-100.test.ts

# Run comprehensive 10,000 trajectory test
npm test -- trajectory-comprehensive.test.ts

# Optional: run Vitest in watch mode (manual use only)
ALLOW_VITEST_WATCH=1 npm run test:watch
```

## 📊 Test Results

```
✅ Basic Tests: 100% pass
✅ 100 Trajectory Test: 100% success, 0 overlaps
✅ 10,000 Trajectory Test: 100% success, 0 overlaps, 0 teleportation
```

## 🏗️ Architecture

### Project Structure

```
plinko/
├── src/
│   ├── game/
│   │   ├── trajectory.ts       # Physics engine (CORE)
│   │   ├── rng.ts             # Deterministic RNG
│   │   ├── stateMachine.ts    # Game state
│   │   └── types.ts           # Type definitions
│   ├── components/
│   │   ├── Ball.tsx           # Ball rendering & animation
│   │   ├── PlinkoBoard/
│   │   │   ├── PlinkoBoard.tsx
│   │   │   └── Peg.tsx
│   │   └── PrizeSlots.tsx
│   ├── tests/
│   │   ├── trajectory.test.ts
│   │   ├── trajectory-100.test.ts
│   │   └── trajectory-comprehensive.test.ts
│   └── App.tsx
├── docs/
│   └── architecture.md         # Detailed technical docs
├── scripts/
│   ├── cleanup-vitest.mjs      # Kills stray Vitest workers before runs
│   ├── vitest-watch.mjs        # Guarded watch wrapper (requires ALLOW_VITEST_WATCH=1)
│   ├── playwright/             # Playwright/Puppeteer harnesses & manual UI check scripts
│   └── tools/                  # Deterministic physics + analysis utilities (Node CLI)
├── screenshots/                # Output from Playwright/Puppeteer runs (always store assets here)
└── package.json
```

### Agent Folder Guidelines

All LLM coding agents **must** keep generated artifacts inside their designated directories. Use this routing matrix every time you create supporting assets:

| Activity | Directory | Agent Rules |
| --- | --- | --- |
| Playwright / Puppeteer harnesses, manual runners, video recorders | `scripts/playwright/` | Place every executable browser script here. Ensure any captures they create write into `screenshots/` (use `path.join(__dirname, '../../screenshots/...')`). |
| Physics probes, RNG audits, CLI utilities | `scripts/tools/` | Keep deterministic Node scripts here. Never drop `.js`/`.mjs` utilities in the repo root. |
| Visual artifacts (screenshots, videos, GIFs) | `screenshots/` | Store all image/video output in this folder. Create subdirectories (e.g., `screenshots/quality-test/`, `screenshots/videos/`) for large batches. |
| Formal documentation or research notes | `docs/` | Add long-form analysis here rather than scattering markdown files elsewhere. |
| Temporary experiments | `src/dev-tools/` | Use this sandbox for throwaway UI/physics experiments; remove when finished. |
| 🚫 Forbidden | project root | Keep the top level clean—no new scripts, screenshots, or scratch files belong here. |

## 🔧 How It Works

### The Core Innovation

This implementation uses a **brute-force search** approach to find natural initial conditions that lead to the desired outcome. Instead of forcing the ball mid-flight (which looks unnatural), we:

1. **Try different starting positions** - Microscopic variations (0.1-2.5px) from center
2. **Run full physics simulation** - Complete realistic physics for each attempt
3. **Check landing slot** - Does it land in target?
4. **Return trajectory** - Use the successful one for animation

**Why this works**: Plinko is a chaotic system. Tiny changes in starting position (imperceptible to users) create completely different trajectories due to cascading peg collisions.

### Physics Engine

**Constants:**
```typescript
GRAVITY: 980           // px/s² (9.8 m/s² scaled)
RESTITUTION: 0.75      // 75% energy retention on bounce
BALL_RADIUS: 7         // Ball size
PEG_RADIUS: 7          // Peg size
COLLISION_RADIUS: 14   // Ball + Peg (collision threshold)
DT: 1/60              // 60 FPS timestep
TERMINAL_VELOCITY: 600 // Max fall speed
```

**Collision Detection** (4-step process):

1. **Detect collision** - Check if ball overlaps with any peg
2. **Binary search** - Find exact collision moment (10 iterations for precision)
3. **Collision response** - Reflect velocity using physics, apply restitution
4. **Safety check** - Ensure no overlaps remain (push ball away if needed)

**Bucket Physics:**
- Floor bouncing with damping (50% restitution)
- Wall collisions with damping (60% restitution)
- Natural settling when velocity < 5px/s
- Small random horizontal movement on bounces

### Trajectory Generation

```typescript
generateTrajectory({
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 7,
  selectedIndex: 3,  // Target slot (0-6)
  seed: 12345
})
```

**Algorithm:**
1. Generate deterministic peg layout
2. Try up to 50,000 initial conditions:
   - Start position: center ± microscopic offset (0-2.5px)
   - Start velocity: always 0 (realistic drop)
   - Bounce randomness: 0.2-0.8 (varies per attempt)
3. Run full physics simulation for each
4. Return first trajectory that lands in target slot

**Performance:**
- Average: 50-200ms per trajectory
- Worst case: 5-10s (very rare, < 0.1%)
- Success rate: 100% (validated with 10,000+ runs)

## 📖 Documentation

See [docs/architecture.md](docs/architecture.md) for comprehensive technical documentation including:
- Detailed physics engine explanation
- Binary search collision detection algorithm
- Bucket physics implementation
- Testing strategy and validation
- Performance optimization tips
- Debugging guide

## 🧪 Testing Philosophy

**Three-tier validation:**

1. **Basic Tests** (`trajectory.test.ts`)
   - Validates fundamental properties
   - Checks frame counts, rotation, peg hits
   - Ensures deterministic behavior (same seed = same trajectory)

2. **100 Trajectory Test** (`trajectory-100.test.ts`)
   - Tests 100 trajectories across all slots
   - Validates zero overlaps
   - Quick validation during development

3. **Comprehensive Test** (`trajectory-comprehensive.test.ts`)
   - **10,000 random trajectories**
   - Checks for overlaps (must be 0)
   - Validates smooth motion (no teleportation)
   - Confirms 100% success rate

**Current Results:**
```
Total runs: 10,000
Success rate: 100.00%
Overlap violations: 0
Max overlap: 0.00px
Unnatural movements: 0
```

## 🎮 Usage Examples

### Basic Usage

```typescript
import { generateTrajectory } from './game/trajectory';

// Generate trajectory to slot 3
const trajectory = generateTrajectory({
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
  slotCount: 7,
  selectedIndex: 3,
  seed: Date.now()
});

// Animate ball
trajectory.forEach((point, frame) => {
  updateBallPosition(point.x, point.y, point.rotation);
});
```

### Deterministic Testing

```typescript
// Same seed always produces same trajectory
const traj1 = generateTrajectory({ ...params, seed: 42 });
const traj2 = generateTrajectory({ ...params, seed: 42 });

// traj1 === traj2 (identical frame-by-frame)
```

### Query Parameter Testing

```
http://localhost:5173/?seed=12345
```

Same seed = same prize + same trajectory (reproducible for debugging)

## 🔬 Physics Validation

### Collision Detection Quality

```typescript
// Every frame is validated:
for (const point of trajectory) {
  for (const peg of pegs) {
    const distance = Math.sqrt(
      (point.x - peg.x) ** 2 +
      (point.y - peg.y) ** 2
    );

    // Ball edge must never overlap peg edge
    expect(distance).toBeGreaterThanOrEqual(
      COLLISION_RADIUS - 0.1 // 0.1px numerical tolerance
    );
  }
}
```

### Motion Smoothness

```typescript
// Frame-to-frame movement must be continuous
for (let i = 1; i < trajectory.length; i++) {
  const dx = trajectory[i].x - trajectory[i-1].x;
  const dy = trajectory[i].y - trajectory[i-1].y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // No teleportation - max 20px per frame
  expect(distance).toBeLessThanOrEqual(20);
}
```

## 🎯 Key Technical Decisions

### Why Deterministic Physics?

**Problem**: Pure random physics can't guarantee outcomes

**Solution**: Pre-compute entire trajectory before animation

**Benefits**:
- Guaranteed outcomes (critical for sweepstakes/prizes)
- Smooth animation without real-time physics
- Reproducible for debugging and testing
- Fair and transparent

**Trade-offs**:
- Trajectory generation takes time (50-200ms)
- Not truly random (but appears random)
- Requires sophisticated search algorithm

### Why Binary Search for Collisions?

**Problem**: Ball can "tunnel" through pegs at high speeds

**Solution**: Binary search finds exact collision moment

**Benefit**: Perfect accuracy, zero overlaps

### Why Brute Force Search?

**Problem**: Physics is chaotic - impossible to predict trajectory backward

**Solution**: Try many initial conditions until one works

**Benefit**: Guarantees natural-looking physics

## 📈 Performance

### Trajectory Generation
- Average: 50-200ms
- Worst case: 5-10s (< 0.1% of cases)
- Optimization: Early exit when target found

### Animation
- Target: 60 FPS (16.67ms/frame)
- Actual: Consistent 60 FPS
- Rendering: CSS transforms (GPU accelerated)
- Memory: < 50MB for trajectory data

### Potential Optimizations
- Trajectory caching (reuse successful paths)
- Web Workers (move physics off main thread)
- WASM compilation (10x speed boost)
- Spatial hashing (reduce collision checks)

## 🎨 Visual Configuration

### Board Dimensions
```typescript
boardWidth: 375      // Fixed width for popup
boardHeight: 500     // Adjustable
pegRows: 10          // More rows = longer game
slotCount: 7         // Number of prize slots
```

### Physics Tuning
```typescript
GRAVITY: 980         // Higher = faster fall
RESTITUTION: 0.75    // Higher = bouncier
BALL_RADIUS: 7       // Visual size
BORDER_WIDTH: 8      // Wall thickness
```

## 🐛 Debugging Tips

### Common Issues

**Ball falls through pegs:**
- Verify collision detection is enabled
- Check COLLISION_RADIUS = BALL_RADIUS + PEG_RADIUS
- Run overlap tests

**Trajectory generation fails:**
- Increase maxAttempts (currently 50,000)
- Check peg layout doesn't block target
- Verify board dimensions are reasonable

**Unnatural movement:**
- Check velocity clamping
- Verify frame distance < 20px
- Enable debug logging

### Debug Logging

```typescript
// In trajectory.ts
const DEBUG = true;

if (DEBUG) {
  console.log(`Attempt ${attempt}: slot ${landedSlot}`);
  console.log(`Collision with peg (${peg.row}, ${peg.col})`);
}
```

## 🚀 Future Enhancements

- [ ] Multi-ball support
- [ ] Custom peg layouts
- [ ] Sound effects on collisions
- [ ] Particle trail effects
- [ ] Variable difficulty modes
- [ ] Web Worker physics
- [ ] Trajectory caching
- [ ] WASM optimization

## 🔗 Related Projects

This architecture can be adapted for:
- Pachinko machines
- Pinball games
- Prize wheel spinners
- Any physics game requiring predetermined outcomes

## 📝 Tech Stack

- **React 18.3** - UI framework
- **TypeScript 5.6** - Type safety
- **Vite 6.0** - Build tool
- **Vitest 3.2** - Testing framework
- **Tailwind CSS 3.4** - Styling

## 📄 License

MIT

## 🙏 Credits

Physics engine implements:
- Binary search collision detection
- Deterministic RNG (LCG algorithm)
- Chaos-based trajectory search
- 4-step collision response
- Realistic bucket physics

Built with comprehensive testing: 10,000+ validation runs ensuring 100% accuracy.

---

**Note**: See [docs/architecture.md](docs/architecture.md) for the complete technical deep-dive including collision detection algorithms, binary search implementation, bucket physics, and testing strategy.
