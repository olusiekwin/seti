import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useConnect } from 'wagmi'
import { Wallet, ExternalLink } from 'lucide-react'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, connectors, isPending } = useConnect()
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null)

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

  const getWalletConfig = (name: string) => {
    const configs: Record<string, { icon: string; logo: string; color: string }> = {
      'MetaMask': {
        icon: '🦊',
        logo: 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg',
        color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
      },
      'Coinbase Wallet': {
        icon: '🔵',
        logo: 'https://images.ctfassets.net/9sy2a0egs6zh/4zJfzJbG3kTRvVQHBAyHjF/6b7a5c8c8c8c8c8c8c8c8c8c/coinbase-wallet-logo.svg',
        color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
      },
      'WalletConnect': {
        icon: '🔗',
        logo: 'https://avatars.githubusercontent.com/u/37784886?s=200&v=4',
        color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
      },
      'Rainbow': {
        icon: '🌈',
        logo: 'https://avatars.githubusercontent.com/u/49908258?s=200&v=4',
        color: 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 hover:from-pink-100 hover:to-purple-100'
      },
      'Trust Wallet': {
        icon: '🛡️',
        logo: 'https://trustwallet.com/assets/images/media/assets/trust_platform.svg',
        color: 'bg-green-50 border-green-200 hover:bg-green-100'
      },
      'Brave Wallet': {
        icon: '🦁',
        logo: 'https://brave.com/static-assets/images/brave-logo.svg',
        color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
      },
      'Frame': {
        icon: '🖼️',
        logo: 'https://frame.sh/frame-logo.svg',
        color: 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      },
      'Rabby': {
        icon: '🐰',
        logo: 'https://rabby.io/logo.svg',
        color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
      }
    }
    
    return configs[name] || {
      icon: '👛',
      logo: '',
      color: 'bg-gray-50 border-gray-200 hover:bg-gray-100'
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
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                No wallet connectors available. Please install a wallet extension.
              </p>
              <Button
                variant="outline"
                onClick={() => window.open('https://metamask.io/download/', '_blank')}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Install MetaMask
              </Button>
            </div>
          ) : (
            connectors.map((connector) => {
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
                        Connect using {connector.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {isConnecting ? (
                      <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                    ) : (
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </Button>
              )
            })
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          By connecting a wallet, you agree to our Terms of Service and Privacy Policy.
        </div>
      </DialogContent>
    </Dialog>
  )
}