# Design Token Migration Guide

## Overview

This guide helps you migrate existing components from hardcoded values to the design token system. The goal is to replace all magic numbers and inline style values with tokens for better maintainability and cross-platform compatibility.

## Quick Reference

### Common Replacements

| Magic Number | Token Replacement |
|--------------|------------------|
| `width: '14px'` | `width: ${sizeTokens.ball.diameter}px` |
| `opacity: 0.8` | `opacity: opacityTokens[80]` |
| `zIndex: 21` | `zIndex: zIndexTokens.ball` |
| `transition: 'all 200ms ease'` | `transition: all ${animationTokens.duration.normal}ms ${animationTokens.easing.easeOut}` |
| `padding: '16px'` | `padding: ${spacingTokens[4]}px` |
| `borderRadius: '8px'` | `borderRadius: ${borderRadiusTokens.lg}px` |
| `fontSize: '18px'` | `fontSize: ${typographyTokens.fontSize.lg}px` |

## Migration Checklist

For each component file:

- [ ] Add token imports at the top
- [ ] Identify all magic numbers in style objects
- [ ] Replace hardcoded dimensions with size tokens
- [ ] Replace hardcoded spacing with spacing tokens
- [ ] Replace hardcoded opacity values with opacity tokens
- [ ] Replace hardcoded z-index with z-index tokens
- [ ] Replace hardcoded animation durations with animation tokens
- [ ] Replace radial/conic gradients with linear gradients
- [ ] Verify no web-only CSS features remain
- [ ] Test component visually
- [ ] Update component tests if needed

## Step-by-Step Migration

### Step 1: Add Token Imports

At the top of your component file, import the tokens you need:

```typescript
import {
  sizeTokens,
  zIndexTokens,
  opacityTokens,
  animationTokens,
  borderRadiusTokens,
  borderWidthTokens,
  spacingTokens,
  typographyTokens,
  colorTokens,
  gradientTokens,
  semanticTokens,
} from '../theme/tokens';
```

**Tip**: Only import what you need. Use your IDE's auto-import feature.

### Step 2: Identify Magic Numbers

Search for patterns like:
- Numeric literals in style objects: `width: '16px'`, `opacity: 0.8`
- Hardcoded durations: `setTimeout(..., 300)`
- Z-index values: `zIndex: 20`
- Spacing values: `padding: '1rem'`, `margin: '8px'`

**Example - Before**:
```typescript
<div style={{
  width: '14px',
  height: '14px',
  opacity: 0.8,
  zIndex: 21,
  borderRadius: '50%',
  padding: '16px',
}} />
```

### Step 3: Replace with Tokens

**Example - After**:
```typescript
<div style={{
  width: `${sizeTokens.ball.diameter}px`,
  height: `${sizeTokens.ball.diameter}px`,
  opacity: opacityTokens[80],
  zIndex: zIndexTokens.ball,
  borderRadius: '50%',
  padding: `${spacingTokens[4]}px`,
}} />
```

### Step 4: Handle Calculated Values

If you have calculations, extract them to constants or compute from tokens:

**Before**:
```typescript
const halfSize = 14 / 2;
const glowSize = 36;
style={{
  left: `${position.x - halfSize}px`,
  width: `${glowSize}px`,
}}
```

**After**:
```typescript
const halfSize = sizeTokens.ball.diameter / 2;
const glowSize = sizeTokens.ball.glowOuter;
style={{
  left: `${position.x - halfSize}px`,
  width: `${glowSize}px`,
}}
```

### Step 5: Replace Gradients

All gradients must be linear (no radial or conic).

**Before**:
```typescript
background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)'
```

**After** (Option 1 - Use Token):
```typescript
background: gradientTokens.game.ballGlow
```

**After** (Option 2 - Linear Replacement):
```typescript
background: 'linear-gradient(135deg, #3b82f6 0%, transparent 70%)'
```

**After** (Option 3 - Theme-Aware):
```typescript
background: theme.gradients.ballGlow
```

### Step 6: Replace Animation Durations

**Before**:
```typescript
setTimeout(() => setVisible(false), 300);
transition: 'all 200ms ease-out'
animate={{ opacity: 1 }}
transition={{ duration: 0.5 }}
```

**After**:
```typescript
setTimeout(() => setVisible(false), animationTokens.duration.medium);
transition: `all ${animationTokens.duration.normal}ms ${animationTokens.easing.easeOut}`
animate={{ opacity: 1 }}
transition={{ duration: animationTokens.duration.slow / 1000 }}
```

**Note**: Framer Motion expects seconds, so divide by 1000.

### Step 7: Replace Z-Index Values

**Before**:
```typescript
zIndex: 18  // Trail
zIndex: 19  // Outer glow
zIndex: 20  // Mid glow
zIndex: 21  // Ball
```

**After**:
```typescript
zIndex: zIndexTokens.ballTrail
zIndex: zIndexTokens.ballGlow
zIndex: zIndexTokens.ballGlowMid
zIndex: zIndexTokens.ball
```

### Step 8: Verify Cross-Platform Compatibility

After migration, check for:

**Web-Only Features** (should be removed or replaced):
```typescript
// ❌ REMOVE THESE
boxShadow: '0 4px 8px rgba(0,0,0,0.1)'  // Use borders instead
textShadow: '2px 2px 4px rgba(0,0,0,0.5)'  // Avoid or find alternative
background: 'radial-gradient(...)'  // Replace with linear
backdropFilter: 'blur(10px)'  // Remove
filter: 'blur(4px)'  // Remove (static blur in inner elements may be OK)
```

**Cross-Platform Safe**:
```typescript
// ✅ THESE ARE FINE
border: `${borderWidthTokens[1]}px solid ${color}`
background: 'linear-gradient(135deg, #start, #end)'
opacity: opacityTokens[50]
transform: 'translateX(10px) scale(1.2)'
```

## Component-Specific Patterns

### Ball Component

**Dimensions**:
```typescript
sizeTokens.ball.diameter       // 14px - main ball
sizeTokens.ball.glowMid        // 24px - middle glow
sizeTokens.ball.glowOuter      // 36px - outer glow
sizeTokens.ball.trail          // 16px - trail particles
```

**Layers**:
```typescript
zIndexTokens.ballTrail         // 18
zIndexTokens.ballGlow          // 19
zIndexTokens.ballGlowMid       // 20
zIndexTokens.ball              // 21
```

### Peg Component

**Dimensions**:
```typescript
sizeTokens.peg.diameter        // 8px
```

**Layers**:
```typescript
zIndexTokens.peg               // 15
```

### Slot Component

**Layers**:
```typescript
zIndexTokens.slot              // 16
```

**Border Widths**:
```typescript
borderWidthTokens[2]           // 2px
borderWidthTokens[3]           // 3px
borderWidthTokens[4]           // 4px
borderWidthTokens[6]           // 6px (brutalist theme)
```

### Board Component

**Dimensions**:
```typescript
sizeTokens.board.width         // 450px
sizeTokens.board.height        // 500px
sizeTokens.board.borderWidth   // 8px
sizeTokens.board.playableHeightPercent  // 0.65
```

**Layers**:
```typescript
zIndexTokens.board             // 10
```

### Countdown Component

**Dimensions**:
```typescript
// Use local constant for countdown size
const COUNTDOWN_SIZE = 200;

// Spacing for calculations
spacingTokens[5]  // 20px
spacingTokens[6]  // 24px
spacingTokens[8]  // 32px
spacingTokens[20] // 80px (particle distance)
```

**Animations**:
```typescript
animationTokens.duration.normal   // 200ms
animationTokens.duration.medium   // 300ms
animationTokens.duration.slow     // 500ms
animationTokens.duration.slower   // 800ms
```

**Layers**:
```typescript
zIndexTokens.countdown         // 40
```

## Common Pitfalls

### Pitfall 1: Forgetting Unit Conversions

**Wrong**:
```typescript
width: sizeTokens.ball.diameter  // Missing 'px'
```

**Correct**:
```typescript
width: `${sizeTokens.ball.diameter}px`
```

### Pitfall 2: Using Radial Gradients

**Wrong**:
```typescript
background: 'radial-gradient(circle, #start, #end)'
```

**Correct**:
```typescript
background: 'linear-gradient(135deg, #start, #end)'
// or
background: gradientTokens.game.ballGlow
```

### Pitfall 3: Not Updating Calculations

**Wrong**:
```typescript
const halfSize = 7; // Hardcoded old value
// But token changed to 14
```

**Correct**:
```typescript
const halfSize = sizeTokens.ball.diameter / 2; // Always correct
```

### Pitfall 4: Framer Motion Duration Units

**Wrong**:
```typescript
transition={{ duration: animationTokens.duration.normal }}  // 200, not 0.2!
```

**Correct**:
```typescript
transition={{ duration: animationTokens.duration.normal / 1000 }}  // 0.2
```

### Pitfall 5: Missing Opacity Tokens

**Wrong**:
```typescript
opacity: 0.8  // Magic number
```

**Correct**:
```typescript
opacity: opacityTokens[80]  // Named token
```

## Testing After Migration

### Visual Testing

1. Run the dev server: `npm run dev`
2. View the component in the browser
3. Compare with screenshots before migration
4. Check all states (hover, active, disabled, etc.)
5. Test with different themes (default, brutalist, etc.)

### Automated Testing

Run the test suite:
```bash
npm test
```

Check for:
- Snapshot failures (expected if values changed)
- Unit test failures (indicates logic issue)
- Integration test failures (indicates visual regression)

### RN Compatibility Check

Search for forbidden patterns:
```bash
# In your component file
grep -E "(box-shadow|text-shadow|radial-gradient|conic-gradient|backdrop-filter|clip-path)" YourComponent.tsx
```

Should return no matches.

## Migration Priority

### High Priority (Visible Game Elements)
1. ✅ Ball.tsx - **COMPLETED**
2. ✅ Countdown.tsx - **COMPLETED**
3. ⏳ PlinkoBoard/Slot.tsx (24 occurrences)
4. ⏳ PlinkoBoard/Peg.tsx (12 occurrences)
5. ⏳ PlinkoBoard/PlinkoBoard.tsx (8 occurrences)

### Medium Priority (UI Components)
6. ⏳ StartScreen.tsx (14 occurrences)
7. ⏳ PrizeClaimed.tsx (21 occurrences)
8. ⏳ PrizeReveal/RewardItem.tsx (4 occurrences)
9. ⏳ ThemedButton.tsx (3 occurrences)

### Lower Priority (Effects & Utilities)
10. ⏳ BallLauncher.tsx (13 occurrences)
11. ⏳ WinAnimations/*.tsx
12. ⏳ effects/*.tsx

## Example: Full Component Migration

See `Ball.tsx` and `Countdown.tsx` for complete examples of migrated components.

**Key Points from Ball.tsx**:
- All dimensions use `sizeTokens`
- All layers use `zIndexTokens`
- All opacities use `opacityTokens`
- All animations use `animationTokens`
- Calculations derive from tokens
- No radial gradients remain

**Key Points from Countdown.tsx**:
- Board dimensions use `sizeTokens.board`
- Spacing calculations use `spacingTokens`
- Animation durations use `animationTokens`
- Z-index uses `zIndexTokens.countdown`
- Radial gradients replaced with linear
- Opacity values use `opacityTokens`

## Getting Help

If you're unsure about a migration:

1. Check the token system documentation: `/docs/theming-token-system.md`
2. Look at completed examples: `Ball.tsx`, `Countdown.tsx`
3. Search for similar patterns in the codebase
4. Check the tokens file directly: `/src/theme/tokens.ts`

## Contribution Guidelines

When migrating a component:

1. Create a feature branch: `git checkout -b refactor/migrate-<component>-tokens`
2. Migrate the component following this guide
3. Test thoroughly (visual + automated)
4. Update this document if you find new patterns
5. Create a pull request with before/after screenshots
6. Request review from code-reviewer agent

## Summary

Migration to design tokens:
- ✅ Improves maintainability
- ✅ Ensures cross-platform compatibility
- ✅ Provides type safety
- ✅ Enables consistent styling
- ✅ Simplifies theme integration
- ✅ Makes refactoring safer

Follow this guide to migrate components systematically and safely.
