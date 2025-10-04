const fs = require('fs');
const path = require('path');

// Patterns that indicate hard-coded styles
const hardcodedPatterns = [
  // Hex colors
  /#[0-9a-fA-F]{3,6}(?:[^0-9a-fA-F]|$)/,
  // RGB/RGBA colors
  /rgba?\([^)]+\)/,
  // Tailwind classes in className
  /className=.*(?:bg-|text-|border-|shadow-|rounded-)/,
  // Hard-coded gradient strings not from theme
  /linear-gradient.*#[0-9a-fA-F]/,
  /radial-gradient.*#[0-9a-fA-F]/,
];

function findHardcodedStyles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.')) {
      findHardcodedStyles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const issues = [];

      // Skip theme files themselves
      if (filePath.includes('/theme/') || filePath.includes('themeDefaults')) {
        return;
      }

      hardcodedPatterns.forEach(pattern => {
        const matches = content.match(new RegExp(pattern, 'g'));
        if (matches) {
          matches.forEach(match => {
            // Filter out some false positives
            if (!match.includes('theme.') &&
                !match.includes('${theme.') &&
                !match.includes('import') &&
                !match.includes('require') &&
                !match.includes('//') && // comments
                !match.includes('/*')) {  // comments
              issues.push(match.substring(0, 50));
            }
          });
        }
      });

      if (issues.length > 0) {
        fileList.push({
          file: filePath.replace(/.*\/src\//, 'src/'),
          issues: [...new Set(issues)] // Remove duplicates
        });
      }
    }
  });

  return fileList;
}

const results = findHardcodedStyles(path.join(__dirname, 'src/components'));

console.log('\n🚨 Components with hard-coded styles:\n');
results.forEach(result => {
  console.log(`\n📁 ${result.file}`);
  result.issues.forEach(issue => {
    console.log(`   ❌ ${issue}`);
  });
});

console.log(`\n\nTotal files with issues: ${results.length}`);