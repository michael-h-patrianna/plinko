# Plinko – Deterministic Prize Game (React + TS)

Portable, deterministic Plinko with realistic physics and a clean public API. The source of truth for the package lives in `src/plinko/`; a demo host app lives in `src/demo/`.

## 🎯 Highlights

- ✅ Deterministic outcomes with realistic physics
- 🔒 Zero overlap CCD collision detection (line–circle intersection)
- ⚡ 60 FPS animation via drivers; cached frame data
- 🧪 Deterministic tests and E2E harness
- 🧩 Public API from `@plinko` for components, hooks, theme, and audio

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
# Start dev server with dev tools enabled (default)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build

```bash
# Production build (dev tools disabled by default)
npm run build

# Production build with dev tools enabled (for QA/staging)
VITE_ENABLE_DEV_TOOLS=true npm run build

# Preview production build
npm run preview
```

### Testing

Tests are orchestrated via scripts under `scripts/`. Cleanup runs before each test run to avoid stray workers. Prefer `npm test` for CI-style runs.

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

## 📊 Test Snapshot

Representative current results (deterministic seeds and fixtures maintained by the harnesses):

```
✅ Basic tests: pass
✅ 100 trajectories: 0 overlaps
✅ 10,000 trajectories: 0 overlaps, no teleportation
```

## 🏗️ Architecture & Layout

### Project structure (high level)

```
src/
  demo/                   # Demo host app (providers, dev tools, local motion features)
  plinko/                 # Portable game package (public API)
    animation/            # Ball animation drivers, pooling
    audio/                # Audio system (providers, SFX/music controllers)
    components/           # Presentational React components and screens
    config/               # AppConfig and tokens
    constants/            # Layout/physics constants
    game/                 # Physics, RNG, prize domain, state machine
      trajectory/         # Simulation, CCD collisions, bucket physics
    hooks/                # Orchestration hooks (usePlinkoGame et al.)
    theme/                # Tokens, themes, animation drivers
    utils/platform/       # Typed adapters (.web.ts / .native.ts)
docs/
  architecture.md         # Canonical architecture guide
  INTEGRATION_GUIDE.md    # Host integration (imports, motion features wrapper)
  RESET_ORCHESTRATION.md  # Reset lifecycle contract
  dev-tools.md            # QA/dev tooling
```

## 🛠 Configuration & Feature Flags

Runtime configuration flows through `AppConfigProvider` and can be overridden by host shells.

### Default Behaviour

- Default config and tokens live in `src/plinko/config/` and are provided via `AppConfigProvider`.
- Feature flags are grouped under `featureFlags` (e.g., dev tools, performance mode, drop position mechanic).
- Prize data comes from a `PrizeProvider`. A default deterministic provider is bundled; hosts can override.

### Dev Tools

Development tooling is available for testing and debugging. Dev tools are:
- **Enabled by default** in development mode (`npm run dev`)
- **Disabled by default** in production builds (`npm run build`)
- **Lazy-loaded** to avoid bloating production bundles when disabled
- **Code-split** into separate chunks for optimal tree-shaking

**Features**:
- Theme switching (test different visual themes)
- Viewport simulation (test mobile device sizes)
- Choice mechanic toggle (test different gameplay modes)

**Enable in production** (for QA/staging):
```bash
# Option 1: Environment variable
VITE_ENABLE_DEV_TOOLS=true npm run build

# Option 2: .env.production.local file
echo "VITE_ENABLE_DEV_TOOLS=true" > .env.production.local
npm run build
```

See [docs/dev-tools.md](docs/dev-tools.md) for complete dev tools documentation.

### Overriding in a host application

```tsx
import { AppConfigProvider } from '@plinko/config';

const hostOverrides = {
  featureFlags: {
    devToolsEnabled: false,
  },
  prizeProvider: yourPrizeProvider,
};

root.render(
  <AppConfigProvider value={hostOverrides}>
    <App />
  </AppConfigProvider>
);
```

When the app boots it merges the overrides with the defaults, meaning hosts can gradually adopt deterministic providers without losing the demo fallback.

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

## 🔧 How it works (high level)

### The Core Innovation

This implementation uses a **brute-force search** approach to find natural initial conditions that lead to the desired outcome. Instead of forcing the ball mid-flight (which looks unnatural), we:

1. **Try different starting positions** - Microscopic variations (0.1-2.5px) from center
2. **Run full physics simulation** - Complete realistic physics for each attempt
3. **Check landing slot** - Does it land in target?
4. **Return trajectory** - Use the successful one for animation

**Why this works**: Plinko is a chaotic system. Tiny changes in starting position (imperceptible to users) create completely different trajectories due to cascading peg collisions.

### Physics engine

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

**Collision Detection** (CCD process):

1. **Line-circle intersection** - Check if ball's movement path intersects any peg using parametric math
2. **Find collision point** - Calculate exact collision moment along the path (t parameter in [0,1])
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

Start here:
- [docs/INTEGRATION_GUIDE.md](docs/INTEGRATION_GUIDE.md) – public API and host integration
- [docs/architecture.md](docs/architecture.md) – system overview, layers, modules
- [docs/RESET_ORCHESTRATION.md](docs/RESET_ORCHESTRATION.md) – reset lifecycle and guarantees
- [docs/dev-tools.md](docs/dev-tools.md) – QA/dev tooling

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

## 🎮 Usage

Render the game using the public API:

```tsx
import {
  usePlinkoGame,
  PlinkoBoard,
  StartScreen,
  ThemeProvider,
  AudioProvider,
  themes
} from '@plinko';

export function PlinkoExperience() {
  const game = usePlinkoGame();

  return (
    <AudioProvider>
      <ThemeProvider theme={themes.default}>
        {game.state === 'idle' && <StartScreen onStart={game.startGame} />}
        <PlinkoBoard {...game.boardProps} />
      </ThemeProvider>
    </AudioProvider>
  );
}
```

## 🔬 Physics validation

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

## 🎯 Key technical decisions

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

### Why CCD (Continuous Collision Detection)?

**Problem**: Ball can "tunnel" through pegs at high speeds

**Solution**: Line-circle intersection math finds exact collision point along movement path

**Benefit**: Perfect accuracy, zero overlaps, 100% detection rate

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

## 🎨 Visual configuration

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

## 🐛 Debugging tips

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

## 🚀 Future enhancements

- [ ] Multi-ball support
- [ ] Custom peg layouts
- [ ] Sound effects on collisions
- [ ] Particle trail effects
- [ ] Variable difficulty modes
- [ ] Web Worker physics
- [ ] Trajectory caching
- [ ] WASM optimization

## 🔗 Related projects

This architecture can be adapted for:
- Pachinko machines
- Pinball games
- Prize wheel spinners
- Any physics game requiring predetermined outcomes

## 📝 Tech stack

- **React 18.3** - UI framework
- **TypeScript 5.6** - Type safety
- **Vite 6.0** - Build tool
- **Vitest 3.2** - Testing framework
- **Tailwind CSS 3.4** - Styling

## 📄 License

MIT

## 🙏 Credits

Physics engine implements:
- CCD (Continuous Collision Detection) via line-circle intersection
- Deterministic RNG (LCG algorithm)
- Chaos-based trajectory search
- Physics-based collision response with restitution
- Realistic bucket physics

Built with comprehensive testing: 10,000+ validation runs ensuring 100% accuracy.

---

**Note**: See [docs/architecture.md](docs/architecture.md) for the complete technical deep-dive including collision detection algorithms, CCD implementation, bucket physics, and testing strategy.
