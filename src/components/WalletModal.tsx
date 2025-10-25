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

  const getWalletIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'metamask':
        return '🦊'
      case 'coinbase wallet':
        return '🔵'
      case 'walletconnect':
        return '🔗'
      case 'rainbow':
        return '🌈'
      case 'trust wallet':
        return '🛡️'
      case 'brave wallet':
        return '🦁'
      default:
        return '👛'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
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
            connectors.map((connector) => (
              <Button
                key={connector.uid}
                variant="outline"
                className="w-full h-auto p-4 flex items-center justify-between hover:bg-muted/50"
                onClick={() => handleWalletConnect(connector)}
                disabled={isPending || connectingWallet === connector.name}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {getWalletIcon(connector.name)}
                  </span>
                  <div className="text-left">
                    <div className="font-medium">{connector.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Connect using {connector.name}
                    </div>
                  </div>
                </div>
                {connectingWallet === connector.name ? (
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            ))
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          By connecting a wallet, you agree to our Terms of Service and Privacy Policy.
        </div>
      </DialogContent>
    </Dialog>
  )
}