import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, base, arbitrum, optimism, polygon } from 'wagmi/chains'
import App from './App.tsx'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css'
import './rainbow-kit-custom.css'
import { ThemeProvider } from './contexts/ThemeContext'

const config = getDefaultConfig({
  appName: 'Seti Prediction Markets',
  projectId: 'seti-prediction-markets-dev', // Development project ID
  chains: [mainnet, base, arbitrum, optimism, polygon],
  ssr: false, // If your dApp uses server side rendering (SSR)
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <App />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
