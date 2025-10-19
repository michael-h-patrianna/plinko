# Theme Colors Inventory

This document provides a comprehensive inventory of all color-related values (solid colors and gradients) used in the Plinko application theme system.

## Overview

The Plinko theme system defines colors across two main categories:
- **Solid Colors** (`ThemeColors`): Direct color values for various UI elements
- **Gradients** (`ThemeGradients`): Linear gradient definitions for visual effects

All colors are defined in theme files and consumed throughout the application via the `useTheme()` hook.

---

## Background Colors

### colors.background.primary
- **Type**: Solid Color
- **Title**: Primary Background Color
- **Description**: Main application background
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#0f172a` - slate-900)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#ffffff`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/BallLauncher.tsx`

### colors.background.secondary
- **Type**: Solid Color
- **Title**: Secondary Background Color
- **Description**: Secondary application background, used for layered surfaces
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#1e293b` - slate-800)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#f5f5f5`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/theme/themeUtils.tsx`
  - `src/plinko/components/game/BallLauncher.tsx`
  - `src/plinko/components/game/PlinkoBoard/PlinkoBoard.tsx`

### colors.background.overlayDark
- **Type**: Solid Color (with alpha)
- **Title**: Dark Overlay Background
- **Description**: Semi-transparent overlay for modals and popups
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `rgba(15, 23, 42, 0.98)`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#ffffff`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/layout/popupAnimations.ts`

---

## Surface Colors

### colors.surface.primary
- **Type**: Solid Color
- **Title**: Primary Surface Color
- **Description**: Main surface color for cards and elevated elements
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#1e293b` - slate-800)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#ffffff`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/screens/StartScreen.tsx`
  - `src/plinko/components/game/PlinkoBoard/PlinkoBoard.tsx`
  - `src/plinko/components/effects/celebrations/CelebrationOverlay.tsx`

### colors.surface.secondary
- **Type**: Solid Color
- **Title**: Secondary Surface Color
- **Description**: Secondary surface for nested cards and elements
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#334155` - slate-700)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#f5f5f5`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/BallLauncher.tsx`
  - `src/plinko/components/game/PlinkoBoard/PlinkoBoard.tsx`
  - `src/plinko/components/game/PlinkoBoard/Slot.tsx`
  - `src/plinko/components/effects/celebrations/CelebrationOverlay.tsx`

### colors.surface.elevated
- **Type**: Solid Color
- **Title**: Elevated Surface Color
- **Description**: Highest elevation surface for modal overlays
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#475569` - slate-600)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#ffffff`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/theme/themeUtils.tsx`
  - `src/plinko/components/game/BallLauncher.tsx`
  - `src/plinko/components/game/PlinkoBoard/BorderWall.tsx`

---

## Primary Brand Colors

### colors.primary.main
- **Type**: Solid Color
- **Title**: Primary Brand Color
- **Description**: Main brand color for primary actions and emphasis
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#3b82f6` - blue-500)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#db0000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/theme/prizeColorMapper.ts`
  - `src/plinko/components/effects/YouWonText.tsx`
  - `src/plinko/components/effects/celebrations/CelebrationOverlay.tsx`

### colors.primary.light
- **Type**: Solid Color
- **Title**: Light Primary Brand Color
- **Description**: Lighter variant of primary brand color for hover states
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#60a5fa` - blue-400)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#db0000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/effects/YouWonText.tsx`
  - `src/plinko/components/effects/celebrations/CelebrationOverlay.tsx`

### colors.primary.contrast
- **Type**: Solid Color
- **Title**: Primary Contrast Color
- **Description**: Contrast color for text on primary backgrounds
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#ffffff`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#ffffff`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/PlinkoBoard/ComboLegend.tsx`
  - `src/plinko/components/screens/PrizeReveal/PurchaseOfferView.tsx`

---

## Accent Colors

### colors.accent.main
- **Type**: Solid Color
- **Title**: Main Accent Color
- **Description**: Accent color for secondary emphasis and highlights
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#8b5cf6` - violet-500)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#000000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/screens/StartScreen.tsx`
  - `src/plinko/components/effects/celebrations/CelebrationOverlay.tsx`

### colors.accent.light
- **Type**: Solid Color
- **Title**: Light Accent Color
- **Description**: Lighter variant of accent color
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#a78bfa` - violet-400)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#333333`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/effects/celebrations/CelebrationOverlay.tsx`

---

## Text Colors

### colors.text.primary
- **Type**: Solid Color
- **Title**: Primary Text Color
- **Description**: Main text color for body content
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#f1f5f9` - slate-100)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#000000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/theme/themeUtils.tsx`
  - `src/plinko/components/effects/CurrencyCounter.tsx`
  - `src/plinko/components/game/PlinkoBoard/ComboLegend.tsx`
  - `src/plinko/components/game/PlinkoBoard/Slot.tsx`
  - `src/plinko/components/controls/DropPositionControls.tsx`
  - `src/plinko/components/screens/PrizeReveal/NoWinView.tsx`
  - `src/plinko/components/screens/PrizeReveal/PurchaseOfferView.tsx`
  - `src/plinko/components/game/BallLauncher.tsx`

### colors.text.secondary
- **Type**: Solid Color
- **Title**: Secondary Text Color
- **Description**: Secondary text color for less prominent content
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#cbd5e1` - slate-300)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#333333`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/controls/DropPositionControls.tsx`
  - `src/plinko/components/screens/PrizeReveal/FreeRewardView.tsx`
  - `src/plinko/components/screens/PrizeReveal/PurchaseOfferView.tsx`
  - `src/plinko/components/screens/PrizeClaimed.tsx`
  - `src/plinko/components/screens/PrizeReveal/NoWinView.tsx`

### colors.text.tertiary
- **Type**: Solid Color
- **Title**: Tertiary Text Color
- **Description**: Tertiary text color for subtle hints and labels
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#94a3b8` - slate-400)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#666666`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`

### colors.text.disabled
- **Type**: Solid Color
- **Title**: Disabled Text Color
- **Description**: Text color for disabled UI elements
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#64748b` - slate-500)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#999999`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`

### colors.text.inverse
- **Type**: Solid Color
- **Title**: Inverse Text Color
- **Description**: Text color for use on dark backgrounds (often white on dark themes)
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#0f172a` - slate-900)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#ffffff`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/effects/WinAnimations/SlotWinReveal.tsx`
  - `src/plinko/components/game/PlinkoBoard/PlinkoBoard.tsx`
  - `src/plinko/components/game/PlinkoBoard/ComboLegend.tsx`
  - `src/plinko/components/game/PlinkoBoard/Slot.tsx`
  - `src/plinko/components/game/BallLauncher.tsx`

---

## Status Colors

### colors.status.success
- **Type**: Solid Color
- **Title**: Success Status Color
- **Description**: Color for success messages and positive feedback
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#10b981` - emerald-500)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#000000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/effects/CurrencyCounter.tsx`
  - `src/plinko/components/screens/PrizeClaimed.tsx`
  - `src/plinko/components/game/Countdown.tsx`
  - `src/plinko/components/ui/GradientText/index.ts`

### colors.status.warning
- **Type**: Solid Color
- **Title**: Warning Status Color
- **Description**: Color for warnings and caution messages
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#f59e0b` - amber-500)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#db0000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/PlinkoBoard/BorderWall.tsx`
  - `src/plinko/components/screens/PrizeReveal/PurchaseOfferView.tsx`

### colors.status.error
- **Type**: Solid Color
- **Title**: Error Status Color
- **Description**: Color for error messages and destructive actions
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#ef4444` - red-500)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#db0000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/PlinkoBoard/Slot.tsx`
  - `src/plinko/components/screens/PrizeReveal/PurchaseOfferView.tsx`

---

## Prize Colors

### colors.prizes.orange.main
- **Type**: Solid Color
- **Title**: Orange Prize Main Color
- **Description**: Main color for orange prize tier
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#f97316` - orange-500)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#db0000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/theme/prizeColorMapper.ts`

### colors.prizes.orange.light
- **Type**: Solid Color
- **Title**: Orange Prize Light Color
- **Description**: Light variant for orange prize tier
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#fb923c` - orange-400)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#db0000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`

### colors.prizes.orange.dark
- **Type**: Solid Color
- **Title**: Orange Prize Dark Color
- **Description**: Dark variant for orange prize tier
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#ea580c` - orange-600)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#a00000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`

### colors.prizes.yellow.main
- **Type**: Solid Color
- **Title**: Yellow Prize Main Color
- **Description**: Main color for yellow prize tier
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#fbbf24` - yellow-500)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#000000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/theme/prizeColorMapper.ts`

### colors.prizes.yellow.light
- **Type**: Solid Color
- **Title**: Yellow Prize Light Color
- **Description**: Light variant for yellow prize tier
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#facc15` - yellow-400)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#333333`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`

### colors.prizes.yellow.dark
- **Type**: Solid Color
- **Title**: Yellow Prize Dark Color
- **Description**: Dark variant for yellow prize tier
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#eab308` - yellow-600)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#000000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`

### colors.prizes.emerald.main
- **Type**: Solid Color
- **Title**: Emerald Prize Main Color
- **Description**: Main color for emerald prize tier
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#10b981` - emerald-500)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#db0000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/theme/prizeColorMapper.ts`

### colors.prizes.emerald.light
- **Type**: Solid Color
- **Title**: Emerald Prize Light Color
- **Description**: Light variant for emerald prize tier
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#34d399` - emerald-400)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#db0000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`

### colors.prizes.emerald.dark
- **Type**: Solid Color
- **Title**: Emerald Prize Dark Color
- **Description**: Dark variant for emerald prize tier
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#059669` - emerald-600)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#a00000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`

### colors.prizes.blue.main
- **Type**: Solid Color
- **Title**: Blue Prize Main Color
- **Description**: Main color for blue prize tier
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#3b82f6` - blue-500)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#000000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/theme/prizeColorMapper.ts`

### colors.prizes.blue.light
- **Type**: Solid Color
- **Title**: Blue Prize Light Color
- **Description**: Light variant for blue prize tier
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#60a5fa` - blue-400)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#333333`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`

### colors.prizes.blue.dark
- **Type**: Solid Color
- **Title**: Blue Prize Dark Color
- **Description**: Dark variant for blue prize tier
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#2563eb` - blue-600)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#000000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`

### colors.prizes.violet.main
- **Type**: Solid Color
- **Title**: Violet Prize Main Color
- **Description**: Main color for violet prize tier
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#8b5cf6` - violet-500)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#db0000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/theme/prizeColorMapper.ts`

### colors.prizes.violet.light
- **Type**: Solid Color
- **Title**: Violet Prize Light Color
- **Description**: Light variant for violet prize tier
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#a78bfa` - violet-400)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#db0000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`

### colors.prizes.violet.dark
- **Type**: Solid Color
- **Title**: Violet Prize Dark Color
- **Description**: Dark variant for violet prize tier
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#7c3aed` - violet-600)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#a00000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`

---

## Game Element Colors

### colors.game.ball.primary
- **Type**: Solid Color
- **Title**: Ball Primary Color
- **Description**: Primary color for the plinko ball
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#fbbf24` - yellow-500)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#db0000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/PlinkoBoard/PlinkoBoard.tsx`
  - `src/plinko/components/game/PlinkoBoard/BorderWall.tsx`
  - `src/plinko/components/game/Countdown.tsx`
  - `src/plinko/components/game/BallLauncher.tsx`
  - `src/plinko/components/game/PlinkoBoard/components/OptimizedBallRenderer.tsx`
  - `src/plinko/components/screens/PrizeReveal/PurchaseOfferView.tsx`

### colors.game.ball.secondary
- **Type**: Solid Color
- **Title**: Ball Secondary Color
- **Description**: Secondary/border color for the plinko ball
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#fb923c` - orange-400)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#000000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/BallLauncher.tsx`
  - `src/plinko/components/game/PlinkoBoard/components/OptimizedBallRenderer.tsx`

### colors.game.ball.highlight
- **Type**: Solid Color
- **Title**: Ball Highlight Color
- **Description**: Highlight color for ball shine effects
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#ffffff`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#ffffff`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/BallLauncher.tsx`

### colors.game.ball.borderRadius
- **Type**: Border Radius Value
- **Title**: Ball Border Radius
- **Description**: Border radius for ball element (typically 50% for circle)
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `50%`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `50%`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`

### colors.game.peg.highlight
- **Type**: Solid Color
- **Title**: Peg Highlight Color
- **Description**: Color for peg when highlighted during ball collision
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#facc15` - yellow-400)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#db0000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/PlinkoBoard/Peg.tsx`
  - `src/plinko/components/game/PlinkoBoard/PlinkoBoard.tsx`

### colors.game.peg.borderRadius
- **Type**: Border Radius Value
- **Title**: Peg Border Radius
- **Description**: Border radius for peg element (typically 50% for circle)
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `50%`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `50%`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/PlinkoBoard/Peg.tsx`

### colors.game.slot.border
- **Type**: Solid Color
- **Title**: Slot Border Color
- **Description**: Border color for prize slots
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#475569` - slate-600)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#000000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/PlinkoBoard/Slot.tsx`

### colors.game.slot.borderWidth
- **Type**: Border Width Value
- **Title**: Slot Border Width
- **Description**: Border width for prize slots
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `2px`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `4px`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/PlinkoBoard/Slot.tsx`

### colors.game.slot.borderRadius
- **Type**: Border Radius Value
- **Title**: Slot Border Radius
- **Description**: Border radius for prize slots
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `0 0 8px 8px`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `0`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/PlinkoBoard/PlinkoBoard.tsx`
  - `src/plinko/components/game/PlinkoBoard/Slot.tsx`

### colors.game.slot.background
- **Type**: Solid Color (with alpha)
- **Title**: Slot Background Color
- **Description**: Background color for prize slots
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `rgba(15, 23, 42, 0.8)`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#ffffff`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/PlinkoBoard/Slot.tsx`

### colors.game.slot.slotStyles
- **Type**: Array of Style Overrides
- **Title**: Per-Slot Style Overrides
- **Description**: Optional array of per-slot style overrides for themes with limited color palettes (e.g., brutalist)
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/brutalistTheme.ts` (7 unique slot styles with varying borders)
- **Used In**:
  - `src/plinko/components/game/PlinkoBoard/Slot.tsx`

### colors.game.launcher.base
- **Type**: Solid Color
- **Title**: Launcher Base Color
- **Description**: Base color for the ball launcher mechanism
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#64748b` - slate-500)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#000000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/BallLauncher.tsx`

### colors.game.launcher.track
- **Type**: Solid Color
- **Title**: Launcher Track Color
- **Description**: Color for launcher track lines/guides
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#475569` - slate-600)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#333333`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/BallLauncher.tsx`

### colors.game.launcher.accent
- **Type**: Solid Color
- **Title**: Launcher Accent Color
- **Description**: Accent color for launcher highlights
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#94a3b8` - slate-400)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#db0000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/BallLauncher.tsx`

### colors.game.launcher.borderRadius
- **Type**: Border Radius Value
- **Title**: Launcher Border Radius
- **Description**: Border radius for launcher elements
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `4px`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `0`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`

### colors.game.board.border
- **Type**: Border Style String
- **Title**: Board Border
- **Description**: Complete border style for the game board
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `1px solid #475569`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `4px solid #000000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/PlinkoBoard/PlinkoBoard.tsx`

### colors.game.board.borderRadius
- **Type**: Border Radius Value
- **Title**: Board Border Radius
- **Description**: Border radius for the game board
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `1.25rem`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `0`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/PlinkoBoard/PlinkoBoard.tsx`

---

## Border Colors

### colors.border.default
- **Type**: Solid Color
- **Title**: Default Border Color
- **Description**: Default border color for UI elements
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#475569` - slate-600)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#000000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/PlinkoBoard/Peg.tsx`
  - `src/plinko/components/game/PlinkoBoard/PlinkoBoard.tsx`
  - `src/plinko/components/game/PlinkoBoard/Slot.tsx`
  - `src/plinko/components/screens/StartScreen.tsx`
  - `src/plinko/components/ui/ThemedButton.tsx`

### colors.border.light
- **Type**: Solid Color
- **Title**: Light Border Color
- **Description**: Lighter variant of border color
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `#64748b` - slate-500)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#666666`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`

---

## Shadow Colors

### colors.shadows.default
- **Type**: Solid Color (typically used with alpha)
- **Title**: Default Shadow Color
- **Description**: Base color for shadows and depth effects
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `rgba(0, 0, 0, 0.5)`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#000000`)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/theme/themeUtils.tsx`
  - `src/plinko/components/game/PlinkoBoard/Peg.tsx`
  - `src/plinko/components/game/BallLauncher.tsx`
  - `src/plinko/components/game/PlinkoBoard/components/OptimizedBallRenderer.tsx`

---

## Gradient Definitions

### gradients.backgroundCard
- **Type**: Linear Gradient
- **Title**: Background Card Gradient
- **Description**: Gradient for card backgrounds
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `linear-gradient(135deg, rgba(30,41,59,0.98) 0%, rgba(15,23,42,1) 100%)`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#ffffff` - solid color, no gradient)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/PlinkoBoard/PlinkoBoard.tsx`

### gradients.buttonPrimary
- **Type**: Linear Gradient
- **Title**: Primary Button Gradient
- **Description**: Gradient for primary action buttons
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `linear-gradient(135deg, rgb(96, 165, 250) 0%, rgb(59, 130, 246) 50%, rgb(37, 99, 235) 100%)`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#db0000` - solid color, no gradient)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/screens/StartScreen.tsx`
  - `src/plinko/components/screens/PrizeClaimed.tsx`

### gradients.buttonDanger
- **Type**: Linear Gradient
- **Title**: Danger Button Gradient
- **Description**: Gradient for destructive/danger buttons
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%)`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#db0000` - solid color, no gradient)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/PlinkoBoard/Slot.tsx`

### gradients.prizeOrange
- **Type**: Linear Gradient
- **Title**: Orange Prize Gradient
- **Description**: Gradient for orange prize tier visualization
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#db0000` - solid color, no gradient)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/theme/prizeColorMapper.ts`

### gradients.prizeYellow
- **Type**: Linear Gradient
- **Title**: Yellow Prize Gradient
- **Description**: Gradient for yellow prize tier visualization
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #f59e0b 100%)`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#000000` - solid color, no gradient)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/Countdown.tsx`

### gradients.prizeEmerald
- **Type**: Linear Gradient
- **Title**: Emerald Prize Gradient
- **Description**: Gradient for emerald prize tier visualization
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `linear-gradient(135deg, #6ee7b7 0%, #10b981 50%, #059669 100%)`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#db0000` - solid color, no gradient)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`

### gradients.prizeBlue
- **Type**: Linear Gradient
- **Title**: Blue Prize Gradient
- **Description**: Gradient for blue prize tier visualization
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `linear-gradient(135deg, #93c5fd 0%, #3b82f6 50%, #2563eb 100%)`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#000000` - solid color, no gradient)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`

### gradients.prizeViolet
- **Type**: Linear Gradient
- **Title**: Violet Prize Gradient
- **Description**: Gradient for violet prize tier visualization
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 50%, #7c3aed 100%)`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#db0000` - solid color, no gradient)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`

### gradients.glow
- **Type**: Linear Gradient
- **Title**: Glow Effect Gradient
- **Description**: Gradient for glow and highlight effects
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 100%)`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `transparent` - no effect)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/Countdown.tsx`

### gradients.shine
- **Type**: Linear Gradient
- **Title**: Shine Effect Gradient
- **Description**: Gradient for shine/shimmer effects on buttons and elements
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `transparent` - no effect)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/ui/ThemedButton.tsx`
  - `src/plinko/components/game/PlinkoBoard/components/OptimizedBallRenderer.tsx`

### gradients.ballMain
- **Type**: Linear Gradient
- **Title**: Ball Main Gradient
- **Description**: Main gradient for the plinko ball
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `linear-gradient(135deg, #fef3c7 0%, #fbbf24 30%, #fb923c 70%, #f97316 100%)`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#db0000` - solid color, no gradient)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/Countdown.tsx`
  - `src/plinko/components/game/PlinkoBoard/components/OptimizedBallRenderer.tsx`

### gradients.ballGlow
- **Type**: Linear Gradient
- **Title**: Ball Glow Gradient
- **Description**: Glow effect gradient for the plinko ball
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `linear-gradient(135deg, rgba(251,191,36,0.5) 0%, rgba(251,146,60,0.3) 50%, transparent 100%)`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `transparent` - no effect)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/Countdown.tsx`
  - `src/plinko/components/game/PlinkoBoard/components/OptimizedBallRenderer.tsx`

### gradients.pegDefault
- **Type**: Linear Gradient
- **Title**: Peg Default Gradient
- **Description**: Default gradient for peg elements
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition)
  - `src/plinko/theme/themes/defaultTheme.ts` (value: `linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 30%, #94a3b8 70%, #64748b 100%)`)
  - `src/plinko/theme/themes/brutalistTheme.ts` (value: `#000000` - solid color, no gradient)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/game/PlinkoBoard/Peg.tsx`

### gradients.titleGradient
- **Type**: Linear Gradient (Optional)
- **Title**: Title Text Gradient
- **Description**: Optional gradient for title text effects
- **Theme Files**:
  - `src/plinko/theme/types.ts` (definition - optional field)
  - `src/plinko/theme/themes/defaultTheme.ts` (not defined - uses fallback)
  - `src/plinko/theme/themes/brutalistTheme.ts` (not defined - uses fallback)
- **Used In**:
  - `src/plinko/theme/themeMetadata.ts`
  - `src/plinko/components/screens/StartScreen.tsx`
  - `src/plinko/components/screens/PrizeClaimed.tsx`

---

## Additional Theme Colors (src/plinko/config/theme.ts)

The `src/plinko/config/theme.ts` file contains a separate, simpler color palette that appears to be used for popup/overlay configurations:

### theme.colors (config)
- **background**: `#0f172a` (slate-900)
- **surface**: `#1e293b` (slate-800)
- **primary**: `#3b82f6` (blue-500)
- **accent**: `#8b5cf6` (violet-500)
- **textPrimary**: `#f1f5f9` (slate-100)
- **textSecondary**: `#cbd5e1` (slate-300)
- **success**: `#10b981` (emerald-500)
- **warning**: `#f59e0b` (amber-500)
- **error**: `#ef4444` (red-500)

**Note**: These appear to be legacy or auxiliary colors used outside the main theme system.

---

## Summary Statistics

- **Total Color Properties**: 68 solid color properties
- **Total Gradient Properties**: 15 gradient definitions
- **Theme Implementations**: 2 (Default, Brutalist)
- **Primary Theme File**: `src/plinko/theme/types.ts`
- **Component Usage**: 30+ component files
- **Helper Files**: `prizeColorMapper.ts`, `themeUtils.tsx`, `themeMetadata.ts`, `themeSerializer.ts`

---

## Usage Patterns

### Accessing Theme Colors in Components

```typescript
import { useTheme } from '@/plinko/theme';

const MyComponent = () => {
  const { theme } = useTheme();

  // Solid colors
  const bgColor = theme.colors.background.primary;
  const textColor = theme.colors.text.primary;

  // Gradients
  const buttonGradient = theme.gradients.buttonPrimary;
  const ballGradient = theme.gradients.ballMain;

  return <div style={{ background: bgColor, color: textColor }}>...</div>;
};
```

### Prize Color Mapping

Prize colors are dynamically mapped using `prizeColorMapper.ts`, which converts incoming prize color hex codes to theme-aware colors:

```typescript
import { mapPrizeColorToTheme } from '@/plinko/theme/prizeColorMapper';

const themeColor = mapPrizeColorToTheme('#FF6B35', theme); // Returns theme.colors.prizes.orange.main
```

---

## Cross-Platform Considerations

All color values are designed to be cross-platform compatible:
- **No shadows**: Removed for React Native compatibility
- **Linear gradients only**: No radial gradients (RN limitation)
- **Simple values**: All colors use standard CSS/RN-compatible formats

---

## Related Documentation

- `docs/theming.md` - Complete theming system guide
- `docs/architecture.md` - Application architecture overview
- `src/plinko/theme/types.ts` - TypeScript type definitions
- `src/plinko/theme/themeMetadata.ts` - Metadata for theme editor
