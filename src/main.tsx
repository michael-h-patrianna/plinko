/**
 * Application entry point
 * Initializes React root and renders the demo application
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@demo/App.tsx';
import { AppConfigProvider } from '@demo/config/AppConfigContext.tsx';
import '@demo/styles/globals.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <AppConfigProvider>
      <App />
    </AppConfigProvider>
  </StrictMode>
);
