# Vercel Deployment Setup

This guide explains how to deploy the Plinko game to Vercel with dev tools enabled for QA/staging environments.

## Quick Setup

The project includes a `vercel.json` configuration file that automatically enables dev tools in Vercel production builds.

### Automatic Configuration (Recommended)

The `vercel.json` file at the project root is pre-configured with:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_ENABLE_DEV_TOOLS": "true"
  },
  "build": {
    "env": {
      "VITE_ENABLE_DEV_TOOLS": "true"
    }
  }
}
```

This ensures the dev menu (gear icon) is visible in production builds on Vercel.

### Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Configure Vercel deployment with dev tools"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will automatically detect Vite and use the settings from `vercel.json`

3. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your project
   - Dev tools will be enabled automatically

## Manual Configuration (Alternative)

If you prefer to configure via Vercel Dashboard instead of `vercel.json`:

### Option 1: Vercel Dashboard

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name:** `VITE_ENABLE_DEV_TOOLS`
   - **Value:** `true`
   - **Environment:** Production, Preview, Development (select all)
4. Click **Save**
5. Redeploy your project

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Set environment variable
vercel env add VITE_ENABLE_DEV_TOOLS

# When prompted:
# - Value: true
# - Environments: Select Production, Preview, Development
```

## Verification

After deployment, verify dev tools are enabled:

1. Visit your Vercel deployment URL
2. Look for the **gear icon** in the bottom-right corner
3. Click it to open the dev menu
4. You should see:
   - Theme selector
   - Choice Mechanic toggle
   - **Performance Mode selector** (High Quality / Balanced / Power Saving)
   - Viewport Size selector (desktop only)

## Environment-Specific Configuration

### Staging/QA Environment (Dev Tools Enabled)

Use the current configuration. Dev tools will be visible for testing.

### Production Environment (Dev Tools Disabled)

When ready for true production deployment:

1. **Remove or update `vercel.json`:**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite"
   }
   ```

2. **Or use Vercel environment-specific variables:**
   - Create a separate Vercel project for production
   - Don't set `VITE_ENABLE_DEV_TOOLS` (defaults to disabled)

## Multi-Environment Strategy

Recommended approach for managing staging vs production:

### Approach 1: Separate Projects

- **Project 1:** `plinko-staging` (with `VITE_ENABLE_DEV_TOOLS=true`)
- **Project 2:** `plinko-production` (without env var, dev tools disabled)

### Approach 2: Branch-Based Deployment

Configure in `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_ENABLE_DEV_TOOLS": "true"
  },
  "github": {
    "enabled": true,
    "autoAlias": true
  }
}
```

- **Main branch** → Production deployment (override env var to disable)
- **Develop branch** → Staging deployment (dev tools enabled)

### Approach 3: Custom Environment Variable

Create a Vercel project environment variable that differs per environment:

**Staging:**
```
VITE_ENABLE_DEV_TOOLS=true
```

**Production:**
```
VITE_ENABLE_DEV_TOOLS=false
```

Or simply remove the variable for production (defaults to false).

## Troubleshooting

### Dev Tools Not Showing

1. **Check build logs** in Vercel Dashboard → Deployments → [Your Deployment] → Building
2. Look for: `VITE_ENABLE_DEV_TOOLS` in environment variables section
3. Verify it's set to `"true"` (string, not boolean)

### Build Fails

If build fails with the `vercel.json` configuration:

1. Check that `npm run build` works locally
2. Verify `package.json` has correct build script:
   ```json
   {
     "scripts": {
       "build": "tsc -b && vite build"
     }
   }
   ```

3. Check Vercel logs for specific error messages

### Dev Menu Shows but Performance Toggle Missing

Verify the build includes the latest code:
```bash
git status  # Check no uncommitted changes
git log -1  # Verify latest commit
git push    # Push to trigger new deployment
```

## Security Considerations

### Dev Tools in Production

The dev menu exposes:
- Theme switching (cosmetic only)
- Performance mode control (client-side only)
- Viewport simulation (visual testing)
- Choice mechanic toggle (gameplay mechanics)

**Security Impact:** Low
- No sensitive data exposed
- No backend API access
- Client-side only settings
- No user data modification

**Recommended:** Safe for staging/QA environments. Disable for final production.

### When to Disable Dev Tools

Disable dev tools (`VITE_ENABLE_DEV_TOOLS=false`) when:
- Launching to end users
- Public production environment
- Want to prevent user confusion
- Need to hide performance controls from users

### When to Keep Dev Tools Enabled

Keep dev tools enabled when:
- QA/staging environment
- Internal testing
- Demo environment
- Development previews
- Client review builds

## Related Files

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel deployment configuration |
| `.env.example` | Environment variable documentation |
| `src/config/appConfig.ts` | Dev tools feature flag logic |
| `src/dev-tools/DevToolsLoader.tsx` | Lazy-loaded dev tools component |
| `src/dev-tools/components/DevToolsMenu.tsx` | Dev menu UI |

## Further Reading

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Project Configuration](https://vercel.com/docs/project-configuration)
- [Power Saving Mode API](../power-saving-mode.md)
