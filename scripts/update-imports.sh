#!/bin/bash

# Script to update all imports from old structure to new structure
# This script updates imports in the plinko package to use @plinko/* paths

set -e

echo "🔄 Updating imports in plinko package..."

# Update imports in plinko directory
find src/plinko -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" ! -path "*/dist/*" | while read -r file; do
  # Skip the main index.ts file
  if [ "$file" = "src/plinko/index.ts" ]; then
    continue
  fi

  echo "Processing: $file"

  # Update relative imports to absolute @plinko imports
  # These replacements need to account for the new structure

  # @game imports
  sed -i '' "s|from '@game/|from '@plinko/game/|g" "$file"
  sed -i '' "s|from '@game'|from '@plinko/game'|g" "$file"

  # @components imports
  sed -i '' "s|from '@components/|from '@plinko/components/|g" "$file"
  sed -i '' "s|from '@components'|from '@plinko/components'|g" "$file"

  # @utils imports
  sed -i '' "s|from '@utils/|from '@plinko/utils/|g" "$file"
  sed -i '' "s|from '@utils'|from '@plinko/utils'|g" "$file"

  # @hooks imports
  sed -i '' "s|from '@hooks/|from '@plinko/hooks/|g" "$file"
  sed -i '' "s|from '@hooks'|from '@plinko/hooks'|g" "$file"

  # @theme imports
  sed -i '' "s|from '@theme/|from '@plinko/theme/|g" "$file"
  sed -i '' "s|from '@theme'|from '@plinko/theme'|g" "$file"

  # @config imports
  sed -i '' "s|from '@config/|from '@plinko/config/|g" "$file"
  sed -i '' "s|from '@config'|from '@plinko/config'|g" "$file"

  # @tests imports
  sed -i '' "s|from '@tests/|from '@plinko/tests/|g" "$file"
  sed -i '' "s|from '@tests'|from '@plinko/tests'|g" "$file"

  # Generic @ imports
  sed -i '' "s|from '@/|from '@plinko/|g" "$file"
done

echo "✅ Import updates in plinko package complete"
echo ""
echo "🔄 Updating imports in demo package..."

# Update imports in demo directory
find src/demo -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" ! -path "*/dist/*" | while read -r file; do
  echo "Processing: $file"

  # Update old @ imports to @plinko for demo files
  sed -i '' "s|from '@game/|from '@plinko/game/|g" "$file"
  sed -i '' "s|from '@game'|from '@plinko/game'|g" "$file"
  sed -i '' "s|from '@components/|from '@plinko/components/|g" "$file"
  sed -i '' "s|from '@components'|from '@plinko/components'|g" "$file"
  sed -i '' "s|from '@utils/platform|from '@plinko/utils/platform|g" "$file"
  sed -i '' "s|from '@utils/|from '@plinko/utils/|g" "$file"
  sed -i '' "s|from '@utils'|from '@plinko/utils'|g" "$file"
  sed -i '' "s|from '@hooks/|from '@plinko/hooks/|g" "$file"
  sed -i '' "s|from '@hooks'|from '@plinko/hooks'|g" "$file"
  sed -i '' "s|from '@theme/|from '@plinko/theme/|g" "$file"
  sed -i '' "s|from '@theme'|from '@plinko/theme'|g" "$file"
  sed -i '' "s|from '@config/prizes|from '@plinko/config/prizes|g" "$file"
  sed -i '' "s|from '@config/theme|from '@plinko/config/theme|g" "$file"
  sed -i '' "s|from '@config/timing|from '@plinko/config/timing|g" "$file"

  # Update relative imports to @demo
  sed -i '' "s|from './devToolsPersistence|from '@demo/utils/devToolsPersistence|g" "$file"
  sed -i '' "s|from '../dev-tools|from '@demo/components/DevTools|g" "$file"
  sed -i '' "s|from './components/DevTools|from '@demo/components/DevTools|g" "$file"
done

echo "✅ Import updates in demo package complete"
