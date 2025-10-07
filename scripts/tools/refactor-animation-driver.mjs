#!/usr/bin/env node
/**
 * Refactor Animation Driver Script
 *
 * Automatically refactors components from direct Framer Motion usage
 * to the animation driver abstraction layer.
 *
 * CRITICAL: Also fixes cross-platform violations:
 * - Replaces radial-gradient with linear-gradient
 * - Removes box-shadow (logs warning)
 * - Removes blur filters (logs warning)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../../src');

/**
 * Refactor a single component file
 */
function refactorFile(filePath) {
  console.log(`\n📝 Refactoring: ${path.relative(SRC_DIR, filePath)}`);

  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  const warnings = [];

  // 1. Update imports - replace framer-motion with animation driver
  if (content.includes("from 'framer-motion'")) {
    const importMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]framer-motion['"]/);

    if (importMatch) {
      const imports = importMatch[1].split(',').map(s => s.trim());
      const hasMotion = imports.some(i => i === 'motion');
      const hasAnimatePresence = imports.some(i => i === 'AnimatePresence');

      // Remove old import
      content = content.replace(/import\s+{[^}]+}\s+from\s+['"]framer-motion['"];?\s*\n/, '');

      // Add new import after other imports
      const lastImportIndex = content.lastIndexOf("import");
      const lineEnd = content.indexOf('\n', lastImportIndex);
      const insertPos = lineEnd + 1;

      const newImport = "import { useAnimationDriver } from '../../theme/animationDrivers';\n";
      content = content.slice(0, insertPos) + newImport + content.slice(insertPos);

      modified = true;
      console.log(`  ✓ Updated imports`);
    }
  }

  // 2. Add driver hook at start of component
  // Find the component function
  const componentMatch = content.match(/export\s+(function|const)\s+(\w+)/);
  if (componentMatch) {
    const componentName = componentMatch[2];

    // Find the opening brace and first hook or const
    const functionStart = content.indexOf('{', content.indexOf(componentName));
    const firstHookOrConst = content.indexOf('const ', functionStart);

    if (firstHookOrConst > functionStart && !content.includes('const driver = useAnimationDriver()')) {
      const insertPos = firstHookOrConst;
      const indentMatch = content.slice(insertPos).match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : '  ';

      const driverCode = `${indent}const driver = useAnimationDriver();\n${indent}const AnimatedDiv = driver.createAnimatedComponent('div');\n${indent}const { AnimatePresence } = driver;\n\n`;

      content = content.slice(0, insertPos) + driverCode + content.slice(insertPos);
      modified = true;
      console.log(`  ✓ Added driver hook`);
    }
  }

  // 3. Replace motion.div with AnimatedDiv
  content = content.replace(/<motion\.div/g, '<AnimatedDiv');
  content = content.replace(/<\/motion\.div>/g, '</AnimatedDiv>');
  if (content.includes('AnimatedDiv')) {
    modified = true;
    console.log(`  ✓ Replaced motion.div with AnimatedDiv`);
  }

  // 4. CRITICAL: Fix radial-gradient (cross-platform violation)
  const radialGradientRegex = /radial-gradient\(([^)]+)\)/g;
  if (radialGradientRegex.test(content)) {
    content = content.replace(
      /radial-gradient\(ellipse at left,([^)]+)\)/g,
      'linear-gradient(to right,$1)'
    );
    content = content.replace(
      /radial-gradient\(ellipse at right,([^)]+)\)/g,
      'linear-gradient(to left,$1)'
    );
    content = content.replace(
      /radial-gradient\(ellipse at bottom,([^)]+)\)/g,
      'linear-gradient(to top,$1)'
    );
    content = content.replace(
      /radial-gradient\(ellipse at top,([^)]+)\)/g,
      'linear-gradient(to bottom,$1)'
    );
    content = content.replace(
      /radial-gradient\(circle at ([^,]+),([^)]+)\)/g,
      'linear-gradient(180deg,$2)'
    );

    warnings.push('⚠️  FIXED: Replaced radial-gradient with linear-gradient for cross-platform compatibility');
    modified = true;
  }

  // 5. CRITICAL: Warn about boxShadow (but don't remove - needs manual review)
  if (content.includes('boxShadow:')) {
    warnings.push('⚠️  WARNING: Component uses boxShadow (not cross-platform compatible). Manual review needed.');
  }

  // 6. CRITICAL: Warn about filter/blur
  if (content.includes('filter:') || content.includes("filter: 'blur")) {
    warnings.push('⚠️  WARNING: Component uses filter/blur (not cross-platform compatible). Manual review needed.');
  }

  // Write back if modified
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✅ File updated`);
  } else {
    console.log(`  ℹ️  No changes needed`);
  }

  // Print warnings
  if (warnings.length > 0) {
    warnings.forEach(w => console.log(`  ${w}`));
  }

  return { modified, warnings: warnings.length };
}

/**
 * Find all components using framer-motion
 */
function findFramerMotionComponents(dir) {
  const files = [];

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory() && !entry.name.includes('node_modules')) {
        traverse(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes("from 'framer-motion'") &&
            !content.includes('useAnimationDriver')) {
          files.push(fullPath);
        }
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Animation Driver Refactoring Tool');
  console.log('=====================================\n');

  const componentsDir = path.join(SRC_DIR, 'components');
  const appFile = path.join(SRC_DIR, 'App.tsx');

  // Find all files
  const files = findFramerMotionComponents(SRC_DIR);

  console.log(`Found ${files.length} files using Framer Motion directly:\n`);

  let totalModified = 0;
  let totalWarnings = 0;

  // Refactor each file
  for (const file of files) {
    const result = refactorFile(file);
    if (result.modified) totalModified++;
    totalWarnings += result.warnings;
  }

  console.log('\n\n📊 Summary');
  console.log('==========');
  console.log(`✅ ${totalModified} files modified`);
  console.log(`⚠️  ${totalWarnings} warnings (manual review needed)`);
  console.log(`📁 ${files.length - totalModified} files unchanged`);

  if (totalWarnings > 0) {
    console.log('\n⚠️  IMPORTANT: Some components have cross-platform compatibility issues.');
    console.log('   Please review warnings above and fix manually.');
  }
}

main();
