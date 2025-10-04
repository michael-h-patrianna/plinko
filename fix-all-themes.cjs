const fs = require('fs');
const path = require('path');

// Map of hard-coded colors to theme values
const colorMap = {
  // Ball colors
  '#fffbeb': 'theme.colors.game.ball.highlight',
  '#fef3c7': 'theme.colors.game.ball.highlight',
  '#fde047': 'theme.colors.game.ball.primary',
  '#facc15': 'theme.colors.game.ball.primary',
  '#fbbf24': 'theme.colors.game.ball.primary',
  '#f59e0b': 'theme.colors.game.ball.secondary',
  '#d97706': 'theme.colors.game.ball.secondary',
  '#b45309': 'theme.colors.game.ball.secondary',

  // Launcher/metal colors
  '#64748b': 'theme.colors.game.launcher.base',
  '#94a3b8': 'theme.colors.game.launcher.accent',
  '#475569': 'theme.colors.game.launcher.track',

  // Success colors
  '#10b981': 'theme.colors.status.success',
  '#059669': 'theme.colors.status.success',
  '#6ee7b7': 'theme.colors.status.success',
  '#34d399': 'theme.colors.status.success',
  '#34D399': 'theme.colors.status.success',

  // Primary colors
  '#3b82f6': 'theme.colors.primary.main',
  '#60a5fa': 'theme.colors.primary.light',
  '#2563eb': 'theme.colors.primary.dark',

  // Accent colors
  '#8b5cf6': 'theme.colors.accent.main',
  '#a78bfa': 'theme.colors.accent.light',
  '#7c3aed': 'theme.colors.accent.dark',
  '#A78BFA': 'theme.colors.accent.light',

  // Error colors
  '#ef4444': 'theme.colors.status.error',
  '#dc2626': 'theme.colors.status.error',
  '#b91c1c': 'theme.colors.status.error',

  // Warning colors
  '#f97316': 'theme.colors.status.warning',
  '#fb923c': 'theme.colors.status.warning',
  '#F97316': 'theme.colors.status.warning',

  // Prize colors
  '#F472B6': 'theme.colors.prizes.violet.light',
  '#818CF8': 'theme.colors.prizes.blue.light',

  // Text colors
  '#ffffff': 'theme.colors.text.inverse',
  '#fef3c7': 'theme.colors.text.primary',

  // Replace common rgba patterns
  'rgba(0,0,0,': '`${theme.colors.shadows.default}',
  'rgba(255,255,255,': '`${theme.colors.text.inverse}',
  'rgba(15,23,42,': '`${theme.colors.background.primary}',
  'rgba(30,41,59,': '`${theme.colors.background.secondary}',
  'rgba(51,65,85,': '`${theme.colors.surface.secondary}',
  'rgba(71,85,105,': '`${theme.colors.surface.elevated}',
  'rgba(148,163,184,': '`${theme.colors.text.tertiary}',
};

function fixComponent(filePath) {
  if (!filePath.endsWith('.tsx')) return;

  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Skip if already using theme
  if (!content.includes('useTheme')) {
    // Add import
    if (content.includes('import') && !content.includes("from '../theme'")) {
      const lastImportMatch = content.match(/import[^;]+;(?=\n)/g);
      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        const insertPos = content.indexOf(lastImport) + lastImport.length;
        content = content.slice(0, insertPos) +
                  "\nimport { useTheme } from '../theme';" +
                  content.slice(insertPos);
        modified = true;
      }
    }

    // Add useTheme hook
    const funcMatch = content.match(/export function \w+\([^)]*\) {/);
    if (funcMatch) {
      const insertPos = content.indexOf(funcMatch[0]) + funcMatch[0].length;
      content = content.slice(0, insertPos) +
                "\n  const { theme } = useTheme();" +
                content.slice(insertPos);
      modified = true;
    }
  }

  // Replace colors
  Object.entries(colorMap).forEach(([oldColor, newColor]) => {
    const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (content.match(regex)) {
      content = content.replace(regex, newColor);
      modified = true;
    }
  });

  // Fix rgba patterns
  content = content.replace(/rgba\(0,0,0,([\d.]+)\)/g, '${theme.colors.shadows.default}$1');
  content = content.replace(/rgba\(255,255,255,([\d.]+)\)/g, '${theme.colors.text.inverse}$1');

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
  }
}

// Fix specific components
const componentsToFix = [
  'src/components/BallLauncher.tsx',
  'src/components/Ball.tsx',
  'src/components/BorderWall.tsx',
  'src/components/ComboLegend.tsx',
  'src/components/ImpactParticles.tsx',
  'src/components/WinAnimations/SlotWinReveal.tsx',
  'src/components/WinAnimations/SlotAnticipation.tsx',
  'src/components/WinAnimations/BallLandingImpact.tsx',
  'src/components/WinAnimations/CelebrationOverlay.tsx',
  'src/components/PrizeReveal/FreeRewardView.tsx',
  'src/components/PrizeReveal/NoWinView.tsx',
  'src/components/PrizeReveal/PurchaseOfferView.tsx',
  'src/components/PrizeReveal/CheckoutPopup.tsx',
  'src/components/PrizeReveal/RewardItem.tsx',
  'src/components/PrizeClaimed.tsx',
];

componentsToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    fixComponent(filePath);
  } else {
    console.log(`❌ Not found: ${file}`);
  }
});

console.log('\n✨ Done! Now manually review and fix any remaining issues.');