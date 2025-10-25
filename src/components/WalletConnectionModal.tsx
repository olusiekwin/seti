import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useConnect, useDisconnect } from 'wagmi'
import { Wallet, ExternalLink, Check, ArrowRight } from 'lucide-react'

interface WalletConnectionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletConnectionModal({ isOpen, onClose }: WalletConnectionModalProps) {
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null)

  const handleWalletConnect = async (connector: any) => {
    try {
      setConnectingWallet(connector.name)
      await connect({ connector })
      onClose() // Close modal on successful connection
    } catch (error) {
      console.error('Wallet connection failed:', error)
      setConnectingWallet(null)
    }
  }

  // Enhanced wallet configuration with real logos and better descriptions
  const getWalletConfig = (name: string) => {
    const configs: Record<string, { icon: string; description: string; color: string; logo: string }> = {
      'MetaMask': {
        icon: '🦊',
        description: 'Connect using your MetaMask browser extension',
        color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
        logo: 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg'
      },
      'Coinbase Wallet': {
        icon: '🔵',
        description: 'Connect using Coinbase Wallet browser extension',
        color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
        logo: 'https://images.ctfassets.net/9sy2a0egs6zh/4zJfzJbG3kTRvVQHBAyHjF/6b7a5c8c8c8c8c8c8c8c8c8c/coinbase-wallet-logo.svg'
      },
      'WalletConnect': {
        icon: '🔗',
        description: 'Connect using WalletConnect mobile app',
        color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
        logo: 'https://avatars.githubusercontent.com/u/37784886?s=200&v=4'
      },
      'Rainbow': {
        icon: '🌈',
        description: 'Connect using Rainbow wallet',
        color: 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 hover:from-pink-100 hover:to-purple-100',
        logo: 'https://avatars.githubusercontent.com/u/49908258?s=200&v=4'
      },
      'Trust Wallet': {
        icon: '🛡️',
        description: 'Connect using Trust Wallet',
        color: 'bg-green-50 border-green-200 hover:bg-green-100',
        logo: 'https://trustwallet.com/assets/images/media/assets/trust_platform.svg'
      },
      'Brave Wallet': {
        icon: '🦁',
        description: 'Connect using Brave browser wallet',
        color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
        logo: 'https://brave.com/static-assets/images/brave-logo.svg'
      },
      'Frame': {
        icon: '🖼️',
        description: 'Connect using Frame wallet',
        color: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
        logo: 'https://frame.sh/frame-logo.svg'
      },
      'Rabby': {
        icon: '🐰',
        description: 'Connect using Rabby wallet',
        color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
        logo: 'https://rabby.io/logo.svg'
      }
    }
    
    return configs[name] || {
      icon: '👛',
      description: 'Connect using your wallet',
      color: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
      logo: ''
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-xl">
            <Wallet className="w-6 h-6 text-primary" />
            Connect Your Wallet
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Choose your preferred wallet to connect to Seti
          </p>
        </DialogHeader>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {connectors.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Wallet className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Wallets Detected</h3>
              <p className="text-muted-foreground mb-6">
                Please install a wallet extension to continue
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => window.open('https://metamask.io/download/', '_blank')}
                  className="w-full justify-start"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Install MetaMask
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://www.coinbase.com/wallet', '_blank')}
                  className="w-full justify-start"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Install Coinbase Wallet
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {connectors.map((connector) => {
                const config = getWalletConfig(connector.name)
                const isConnecting = connectingWallet === connector.name
                
                return (
                  <Button
                    key={connector.uid}
                    variant="outline"
                    className={`w-full h-auto p-4 flex items-center justify-between transition-all duration-200 ${config.color} ${
                      isConnecting ? 'opacity-75 cursor-not-allowed' : 'hover:scale-[1.02]'
                    }`}
                    onClick={() => handleWalletConnect(connector)}
                    disabled={isPending || isConnecting}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                        {config.logo ? (
                          <img 
                            src={config.logo} 
                            alt={connector.name}
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling!.style.display = 'block'
                            }}
                          />
                        ) : null}
                        <span className="text-lg" style={{ display: config.logo ? 'none' : 'block' }}>
                          {config.icon}
                        </span>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-foreground">{connector.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {config.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {isConnecting ? (
                        <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </Button>
                )
              })}
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center pt-4 border-t bg-muted/30 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
          <div className="flex items-center justify-center gap-1">
            <Check className="w-3 h-3" />
            <span>By connecting a wallet, you agree to our Terms of Service and Privacy Policy</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
