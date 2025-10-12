# Token System Philosophy & Usage Guide

## Overview

The token system centralizes all design values (colors, spacing, typography, animations) into a single source of truth. This approach ensures visual consistency, simplifies cross-platform compatibility, and makes design changes predictable across the entire codebase.

**Core Philosophy:**
- **Single Source of Truth:** All visual values live in `src/theme/tokens.ts`
- **Cross-Platform First:** Every token works on both web and React Native
- **Semantic Meaning:** Tokens have clear, semantic names that convey intent
- **Type Safety:** Full TypeScript support with autocomplete
- **No Magic Values:** Replace `padding: 16px` with `padding: spacingTokens[4]`

---

## Table of Contents

- [Why Tokenization?](#why-tokenization)
- [Token Categories](#token-categories)
- [Usage Patterns](#usage-patterns)
- [Migration Guide](#migration-guide)
- [Style Pattern Tokens](#style-pattern-tokens)
- [Theme Utilities](#theme-utilities)
- [Cross-Platform Constraints](#cross-platform-constraints)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)

---

## Why Tokenization?

### The Problem

**Before tokens:**
```tsx
// Scattered, inconsistent inline values
<div style={{
  padding: '16px',
  borderRadius: '8px',
  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  fontSize: '16px',
  fontWeight: 600,
  color: '#f1f5f9'
}}>
  Content
</div>

// Different values doing the same thing
<button style={{ padding: '15px' }} /> // ❌ Off by 1px
<div style={{ padding: '16px' }} />    // ❌ Inconsistent
```

**Problems:**
- Hard to change design values globally
- Inconsistent spacing/sizing across components
- Magic numbers with no semantic meaning
- Copy-paste style drift
- No cross-platform compatibility guarantees
- Difficult to maintain design system

### The Solution

**After tokens:**
```tsx
import { spacingTokens, borderRadiusTokens, gradientTokens, typographyTokens, colorTokens } from '@/theme/tokens';

<div style={{
  padding: spacingTokens[4],
  borderRadius: borderRadiusTokens.lg,
  background: gradientTokens.button.primary,
  fontSize: typographyTokens.fontSize.base,
  fontWeight: typographyTokens.fontWeight.semibold,
  color: colorTokens.gray[100]
}}>
  Content
</div>
```

**Benefits:**
- Change design values in one place
- Guaranteed consistency across components
- Semantic names convey intent (`spacingTokens[4]` = "standard spacing")
- Cross-platform compatible (works on React Native)
- Type-safe with autocomplete
- Design system enforced by code

---

## Token Categories

### Color Tokens

**Location:** `colorTokens` in `src/theme/tokens.ts`

```typescript
// Neutral palette
colorTokens.white
colorTokens.black
colorTokens.gray[50...950]

// Brand colors
colorTokens.blue[50...900]
colorTokens.violet[50...900]

// Status colors
colorTokens.emerald[50...900]  // Success
colorTokens.red[50...900]      // Error
colorTokens.amber[50...900]    // Warning

// Game colors
colorTokens.orange[50...900]
colorTokens.yellow[50...900]

// Brutalist theme
colorTokens.brutalist.red
colorTokens.brutalist.white
colorTokens.brutalist.black
```

**Usage:**
```tsx
// Background
style={{ backgroundColor: colorTokens.gray[900] }}

// Text
style={{ color: colorTokens.blue[500] }}

// Border
style={{ borderColor: colorTokens.gray[600] }}
```

### Semantic Tokens

**Location:** `semanticTokens` in `src/theme/tokens.ts`

Semantic tokens provide theme-aware shortcuts:

```typescript
// Text colors
semanticTokens.text.primary      // Main text color
semanticTokens.text.secondary    // Subdued text
semanticTokens.text.disabled     // Disabled state
semanticTokens.text.link         // Link color

// Background colors
semanticTokens.background.primary
semanticTokens.background.elevated

// Status colors
semanticTokens.status.success
semanticTokens.status.error
semanticTokens.status.warning
semanticTokens.status.info
```

### Spacing Tokens

**Location:** `spacingTokens` in `src/theme/tokens.ts`

```typescript
spacingTokens[0]   // 0px
spacingTokens[1]   // 4px
spacingTokens[2]   // 8px
spacingTokens[3]   // 12px
spacingTokens[4]   // 16px (standard)
spacingTokens[6]   // 24px
spacingTokens[8]   // 32px
spacingTokens[12]  // 48px
// ... up to spacingTokens[64] (256px)
```

**Usage:**
```tsx
// Padding
style={{ padding: spacingTokens[4] }}
style={{ paddingTop: spacingTokens[2], paddingBottom: spacingTokens[6] }}

// Margin
style={{ margin: spacingTokens[8] }}

// Gap
style={{ gap: spacingTokens[3] }}
```

### Typography Tokens

**Location:** `typographyTokens` in `src/theme/tokens.ts`

```typescript
// Font families
typographyTokens.fontFamily.primary    // Inter
typographyTokens.fontFamily.mono       // Monospace
typographyTokens.fontFamily.brutalist  // Arial

// Font sizes
typographyTokens.fontSize.xs    // 12px
typographyTokens.fontSize.sm    // 14px
typographyTokens.fontSize.base  // 16px
typographyTokens.fontSize.lg    // 18px
typographyTokens.fontSize.xl    // 20px
typographyTokens.fontSize['2xl'] // 24px
// ... up to '9xl' (128px)

// Font weights
typographyTokens.fontWeight.light      // 300
typographyTokens.fontWeight.normal     // 400
typographyTokens.fontWeight.semibold   // 600
typographyTokens.fontWeight.bold       // 700

// Line height
typographyTokens.lineHeight.tight   // 1.25
typographyTokens.lineHeight.normal  // 1.5
typographyTokens.lineHeight.loose   // 2

// Letter spacing
typographyTokens.letterSpacing.tight   // -0.4
typographyTokens.letterSpacing.normal  // 0
typographyTokens.letterSpacing.wide    // 0.4
```

**Usage:**
```tsx
style={{
  fontFamily: typographyTokens.fontFamily.primary,
  fontSize: typographyTokens.fontSize.base,
  fontWeight: typographyTokens.fontWeight.semibold,
  lineHeight: typographyTokens.lineHeight.normal
}}
```

### Border Radius Tokens

**Location:** `borderRadiusTokens` in `src/theme/tokens.ts`

```typescript
borderRadiusTokens.none    // 0
borderRadiusTokens.sm      // 2px
borderRadiusTokens.md      // 6px
borderRadiusTokens.lg      // 8px
borderRadiusTokens.xl      // 12px
borderRadiusTokens['2xl']  // 16px
borderRadiusTokens.full    // 50% (9999px)

// Component-specific
borderRadiusTokens.button  // 3px
borderRadiusTokens.card    // 12px
borderRadiusTokens.modal   // 16px
borderRadiusTokens.ball    // 50%
borderRadiusTokens.peg     // 50%
```

### Gradient Tokens (Linear Only)

**Location:** `gradientTokens` in `src/theme/tokens.ts`

All gradients are linear (cross-platform compatible):

```typescript
// Background gradients
gradientTokens.background.main
gradientTokens.background.overlay
gradientTokens.background.card

// Button gradients
gradientTokens.button.primary
gradientTokens.button.primaryHover
gradientTokens.button.secondary

// Prize gradients
gradientTokens.prize.orange
gradientTokens.prize.yellow
gradientTokens.prize.emerald

// Game element gradients
gradientTokens.game.ball
gradientTokens.game.ballGlow
gradientTokens.game.pegDefault
gradientTokens.game.pegActive
```

**Usage:**
```tsx
style={{ background: gradientTokens.button.primary }}
```

### Opacity Tokens

**Location:** `opacityTokens` in `src/theme/tokens.ts`

```typescript
opacityTokens[0]    // 0 (transparent)
opacityTokens[10]   // 0.1
opacityTokens[25]   // 0.25
opacityTokens[50]   // 0.5 (semi-transparent)
opacityTokens[75]   // 0.75
opacityTokens[100]  // 1 (opaque)
```

### Animation Tokens

**Location:** `animationTokens` in `src/theme/tokens.ts`

```typescript
// Durations (milliseconds)
animationTokens.duration.fast      // 150ms
animationTokens.duration.normal    // 200ms
animationTokens.duration.medium    // 300ms
animationTokens.duration.slow      // 500ms

// Easing functions
animationTokens.easing.easeIn
animationTokens.easing.easeOut
animationTokens.easing.easeInOut
animationTokens.easing.bounce
```

### Z-Index Tokens

**Location:** `zIndexTokens` in `src/theme/tokens.ts`

```typescript
// Named layers
zIndexTokens.base        // 0
zIndexTokens.board       // 10
zIndexTokens.ball        // 21
zIndexTokens.overlay     // 30
zIndexTokens.modal       // 1100
zIndexTokens.tooltip     // 1300
```

### Size Tokens

**Location:** `sizeTokens` in `src/theme/tokens.ts`

```typescript
// Ball sizes
sizeTokens.ball.diameter       // 14px
sizeTokens.ball.glowMid       // 24px
sizeTokens.ball.trail         // 8px
sizeTokens.ball.maxTrailLength // 20

// Peg sizes
sizeTokens.peg.diameter       // 8px

// Board dimensions
sizeTokens.board.width        // 450px
sizeTokens.board.height       // 500px
```

### Component Tokens

**Location:** `componentTokens` in `src/theme/tokens.ts`

Pre-configured component styles:

```typescript
// Card
componentTokens.card.padding       // 24px
componentTokens.card.borderRadius  // 12px
componentTokens.card.borderWidth   // 1px

// Button
componentTokens.button.paddingX    // 24px
componentTokens.button.paddingY    // 12px
componentTokens.button.fontSize    // 16px

// Modal
componentTokens.modal.padding      // 32px
componentTokens.modal.borderRadius // 16px
```

---

## Usage Patterns

### Basic Component Styling

```tsx
import { spacingTokens, colorTokens, borderRadiusTokens, typographyTokens } from '@/theme/tokens';

function Card({ children }: PropsWithChildren) {
  return (
    <div style={{
      padding: spacingTokens[6],
      backgroundColor: colorTokens.gray[800],
      borderRadius: borderRadiusTokens.card,
      color: colorTokens.gray[100],
      fontSize: typographyTokens.fontSize.base
    }}>
      {children}
    </div>
  );
}
```

### Combining Tokens

```tsx
import { spacingTokens, gradientTokens, typographyTokens } from '@/theme/tokens';

function PrimaryButton({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: `${spacingTokens[3]}px ${spacingTokens[6]}px`,
        background: gradientTokens.button.primary,
        borderRadius: borderRadiusTokens.button,
        fontSize: typographyTokens.fontSize.base,
        fontWeight: typographyTokens.fontWeight.semibold,
        border: 'none',
        color: colorTokens.white
      }}
    >
      {children}
    </button>
  );
}
```

### Using Component Tokens

```tsx
import { componentTokens, colorTokens } from '@/theme/tokens';

function Modal({ children }: PropsWithChildren) {
  return (
    <div style={{
      padding: componentTokens.modal.padding,
      borderRadius: componentTokens.modal.borderRadius,
      backgroundColor: colorTokens.gray[900]
    }}>
      {children}
    </div>
  );
}
```

---

## Migration Guide

### Step 1: Identify Inline Styles

Find components with magic numbers:

```tsx
// BEFORE: Magic numbers everywhere
<div style={{
  padding: '16px',
  margin: '24px',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#f1f5f9'
}}>
  Content
</div>
```

### Step 2: Replace with Tokens

```tsx
// AFTER: Semantic tokens
import { spacingTokens, borderRadiusTokens, typographyTokens, colorTokens } from '@/theme/tokens';

<div style={{
  padding: spacingTokens[4],
  margin: spacingTokens[6],
  borderRadius: borderRadiusTokens.lg,
  fontSize: typographyTokens.fontSize.sm,
  color: colorTokens.gray[100]
}}>
  Content
</div>
```

### Step 3: Extract Common Patterns

If you find repeated styles, consider:

1. **Use Style Pattern Tokens** (see next section)
2. **Create Component-Specific Tokens** (add to `componentTokens`)
3. **Use Theme Utilities** (see Theme Utilities section)

### Migration Checklist

For each component with inline styles:

- [ ] Replace hardcoded spacing with `spacingTokens`
- [ ] Replace color hex codes with `colorTokens` or `semanticTokens`
- [ ] Replace font sizes with `typographyTokens.fontSize`
- [ ] Replace border radius with `borderRadiusTokens`
- [ ] Replace gradients with `gradientTokens`
- [ ] Replace z-index values with `zIndexTokens`
- [ ] Remove any forbidden CSS (box-shadow, blur, radial gradients)

---

## Style Pattern Tokens

**Location:** `stylePatternTokens` in `src/theme/tokens.ts`

Common layout patterns as reusable objects:

### Flexbox Patterns

```tsx
import { stylePatternTokens } from '@/theme/tokens';

// Center content
<div style={stylePatternTokens.flexCenter}>
  Centered
</div>

// Column layout
<div style={stylePatternTokens.flexCenterColumn}>
  Centered vertically
</div>

// Space between
<div style={stylePatternTokens.flexBetween}>
  <span>Left</span>
  <span>Right</span>
</div>
```

**Available patterns:**
```typescript
stylePatternTokens.flexCenter         // Center horizontally & vertically
stylePatternTokens.flexCenterColumn   // Center in column layout
stylePatternTokens.flexStart          // Align to start
stylePatternTokens.flexBetween        // Space between items
```

### Positioning Patterns

```tsx
// Fill entire parent
<div style={stylePatternTokens.absoluteFill}>
  Full overlay
</div>

// Center absolutely
<div style={stylePatternTokens.absoluteCenter}>
  Centered overlay
</div>

// Non-interactive overlay
<div style={stylePatternTokens.overlay}>
  Pointer-events disabled
</div>
```

### Text Patterns

```tsx
// Single line truncation
<div style={stylePatternTokens.textTruncate}>
  This text will truncate with ellipsis...
</div>

// Multi-line clamp
<div style={stylePatternTokens.textClamp(3)}>
  This text will clamp to 3 lines maximum...
</div>
```

### Combining Style Patterns

```tsx
import { stylePatternTokens, spacingTokens, colorTokens } from '@/theme/tokens';

<div style={{
  ...stylePatternTokens.flexCenter,
  padding: spacingTokens[4],
  backgroundColor: colorTokens.gray[800]
}}>
  Centered with padding
</div>
```

---

## Theme Utilities

**Location:** `src/theme/themeUtils.tsx`

Utility functions for dynamic styling:

### `createOverlayBackground`

Create semi-transparent backgrounds:

```tsx
import { createOverlayBackground } from '@/theme/themeUtils';

<div style={{
  background: createOverlayBackground('#000000', 0.5)
}}>
  50% opacity black overlay
</div>
```

### `createCardBackground`

Complete card styling in one call:

```tsx
import { createCardBackground } from '@/theme/themeUtils';

<div style={createCardBackground(
  '#1e293b',  // backgroundColor
  0.95,       // opacity
  '12px',     // borderRadius
  '24px'      // padding
)}>
  Card content
</div>
```

### `createGradientText`

Cross-platform gradient text:

```tsx
import { createGradientText } from '@/theme/themeUtils';
import { gradientTokens } from '@/theme/tokens';

<h1 style={createGradientText(gradientTokens.button.primary)}>
  Gradient Title
</h1>
```

### `createFlexLayout`

Dynamic flexbox layouts:

```tsx
import { createFlexLayout } from '@/theme/themeUtils';

<div style={createFlexLayout(
  'center',        // alignItems
  'space-between', // justifyContent
  '12px',          // gap
  'row'            // flexDirection
)}>
  Flex content
</div>
```

### `createAbsoluteOverlay`

Positioned overlays:

```tsx
import { createAbsoluteOverlay } from '@/theme/themeUtils';

<div style={createAbsoluteOverlay(
  { top: 0, left: 0 },  // position
  100,                  // zIndex
  'auto'                // pointerEvents
)}>
  Overlay
</div>
```

### `createTransform`

GPU-accelerated transforms:

```tsx
import { createTransform } from '@/theme/themeUtils';

<div style={createTransform({
  translateX: '50%',
  translateY: -10,
  scale: 1.2,
  rotate: 45
})}>
  Transformed element
</div>
```

### `createResponsiveFontSize`

Responsive typography:

```tsx
import { createResponsiveFontSize } from '@/theme/themeUtils';

<div style={{
  fontSize: createResponsiveFontSize(containerWidth, {
    min: 12,
    max: 20,
    minWidth: 320,
    maxWidth: 768
  })
}}>
  Responsive text
</div>
```

---

## Cross-Platform Constraints

### Allowed Features

✅ **Cross-Platform Safe:**
- All color tokens
- All spacing tokens
- Linear gradients only
- Opacity
- Transforms (translate, scale, rotate)
- Typography tokens
- Border radius

### Forbidden Features

❌ **Web-Only (Not in Tokens):**
- `box-shadow`, `text-shadow`
- `blur`, `filter`, `backdrop-filter`
- Radial/conic gradients
- Pseudo-elements (`:before`, `:after`)
- `clip-path`, `mask`

### Why These Constraints?

React Native doesn't support many CSS-only features. By limiting tokens to cross-platform primitives, we ensure:

1. **Future portability** - Code works on React Native without rewrites
2. **Predictable behavior** - Same visuals on all platforms
3. **Performance** - GPU-accelerated animations only

---

## Best Practices

### 1. Always Use Tokens

```tsx
// ❌ BAD: Magic numbers
<div style={{ padding: '16px' }}>

// ✅ GOOD: Semantic tokens
<div style={{ padding: spacingTokens[4] }}>
```

### 2. Use Semantic Tokens When Possible

```tsx
// ❌ OK: Direct color reference
<div style={{ color: colorTokens.gray[100] }}>

// ✅ BETTER: Semantic meaning
<div style={{ color: semanticTokens.text.primary }}>
```

### 3. Combine Style Patterns

```tsx
// ❌ BAD: Repeating common patterns
<div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}}>

// ✅ GOOD: Use pattern tokens
<div style={stylePatternTokens.flexCenter}>
```

### 4. Use Component Tokens for Common Components

```tsx
// ❌ BAD: Scattered component styles
<div style={{ padding: 24, borderRadius: 12 }}>

// ✅ GOOD: Component token
<div style={{
  padding: componentTokens.card.padding,
  borderRadius: componentTokens.card.borderRadius
}}>
```

### 5. Document New Tokens

When adding tokens:

```typescript
// ✅ GOOD: Documented token
export const myNewToken = {
  /**
   * Background color for premium badges
   * Used in: Badge, PrizeCard
   */
  premiumBadge: '#fbbf24'
};
```

---

## Common Patterns

### Card Component

```tsx
import { spacingTokens, colorTokens, borderRadiusTokens, stylePatternTokens } from '@/theme/tokens';

function Card({ title, children }: CardProps) {
  return (
    <div style={{
      padding: spacingTokens[6],
      backgroundColor: colorTokens.gray[800],
      borderRadius: borderRadiusTokens.card,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: colorTokens.gray[700]
    }}>
      <h3 style={{
        fontSize: typographyTokens.fontSize.lg,
        fontWeight: typographyTokens.fontWeight.semibold,
        marginBottom: spacingTokens[4],
        color: colorTokens.gray[100]
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}
```

### Button Component

```tsx
import { spacingTokens, borderRadiusTokens, gradientTokens, typographyTokens, colorTokens } from '@/theme/tokens';

function Button({ children, variant = 'primary' }: ButtonProps) {
  const gradients = {
    primary: gradientTokens.button.primary,
    secondary: gradientTokens.button.secondary
  };

  return (
    <button style={{
      padding: `${spacingTokens[3]}px ${spacingTokens[6]}px`,
      background: gradients[variant],
      borderRadius: borderRadiusTokens.button,
      border: 'none',
      fontSize: typographyTokens.fontSize.base,
      fontWeight: typographyTokens.fontWeight.semibold,
      color: colorTokens.white,
      cursor: 'pointer'
    }}>
      {children}
    </button>
  );
}
```

### Modal Component

```tsx
import { componentTokens, colorTokens, stylePatternTokens, zIndexTokens } from '@/theme/tokens';
import { createOverlayBackground } from '@/theme/themeUtils';

function Modal({ children, onClose }: ModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div style={{
        ...stylePatternTokens.absoluteFill,
        background: createOverlayBackground('#000000', 0.75),
        zIndex: zIndexTokens.modal
      }} onClick={onClose} />

      {/* Modal content */}
      <div style={{
        ...stylePatternTokens.absoluteCenter,
        padding: componentTokens.modal.padding,
        borderRadius: componentTokens.modal.borderRadius,
        backgroundColor: colorTokens.gray[900],
        zIndex: zIndexTokens.modal + 1
      }}>
        {children}
      </div>
    </>
  );
}
```

### Form Input

```tsx
import { spacingTokens, borderRadiusTokens, colorTokens, typographyTokens, componentTokens } from '@/theme/tokens';

function Input({ placeholder, value, onChange }: InputProps) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        padding: spacingTokens[3],
        borderRadius: borderRadiusTokens.input,
        border: `1px solid ${colorTokens.gray[600]}`,
        backgroundColor: colorTokens.gray[800],
        color: colorTokens.gray[100],
        fontSize: typographyTokens.fontSize.base,
        height: componentTokens.input.height
      }}
    />
  );
}
```

---

## Related Documentation

- [Style Guide](/docs/meta/styleguide.md) - Coding standards and patterns
- [Animation Pipeline](/docs/animation-pipeline.md) - Animation system integration
- [Theme System](/docs/theming.md) - Theme provider and switching
- [Cross-Platform Architecture](/docs/adr/001-cross-platform-architecture.md) - Platform strategy
