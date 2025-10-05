import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Wallet, ExternalLink } from "lucide-react";
import { useWallets, useConnectWallet } from '@mysten/dapp-kit';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const [detectedWallets, setDetectedWallets] = useState<any[]>([]);

  useEffect(() => {
    // Check for wallet extensions in the browser
    const checkWallets = () => {
      const walletExtensions = [];
      
      // Always show available wallets, let dapp-kit handle the connection
      walletExtensions.push({
        name: 'Sui Wallet',
        icon: '🟡',
        installed: true,
        downloadUrl: 'https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil'
      });
      
      walletExtensions.push({
        name: 'Suiet',
        icon: '🔵',
        installed: true,
        downloadUrl: 'https://chrome.google.com/webstore/detail/suiet-sui-wallet/khpkpbbcccdmmclmpigdgddabeilkdpd'
      });
      
      setDetectedWallets(walletExtensions);
    };

    if (isOpen) {
      checkWallets();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleWalletSelect = (wallet: any) => {
    // Try to connect with the wallet name
    const walletToConnect = wallets.find(w => 
      w.name.toLowerCase().includes(wallet.name.toLowerCase()) ||
      wallet.name.toLowerCase().includes(w.name.toLowerCase())
    );
    
    if (walletToConnect) {
      connect({ wallet: walletToConnect });
      onClose();
    } else {
      // If no matching wallet found, show install options
      window.open(wallet.downloadUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 min-h-screen">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full mx-auto my-auto max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gradient-gold font-orbitron">
              Connect Wallet
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-3">
            {wallets.length > 0 ? (
              wallets.map((wallet, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-16 text-left"
                  onClick={() => handleWalletSelect(wallet)}
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="w-6 h-6" />
                    <div className="flex-1">
                      <div className="font-medium">{wallet.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Ready to connect
                      </div>
                    </div>
                  </div>
                </Button>
              ))
            ) : detectedWallets.length > 0 ? (
              detectedWallets.map((wallet, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-16 text-left"
                  onClick={() => handleWalletSelect(wallet)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{wallet.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Click to connect
                      </div>
                    </div>
                  </div>
                </Button>
              ))
            ) : (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No wallets detected</h3>
                <p className="text-muted-foreground mb-4">
                  Please install a Sui wallet extension to continue.
                </p>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil', '_blank')}
                  >
                    <span className="mr-2">🟡</span>
                    Install Sui Wallet
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('https://chrome.google.com/webstore/detail/suiet-sui-wallet/khpkpbbcccdmmclmpigdgddabeilkdpd', '_blank')}
                  >
                    <span className="mr-2">🔵</span>
                    Install Suiet
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-border/20">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="w-full transition-all duration-200 hover:scale-105"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
