# Theming Token System

## Overview

The Plinko application now includes a comprehensive design token system that provides cross-platform compatibility between React Web and React Native. All visual values (colors, spacing, typography, animations, etc.) are centralized in `/src/theme/tokens.ts`.

## Design Tokens File

**Location**: `/src/theme/tokens.ts`

This file contains all design tokens organized by category. The tokens are designed with cross-platform constraints in mind, ensuring compatibility with both web and React Native.

## Cross-Platform Constraints

The token system adheres to strict cross-platform rules:

### ✅ ALLOWED (Cross-Platform Compatible)
- Colors (hex, rgba)
- **Linear gradients ONLY**
- Opacity values
- Transforms (translate, scale, rotate)
- Spacing values (numbers convertible to dp/rem)
- Border widths and radii
- Z-index layers
- Animation durations and easing functions

### ❌ FORBIDDEN (Web-Only, Breaks React Native)
- Box shadows (use border-based depth instead)
- Text shadows
- Radial gradients
- Conic gradients
- Backdrop filters
- CSS clip-path
- Animated blur effects (static blur may be acceptable)

## Token Categories

### 1. Color Tokens (`colorTokens`)

Comprehensive color palette including:
- Neutral colors (white, black, gray scales)
- Brand colors (blue, violet)
- Status colors (emerald, red, amber)
- Prize colors (orange, yellow)
- Brutalist theme colors

**Example**:
```typescript
import { colorTokens } from '../theme/tokens';

const textColor = colorTokens.gray[100];
const primaryColor = colorTokens.blue[500];
```

### 2. Spacing Tokens (`spacingTokens`)

Numeric spacing values that work on both platforms (px on web, dp on RN).

**Range**: 0 to 256 (in 4px increments)

**Example**:
```typescript
import { spacingTokens } from '../theme/tokens';

const padding = `${spacingTokens[4]}px`; // 16px
const margin = `${spacingTokens[8]}px`; // 32px
```

**Helper Function**:
```typescript
import { getSpacing } from '../theme/tokens';

const padding = getSpacing(4, true); // Returns '1rem' for web
const paddingRN = getSpacing(4, false); // Returns 16 for React Native
```

### 3. Typography Tokens (`typographyTokens`)

Font families, sizes, weights, line heights, and letter spacing.

**Example**:
```typescript
import { typographyTokens } from '../theme/tokens';

const fontSize = `${typographyTokens.fontSize.lg}px`; // 18px
const fontWeight = typographyTokens.fontWeight.bold; // 700
```

**Helper Function**:
```typescript
import { getFontSize } from '../theme/tokens';

const size = getFontSize('lg', true); // Returns '1.125rem' for web
const sizeRN = getFontSize('lg', false); // Returns 18 for React Native
```

### 4. Border Radius Tokens (`borderRadiusTokens`)

Standard border radius values and component-specific radii.

**Example**:
```typescript
import { borderRadiusTokens } from '../theme/tokens';

const radius = `${borderRadiusTokens.lg}px`; // 8px
const ballRadius = '50%'; // Use for circular elements
```

**Helper Function**:
```typescript
import { getBorderRadius } from '../theme/tokens';

const radius = getBorderRadius('lg', true); // Returns '8px' for web
const radiusRN = getBorderRadius('lg', false); // Returns 8 for React Native
```

### 5. Opacity Tokens (`opacityTokens`)

Predefined opacity values from 0 to 1.

**Example**:
```typescript
import { opacityTokens } from '../theme/tokens';

const style = {
  opacity: opacityTokens[80], // 0.8
};
```

### 6. Animation Tokens (`animationTokens`)

Standard durations and easing functions.

**Example**:
```typescript
import { animationTokens } from '../theme/tokens';

const transition = `all ${animationTokens.duration.normal}ms ${animationTokens.easing.easeOut}`;
```

### 7. Gradient Tokens (`gradientTokens`)

**IMPORTANT**: All gradients are linear only (no radial or conic).

**Categories**:
- Background gradients
- Button gradients
- Prize gradients
- Game element gradients
- Effect gradients

**Example**:
```typescript
import { gradientTokens } from '../theme/tokens';

const background = gradientTokens.background.main;
const ballGradient = gradientTokens.game.ball;
```

### 8. Border Width Tokens (`borderWidthTokens`)

Standard border widths from 0 to 8px.

**Example**:
```typescript
import { borderWidthTokens } from '../theme/tokens';

const border = `${borderWidthTokens[2]}px solid ${color}`;
```

### 9. Z-Index Tokens (`zIndexTokens`)

Layering system for the application.

**Layers**:
- `base`: 0
- `board`: 10
- `peg`: 15
- `slot`: 16
- `ballTrail`: 18
- `ballGlow`: 19
- `ballGlowMid`: 20
- `ball`: 21
- `overlay`: 30
- `countdown`: 40
- `modal`: 1100
- `tooltip`: 1300
- etc.

**Example**:
```typescript
import { zIndexTokens } from '../theme/tokens';

const style = {
  zIndex: zIndexTokens.ball, // 21
};
```

### 10. Size Tokens (`sizeTokens`)

Common dimensions for game elements and components.

**Categories**:
- `ball`: diameter, glows, trail
- `peg`: diameter
- `board`: width, height, borders
- `button`: heights
- `input`: height
- `icon`: sizes

**Example**:
```typescript
import { sizeTokens } from '../theme/tokens';

const ballWidth = `${sizeTokens.ball.diameter}px`; // 14px
const boardWidth = `${sizeTokens.board.width}px`; // 450px
```

### 11. Breakpoint Tokens (`breakpointTokens`)

Responsive breakpoints (numeric values for easy comparison).

**Example**:
```typescript
import { breakpointTokens } from '../theme/tokens';

if (windowWidth < breakpointTokens.md) {
  // Mobile layout
}
```

### 12. Semantic Tokens (`semanticTokens`)

Theme-aware shortcuts for common use cases (text colors, backgrounds, borders, status colors).

**Example**:
```typescript
import { semanticTokens } from '../theme/tokens';

const textColor = semanticTokens.text.primary;
const successColor = semanticTokens.status.success;
```

### 13. Component Tokens (`componentTokens`)

Pre-configured token combinations for specific components.

**Example**:
```typescript
import { componentTokens } from '../theme/tokens';

const cardStyle = {
  padding: `${componentTokens.card.padding}px`,
  borderRadius: `${componentTokens.card.borderRadius}px`,
};
```

## Helper Functions

### `hexToRgba(hex: string, opacity: number): string`

Converts hex color to rgba with specified opacity.

**Example**:
```typescript
import { hexToRgba } from '../theme/tokens';

const transparentBlue = hexToRgba('#3b82f6', 0.5); // 'rgba(59, 130, 246, 0.5)'
```

### `getSpacing(key, web = true)`

Returns spacing in rem (web) or number (RN).

### `getFontSize(key, web = true)`

Returns font size in rem (web) or number (RN).

### `getBorderRadius(key, web = true)`

Returns border radius in px/percentage (web) or number (RN).

## Migration Guide

### Step 1: Import Tokens

Add token imports at the top of your component:

```typescript
import {
  sizeTokens,
  zIndexTokens,
  opacityTokens,
  animationTokens,
  borderRadiusTokens,
  borderWidthTokens,
  spacingTokens,
} from '../theme/tokens';
```

### Step 2: Replace Magic Numbers

**Before**:
```typescript
style={{
  width: '16px',
  height: '16px',
  zIndex: 18,
  opacity: 0.6,
  transition: 'all 50ms linear',
}}
```

**After**:
```typescript
style={{
  width: `${sizeTokens.ball.trail}px`,
  height: `${sizeTokens.ball.trail}px`,
  zIndex: zIndexTokens.ballTrail,
  opacity: opacityTokens[60],
  transition: `all ${animationTokens.duration.fastest}ms linear`,
}}
```

### Step 3: Replace Gradients

Ensure all gradients are linear:

**Before**:
```typescript
background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)'
```

**After**:
```typescript
background: 'linear-gradient(135deg, #3b82f6 0%, transparent 70%)'
// or use token
background: gradientTokens.game.ballGlow
```

### Step 4: Use Semantic Tokens for Colors

**Before**:
```typescript
color: '#f1f5f9'
```

**After**:
```typescript
color: semanticTokens.text.primary
```

## Refactored Components

The following components have been fully refactored to use design tokens:

1. ✅ **Ball.tsx** - All dimensions, z-indices, opacities, and animations use tokens
2. ✅ **Countdown.tsx** - All dimensions, spacing, animations, and gradients use tokens

### Remaining Components

24 component files still contain magic numbers and inline styles:
- PlinkoBoard/Slot.tsx (24 occurrences)
- PrizeClaimed.tsx (21 occurrences)
- PrizeReveal/PurchaseOfferView.tsx (16 occurrences)
- StartScreen.tsx (14 occurrences)
- BallLauncher.tsx (13 occurrences)
- PlinkoBoard/Peg.tsx (12 occurrences)
- And 18 more...

**Migration Priority**:
1. High-impact visual components (PlinkoBoard/Slot.tsx, Peg.tsx)
2. Prize reveal components
3. UI chrome components (StartScreen, PopupContainer)
4. Effect components

## Benefits

1. **Cross-Platform Ready**: Tokens work on both web and React Native
2. **Consistency**: Single source of truth for all visual values
3. **Maintainability**: Change values in one place
4. **Type Safety**: Full TypeScript support
5. **Refactoring Safety**: Named constants prevent typos
6. **Theme Integration**: Tokens complement existing theme system

## Integration with Existing Themes

The token system works alongside the existing theme system. Tokens provide:
- Base values (numbers, scales)
- Cross-platform compatibility
- Helper functions

While themes provide:
- Brand-specific colors
- Component variants
- Theme-aware semantics

**Example - Using Both**:
```typescript
import { useTheme } from '../theme';
import { sizeTokens, zIndexTokens, opacityTokens } from '../theme/tokens';

const { theme } = useTheme();

const style = {
  width: `${sizeTokens.ball.diameter}px`, // Token
  background: theme.gradients.ballMain, // Theme
  zIndex: zIndexTokens.ball, // Token
  opacity: opacityTokens[90], // Token
  color: theme.colors.text.primary, // Theme
};
```

## Future Work

1. Complete migration of remaining 24 component files
2. Add token-based test utilities
3. Create Storybook documentation for tokens
4. Add React Native implementation guide
5. Create visual token reference page

## Testing

Token-based components should have:
- Snapshot tests to catch visual regressions
- Integration tests with theme system
- RN compatibility validation tests

**Example Test**:
```typescript
import { describe, it, expect } from 'vitest';
import { sizeTokens, gradientTokens } from '../theme/tokens';

describe('Token System', () => {
  it('should have valid ball dimensions', () => {
    expect(sizeTokens.ball.diameter).toBe(14);
    expect(sizeTokens.ball.glowMid).toBe(24);
    expect(sizeTokens.ball.glowOuter).toBe(36);
  });

  it('should only use linear gradients', () => {
    Object.values(gradientTokens.game).forEach(gradient => {
      if (typeof gradient === 'string' && gradient.includes('gradient')) {
        expect(gradient).toMatch(/linear-gradient/);
        expect(gradient).not.toMatch(/radial-gradient|conic-gradient/);
      }
    });
  });
});
```

## Conclusion

The design token system provides a robust foundation for maintaining visual consistency and cross-platform compatibility. It complements the existing theme system while providing additional structure and type safety for numeric values, dimensions, and animations.

For questions or contributions, see the main project README or contact the development team.
