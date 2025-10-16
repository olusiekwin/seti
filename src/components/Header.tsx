"use client"

import { Button } from "@/components/ui/button"
import { Search, Wallet, Plus, Copy, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  useCurrentWallet,
  useConnectWallet,
  useDisconnectWallet,
  useWallets,
  useSuiClient,
  useAccounts,
} from "@mysten/dapp-kit"
import { useState, useEffect } from "react"
import { CreateMarketModal } from "./CreateMarketModal"
import { WalletModal } from "./WalletModal"
import { Link, useLocation } from "react-router-dom"

import { useScroll } from '@/hooks/use-scroll'

export function Header() {
  const location = useLocation()
  const { currentWallet, isConnected } = useCurrentWallet()
  const { scrollDirection } = useScroll()
  const accounts = useAccounts()
  const { mutate: connect } = useConnectWallet()
  const { mutate: disconnect } = useDisconnectWallet()
  const wallets = useWallets()
  const client = useSuiClient()
  const [isCreateMarketOpen, setIsCreateMarketOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [balance, setBalance] = useState<string>("0")
  const [copied, setCopied] = useState(false)

  const currentAccount = accounts?.[0]

  // Auto-connect wallet if available and save connection state
  useEffect(() => {
    const autoConnect = async () => {
      if (!isConnected && wallets.length > 0) {
        try {
          // Check if wallet was previously connected
          const lastConnectedWallet = localStorage.getItem("lastConnectedWallet")
          if (lastConnectedWallet) {
            const wallet = wallets.find((w) => w.name === lastConnectedWallet)
            if (wallet) {
              connect({ wallet })
            }
          }
        } catch (error) {
          console.log("Auto-connect failed:", error)
        }
      }
    }

    // Only try auto-connect once when component mounts
    const timer = setTimeout(autoConnect, 1000)
    return () => clearTimeout(timer)
  }, []) // Empty dependency array - only run once

  // Save wallet connection state
  useEffect(() => {
    if (isConnected && currentWallet) {
      localStorage.setItem("lastConnectedWallet", currentWallet.name)
    } else if (!isConnected) {
      localStorage.removeItem("lastConnectedWallet")
    }
  }, [isConnected, currentWallet])

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (currentAccount?.address) {
        try {
          const coins = await client.getCoins({
            owner: currentAccount.address,
            coinType: "0x2::sui::SUI",
          })

          const totalBalance = coins.data.reduce((sum, coin) => {
            return sum + Number.parseInt(coin.balance)
          }, 0)

          // Convert from MIST to SUI (1 SUI = 1,000,000,000 MIST)
          const suiBalance = (totalBalance / 1_000_000_000).toFixed(4)
          setBalance(suiBalance)
        } catch (error) {
          console.error("Error fetching balance:", error)
          setBalance("0")
        }
      }
    }

    fetchBalance()
  }, [currentAccount?.address, client])

  const copyAddress = async () => {
    if (currentAccount?.address) {
      await navigator.clipboard.writeText(currentAccount.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Save wallet connection to localStorage when connected
  useEffect(() => {
    if (isConnected && currentWallet) {
      localStorage.setItem("lastConnectedWallet", currentWallet.name)
    }
  }, [isConnected, currentWallet])

  return (
    <div className="flex flex-col">
      <header
        className={`sticky top-0 z-50 w-full border-b border-border/20 bg-background/80 backdrop-blur flex justify-center transform transition-transform duration-300 ${scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
          }`}
      >
        <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-7xl w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity gap-2">
            <img src="./seti_.svg" alt="Seti logo" className="h-8 w-8" />
            <span
              className="text-2xl font-bold text-snow"
              style={{
                fontFamily: "'Fortune Variable'",
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              Seti
            </span>
          </Link>

          {/* Search */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-4 lg:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search Seti..."
                className="pl-10 bg-muted/30 border-border/50 focus:border-primary/50 focus:bg-muted/50 rounded-xl"
                onChange={(e) => {
                  // Dispatch a custom event that other components can listen to
                  const searchEvent = new CustomEvent('marketSearch', {
                    detail: { query: e.target.value.toLowerCase() }
                  });
                  window.dispatchEvent(searchEvent);
                }}
              />
            </div>
          </div>

          {/* Navigation Links - Only shown when connected */}
          {isConnected && (
            <nav className="hidden lg:flex items-center gap-1 mr-4">
              <Link to="/dashboard" className={`relative group px-3 py-2 ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                <span className="text-sm font-medium group-[.active]:text-[hsl(208,65%,85%)] hover:text-[hsl(208,65%,85%)] transition-colors duration-200">
                  Dashboard
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[hsl(208,65%,85%)] scale-x-0 group-[.active]:scale-x-100 transition-all duration-500 ease-out origin-left"></div>
                </span>
              </Link>
              <Link to="/activity" className={`relative group px-3 py-2 ${location.pathname === '/activity' ? 'active' : ''}`}>
                <span className="text-sm font-medium group-[.active]:text-[hsl(208,65%,85%)] hover:text-[hsl(208,65%,85%)] transition-colors duration-200">
                  Activity
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[hsl(208,65%,85%)] scale-x-0 group-[.active]:scale-x-100 transition-all duration-500 ease-out origin-left"></div>
                </span>
              </Link>
              <Link to="/profile" className={`relative group px-3 py-2 ${location.pathname === '/profile' ? 'active' : ''}`}>
                <span className="text-sm font-medium group-[.active]:text-[hsl(208,65%,85%)] hover:text-[hsl(208,65%,85%)] transition-colors duration-200">
                  Profile
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[hsl(208,65%,85%)] scale-x-0 group-[.active]:scale-x-100 transition-all duration-500 ease-out origin-left"></div>
                </span>
              </Link>
            </nav>
          )}

          {/* Wallet Connection */}
          <div className="flex items-center gap-2 lg:gap-3">
            {isConnected && currentWallet && currentAccount ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="items-center gap-1 lg:gap-2 rounded-xl bg-transparent hover:bg-[hsl(208,65%,75%)] hover:text-background border-[hsl(208,65%,75%)]"
                  onClick={() => setIsCreateMarketOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Market</span>
                  <span className="sm:hidden">Create</span>
                </Button>

                {/* Balance Display */}
                <div className="hidden sm:flex items-center gap-2 px-2 lg:px-3 py-2 bg-muted/30 rounded-xl border border-border/50">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">${balance}</span>
                </div>

                {/* Address Display */}
                <Button
                  variant="outline"
                  size="sm"
                  className="items-center gap-1 lg:gap-2 transition-all duration-200 hover:scale-105 rounded-xl bg-transparent"
                  onClick={copyAddress}
                >
                  <span className="text-xs lg:text-sm font-mono">
                    {currentAccount.address.slice(0, 4)}...{currentAccount.address.slice(-4)}
                  </span>
                  {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => disconnect()}
                  className="text-muted-foreground hover:text-foreground hidden sm:inline-flex rounded-xl"
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                className="bg-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,85%)] text-background transition-all duration-200 hover:scale-105"
                onClick={() => setIsWalletModalOpen(true)}
              >
                <Wallet className="w-4 h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <CreateMarketModal
        isOpen={isCreateMarketOpen}
        onClose={() => setIsCreateMarketOpen(false)}
        onSuccess={(marketId) => {
          // You can add additional success handling here
        }}
      />

      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </div>
  )
}
