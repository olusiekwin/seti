import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useConnect } from 'wagmi'
import { Wallet } from 'lucide-react'
import { useOnchainKit } from '@coinbase/onchainkit'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, connectors, isPending } = useConnect()
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null)
  const { wallets } = useOnchainKit()

  const handleWalletConnect = async (connector: any) => {
    try {
      setConnectingWallet(connector.name)
      await connect({ connector })
      onClose()
    } catch (error) {
      console.error('Wallet connection failed:', error)
      setConnectingWallet(null)
    }
  }

  // Get wallet icon with proper fallback logic
  const getWalletIcon = (connectorName: string) => {
    console.log('Getting icon for wallet:', connectorName)
    
    // First try OnchainKit's built-in wallet objects
    const onchainWallet = wallets?.find(w => 
      w.name.toLowerCase().includes(connectorName.toLowerCase()) ||
      connectorName.toLowerCase().includes(w.name.toLowerCase())
    )
    
    if (onchainWallet?.logo) {
      console.log('Found OnchainKit logo:', onchainWallet.logo)
      return onchainWallet.logo
    }

    // Fallback to reliable wallet logos for major wallets
    const walletLogos: Record<string, string> = {
      'metamask': 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
      'coinbase': 'https://images.ctfassets.net/9sy2a0egs6zh/4zJfzJbG3kTDSk5Wo4RJI1/3f97172ff64d2367d4a8b3f8d3b3b3b3/coinbase-wallet-logo.svg',
      'coinbase wallet': 'https://images.ctfassets.net/9sy2a0egs6zh/4zJfzJbG3kTDSk5Wo4RJI1/3f97172ff64d2367d4a8b3f8d3b3b3b3/coinbase-wallet-logo.svg',
      'walletconnect': 'https://avatars.githubusercontent.com/u/37784886?s=200&v=4',
      'rainbow': 'https://avatars.githubusercontent.com/u/48574949?s=200&v=4',
      'brave': 'https://brave.com/wp-content/themes/brave-2019-static/assets/images/brave-logo.svg',
      'brave wallet': 'https://brave.com/wp-content/themes/brave-2019-static/assets/images/brave-logo.svg',
      'trust': 'https://trustwallet.com/assets/images/media/assets/trust_platform.svg',
      'trust wallet': 'https://trustwallet.com/assets/images/media/assets/trust_platform.svg',
      'frame': 'https://frame.sh/favicon.ico',
      'rabby': 'https://rabby.io/favicon.ico',
      'enkrypt': 'https://enkrypt.com/favicon.ico',
      'injected': 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg'
    }

    const normalizedName = connectorName.toLowerCase().trim()
    console.log('Normalized name:', normalizedName)
    
    // Try exact match first
    if (walletLogos[normalizedName]) {
      console.log('Found exact match:', walletLogos[normalizedName])
      return walletLogos[normalizedName]
    }
    
    // Try partial matches for common variations
    for (const [key, logo] of Object.entries(walletLogos)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        console.log('Found partial match:', key, logo)
        return logo
      }
    }
    
    console.log('No logo found for:', connectorName)
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border/50 backdrop-blur-sm">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-xl text-foreground">
            <Wallet className="w-6 h-6 text-[hsl(208,65%,75%)]" />
            Connect Your Wallet
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Choose your preferred wallet to connect to Seti
          </p>
        </DialogHeader>
        
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
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
            connectors.map((connector) => {
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
                            e.currentTarget.nextElementSibling!.style.display = 'block'
                          }}
                        />
                      ) : null}
                      <Wallet 
                        className="w-5 h-5 text-[hsl(208,65%,75%)]" 
                        style={{ display: walletIcon ? 'none' : 'block' }}
                      />
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
        </div>

        <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border/50">
          By connecting a wallet, you agree to our Terms of Service and Privacy Policy.
        </div>
      </DialogContent>
    </Dialog>
  )
}