# Production Prize System

## Overview

This document describes the production-ready prize system that solves the space constraint problem for 3-8 prizes on narrow viewports (down to 320px).

## The Problem

With 8 prizes on a 320px viewport:
- Total width: 320px
- After borders/walls: ~300px playable
- Per slot: **37.5px width**
- Usable space after slot borders: **~33px**

This is extremely tight for displaying text-based prize information.

## The Solution: Icon-Based Compact Display

### Strategy

**In the game board slots:**
- **Very narrow (< 42px)**: Icon only (20-24px)
- **Narrow (42-55px)**: Number + small icon
- **Normal (> 55px)**: Full text label

**In the prize reveal modal:**
- Show complete prize details
- List all reward components
- Use full icons and formatting

### Display Modes by Width

| Viewport | Prizes | Slot Width | Display Mode | Example |
|----------|--------|------------|--------------|---------|
| 320px    | 8      | ~37px      | Icon only    | [SC icon] |
| 320px    | 6      | ~47px      | Number + icon | "500" + [SC icon] |
| 375px    | 6      | ~57px      | Full text    | "500 Free SC" |
| 414px    | 3      | ~128px     | Full text    | "500 Free SC" |

## Prize Types

### 1. No Win
```typescript
{
  id: 'no_win',
  type: 'no_win',
  probability: 0.05,
  slotIcon: '/no-win-icon.png',
  slotColor: '#64748B',
  title: 'Try Again'
}
```

### 2. Free Reward

Can contain any combination of:
- GC (Gold Coins)
- SC (Sweeps Coins)
- Free Spins
- XP (with custom icon/name)
- Random Reward (triggers another prize)

```typescript
{
  id: 'combo_reward',
  type: 'free',
  probability: 0.08,
  slotIcon: gcscIcon,
  slotColor: '#FACC15',
  title: 'Combo Reward',
  freeReward: {
    sc: 50,
    gc: 5000,
    spins: 10,
    xp: {
      amount: 500,
      config: {
        icon: xpIcon,
        name: 'Battle Points'
      }
    }
  }
}
```

### 3. Purchase Offer

```typescript
{
  id: 'special_offer',
  type: 'purchase',
  probability: 0.05,
  slotIcon: offerIcon,
  slotColor: '#EF4444',
  title: 'Special Offer',
  purchaseOffer: {
    offerId: 'offer_001',
    title: '50% Off Premium Pack',
    description: 'Get 10,000 GC + 100 SC for half price!'
  }
}
```

## Assets Required

Place these in `src/assets/`:

- ✅ `sc.png` - Sweeps Coins icon
- ✅ `gc.png` - Gold Coins icon
- ✅ `gcsc.png` - Combined GC+SC icon
- ✅ `xp.png` - XP icon
- ✅ `offer.png` - Purchase offer icon
- ✅ `random_reward.png` - Random reward icon
- ⚠️  `spins-icon.png` - Free spins icon (NEEDED)
- ⚠️  `no-win-icon.png` - No win icon (NEEDED)

## Integration Steps

### Step 1: Update Types

Add the Prize interface to your `game/types.ts`:

```typescript
import type { Prize } from './prizeTypes';

// Use Prize instead of PrizeConfig in your game state
```

### Step 2: Update Prize Generation

Replace in `usePlinkoGame.ts`:

```typescript
import { createValidatedProductionPrizeSet, getPrizeByIndex } from '../config/productionPrizeTable';

// Instead of:
// const [prizes, setPrizes] = useState(() => createValidatedPrizeSet());

// Use:
const [prizes, setPrizes] = useState<Prize[]>(() => createValidatedProductionPrizeSet());

// In reset:
setPrizes(createValidatedProductionPrizeSet());
```

### Step 3: Update Prize Reveal

The prize reveal modal should show full details:

```typescript
import { getFullRewardDescription } from '../game/prizeTypes';

// In PrizeReveal component:
const rewardParts = getFullRewardDescription(selectedPrize);

// Display:
{rewardParts.map((part, i) => (
  <div key={i} className="reward-item">{part}</div>
))}
```

## Responsive Behavior

### 320px viewport, 8 prizes (~37px slots)
- **Icon only mode**
- 20x20px icons
- No text
- Taller buckets (85px) to accommodate icon
- Clean, recognizable

### 375px viewport, 6 prizes (~57px slots)
- **Full text mode**
- Complete prize labels
- Standard bucket height (70px)
- Most common case

### 414px viewport, 3 prizes (~128px slots)
- **Full text mode** with extra space
- Large, clear labels
- Standard bucket height
- Plenty of room

## Color Coding

Use consistent colors for prize types:

- **High-value SC**: Orange (#F97316 → #FB923C)
- **Medium SC**: Yellow (#FBBF24 → #FACC15)
- **GC**: Green/Blue (#34D399 → #60A5FA)
- **Spins**: Purple (#A78BFA → #C084FC)
- **XP**: Indigo (#818CF8)
- **Random**: Pink (#F472B6)
- **Offers**: Red (#EF4444)
- **No Win**: Gray (#64748B)

## Testing Checklist

- [ ] Test with 3 prizes on 320px (wide slots)
- [ ] Test with 8 prizes on 320px (icon-only mode)
- [ ] Test with 6 prizes on 375px (standard)
- [ ] Verify all icons load correctly
- [ ] Test prize reveal shows full details
- [ ] Verify colors are distinct
- [ ] Test mixed reward types (SC+GC+Spins)
- [ ] Test purchase offers
- [ ] Test no-win state

## API Contract (for backend integration)

### Prize Definition

```typescript
interface ApiPrize {
  id: string;
  type: 'no_win' | 'free' | 'purchase';
  probability: number;

  // Display
  slotIcon: string;      // URL or asset path
  slotColor: string;     // Hex color
  title: string;
  description?: string;

  // Free reward components (if type === 'free')
  freeReward?: {
    gc?: number;
    sc?: number;
    spins?: number;
    xp?: {
      amount: number;
      icon: string;
      name: string;
    };
    randomReward?: boolean;
  };

  // Purchase offer details (if type === 'purchase')
  purchaseOffer?: {
    offerId: string;
    title: string;
    description: string;
  };
}
```

### Prize Set Response

```typescript
interface PrizeSetResponse {
  prizes: ApiPrize[];  // 3-8 prizes, probabilities sum to 1.0
  sessionId: string;   // For tracking
}
```

## Migration from Current System

### Old Prize Format
```typescript
{
  id: 'p1',
  label: 'Free SC 500',
  description: 'Sweeps Coins',
  probability: 0.05,
  color: '#F97316'
}
```

### New Prize Format
```typescript
{
  id: 'sc_500',
  type: 'free',
  probability: 0.05,
  slotIcon: scIcon,
  slotColor: '#F97316',
  title: '500 Free SC',
  freeReward: {
    sc: 500
  }
}
```

## Best Practices

1. **Always use icons for narrow slots** - Text becomes unreadable below 45px width
2. **Use color coding consistently** - Helps users quickly identify prize types
3. **Show full details in reveal** - The slot display is just a preview
4. **Test on real devices** - Emulators don't always show true rendering
5. **Keep icon file sizes small** - 24x24px @ 2x = 48x48px actual size
6. **Use SVG when possible** - Scales better, smaller file size
7. **Provide fallbacks** - If icon fails to load, show text

## Future Enhancements

- [ ] Animated icons (subtle pulse/glow)
- [ ] Sound effects per prize type
- [ ] Rarity indicators (common, rare, epic)
- [ ] Prize history/stats
- [ ] Lucky streak bonuses
