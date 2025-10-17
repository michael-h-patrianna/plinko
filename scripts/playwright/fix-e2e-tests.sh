#!/bin/bash
# Script to fix E2E tests for drop-position compatibility

set -e

E2E_DIR="/Users/michaelhaufschild/Documents/code/plinko/scripts/playwright/e2e"

echo "Fixing E2E tests for drop-position compatibility..."

# Files that should test with drop-position (default behavior) - use helper function
HELPER_FILES=(
  "celebration.spec.mjs"
  "prize-claim.spec.mjs"
  "reset-behavior.spec.mjs"
  "visual-quality.spec.mjs"
)

echo "Adding import for startGameWithDropPosition to files..."
for file in "${HELPER_FILES[@]}"; do
  if [ -f "$E2E_DIR/$file" ]; then
    # Check if import already exists
    if ! grep -q "startGameWithDropPosition" "$E2E_DIR/$file"; then
      # Add startGameWithDropPosition to imports
      sed -i.bak 's/} from '\''..\/test-helpers.mjs'\'';/, startGameWithDropPosition} from '\''..\/test-helpers.mjs'\'';/' "$E2E_DIR/$file"
      echo "  ✓ Fixed imports in $file"
    else
      echo "  - $file already has startGameWithDropPosition import"
    fi
  else
    echo "  ⚠ $file not found"
  fi
done

echo ""
echo "Replacing page.click('drop-ball-button') with startGameWithDropPosition..."
for file in "${HELPER_FILES[@]}"; do
  if [ -f "$E2E_DIR/$file" ]; then
    # Replace button clicks with helper
    sed -i.bak "s/await page.click('\[data-testid=\"drop-ball-button\"\]');/await startGameWithDropPosition(page); \/\/ Handles drop position if enabled/" "$E2E_DIR/$file"
    sed -i.bak 's/await page.locator.*drop-ball.*click();/await startGameWithDropPosition(page); \/\/ Handles drop position if enabled/' "$E2E_DIR/$file"
    echo "  ✓ Updated $file to use helper function"
  fi
done

echo ""
echo "✅ E2E test fixes complete!"
echo ""
echo "Files modified:"
for file in "${HELPER_FILES[@]}"; do
  if [ -f "$E2E_DIR/$file" ]; then
    echo "  - $file"
  fi
done
