import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Plinko E2E test suite...');

  // Start dev server (handled by webServer config)
  // Any additional global setup here

  // Warm up the application
  // Get baseURL from webServer config or first project's use config
  const baseURL =
    config.webServer?.url || config.projects?.[0]?.use?.baseURL || 'http://localhost:5173';
  console.log(`Warming up application at ${baseURL}...`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✅ Application warmed up successfully');
  } catch (error) {
    console.warn('⚠️  Application warmup failed:', error);
  } finally {
    await browser.close();
  }

  console.log('✅ Global setup complete\n');
}

export default globalSetup;
