"use client"

import { Button } from "@/components/ui/button"
import { Search, Plus, User, BarChart3, Activity, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { CreateMarketModal } from "./CreateMarketModal"
import { WalletConnectionModal } from "./WalletConnectionModal"
import { Link, useLocation } from "react-router-dom"
import { useAccount, useDisconnect } from 'wagmi'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "./ThemeToggle"
import { useWalletConnection } from '@/hooks/useWalletConnection'

import { useScroll } from '@/hooks/use-scroll'

export function Header() {
  const location = useLocation()
  const { scrollDirection } = useScroll()
  const [isCreateMarketOpen, setIsCreateMarketOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const { isConnected, address } = useWalletConnection()
  const { disconnect } = useDisconnect()

  return (
    <div className="flex flex-col">
      <header
        className={`sticky top-0 z-50 w-full border-b border-border/20 bg-background/80 backdrop-blur flex justify-center transform transition-transform duration-300 ${
          scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
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

          {/* Wallet Connection */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {isConnected && (
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
            )}

            {/* Wallet Connection */}
            {!isConnected ? (
              <Button
                onClick={() => setIsWalletModalOpen(true)}
                className="bg-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,85%)] text-background rounded-xl"
              >
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnect()}
                  className="rounded-xl"
                >
                  Disconnect
                </Button>
              </div>
            )}

            {/* User Menu Dropdown - Only shown when connected, positioned after wallet */}
            {isConnected && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="items-center gap-2 rounded-xl bg-transparent hover:bg-[hsl(208,65%,75%)] hover:text-background border-[hsl(208,65%,75%)]"
                  >
                    <User className="w-4 h-4" />
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/dashboard" 
                      className={`flex items-center gap-2 w-full ${location.pathname === '/dashboard' ? 'bg-[hsl(208,65%,75%)] text-background' : ''}`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/activity" 
                      className={`flex items-center gap-2 w-full ${location.pathname === '/activity' ? 'bg-[hsl(208,65%,75%)] text-background' : ''}`}
                    >
                      <Activity className="w-4 h-4" />
                      Activity
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/profile" 
                      className={`flex items-center gap-2 w-full ${location.pathname === '/profile' ? 'bg-[hsl(208,65%,75%)] text-background' : ''}`}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <CreateMarketModal
        isOpen={isCreateMarketOpen}
        onClose={() => setIsCreateMarketOpen(false)}
        onSuccess={(marketId) => {
          console.log('Market created:', marketId)
          setIsCreateMarketOpen(false)
        }}
      />

      <WalletConnectionModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  )
}