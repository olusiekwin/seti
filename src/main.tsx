import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import sdk from '@farcaster/frame-sdk';



const initFarcaster = async (): Promise<void> => {
  // Only run if inside an iframe (i.e. a Farcaster frame, like Warpcast)
  if (window.self !== window.top) {
    try {
      console.log('[MAIN] Initializing Farcaster SDK...');

      const context: Context = await sdk.context;
      console.log('[MAIN] Context:', context);

      // Notify Farcaster that your frame is ready
      sdk.actions.ready();
      console.log('[MAIN] ✅ ready() called');
    } catch (error: unknown) {
      console.error('[MAIN] SDK Error:', error);
    }
  }
};


document.addEventListener('DOMContentLoaded', initFarcaster);

createRoot(document.getElementById("root")!).render(<App />);
