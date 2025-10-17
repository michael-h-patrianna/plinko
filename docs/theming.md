# Theming System Technical Documentation

## Overview

The Plinko game uses a **fully dynamic theming system** that allows complete customization of all visual aspects through a type-safe TypeScript architecture. Themes can be edited in real-time via a built-in Theme Editor UI and exported/imported as JSON files.

## Architecture

### Core Components

```
src/theme/
├── types.ts                    # TypeScript type definitions for Theme
├── index.ts                    # ThemeProvider context and hooks
├── themeMetadata.ts           # Metadata for dynamic UI generation (279 entries)
├── themeSerializer.ts         # JSON import/export and validation
├── themes/
│   ├── defaultTheme.ts        # Default theme (light)
│   └── brutalistTheme.ts      # Brutalist theme (dark)
└── animationDrivers/
    └── framer.ts              # Framer Motion integration with pause support

src/dev-tools/components/
├── ThemeEditor.tsx            # Main theme editor drawer UI
├── ThemePropertyInputs.tsx    # Reusable input components for theme properties
└── DevToolsMenu.tsx           # Dev tools menu with theme editor trigger
```

---

## 1. Theme Type System (`src/theme/types.ts`)

**Purpose**: Single source of truth for theme structure using TypeScript.

```typescript
export interface Theme {
  name: string;
  isDark: boolean;
  colors: {
    background: { primary: string; secondary: string; /* ... */ };
    surface: { primary: string; secondary: string; /* ... */ };
    primary: { main: string; light: string; dark: string; /* ... */ };
    // ... 100+ color properties
  };
  gradients: {
    backgroundMain: string;
    buttonPrimary: string;
    // ... 20+ gradient properties
  };
  typography: {
    fontFamily: { primary: string; secondary: string; /* ... */ };
    fontSize: { xs: string; sm: string; base: string; /* ... */ };
    fontWeight: { thin: number; light: number; normal: number; /* ... */ };
    lineHeight: { none: number; tight: number; /* ... */ };
    letterSpacing: { tighter: string; tight: string; /* ... */ };
  };
  borderRadius: {
    sm: string; md: string; lg: string; /* ... */
    button: string; card: string; /* semantic values */
  };
  animation: {
    duration: { instant: number; fast: number; normal: number; /* ... */ };
    easing: { linear: string; easeIn: string; easeOut: string; /* ... */ };
  };
  effects: {
    glows: { sm: string; md: string; lg: string; /* ... */ };
    borders: { none: string; thin: string; medium: string; /* ... */ };
    transitions: { fast: string; normal: string; slow: string; };
  };
  buttons: {
    primary: ButtonStyle;
    secondary: ButtonStyle;
    // ... 6 button variants
  };
  components: {
    card: ComponentStyle;
    modal: ComponentStyle;
    // ... component-specific styles
  };
  breakpoints: { xs: string; sm: string; md: string; /* ... */ };
  zIndex: { dropdown: number; modal: number; popover: number; /* ... */ };
}
```

**Key Points**:
- TypeScript ensures compile-time type safety across the entire codebase
- Any structural changes to `Theme` interface will cause type errors in consuming components
- All theme properties are **editable at runtime** (no hardcoded values)

---

## 2. Theme Context (`src/theme/index.ts`)

**Purpose**: Global theme state management using React Context.

```typescript
export const ThemeProvider: React.FC<ThemeProviderProps>;
export const useTheme: () => ThemeContextValue;
```

### Usage in Components

```typescript
import { useTheme } from '@theme';

function MyComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ color: theme.colors.text.primary }}>
      {/* Component content */}
    </div>
  );
}
```

**Real-time Updates**: When `setTheme(newTheme)` is called, **all components** re-render with the new theme values.

---

## 3. Theme Metadata (`src/theme/themeMetadata.ts`)

**Purpose**: Describes every theme property to enable **dynamic form generation** in the Theme Editor UI.

### Structure

```typescript
export interface ThemePropertyMetadata {
  displayTitle: string;          // Human-readable label
  description: string;            // Tooltip text (explains purpose, NOT current value)
  type: PropertyType;             // 'color' | 'number' | 'string' | 'gradient' | 'select' | 'boolean'
  category: string;               // UI grouping (e.g., "Colors - Background")
  path: string;                   // Dot notation (e.g., "colors.background.primary")
  options?: readonly string[];    // For 'select' type
  min?: number;                   // For 'number' type
  max?: number;                   // For 'number' type
  unit?: string;                  // For 'number' type (e.g., "ms", "px")
}
```

### Example Entry

```typescript
'colors.background.primary': {
  displayTitle: 'Primary Background',
  description: 'Main background color for the application',
  type: 'color',
  category: 'Colors - Background',
  path: 'colors.background.primary'
}
```

### Current Stats
- **279 editable properties** (cleaned up from 325+)
- **46 entries removed**: spacing (fixed scale), numeric zIndex, unused fontSize/gradients
- **Organized into 40+ categories** for accordion UI grouping

### Adding New Theme Properties

1. **Update `types.ts`**: Add property to `Theme` interface
2. **Update `themeMetadata.ts`**: Add metadata entry with proper category
3. **Update default themes**: Add default value to `defaultTheme.ts` and `brutalistTheme.ts`
4. **Theme Editor automatically picks up the change** (no UI code changes needed)

---

## 4. Theme Serialization (`src/theme/themeSerializer.ts`)

**Purpose**: JSON import/export and validation.

### Key Functions

```typescript
// Export theme to JSON file (browser download)
export function exportThemeToFile(theme: Theme, filename: string): void

// Import theme from JSON file (browser file picker)
export function importThemeFromFile(file: File): Promise<Theme | null>

// Serialize theme to JSON string
export function serializeTheme(theme: Theme): string

// Deserialize JSON string to theme object
export function deserializeTheme(json: string): Theme | null

// Validate theme object structure (100+ property checks)
export function validateTheme(obj: unknown): ValidationResult

// Deep merge partial theme with defaults
export function mergeWithDefaults(partial: Partial<Theme>, base: Theme): Theme
```

### Validation

The `validateTheme()` function performs **comprehensive validation**:
- Checks for required top-level properties (name, isDark, colors, gradients, etc.)
- Validates nested objects (colors.background.*, buttons.primary.*, etc.)
- Type checks (strings for colors, numbers for durations, etc.)
- Returns detailed error messages for debugging

**Error Handling**: If import fails, the system reverts to the current theme (no data loss).

---

## 5. Theme Editor UI (`src/dev-tools/components/ThemeEditor.tsx`)

**Purpose**: Real-time theme editing interface with load/save functionality.

### Architecture

```typescript
export default function ThemeEditor({ isOpen, onClose }: ThemeEditorProps)
```

**Key Features**:
- **Real-time updates**: Changes immediately call `setTheme(newTheme)` (no "Apply" button)
- **Reset functionality**: Stores `initialTheme` on mount for reverting changes
- **Accordion sections**: Properties grouped by category (auto-generated from metadata)
- **Focus trap**: Keyboard navigation contained within drawer
- **ESC to close**: Accessibility-compliant
- **Pause integration**: Automatically pauses game animations when open

### Form Generation

The editor uses **100% dynamic form generation**:

```typescript
// Get all categories from metadata
const categories = getAllCategories();

// For each category, render an accordion section
categories.map((category) => {
  const metadata = getMetadataByCategory(category);

  // For each property in the category, render appropriate input
  Object.entries(metadata).map(([, meta]) => {
    const value = getValueByPath(editedTheme, meta.path);

    return (
      <PropertyInput
        key={meta.path}
        metadata={meta}
        value={value}
        onChange={(newValue) => handleChange(meta.path, newValue)}
      />
    );
  });
});
```

**Path Helpers**:
- `getValueByPath(obj, "colors.background.primary")` → `"#1e293b"`
- `setValueByPath(obj, "colors.background.primary", "#ffffff")` → Returns updated object

### Load/Save Flow

```typescript
// SAVE: Export current theme to JSON file
const handleSaveTheme = () => {
  const filename = `${editedTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme`;
  exportThemeToFile(editedTheme, filename);
  // Browser downloads: "my-custom-theme.json"
};

// LOAD: Import theme from JSON file
const handleLoadTheme = () => {
  fileInputRef.current?.click(); // Trigger file picker
};

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  const loadedTheme = await importThemeFromFile(file);

  if (loadedTheme) {
    setEditedTheme(loadedTheme);
    setInitialTheme(loadedTheme);  // Update reset target
    setTheme(loadedTheme);          // Apply immediately
  }
};
```

---

## 6. Theme Property Inputs (`src/dev-tools/components/ThemePropertyInputs.tsx`)

**Purpose**: Reusable input components for different property types.

### Component Mapping

```typescript
function PropertyInput({ metadata, value, onChange }: PropertyInputProps) {
  switch (metadata.type) {
    case 'color':      return <ColorInput {...props} />;
    case 'number':     return <NumberInput {...props} />;
    case 'string':     return <StringInput {...props} />;
    case 'select':     return <SelectInput {...props} />;
    case 'gradient':   return <GradientInput {...props} />;
    case 'boolean':    return <input type="checkbox" />;
    default:           return null;
  }
}
```

### Input Components

**ColorInput**:
- Dual inputs: color picker + hex text field
- Auto-validates hex format (`#RRGGBB`)

**NumberInput**:
- Respects `min`, `max`, `unit` from metadata
- Displays unit label (e.g., "ms", "px")

**GradientInput**:
- Textarea for CSS gradient syntax
- Live preview of valid gradients

**SelectInput**:
- Dropdown for enum-like properties
- Options from `metadata.options`

### Tooltip System

Each input has a `?` button that shows the `description` from metadata:
- Uses **React Portal** for proper positioning (avoids scrollable container issues)
- Position: `fixed` (not affected by parent transforms)
- Auto-repositions on scroll/resize

**Important**: Descriptions should **explain purpose**, not show values!
- ❌ Bad: "Instant animation (0ms)"
- ✅ Good: "No animation delay for immediate transitions"

---

## 7. Demo UI Separation

**Critical**: The Theme Editor is **demo UI**, NOT Plinko UI.

### Hardcoded Styles

```typescript
// ThemeEditor.tsx and ThemePropertyInputs.tsx
const STYLES = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    backgroundColor: '#1a1a1a',
    width: '600px',
    borderLeft: '1px solid #333333',
    zIndex: 10000,
  },
  // ... all demo UI styles are HARDCODED
} as const;
```

**Why?**
- Demo UI must remain functional while editing themes
- If demo UI used theme colors, editing those colors would break the editor itself
- All demo UI components have `data-demo-ui="true"` attribute for pause system exclusion

---

## 8. Pause System Integration

The theme editor integrates with the global pause system (see `src/contexts/PauseContext.tsx`):

```typescript
const { pause, unpause } = usePause();

useEffect(() => {
  if (isOpen) {
    pause();    // Freeze game animations when editor opens
  } else {
    unpause();  // Resume animations when editor closes
  }
}, [isOpen, pause, unpause]);
```

**Pause Exclusion**: Demo UI elements are excluded from pause via CSS:
```css
body[data-paused='true'] [data-demo-ui='true'] * {
  animation-play-state: running !important;
  transition: all 0.2s ease-in-out !important;
}
```

---

## 9. Persistence

Theme settings are persisted via `src/utils/devToolsPersistence.ts`:

```typescript
export function saveDevSettings(settings: DevSettings): void;
export function loadDevSettings(): DevSettings;
```

**Persisted Settings**:
- Current theme name
- Viewport width (desktop only)
- Choice mechanic setting
- Show winner setting
- Music enabled/disabled
- Performance mode

**Storage**: `localStorage` key `plinko-dev-settings`

**Restoration**: Settings are restored on app mount (see `App.tsx` lines 74-79)

---

## Common Tasks

### Adding a New Theme Property

1. **Add to type definition** (`src/theme/types.ts`):
   ```typescript
   export interface Theme {
     // ... existing properties
     myNewProperty: {
       myValue: string;
     };
   }
   ```

2. **Add metadata** (`src/theme/themeMetadata.ts`):
   ```typescript
   'myNewProperty.myValue': {
     displayTitle: 'My Value',
     description: 'What this property controls',
     type: 'string',
     category: 'My Category',
     path: 'myNewProperty.myValue'
   }
   ```

3. **Add to default themes**:
   ```typescript
   // defaultTheme.ts and brutalistTheme.ts
   export const defaultTheme: Theme = {
     // ... existing properties
     myNewProperty: {
       myValue: '#ffffff'
     }
   };
   ```

4. **Use in components**:
   ```typescript
   const { theme } = useTheme();
   <div style={{ color: theme.myNewProperty.myValue }}>...</div>
   ```

### Adding a New Input Type

1. **Define type** in `ThemePropertyMetadata`:
   ```typescript
   export type PropertyType = 'color' | 'number' | /* ... */ | 'myNewType';
   ```

2. **Create input component** (`ThemePropertyInputs.tsx`):
   ```typescript
   export function MyNewInput({ label, value, onChange, description }: Props) {
     return (
       <div>
         <label>{label}</label>
         {description && <Tooltip content={description} />}
         <input value={value} onChange={(e) => onChange(e.target.value)} />
       </div>
     );
   }
   ```

3. **Add to PropertyInput switch**:
   ```typescript
   case 'myNewType':
     return <MyNewInput {...props} />;
   ```

### Debugging Theme Issues

**Theme not applying**:
- Check console for TypeScript errors
- Verify `ThemeProvider` wraps the component tree in `App.tsx`
- Confirm component uses `useTheme()` hook

**Property not appearing in editor**:
- Verify metadata entry exists in `themeMetadata.ts`
- Check `category` matches an existing category
- Ensure `path` matches theme structure (use dot notation)

**Import/export failing**:
- Check browser console for validation errors
- Verify JSON structure matches `Theme` interface
- Use `validateTheme()` function to debug:
  ```typescript
  import { validateTheme } from '@theme/themeSerializer';
  const result = validateTheme(myThemeObject);
  if (!result.isValid) console.error(result.errors);
  ```

---

## Best Practices

1. **Never hardcode theme values** in Plinko UI components
   - ❌ `color: '#1e293b'`
   - ✅ `color: theme.colors.background.primary`

2. **Always use semantic token names**
   - ❌ `theme.colors.blue500`
   - ✅ `theme.colors.primary.main`

3. **Keep metadata descriptions helpful**
   - ❌ "Primary color (#3b82f6)"
   - ✅ "Main brand color used throughout the application"

4. **Test theme changes in both light and dark modes**
   - Switch between `defaultTheme` and `brutalistTheme`
   - Ensure sufficient contrast for accessibility

5. **Validate imported themes**
   - Use `validateTheme()` before applying user-uploaded themes
   - Handle validation errors gracefully (show error toast)

6. **Version theme JSON exports**
   - Consider adding `version` field to Theme interface for future migrations
   - Current implementation assumes schema compatibility

---

## Future Enhancements

**Possible additions to the theming system**:

1. **Theme versioning**: Add migration system for schema changes
2. **Theme marketplace**: Allow sharing themes with community
3. **CSS variable generation**: Auto-generate CSS custom properties from theme
4. **Theme presets**: Add more built-in themes (high contrast, colorblind-friendly, etc.)
5. **Live preview**: Show theme changes in a preview pane before applying
6. **Undo/redo**: Track theme edit history
7. **Color palette generator**: Auto-generate complementary colors from base color
8. **A11y validator**: Warn about insufficient contrast ratios
9. **TypeScript codegen**: Generate `types.ts` from metadata (single source of truth)
10. **Theme diffing**: Compare two themes and highlight differences

---

## Related Documentation

- **Pause System**: `src/styles/pause.css`, `src/contexts/PauseContext.tsx`
- **Animation Drivers**: `src/theme/animationDrivers/framer.ts`
- **Dev Tools**: `src/dev-tools/components/DevToolsMenu.tsx`
- **App Config**: `src/config/AppConfigContext.tsx`
