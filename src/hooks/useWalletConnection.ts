import { useCurrentWallet, useConnectWallet } from '@mysten/dapp-kit'
import { useEffect, useState } from 'react'

export function useWalletConnection() {
  const { currentWallet, isConnected, connectionStatus } = useCurrentWallet()
  const { mutate: connect, isPending: isConnecting } = useConnectWallet()
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
      address: currentWallet?.accounts[0]?.address,
      isConnecting,
      isReady,
      connectionStatus
    })
  }, [isConnected, currentWallet, isConnecting, isReady, connectionStatus])

  return {
    isConnected,
    address: currentWallet?.accounts[0]?.address,
    isConnecting,
    isDisconnected: !isConnected,
    isReady,
    // Helper to check if we should show wallet connection prompt
    shouldShowConnectPrompt: isReady && !isConnecting && !isConnected,
    // Helper to check if wallet is ready and connected
    isWalletReady: isReady && isConnected && !!currentWallet?.accounts[0]?.address
  }
}
