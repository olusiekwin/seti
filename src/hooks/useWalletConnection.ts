import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'

export function useWalletConnection() {
  const { isConnected, address, isConnecting, isDisconnected } = useAccount()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Give a small delay to ensure wallet state is properly initialized
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Debug logging
  useEffect(() => {
    console.log('Wallet Connection State:', {
      isConnected,
      address,
      isConnecting,
      isDisconnected,
      isReady
    })
  }, [isConnected, address, isConnecting, isDisconnected, isReady])

  return {
    isConnected,
    address,
    isConnecting,
    isDisconnected,
    isReady,
    // Helper to check if we should show wallet connection prompt
    shouldShowConnectPrompt: isReady && !isConnecting && !isConnected,
    // Helper to check if wallet is ready and connected
    isWalletReady: isReady && isConnected && !!address
  }
}
