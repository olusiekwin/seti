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
    // Show all wallets detected by dapp-kit
    if (isOpen) {
      console.log('Available wallets from dapp-kit:', wallets.map(w => ({
        name: w.name,
        features: w.features,
        version: w.version
      })));
      
      // Map wallets to UI format
      const walletList = wallets.map(w => ({
        name: w.name,
        icon: getWalletIcon(w.name),
        installed: true,
        wallet: w
      }));
      
      // If no wallets detected, show install options
      if (walletList.length === 0) {
        walletList.push(
          {
            name: 'Sui Wallet',
            icon: '🟡',
            installed: false,
            downloadUrl: 'https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil'
          },
          {
            name: 'Suiet',
            icon: '🔵',
            installed: false,
            downloadUrl: 'https://chrome.google.com/webstore/detail/suiet-sui-wallet/khpkpbbcccdmmclmpigdgddabeilkdpd'
          },
          {
            name: 'Ethos',
            icon: '⚪',
            installed: false,
            downloadUrl: 'https://chrome.google.com/webstore/detail/ethos-sui-wallet/mcbigmjiafegjnnogedioegffbooigli'
          }
        );
      }
      
      setDetectedWallets(walletList);
    }
  }, [isOpen, wallets]);
  
  const getWalletIcon = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('sui wallet')) return '🟡';
    if (nameLower.includes('suiet')) return '🔵';
    if (nameLower.includes('ethos')) return '⚪';
    if (nameLower.includes('martian')) return '🔴';
    if (nameLower.includes('glass')) return '💎';
    if (nameLower.includes('morphis')) return '🟣';
    return '💼';
  };

  if (!isOpen) return null;

  const handleWalletSelect = (wallet: any) => {
    // If wallet object is provided directly (from dapp-kit)
    if (wallet.wallet) {
      console.log('Connecting to wallet:', wallet.wallet.name);
      connect(
        { wallet: wallet.wallet },
        {
          onSuccess: () => {
            console.log('✅ Wallet connected successfully!');
            localStorage.setItem('lastConnectedWallet', wallet.wallet.name);
            onClose();
          },
          onError: (error) => {
            console.error('❌ Wallet connection failed:', error);
            alert(`Failed to connect to ${wallet.wallet.name}. Please try again or check if the wallet extension is unlocked.`);
          }
        }
      );
      return;
    }
    
    // For install options (wallet not detected)
    if (wallet.downloadUrl && !wallet.installed) {
      window.open(wallet.downloadUrl, '_blank');
      return;
    }
    
    // Fallback: try to find any wallet
    if (wallets.length > 0) {
      console.log('Attempting to connect to first available wallet:', wallets[0].name);
      connect({ wallet: wallets[0] });
      onClose();
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
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-[hsl(208,65%,75%)] hover:text-background">
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
