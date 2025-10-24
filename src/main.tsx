import React from 'react'
import ReactDOM from 'react-dom/client'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base } from 'wagmi/chains'
import App from './App.tsx'
import './index.css'
import './onchainkit-custom.css'
import { ThemeProvider } from './contexts/ThemeContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <OnchainKitProvider
        apiKey="seti-prediction-markets-dev"
        chain={base}
        config={{
          appearance: { mode: 'auto' },
          wallet: { display: 'modal', preference: 'all' },
        }}
      >
        <App />
      </OnchainKitProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
