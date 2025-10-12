# PurchaseOfferView Premium Animation Orchestration

## Overview
Implemented premium choreographed reveal animations for the PurchaseOfferView component, matching the sophisticated feel of StartScreen and FreeRewardView while maintaining a distinct personality appropriate for purchase flows.

## Implementation Date
2025-10-12

## Component Location
`/Users/michaelhaufschild/Documents/code/plinko/src/components/screens/PrizeReveal/PurchaseOfferView.tsx`

## Animation Sequence

### Timing Configuration
```typescript
const timing = {
  badge: 0,                    // 120% EXTRA badge pops in immediately with elastic bounce
  sparkles: 0.1,               // Sparkles start slightly after badge for layered effect
  sparkleStagger: 80,          // Tight 80ms stagger for rapid sparkle burst (ms)
  title: 0.25,                 // Title swooshes in while badge still settling
  rewardsContainer: 0.4,       // Container swooshes in while title animating (overlap)
  firstReward: 0.5,            // First reward item pops during container entrance
  rewardStagger: 70,           // Tight 70ms stagger for rapid-fire reward reveals (ms)
  benefits: 0.8,               // Benefits fade in as rewards complete
  purchaseButton: 0.9,         // CTA appears with prominent hero entrance
  limitedTime: 1.1,            // Urgency text appears near end for time pressure
};
```

### Animation Choreography

#### 1. 120% EXTRA Badge (0s - 0.5s)
- **Animation**: Elastic pop with scale overshoot and rotation
- **Initial**: `{ opacity: 0, scale: 0.8, y: -10, rotate: -3 }`
- **Animate**:
  - `opacity: [0, 1, 1, 1]`
  - `scale: [0.8, 1.15, 0.95, 1]`
  - `y: [-10, 5, -2, 0]`
  - `rotate: [-3, 2, -1, 0]`
- **Duration**: 0.5s
- **Easing**: `[0.34, 1.56, 0.64, 1]` (elastic bounce)
- **Personality**: Premium seal/stamp entrance

#### 2. Sparkles (0.1s - 2.1s)
- **Animation**: Enhanced decorative particles with scale pop
- **Initial**: `{ x: 0, y: 0, opacity: 0, scale: 0 }`
- **Animate**:
  - `x: offsetX` (varies: -50, -30, 30, 50)
  - `y: [-80, -100]`
  - `opacity: [0, 1, 0.7, 0]`
  - `scale: [0, 1.3, 0.7, 0.3]`
- **Duration**: 2s per particle
- **Stagger**: 80ms between particles
- **Easing**: `[0.22, 1, 0.36, 1]` (smooth ease out)

#### 3. Special Offer Title (0.25s - 0.75s)
- **Animation**: Diagonal swoosh entrance with elastic bounce
- **Initial**: `{ opacity: 0, x: -30, y: 30, scale: 0.9, rotate: 3 }`
- **Animate**: `{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }`
- **Duration**: 0.5s
- **Easing**: `[0.34, 1.56, 0.64, 1]` (elastic bounce)
- **Personality**: Hero element with premium swoosh

#### 4. Rewards Container (0.4s - 0.9s)
- **Animation**: Opposite diagonal swoosh (from right)
- **Initial**: `{ opacity: 0, x: 20, y: 30, scale: 0.95, rotate: -2 }`
- **Animate**: `{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }`
- **Duration**: 0.5s
- **Easing**: `[0.34, 1.56, 0.64, 1]` (elastic bounce)
- **Note**: Starts while title still animating (overlap)

#### 5. Individual Reward Items (0.5s onwards)
- **Animation**: Enhanced pop handled by RewardItem component
- **Delay**: `0.5 + (index * 0.07)` seconds
- **Stagger**: 70ms between items
- **Personality**: Rapid-fire reveal for excitement

#### 6. Additional Benefits Text (0.8s - 1.2s)
- **Animation**: Subtle fade for secondary content
- **Initial**: `{ opacity: 0, y: 15 }`
- **Animate**: `{ opacity: 1, y: 0 }`
- **Duration**: 0.4s
- **Easing**: `[0.22, 1, 0.36, 1]` (smooth ease out)
- **Personality**: Elegant, doesn't overshadow main content

#### 7. Purchase Button (0.9s - 1.6s)
- **Animation**: Elastic hero entrance emphasizing CTA
- **Implementation**: Uses `ThemedButton` with `entranceAnimation="hero"`
- **Duration**: ~0.7s (handled by ThemedButton)
- **Personality**: Prominent, draws attention to call-to-action

#### 8. Limited Time Text (1.1s - 1.4s)
- **Animation**: Quick fade for urgency
- **Initial**: `{ opacity: 0 }`
- **Animate**: `{ opacity: 1 }`
- **Duration**: 0.3s
- **Easing**: `[0.22, 1, 0.36, 1]` (smooth ease out)
- **Personality**: Creates time pressure

## Total Sequence Duration
~1.2-1.5 seconds with overlapping animations for fluid, premium feel

## Cross-Platform Compatibility

### Animations Used (All Cross-Platform Safe)
✅ Transform properties: `translateX`, `translateY`, `scale`, `rotate`
✅ Opacity animations
✅ Linear gradients (already in component)
✅ Layout animations

### Avoided Features (Web-Only)
❌ Blur, filters
❌ Radial/conic gradients
❌ Box shadows, text shadows
❌ backdrop-filter, clip-path
❌ CSS pseudo-elements

## Design Personality
- **Exciting but refined**: More sophisticated than purely celebratory free reward view
- **Premium value proposition**: Emphasizes the special offer and deal value
- **Clear visual hierarchy**: Badge → Title → Rewards → Benefits → CTA → Urgency
- **Smooth, professional flow**: Overlapping animations create momentum
- **Time-sensitive urgency**: Limited time text reinforces immediate action

## Key Differences from FreeRewardView
1. **More sophisticated**: Less bouncy, more premium feel appropriate for purchase
2. **Diagonal swooshes**: Title and container enter from opposite diagonals for dynamic feel
3. **Badge emphasis**: 120% EXTRA badge gets prominent elastic pop
4. **CTA prominence**: Purchase button uses hero entrance to draw attention
5. **Urgency element**: Limited time text creates time pressure

## Technical Details

### Elastic Bounce Easing
```typescript
ease: [0.34, 1.56, 0.64, 1]
```
Creates overshoot effect for premium feel

### Smooth Ease Out
```typescript
ease: [0.22, 1, 0.36, 1]
```
Used for secondary elements and subtle fades

### Overlapping Strategy
- Badge starts immediately (0s)
- Sparkles layer in during badge animation (0.1s)
- Title swooshes while badge settling (0.25s)
- Container enters while title animating (0.4s)
- Rewards pop during container entrance (0.5s+)
- Benefits/button/text complete sequence (0.8s-1.1s)

This creates a fluid, continuous flow where elements build momentum rather than waiting for each other to complete.

## Testing
- ✅ TypeScript compilation successful
- ✅ Build successful
- ✅ No new test failures introduced
- ✅ Cross-platform constraints verified

## References
- StartScreen: `/Users/michaelhaufschild/Documents/code/plinko/src/components/screens/StartScreen.tsx`
- FreeRewardView: `/Users/michaelhaufschild/Documents/code/plinko/src/components/screens/PrizeReveal/FreeRewardView.tsx`
- ThemedButton: `/Users/michaelhaufschild/Documents/code/plinko/src/components/controls/ThemedButton.tsx`

## Future Considerations
- Consider adding subtle particle effects during button hover (cross-platform safe)
- Could add micro-interactions on reward items during hover
- May want to adjust timing based on number of reward items (more items = faster stagger)
