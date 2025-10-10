# Board Geometry Reference

`src/game/boardGeometry.ts` is the single source of truth for Plinko board dimensions, physics constants, responsive sizing, and helper utilities shared by the physics engine and the renderer. This document summarises the available constants and helpers, explains how they interact with other game modules, and highlights the constraints that keep the implementation portable between React web and React Native.

## Why this module matters

- Every simulation step (`src/game/trajectory/simulation.ts`) reads constants from here.
- UI components render pegs, slots, and drop zones using the same helpers, guaranteeing visual/physics alignment.
- Reset orchestration and dev tools depend on geometry helpers when re-computing trajectories or highlighting slots.
- New board layouts (different slot counts, row counts) must go through this module to stay deterministic.

## Constants

### `PHYSICS`

The core physics constants shared by the simulation and collision code:

| Constant | Default | Purpose |
| --- | --- | --- |
| `GRAVITY` | `980` | px/s²; matches 9.8 m/s² at 100px = 1m scale |
| `RESTITUTION` | `0.75` | Energy retained on bounce |
| `BALL_RADIUS` | `9` | Ball radius in pixels |
| `PEG_RADIUS` | `7` | Peg radius in pixels |
| `COLLISION_RADIUS` | `16` | Ball + peg radius; used for continuous collision detection |
| `DT` | `1 / 60` | Simulation timestep (60 FPS) |
| `TERMINAL_VELOCITY` | `600` | Downward velocity clamp |
| `MAX_VELOCITY_COMPONENT` | `750` | Axis-aligned velocity clamp for collision response |
| `MAX_SPEED` | `800` | Total velocity magnitude cap |
| `MAX_DIST_PER_FRAME` | `13.3` | Prevents tunnelling when no collision occurs |
| `BORDER_WIDTH` | `12` | Inner wall thickness |
| `MIN_BOUNCE_VELOCITY` | `30` | Ensures the ball never “sticks” on a peg |
| Bucket tuning | See source (`SETTLEMENT_*`, `BUCKET_*`) | Keep bucket physics deterministic |

> Changing these values requires re-running the deterministic regression tests (`npm test -- trajectory-comprehensive.test.ts`) and verifying visual assets.

### `BOARD`

Layout defaults used for rendering and trajectory generation:

- `DEFAULT_WIDTH` / `DEFAULT_HEIGHT` – baseline board size.
- `DEFAULT_PEG_ROWS` – 10 rows by default.
- `OPTIMAL_PEG_COLUMNS` – fixed at 6 to maintain spacing regardless of prize count.
- `PEG_TOP_OFFSET` and `PEG_WALL_CLEARANCE` – control how far pegs sit from the border.

### `RESPONSIVE`

Breakpoints for small viewports (≤360px). Peg and ball radii shrink to keep clearances consistent on mobile.

### Drop zones

`DROP_ZONE_RANGES` and `DROP_ZONE_POSITIONS` define the five droppable lanes (`left`, `left-center`, `center`, `right-center`, `right`). These values are used by the choice mechanic (`useGameState`) and dev tools when previewing the alternate gameplay mode.

## Peg layout helpers

```ts
export function generatePegLayout({
  boardWidth,
  boardHeight,
  pegRows,
  cssBorder = BOARD.CSS_BORDER,
}: PegLayoutParams): Peg[];
```

- Alternates offset rows to create the classic Plinko pattern.
- Keeps clearance between pegs, walls, and the ball based on responsive sizes.
- Returns `{ row, col, x, y }` tuples consumed by both the renderer and physics simulation.

### Validation utilities

- `validateBoardDimensions(width, height)` – throws if the board is too small.
- `validatePegRows(pegRows)` – recommended range 5–20.
- `validateSlotIndex(index, slotCount)` – prevents out-of-range slot lookups.

> Run these validations before calculating trajectories or building custom boards to catch configuration mistakes early.

## Slot geometry

```ts
export function calculateSlotDimensions(boardWidth, boardHeight, slotCount, cssBorder = BOARD.CSS_BORDER): SlotDimensions;
```

Returns:

- `slotWidth` and `playableWidth`
- `bucketZoneY` / `bucketHeight` / `bucketFloorY`

Internally this calls the shared utility `src/utils/slotDimensions.ts` to keep bucket sizing consistent with the visual layout.

Other helpers:

- `clampSlotIndexFromX(x, boardWidth, slotCount)` – safely maps an X coordinate to a slot index.
- `getSlotBoundaries(slotIndex, boardWidth, slotCount, wallThickness = 3)` – used by bucket physics and slot highlighting to compute wall positions.
- `getDropZoneRange(zone, boardWidth)` / `getDropZoneCenter(zone, boardWidth)` – convenience wrappers for dev tools and the choice mechanic.

## Geometry helpers

- `distance(x1, y1, x2, y2)` – Euclidean distance used across the physics code.
- `isInCircle(pointX, pointY, circleX, circleY, radius)` – quick inclusion test for peg collisions.
- `isInRect(pointX, pointY, rectX, rectY, rectWidth, rectHeight)` – used for hit-testing drop zones.

## Integration points

- `src/game/trajectory/simulation.ts` reads `PHYSICS` constants, calls `generatePegLayout`, and relies on slot helpers to clamp positions.
- `src/game/trajectory/bucket.ts` uses `getSlotBoundaries` and `calculateBucketDimensions` to simulate wall/floor collisions.
- UI components render pegs and slots using the same helpers to avoid visual drift.
- Dev tools and reset logic depend on `getDropZoneRange` when regenerating deterministic trajectories for the choice mechanic.

## Cross-platform considerations

- All geometry calculations are pure TypeScript with no DOM access – safe for React Native.
- Units are plain numbers (pixels). When porting to RN, convert to density-independent pixels in the rendering layer.
- Avoid hardcoding geometry outside this module; import constants/helpers instead to keep physics and UI aligned.

## Testing

Related specs live in `src/tests/boardGeometry.test.ts` and integration suites under `src/tests/physics/`. When adjusting constants or helper logic:

1. Run unit tests: `npm test -- boardGeometry.test.ts`.
2. Run deterministic regression: `npm test -- trajectory-100.test.ts` (quick) and `npm test -- trajectory-comprehensive.test.ts` (full sweep).
3. Capture screenshots if board dimensions change (see `screenshots/`).

## Extending the module

When adding new geometry helpers or responsive behaviours:

- Export them here so both physics and UI benefit.
- Document new utilities in this file.
- Update the physics documentation (`docs/physics-and-trajectory.md`) if the change affects simulation behaviour.
