import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { baseSepolia } from 'wagmi/chains'
import { injected, coinbaseWallet } from 'wagmi/connectors'
import App from './App.tsx'
import './index.css'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'


// Suppress Coinbase analytics errors that are blocked by ad blockers
const originalConsoleError = console.error
console.error = (...args) => {
  const message = args[0]?.toString() || ''
  if (
    message.includes('Analytics SDK') ||
    message.includes('Failed to fetch') ||
    message.includes('ERR_BLOCKED_BY_CLIENT') ||
    message.includes('cca-lite.coinbase.com')
  ) {
    // Suppress these non-critical errors
    return
  }
  originalConsoleError.apply(console, args)
}

const queryClient = new QueryClient()

const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected(),
    // Remove walletConnect for now since we don't have a project ID
    coinbaseWallet({
      appName: 'Seti',
      appLogoUrl: 'https://seti.app/logo.png',
    }),
  ],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
})

// Component that uses theme context for OnchainKit
function OnchainKitWrapper({ children }: { children: React.ReactNode }) {
  const { actualTheme } = useTheme()
  
  return (
    <OnchainKitProvider
      chain={baseSepolia}
      config={{
        appearance: { 
          mode: 'auto',
          theme: actualTheme
        },
        wallet: { 
          display: 'modal', 
          preference: 'all'
        },
      }}
    >
      {children}
    </OnchainKitProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <OnchainKitWrapper>
            <App />
          </OnchainKitWrapper>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
