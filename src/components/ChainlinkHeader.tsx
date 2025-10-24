"use client"

import { Button } from "@/components/ui/button"
import { Search, Wallet, Copy, Check, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useChainlinkWallet } from "./ChainlinkWalletProvider"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useScroll } from '@/hooks/use-scroll'

export function ChainlinkHeader() {
  const location = useLocation()
  const { scrollDirection } = useScroll()
  const { isConnected, address, balance, connect, disconnect, chainId, switchToBase } = useChainlinkWallet()
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isBaseNetwork = chainId === 8453; // Base mainnet chain ID

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
                placeholder="Search Seti markets..."
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

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-4 mr-4">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <span>About Seti</span>
              <span className="text-xs">ℹ</span>
            </Link>
            <Link to="/chainlink" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <span>Chainlink Demo</span>
              <span className="text-xs">🔗</span>
            </Link>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center gap-2 lg:gap-3">
            {isConnected && address ? (
              <>
                {/* Network Status */}
                {!isBaseNetwork && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={switchToBase}
                    className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Switch to Base
                  </Button>
                )}

                {/* Balance Display */}
                <div className="hidden sm:flex items-center gap-2 px-2 lg:px-3 py-2 bg-muted/30 rounded-xl border border-border/50">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {balance} ETH
                  </span>
                </div>

                {/* Address Display */}
                <Button
                  variant="outline"
                  size="sm"
                  className="items-center gap-1 lg:gap-2 transition-all duration-200 hover:scale-105 rounded-xl bg-transparent"
                  onClick={copyAddress}
                >
                  <span className="text-xs lg:text-sm font-mono">
                    {address.slice(0, 4)}...{address.slice(-4)}
                  </span>
                  {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnect}
                  className="text-muted-foreground hover:text-foreground hidden sm:inline-flex rounded-xl"
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                className="bg-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,85%)] text-background transition-all duration-200 hover:scale-105"
                onClick={connect}
              >
                <Wallet className="w-4 h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </Button>
            )}
          </div>
        </div>
      </header>
    </div>
  )
}
