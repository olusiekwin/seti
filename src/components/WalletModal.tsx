import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useConnect } from 'wagmi'
import { Wallet, X } from 'lucide-react'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, connectors, isPending } = useConnect()
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null)

  // Debug: Log available connectors
  console.log('Available connectors:', connectors.map(c => ({ name: c.name, uid: c.uid })))

  const handleWalletConnect = async (connector: any) => {
    try {
      console.log('Attempting to connect to:', {
        name: connector.name,
        uid: connector.uid,
        type: connector.type,
        id: connector.id
      })
      
      setConnectingWallet(connector.name)
      await connect({ connector })
      onClose()
    } catch (error) {
      console.error('Wallet connection failed:', error)
      setConnectingWallet(null)
      // Show user-friendly error message
      alert(`Failed to connect to ${connector.name}. Please try again.`)
    }
  }

  // Cache for wallet icons to prevent duplicate requests
  const iconCache = useRef<Record<string, string>>({})
  
  // Get wallet icon with proper fallback logic
  const getWalletIcon = (connectorName: string) => {
    const normalizedName = connectorName.toLowerCase().trim()
    
    console.log('Getting icon for:', { connectorName, normalizedName })
    
    // Check cache first
    if (iconCache.current[normalizedName]) {
      console.log('Found cached icon for:', normalizedName)
      return iconCache.current[normalizedName]
    }
    
    // Comprehensive wallet logos using reliable sources
    // Primary sources: spothq/cryptocurrency-icons, WalletConnect assets, official repos
    const walletLogos: Record<string, string> = {
      // Match exact connector names from console output
      'MetaMask': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/metamask.svg',
      'Coinbase Wallet': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/coinbase.svg',
      'Brave Wallet': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/brave.svg',
      'Rainbow': 'https://raw.githubusercontent.com/rainbow-me/rainbow/master/src/images/rainbow-icon.png',
      'Enkrypt': 'https://raw.githubusercontent.com/enkryptcom/enkrypt/master/src/assets/icon.svg',
      'Injected': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/metamask.svg',
      
      // Also support lowercase variations
      'metamask': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/metamask.svg',
      'coinbase': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/coinbase.svg',
      'coinbase wallet': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/coinbase.svg',
      'brave': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/brave.svg',
      'brave wallet': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/brave.svg',
      'rainbow': 'https://raw.githubusercontent.com/rainbow-me/rainbow/master/src/images/rainbow-icon.png',
      'enkrypt': 'https://raw.githubusercontent.com/enkryptcom/enkrypt/master/src/assets/icon.svg',
      'injected': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/metamask.svg',
      
      // Additional wallets
      'walletconnect': 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Icon/Gradient/Icon.png',
      'trust': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/trust.svg',
      'trust wallet': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/trust.svg',
      'frame': 'https://raw.githubusercontent.com/framehq/frame/master/packages/frame/src/assets/frame-icon.svg',
      'rabby': 'https://raw.githubusercontent.com/RabbyHub/Rabby/master/assets/icon-128.png',
      'okx': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/okx.svg',
      'zerion': 'https://raw.githubusercontent.com/zerionio/zerion/master/src/assets/images/zerion-icon.svg',
      'imtoken': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/imtoken.svg',
      'tokenpocket': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/tokenpocket.svg',
      'phantom': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/phantom.svg',
      'solflare': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/solflare.svg'
    }
    
    // Fallback URLs using alternative reliable sources
    const fallbackLogos: Record<string, string> = {
      // Match exact connector names
      'MetaMask': 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg',
      'Coinbase Wallet': 'https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/32/color/coinbase.png',
      'Brave Wallet': 'https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/32/color/brave.png',
      'Rainbow': 'https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/32/color/rainbow.png',
      'Enkrypt': 'https://raw.githubusercontent.com/enkryptcom/enkrypt/master/src/assets/icon.svg',
      'Injected': 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg',
      
      // Also support lowercase variations
      'metamask': 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg',
      'coinbase': 'https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/32/color/coinbase.png',
      'brave': 'https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/32/color/brave.png',
      'rainbow': 'https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/32/color/rainbow.png',
      'enkrypt': 'https://raw.githubusercontent.com/enkryptcom/enkrypt/master/src/assets/icon.svg',
      'injected': 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg',
      'trust': 'https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/32/color/trust.png',
      'walletconnect': 'https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/32/color/walletconnect.png'
    }
    
    // Try exact match first (both normalized and original)
    if (walletLogos[connectorName]) {
      console.log('Found exact match for original name:', connectorName)
      iconCache.current[normalizedName] = walletLogos[connectorName]
      return walletLogos[connectorName]
    }
    
    if (walletLogos[normalizedName]) {
      console.log('Found exact match for normalized name:', normalizedName)
      iconCache.current[normalizedName] = walletLogos[normalizedName]
      return walletLogos[normalizedName]
    }
    
    // Try partial matches for common variations
    for (const [key, logo] of Object.entries(walletLogos)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        iconCache.current[normalizedName] = logo
        return logo
      }
    }
    
    console.log('No logo found for:', connectorName)
    return null
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div 
        className="flex-1 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Right Sidebar */}
      <div className="w-[400px] bg-background border-l shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[hsl(208,65%,75%)]" />
            <h2 className="text-xl font-bold text-foreground">Connect Your Wallet</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground px-6 py-2">
            Choose your preferred wallet to connect to Seti
          </p>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {connectors.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                No wallet connectors available. Please install a wallet extension.
              </p>
              <Button
                variant="outline"
                onClick={() => window.open('https://metamask.io/download/', '_blank')}
                className="w-full bg-transparent border-[hsl(208,65%,75%)] text-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,75%)] hover:text-background transition-all duration-200"
              >
                Install MetaMask
              </Button>
            </div>
          ) : (
            // Deduplicate and filter connectors
            connectors
              .filter((connector, index, self) => {
                // Remove duplicates based on connector name
                const nameIndex = self.findIndex(c => c.name === connector.name)
                return nameIndex === index
              })
              .filter((connector) => {
                // Filter out connectors that might be problematic
                const name = connector.name.toLowerCase()
                // Keep all connectors but log them for debugging
                console.log('Connector details:', {
                  name: connector.name,
                  uid: connector.uid,
                  type: connector.type,
                  id: connector.id
                })
                return true
              })
              .sort((a, b) => {
                // Sort MetaMask first, then alphabetically
                if (a.name.toLowerCase().includes('metamask')) return -1
                if (b.name.toLowerCase().includes('metamask')) return 1
                return a.name.localeCompare(b.name)
              })
              .map((connector) => {
              const isConnecting = connectingWallet === connector.name
              const walletIcon = getWalletIcon(connector.name)
              
              return (
                <Button
                  key={connector.uid}
                  variant="outline"
                  className={`w-full h-auto p-4 flex items-center justify-between transition-all duration-200 hover:scale-[1.02] bg-transparent border-border/50 hover:border-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,75%)]/10 ${
                    isConnecting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  onClick={() => handleWalletConnect(connector)}
                  disabled={isPending || isConnecting}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted/30 border border-border/50 flex items-center justify-center overflow-hidden">
                      {walletIcon ? (
                        <img 
                          src={walletIcon} 
                          alt={connector.name}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            // Fallback to generic wallet icon if image fails to load
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <Wallet className={`w-5 h-5 text-[hsl(208,65%,75%)] ${walletIcon ? 'hidden' : ''}`} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-foreground">{connector.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Connect using {connector.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {isConnecting ? (
                      <div className="animate-spin w-5 h-5 border-2 border-[hsl(208,65%,75%)] border-t-transparent rounded-full" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-[hsl(208,65%,75%)]" />
                    )}
                  </div>
                </Button>
              )
            })
          )}

          <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border/50">
          By connecting a wallet, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  )
}