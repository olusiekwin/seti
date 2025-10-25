import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'

export function useWalletConnection() {
  const { address, isConnected, isConnecting, status } = useAccount()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Give a small delay to ensure wallet state is properly initialized
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Debug logging - only log when state actually changes
  useEffect(() => {
    if (isReady) {
      console.log('Wallet Connection State:', {
        isConnected,
        address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : undefined,
        isConnecting,
        status
      })
    }
  }, [isConnected, address, isConnecting, isReady, status])

  // Determine if we're actually connecting or just in a pending state
  const actuallyConnecting = isConnecting && status === 'connecting'
  const isDisconnected = !isConnected && !actuallyConnecting

  return {
    isConnected,
    address,
    isConnecting: actuallyConnecting,
    isDisconnected,
    isReady,
    // Helper to check if we should show wallet connection prompt
    shouldShowConnectPrompt: isReady && !actuallyConnecting && !isConnected,
    // Helper to check if wallet is ready and connected
    isWalletReady: isReady && isConnected && !!address
  }
}
