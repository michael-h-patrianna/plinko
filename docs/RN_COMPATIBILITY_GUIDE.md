# React Native Compatibility Quick Reference

**Last Updated:** 2025-10-07

---

## Quick Summary

This project must maintain **100% React Native compatibility** for future mobile ports. This guide provides quick reference for developers.

---

## ✅ SAFE TO USE (Cross-Platform)

### Animations & Transforms
```typescript
// ✅ All transform properties
transform: [
  {translateX: 10},
  {translateY: -5},
  {scale: 1.2},
  {rotate: '45deg'},
  {scaleX: 1.1},
  {scaleY: 0.9},
]

// ✅ Opacity
opacity: 0.5
```

### Gradients
```typescript
// ✅ Linear gradients ONLY (via react-native-linear-gradient)
background: 'linear-gradient(135deg, #ff0000 0%, #00ff00 100%)'

// ✅ Two-color linear gradient
background: 'linear-gradient(to right, #000000, #ffffff)'
```

### Colors & Layout
```typescript
// ✅ All basic colors
backgroundColor: '#ff0000'
borderColor: 'rgba(0, 0, 0, 0.5)'

// ✅ Layout properties
width, height, padding, margin, borderRadius
position: 'absolute' | 'relative'
```

---

## ❌ FORBIDDEN (Web-Only)

### Shadows
```typescript
// ❌ NEVER use boxShadow
boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)' // FORBIDDEN

// ✅ Instead use borders + opacity
borderWidth: 2,
borderColor: 'rgba(0, 0, 0, 0.2)',
opacity: 0.95
```

```typescript
// ❌ NEVER use textShadow
textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)' // FORBIDDEN

// ✅ Instead: remove entirely or accept flat text
```

### Filters
```typescript
// ❌ NEVER use filter or backdrop-filter
filter: 'blur(4px)' // FORBIDDEN
backdrop-filter: 'blur(8px)' // FORBIDDEN

// ✅ Instead use solid backgrounds with opacity
background: 'rgba(0, 0, 0, 0.5)'
```

### Gradients (Non-Linear)
```typescript
// ❌ NEVER use radial or conic gradients
background: 'radial-gradient(...)' // FORBIDDEN
background: 'conic-gradient(...)' // FORBIDDEN

// ✅ Only linear gradients allowed
background: 'linear-gradient(...)'
```

### CSS-Specific Features
```typescript
// ❌ NEVER use pseudo-elements in CSS
.element::before { } // FORBIDDEN
.element::after { } // FORBIDDEN

// ✅ Instead create actual DOM elements
<View style={beforeStyles} />

// ❌ NEVER use clip-path
clip-path: 'polygon(...)' // FORBIDDEN
```

### Tailwind Classes to Avoid
```typescript
// ❌ Never use drop-shadow classes
className="drop-shadow-lg" // FORBIDDEN

// ✅ Use inline opacity instead
style={{opacity: 0.9}}
```

---

## Common Patterns & Replacements

### 1. Card/Button Elevation

**❌ DON'T:**
```typescript
style={{
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
}}
```

**✅ DO:**
```typescript
style={{
  borderWidth: 2,
  borderColor: 'rgba(0, 0, 0, 0.1)',
  transform: [{translateY: -2}],
}}
```

### 2. Glow Effects

**❌ DON'T:**
```typescript
style={{
  boxShadow: `0 0 20px ${color}66`
}}
```

**✅ DO (Option 1 - Remove):**
```typescript
// Simply remove - glow is enhancement only
```

**✅ DO (Option 2 - Opacity Layer):**
```typescript
<View style={{position: 'absolute', width: '110%', height: '110%'}}>
  <View style={{
    backgroundColor: color,
    opacity: 0.2,
    borderRadius: /* match */
  }} />
</View>
{/* Main element */}
```

### 3. Glass/Frosted Effect

**❌ DON'T:**
```typescript
style={{
  background: 'rgba(0, 0, 0, 0.2)',
  backdropFilter: 'blur(8px)'
}}
```

**✅ DO:**
```typescript
style={{
  background: 'rgba(0, 0, 0, 0.5)', // Increase opacity to compensate
}}
```

### 4. Text Depth

**❌ DON'T:**
```typescript
style={{
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)'
}}
```

**✅ DO:**
```typescript
// Simply remove - text shadows are decorative only
// If critical, use duplicate text layer with offset
```

### 5. CSS Animations with Blur

**❌ DON'T:**
```css
@keyframes glow {
  0% { filter: blur(0px); }
  50% { filter: blur(4px); }
  100% { filter: blur(0px); }
}
```

**✅ DO:**
```css
@keyframes glow {
  0% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.5; transform: scale(1); }
}
```

---

## Testing for Compatibility

### Before Committing

1. **Search for Violations:**
```bash
# Check for boxShadow
grep -r "boxShadow\|box-shadow" src/

# Check for textShadow
grep -r "textShadow\|text-shadow" src/

# Check for filters
grep -r "filter:\|backdropFilter\|backdrop-filter" src/

# Check for pseudo-elements
grep -r "::before\|::after" src/

# Check for radial gradients
grep -r "radial-gradient\|conic-gradient" src/
```

2. **Build Test:**
```bash
npm run build
```

3. **Verify Visual Output:**
- Check that elements still have visible depth
- Ensure UI hierarchy is clear
- Confirm animations are smooth

---

## Developer Workflow

### When Creating New Components

1. **Use theme tokens for borders instead of shadows:**
```typescript
import { theme } from '@/theme';

// ✅ Good
borderWidth: 2,
borderColor: theme.colors.borders.default,

// ❌ Bad
boxShadow: theme.effects.shadows.card
```

2. **Use transform for elevation:**
```typescript
// ✅ Good - creates depth with transform
transform: [{translateY: -2}, {scale: 1.02}],

// ❌ Bad - uses shadows
boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
```

3. **Test in both contexts mentally:**
- "Would this work in React Native?"
- "Am I using any web-only CSS?"

---

## Common Mistakes

### ❌ Mistake 1: Using Tailwind Shadow Classes
```typescript
<div className="shadow-lg drop-shadow-md">
```
**Why:** Tailwind shadows compile to `boxShadow`

**✅ Fix:**
```typescript
<div style={{borderWidth: 2, borderColor: 'rgba(0,0,0,0.1)'}}>
```

### ❌ Mistake 2: Forgetting About CSS Pseudo-Elements
```css
.button::before {
  content: '';
  /* decorative effect */
}
```
**Why:** React Native doesn't support `::before` or `::after`

**✅ Fix:**
```typescript
<View>
  <View style={beforeStyles} />
  <Text>Button</Text>
</View>
```

### ❌ Mistake 3: Using Filter for Blur
```typescript
style={{filter: 'blur(2px)'}}
```
**Why:** `filter` property doesn't exist in React Native

**✅ Fix:**
```typescript
// Remove blur entirely - usually decorative
```

---

## Resources

- **Main Audit:** See `/RN_COMPATIBILITY_AUDIT.md` for full violation list
- **Theme Tokens:** Use `/src/theme/tokens.ts` for compatible values
- **React Native Docs:** [reactnative.dev](https://reactnative.dev/)
- **Linear Gradient:** [react-native-linear-gradient](https://github.com/react-native-linear-gradient/react-native-linear-gradient)

---

## Status

**As of 2025-10-07:**
- ✅ CSS files: 100% compatible
- ⚠️ Component files: 48 violations remaining (documented in audit)
- ✅ Build: Passing
- ✅ Core functionality: Unaffected

**Estimated Completion:** 2-3 hours for remaining component fixes
