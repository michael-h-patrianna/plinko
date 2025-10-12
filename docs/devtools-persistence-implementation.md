# Dev Tools Persistence Implementation

## Summary

Successfully implemented localStorage persistence for dev menu settings, ensuring they survive page refreshes and rebuilds.

## Changes Made

### 1. Created Persistence Utility (`src/utils/devToolsPersistence.ts`)

A robust utility module that handles:
- **Loading settings** from localStorage with validation and defaults
- **Saving settings** to localStorage with error handling
- **Type guards** for runtime validation of persisted data
- **Graceful error handling** for storage quota and access errors

**Settings Persisted:**
- `choiceMechanic` - Game choice mechanic ('none' | 'drop-position')
- `showWinner` - Debug flag to display winning item
- `musicEnabled` - Background music toggle
- `performanceMode` - Performance setting ('high-quality' | 'balanced' | 'power-saving')
- `viewportWidth` - Desktop viewport simulation size
- `themeName` - Visual theme name

**Storage Key:** `plinko-dev-settings`

### 2. Updated App Component (`src/App.tsx`)

**Added:**
- Import of persistence utility functions
- Loading persisted settings on mount in both `App` and `AppContent` components
- Auto-save effect that triggers whenever any setting changes
- Viewport restoration on mount for desktop devices

**Key Implementation Details:**
- Settings are loaded once on mount using `useMemo` to avoid re-loading
- All state variables now initialize with persisted values
- A `useEffect` hook automatically saves settings to localStorage whenever they change
- Viewport width is restored on desktop after UI state initializes

### 3. Fixed Test Setup (`src/tests/setupTests.ts`)

**Fixed:**
- Added check for `window` existence before defining properties
- Ensures Node environment tests don't fail when DOM APIs aren't available
- Maintains compatibility with both Node and JSDOM test environments

### 4. Created Comprehensive Tests

**Unit Tests** (`src/tests/utils/devToolsPersistence.test.ts`):
- 14 test cases covering all functionality
- Tests for loading, saving, and clearing settings
- Validation tests for type guards
- Error handling tests for corrupt data and storage failures
- Round-trip persistence tests

**Integration Test** (`scripts/playwright/test-devtools-persistence.mjs`):
- Automated browser test using Playwright
- Changes multiple settings in dev menu
- Verifies localStorage content
- Refreshes page and confirms settings are restored
- Visual confirmation with browser kept open for inspection

## Test Results

✅ **Unit Tests:** 14/14 passed
✅ **Integration Test:** All settings persisted and restored correctly
✅ **Build:** Successful with no TypeScript errors
✅ **Existing Tests:** No regressions introduced

## Usage

The persistence is automatic and requires no user action:

1. Open the dev menu (gear icon)
2. Change any settings (theme, music, performance, etc.)
3. Settings are automatically saved to localStorage
4. Refresh the page or rebuild the app
5. Settings are automatically restored

## Technical Notes

- **Separate from Theme:** Theme persistence already exists at key `plinko-theme`, so we don't manage it in dev settings
- **Validation:** All loaded settings are validated with type guards to prevent issues from corrupted localStorage
- **Defaults:** If any setting is invalid or missing, the default value is used
- **Error Handling:** All localStorage operations are wrapped in try-catch with console warnings
- **Cross-platform Ready:** Uses localStorage for web, abstracted for future React Native support

## Files Modified

- `src/utils/devToolsPersistence.ts` (new)
- `src/App.tsx`
- `src/tests/setupTests.ts`
- `src/tests/utils/devToolsPersistence.test.ts` (new)
- `scripts/playwright/test-devtools-persistence.mjs` (new)

## Future Enhancements

Possible improvements:
- Add "Reset to Defaults" button in dev menu
- Export/import settings as JSON file
- Settings profiles for different testing scenarios
- Sync settings across browser tabs using storage events
