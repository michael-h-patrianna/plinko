# Board Geometry Module

## Overview

The `boardGeometry.ts` module is the **single source of truth** for all Plinko board dimensions, physics constants, and geometric calculations. It ensures consistency across:

- Trajectory simulation (`trajectory.ts`)
- Visual rendering (`PlinkoBoard.tsx`, `Ball.tsx`, `Peg.tsx`, `Slot.tsx`)
- Collision detection (physics engine)
- Test fixtures

## Cross-Platform Compatibility

This module is designed to work on **both web and React Native**:
- All calculations use standard JavaScript math
- No DOM-specific APIs
- No CSS-specific features
- Compatible with React Native's coordinate system

## Architecture

```
src/game/boardGeometry.ts
├── Constants
│   ├── PHYSICS          → Physics simulation parameters
│   ├── BOARD            → Board layout configuration
│   ├── RESPONSIVE       → Responsive sizing breakpoints
│   ├── DROP_ZONE_*      → Drop zone definitions
│
├── Peg Layout
│   └── generatePegLayout()  → Creates staggered peg pattern
│
├── Slot Calculations
│   ├── calculateSlotDimensions()  → Computes slot geometry
│   ├── clampSlotIndexFromX()      → Maps X coordinate to slot
│   ├── getSlotBoundaries()        → Returns slot wall positions
│
├── Drop Zones
│   ├── getDropZoneRange()   → Returns X coordinate range
│   └── getDropZoneCenter()  → Returns center X coordinate
│
├── Validation
│   ├── validateSlotIndex()
│   ├── validateBoardDimensions()
│   └── validatePegRows()
│
└── Geometry Helpers
    ├── distance()        → Euclidean distance
    ├── isInCircle()      → Point-in-circle test
    └── isInRect()        → Point-in-rectangle test
```

## Key Concepts

### 1. Physics Constants (`PHYSICS`)

These constants define the core physics simulation behavior:

```typescript
PHYSICS.GRAVITY           // 980 px/s² (scale: 100px = 1m)
PHYSICS.RESTITUTION       // 0.75 (75% energy retained on bounce)
PHYSICS.BALL_RADIUS       // 9 pixels
PHYSICS.PEG_RADIUS        // 7 pixels
PHYSICS.COLLISION_RADIUS  // 16 pixels (BALL + PEG)
PHYSICS.BORDER_WIDTH      // 12 pixels (wall thickness)
```

**CRITICAL**: These values are tuned for realistic ball behavior. Changing them affects:
- Bounce dynamics
- Collision detection accuracy
- Visual appearance
- Game feel

### 2. Board Layout (`BOARD`)

Board dimensions and peg layout:

```typescript
BOARD.DEFAULT_WIDTH            // 375px (standard mobile width)
BOARD.DEFAULT_HEIGHT           // 500px
BOARD.OPTIMAL_PEG_COLUMNS      // 6 columns (FIXED)
BOARD.PLAYABLE_HEIGHT_RATIO    // 0.65 (65% of height for pegs)
```

**IMPORTANT**: `OPTIMAL_PEG_COLUMNS` is **fixed at 6** regardless of prize count. This ensures consistent peg spacing and ball behavior across different prize configurations.

### 3. Responsive Sizing (`RESPONSIVE`)

Adapts peg/ball sizes for different viewport widths:

```typescript
// Small viewports (≤ 360px)
RESPONSIVE.SMALL_PEG_RADIUS     // 6px
RESPONSIVE.SMALL_BALL_RADIUS    // 6px
RESPONSIVE.SMALL_CLEARANCE      // 8px

// Normal viewports (> 360px)
RESPONSIVE.NORMAL_PEG_RADIUS    // 7px
RESPONSIVE.NORMAL_BALL_RADIUS   // 7px
RESPONSIVE.NORMAL_CLEARANCE     // 10px
```

### 4. Drop Zones

Five predefined drop positions:

| Zone | Position (% of width) | Range |
|------|----------------------|-------|
| `left` | 10% | 5% - 15% |
| `left-center` | 30% | 25% - 35% |
| `center` | 50% | 45% - 55% |
| `right-center` | 70% | 65% - 75% |
| `right` | 90% | 85% - 95% |

## API Reference

### Peg Layout

#### `generatePegLayout(params: PegLayoutParams): Peg[]`

Generates complete peg layout with staggered pattern.

**Parameters:**
```typescript
{
  boardWidth: number;     // Total board width (px)
  boardHeight: number;    // Total board height (px)
  pegRows: number;        // Number of peg rows
  cssBorder?: number;     // CSS border thickness (default: 2)
}
```

**Returns:**
```typescript
Array<{
  row: number;    // Row index (0-based)
  col: number;    // Column index within row (0-based)
  x: number;      // Absolute X position (px)
  y: number;      // Absolute Y position (px)
}>
```

**Pattern:**
- Row 0 (non-offset): 7 pegs
- Row 1 (offset): 6 pegs
- Row 2 (non-offset): 7 pegs
- Row 3 (offset): 6 pegs
- ... alternating

**Example:**
```typescript
const pegs = generatePegLayout({
  boardWidth: 375,
  boardHeight: 500,
  pegRows: 10,
});
// Returns 65 pegs total (5 rows × 7 pegs + 5 rows × 6 pegs)
```

### Slot Calculations

#### `calculateSlotDimensions(boardWidth, boardHeight, slotCount, cssBorder?): SlotDimensions`

Computes comprehensive slot geometry.

**Returns:**
```typescript
{
  slotCount: number;        // Number of slots
  slotWidth: number;        // Width of each slot (px)
  playableWidth: number;    // Total width minus borders (px)
  bucketZoneY: number;      // Y position where slots start (px)
  bucketHeight: number;     // Height of slot buckets (px)
  bucketFloorY: number;     // Y position of slot floor (px)
}
```

**Example:**
```typescript
const dims = calculateSlotDimensions(375, 500, 6);
console.log(dims.slotWidth);      // ~58.5px
console.log(dims.playableWidth);  // ~351px
console.log(dims.bucketZoneY);    // ~410px
```

#### `clampSlotIndexFromX(x, boardWidth, slotCount): number`

Converts X coordinate to slot index (0-based).

**Example:**
```typescript
const slot = clampSlotIndexFromX(187.5, 375, 6);
// Returns 3 (middle slot for centered position)
```

**Behavior:**
- Always returns valid index (0 to slotCount-1)
- Clamps positions outside playable area
- Accounts for border width

#### `getSlotBoundaries(slotIndex, boardWidth, slotCount, wallThickness?): { leftEdge, rightEdge }`

Returns slot wall positions for collision detection.

**Parameters:**
- `slotIndex`: Slot index (0-based)
- `wallThickness`: Wall inset in pixels (default: 3)

**Example:**
```typescript
const { leftEdge, rightEdge } = getSlotBoundaries(2, 375, 6);
// Returns absolute X positions for slot walls
```

### Drop Zones

#### `getDropZoneRange(zone, boardWidth): { min, max }`

Returns X coordinate range for a drop zone.

**Example:**
```typescript
const { min, max } = getDropZoneRange('center', 375);
// min: 168.75px (45% of 375)
// max: 206.25px (55% of 375)
```

#### `getDropZoneCenter(zone, boardWidth): number`

Returns center X coordinate of a drop zone.

**Example:**
```typescript
const centerX = getDropZoneCenter('left-center', 375);
// Returns 112.5px (30% of 375)
```

### Validation

#### `validateSlotIndex(slotIndex, slotCount): void`

Throws if slot index is out of bounds.

```typescript
validateSlotIndex(7, 6);  // Throws: "Slot index 7 is out of bounds..."
```

#### `validateBoardDimensions(width, height): void`

Throws if dimensions are invalid or too small.

```typescript
validateBoardDimensions(100, 500);  // Throws: "Board dimensions too small..."
```

#### `validatePegRows(pegRows): void`

Throws if peg row count is outside recommended range (5-20).

```typescript
validatePegRows(3);  // Throws: "...out of recommended range (5-20)"
```

### Geometry Helpers

#### `distance(x1, y1, x2, y2): number`

Calculates Euclidean distance between two points.

```typescript
const dist = distance(0, 0, 3, 4);  // Returns 5
```

#### `isInCircle(pointX, pointY, circleX, circleY, radius): boolean`

Tests if point is inside or on circle boundary.

```typescript
const inside = isInCircle(5, 5, 0, 0, 10);  // true
```

#### `isInRect(pointX, pointY, rectX, rectY, rectWidth, rectHeight): boolean`

Tests if point is inside or on rectangle boundary.

```typescript
const inside = isInRect(5, 5, 0, 0, 10, 10);  // true
```

## Usage Guidelines

### DO ✅

1. **Always import from boardGeometry** for any geometry calculations
2. **Use constants** instead of magic numbers
3. **Call validation functions** before calculations
4. **Test with different board sizes** (320px to 768px width)
5. **Document any new geometric calculations** in this module

### DON'T ❌

1. **Don't hardcode** physics constants in components
2. **Don't duplicate** peg layout logic
3. **Don't assume** specific slot counts
4. **Don't use** viewport-specific units (vh, vw, etc.)
5. **Don't modify** `OPTIMAL_PEG_COLUMNS` without thorough testing

## Common Patterns

### Pattern 1: Rendering Pegs

```typescript
import { generatePegLayout } from '../game/boardGeometry';

function MyBoard({ boardWidth, boardHeight, pegRows }) {
  const pegs = useMemo(() =>
    generatePegLayout({ boardWidth, boardHeight, pegRows }),
    [boardWidth, boardHeight, pegRows]
  );

  return pegs.map((peg) => (
    <Peg key={`${peg.row}-${peg.col}`} x={peg.x} y={peg.y} />
  ));
}
```

### Pattern 2: Slot Detection

```typescript
import { clampSlotIndexFromX } from '../game/boardGeometry';

function detectLandingSlot(ballX: number, boardWidth: number, slotCount: number) {
  return clampSlotIndexFromX(ballX, boardWidth, slotCount);
}
```

### Pattern 3: Collision Detection

```typescript
import { PHYSICS, isInCircle } from '../game/boardGeometry';

function checkPegCollision(ballX, ballY, pegX, pegY) {
  return isInCircle(
    ballX, ballY,
    pegX, pegY,
    PHYSICS.COLLISION_RADIUS
  );
}
```

## Migration Guide

If you have existing code with hardcoded values:

### Before
```typescript
const BORDER_WIDTH = 8;  // ❌ Hardcoded
const BALL_RADIUS = 9;   // ❌ Hardcoded
const pegRadius = boardWidth <= 360 ? 6 : 7;  // ❌ Duplicated logic
```

### After
```typescript
import { PHYSICS, RESPONSIVE } from '../game/boardGeometry';

const BORDER_WIDTH = PHYSICS.BORDER_WIDTH;  // ✅ From module
const BALL_RADIUS = PHYSICS.BALL_RADIUS;     // ✅ From module
const pegRadius = boardWidth <= RESPONSIVE.SMALL_VIEWPORT_WIDTH
  ? RESPONSIVE.SMALL_PEG_RADIUS
  : RESPONSIVE.NORMAL_PEG_RADIUS;  // ✅ From module
```

## Testing

Comprehensive test suite in `src/tests/boardGeometry.test.ts`:

- ✅ Constant values
- ✅ Peg layout generation
- ✅ Slot calculations
- ✅ Drop zone ranges
- ✅ Validation functions
- ✅ Geometry helpers
- ✅ Integration tests

Run tests:
```bash
npm test -- boardGeometry.test.ts
```

## Troubleshooting

### Issue: Pegs touching walls

**Cause**: Insufficient clearance calculation

**Solution**: Check `RESPONSIVE.NORMAL_CLEARANCE` and ensure `generatePegLayout` adds proper padding.

### Issue: Ball escapes board

**Cause**: Slot boundaries extend beyond playable area

**Solution**: Use `getSlotBoundaries()` which accounts for `PHYSICS.BORDER_WIDTH`

### Issue: Wrong slot detected

**Cause**: X coordinate not clamped properly

**Solution**: Always use `clampSlotIndexFromX()` instead of manual division

## Future Enhancements

Potential additions (maintain backwards compatibility):

- [ ] Circular board support
- [ ] Variable peg column counts (advanced mode)
- [ ] Peg pattern presets (dense, sparse, triangular)
- [ ] Slot boundary curve detection (for angled walls)

## Related Documentation

- [Physics Engine](./physics-engine.md)
- [Trajectory Generation](./trajectory-generation.md)
- [Cross-Platform Strategy](./cross-platform.md)
- [Testing Guide](./testing-guide.md)
