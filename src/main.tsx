import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import sdk from '@farcaster/frame-sdk';

// Initialize Farcaster SDK inside Warpcast iframe
const initFarcaster = async (): Promise<void> => {
  if (window.self !== window.top) {
    try {
      console.log('[MAIN] Initializing Farcaster SDK...');

      const context = await sdk.context;
      console.log('[MAIN] Context:', context);

      // Dismiss splash screen
      sdk.actions.ready();
      console.log('[MAIN] ✅ ready() called');
    } catch (error) {
      console.error('[MAIN] SDK Error:', error);
    }
  }
};

// Call after DOM is ready
initFarcaster();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
